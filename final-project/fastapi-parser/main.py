import io
import json
import os

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PyPDF2 import PdfReader

load_dotenv()

app = FastAPI(title="Document Parser")


class ParseRequest(BaseModel):
    documentId: str
    userId: str
    storagePath: str
    fileName: str | None = None
    documentType: str | None = None


def download_pdf_from_supabase_storage(
    supabase_url: str,
    service_role_key: str,
    bucket: str,
    object_path: str,
) -> bytes:
    # Next.js uploads PDFs to Supabase Storage bucket `documents` (see documents-content.jsx).
    url = f"{supabase_url}/storage/v1/object/{bucket}/{object_path}"
    headers = {
        "Authorization": f"Bearer {service_role_key}",
    }
    r = requests.get(url, headers=headers, timeout=180)
    if not r.ok:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download PDF (status={r.status_code}).",
        )
    return r.content


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    chunks: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        chunks.append(text)
    return "\n".join(chunks).strip()


def gemini_extract_schedule(text: str) -> dict:
    gemini_api_key = os.environ["GEMINI_API_KEY"]
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

    # Truncate so the MVP doesn’t blow token limits on large PDFs.
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
                        "due_date": {"type": "string", "description": "YYYY-MM-DD when explicit, else empty string"},
                        "weight": {"type": "number", "description": "Parse points/percent into a number; use 0 when unknown"},
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
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "maxOutputTokens": 4096,
            "temperature": 0.2,
        },
    }

    r = requests.post(f"{url}?key={gemini_api_key}", json=payload, timeout=180)
    if not r.ok:
        print("Gemini request failed:", r.status_code, r.text[:500])
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {r.status_code} {r.text[:300]}")

    data = r.json()
    try:
        model_text = data["candidates"][0]["content"]["parts"][0].get("text", "")
        parsed = json.loads(model_text)
        assignments = parsed.get("assignments", [])
        if not isinstance(assignments, list):
            return {"assignments": []}
        return {
            "assignments": assignments,
        }
    except Exception as e:
        print("Gemini JSON parse failed. Raw response:", json.dumps(data)[:1500])
        raise HTTPException(status_code=502, detail=f"Gemini JSON parse failed: {e}")


@app.post("/parse")
def parse(req: ParseRequest):
    supabase_url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
    service_role_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    # Contract with Next.js: parseWithFastApi already checks Authorization with the user's token
    # and selects the document row for that user; we only need the Storage download here.
    bucket = "documents"
    object_path = req.storagePath

    try:
        pdf_bytes = download_pdf_from_supabase_storage(
            supabase_url=supabase_url,
            service_role_key=service_role_key,
            bucket=bucket,
            object_path=object_path,
        )

        text = extract_text_from_pdf(pdf_bytes)
        if not text:
            raise HTTPException(status_code=422, detail="PDF text extraction returned empty text.")

        extracted = gemini_extract_schedule(text)
        return extracted
    except HTTPException:
        raise
    except Exception as e:
        print("Parse handler error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))