---

## Tech Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript, Chart.js, jsPDF
* **Backend**: Node.js, Express.js, CORS, Dotenv
* **AI Inference**: Groq SDK (Llama 3.3 70B Versatile)
* **Voice Synthesis**: Deepgram Aura TTS API
* **Form Pipeline**: Formspree API
* **Hosting**: GitHub Pages (Frontend), Render Web Services (Backend)

---

## API Endpoint Specification

### POST /api/interview

Exposes the primary interview processing route handling turn logic and response evaluation.

#### Request Body Structure

```json
{
  "sessionId": "session_1700000000000",
  "candidate": {
    "name": "Sarah Johnson",
    "role": "Senior Data Engineer"
  },
  "message": "I prefer recursive character chunking with a 512 token limit and 10% overlap."
}
