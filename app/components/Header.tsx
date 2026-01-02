'use client';

import Image from 'next/image';
import Link from 'next/link';

// Componente de cabeçalho da aplicação
export default function Header() {
  return (
    // Header com roxo sólido minimalista
    <header className="bg-primary px-8 py-1">
      {/* Container centralizado com largura máxima */}
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image src="/logo.svg" alt="Meus Mapas" width={112} height={112} priority />
        </Link>
        {/* A prop priority no componente <Image> do Next.js indica que essa imagem é de alta prioridade e deve ser pré-carregada (preloaded). */}
        <div />
      </div>
    </header>
  );
}
