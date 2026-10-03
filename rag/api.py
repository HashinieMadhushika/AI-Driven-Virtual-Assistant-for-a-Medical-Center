import os
import re
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from rag.src.query_faq_qdrant import retrieve_faq


# --------------------------------------------------
# Environment
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

AUTH_TOKEN = os.getenv("CHAT_API_SECRET")

if not AUTH_TOKEN:
    raise ValueError("CHAT_API_SECRET is missing from rag/.env")


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Medical Center RAG API",
    description="RAG API for the Medical Center Virtual Assistant",
    version="1.2.0",
)


class AskRequest(BaseModel):
    question: str


# --------------------------------------------------
# Safety / handover detection
# --------------------------------------------------

def detect_handover(question: str):
    q = question.lower()

    human_keywords = [
        "human",
        "agent",
        "staff",
        "representative",
        "real person",
        "receptionist",
    ]
    if any(keyword in q for keyword in human_keywords):
        return True, "user_requested_human"

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
        "which tablet",
    ]
    if any(keyword in q for keyword in medical_advice_keywords):
        return True, "medical_advice_request"

    emergency_keywords = [
        "chest pain",
        "breathing difficulty",
        "can't breathe",
        "cannot breathe",
        "heavy bleeding",
        "fainting",
        "severe pain",
        "unconscious",
        "emergency",
    ]
    if any(keyword in q for keyword in emergency_keywords):
        return True, "emergency_case"

    return False, None


# --------------------------------------------------
# Deterministic FAQ category detection
# --------------------------------------------------

def detect_faq_title(question: str):
    """
    Prefer exact FAQ sections for obvious administrative questions.

    Semantic search remains the fallback, but deterministic routing prevents
    short questions such as "Where is the medical center?" from matching the
    wrong section.
    """
    q = question.lower().strip()

    rules = [
        (
            "Location",
            [
                r"\bwhere\b",
                r"\blocation\b",
                r"\blocated\b",
                r"\baddress\b",
                r"\blandmark\b",
                r"\bparking\b",
                r"\bpark\b",
                r"\bwheelchair\b",
                r"\baccessible\b",
                r"\baccessibility\b",
            ],
        ),
        (
            "Contact Information",
            [
                r"\bcontact\b",
                r"\bphone\b",
                r"\btelephone\b",
                r"\bcall\b",
                r"\bwhatsapp\b",
                r"\bemail\b",
            ],
        ),
        (
            "Opening Hours",
            [
                r"\bopen\b",
                r"\bopening\b",
                r"\bclose\b",
                r"\bclosed\b",
                r"\bclosing\b",
                r"\bhours?\b",
                r"\bsunday\b",
                r"\bsaturday\b",
                r"\bpublic holiday\b",
                r"\bpublic holidays\b",
            ],
        ),
        (
            "Laboratory Information",
            [
                r"\blab\b",
                r"\blaboratory\b",
                r"\bsample\b",
                r"\bfasting\b",
                r"\btest report\b",
                r"\breports?\b",
            ],
        ),
        ("Pharmacy", [r"\bpharmacy\b", r"\bmedicine stock\b"]),
        (
            "Appointment Booking",
            [
                r"\bappointment\b",
                r"\bbook\b",
                r"\bbooking\b",
                r"\breschedule\b",
                r"\bcancel\b",
                r"\barrival\b",
            ],
        ),
        (
            "Privacy Policy",
            [
                r"\bprivacy\b",
                r"\bchat logs?\b",
                r"\bstored\b",
                r"\bdata\b",
            ],
        ),
        (
            "Services Available",
            [
                r"\bservice\b",
                r"\bservices\b",
                r"\bprovide\b",
                r"\bprovided\b",
                r"\boffer\b",
                r"\boffered\b",
                r"\bavailable treatment\b",
                r"\bdental\b",
                r"\bimplant\b",
            ],
        ),
    ]

    for title, patterns in rules:
        if any(re.search(pattern, q) for pattern in patterns):
            return title

    return None


# --------------------------------------------------
# Question-specific answer formatting
# --------------------------------------------------

