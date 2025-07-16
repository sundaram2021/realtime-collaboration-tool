'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DiagramEditor from '@/components/diagram-editor';
import Loading from '@/components/loading';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

interface DiagramContentProps {
    diagramId: string;
    permission: 'view' | 'edit';
}

export default function DiagramContent({ diagramId, permission }: DiagramContentProps) {
    const router = useRouter();
    const { session, isLoadingSession } = useSupabaseAuth();

    useEffect(() => {
        if (!isLoadingSession && !session) {
            router.push('/login');
        }
    }, [isLoadingSession, session, router]);

    if (isLoadingSession || !session) {
        return <Loading />;
    }

    if (!diagramId || !permission) {
        router.push('/');
        return <Loading />; 
    }

    return (
        <DiagramEditor
            diagramId={diagramId}
            permission={permission}
            initialSession={session}
        />
    );
}
