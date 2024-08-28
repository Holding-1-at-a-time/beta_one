// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/HeaderComponent';
import Sidebar from '@/components/SidebarComponent';
import MainContent from '@/components/MainContent';
import NavigationBar from '@/components/NavigationBar';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex}>
                <html lang="en">
                    <body className="flex flex-col h-screen">
                        <Header className="hidden md:block" />
                        <NavigationBar className="md:hidden" />
                        <div className="flex flex-1 overflow-hidden">
                            <Sidebar className="hidden md:block" />
                            <MainContent>{children}</MainContent>
                        </div>
                        <Toaster />
                    </body>
                </html>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}