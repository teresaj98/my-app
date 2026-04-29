'use server';

import { connectToDatabase } from "../mongodb";
import { Event as EventModel } from "@/database/event.model";
import type { Event } from "@/lib/constants";

export const getSimilarEventsBySlug = async (slug: string): Promise<Event[]> => {
    try {
        await connectToDatabase();

        const event = await EventModel.findOne({ slug }).select("tags").lean<{ tags: string[] } | null>();
        if (!event?.tags?.length) {
            return [];
        }

        const similarEvents = await EventModel.find({
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