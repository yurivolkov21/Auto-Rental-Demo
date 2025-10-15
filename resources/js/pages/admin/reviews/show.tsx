import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Star,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  Calendar,
  Car,
  User,
  MessageSquare,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import type { Review } from '@/types/models/review';
import type { BreadcrumbItem } from '@/types';

interface ReviewShowProps {
  review: Review;
}

export default function ReviewShow({ review }: ReviewShowProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Reviews', href: '/admin/reviews' },
    { title: `Review #${review.id}`, href: `/admin/reviews/${review.id}` },
  ];

  const handleApprove = () => {
    setProcessing(true);
    router.post(
      `/admin/reviews/${review.id}/approve`,
      {},
      {
        onFinish: () => {
          setProcessing(false);
          setShowApproveDialog(false);
        },
      }
    );
  };

  const handleReject = () => {
    setProcessing(true);
    router.post(
      `/admin/reviews/${review.id}/reject`,
      {},
      {
        onFinish: () => {
          setProcessing(false);
          setShowRejectDialog(false);
        },
      }
    );
  };

  const handleRespond = () => {
    if (!response.trim()) return;

    setProcessing(true);
    router.post(
      `/admin/reviews/${review.id}/respond`,
      { response },
      {
        onFinish: () => {
          setProcessing(false);
          setShowResponseDialog(false);
          setResponse('');
        },
      }
    );
  };

  const handleDelete = () => {
    setProcessing(true);
    router.delete(`/admin/reviews/${review.id}`, {
      onFinish: () => {
        setProcessing(false);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      approved: {
        bg: 'bg-green-100 text-green-800',
        text: 'Approved',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        text: 'Pending',
        icon: <Clock className="h-4 w-4" />,
      },
      rejected: {
        bg: 'bg-red-100 text-red-800',
        text: 'Rejected',
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold">{rating}/5</span>
      </div>
    );
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/reviews">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Review Details</h1>
              <p className="text-sm text-muted-foreground">
                Review ID: #{review.id}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {review.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  onClick={() => setShowApproveDialog(true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {(review.status === 'approved' || review.status === 'rejected') && (
              <Button
                variant="outline"
                onClick={() => setShowResponseDialog(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {review.response ? 'Update Response' : 'Add Response'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Review Content */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Review Content</CardTitle>
              <CardDescription>Customer feedback and rating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(review.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="mt-1">{renderStars(review.rating)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified Booking</p>
                  <div className="mt-1">
                    {review.is_verified_booking ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Review Date</p>
                  <p className="font-medium text-sm mt-1">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Comment</p>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>

              {review.response && (
                <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-blue-900">Response from {review.responder?.name || 'Admin'}</p>
                        {review.responded_at && (
                          <p className="text-xs text-blue-600">
                            {new Date(review.responded_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                        {review.response}
                      </p>
                    </div>
                  </div>
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
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium text-sm">
                  {new Date(review.updated_at).toLocaleString()}
                </p>
              </div>
              {review.responded_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Response Date</p>
                  <p className="font-medium text-sm text-blue-600">
                    {new Date(review.responded_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Info */}
        {review.user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
              <CardDescription>Details about the reviewer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <a
                    href={`/admin/users/${review.user.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {review.user.name}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{review.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">#{review.user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Car Info */}
        {review.car && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Car Information
              </CardTitle>
              <CardDescription>Details about the reviewed car</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Car Name</p>
                  <a
                    href={`/admin/cars/${review.car.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {review.car.name}
                  </a>
                </div>
                {review.car.brand && (
                  <div>
                    <p className="text-sm text-muted-foreground">Brand</p>
                    <p className="font-medium">{review.car.brand.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Car ID</p>
                  <p className="font-medium">#{review.car.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Info */}
        {review.booking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Associated Booking
              </CardTitle>
              <CardDescription>Details about the related booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <a
                    href={`/admin/bookings/${review.booking.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {review.booking.booking_code}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Status</p>
                  <Badge className="bg-blue-100 text-blue-800">
                    {review.booking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-medium">#{review.booking.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Review</DialogTitle>
            <DialogDescription>
              This will publish the review and make it visible to the public. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? 'Approving...' : 'Approve Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              This will reject the review and prevent it from being published. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? 'Rejecting...' : 'Reject Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{review.response ? 'Update Response' : 'Add Response'}</DialogTitle>
            <DialogDescription>
              {review.response 
                ? 'Update your response to this review.'
                : 'Add a response to this customer review. This will be visible to the customer.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Thank you for your feedback..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={processing || !response.trim()}>
              {processing ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the review from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
              {processing ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
