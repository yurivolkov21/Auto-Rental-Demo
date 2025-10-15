import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Car,
  MapPin,
} from 'lucide-react';
import type { Payment } from '@/types/models/payment';
import type { BreadcrumbItem } from '@/types';

interface PaymentShowProps {
  payment: Payment;
}

export default function PaymentShow({ payment }: PaymentShowProps) {
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Payments', href: '/admin/payments' },
    { title: payment.transaction_id.substring(0, 20), href: `/admin/payments/${payment.id}` },
  ];

  const handleRefund = () => {
    setProcessing(true);
    router.post(
      `/admin/payments/${payment.id}/refund`,
      { reason: refundReason },
      {
        onFinish: () => {
          setProcessing(false);
          setShowRefundDialog(false);
          setRefundReason('');
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      completed: {
        bg: 'bg-green-100 text-green-800',
        text: 'Completed',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        text: 'Pending',
        icon: <Clock className="h-4 w-4" />,
      },
      failed: {
        bg: 'bg-red-100 text-red-800',
        text: 'Failed',
        icon: <XCircle className="h-4 w-4" />,
      },
      refunded: {
        bg: 'bg-purple-100 text-purple-800',
        text: 'Refunded',
        icon: <RefreshCw className="h-4 w-4" />,
      },
      cancelled: {
        bg: 'bg-gray-100 text-gray-800',
        text: 'Cancelled',
        icon: <XCircle className="h-4 w-4" />,
      },
    };

    const variant = variants[status] || variants.pending;

    return (
      <Badge className={variant.bg}>
        <span className="flex items-center gap-1">
          {variant.icon}
          {variant.text}
        </span>
      </Badge>
    );
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.visit('/admin/payments')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
            <h1 className="text-3xl font-bold">Payment Details</h1>
            <p className="text-muted-foreground mt-1">
              Transaction ID: {payment.transaction_id}
            </p>
          </div>
          <div className="flex gap-2">
            {payment.status === 'completed' && (
              <Button
                variant="destructive"
                onClick={() => setShowRefundDialog(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Issue Refund
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Payment Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Core transaction details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(payment.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <div className="mt-1">
                    <p className="text-2xl font-bold text-green-600">
                      {parseFloat(payment.amount_vnd).toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ ${parseFloat(payment.amount_usd).toFixed(2)} USD
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate: 1 USD = {parseFloat(payment.exchange_rate).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">
                    {payment.payment_method.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium mt-1 capitalize">
                    {payment.payment_type.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm mt-1">{payment.transaction_id}</p>
              </div>

              {payment.paypal_order_id && (
                <div>
                  <p className="text-sm text-muted-foreground">PayPal Order ID</p>
                  <p className="font-mono text-sm mt-1">{payment.paypal_order_id}</p>
                </div>
              )}

              {payment.paypal_payer_email && (
                <div>
                  <p className="text-sm text-muted-foreground">Payer Email</p>
                  <p className="font-medium mt-1">{payment.paypal_payer_email}</p>
                </div>
              )}

              {payment.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{payment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar - Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium text-sm">
                  {new Date(payment.created_at).toLocaleString()}
                </p>
              </div>
              {payment.paid_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>
                  <p className="font-medium text-sm text-green-600">
                    {new Date(payment.paid_at).toLocaleString()}
                  </p>
                </div>
              )}
              {payment.refunded_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Refunded At</p>
                  <p className="font-medium text-sm text-purple-600">
                    {new Date(payment.refunded_at).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium text-sm">
                  {new Date(payment.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Details */}
        {payment.booking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Associated Booking
              </CardTitle>
              <CardDescription>Details about the related booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <a
                    href={`/admin/bookings/${payment.booking.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {payment.booking.booking_code}
                  </a>
                </div>
                {payment.booking.car && (
                  <div>
                    <p className="text-sm text-muted-foreground">Car</p>
                    <p className="font-medium">{payment.booking.car.name}</p>
                  </div>
                )}
                {payment.booking.user && (
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{payment.booking.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.booking.user.email}
                    </p>
                  </div>
                )}
                {payment.booking.pickup_location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {payment.booking.pickup_location.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PayPal Response (for debugging) */}
        {payment.paypal_response && (
          <Card>
            <CardHeader>
              <CardTitle>PayPal API Response</CardTitle>
              <CardDescription>Raw response data from PayPal</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(payment.paypal_response, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Refund {parseFloat(payment.amount_vnd).toLocaleString('vi-VN')} ₫ (≈ ${parseFloat(payment.amount_usd).toFixed(2)} USD) to the customer. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Refund Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefund}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
