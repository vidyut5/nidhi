import LeadProfileClient from './lead-profile-client'

// Generate static params for static export
export function generateStaticParams() {
  // Generate demo lead IDs for static export
  return Array.from({ length: 10 }, (_, i) => ({
    id: `demo-lead-${i + 1}`,
  }))
}

export default function LeadProfile({ params }: { params: { id: string } }) {
  return <LeadProfileClient id={params.id} />
}


