# AI-Driven Virtual Assistant for a Medical Center

An AI-powered medical center management and virtual assistant platform designed to support patients, doctors, and administrators through a single web application.

The system combines conversational AI, voice interaction, appointment management, Google Calendar integration, automated reminders, Retrieval-Augmented Generation (RAG), secure medical-document handling, and human-support handover.

---

## Overview

The application provides a virtual medical-center assistant that can communicate with patients through both text and voice.

### Patients can

- Ask questions about the medical center
- Find available doctors
- Receive symptom-based specialty guidance
- Book appointments
- Reschedule appointments
- Cancel appointments
- Receive appointment reminders
- Upload medical documents
- Ask questions about uploaded medical documents
- Request human assistance
- Continue conversations with administrators
- Receive voice responses

### Doctors can

- Sign in using doctor accounts
- Activate accounts through doctor invitations
- Manage their profile
- Manage appointments
- Update appointment statuses
- Connect Google Calendar
- View calendar information
- Access authorized patient documents

### Administrators can

- Manage doctors
- Manage appointments
- View patient conversations
- Handle human handover requests
- Communicate directly with patients
- Access authorized uploaded medical documents

---

# Main Features

## 1. AI Medical Assistant

The application provides an AI-powered chatbot for patient communication.

Supported capabilities include:

- Text conversations
- Voice conversations
- Medical-center FAQ answering
- Doctor discovery
- Appointment assistance
- Symptom triage
- Medical document guidance
- Human-support escalation

The AI assistant is integrated with **n8n** for workflow orchestration.

---

## 2. Voice Assistant

Patients can interact with the assistant using voice.

The voice pipeline supports:

- Speech-to-text conversion
- AI processing
- Text-to-speech responses
- Voice messages during human handover

**ElevenLabs** is used for speech services.

---

## 3. Appointment Booking

Patients can book appointments through natural conversation.

The assistant collects information such as:

- Doctor or specialization
- Appointment date
- Appointment time
- Consultation type
- Patient information

Doctor availability is checked before creating the appointment.

When an appointment is successfully created, the system can also synchronize it with Google Calendar and send the relevant email notification.

---

## 4. Appointment Rescheduling

Existing appointments can be rescheduled through the assistant.

The system:

- Finds the patient's appointment
- Checks the newly requested date and time
- Verifies doctor availability
- Updates the appointment in the database
- Updates the associated Google Calendar event
- Sends an updated notification

---

## 5. Appointment Cancellation

Patients can cancel existing appointments through the chatbot.

The system:

- Identifies the relevant appointment
- Cancels the database appointment
- Deletes or updates the associated Google Calendar event
- Sends the relevant notification

---

## 6. Doctor Appointment Management

Doctors can view and manage appointments from the doctor dashboard.

Supported operations include:

- View assigned appointments
- Search by patient name
- Filter by appointment status
- Confirm pending appointments
- Cancel appointments
- Mark appointments as completed
- Delete appointments when required

---

## 7. Automatic Appointment Refresh

Doctor appointment screens automatically refresh appointment information.

Refresh behavior includes:

- Periodic background refresh
- Refresh when the browser regains focus
- Refresh when the page becomes visible again

This helps doctors see newly created or updated appointments without manually refreshing the page.

---

## 8. Google Calendar Integration

Doctors can connect their Google Calendar account.

Appointment operations synchronize with Google Calendar.

Supported operations include:

- Create calendar events
- Update calendar events
- Delete calendar events
- Check doctor availability using calendar information

Patients do not need to connect Google Calendar.

---

## 9. Email Notifications

Appointment-related email notifications are integrated into the system.

Notifications may be sent for:

- Appointment creation
- Appointment changes
- Appointment cancellation
- Appointment reminders

---

## 10. Automated Appointment Reminders

A separate n8n reminder workflow periodically checks for upcoming appointments.

The reminder process supports notifications such as:

- 24-hour reminders
- 1-hour reminders

The reminder workflow communicates with a protected backend reminder endpoint.

---

## 11. Symptom Triage

The assistant provides symptom-based guidance to help direct patients toward an appropriate medical specialty.

Examples include routing patients toward:

- General Consultation
- Dermatology
- Cardiology
- Neurology

Emergency symptoms are handled separately.

The assistant does **not** independently diagnose a patient or prescribe treatment.

---

## 12. Emergency Guidance

Emergency-related requests are handled with high priority.

For urgent situations, the assistant advises patients to seek immediate emergency medical assistance.

Sri Lanka emergency ambulance service:

