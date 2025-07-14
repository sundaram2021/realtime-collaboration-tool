"use client"

import { supabase } from "@/lib/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Session, User } from '@supabase/supabase-js';


export const useSupabaseAuth = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const {
        data: session,
        isLoading: isLoadingSession,
        isError: isErrorSession,
    } = useQuery<Session | null>({
        queryKey: ['supabase', 'session'],
        queryFn: async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                throw new Error(error.message);
            }
            return data.session;
        },
        staleTime: Infinity, 
    });

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                queryClient.setQueryData(['supabase', 'session'], session);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [queryClient]);

    const { mutate: signInWithGoogle, isPending: isSigningIn } = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        },
        onError: (error) => {
            console.error('Error signing in with Google:', error.message);
        },
    });

    const { mutate: signOut, isPending: isSigningOut } = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supabase', 'session'] });
            router.push('/login');
        },
        onError: (error) => {
            console.error('Error signing out:', error.message);
        },
    });

    const user: User | null = useMemo(() => session?.user ?? null, [session]);
    const isAuthenticated: boolean = useMemo(() => !!user, [user]);

    return {
        session,
        user,
        isAuthenticated,

        isLoadingSession, 
        isErrorSession,   
        isSigningIn,      
        isSigningOut,     
        signInWithGoogle,
        signOut,
    };
};