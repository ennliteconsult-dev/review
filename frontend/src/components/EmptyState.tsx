import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    Icon: LucideIcon;
    title: string;
    description: string;
}

export const EmptyState = ({ Icon, title, description }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-muted/30 rounded-lg">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>
        </div>
    );
};