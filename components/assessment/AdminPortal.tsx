import React from 'react';
import Link from "next/link";
import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CarIcon, ClipboardListIcon, BarChartIcon, SettingsIcon, BellIcon, SearchIcon } from 'lucide-react';

export default function AdminPortal() {
    const { organization } = useOrganization();
    const { user } = useUser();
    const recentAssessments = useQuery(api.assessments.getRecentAssessments, {
        organizationId: organization?.id ?? ''
    });

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                    <CarIcon className="h-6 w-6" />
                    <span>Auto Detail Pro</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
                        Features
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
                        Pricing
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
                        Contact
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            </header>
            <main className="flex-1 grid grid-cols-[280px_1fr] overflow-hidden">
                <div className="bg-muted/40 border-r">
                    <div className="flex h-full max-h-screen flex-col gap-2">
                        <div className="flex h-[60px] items-center border-b px-6">
                            <Link href="/" className="flex items-center gap-2 font-semibold">
                                <CarIcon className="h-6 w-6" />
                                <span className="">Auto Detail Pro</span>
                            </Link>
                            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                                <BellIcon className="h-4 w-4" />
                                <span className="sr-only">Toggle notifications</span>
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto py-2">
                            <nav className="grid items-start px-4 text-sm font-medium">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary transition-all hover:text-primary"
                                >
                                    <BarChartIcon className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/assessments"
                                    className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                                >
                                    <ClipboardListIcon className="h-4 w-4" />
                                    Assessments
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                        {recentAssessments?.length ?? 0}
                                    </Badge>
                                </Link>
                                <Link
                                    href="/analytics"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <BarChartIcon className="h-4 w-4" />
                                    Analytics
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <SettingsIcon className="h-4 w-4" />
                                    Settings
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col">
                    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
                        <div className="w-full flex-1">
                            <form>
                                <div className="relative">
                                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search assessments..."
                                        className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3"
                                    />
                                </div>
                            </form>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-6">
                        <div className="grid gap-8">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-2xl font-semibold">Recent Assessments</h1>
                                    <Button>New Assessment</Button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {recentAssessments?.map((assessment) => (
                                        <Card key={assessment._id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src="/car-placeholder.jpg" />
                                                        <AvatarFallback>Car</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{assessment.vehicleDetails.make} {assessment.vehicleDetails.model}</p>
                                                        <p className="text-sm text-muted-foreground">{assessment.vehicleDetails.year}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground">Estimated Price: ${assessment.estimatedPrice.toFixed(2)}</p>
                                                    <Badge variant={assessment.status === 'completed' ? 'success' : 'warning'}>
                                                        {assessment.status}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </main>
        </div>
    );
}