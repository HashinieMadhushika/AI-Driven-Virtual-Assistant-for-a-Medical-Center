import json
import chromadb
from sentence_transformers import SentenceTransformer

# Load local embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Create/load local persistent Chroma database
client = chromadb.PersistentClient(path="./chroma_db")

# Create or get collection
collection = client.get_or_create_collection(name="medical_faq")

def embed(text: str):
    return model.encode(text).tolist()

ids = []
documents = []
metadatas = []
embeddings = []

with open("chunks.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        chunk = json.loads(line)

        ids.append(chunk["id"])
        documents.append(chunk["text"])
        metadatas.append({
            "title": chunk["title"],
            "source": chunk.get("source", "kb_faq.md")
        })
        embeddings.append(embed(chunk["text"]))

# Clear old records if re-running
existing = collection.get()
if existing and existing.get("ids"):
    collection.delete(ids=existing["ids"])

collection.add(
    ids=ids,
    documents=documents,
    metadatas=metadatas,
    embeddings=embeddings
)

print("✅ FAQ indexed into ChromaDB successfully!")
print(f"Total records added: {len(ids)}")