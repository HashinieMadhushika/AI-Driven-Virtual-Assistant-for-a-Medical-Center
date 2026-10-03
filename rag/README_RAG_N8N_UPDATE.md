# Qdrant RAG + n8n integration update

The knowledge base facts were preserved from the supplied RAG package.

Clarifications added:
- Opening Hours now explicitly says those are medical-center operating hours.
- Doctor-specific appointment dates/times must come from the live booking system, not static FAQ data.
- Doctor Availability now distinguishes clinic opening hours from real doctor schedules and existing bookings.

Important:
- The supplied KB says:
  - Monday-Saturday: 08:00 AM-08:00 PM
  - Sunday: Closed
  - Public Holidays: Closed
- Confirm those business facts with the medical center before production use.
- Reindex Qdrant after changing the KB:
    python rag/src/chunk_faq.py
    python rag/src/index_faq_qdrant.py
- Run the RAG API for n8n:
    uvicorn rag.api:app --host 127.0.0.1 --port 8000
- n8n must send the same CHAT_API_SECRET used by the RAG API.


## v2 retrieval fixes
- Deterministic routing for opening-hours, location/parking/accessibility, contact, lab, pharmacy, appointment, privacy, and services FAQ questions.
- Low-confidence unknown clinic questions return a verified fallback instead of failing.
- Keep n8n RAG URL as `http://127.0.0.1:8000/ask` when n8n runs locally.
