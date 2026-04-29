"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import { useState } from "react";
import posthog from "posthog-js";

const BookEvent = ({slug, eventId}: {slug: string, eventId: string}) => {

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const {success, message} = await createBooking({slug, email, eventId});
        if(success) {
            setSubmitted(true);
            posthog.capture("event_booked", { event_slug: slug, event_id: eventId, email: email });
        } else {
            console.error(message);
            posthog.captureException(message);
        }
        e.preventDefault();
    };

    return (
        <div id="book-event">
            {
                submitted ? (
                    <p className="text-sm">Thank you for booking this event</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" required />
                        </div>
                        <button type="submit">Book Now</button>
                    </form>
                )
            }
        </div>
    )
}

export default BookEvent;