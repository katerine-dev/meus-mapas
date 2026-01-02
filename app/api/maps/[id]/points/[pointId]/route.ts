import * as pointsDb from '@/app/db/points';

// Handler GET - Busca um ponto específico pelo ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;

  // Verifica query param para incluir deletados
  const url = new URL(request.url);
  const includeDeleted = url.searchParams.get('include_deleted') === 'true';

  const point = await pointsDb.getPointById(pointId, { includeDeleted });

  if (!point) {
    return new Response(null, { status: 404 });
  }

  return Response.json(point);
}

// Handler PUT - Atualiza um ponto específico pelo ID
// Retorna 404 se o ponto não existir ou estiver deletado
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;
  const body = await request.json();

  // updatePoint retorna null se o ponto não existir ou estiver deletado
  const updatedPoint = await pointsDb.updatePoint({
    id: pointId,
    name: body.name,
    description: body.description,
    latitude: body.latitude,
    longitude: body.longitude,
  });

  if (!updatedPoint) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

// Handler DELETE - Soft delete de um ponto pelo ID
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;

  // Tenta fazer soft delete do ponto
  const deletedPoint = await pointsDb.deletePoint(pointId);

  // Se o ponto não existir ou já estiver deletado, retorna 404
  if (!deletedPoint) {
    return new Response(null, { status: 404 });
  }

  // Retorna 200 OK com os dados do ponto deletado, incluindo deleted_at
  // Exemplo de resposta:
  // {
  //   "id": "uuid",
  //   "mapId": "uuid",
  //   "name": "Ponto Exemplo",
  //   "description": "Descrição",
  //   "location": { "longitude": -46.6333, "latitude": -23.5505 },
  //   "createdAt": "2026-01-02T10:00:00.000Z",
  //   "updatedAt": "2026-01-02T10:00:00.000Z",
  //   "deletedAt": "2026-01-02T12:30:45.123Z"
  // }
  return Response.json(deletedPoint);
}
