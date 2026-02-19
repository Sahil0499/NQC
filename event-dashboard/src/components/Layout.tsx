import React from 'react';
import { LayoutDashboard } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="w-full">
                    <img
                        src="/header_banner_v2.jpg"
                        alt="National Quality Conclave"
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <div className="flex items-center">
                            <LayoutDashboard className="h-6 w-6 text-blue-600 mr-2" />
                            <h1 className="text-lg font-bold text-gray-900">Event Logistics Dashboard</h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Live Data Presentation
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
