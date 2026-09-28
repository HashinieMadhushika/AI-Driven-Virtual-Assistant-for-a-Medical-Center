import json
import os
from pathlib import Path

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct


# -------------------------
# Paths
# -------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

CHUNKS_FILE = BASE_DIR / "data" / "chunks.jsonl"
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# -------------------------
# Qdrant configuration
# -------------------------

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

COLLECTION_NAME = "medical_faq"


if not QDRANT_URL or not QDRANT_API_KEY:
    raise ValueError(
        "QDRANT_URL and QDRANT_API_KEY must be set in rag/.env"
    )


# -------------------------
# Embedding model
# -------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")

VECTOR_SIZE = model.get_sentence_embedding_dimension()


def embed(text: str):
    return model.encode(text).tolist()


# -------------------------
# Connect to Qdrant Cloud
# -------------------------

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)


# -------------------------
# Recreate collection
# -------------------------

if client.collection_exists(COLLECTION_NAME):
    client.delete_collection(COLLECTION_NAME)


client.create_collection(
    collection_name=COLLECTION_NAME,
    vectors_config=VectorParams(
        size=VECTOR_SIZE,
        distance=Distance.COSINE
    )
)


# -------------------------
# Read chunks
# -------------------------

points = []

with open(CHUNKS_FILE, "r", encoding="utf-8") as f:

    for index, line in enumerate(f, start=1):

        chunk = json.loads(line)

        # Include the title in the embedding as useful semantic context
        text_to_embed = (
            f"{chunk['title']}\n\n"
            f"{chunk['text']}"
        )

        vector = embed(text_to_embed)

        point = PointStruct(
            id=index,
            vector=vector,
            payload={
                "faq_id": chunk["id"],
                "title": chunk["title"],
                "text": chunk["text"],
                "source": chunk.get(
                    "source",
                    "kb_faq.md"
                )
            }
        )

        points.append(point)


# -------------------------
# Upload to Qdrant
# -------------------------

client.upsert(
    collection_name=COLLECTION_NAME,
    points=points
)


print("✅ FAQ indexed into Qdrant Cloud successfully!")
print(f"Total records added: {len(points)}")
print(f"Vector dimension: {VECTOR_SIZE}")