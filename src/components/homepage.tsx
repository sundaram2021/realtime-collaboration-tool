"use client"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import Loading from "./loading";
import { User, LogOut, PlusCircle, Users, Grid3X3, Palette, Zap, Sparkles } from "lucide-react";
import Image from "next/image";
import { useDiagrams } from "@/hooks/use-diagrams";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
    const { session, isLoadingSession, signOut } = useSupabaseAuth();
    const { createDiagram } = useDiagrams('');
    const router = useRouter();

    if (isLoadingSession) {
        return <Loading />
    }

    const handleCreateDiagram = async () => {
        if (!session) return;
        const newDiagramId = uuidv4();
        await createDiagram({
            id: newDiagramId,
            title: 'Untitled Diagram',
            data: { shapes: [], connections: [] },
            user_id: session.user.id,
        });
        const params = new URLSearchParams({
            id: newDiagramId,
            permission: btoa('edit').replace(/=/g, '')
        });
        router.push(`/diagram?${params.toString()}`);
    };

    const fullName = session?.user.user_metadata.full_name
    const avatar_url = session?.user.user_metadata.avatar_url

    return (
        <main className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }}></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gray-800 rounded-3xl shadow-2xl flex items-center justify-center border border-gray-700">
                                <Grid3X3 className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-6xl font-bold mb-4">
                        Hello, <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{fullName || "Creator"}</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Your infinite canvas for brilliant ideas. Create, collaborate, and innovate.
                    </p>
                </div>

                <div className="w-full max-w-4xl">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-8 border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        {avatar_url && (
                                            <Image
                                                src={avatar_url}
                                                width={64}
                                                height={64}
                                                alt="User Avatar"
                                                className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4 ring-blue-500/30"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{fullName || "Creative User"}</h2>
                                        <p className="text-gray-400 flex items-center">
                                            <Sparkles className="w-4 h-4 mr-1 text-yellow-400" />
                                            Ready to create
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 text-center">
                            <button
                                onClick={handleCreateDiagram}
                                className="group relative inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-xl font-bold"
                            >
                                <PlusCircle className="w-8 h-8 mr-4" />
                                <span>Create New Canvas</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}