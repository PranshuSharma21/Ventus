# Ventus AI Interviewer

Ventus is an enterprise grade technical evaluation platform built to conduct dynamic, conversational interviews grounded in modern AI architectures. The system combines real time model inference, automated proctoring analytics, and structured competency scoring to evaluate candidate performance across technical domains.

---

## Core Capabilities

* **Adaptive Conversational AI**: Conducts multi turn technical interviews using Groq Llama 3.3 70B inference to generate context aware follow up questions based on candidate responses.
* **Curriculum Grounded Evaluation**: Benchmarks candidate technical depth against a 31 day curriculum covering Vector Search, RAG Architectures, Multi Agent Orchestration, and the Model Context Protocol.
* **Anti Echo Guardrails**: Features real time n gram overlap detection that flags and rejects answers repeating or paraphrasing the interviewer's question.
* **Strict Quality Checks**: Verifies response length, technical keyword density, and domain terminology to filter out casual greetings or off topic inputs without incrementing the valid question count.
* **Typing Cadence Authenticity**: Monitors keystroke intervals in real time to detect macro insertions, unnatural speed bursts, or unverified external text pastes.
* **Proctoring Audit Trail**: Logs environment events including window focus switches, devtool access attempts, and copy paste events into a live security ledger.
* **Real Time Competency Analytics**: Visualizes live candidate progression across skill vectors using dynamic SVG radar charts.
* **Automated Scorecard Generation**: Compiles structured final evaluation summaries and outputs downloadable client side PDF reports and complete assessment JSON files.
* **Standardized HTTP API**: Exposes a specification compliant POST /api/interview endpoint running on Express.js with CORS security for automated grading scripts.
* **Text To Speech Synthesis**: Integrated Deepgram Aura voice engine delivering natural audio playback for generated interviewer questions.
* **Integrated Inquiries**: Formspree API contact pipeline embedded into the platform to capture enterprise integration and sales leads directly.

---

## Architecture Overview

```text
               +----------------------------------+
               |       GitHub Pages Client        |
               |  (HTML5, CSS3, Chart.js, jsPDF)  |
               +----------------------------------+
                                |
                   HTTPS POST   |   Deepgram Aura TTS
                 /api/interview |   (Audio Playback)
                                v
               +----------------------------------+
               |      Node.js Express Server      |
               |       (Hosted on Render)         |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |         Groq Llama 3.3 70B       |
               |    (Multi-Turn LLM Inference)    |
               +----------------------------------+
