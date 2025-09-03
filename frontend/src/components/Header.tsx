import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Search, Star, Menu, User, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-xl">Ennlite Review</span>
                    {/* <Badge variant="secondary" className="ml-2 text-xs">+</Badge> */}
                </Link>

                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search services, providers, or categories..." 
                            className="pl-10 bg-muted/50 border-0 focus:bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            {user?.role === 'PROVIDER' && (
                                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                                    <Link to="/create-service">
                                        <Plus className="h-4 w-4 mr-2" />
                                        List Service
                                    </Link>
                                </Button>
                            )}
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <User className="h-4 w-4 mr-2" />
                                        {user?.name}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                                    {user?.role === 'PROVIDER' && (
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/provider')}>
                                            Provider Dashboard
                                        </DropdownMenuItem>
                                    )}
                                    {user?.role === 'ADMIN' && (
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
                                            Admin Dashboard
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/login">
                                    <User className="h-4 w-4 mr-2" />
                                    Sign In
                                </Link>
                            </Button>
                            <Button asChild variant="hero" size="sm" className="hidden sm:flex">
                               <Link to="/register">Get Started</Link>
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" size="sm" className="md:hidden">
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
};