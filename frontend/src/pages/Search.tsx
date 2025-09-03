import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { ServiceGrid } from '@/components/ServiceGrid';
import { searchServices } from '@/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX } from 'lucide-react';

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

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const { data: services, isLoading, isError, error } = useQuery({
        queryKey: ['searchServices', query],
        queryFn: () => searchServices(query),
        enabled: !!query,
    });

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto py-12 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
                    <p className="text-muted-foreground text-lg">
                        {isLoading ? 'Searching...' : `Showing results for "${query}"`}
                    </p>
                </div>
                
                {isLoading && <LoadingGrid />}

                {isError && <p>Error: {(error as Error).message}</p>}

                {!isLoading && !isError && (
                    services && services.length > 0 ? (
                        <ServiceGrid services={services} />
                    ) : (
                        <div className="flex justify-center py-16">
                            <Alert className="max-w-md text-center">
                                <SearchX className="h-4 w-4" />
                                <AlertTitle>No Results Found</AlertTitle>
                                <AlertDescription>
                                    We couldn't find any services matching your search. Try a different term.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default SearchPage;