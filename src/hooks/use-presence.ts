import { supabase } from "@/lib/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const usePresence = (diagramId: string, userId: string) => {
    const queryClient = useQueryClient();

    const { data: presence, isLoading: isLoadingPresence } = useQuery({
    queryKey: ['presence', diagramId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('presence')
                .select('user_id, users(user_metadata->>full_name, user_metadata->>avatar_url)') // Corrected query
                .eq('diagram_id', diagramId);

            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!diagramId,
    });

    useEffect(() => {
        if (!diagramId || !userId) return;

        const channel = supabase.channel(`presence:${diagramId}`);

        channel
            .on('presence', { event: 'sync' }, () => {
                queryClient.invalidateQueries({ queryKey: ['presence', diagramId] });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user_id: userId });
                }
            });

        const interval = setInterval(async () => {
            await supabase.from('presence').upsert({ user_id: userId, diagram_id: diagramId, last_seen: new Date().toISOString() }, { onConflict: 'user_id, diagram_id' });
        }, 5000);


        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [diagramId, userId, queryClient]);

    return { presence, isLoadingPresence };
}