```text
1990
```

---

## 13. Retrieval-Augmented Generation (RAG)

The system contains a dedicated RAG service for verified medical-center information.

### Technologies used

- FastAPI
- Qdrant
- Sentence Transformers
- `all-MiniLM-L6-v2`

The vector database stores approved medical-center FAQ content.

RAG is used for questions such as:

- Opening hours
- Location
- Parking
- Services
- Laboratory information
- Pharmacy information
- Contact details
- Appointment policies
- Medical-center facilities

The assistant uses approved knowledge instead of inventing medical-center facts.

---

## 14. Medical Center FAQ Knowledge Base

The current approved FAQ knowledge base contains verified medical-center information.

### Opening Hours

- Monday - Saturday: **08:00 AM - 08:00 PM**
- Sunday: **Closed**
- Public Holidays: **Closed**

### Location

**Medical Center**

Hapugala, Galle, Sri Lanka

**Nearby Landmark**

Faculty of Engineering, Hapugala

### Contact Information

**Reception**

```text
091-5546894
```

**WhatsApp**

```text
078-9567235
```

**Email**

```text
medicareaicenter@gmail.com
```

**Emergency**

```text
1990
```

### Available Services

The verified knowledge base includes services such as:

- General Consultation
- Dermatology
- Cardiology
- Neurology
- Laboratory services
- Pharmacy
- Vaccination

Doctor schedules and appointment slots are retrieved dynamically from the live system rather than being hard-coded in the FAQ knowledge base.

---

## 15. Secure Medical Document Upload

Patients can upload medical documents through the chatbot.

Supported file formats include:

- PDF
- JPG
- JPEG
- PNG

Maximum file size:

```text
10 MB
```

Documents are stored in **private Supabase Storage**.

Document metadata is stored in the database.

The backend controls authorized access to uploaded documents.

---

## 16. AI Guidance for Medical Documents

After uploading a medical document, the patient can ask questions about that document.

The system:

1. Retrieves the private document server-side
2. Sends the document securely for AI analysis
3. Answers questions about the uploaded document
4. Stores the associated conversation
5. Keeps the active document context while the patient continues asking questions
6. Allows the patient to exit document mode and return to the normal assistant

This feature is intended for explanation and guidance.

It is **not** intended to replace professional diagnosis or clinical decision-making.

---

## 17. Human Support Handover

Patients can request a human administrator during a conversation.

Handover states include:

```text
Pending
Active
Resolved
```

When handover is active:

- AI responses are temporarily bypassed
- Patient messages are stored
- Administrator messages are stored
- Text communication is supported
- Voice communication is supported
- Conversation history remains available

After the administrator resolves the request, the patient can continue using the normal AI assistant.

---

## 18. Chat History

Conversation messages are stored for authorized system use.

Supported message roles include:

```text
user
assistant
system
admin
```

Administrators can review patient conversations where authorized.

The chat history also supports messages created during human handover.

---

## 19. Doctor Authentication

Doctor accounts support:

- Invitation-based account activation
- Secure password creation
- Doctor login
- Role validation
- Doctor dashboard access
- Doctor profile access

Doctor invite links redirect the doctor to the account activation page where a password can be created before login.

---

## 20. Doctor Profile Management

The doctor profile section contains separate modules for:

- Profile information
- Password management
- Google Calendar integration

The profile implementation is modularized into dedicated React components.

---

## 21. Administrator Interface

The administrator interface supports management functions for the medical center.

Current administrative functionality includes:

- Administrator authentication
- Doctor management
- Appointment management
- Chat history access
- Human handover management
- Authorized medical-document access

---

# System Architecture

The system follows a multi-service architecture.

```text
Patient / Doctor / Admin
          |
          v
     Next.js Frontend
          |
          v
     Express Backend
       /    |      \
      /     |       \
     v      v        v
 Supabase   n8n   Google APIs
     |       |
     |       +----------------------+
     |                              |
     v                              v
PostgreSQL                    AI / Voice Services
                                   |
                       +-----------+-----------+
                       |                       |
                       v                       v
                    Gemini                ElevenLabs

                       RAG Service
                            |
                            v
                         FastAPI
                            |
                            v
                          Qdrant
```

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

## Backend

- Node.js
- Express.js
- JavaScript
- REST APIs

## Database and Storage

- Supabase
- PostgreSQL
- Supabase Storage

## Workflow Automation

- n8n

## AI

- Google Gemini

## Voice

- ElevenLabs

## RAG

