# UniGig

UniGig is a peer-to-peer micro-job marketplace designed exclusively for university students. Whether you need a quick favor, someone to move boxes, or some programming help, UniGig connects you with fellow students on campus who are willing to help for a small budget.

## Features

- **Dual Platforms:** Seamless experience across the Web (Next.js) and Mobile (React Native + Expo).
- **Hyper-Local Matching:** Uses PostGIS to match physical gigs within your preferred travel radius.
- **Real-Time Updates:** Live job feeds powered by Supabase real-time subscriptions.
- **Trust Scores & Reviews:** Build reputation on campus with an automated trust scoring system based on job reviews.
- **Incognito Mode:** Post gigs anonymously when you need privacy.
- **Emergency SOS:** Highlight urgent gigs for immediate attention.
- **Built-in Chat:** Real-time messaging between requesters and providers to coordinate logistics.

## Tech Stack

### Web App (`apps/web`)
- Next.js (App Router)
- React
- Tailwind CSS
- Framer Motion

### Mobile App (`apps/mobile`)
- Expo / React Native
- React Native Maps
- Reanimated

### Backend / Infrastructure
- Supabase (PostgreSQL, Auth, Storage)
- Cloudflare Pages (Web Hosting)

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- Supabase CLI (optional, for local DB development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/unigig-official/unigig.git
   cd unigig
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` in both `apps/web` and `apps/mobile` and fill in your Supabase credentials.

4. Run the development servers:
   ```bash
   # Run web app
   pnpm --filter web dev

   # Run mobile app
   pnpm --filter mobile start
   ```

## Database Schema

The database relies heavily on Supabase and PostgreSQL features:
- **PostGIS:** For geographic coordinates and calculating distance between users and physical jobs.
- **Row Level Security (RLS):** Strictly enforced policies to ensure users can only modify their own profiles and jobs, and can only read chats they are involved in.
- **Triggers & RPCs:** Used for the dual-sided payment handshake and auto-calculating user trust scores.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature improvements.

## License

MIT License
