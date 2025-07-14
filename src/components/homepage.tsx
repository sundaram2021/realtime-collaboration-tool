"use client"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import Loading from "./loading";
import { User, Mail, Shield, Calendar, Settings, LogOut } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
    const { session, isLoadingSession } = useSupabaseAuth();

    if (isLoadingSession) {
        return <Loading />
    }

    const email = session?.user.email
    const fullName = session?.user.user_metadata.full_name
    const avatar_url = session?.user.user_metadata.avatar_url
    const createdAt = session?.user.created_at

    // Format the creation date
    const formatDate = (dateString: string | number | Date | undefined) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                    <p className="text-gray-600">Here's your profile information</p>
                </div>

                {/* Main Profile Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
                    {/* Cover Section */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                    {avatar_url ? (
                                        <Image 
                                            src={avatar_url}
                                            width={300}
                                            height={300}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-16 h-16 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-20 pb-8 px-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {fullName || "Anonymous User"}
                        </h2>
                        <p className="text-gray-600 mb-6">Active Member</p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                                <div className="text-2xl font-bold text-blue-600">Active</div>
                                <div className="text-sm text-blue-500">Status</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                                <div className="text-2xl font-bold text-purple-600">Verified</div>
                                <div className="text-sm text-purple-500">Account</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                                <div className="text-2xl font-bold text-green-600">Secure</div>
                                <div className="text-sm text-green-500">Profile</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 ml-3">Contact Information</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-gray-900">{email || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 ml-3">Account Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Member Since</p>
                                    <p className="font-medium text-gray-900">{formatDate(createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium text-gray-900">{fullName || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                            <Settings className="w-5 h-5 mr-2" />
                            Edit Profile
                        </button>
                        <button className="flex items-center justify-center p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105">
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500">
                    <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </main>
    );
}