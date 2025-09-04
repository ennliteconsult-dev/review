import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Make sure all these Form components are imported
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginUser } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { LoginCredentials, User } from '@/types'; // Import User type

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // 1. The 'form' variable from useForm
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            toast.success('Login successful!');
            
            const userForContext: User = { 
                id: data.userId, 
                name: data.name, 
                email: data.email, 
                role: data.role,
                createdAt: new Date().toISOString()
            };
            login(data.token, userForContext);
            navigate('/');
        },
        onError: (error) => {
            toast.error('Login Failed', {
                description: error.message || 'An unknown error occurred.',
            });
        }
    });

    function onSubmit(values: LoginCredentials) {
        mutation.mutate(values);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                     {/* 2. The <Form> wrapper component (Uppercase F) */}
                     {/* It takes the 'form' variable to provide context */}
                     <Form {...form}>
                        {/* 3. The <form> HTML element (lowercase f) */}
                        {/* It handles the actual submission */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control} // This now works because of the <Form> wrapper
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;