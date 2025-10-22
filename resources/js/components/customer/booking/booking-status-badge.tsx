import { Badge } from '@/components/ui/badge';

interface BookingStatusBadgeProps {
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
    className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
    const statusConfig = {
        pending: {
            label: 'Pending',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        },
        confirmed: {
            label: 'Confirmed',
            className: 'bg-blue-100 text-blue-800 border-blue-200',
        },
        active: {
            label: 'Active',
            className: 'bg-green-100 text-green-800 border-green-200',
        },
        completed: {
            label: 'Completed',
            className: 'bg-gray-100 text-gray-800 border-gray-200',
        },
        cancelled: {
            label: 'Cancelled',
            className: 'bg-red-100 text-red-800 border-red-200',
        },
        rejected: {
            label: 'Rejected',
            className: 'bg-red-100 text-red-800 border-red-200',
        },
    };

    const config = statusConfig[status];

    return (
        <Badge className={`${config.className} ${className || ''}`}>
            {config.label}
        </Badge>
    );
}