- FastAPI
- Python
- Qdrant
- Sentence Transformers
- Hugging Face model ecosystem

## External Integrations

- Google Calendar API
- Google OAuth
- Email services

---

# Project Structure

```text
AI-Driven-Virtual-Assistant-for-a-Medical-Center/
│
├── backend/
│   ├── app.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   └── ...
│
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── components/
│   │   │   └── chatbot/
│   │   ├── doctor/
│   │   │   ├── accept-invite/
│   │   │   ├── appointments/
│   │   │   ├── dashboard/
│   │   │   └── profile/
│   │   ├── homepage/
│   │   ├── login/
│   │   └── signup/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── n8n/
│   └── workflows/
│       ├── medicare-main-assistant.json
│       └── medicare-appointment-reminder.json
│
├── rag/
│   ├── api.py
│   ├── documents/
│   │   └── kb_faq.md
│   ├── data/
│   │   └── chunks.jsonl
│   ├── src/
│   │   ├── chunk_faq.py
│   │   ├── index_faq_qdrant.py
│   │   ├── query_faq_qdrant.py
│   │   └── view_qdrant.py
│   ├── requirements.txt
│   └── README_RAG_N8N_UPDATE.md
│
├── .gitignore
└── README.md
```

---

# n8n Workflows

The repository contains two main n8n workflow exports.

## Main Medical Assistant Workflow

```text
n8n/workflows/medicare-main-assistant.json
```

This workflow is responsible for:

- Text conversations
- Voice conversations
- FAQ routing
- Qdrant RAG requests
- Symptom triage
- Doctor discovery
- Appointment booking
- Appointment rescheduling
- Appointment cancellation
- AI fallback processing
- Conversation state management

The production webhook path used by the main workflow is:

```text
medicare-assistant-clean
```

---

## Appointment Reminder Workflow

```text
n8n/workflows/medicare-appointment-reminder.json
```

This workflow periodically triggers backend appointment reminder processing.

The backend handles reminder logic including:

- 24-hour reminders
- 1-hour reminders
- Reminder email delivery
- Reminder-processing state

---

# Environment Configuration

Never commit real API keys or secrets.

Use local environment files and n8n credentials.

---

## Frontend Environment

Create or configure:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## Backend Environment

The backend requires environment variables for the services enabled in the project.

Typical variables include:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

ELEVENLABS_API_KEY=
GEMINI_API_KEY=

REMINDER_JOB_SECRET=
```

Use the environment variable names configured in the local backend environment.

Do not commit the populated environment file.

---

## RAG Environment

Create:

```text
rag/.env
```

Example:

```env
QDRANT_URL=
QDRANT_API_KEY=
CHAT_API_SECRET=
```

Do not commit this file.

---

## n8n Configuration

The n8n workflows use credentials and/or environment-variable references instead of hard-coded API secrets.

Depending on the local configuration, required values may include:

```text
GEMINI_API_KEY
ELEVENLABS_API_KEY
CHAT_API_SECRET
```

The reminder workflow also requires the configured reminder authentication credential.

When importing a workflow into another n8n installation, credentials may need to be recreated or reassigned locally.

---

# Running the Application

The application uses multiple services.

Recommended startup order:

```text
1. Database / Supabase access
2. Backend
3. RAG API
4. n8n
5. Frontend
```

---

## 1. Start the Backend

Open a terminal from the project root:

```powershell
cd backend
npm install
npm run dev
```

The backend normally runs on:

```text
http://localhost:5000
```

---

## 2. Start the RAG Service

From the project root, create a Python virtual environment if one does not already exist:

```powershell
python -m venv .venv-rag
```

Activate it:

```powershell
.\.venv-rag\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r rag\requirements.txt
```

Start the FastAPI service:

```powershell
cd rag
uvicorn api:app --host 127.0.0.1 --port 8000
```

The RAG API normally runs on:

```text
http://127.0.0.1:8000
```

Return to the project root when required:

```powershell
cd ..
```

---

## 3. Start n8n

Configure the required environment variables and credentials before starting n8n.

Start n8n:

```powershell
n8n start
```

The default local n8n interface is:

```text
http://localhost:5678
```

Import the workflow JSON files from:

```text
n8n/workflows/
```

Do not place real API keys directly inside exported workflow JSON files.

### RAG URL

When n8n runs directly on Windows, the RAG endpoint is typically:

```text
http://127.0.0.1:8000/ask
```

If n8n is run inside Docker, the host address may need to use:

```text
http://host.docker.internal:8000/ask
```

depending on the Docker setup.

---

## 4. Start the Frontend

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend normally runs on:

```text
http://localhost:3000
```

---

# RAG Knowledge Base Management

The approved medical-center FAQ source is located at:

```text
rag/documents/kb_faq.md
```

After modifying the FAQ knowledge base, regenerate the chunks:

```powershell
python rag\src\chunk_faq.py
```

Then re-index the Qdrant collection:

```powershell
python rag\src\index_faq_qdrant.py
```

The current Qdrant collection used by the RAG service is:

```text
medical_faq
```

The embedding model is:

```text
sentence-transformers/all-MiniLM-L6-v2
```

---

# RAG Request Flow

The simplified RAG request flow is:

```text
Patient Question
      |
      v
