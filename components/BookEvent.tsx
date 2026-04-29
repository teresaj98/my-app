"use client";

import { useState } from "react";

const BookEvent = () => {

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
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