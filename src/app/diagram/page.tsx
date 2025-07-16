import { Suspense } from 'react';
import Loading from '@/components/loading';
import DiagramContent from '@/components/diagram/diagram-content';

interface PageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


function decodePermission(encoded?: string): 'view' | 'edit' {
    if (!encoded) {
        return 'view';
    }
    try {
        const base64 = encoded + '=='.substring(0, (4 - (encoded.length % 4)) % 4);
        const decoded = atob(base64);
        if (decoded === 'edit' || decoded === 'view') {
            return decoded;
        }
    } catch (e) {
        console.error('Failed to decode permission:', e);
    }
    return 'view';
}


export default async function DiagramPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const diagramId = resolvedSearchParams.id as string;
    const permission = decodePermission(resolvedSearchParams.permission as string);

    return (
        <Suspense fallback={<Loading />}>
            <DiagramContent diagramId={diagramId} permission={permission} />
        </Suspense>
    );
}