Frontend Chatbot
      |
      v
Express Backend
      |
      v
n8n Main Assistant Workflow
      |
      v
FAQ / General / Fallback Route
      |
      v
FastAPI RAG Service
      |
      v
Qdrant Vector Search
      |
      v
Verified Medical Center Answer
```

The RAG layer includes safety handling for:

- Human-support requests
- Diagnosis requests
- Prescription-related requests
- Emergency-related requests
- Low-confidence or unknown questions

---

# Appointment Flow

A simplified booking flow is:

```text
Patient
   |
   v
AI Assistant
   |
   v
Collect Appointment Details
   |
   v
Check Doctor Availability
   |
   +------> Database
   |
   +------> Google Calendar Availability
   |
   v
Create Appointment
   |
   +------> Database
   |
   +------> Google Calendar Event
   |
   +------> Email Notification
   |
   v
Confirmation to Patient
```

---

# Human Handover Flow

```text
Patient requests human support
            |
            v
       Pending Request
            |
            v
     Administrator Accepts
            |
            v
          Active
            |
            v
Patient <-----> Administrator
            |
            v
     Administrator Resolves
            |
            v
         Resolved
            |
            v
       AI resumes
```

While the handover state is `Pending` or `Active`, the normal AI response flow is bypassed.

---

# Medical Document Flow

```text
Patient
   |
   v
Select Document Type
   |
   v
Upload PDF / JPG / JPEG / PNG
   |
   v
Backend Validation
   |
   v
Private Supabase Storage
   |
   v
Document Metadata Database Record
   |
   v
Patient asks question
   |
   v
Backend retrieves document securely
   |
   v
AI document analysis
   |
   v
Guidance shown to patient
```

---

# Security

The project uses several security practices.

- Secrets are stored in environment variables or credential stores
- `.env` files are excluded from Git
- Python virtual environments are excluded from Git
- `node_modules` directories are excluded from Git
- Private medical documents use protected Supabase Storage
- Signed URLs are used for authorized document access
- Backend authentication protects sensitive endpoints
- Reminder endpoints use authentication
- RAG requests use authentication
- Role-based access is used for doctors and administrators
- Workflow exports should contain credential references rather than real secret values

Do **not** commit:

```text
.env
.env.local
API keys
access tokens
service-role keys
private credentials
CHAT_API_SECRET values
GEMINI_API_KEY values
ELEVENLABS_API_KEY values
QDRANT_API_KEY values
.venv-rag/
node_modules/
```

---

# Medical Safety

This application is a software engineering project and is not a replacement for a licensed medical professional.

The AI assistant should not:

- Independently diagnose patients
- Prescribe medication
- Change prescriptions
- Recommend unsafe treatment changes
- Replace professional medical assessment
- Replace emergency medical services

For emergencies in Sri Lanka, contact:

```text
1990
```

or visit the nearest emergency medical facility.

---

# Current Implemented Modules

The project currently includes:

- AI chatbot
- Voice chatbot
- Medical-center FAQ answering
- Doctor discovery
- Symptom triage
- Emergency guidance
- Appointment booking
- Appointment rescheduling
- Appointment cancellation
- Doctor appointment management
- Automatic appointment refresh
- Google Calendar synchronization
- Email notifications
- Automated appointment reminders
- Qdrant RAG
- Verified FAQ knowledge base
- Secure medical-document upload
- AI medical-document guidance
- Human-support handover
- Text human-support chat
- Voice human-support chat
- Chat history
- Doctor invitation
- Doctor authentication
- Doctor profile management
- Doctor Calendar integration
- Administrator interface
- Patient chatbot interface

---

# Important Local URLs

| Service | Default Local URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:5000` |
| n8n | `http://localhost:5678` |
| RAG API | `http://127.0.0.1:8000` |

---

# Development Validation

