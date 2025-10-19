import dynamic from 'next/dynamic';

const CollaborativeCosmos = dynamic(() => import('../src/components/cosmic/CollaborativeCosmos'), { ssr: false });

export default function CollaborativeCosmosPage() {
  return <CollaborativeCosmos />;
}
