import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection(name="medical_faq")

def embed(text: str):
    return model.encode(text).tolist()

def ask_question(question: str):
    results = collection.query(
        query_embeddings=[embed(question)],
        n_results=3
    )

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]

    if not docs:
        return "No relevant answer found."

    # simple RAG response (you can improve later with LLM)
    answer = "\n\n".join([
        f"{metas[i].get('title','')}: {docs[i]}"
        for i in range(len(docs))
    ])

    return answer


#  CLI test (for debugging)
if __name__ == "__main__":
    q = input("Enter your question: ")
    print(ask_question(q))