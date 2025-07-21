import React from 'react';
import { Share2, LogOut } from 'lucide-react';
import Image from 'next/image';

interface TopBarProps {
    presentUsers: any[];
    setIsShareDialogOpen: (isOpen: boolean) => void;
    signOut: () => void;
    diagramTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ presentUsers, setIsShareDialogOpen, signOut, diagramTitle }) => {

    const renderPresence = (p: any) => {
        if (!p || !p.user_metadata) return null;
        const { user_metadata } = p;
        return (
            <div key={p.id} className="w-9 h-9 rounded-full overflow-hidden border-2 border-white" title={user_metadata.full_name}>
                <Image src={user_metadata.avatar_url} alt={user_metadata.full_name} width={36} height={36} />
            </div>
        );
    };

    return (
        <header className="absolute top-4 left-0 right-0 z-20 px-4 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-lg border border-gray-200 pointer-events-auto">
                <div className="px-3 py-1 font-semibold text-gray-700">{diagramTitle}</div>
            </div>

            <div className="flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center -space-x-3">
                    {presentUsers.slice(0, 4).map(renderPresence)}
                    {presentUsers.length > 4 && (
                        <div className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-medium rounded-full border-2 border-white">
                            +{presentUsers.length - 4}
                        </div>
                    )}
                </div>
                <button onClick={() => setIsShareDialogOpen(true)} className="px-5 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <Share2 size={16} /> Share
                </button>
                <button onClick={signOut} title="Sign Out" className="p-2.5 bg-white text-gray-600 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200"><LogOut size={16} /></button>
            </div>
        </header>
    );
};