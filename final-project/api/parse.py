import io
import json
import os

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PyPDF2 import PdfReader

app = FastAPI(title="Document Parser")


class ParseRequest(BaseModel):
    documentId: str
    userId: str
    storagePath: str
    fileName: str | None = None
    documentType: str | None = None


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise HTTPException(status_code=500, detail=f"Missing required environment variable: {name}")
    return value


def download_pdf_from_supabase_storage(
    supabase_url: str,
    service_role_key: str,
    bucket: str,
    object_path: str,
) -> bytes:
    url = f"{supabase_url}/storage/v1/object/{bucket}/{object_path}"
    headers = {"Authorization": f"Bearer {service_role_key}"}
    response = requests.get(url, headers=headers, timeout=180)
    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download PDF (status={response.status_code}).",
        )
    return response.content


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    chunks: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        chunks.append(text)
    return "\n".join(chunks).strip()


def gemini_extract_schedule(text: str) -> dict:
    gemini_api_key = require_env("GEMINI_API_KEY")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

    max_chars = int(os.environ.get("MAX_SYLLABUS_CHARS", "25000"))
    truncated = text[:max_chars]

    schema = {
        "type": "object",
        "properties": {
            "assignments": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "due_date": {
                            "type": "string",
                            "description": "YYYY-MM-DD when explicit, else empty string",
                        },
                        "weight": {
                            "type": "number",
                            "description": "Parse points/percent into a number; use 0 when unknown",
                        },
                        "type": {
                            "type": "string",
                            "enum": ["Homework", "Exam", "Project", "Quiz", "Lab"],
                        },
                    },
                    "required": ["title", "due_date", "weight", "type"],
                },
            }
        },
        "required": ["assignments"],
    }

    prompt = f"""
You extract course assignments from a syllabus PDF.

Return ONLY JSON that matches this schema exactly:
{json.dumps(schema)}

Rules:
- Assignments must be actual deliverables (homework/quizzes/exams/projects/labs).
- due_date: YYYY-MM-DD if the date is explicit; otherwise empty string "".
- weight: if points/percent are present, parse into a number; otherwise 0.
- type: choose one of [Homework, Exam, Project, Quiz, Lab].
- If unsure, keep fields empty rather than inventing.

Syllabus text:
{truncated}
""".strip()

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "maxOutputTokens": 4096,
            "temperature": 0.2,
        },
    }

    response = requests.post(f"{url}?key={gemini_api_key}", json=payload, timeout=180)
    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini request failed: {response.status_code} {response.text[:300]}",
        )

    data = response.json()
    try:
        model_text = data["candidates"][0]["content"]["parts"][0].get("text", "")
        parsed = json.loads(model_text)
        assignments = parsed.get("assignments", [])
        if not isinstance(assignments, list):
            return {"assignments": []}
        return {"assignments": assignments}
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Gemini JSON parse failed: {error}")


@app.post("/")
@app.post("/api/parse")
@app.post("/parse")
def parse(req: ParseRequest):
    supabase_url = require_env("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")

    try:
        pdf_bytes = download_pdf_from_supabase_storage(
            supabase_url=supabase_url,
            service_role_key=service_role_key,
            bucket="documents",
            object_path=req.storagePath,
        )

        text = extract_text_from_pdf(pdf_bytes)
        if not text:
            raise HTTPException(status_code=422, detail="PDF text extraction returned empty text.")

        return gemini_extract_schedule(text)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
