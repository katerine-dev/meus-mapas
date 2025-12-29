import * as pointsDb from '@/app/db/points';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const points = await pointsDb.getPointsByMapId(id);
  return Response.json(points);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

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
