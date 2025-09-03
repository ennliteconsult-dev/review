import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getServiceForEdit, updateService } from '@/api/provider';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const categories = [ "Home Services", "Beauty & Wellness", "Professional Services", "Automotive", "Health & Medical", "Education & Training", "Technology", "Food & Catering", "Event Planning" ];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const editServiceSchema = z.object({
    name: z.string().min(3, { message: 'Service name must be at least 3 characters.' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    category: z.string().nonempty({ message: 'Please select a category.' }),
    location: z.string().min(2, { message: 'Location is required.' }),
    image: z.any().optional(),
});

const EditService = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: service, isLoading: isLoadingService } = useQuery({
        queryKey: ['providerService', id],
        queryFn: () => getServiceForEdit(id!), 
        enabled: !!id,
    });

    const form = useForm<z.infer<typeof editServiceSchema>>({
        resolver: zodResolver(editServiceSchema),
        defaultValues: { name: '', description: '', category: '', location: '' },
    });
    const fileRef = form.register("image");
    
    useEffect(() => {
        if (service) {
            form.reset({
                name: service.name,
                description: service.description,
                category: service.category,
                location: service.location || '',
            });
        }
    }, [service, form]);

    const mutation = useMutation({
        mutationFn: updateService,
        onSuccess: () => {
            toast.success('Service Updated!', { description: 'Your changes have been submitted for re-approval.' });
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
            navigate('/dashboard/provider');
        },
        onError: (error) => {
            toast.error('Failed to update service', { description: error.message });
        },
    });

    function onSubmit(values: z.infer<typeof editServiceSchema>) {
        if (!id) return;
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('category', values.category);
        formData.append('location', values.location);
        if (values.image && values.image.length > 0) {
            formData.append('image', values.image[0]);
        }
        mutation.mutate({ serviceId: id, serviceData: formData });
    }

    if (isLoadingService) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto py-12"><Skeleton className="h-96 w-full max-w-2xl mx-auto" /></div></div>

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                 <Link to="/dashboard/provider" className="inline-flex items-center gap-2 text-primary mb-8 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl">Edit Your Service</CardTitle>
                        <CardDescription>Update the details and resubmit for approval. The image will only be updated if you select a new one.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Service Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Service Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel>
                                        <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"><option value="" disabled>Select a category</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                                    <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="image" render={({ field }) => ( <FormItem><FormLabel>Update Image (Optional)</FormLabel><FormControl><Input type="file" {...fileRef} /></FormControl><FormMessage /></FormItem> )}/>
                                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                                    {mutation.isPending ? 'Updating Service...' : 'Update and Resubmit'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EditService;