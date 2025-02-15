// components/layouts/CoreLayout.tsx
import React from "react";
import { MainNavigation } from "./MainNavigationComponent";

interface CoreLayoutProps {
    children: React.ReactNode;
}

export const CoreLayout: React.FC<CoreLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-multi flex flex-col">
            <header className="fixed w-full bg-gradient-radial from-background-light to-background shadow-lg z-50">
                <MainNavigation />
            </header>
            <main className="flex-1 mt-16 p-4 md:p-8 bg-gradient-diagonal">
                {children}
            </main>
            <footer className="bg-background text-foreground p-4 text-center">
                <p>© 2023 Your Company. All rights reserved.</p>
            </footer>
        </div>
    );
};