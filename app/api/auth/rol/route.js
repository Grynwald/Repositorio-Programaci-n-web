import { requireUser } from '../../_utils/auth.js';
import { successResponse } from '../../_utils/responses.js';

export async function GET(request) {
    const { user, supabaseServer, error } = await requireUser(request);

    if (error) {
        return successResponse({ rol: null, autenticado: false });
    }

    try {
        const { data: perfil } = await supabaseServer
            .from('perfiles')
            .select('rol')
            .eq('id', user.id)
            .single();

        return successResponse({
            rol:         perfil?.rol ?? 'cliente',
            autenticado: true,
            email:       user.email
        });
    } catch {
        return successResponse({ rol: 'cliente', autenticado: true, email: user.email });
    }
}
