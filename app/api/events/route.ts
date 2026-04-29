import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database/event.model";
import {v2 as cloudinary} from "cloudinary";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await request.formData();
        const image = formData.get("image") as File;
        if(!image) {
            return NextResponse.json({ message: "Image is required" }, {status: 400});
        }

        let event;

        const tags = JSON.parse(formData.get("tags") as string);
        const agenda = JSON.parse(formData.get("agenda") as string);

        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: "image",
                folder: "DevEvent",
            }, (error, result) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }).end(buffer);
        })

        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({ message: "Failed to parse event data", error: error instanceof Error ? error.message : "Unknown error" }, {status: 400});
        }


        event.image = (uploadResponse as {secure_url: string}).secure_url;

        const newCreatedEvent = await Event.create({
            ...event,
            tags,
            agenda,
        });

        return NextResponse.json({ message: "Event created successfully", event: newCreatedEvent }, {status: 201});
    } catch (error) {
        return NextResponse.json({ message: "Failed to create event", error: error instanceof Error ? error.message : "Unknown error" }, {status: 500});
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: "Events fetched successfully", events }, {status: 200});
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch events", error: error instanceof Error ? error.message : "Unknown error" }, {status: 500});
    }
}