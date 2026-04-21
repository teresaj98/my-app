export type Event = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

/** Featured developer conferences, hackathons, and meetups (paths under `public/images`). */
export const events: Event[] = [
  {
    title: "Google I/O 2026",
    image: "/images/event1.png",
    slug: "google-io-2026",
    location: "Shoreline Amphitheatre, Mountain View, CA",
    date: "2026-05-20",
    time: "9:00 AM PDT",
  },
  {
    title: "React Summit US 2026",
    image: "/images/event2.png",
    slug: "react-summit-us-2026",
    location: "New York, NY",
    date: "2026-09-15",
    time: "8:30 AM EDT",
  },
  {
    title: "ETHGlobal New York",
    image: "/images/event3.png",
    slug: "ethglobal-new-york-2026",
    location: "Brooklyn Navy Yard, New York, NY",
    date: "2026-08-08",
    time: "5:00 PM EDT",
  },
  {
    title: "AWS re:Invent 2026",
    image: "/images/event4.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV",
    date: "2026-11-30",
    time: "7:00 AM PST",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    image: "/images/event5.png",
    slug: "kubecon-na-2026",
    location: "Atlanta, GA",
    date: "2026-11-10",
    time: "8:00 AM EST",
  },
  {
    title: "GitHub Universe 2026",
    image: "/images/event6.png",
    slug: "github-universe-2026",
    location: "Fort Mason, San Francisco, CA",
    date: "2026-10-28",
    time: "9:00 AM PDT",
  },
];
