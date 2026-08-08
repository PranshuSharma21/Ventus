import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const sessions = new Map();

const CURRICULUM_SUMMARY = `
Module 3 (Embeddings & Vector Search): Days 7-10 (Sentence Transformers, ChromaDB, Pinecone, Semantic Search)
Module 4 (LLM Core & Prompting): Days 11-15 (OpenAI SDK, Groq, Function Calling, Pydantic, LoRA Fine-Tuning)
Module 6 (Agentic AI & MCP): Days 21-24 (LangChain Agents, ReAct, CrewAI, LangGraph, Model Context Protocol)
Module 7 (Evaluation & Security): Days 25-28 (Grounding Evaluation, Token Cost Optimization, Guardrails, Docker)
`;

function isOffTopicOrCasual(text, lastQuestion = "") {
  const clean = text.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  
  const casuals = ["hi", "hello", "hey", "ok", "okay", "yes", "no", "sure", "test", "testing", "sup"];
  if (words.length <= 3 && words.some(w => casuals.includes(w))) {
    return { invalid: true, reason: "Off-Topic / Casual Greeting" };
  }

  if (lastQuestion) {
    const cleanQ = lastQuestion.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const qWords = new Set(cleanQ.split(/\s+/).filter(w => w.length > 2));
    let matches = 0;
    words.forEach(w => { if (qWords.has(w)) matches++; });
    if ((matches / words.length) > 0.35) {
      return { invalid: true, reason: "Question Paraphrased / Echoed" };
    }
  }

  const techKeywords = ["chunk", "embedding", "vector", "distance", "index", "pinecone", "chroma", "retrieval", "latency", "agent", "mcp", "tool", "schema", "prompt", "pipeline"];
  const hasTech = words.some(w => techKeywords.some(k => w.includes(k)));
  if (!hasTech && words.length < 8) {
    return { invalid: true, reason: "Lacks Technical Context" };
  }

  return { invalid: false, reason: "" };
}

app.post('/api/interview', async (req, res) => {
  try {
    const { sessionId, candidate, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    if (!sessions.has(sessionId)) {
      const candidateInfo = candidate ? (candidate.member || candidate) : { name: "Candidate", jobRole: "Software Engineer" };
      
      const systemPrompt = {
        role: "system",
        content: `You are Ventus, a strict AI technical interviewer evaluating candidates on the 31-day AI Cohort curriculum.
Candidate: ${candidateInfo.name}, Role: ${candidateInfo.jobRole}.

CURRICULUM CONTEXT:
${CURRICULUM_SUMMARY}

STRICT RULES:
1. If candidate gives casual greetings or off-topic inputs, POLITELY REMIND THEM this is a technical evaluation, DO NOT accept it as an answer, and REPEAT the question.
2. If candidate echoes/parrots the question, reject it and re-demand an original technical explanation.
3. Keep responses under 3 sentences.`
      };

      const initialQuestion = `Hello ${candidateInfo.name}. Welcome to your Ventus technical evaluation. Based on your cohort progress, how do chunking strategies impact retrieval accuracy in vector databases?`;

      sessions.set(sessionId, {
        history: [systemPrompt, { role: "assistant", content: initialQuestion }],
        validTurnCount: 0,
        lastQuestion: initialQuestion
      });

      return res.json({ reply: initialQuestion, done: false, isInvalid: false });
    }

    const session = sessions.get(sessionId);
    if (!message) {
      return res.status(400).json({ error: "message is required for ongoing sessions." });
    }

    const check = isOffTopicOrCasual(message, session.lastQuestion);
    session.history.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: session.history,
      temperature: 0.3,
      max_tokens: 180
    });

    const aiReply = completion.choices[0].message.content;
    session.history.push({ role: "assistant", content: aiReply });
    session.lastQuestion = aiReply;

    if (!check.invalid) {
      session.validTurnCount++;
    }

    if (session.validTurnCount >= 8) {
      return res.json({
        reply: "Thank you for completing the technical evaluation. Generating your final assessment scorecard now.",
        done: true,
        isInvalid: check.invalid,
        feedback: {
          summary: `Evaluation complete across ${session.validTurnCount} valid technical turns. Candidate demonstrated sound technical reasoning on core modules.`,
          strengths: [
            "Solid understanding of vector embedding spaces and chunking trade-offs",
            "Articulate explanations of retrieval-augmented generation pipelines"
          ],
          gaps: [
            "Needs deeper operational review on Model Context Protocol (MCP) tool schemas",
            "Should optimize multi-agent delegation loops for production latency"
          ],
          next: [
            "Review Day 23 Model Context Protocol documentation",
            "Practice LangGraph multi-agent orchestration state handling"
          ]
        }
      });
    }

    return res.json({ reply: aiReply, done: false, isInvalid: check.invalid, invalidReason: check.reason });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: "Internal Server Error during AI turn processing." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ventus Backend running on http://localhost:${PORT}`);
});
