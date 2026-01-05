'use client';

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MapsList from './components/maps/MapsList';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <MapsList
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
