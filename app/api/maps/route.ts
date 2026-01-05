import * as mapsDb from '@/app/db/maps';
import { DuplicateNameError } from '@/lib/errors';
import { validateMapData } from '@/app/validation/map';

export async function POST(request: Request) {
  const body = await request.json();

  // Executa a validação dos dados recebidos antes de inserir no banco
  // Usa || '' para garantir que sempre passe uma string, mesmo se o campo for undefined
  const errors = validateMapData(body.name || '', body.description || '');
  // Se houver erros de validação, retorna status 400 (Bad Request) com a lista de erros
  if (errors.length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    // Normaliza description: string vazia -> null
    const description = body.description?.trim() || null;
    const id = await mapsDb.createMap({
      name: body.name.trim(),
      description,
    });

    return Response.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateNameError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export async function GET(_request: Request) {
  const maps = await mapsDb.getAllMaps();
  return Response.json(maps);
}
