import { createSupabaseServerClient, supabaseServerConfigurado } from '../../../src/lib/supabaseServer.js';
import { errorResponse } from './responses.js';

export async function requireUser(request) {
    if (!supabaseServerConfigurado) {
        return { error: errorResponse('Supabase no está configurado en el servidor', 'SUPABASE_NOT_CONFIGURED', 500) };
    }

    const authorization = request.headers.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.replace('Bearer ', '') : null;

    if (!token) {
        return { error: errorResponse('No autenticado', 'UNAUTHORIZED', 401) };
    }

    const supabaseServer = createSupabaseServerClient();

    const { data, error } = await supabaseServer.auth.getUser(token);

    if (error || !data?.user) {
        return { error: errorResponse('No autenticado', 'UNAUTHORIZED', 401) };
    }

    return { user: data.user, supabaseServer };
}
