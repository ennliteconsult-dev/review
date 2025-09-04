import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServiceById } from "@/api";
import { createReview } from "@/api/review";
import { Header } from "@/components/Header";
import { Star, MapPin, Users, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ReviewCard } from "@/components/ReviewCard";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { getAdminServiceById } from '@/api/admin'
import { Role, CreateReviewData } from "@/types";

const reviewSchema = z.object({
    rating: z.coerce.number().min(1, "Rating is required").max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters long."),
});

// Helper function to convert YouTube URL to embeddable URL
const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = null;
    // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
    const urlParams = new URLSearchParams(new URL(url).search);
    videoId = urlParams.get('v');
    
    // Shortened URL: https://youtu.be/VIDEO_ID
    if (!videoId) {
        const match = url.match(/youtu\.be\/([^?]+)/);
        if (match) {
            videoId = match[1];
        }
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};


const ServiceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const isAdmin = user?.role === Role.ADMIN;
    const queryFn = isAdmin ? () => getAdminServiceById(id!) : () => getServiceById(id!);

    const { data: service, isLoading, isError, error } = useQuery({
        queryKey: ["service", id, { isAdmin }],
        queryFn: queryFn,
        enabled: !!id,
    });
    
    const form = useForm<z.infer<typeof reviewSchema>>({
        resolver: zodResolver(reviewSchema),
        defaultValues: { rating: 0, comment: "" },
    });

    const reviewMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            toast.success("Review submitted!");
            queryClient.invalidateQueries({ queryKey: ["service", id] });
            form.reset();
        },
        onError: (error) => {
            toast.error("Failed to submit review", { description: error.message });
        },
    });

    const onSubmitReview = (values: CreateReviewData) => {
        if (!id) return;
        reviewMutation.mutate({ serviceId: id, reviewData: values });
    };
    
    const hasUserReviewed = service?.reviews?.some(review => review.authorId === user?.id);
    const canReview = isAuthenticated && user?.id !== service?.providerId && !hasUserReviewed;

    const embedUrl = service?.videoUrl ? getYouTubeEmbedUrl(service.videoUrl) : null;

    if (isLoading) return <div><Header /><p>Loading...</p></div>
    if (isError) return <div><Header /><p>Error: {(error as Error).message}</p></div>
    if (!service) return <div><Header /><p>Service not found.</p></div>

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto py-12 px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-primary mb-8 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to all services
                </Link>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <Badge variant="secondary" className="mb-2">{service.category}</Badge>
                            <h1 className="text-4xl font-bold tracking-tight">{service.name}</h1>
                            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                                <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{service.providerName}</span></div>
                                {service.location && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{service.location}</span></div>}
                            </div>
                        </div>
                        {/* YouTube video embed */}
                        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                            {embedUrl ? (
                                <iframe 
                                    className="w-full h-full"
                                    src={embedUrl}
                                    title={service.name}
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen>
                                </iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><p className="text-muted-foreground">No Video Provided</p></div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">About this service</h2>
                            <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold">Reviews ({service.reviewCount})</h2>
                            {canReview && (
                                <Card>
                                    <CardHeader><CardTitle>Write a review</CardTitle></CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                                                <FormField control={form.control} name="rating" render={({ field }) => (
                                                    <FormItem><FormLabel>Rating</FormLabel><FormControl><div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map(star => (<Star key={star} className={`cursor-pointer h-6 w-6 ${star <= (field.value || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => field.onChange(star)} />))}</div></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="comment" render={({ field }) => (
                                                    <FormItem><FormLabel>Comment</FormLabel><FormControl><Textarea placeholder="Share your experience..." {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <Button type="submit" disabled={reviewMutation.isPending}>{reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}</Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            )}
                            {hasUserReviewed && (<div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground"><p>You have already reviewed this service.</p></div>)}
                            {service.reviews && service.reviews.length > 0 ? (
                                service.reviews.map(review => <ReviewCard key={review.id} review={review} />)
                            ) : (<p className="text-muted-foreground">No reviews yet. Be the first to write one!</p>)}
                        </div>
                    </div>
                    <aside className="md:col-span-1">
                        <Card>
                            <CardHeader><CardTitle className="text-2xl">Book this Service</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-lg">
                                    <span className="font-semibold">Rating</span>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-bold">{service.rating.toFixed(1)}</span>
                                        <span className="text-sm text-muted-foreground">({service.reviewCount} reviews)</span>
                                    </div>
                                </div>
                                {service.providerPhone ? (
                                    <Button asChild size="lg" className="w-full" variant="hero"><a href={`tel:${service.providerPhone}`}>Contact Provider</a></Button>
                                ) : (<Button size="lg" className="w-full" variant="hero" disabled>Contact Info Unavailable</Button>)}
                                {/* <Button size="lg" className="w-full" variant="outline">Save for Later</Button> */}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default ServiceDetail;