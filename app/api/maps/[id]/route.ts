// Importa as funções de acesso ao banco de dados de mapas
import * as mapsDb from '@/app/db/maps';
// Importa a função de validação e tipos de erro do utilitário de validação
import { validateMapData } from '@/app/validation/map';

// Handler GET - Busca um mapa específico pelo ID
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Aguarda a resolução dos parâmetros da rota
  const { id } = await params;

  // Busca o mapa no banco de dados pelo ID
  const map = await mapsDb.getMapById(id);

  // Se o mapa não existir (ou estiver deletado e include_deleted=false), retorna 404 Not Found
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Retorna o mapa encontrado como JSON
  return Response.json(map);
}

// Handler PUT - Atualiza um mapa existente pelo ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Aguarda a resolução dos parâmetros da rota
  const { id } = await params;
  // Extrai os dados do corpo da requisição
  const body = await request.json();

  // Executa a validação dos dados recebidos antes de atualizar no banco
  // Usa || '' para garantir que sempre passe uma string, mesmo se o campo for undefined
  const errors = validateMapData(body.name || '', body.description || '');
  // Se houver erros de validação, retorna status 400 (Bad Request) com a lista de erros
  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  // Atualiza o mapa no banco de dados com os novos valores
  // updateMap retorna null se o mapa não existir ou estiver deletado
  const map = await mapsDb.updateMap({
    id,
    // Remove espaços em branco do início e fim do nome antes de salvar
    name: body.name.trim(),
    description: body.description,
  });

  // Se o mapa não existir ou estiver deletado, retorna 404 Not Found
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Retorna 204 No Content indicando sucesso sem corpo de resposta
  return new Response(null, { status: 204 });
}

// Handler DELETE - Soft delete de um mapa pelo ID
// Também faz soft delete de todos os pontos associados (cascade)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Aguarda a resolução dos parâmetros da rota
  const { id } = await params;

  // Tenta fazer soft delete do mapa (e seus pontos) no banco de dados
  const deletedMap = await mapsDb.deleteMap(id);

  // Se o mapa não existir ou já estiver deletado, retorna 404 Not Found
  if (!deletedMap) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
