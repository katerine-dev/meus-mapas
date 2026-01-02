import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import MapPageClient from '@/app/components/points/MapPageClient';

interface MapPageProps {
  params: Promise<{ id: string }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <MapPageClient mapId={id} />
      </main>
      <Footer />
    </div>
  );
}
