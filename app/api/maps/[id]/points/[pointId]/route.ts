import * as pointsDb from '@/app/db/points';

// Handler GET - Busca um ponto específico pelo ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;

  const point = await pointsDb.getPointById(pointId);

  if (!point) {
    return new Response(null, { status: 404 });
  }

  return Response.json(point);
}

// Handler PUT - Atualiza um ponto específico pelo ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;
  const body = await request.json();

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

// Handler DELETE - Remove um ponto pelo ID
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;

  const deleted = await pointsDb.deletePoint(pointId);

  if (!deleted) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
