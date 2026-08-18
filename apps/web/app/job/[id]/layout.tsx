import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: job } = await supabase
    .from('jobs')
    .select('title, description, budget_amount, category')
    .eq('id', params.id)
    .single();

  if (!job) {
    return {
      title: 'Job Not Found | GigTic',
      description: 'The job you are looking for does not exist.',
    };
  }

  return {
    title: `${job.title} - ₹${job.budget_amount} | GigTic`,
    description: job.description.substring(0, 160) + (job.description.length > 160 ? '...' : ''),
    openGraph: {
      title: `${job.title} | GigTic`,
      description: `Earn ₹${job.budget_amount} for this ${job.category} task. Apply now on GigTic!`,
      type: 'article',
      url: `https://gigtic.in/job/${params.id}`,
      images: ['https://gigtic.in/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} - ₹${job.budget_amount}`,
      description: `Earn ₹${job.budget_amount} for this ${job.category} task on GigTic!`,
    }
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
