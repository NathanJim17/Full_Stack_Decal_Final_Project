import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

// Initialize the Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function POST(request) {
  try {
    // 1. Extract data from the request
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("file_id");
    const { title, content } = await request.json();

    // Validation
    if (!fileId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: file_id and title" },
        { status: 400 }
      );
    }

    // 2. Create the page in Notion
    // Note: 'parent' usually requires a database_id or a parent page_id
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        // This assumes your database has a "Name" column (standard)
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: content || "No description provided.",
                },
              },
            ],
          },
        },
        {
          object: "block",
          type: "callout",
          callout: {
            rich_text: [{ type: "text", text: { content: `Source File ID: ${fileId}` } }],
            icon: { emoji: "📎" },
            color: "gray_background",
          },
        },
      ],
    });

    // 3. Return the URL of the new page to the frontend
    return NextResponse.json({
      message: "Page created successfully",
      url: response.url,
    });

  } catch (error) {
    console.error("Notion API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}