'use server';

import { connectToDatabase } from "../mongodb";
import { Booking } from "@/database/booking.model";

export const createBooking = async ({slug, email, eventId}: {slug: string, email: string, eventId: string}) => {
    try {
        await connectToDatabase();
        await Booking.create({
            slug,
            email,
            eventId,
        });
        return {success: true, message: "Event booked successfully"};
    } catch (error) {
        console.error(error);
        return {success: false, message: "Failed to book event"};   
    }
}