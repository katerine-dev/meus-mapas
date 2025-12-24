'use client'; // Diretiva que indica que este é um Client Component (necessário para useState)

// Importações do React e componentes da aplicação
import { useState } from 'react'; // Hook para gerenciar estado local
import Header from './components/Header'; // Componente de cabeçalho com botão de criar mapa
import Footer from './components/Footer'; // Componente de rodapé com informações de contato
import MapsList from './components/maps/MapsList'; // Componente que exibe a lista de mapas e modais

// Componente principal da página inicial
export default function Home() {
  // Estado que controla se o modal de criação está aberto
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    // Container principal - fundo branco
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header sem props - botão de criar foi movido para área de filtros */}
      <Header />

      {/* Área principal de conteúdo - cresce para ocupar espaço disponível */}
      <main className="flex-1 px-4 py-8">
        {/* Container centralizado com largura máxima */}
        <div className="mx-auto max-w-6xl">
          {/* Lista de mapas recebe o estado do modal para poder fechá-lo após criar */}
          <MapsList
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        </div>
      </main>

      {/* Footer sempre no final da página */}
      <Footer />
    </div>
  );
}
