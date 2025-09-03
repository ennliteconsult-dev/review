import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Switch } from '@/components/ui/switch';
import { getAllServicesForAdmin, approveService, rejectService, getUsers, promoteUser, setFeaturedStatus } from '@/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Role } from '@/types';

const ServiceManagementTab = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: services, isLoading, isError, error } = useQuery({
        queryKey: ['adminAllServices'],
        queryFn: getAllServicesForAdmin
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAllServices'] });
        },
        onError: (error: Error) => { toast.error('Action Failed', { description: error.message }); },
    };

    const approveMutation = useMutation({ ...mutationOptions, mutationFn: approveService });
    const rejectMutation = useMutation({ ...mutationOptions, mutationFn: rejectService });

    const featureMutation = useMutation({
        mutationFn: setFeaturedStatus,
        onSuccess: (data) => {
            toast.success(`'${data.name}' featured status updated.`);
            queryClient.invalidateQueries({ queryKey: ['adminAllServices'] });
        },
        onError: (error: Error) => {
            toast.error('Update Failed', { description: error.message });
        },
    });


    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'default';
            case 'REJECTED': return 'destructive';
            default: return 'secondary';
        }
    };

    if (isLoading) return <div className="space-y-2 pt-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
    if (isError) return <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead> {/* <-- New Column Header */}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {services?.map(service => (
                    <TableRow
                    key={service.id}
                        onClick={() => navigate(`/service/${service.id}`)} 
                        className="cursor-pointer hover:bg-muted/50"       
                    >
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.providerName}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(service.approvalStatus)}>{service.approvalStatus}</Badge></TableCell>
                        {/* New Cell with the Switch */}
                        <TableCell>
                            <Switch
                                checked={service.featured}
                                onCheckedChange={(isChecked) => {
                                    featureMutation.mutate({ serviceId: service.id, featured: isChecked });
                                }}
                                disabled={featureMutation.isPending}
                            />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           {/* ... existing buttons ... */}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const UserManagementTab = () => {
    const queryClient = useQueryClient();
    const { data: users, isLoading, isError, error } = useQuery({ queryKey: ['adminAllUsers'], queryFn: getUsers });

    const promoteMutation = useMutation({
        mutationFn: promoteUser,
        onSuccess: (data) => {
            toast.success(`${data.name} has been promoted to Admin.`);
            queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
        },
        onError: (error: Error) => { toast.error('Promotion Failed', { description: error.message }); },
    });

    if (isLoading) return <div className="space-y-2 pt-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
    if (isError) return <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {users?.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === Role.ADMIN ? 'destructive' : 'secondary'}>{user.role}</Badge></TableCell>
                        <TableCell className="text-right">
                            {user.role !== Role.ADMIN && (
                                <Button size="sm" variant="outline" onClick={() => promoteMutation.mutate(user.id)} disabled={promoteMutation.isPending}>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Promote to Admin
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>Manage services and users across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="services">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="services">Service Management</TabsTrigger>
                                <TabsTrigger value="users">User Management</TabsTrigger>
                            </TabsList>
                            <TabsContent value="services">
                                <ServiceManagementTab />
                            </TabsContent>
                            <TabsContent value="users">
                                <UserManagementTab />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;