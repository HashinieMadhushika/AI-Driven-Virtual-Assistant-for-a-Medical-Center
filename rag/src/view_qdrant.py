import os
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client import QdrantClient


# Get rag folder path
BASE_DIR = Path(__file__).resolve().parent.parent

# Load rag/.env
load_dotenv(BASE_DIR / ".env")

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

COLLECTION_NAME = "medical_faq"


# Check environment variables
if not QDRANT_URL:
    raise ValueError("QDRANT_URL is missing from rag/.env")

if not QDRANT_API_KEY:
    raise ValueError("QDRANT_API_KEY is missing from rag/.env")


# Connect to Qdrant Cloud
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)


# Get collection information
collection_info = client.get_collection(
    collection_name=COLLECTION_NAME
)

print("Total Records:", collection_info.points_count)
print("-" * 50)


# Get records from Qdrant
records, next_page_offset = client.scroll(
    collection_name=COLLECTION_NAME,
    limit=100,
    with_payload=True,
    with_vectors=False
)


# Display records
for record in records:

    payload = record.payload or {}

    print("Point ID:", record.id)

    print(
        "FAQ ID:",
        payload.get("faq_id", "")
    )

    print(
        "Document:",
        payload.get("text", "")[:500]
    )

    print(
        "Metadata:",
        {
            "title": payload.get("title", ""),
            "source": payload.get("source", "")
        }
    )

    print("-" * 50)