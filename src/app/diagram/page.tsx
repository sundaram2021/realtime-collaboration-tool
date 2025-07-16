'use client'
import { Suspense, useEffect } from 'react';
import DiagramEditor from "@/components/diagram-editor";
import Loading from "@/components/loading";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useRouter, useSearchParams } from 'next/navigation'

export default function DiagramPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const diagramId = searchParams.get('id')
    const permission = searchParams.get('permission') as 'view' | 'edit' | null;
    const { session, isLoadingSession } = useSupabaseAuth();

    // Redirect to login if the user is not authenticated and the session is loaded.
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login');
        }
    }, [isLoadingSession, session, router]);

    // Show a loading screen while the session is being verified.
    if (isLoadingSession || !session) {
        return <Loading />;
    }

    // Ensure diagramId and permission are present before rendering the editor.
    if (!diagramId || !permission) {
        router.push('/');
        return <Loading />;
    }

    return (
        <Suspense>  
            <DiagramEditor
                diagramId={diagramId}
                permission={permission}
                initialSession={session}
            />
        </Suspense>
    );
}