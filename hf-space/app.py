import spaces
import os
import time
import torch
import gradio as gr
from pydantic import BaseModel
from typing import List, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = os.environ.get("MODEL_ID", "Qwen/Qwen2.5-1.5B-Instruct")

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto",
)

SYSTEM_PROMPT = """You are EduAI, an expert AP EAPCET (EAMCET) 2026 Counseling & Engineering Career Assistant for EduDiscovery (Andhra Pradesh).

STRICT GROUNDING RULES:
- ONLY recommend engineering colleges located in Andhra Pradesh (AP).
- NEVER mention out-of-state colleges (such as VTU Karnataka, GNDIT Delhi, or Anna University).
- If asked about a specific city (e.g., Vijayawada, Visakhapatnam, Tirupati, Guntur, Kakinada), ONLY list verified AP colleges in that region:
  * Vijayawada / Amaravati / Guntur: VR Siddhartha Engineering College (VRSEC, NAAC A+), PVP Siddhartha Institute of Technology (PVPSIT, NAAC A+), RVR & JC College of Engineering (Guntur, NAAC A+), VIT-AP University (Amaravati), SRM University AP (Amaravati), KL University (Vaddeswaram, NAAC A++), Dr. RVR NRI University (NRIU, Vijayawada), Acharya Nagarjuna University (ANU, Guntur).
  * Visakhapatnam: Andhra University College of Engineering (AUCE, NAAC A++), Gayatri Vidya Parishad College of Engineering (GVPCE, NAAC A+), ANITS (Visakhapatnam), GITAM University (Visakhapatnam).
  * Tirupati / Chittoor: SVU College of Engineering (Tirupati), Sree Vidyanikethan Engineering College / Mohan Babu University (Tirupati).
  * Kakinada / East Godavari: JNTUK University College of Engineering (Kakinada), Pragati Engineering College, Aditya Engineering College.

YOUR CORE TASKS:
1. Answer AP EAPCET rank, cutoff, category reservation (OC, BC-A/B/C/D/E, SC, ST, EWS), region (AU/SVU), and web-options ordering questions accurately.
2. Provide clear, practical engineering branch & career guidance (CSE, AI/ML, Data Science, IT, ECE, EEE, Mechanical, Civil).
3. Explain APHERMC statutory tuition fees and Jagananna Vidya Deevena (JVD) 100% tuition fee reimbursement for Category-A Convenor Quota seats.
4. Always use the candidate's provided rank, category, region, and matched colleges context when available. Keep answers concise, structured with bullet points, and accurate."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[str] = ""


@spaces.GPU(duration=30)
def generate_reply(message: str, history: List[dict], context: str = "") -> str:
    system_content = SYSTEM_PROMPT
    if context:
        system_content += f"\n\nCandidate & Verified College Context:\n{context}"

    messages = [{"role": "system", "content": system_content}]
    for item in history[-6:]:
        if item.get("role") in ("user", "assistant") and item.get("content"):
            messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": message})

    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True
    )
    inputs = tokenizer([text], return_tensors="pt").to(model.device)

    with torch.no_grad():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=320,
            temperature=0.6,
            top_p=0.9,
            do_sample=True,
        )

    trimmed_ids = [
        out_ids[len(in_ids) :]
        for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
    ]
    return tokenizer.batch_decode(trimmed_ids, skip_special_tokens=True)[0].strip()


def gradio_chat(message, history):
    formatted = []
    for item in history or []:
        if isinstance(item, dict):
            role = item.get("role")
            content = item.get("content")
            if role in ("user", "assistant") and content:
                formatted.append({"role": role, "content": str(content)})
        elif isinstance(item, (list, tuple)) and len(item) >= 2:
            if item[0]:
                formatted.append({"role": "user", "content": str(item[0])})
            if item[1]:
                formatted.append({"role": "assistant", "content": str(item[1])})
    return generate_reply(message, formatted)


demo = gr.ChatInterface(
    fn=gradio_chat,
    title="EduDiscovery AP EAPCET AI Counselor",
    description="Free ZeroGPU-powered AP EAPCET Q&A and Engineering Branch Guidance.",
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, prevent_thread_lock=True)

    @demo.app.get("/health")
    def health():
        return {"status": "ok", "model": MODEL_ID}

    @demo.app.post("/api/chat")
    def chat_endpoint(req: ChatRequest):
        history_dicts = [{"role": m.role, "content": m.content} for m in (req.history or [])]
        reply = generate_reply(req.message, history_dicts, req.context or "")
        return {"reply": reply, "model": MODEL_ID}

    while True:
        time.sleep(3600)
