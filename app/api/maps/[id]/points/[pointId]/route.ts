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
