import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-background"></div>
            
            <div className="container mx-auto relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <Badge variant="secondary" className="mb-6 px-4 py-2">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Trusted by 10,000+ customers
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Find the Perfect Service
                        <br />
                        <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                            Every Time
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                        Discover top-rated services in your area. Read authentic reviews, compare providers, 
                        and make informed decisions with our trusted community platform.
                    </p>
                    <div className="max-w-2xl mx-auto mb-8">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 p-2 bg-background rounded-xl shadow-lg border">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="What service are you looking for?" 
                                    className="pl-10 border-0 text-lg h-12 bg-transparent focus-visible:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" size="lg" variant="hero" className="h-12 px-8">
                                Search Services
                            </Button>
                        </form>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50 backdrop-blur">
                            <Star className="h-6 w-6 text-primary" />
                            <span className="font-medium">Verified Reviews</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50 backdrop-blur">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="font-medium">Trusted Providers</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50 backdrop-blur">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <span className="font-medium">Best Rated</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};