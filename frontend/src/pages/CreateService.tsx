import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createService } from '@/api'; // This API function will now send JSON
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Role, CreateServiceData } from '@/types';

const categories = [ "Home Services", "Beauty & Wellness", "Professional Services", "Automotive", "Health & Medical", "Education & Training", "Technology", "Food & Catering", "Event Planning" ];

// YouTube URL regex for validation
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

const createServiceSchema = z.object({
    name: z.string().min(3, { message: 'Service name must be at least 3 characters.' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    category: z.string().nonempty({ message: 'Please select a category.' }),
    location: z.string().min(2, { message: 'Location is required.' }),
    // Update schema for videoUrl
    videoUrl: z.string().refine((url) => url ? youtubeRegex.test(url) : true, {
        message: "Please enter a valid YouTube URL.",
    }).optional(),
});

const CreateService = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isLoading } = useAuth();
    
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                toast.error("You must be logged in to list a service.");
                navigate('/login');
            } else if (user.role !== Role.PROVIDER) {
                toast.error("Only Service Providers can list a new service.");
                navigate('/');
            }
        }
    }, [user, isLoading, navigate]);

    const form = useForm<z.infer<typeof createServiceSchema>>({
        resolver: zodResolver(createServiceSchema),
        defaultValues: { name: '', description: '', location: '', category: '', videoUrl: '' },
    });

    const mutation = useMutation({
        // The `createService` API function now needs to send JSON instead of FormData
        mutationFn: createService,
        onSuccess: (data) => {
            toast.success('Service Submitted!', {
                description: 'Your service is now pending admin approval.',
            });
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
            navigate('/dashboard/provider');
        },
        onError: (error) => { toast.error('Failed to create service', { description: error.message }); },
    });

    // The onSubmit function now sends a JSON object
     function onSubmit(values: CreateServiceData) {
        mutation.mutate(values);
    }

    if (isLoading || !user || user.role !== Role.PROVIDER) {
        return <div className="flex justify-center items-center min-h-screen"><p>Checking permissions...</p></div>
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl">List a New Service</CardTitle>
                        <CardDescription>Fill out the details below to get your service in front of customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Service Name</FormLabel><FormControl><Input placeholder="e.g., Professional House Painting" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel>Service Description</FormLabel><FormControl><Textarea placeholder="Describe your service..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                        <select {...field} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2"><option value="" disabled>Select a category</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., San Francisco, CA" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                {/* Change file input to text input for YouTube URL */}
                                <FormField control={form.control} name="videoUrl" render={({ field }) => (
                                    <FormItem><FormLabel>YouTube Video URL (Optional)</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                                    {mutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreateService;