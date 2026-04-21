import EventCard from "@/components/EventCard";
import { ExploreBtn } from "@/components/ExploreBtn";
import { events } from "@/lib/constants";

const Home = () => {
  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Cannot Miss</h1>
      <p className="text-center mt-5">Hackathons, Conferences, Meetups, and More.</p>
      
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events.map((event) => (
            <li className="list-none" key={event.slug}>
              <EventCard title={event.title} image={event.image} slug={event.slug} location={event.location} date={event.date} time={event.time} description={event.description} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Home;