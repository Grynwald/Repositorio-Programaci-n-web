'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabaseClient.js';

export function useAuth() {
    const [usuario, setUsuario] = useState(null);
    const [session, setSession] = useState(null);
    const [rol, setRol] = useState(null);

    useEffect(() => {
        let subscription;

        async function inicializar() {
            const { data } = await supabaseBrowser.auth.getSession();
            setSession(data.session);
            setUsuario(data.session?.user ?? null);

            const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, sesion) => {
                setSession(sesion);
                setUsuario(sesion?.user ?? null);
            });

            subscription = listener?.subscription;
        }

        inicializar();
        return () => subscription?.unsubscribe?.();
    }, []);

    useEffect(() => {
        async function cargarRol() {
            if (!usuario) { setRol(null); return; }
            const { data } = await supabaseBrowser
                .from('perfiles').select('rol').eq('id', usuario.id).single();
            setRol(data?.rol ?? 'cliente');
        }
        cargarRol();
    }, [usuario]);

    async function signIn(email, password) {
        return supabaseBrowser.auth.signInWithPassword({ email, password });
    }

    async function signUp(email, password) {
        return supabaseBrowser.auth.signUp({ email, password });
    }

    async function signOut() {
        return supabaseBrowser.auth.signOut();
    }

    return { usuario, session, rol, signIn, signUp, signOut };
}
