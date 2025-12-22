import * as mapsDb from '@/app/db/maps';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const map = await mapsDb.updateMap({
    id,
    name: body.name,
    description: body.description,
  });

  if (!map) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const deleted = await mapsDb.deleteMap(id);

  if (!deleted) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

export async function GET({ params }: RouteParams) {
  const { id } = await params;

  const map = await mapsDb.getMapById(id);

  if (!map) {
    return new Response(null, { status: 404 });
  }

  return Response.json(map);
}
