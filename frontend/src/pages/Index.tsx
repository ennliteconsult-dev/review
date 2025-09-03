import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ServiceGrid } from "@/components/ServiceGrid";
import { TopRankedSection } from "@/components/TopRankedSection";
import { Skeleton } from "@/components/ui/skeleton";
import { getServices, getFeaturedServices, getTopRankedServices } from "@/api";
import { EmptyState } from "@/components/EmptyState";
import { PackageOpen, Trophy, Star } from "lucide-react";

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    ))}
  </div>
);

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", selectedCategory],
    queryFn: () => getServices(selectedCategory),
  });

  const { data: featuredServices, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["services", "featured"],
    queryFn: getFeaturedServices,
  });
  
  const { data: topRankedServices, isLoading: isLoadingTopRanked } = useQuery({
    queryKey: ["services", "topRanked"],
    queryFn: getTopRankedServices,
  });

  const isSiteTotallyEmpty = !isLoadingServices && selectedCategory === 'All' && services?.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Top Ranked Section */}
      <section className="py-16 px-4">
        {isLoadingTopRanked ? (
          <div className="container mx-auto text-center"><Skeleton className="h-48 w-full max-w-4xl mx-auto rounded-lg" /></div>
        ) : topRankedServices && topRankedServices.length > 0 ? (
          <TopRankedSection services={topRankedServices} period="This Month" />
        ) : (
          <div className="container mx-auto">
            <EmptyState Icon={Trophy} title="No Top-Ranked Services Yet" description="Top services will be showcased here once they receive enough positive reviews."/>
          </div>
        )}
      </section>
      
      {/* Featured Services */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">⭐ Featured Services</h2>
          {isLoadingFeatured ? (
            <LoadingGrid />
          ) : featuredServices && featuredServices.length > 0 ? (
            <ServiceGrid services={featuredServices} />
          ) : (
            <EmptyState Icon={Star} title="No Featured Services" description="Admins can feature top-performing services, and they will appear here."/>
          )}
        </div>
      </section>
      
      {/* All Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Browse All Services</h2>
            <p className="text-muted-foreground text-lg">
              Discover trusted services in your area
            </p>
          </div>
          
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {isLoadingServices ? (
            <LoadingGrid />
          ) : isSiteTotallyEmpty ? (
            <EmptyState Icon={PackageOpen} title="Welcome to Ennlite Review!" description="No services have been listed yet. If you are a provider, list your service to be the first!"/>
          ) : services && services.length > 0 ? (
            <ServiceGrid services={services} />
          ) : (
            <p className="text-center text-muted-foreground py-10">No services found in this category.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;