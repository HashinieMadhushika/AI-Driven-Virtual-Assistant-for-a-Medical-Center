import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_collection("medical_faq")

data = collection.get()

print("Total Records:", len(data["ids"]))
print("-" * 50)

for i in range(len(data["ids"])):
    print("ID:", data["ids"][i])
    print("Document:", data["documents"][i][:500])
    print("Metadata:", data["metadatas"][i])
    print("-" * 50)