Before merging changes, run frontend validation.

From the project root:

```powershell
cd frontend
```

### TypeScript

```powershell
npx tsc --noEmit
```

### Lint

```powershell
npm run lint
```

### Production Build

```powershell
npm run build
```

Return to the repository root:

```powershell
cd ..
```

---

# Manual Testing Checklist

Important application flows should also be manually tested before merging or deployment.

### Authentication

- Administrator login
- Doctor login
- Doctor invitation
- Doctor password activation
- Role-based redirect

### Appointments

- Doctor discovery
- Appointment booking
- Appointment availability checking
- Appointment rescheduling
- Appointment cancellation
- Doctor appointment management
- Appointment status updates
- Automatic appointment refresh

### Calendar and Notifications

- Google Calendar connection
- Calendar event creation
- Calendar event update
- Calendar event deletion
- Email notification delivery
- Reminder processing

### AI Assistant

- Text conversation
- Voice input
- Voice output
- FAQ response
- Symptom triage
- Emergency guidance
- Unknown-question fallback

### RAG

Test verified questions such as:

```text
What are your opening hours?
Are you open on Sunday?
Where is the medical center?
Do you have parking?
What services do you provide?
```

### Human Handover

- Request human support
- Administrator accepts request
- Patient sends text
- Administrator replies
- Patient sends voice
- Administrator receives voice message
- Administrator resolves handover
- AI resumes afterward

### Medical Documents

- Upload PDF
- Upload JPG or PNG
- Reject unsupported file type
- Reject oversized file
- Ask document question
- Continue document Q&A
- Exit document mode
- Authorized administrator/doctor document access

---

# Git Workflow

Development should be performed using feature branches.

Example:

```powershell
git checkout -b feat/feature-name
```

Before merging into `main`:

```powershell
git fetch origin
git merge origin/main
```

Resolve conflicts and verify:

```powershell
git status
git grep -n -E '^(<<<<<<<|=======|>>>>>>>)'
```

Run tests before concluding the merge.

After validation:

```powershell
git commit
git push origin <feature-branch>
```

---

# n8n Workflow Version Control

The final exported workflows are stored in Git so that other team members can import the same application logic.

Tracked workflow files:

```text
n8n/workflows/medicare-main-assistant.json
n8n/workflows/medicare-appointment-reminder.json
```

Before committing exported workflows, check that no real secrets are embedded.

Example PowerShell check:

```powershell
Select-String `
  -Path n8n\workflows\*.json `
  -Pattern "AIza[a-zA-Z0-9_-]+|sk-[a-zA-Z0-9_-]+|Bearer\s+[a-zA-Z0-9._-]+"
```

Environment-variable references such as the following are acceptable:

```text
$env.GEMINI_API_KEY
$env.ELEVENLABS_API_KEY
$env.CHAT_API_SECRET
```

Actual secret values must not be committed.

---

# Privacy Considerations

Medical documents and conversation information must be treated as sensitive application data.

Production deployment should ensure:

- Appropriate authentication and authorization
- Private document storage
- Controlled signed-URL access
- Secure API transport
- Secret rotation
- Appropriate data-retention policies
- Logging practices that avoid unnecessary sensitive information
- Doctor and administrator access restricted to authorized patient information

Any documented retention period should be verified against the actual production implementation before deployment.

---

# Deployment Considerations

Before production deployment:

- Configure production frontend and backend URLs
- Configure production Supabase credentials
- Configure Google OAuth redirect URLs
- Configure Google Calendar credentials
- Configure email credentials
- Configure Gemini credentials
- Configure ElevenLabs credentials
- Configure Qdrant credentials
- Configure RAG authentication
- Configure reminder authentication
- Recreate required n8n credentials
- Update n8n webhook URLs where necessary
- Enable HTTPS
- Verify CORS configuration
- Verify private document access
- Rotate any development secrets that may previously have been exposed
- Run complete end-to-end testing

---

# Contributors

Developed as a group software engineering project for an AI-driven medical center management and virtual assistant platform.

---

# Project Status

The application currently contains the major planned functionality for:

- Patient AI assistance
- Appointment workflows
- Doctor management
- Calendar integration
- Automated reminders
- Voice interaction
- RAG-based FAQ answering
- Secure medical-document processing
- Human-support escalation

Further production hardening, deployment configuration, security review, and end-to-end testing should be completed before use in a real medical environment.

---

# License

This project is intended for academic and development purposes.

Review licensing, privacy, security, and regulatory requirements before production or commercial deployment.