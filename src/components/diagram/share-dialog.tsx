"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ShareDialogProps {
    diagramId: string;
    onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ diagramId, onClose }) => {
    const { toast } = useToast();
    const readOnlyLink = `${window.location.origin}/diagram/?id=${diagramId}&permission=${btoa('view').replace(/=/g, '')}`;
    const editableLink = `${window.location.origin}/diagram/?id=${diagramId}&permission=${btoa('edit').replace(/=/g, '')}`;

    const copyToClipboard = (link: string, type: string) => {
        navigator.clipboard.writeText(link).then(() => {
            toast({
                title: 'Copied to Clipboard',
                description: `${type} link has been copied.`,
            });
        }).catch(() => {
            toast({
                title: 'Error',
                description: 'Failed to copy the link.',
                variant: 'destructive',
            });
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Share Diagram</h2>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="read-only-link">View-only link</Label>
                        <div className="flex items-center space-x-2">
                            <Input id="read-only-link" value={readOnlyLink} readOnly />
                            <Button onClick={() => copyToClipboard(readOnlyLink, 'View-only')}>Copy</Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="editable-link">Editable link</Label>
                        <div className="flex items-center space-x-2">
                            <Input id="editable-link" value={editableLink} readOnly />
                            <Button onClick={() => copyToClipboard(editableLink, 'Editable')}>Copy</Button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};