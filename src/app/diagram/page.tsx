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
    let permission: 'view' | 'edit' = 'view';
    try {
        const decodedPermission = atob(resolvedSearchParams.permission as string);
        if (decodedPermission === 'edit' || decodedPermission === 'view') {
            permission = decodedPermission;
        }
    } catch (error) {
        // Fallback to view permission if decoding fails or value is invalid
        permission = 'view';
    }


    return (
        <Suspense fallback={<Loading />}>
            <DiagramContent diagramId={diagramId} permission={permission} />
        </Suspense>
    );
}