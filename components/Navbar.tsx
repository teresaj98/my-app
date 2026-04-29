"use client";

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const Navbar = () => {
    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>
                <ul>
                    <li>
                        <Link href="/">Home</Link>
                    </li>
                    <li>
                        <Link href="/events" onClick={() => posthog.capture("events_nav_clicked")}>Events</Link>
                    </li>
                    <li>
                        <Link href="/about" onClick={() => posthog.capture("create_event_clicked")}>Create Event</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;