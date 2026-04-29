import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


const EventDetailItem = ({icon, alt, label}: {icon: string, alt: string, label: string}) => {
    return (
        <div className="flex flex-row gap-2 items-center">
            <Image src={icon} alt={alt} width={17} height={17} />
            <p>{label}</p>
        </div>
    )
};

const EventAgendaItem = ({agendaItem}: {agendaItem: string[]}) => {
    return (
        <div className="agenda">
            <ul>
                {agendaItem.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    )
};

const EventTagsItem = ({tags}: {tags: string[]}) => {
    return (
        <div className="tags flex flex-row gap-1.5 flex-wrap">
                {tags.map((tag) => (
                    <div className="pill" key={tag}>{tag}</div>
                ))}
        </div>
    )
};

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    const response = await fetch(`${BASE_URL}/api/events/${slug}`);
    const { event } = await response.json();
    if (!event) {
        return notFound();
    }
    const { title, image, location, date, time, description, overview, venue, mode, audience, agenda, organizer, tags } = event;

    const bookings = 10;

    const similarEvents = await getSimilarEventsBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>{title}</h1>
                <p className="description mt-2">{description}</p>
            </div>

            <div className="details">
                {/*left side - details*/}
                <div className="content">
                    <Image src={image} alt={title} width={800} height={800} className="banner" />
                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p className="mt-2">{overview}</p>
                    </section>

                    <section className="flex-col-gap-2 mt-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="date" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="location" label={venue} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <section className="flex-col-gap-2 mt-2">    
                        <h2>Agenda</h2>
                        <EventAgendaItem agendaItem={agenda} />
                    </section>

                    <section className="flex-col-gap-2 mt-2">    
                        <h2>About the Organizer</h2>
                        <p className="mt-2">{organizer}</p>
                    </section>

                    <section className="flex-col-gap-2 mt-2">    
                        <h2>Tags</h2>
                        <EventTagsItem tags={tags} />
                    </section>
                </div>
                {/*right side - booking form*/}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {
                            bookings > 0 ? (
                                <p className="text-sm">Join {bookings} people who have already booked this event</p>
                            ) : (
                                <p className="text-sm">Be the first to book this event</p>
                            )
                        }

                        <BookEvent />
                    </div>
                </aside>
            </div>

            <div className='flex-w-full flex-col gap-4 pt-20'>
                <h2>Similar Events</h2>
                <div className='events'>
                    {similarEvents && similarEvents.length > 0 && similarEvents.map((event) => (
                        <EventCard {...event} key={event.slug} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default EventDetailsPage;