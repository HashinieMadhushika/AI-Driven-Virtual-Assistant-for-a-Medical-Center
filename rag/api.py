import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from rag.src.query_faq_qdrant import retrieve_faq


# --------------------------------------------------
# Environment
# --------------------------------------------------

load_dotenv()

AUTH_TOKEN = os.getenv("CHAT_API_SECRET")

if not AUTH_TOKEN:
    raise ValueError(
        "CHAT_API_SECRET is missing from .env"
    )


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Medical Center RAG API",
    description="RAG API for the Medical Center Virtual Assistant",
    version="1.0.0"
)


# --------------------------------------------------
# Request model
# --------------------------------------------------

class AskRequest(BaseModel):
    question: str


# --------------------------------------------------
# Handover / safety detection
# --------------------------------------------------

def detect_handover(question: str):
    q = question.lower()

    # User explicitly requests a human
    human_keywords = [
        "human",
        "agent",
        "staff",
        "representative",
        "real person",
        "receptionist"
    ]

    if any(keyword in q for keyword in human_keywords):
        return True, "user_requested_human"

    # Medical diagnosis / prescription requests
    medical_advice_keywords = [
        "diagnosis",
        "diagnose",
        "prescription",
        "prescribe",
        "medicine for",
        "treatment for",
        "what drug",
        "what tablet",
        "what medicine",
        "which medicine",
        "which tablet"
    ]

    if any(keyword in q for keyword in medical_advice_keywords):
        return True, "medical_advice_request"

    # Emergency symptoms
    emergency_keywords = [
        "chest pain",
        "breathing difficulty",
        "can't breathe",
        "cannot breathe",
        "heavy bleeding",
        "fainting",
        "severe pain",
        "unconscious",
        "emergency"
    ]

    if any(keyword in q for keyword in emergency_keywords):
        return True, "emergency_case"

    return False, None


# --------------------------------------------------
# Answer formatting
# --------------------------------------------------

def format_answer(title: str, text: str):

    prefixes = {
        "Opening Hours":
            "Our opening hours are:",

        "Location":
            "Our location details are:",

        "Contact Information":
            "You can contact us using:",

        "Services Available":
            "The following services are available:",

        "Appointment Booking":
            "Here is the appointment information:",

        "Doctor Availability":
            "Doctor availability information:",

        "Laboratory Information":
            "Laboratory information:",

        "Pharmacy":
            "Pharmacy information:",

        "Safety and Medical Advice Policy":
            "Important safety information:",

        "Human Agent Handover Policy":
            "Our human assistance policy is:",

        "Privacy Policy":
            "Our privacy information is:"
    }

    prefix = prefixes.get(title)

    if prefix:
        return f"{prefix}\n{text}"

    return text


# --------------------------------------------------
# Root / health check
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Medical Center RAG API is running"
    }


# --------------------------------------------------
# Ask endpoint
# --------------------------------------------------

@app.post("/ask")
def ask(
    req: AskRequest,
    x_chat_auth: Optional[str] = Header(default=None)
):

    # -------------------------
    # Authentication
    # -------------------------

    if x_chat_auth != AUTH_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    # -------------------------
    # Validate question
    # -------------------------

    question = req.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty"
        )

    if len(question) > 500:
        raise HTTPException(
            status_code=400,
            detail="Question too long"
        )

    # -------------------------
    # Safety / handover check
    # -------------------------

    handover_needed, reason = detect_handover(
        question
    )

    # Emergency
    if reason == "emergency_case":

        return {
            "answer":
                "This may be an emergency. "
                "Please call 1990 immediately or "
                "visit the nearest emergency unit.",

            "handover_needed": True,
            "reason": reason,
            "matched_title": None,
            "confidence": "high"
        }

    # Diagnosis / prescription request
    if reason == "medical_advice_request":

        return {
            "answer":
                "I cannot provide a diagnosis or "
                "prescribe medicine. I will connect "
                "you to a human agent.",

            "handover_needed": True,
            "reason": reason,
            "matched_title": None,
            "confidence": "high"
        }

    # Explicit human request
    if reason == "user_requested_human":

        return {
            "answer":
                "I will connect you to a human agent.",

            "handover_needed": True,
            "reason": reason,
            "matched_title": None,
            "confidence": "high"
        }

    # -------------------------
    # Search Qdrant
    # -------------------------

    try:

        results = retrieve_faq(
            question,
            limit=3
        )

    except Exception as exc:

        print(
            f"Qdrant retrieval error: {exc}"
        )

        raise HTTPException(
            status_code=503,
            detail="Knowledge base is temporarily unavailable"
        )

    # -------------------------
    # No results
    # -------------------------

    if not results:

        return {
            "answer":
                "I could not find relevant information. "
                "I will connect you to a human agent.",

            "handover_needed": True,
            "reason": "no_match_found",
            "matched_title": None,
            "confidence": "low"
        }

    # -------------------------
    # Best Qdrant result
    # -------------------------

    top_result = results[0]

    top_title = top_result.get(
        "title",
        "Unknown"
    )

    top_text = top_result.get(
        "text",
        ""
    )

    top_score = float(
        top_result.get(
            "score",
            0.0
        )
    )

    # -------------------------
    # Confidence
    # -------------------------

    # Qdrant cosine similarity:
    # HIGHER score = better match.
    #
    # These are initial values.
    # Adjust them after testing with
    # your actual FAQ questions.

    HIGH_CONFIDENCE = 0.65
    MIN_CONFIDENCE = 0.45

    if top_score < MIN_CONFIDENCE:

        return {
            "answer":
                "I’m not confident that I have the "
                "correct information for that question. "
                "I will connect you to a human agent.",

            "handover_needed": True,
            "reason": "low_confidence_match",
            "matched_title": top_title,
            "confidence": "low",
            "score": round(top_score, 4)
        }

    # -------------------------
    # Determine confidence level
    # -------------------------

    if top_score >= HIGH_CONFIDENCE:
        confidence = "high"
    else:
        confidence = "medium"

    # -------------------------
    # Successful answer
    # -------------------------

    return {
        "answer": format_answer(
            top_title,
            top_text
        ),

        "handover_needed": False,
        "reason": None,
        "matched_title": top_title,
        "confidence": confidence,
        "score": round(top_score, 4)
    }