"use client";

import Image from "next/image";
import posthog from "posthog-js";

export const ExploreBtn = () => {
  return (
    <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={() => {
      posthog.capture("explore_events_clicked");
    }}>
      <a href="#events">
        Explore events
        <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
      </a>
    </button>
  );
};
