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
                .select('user_id, users!inner(user_metadata)')
                .eq('diagram_id', diagramId);

            if (error) {
                throw new Error(error.message);
            }
            // Transform the data to a cleaner structure
            return data?.map(p => ({
                user_id: p.user_id,
                full_name: (p.users as any)?.user_metadata?.full_name,
                avatar_url: (p.users as any)?.user_metadata?.avatar_url,
            }));
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

        return () => {
            supabase.removeChannel(channel);
        };
    }, [diagramId, userId, queryClient]);

    return { presence, isLoadingPresence };
}