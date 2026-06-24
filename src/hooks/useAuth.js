'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../lib/supabaseClient.js';

export function useAuth() {
    const [usuario, setUsuario] = useState(null);
    const [session, setSession] = useState(null);

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

    async function signIn(email, password) {
        return supabaseBrowser.auth.signInWithPassword({ email, password });
    }

    async function signUp(email, password) {
        return supabaseBrowser.auth.signUp({ email, password });
    }

    async function signOut() {
        return supabaseBrowser.auth.signOut();
    }

    return { usuario, session, signIn, signUp, signOut };
}
