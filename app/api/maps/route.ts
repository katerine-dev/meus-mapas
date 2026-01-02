import * as mapsDb from '@/app/db/maps';
import { validateMapData } from '@/app/utils/validation';

export async function POST(request: Request) {
  const body = await request.json();

  // Executa a validação dos dados recebidos antes de inserir no banco
  // Usa || '' para garantir que sempre passe uma string, mesmo se o campo for undefined
  const errors = validateMapData(body.name || '', body.description || '');
  // Se houver erros de validação, retorna status 400 (Bad Request) com a lista de erros
  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  const id = await mapsDb.createMap({
    name: body.name.trim(),
    description: body.description,
  });

  return Response.json({ id }, { status: 201 });
}

export async function GET(request: Request) {
  // Verifica query param para incluir deletados
  const url = new URL(request.url);
  const includeDeleted = url.searchParams.get('include_deleted') === 'true';

  const maps = await mapsDb.getAllMaps({ includeDeleted });
  return Response.json(maps);
}
