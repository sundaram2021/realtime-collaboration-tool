"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDiagrams } from '@/hooks/use-diagrams';

interface ShareDialogProps {
    diagramId: string;
    onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ diagramId, onClose }) => {
    const { toast } = useToast();
    const { diagram } = useDiagrams(diagramId);
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit'>('view');

    const handleShare = async () => {
        if (!email) {
            toast({
                title: 'Error',
                description: 'Please enter an email address.',
                variant: 'destructive',
            });
            return;
        }
        console.log(`Sharing diagram ${diagramId} with ${email} with ${permission} permission.`);

        toast({
            title: 'Diagram Shared',
            description: `The diagram has been shared with ${email}.`,
        });

        onClose();
    };

    const readOnlyLink = `${window.location.origin}/?id=${diagramId}&permission=view`;
    const editableLink = `${window.location.origin}/?id=${diagramId}&permission=edit`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Share Diagram</h2>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="read-only-link">View-only link</Label>
                        <div className="flex items-center space-x-2">
                            <Input id="read-only-link" value={readOnlyLink} readOnly />
                            <Button onClick={() => navigator.clipboard.writeText(readOnlyLink)}>Copy</Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="editable-link">Editable link</Label>
                        <div className="flex items-center space-x-2">
                            <Input id="editable-link" value={editableLink} readOnly />
                            <Button onClick={() => navigator.clipboard.writeText(editableLink)}>Copy</Button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Share with specific people</h3>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                            className="border border-gray-300 rounded-md p-2"
                        >
                            <option value="view">Can view</option>
                            <option value="edit">Can edit</option>
                        </select>
                        <Button onClick={handleShare}>Share</Button>
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