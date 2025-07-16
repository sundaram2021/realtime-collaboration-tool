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
        router.push(`/diagram?id=${newDiagramId}&permission=${btoa('edit').replace(/=/g, '')}`);
    };

    const fullName = session?.user.user_metadata.full_name
    const avatar_url = session?.user.user_metadata.avatar_url

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-[0.05]">
                <div className="absolute inset-0 animate-pulse" style={{
                    backgroundImage: `
                        linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            {/* Floating Dots */}
            <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-40 left-20 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 right-10 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-gray-200">
                                <Grid3X3 className="w-10 h-10 text-blue-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">
                        Hello, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{fullName || "Creator"}</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your infinite canvas awaits. Create, collaborate, and bring your ideas to life.
                    </p>
                </div>

                {/* Main Card */}
                <div className="w-full max-w-4xl">
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden">
                        {/* Profile Section */}
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-4 ring-blue-100">
                                            {avatar_url ? (
                                                <Image
                                                    src={avatar_url}
                                                    width={64}
                                                    height={64}
                                                    alt="User Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <User className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{fullName || "Creative User"}</h2>
                                        <p className="text-gray-600 flex items-center">
                                            <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                                            Ready to create
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="p-8 pb-6">
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl">
                                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-blue-800">Collaborate</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 rounded-2xl">
                                    <Grid3X3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-purple-800">Grid Canvas</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-2xl">
                                    <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-green-800">Real-time</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-b from-pink-50 to-pink-100 rounded-2xl">
                                    <Palette className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-pink-800">Creative</p>
                                </div>
                            </div>

                            {/* Create Button */}
                            <div className="text-center">
                                <button
                                    onClick={handleCreateDiagram}
                                    className="group relative inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-xl font-bold"
                                >
                                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <PlusCircle className="w-8 h-8 mr-4 group-hover:rotate-180 transition-transform duration-300" />
                                    <span>Create New Canvas</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-lg italic">
                        "Every great idea starts with a single mark on the canvas"
                    </p>
                </div>
            </div>
        </main>
    );
}