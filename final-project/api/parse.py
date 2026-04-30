import io
import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import quote

import requests
from PyPDF2 import PdfReader

class ParseError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise ParseError(500, f"Missing required environment variable: {name}")
    return value


def download_pdf_from_supabase_storage(
    supabase_url: str,
    service_role_key: str,
    bucket: str,
    object_path: str,
) -> bytes:
    if not object_path:
        raise ParseError(400, "storagePath is required.")

    encoded_path = quote(object_path, safe="/")
    url = f"{supabase_url}/storage/v1/object/{bucket}/{encoded_path}"
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "apikey": service_role_key,
    }
    response = requests.get(url, headers=headers, timeout=180)
    if not response.ok:
        raise ParseError(502, f"Failed to download PDF (status={response.status_code}).")
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
        raise ParseError(502, f"Gemini request failed: {response.status_code} {response.text[:300]}")

    data = response.json()
    try:
        model_text = data["candidates"][0]["content"]["parts"][0].get("text", "")
        parsed = json.loads(model_text)
        assignments = parsed.get("assignments", [])
        if not isinstance(assignments, list):
            return {"assignments": []}
        return {"assignments": assignments}
    except Exception as error:
        raise ParseError(502, f"Gemini JSON parse failed: {error}")


def parse_payload(payload: dict) -> dict:
    supabase_url = require_env("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = require_env("SUPABASE_SERVICE_ROLE_KEY")
    storage_path = payload.get("storagePath", "")

    try:
        pdf_bytes = download_pdf_from_supabase_storage(
            supabase_url=supabase_url,
            service_role_key=service_role_key,
            bucket="documents",
            object_path=storage_path,
        )

        text = extract_text_from_pdf(pdf_bytes)
        if not text:
            raise ParseError(422, "PDF text extraction returned empty text.")

        return gemini_extract_schedule(text)
    except ParseError:
        raise
    except Exception as error:
        raise ParseError(500, str(error))


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("content-length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8"))
            data = parse_payload(payload)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
        except ParseError as error:
            self.send_response(error.status_code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": error.detail}).encode("utf-8"))
        except Exception as error:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(error)}).encode("utf-8"))
