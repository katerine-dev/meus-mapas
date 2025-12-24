'use client';

import Image from 'next/image';

// Componente de cabeçalho da aplicação
export default function Header() {
  return (
    // Header com gradiente roxo da esquerda para direita
    <header className="from-purple-main via-purple-main to-purple-light bg-linear-to-r px-8 py-1">
      {/* Container centralizado com largura máxima */}
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Image src="/logo.svg" alt="Meus Mapas" width={112} height={112} priority />
        {/* A prop priority no componente <Image> do Next.js indica que essa imagem é de alta prioridade e deve ser pré-carregada (preloaded). */}
        <div />
      </div>
    </header>
  );
}
