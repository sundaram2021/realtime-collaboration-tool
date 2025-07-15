import { supabase } from "@/lib/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDiagrams = (diagramId: string) => {
    const queryClient = useQueryClient();

    const { data: diagram, isLoading: isLoadingDiagram } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('diagrams')
                .select('*')
                .eq('id', diagramId)
                .maybeSingle();
            if (error) {
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!diagramId,
    });

    const { mutate: createDiagram } = useMutation({
        mutationFn: async (diagramData: { id: string; title: string; data: any; user_id: string }) => {
            const { error } = await supabase.from('diagrams').insert([diagramData]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagrams'] });
        },
    });

    const { mutate: updateDiagram } = useMutation({
        mutationFn: async (diagramData: { id: string; data: any; }) => {
            const { error } = await supabase
                .from('diagrams')
                .update({ data: diagramData.data })
                .eq('id', diagramId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
        },
    });

    return {
        diagram,
        isLoadingDiagram,
        createDiagram,
        updateDiagram,
    };
};