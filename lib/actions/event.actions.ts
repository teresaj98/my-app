'use server';

import { connectToDatabase } from "../mongodb";
import { Event } from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string): Promise<EventCardData[]> => {
    try {
        await connectToDatabase();

        const event = await Event.findOne({ slug }).select("tags").lean<{ tags: string[] } | null>();
        if (!event?.tags?.length) {
            return [];
        }

        const similarEvents = await Event.find({
            slug: { $ne: slug },
            tags: { $in: event.tags },
        })
            .select("title image slug location date time -_id")
            .lean();

        return similarEvents;
    } catch {
        return [];
    }
}