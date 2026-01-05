import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import MapPage from '@/app/components/points/MapPage';

interface MapPageProps {
  params: Promise<{ id: string }>;
}

export default async function MapPageRoute({ params }: MapPageProps) {
  const { id } = await params;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <MapPage mapId={id} />
      </main>
      <Footer />
    </div>
  );
}
