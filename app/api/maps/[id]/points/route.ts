import * as pointsDb from '@/app/db/points';
import * as mapsDb from '@/app/db/maps';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verifica se o mapa existe e não está deletado
  const map = await mapsDb.getMapById(id);
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Verifica query param para incluir deletados
  const url = new URL(request.url);
  const includeDeleted = url.searchParams.get('include_deleted') === 'true';

  const points = await pointsDb.getPointsByMapId(id, { includeDeleted });
  return Response.json(points);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  // Verifica se o mapa existe e não está deletado antes de criar ponto
  const map = await mapsDb.getMapById(id);
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Validação básica dos campos obrigatórios
  if (!body.name || body.latitude === undefined || body.longitude === undefined) {
    return Response.json({ error: 'name, latitude e longitude são obrigatórios' }, { status: 400 });
  }

  // Cria o ponto no banco de dados
  const pointId = await pointsDb.createPoint({
    mapId: id,
    name: body.name.trim(),
    description: body.description,
    latitude: body.latitude,
    longitude: body.longitude,
  });

  // Retorna o ID do ponto criado com status 201 (Created)
  return Response.json({ id: pointId }, { status: 201 });
}
