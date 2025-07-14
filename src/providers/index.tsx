'use client';

import { ReactNode } from 'react';
import { TanStackProvider } from './tanstack';
import { Toaster } from "@/providers/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface GlobalProviderProps {
    children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
    return (
        <TanStackProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
            </TooltipProvider>
        </TanStackProvider>
    );
};