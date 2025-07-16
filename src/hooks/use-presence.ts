import { supabase } from "@/lib/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const usePresence = (diagramId: string, userId: string | undefined) => {
    const queryClient = useQueryClient();

    const { data: presence, isLoading: isLoadingPresence } = useQuery({
        queryKey: ['presence', diagramId],
        queryFn: async () => {
            // Do not run the query if userId is not yet available
            if (!userId) return [];

            // --- NEW, ROBUST APPROACH ---
            // Step 1: Fetch all user_ids currently present in this diagram's room.
            const { data: presenceData, error: presenceError } = await supabase
                .from('presence')
                .select('user_id')
                .eq('diagram_id', diagramId);

            if (presenceError) {
                console.error("Error fetching presence user IDs:", presenceError);
                throw new Error(presenceError.message);
            }

            if (!presenceData || presenceData.length === 0) {
                return []; // No one is present, return empty array.
            }

            // Extract the unique user IDs.
            const userIds = [...new Set(presenceData.map(p => p.user_id))];

            // Step 2: Fetch the user details for only those present user IDs.
            // This query is simpler and does not rely on the failing relationship join.
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, user_metadata, raw_user_meta_data')
                .in('id', userIds);

            if (usersError) {
                console.error("Error fetching user details:", usersError);
                throw new Error(usersError.message);
            }
            
            if (!usersData) return [];

            // Step 3: Combine the user details with the presence data.
            // Create a Map for efficient lookup of user data by ID.
            const usersById = new Map(usersData.map(u => [u.id, u]));

            // Map the presence data to include the full user details.
            return userIds.map(id => {
                const user = usersById.get(id);
                if (!user) return null; // Should not happen, but a good safeguard.

                const userMeta = user.user_metadata;
                const rawUserMeta = user.raw_user_meta_data;
                
                return {
                    user_id: id,
                    full_name: userMeta?.full_name || rawUserMeta?.full_name,
                    avatar_url: userMeta?.avatar_url || rawUserMeta?.avatar_url,
                };
            }).filter(Boolean); // Filter out any null entries.
        },
        // This is crucial: the query will only execute if both diagramId and userId are truthy.
        enabled: !!diagramId && !!userId,
        // Refetch presence data periodically to keep it fresh
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    useEffect(() => {
        if (!diagramId || !userId) return;

        const channel = supabase.channel(`presence:${diagramId}`);

        channel
            .on('presence', { event: 'sync' }, () => {
                // When presence changes, invalidate the query to trigger a refetch.
                queryClient.invalidateQueries({ queryKey: ['presence', diagramId] });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track the current user's presence.
                    await channel.track({ user_id: userId });
                }
            });

        return () => {
            // Clean up the channel when the component unmounts.
            supabase.removeChannel(channel);
        };
    }, [diagramId, userId, queryClient]);

    return { presence, isLoadingPresence };
}
