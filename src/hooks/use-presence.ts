import { useEffect, useState } from 'react';
// import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { useSupabaseAuth } from './use-supabase-auth';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export const usePresence = (diagramId: string) => {
    const [presentUsers, setPresentUsers] = useState<User[]>([]);
    const { session } = useSupabaseAuth();

    useEffect(() => {
        if (!session?.user || !diagramId) {
        return;
        }

        const channel = supabase.channel(`diagram:${diagramId}`, {
        config: {
            presence: {
            key: session.user.id,
            },
        },
        });

        const updatePresentUsers = () => {
        const presenceState = channel.presenceState<{ user: User }>();
        
        const users = Object.values(presenceState) 
            .flat() 
            .map((p) => p.user)
            .filter(Boolean) 
            .filter(
            (user, index, self) =>
                index === self.findIndex((u) => u.id === user.id)
            )
            .filter((user) => user.id !== session?.user?.id);

        setPresentUsers(users);
        };

        channel
        .on('presence', { event: 'sync' }, () => {
            console.log('Presence sync received');
            updatePresentUsers();
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
            console.log('User joined:', newPresences);
            updatePresentUsers();
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            console.log('User left:', leftPresences);
            updatePresentUsers();
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
            await channel.track({ user: session.user });
            }
        });

        return () => {
        channel.unsubscribe();
        };
    }, [session?.user, diagramId, supabase]);

    return { presentUsers };
};
