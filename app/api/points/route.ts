import * as pointsDb from '@/app/db/points';

export async function GET() {
  const points = await pointsDb.getAllPoints();
  return Response.json(points);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validação básica dos campos obrigatórios
  if (!body.map_id || !body.name || body.latitude === undefined || body.longitude === undefined) {
    return Response.json(
      { error: 'map_id, name, latitude e longitude são obrigatórios' },
      { status: 400 }
    );
  }

  // Cria o ponto no banco de dados
  const id = await pointsDb.createPoint({
    map_id: body.map_id,
    name: body.name.trim(),
    description: body.description,
    latitude: body.latitude,
    longitude: body.longitude,
  });

  // Retorna o ID do ponto criado com status 201 (Created)
  return Response.json({ id }, { status: 201 });
}
