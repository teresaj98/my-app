import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug: raw } = await context.params;
    const slug = String(raw ?? "").trim();

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
