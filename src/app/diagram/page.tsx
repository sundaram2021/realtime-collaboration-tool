import { Suspense } from 'react';
import Loading from '@/components/loading';
import DiagramContent from '@/components/diagram/diagram-content';

type DiagramPageProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export default function DiagramPage({ searchParams }: DiagramPageProps) {
    const diagramId = searchParams.id as string;
    const permission = searchParams.permission as 'view' | 'edit';

    return (
        <Suspense fallback={<Loading />}>
            <DiagramContent diagramId={diagramId} permission={permission} />
        </Suspense>
    );
}
