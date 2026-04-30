from fastapi import FastAPI  # type: ignore[import]
from notion_client import Client  # type: ignore[import]
import os
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[import]
from supabase import create_client, Client as SupabaseClient  # type: ignore[import]

app = FastAPI()

#Credentials for Notion API (make sure to set these in your .env.local file)
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
DATABASE_ID = os.getenv("NOTION_DATABASE_ID")

#Notion Page ID (Can also be a database ID if you want to query a database instead of a page)
notion = Client(auth = NOTION_TOKEN)

#Credentials for Supabase (make sure to set these in your .env.local file)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")    

supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)

# ----------- API ENDPOINTS -----------
@app.get("/api/python")
def hello_world():
    """
    Simple testing endpoint to verify that the FastAPI backend is working. 
    """

    return {"message": "FastAPI is running!"}

@app.get("/api/notion")
def query_notion_database():
    """
    Queries the Notion database and returns the results.
    """

    database_id = os.getenv("NOTION_DATABASE_ID")
    response = notion.databases.query(database_id=database_id)
    return response

# ----------- Page Route -----------

@app.post("/api/notion/page")
def create_notion_page(title: str, content: str):
    """
    Creates a new page in the Notion database/homepage with the given title and content.
    """

    new_page = {
        "parent": {"database_id": DATABASE_ID},
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        },
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "text": [
                        {
                            "type": "text",
                            "text": {
                                "content": content
                            }
                        }
                    ]
                }
            }
        ]
    }
    response = notion.pages.create(**new_page)
    return {"status": "success", "page_url": new_page["url"], "response": response}

# ----------- Page from Uploaded Document -----------

@app.post("/api/notion/page-from-supabase")
def create_page_from_supabase(file_id: str):
    # 1. Extract the file info from Supabase
    # We query the 'files' table where the id matches the one sent from frontend
    response = supabase.table("files").select("name, content_summary").eq("id", file_id).single().execute()
    
    if not response.data:
        return {"error": "File not found in database"}
    
    file_data = response.data
    file_name = file_data.get("name")
    summary = file_data.get("content_summary", "No content available")

    # 2. Use that data to create the Notion page
    new_page = {
        "parent": {"database_id": DATABASE_ID},
        "properties": {
            "Name": {"title": [{"text": {"content": f"Notes for: {file_name}"}}]}
        },
        "children": [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [{"text": {"content": "Document Summary"}}]}
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": [{"text": {"content": summary}}]}
            }
        ]
    }
    
    notion_response = notion.pages.create(**new_page)
    return {"status": "success", "url": notion_response.get("url")}

# ----------- MIDDLEWARE -----------
# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

