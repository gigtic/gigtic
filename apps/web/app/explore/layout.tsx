import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Campus Gigs | GigTic',
  description: 'Browse the latest hyperlocal micro-jobs and services available around your campus. Find work or hire students nearby.',
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
