import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, User as UserIcon, Mail, Calendar, KeyRound } from 'lucide-react';
import { getProfile } from '@/api/user';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/types';

const ProfilePage = () => {
    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile
    });

    return (
        <div className="min-h-screen bg-muted/20">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl">My Profile</CardTitle>
                        <CardDescription>Your personal account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading && (
                            <>
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-6 w-1/4" />
                            </>
                        )}
                        {isError && (
                             <Alert variant="destructive">
                                <ShieldAlert className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{(error as Error).message}</AlertDescription>
                            </Alert>
                        )}
                        {user && (
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-4"><UserIcon className="h-5 w-5 text-muted-foreground" /> <span>{user.name}</span></div>
                                <div className="flex items-center gap-4"><Mail className="h-5 w-5 text-muted-foreground" /> <span>{user.email}</span></div>
                                <div className="flex items-center gap-4"><KeyRound className="h-5 w-5 text-muted-foreground" /> <Badge variant={user.role === Role.ADMIN ? 'destructive' : 'secondary'}>{user.role}</Badge></div>
                                <div className="flex items-center gap-4"><Calendar className="h-5 w-5 text-muted-foreground" /> <span>Joined on {new Date(user.createdAt).toLocaleDateString()}</span></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;