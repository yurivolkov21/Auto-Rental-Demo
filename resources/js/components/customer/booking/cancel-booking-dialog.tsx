import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface CancelBookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingId: number;
    bookingCode: string;
    pickupDatetime: string;
}

export function CancelBookingDialog({
    open,
    onOpenChange,
    bookingId,
    bookingCode,
    pickupDatetime,
}: CancelBookingDialogProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate hours until pickup
    const hoursUntilPickup = Math.floor(
        (new Date(pickupDatetime).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    );
    const canCancelFree = hoursUntilPickup >= 24;

    const handleCancel = () => {
        if (!reason.trim()) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            `/customer/bookings/${bookingId}/cancel`,
            {
                reason: reason.trim(),
            },
            {
                onFinish: () => {
                    setIsSubmitting(false);
                    onOpenChange(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cancel Booking</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel booking <strong>{bookingCode}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Cancellation Policy Notice */}
                    <div className={`flex gap-3 p-4 rounded-lg ${
                        canCancelFree
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-orange-50 border border-orange-200'
                    }`}>
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            canCancelFree ? 'text-blue-600' : 'text-orange-600'
                        }`} />
                        <div className="text-sm">
                            {canCancelFree ? (
                                <>
                                    <p className="font-medium text-blue-900 mb-1">
                                        Free Cancellation
                                    </p>
                                    <p className="text-blue-700">
                                        You can cancel this booking for free. Full refund will be processed within 5-7 business days.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium text-orange-900 mb-1">
                                        Cancellation Fee May Apply
                                    </p>
                                    <p className="text-orange-700">
                                        Cancelling less than 24 hours before pickup may incur a cancellation fee as per our policy.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div>
                        <Label htmlFor="reason" className="mb-2 block">
                            Reason for Cancellation *
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please tell us why you're cancelling..."
                            rows={4}
                            className="resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {reason.length}/500 characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Keep Booking
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={!reason.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
