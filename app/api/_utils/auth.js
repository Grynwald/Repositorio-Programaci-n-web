import { createClient } from '@supabase/supabase-js';
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

    try {
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { data, error } = await supabaseAuth.auth.getUser(token);

        if (error || !data?.user) {
            return { error: errorResponse('No autenticado', 'UNAUTHORIZED', 401) };
        }

        return { user: data.user, supabaseServer: createSupabaseServerClient() };
    } catch {
        return { error: errorResponse('No autenticado', 'UNAUTHORIZED', 401) };
    }
}
