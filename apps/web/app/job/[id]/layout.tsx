import { createClient } from '@/utils/supabase/server'
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) {
    return { title: 'Job Details | GigTic' }
  }

  try {
    const supabase = await createClient()
    const { data: job } = await supabase
      .from('jobs')
      .select('title, description')
      .eq('id', id)
      .single()

    if (!job) {
      return { title: 'Job Not Found | GigTic' }
    }

    return {
      title: `${job.title} - GigTic`,
      description: job.description.substring(0, 160) + (job.description.length > 160 ? '...' : ''),
      openGraph: {
        title: `${job.title} - GigTic`,
        description: job.description.substring(0, 160),
        url: `https://gigtic.in/job/${id}`,
        siteName: 'GigTic',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${job.title} - GigTic`,
        description: job.description.substring(0, 160),
      },
    }
  } catch (e) {
    return { title: 'Job Details | GigTic' }
  }
}

export default function JobLayout({ children }: Props) {
  return <>{children}</>
}
