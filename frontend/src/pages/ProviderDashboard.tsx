import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { getMyServices, deleteService } from '@/api/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Trash2, Pencil } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: services, isLoading, isError, error } = useQuery({
        queryKey: ['myServices'],
        queryFn: getMyServices
    });

    const deleteMutation = useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
            toast.success("Service deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
        },
        onError: (error) => {
            toast.error("Failed to delete service", { description: error.message });
        }
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'default';
            case 'REJECTED': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>My Services Dashboard</CardTitle>
                        <CardDescription>View and manage your service submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
                        {isError && <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>}
                        {services && (
                             <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {services.map(service => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell><Badge variant={getStatusVariant(service.approvalStatus)}>{service.approvalStatus}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="icon" variant="outline" onClick={() => navigate(`/service/edit/${service.id}`)}><Pencil className="h-4 w-4" /></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your service and all of its data.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(service.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                         {services?.length === 0 && <p className="text-center text-muted-foreground py-8">You have not submitted any services yet.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProviderDashboard;