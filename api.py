from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from query_faq_chroma import ask_question

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

@app.post("/ask")
def ask(req: QueryRequest, x_chat_auth: str = Header(None)):

    if x_chat_auth != "medical-center-secret":
        raise HTTPException(status_code=401, detail="Unauthorized")

    answer = ask_question(req.question)

    return {
        "question": req.question,
        "answer": answer
    }