import * as pointsDb from '@/app/db/points';
import { validateUpdatePointData } from '@/app/validation/point';

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
// Retorna 404 se o ponto não existir ou estiver deletado
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> }
) {
  const { pointId } = await params;
  const body = await request.json();

  const errors = validateUpdatePointData(body);

  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  // updatePoint retorna null se o ponto não existir ou estiver deletado
  const updatedPoint = await pointsDb.updatePoint({
    id: pointId,
    name: body.name.trim(),
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

  return new Response(null, { status: 204 });
}
