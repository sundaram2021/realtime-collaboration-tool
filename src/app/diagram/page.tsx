'use client'
import DiagramEditor from "@/components/diagram-editor";
import { useSearchParams } from 'next/navigation'

export default function DiagramPage() {
    const searchParams = useSearchParams()
    const diagramId = searchParams.get('id')
    const permission = searchParams.get('permission') as 'view' | 'edit' | null;

    return (
        <DiagramEditor diagramId={diagramId as string} permission={permission || 'view'} />
    );
}