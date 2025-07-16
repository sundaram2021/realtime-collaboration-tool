'use client'
import { useEffect } from 'react';
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

    // Handle redirect in useEffect to avoid setState during render
    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login')
        }
    }, [isLoadingSession, session, router]);

    // Show loading while session is being checked
    if (isLoadingSession) {
        return <Loading />;
    }

    // Show loading while redirecting to login
    if (!session) {
        return <Loading />;
    }

    return (
        <DiagramEditor diagramId={diagramId as string} permission={permission || 'view'} />
    );
}