import React from 'react';
import { Share2, LogOut, Save, Download } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface TopBarProps {
    presentUsers: any[];
    setIsShareDialogOpen: (isOpen: boolean) => void;
    signOut: () => void;
    diagramTitle: string;
    onSaveToDrive: () => void;
    onDownload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ presentUsers, setIsShareDialogOpen, signOut, diagramTitle, onSaveToDrive, onDownload }) => {

    const renderPresence = (p: any) => {
        if (!p || !p.user_metadata) return null;
        const { user_metadata } = p;
        return (
            <Tooltip key={p.id} delayDuration={100}>
                <TooltipTrigger asChild>
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white cursor-pointer">
                        <Image src={user_metadata.avatar_url} alt={user_metadata.full_name} width={36} height={36} />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{user_metadata.full_name}</p>
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <header className="absolute top-4 left-0 right-0 z-20 px-4 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-lg border border-gray-200 pointer-events-auto">
                <div className="px-3 py-1 font-semibold text-gray-700">{diagramTitle}</div>
                <div className="w-px h-6 bg-gray-200" />
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button onClick={onSaveToDrive} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><Save size={16} /></button>
                        </TooltipTrigger>
                        <TooltipContent><p>Save to Google Drive</p></TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button onClick={onDownload} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"><Download size={16} /></button>
                        </TooltipTrigger>
                        <TooltipContent><p>Download as PNG</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex items-center gap-4 pointer-events-auto">
                <TooltipProvider>
                    <div className="flex items-center -space-x-3">
                        {presentUsers.slice(0, 4).map(renderPresence)}
                        {presentUsers.length > 4 && (
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <div className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-medium rounded-full border-2 border-white">
                                        +{presentUsers.length - 4}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent><p>{presentUsers.length - 4} more users</p></TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </TooltipProvider>

                <button onClick={() => setIsShareDialogOpen(true)} className="px-5 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <Share2 size={16} /> Share
                </button>
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button onClick={signOut} className="p-2.5 bg-white text-gray-600 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200"><LogOut size={16} /></button>
                        </TooltipTrigger>
                        <TooltipContent><p>Sign Out</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </header>
    );
};