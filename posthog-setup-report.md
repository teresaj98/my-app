<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your DevEvent Next.js App Router project. PostHog is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route analytics traffic through `/ingest` and reduce tracking-blocker interference. Environment variables are stored in `.env.local`.

Four client-side events are now tracked across three components. The `EventCard` and `Navbar` components were converted to client components (`"use client"`) to support event capture.

| Event name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicked the 'Explore events' hero button | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicked a featured event card (includes `event_title`, `event_slug`, `event_location`, `event_date` properties) | `components/EventCard.tsx` |
| `events_nav_clicked` | User clicked the 'Events' link in the navbar | `components/Navbar.tsx` |
| `create_event_clicked` | User clicked the 'Create Event' link in the navbar | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/391115/dashboard/1492384
- **Event card clicks over time:** https://us.posthog.com/project/391115/insights/YEk1vX1l
- **Explore button clicks over time:** https://us.posthog.com/project/391115/insights/BodSi0CN
- **Event discovery funnel** (explore → click): https://us.posthog.com/project/391115/insights/a38Uza89
- **Top clicked events** (by event title): https://us.posthog.com/project/391115/insights/D9PlFeo2
- **Navigation engagement** (Events vs. Create Event nav): https://us.posthog.com/project/391115/insights/WXbrIoib

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
