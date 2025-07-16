import { Suspense } from 'react';
import Loading from '@/components/loading';
import DiagramContent from '@/components/diagram/diagram-content';

interface PageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DiagramPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const diagramId = resolvedSearchParams.id as string;
    const permission = resolvedSearchParams.permission as 'view' | 'edit';

    return (
        <Suspense fallback={<Loading />}>
            <DiagramContent diagramId={diagramId} permission={permission} />
        </Suspense>
    );
}