def concise_answer(title: str, text: str, question: str = ""):
    """
    Return the shortest verified answer that directly answers the question.

    This avoids dumping the full FAQ section when the user asks a simple
    question such as "Are you open on Sunday?" or "Do you have parking?".
    """
    q = question.lower().strip()

    if title == "Opening Hours":
        if re.search(r"\bsunday\b", q):
            return "No. The medical center is closed on Sunday."

        if re.search(r"\bpublic holiday\b|\bpublic holidays\b", q):
            return "The medical center is closed on public holidays."

        if re.search(r"\bsaturday\b", q):
            return "Yes. The medical center is open on Saturday from 08:00 AM to 08:00 PM."

        return (
            "The medical center is open Monday to Saturday from 08:00 AM to 08:00 PM. "
            "It is closed on Sunday and on public holidays."
        )

    if title == "Location":
        if re.search(r"\bparking\b|\bpark\b", q):
            return "Yes. Parking is available at the medical center."

        if re.search(r"\bwheelchair\b|\baccessible\b|\baccessibility\b", q):
            return "Yes. Wheelchair access is available at the medical center."

        if re.search(r"\blandmark\b", q):
            return "The medical center is near the Faculty of Engineering, Hapugala."

        return (
            "The medical center is located in Hapugala, Galle, "
            "near the Faculty of Engineering, Hapugala."
        )

    if title == "Contact Information":
        if "whatsapp" in q:
            return "You can contact the medical center on WhatsApp at 078-9567235."

        if re.search(r"\bemail\b", q):
            return "The medical center email address is medicareaicenter@gmail.com."

        if re.search(r"\bemergency\b", q):
            return "For an emergency, call 1990 immediately."

        return "You can contact reception at 091-5546894."

    if title == "Services Available":
        known_services = {
            "general consultation": "General Consultation",
            "dermatology": "Dermatology",
            "cardiology": "Cardiology",
            "neurology": "Neurology",
            "laboratory": "Laboratory Services",
            "lab": "Laboratory Services",
            "pharmacy": "Pharmacy",
            "vaccination": "Vaccination Services",
            "vaccinations": "Vaccination Services",
        }

        for term, label in known_services.items():
            if term in q:
                return f"Yes. {label} is listed as an available service at the medical center."

        if "dental" in q or "implant" in q:
            return (
                "Dental implants are not listed in the approved medical-center services, "
                "so I cannot confirm that they are offered. Please contact reception to verify."
            )

        return (
            "The approved services are General Consultation, Dermatology, Cardiology, "
            "Neurology, Laboratory Services, Pharmacy, and Vaccination Services."
        )

    if title == "Laboratory Information":
        if "fasting" in q:
            return "Some laboratory tests require 8-12 hours of fasting. Please confirm the requirement for your specific test."

        if re.search(r"\bsample\b", q):
            return "Laboratory sample collection is available from 08:00 AM to 03:00 PM."

        if re.search(r"\breport\b|\breports\b", q):
            return "Laboratory reports are usually available within 24 hours unless otherwise specified."

        return (
            "Laboratory sample collection is available from 08:00 AM to 03:00 PM. "
            "Some tests require 8-12 hours of fasting."
        )

    if title == "Pharmacy":
        if re.search(r"\bstock\b|\bavailable\b", q):
            return "Medicine availability depends on current pharmacy stock."

        return (
            "The pharmacy is open during clinic hours and dispenses medicines only with a valid prescription."
        )

    if title == "Appointment Booking":
        if "reschedule" in q:
            return "Appointments can be rescheduled up to 4 hours before the appointment, subject to doctor availability."

        if "cancel" in q:
            return "Appointments can be cancelled up to 4 hours before the appointment."

        if "arrival" in q or "early" in q:
            return "Please arrive 15 minutes before your appointment and bring identification and previous medical reports if available."

        return "Appointments can be booked through the website chatbot, by calling reception, or in person at reception."

    if title == "Doctor Availability":
        return (
            "Doctor-specific dates and time slots are provided by the live booking system "
            "using the current doctor schedule and existing bookings."
        )

    if title == "Privacy Policy":
        return (
            "Please avoid sharing highly sensitive medical information in chat. "
            "Chat logs may be stored for up to 30 days and sensitive details may be masked for security."
        )

    # For sections without a special concise formatter, return the verified text.
    return text.strip()


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Medical Center RAG API is running",
    }


@app.post("/ask")
def ask(req: AskRequest, x_chat_auth: Optional[str] = Header(default=None)):
    if x_chat_auth != AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    question = req.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if len(question) > 500:
        raise HTTPException(status_code=400, detail="Question too long")

    handover_needed, reason = detect_handover(question)

    if reason == "emergency_case":
        return {
            "answer": "This may be an emergency. Please call 1990 immediately or visit the nearest emergency unit.",
            "handover_needed": True,
            "reason": reason,
            "matched_title": None,
            "confidence": "high",
        }

    if reason == "medical_advice_request":
        return {
            "answer": "I cannot provide a diagnosis or prescribe medicine. Please contact a clinician or human staff member for assistance.",
            "handover_needed": True,
            "reason": reason,
            "matched_title": None,
            "confidence": "high",
        }

    if reason == "user_requested_human":
        return {
            "answer": "I will connect you to a human agent.",
            "handover_needed": True,
            "reason": reason,
            "matched_title": None,
            "confidence": "high",
        }

    try:
        # Retrieve every FAQ section because the knowledge base is small.
        # Deterministic category selection can then choose the exact section.
        results = retrieve_faq(question, limit=11)
    except Exception as exc:
        print(f"Qdrant retrieval error: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Knowledge base is temporarily unavailable",
        )

    if not results:
        return {
            "answer": "I could not find verified information for that question. Please contact reception for assistance.",
            "handover_needed": False,
            "reason": "no_match_found",
            "matched_title": None,
            "confidence": "low",
        }

    preferred_title = detect_faq_title(question)
    selected = None

    if preferred_title:
        selected = next(
            (result for result in results if result.get("title") == preferred_title),
            None,
        )

    top_result = selected or results[0]
    top_title = top_result.get("title", "Unknown")
    top_text = top_result.get("text", "")
    top_score = float(top_result.get("score", 0.0))

    HIGH_CONFIDENCE = 0.65
    MIN_CONFIDENCE = 0.45

    # Deterministic section matches are accepted as verified because the content
    # still comes from the approved knowledge base.
    if preferred_title and selected:
        confidence = "high" if top_score >= HIGH_CONFIDENCE else "medium"

        return {
            "answer": concise_answer(top_title, top_text, question),
            "handover_needed": False,
            "reason": None,
            "matched_title": top_title,
            "confidence": confidence,
            "score": round(top_score, 4),
        }

    if top_score < MIN_CONFIDENCE:
        return {
            "answer": "I do not have a verified answer for that question. Please contact reception for assistance.",
            "handover_needed": False,
            "reason": "low_confidence_match",
            "matched_title": top_title,
            "confidence": "low",
            "score": round(top_score, 4),
        }

    confidence = "high" if top_score >= HIGH_CONFIDENCE else "medium"

    return {
        "answer": concise_answer(top_title, top_text, question),
        "handover_needed": False,
        "reason": None,
        "matched_title": top_title,
        "confidence": confidence,
        "score": round(top_score, 4),
    }
