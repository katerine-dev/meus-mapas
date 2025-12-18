import * as mapsDb from '@/app/db/maps';

export async function POST(request: Request) {
  const body = await request.json();

  const id = await mapsDb.createMap({
    name: body.name,
    description: body.description,
  });

  return Response.json({ id }, { status: 201 });
}
