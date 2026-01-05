import * as pointsDb from '@/app/api/db/points';
import * as mapsDb from '@/app/api/db/maps';
import { DuplicateNameError } from '@/lib/errors';
import { validatePointData } from '@/app/validation/point';
import { validateUuid } from '@/app/validation/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!validateUuid(id)) {
    return new Response(null, { status: 400 });
  }

  // Verifica se o mapa existe e não está deletado
  const map = await mapsDb.getMapById(id);
  if (!map) {
    return new Response(null, { status: 404 });
  }

  const points = await pointsDb.getPointsByMapId(id);
  return Response.json(points);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!validateUuid(id)) {
    return new Response(null, { status: 400 });
  }

  const body = await request.json();

  // Verifica se o mapa existe e não está deletado antes de criar ponto
  const map = await mapsDb.getMapById(id);
  if (!map) {
    return new Response(null, { status: 404 });
  }

  // Validação
  const errors = validatePointData({
    name: body.name,
    latitude: body.latitude,
    longitude: body.longitude,
  });

  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    // Cria o ponto no banco de dados
    const pointId = await pointsDb.createPoint({
      mapId: id,
      name: body.name.trim(),
      latitude: body.latitude,
      longitude: body.longitude,
    });

    // Retorna o ID do ponto criado com status 201 (Created)
    return Response.json({ id: pointId }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateNameError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!validateUuid(id)) {
    return new Response(null, { status: 400 });
  }

  const map = await mapsDb.getMapById(id);
  if (!map) {
    return new Response(null, { status: 404 });
  }

  await pointsDb.deleteAllPointsByMapId(id);
  return new Response(null, { status: 204 });
}
