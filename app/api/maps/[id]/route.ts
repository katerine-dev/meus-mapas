// Importa as funções de acesso ao banco de dados de mapas
import * as mapsDb from '@/app/db/maps';

// Interface que define o tipo dos parâmetros da rota dinâmica [id]
interface RouteParams {
  params: Promise<{ id: string }>; // O id vem como Promise no Next.js 15+
}

// Handler GET - Busca um mapa específico pelo ID
// O _request é prefixado com _ pois não é utilizado, mas é obrigatório na assinatura
export async function GET(_request: Request, { params }: RouteParams) {
  // Aguarda a resolução dos parâmetros da rota
  const { id } = await params;

  // Busca o mapa no banco de dados pelo ID
  const map = await mapsDb.getMapById(id);

  // Se o mapa não existir, retorna 404 Not Found
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Retorna o mapa encontrado como JSON
  return Response.json(map);
}

// Handler PUT - Atualiza um mapa existente pelo ID
export async function PUT(request: Request, { params }: RouteParams) {
  // Aguarda a resolução dos parâmetros da rota
  const { id } = await params;
  // Extrai os dados do corpo da requisição
  const body = await request.json();

  // Atualiza o mapa no banco de dados com os novos valores
  const map = await mapsDb.updateMap({
    id,
    name: body.name,
    description: body.description,
  });

  // Se o mapa não existir, retorna 404 Not Found
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Retorna 204 No Content indicando sucesso sem corpo de resposta
  return new Response(null, { status: 204 });
}

// Handler DELETE - Remove um mapa pelo ID
// O _request é prefixado com _ pois não é utilizado, mas é obrigatório na assinatura
export async function DELETE(_request: Request, { params }: RouteParams) {
  // Aguarda a resolução dos parâmetros da rota
  const { id } = await params;

  // Tenta deletar o mapa do banco de dados
  const deleted = await mapsDb.deleteMap(id);

  // Se o mapa não existir, retorna 404 Not Found
  if (!deleted) {
    return new Response(null, { status: 404 });
  }

  // Retorna 204 No Content indicando exclusão bem-sucedida
  return new Response(null, { status: 204 });
}
