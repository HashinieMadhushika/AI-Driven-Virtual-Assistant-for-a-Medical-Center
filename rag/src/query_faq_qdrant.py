import os
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

COLLECTION_NAME = "medical_faq"


if not QDRANT_URL:
    raise ValueError(
        "QDRANT_URL is missing from rag/.env"
    )

if not QDRANT_API_KEY:
    raise ValueError(
        "QDRANT_API_KEY is missing from rag/.env"
    )


# --------------------------------------------------
# Embedding model
# --------------------------------------------------

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def embed(text: str):
    return model.encode(
        text,
        normalize_embeddings=True
    ).tolist()


# --------------------------------------------------
# Qdrant connection
# --------------------------------------------------

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)


# --------------------------------------------------
# Retrieve FAQ
# --------------------------------------------------

def retrieve_faq(
    question: str,
    limit: int = 3
):

    query_vector = embed(question)

    response = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=limit,
        with_payload=True
    )

    results = []

    for point in response.points:

        payload = point.payload or {}

        results.append({
            "faq_id": payload.get("faq_id"),
            "title": payload.get("title", ""),
            "text": payload.get("text", ""),
            "source": payload.get("source", ""),
            "score": float(point.score)
        })

    return results


# --------------------------------------------------
# Simple CLI/debugging function
# --------------------------------------------------

def ask_question(question: str):

    results = retrieve_faq(
        question,
        limit=3
    )

    if not results:
        return "No relevant answer found."

    answer = "\n\n".join([
        f"{result['title']}: {result['text']}"
        for result in results
    ])

    return answer


# --------------------------------------------------
# CLI test
# --------------------------------------------------

if __name__ == "__main__":

    q = input(
        "Enter your question: "
    )

    print(
        ask_question(q)
    )