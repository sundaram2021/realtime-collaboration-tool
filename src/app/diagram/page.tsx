import { Suspense } from 'react';
import Loading from '@/components/loading';
import DiagramContent from '@/components/diagram/diagram-content';

export default function DiagramPage({
    searchParams,
}: {
    params: { [key: string]: string | string[] | undefined };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const diagramId = searchParams.id as string;
    const permission = searchParams.permission as 'view' | 'edit';

    return (
        <Suspense fallback={<Loading />}>
            <DiagramContent diagramId={diagramId} permission={permission} />
        </Suspense>
    );
}
