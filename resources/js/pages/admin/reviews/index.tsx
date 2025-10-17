import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  StarIcon,
} from 'lucide-react';
import type { Review, ReviewStats, ReviewFilters } from '@/types/models/review';
import type { BreadcrumbItem } from '@/types';

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: Review[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Reviews', href: '/admin/reviews' },
];

export default function ReviewIndex({
  reviews,
  stats,
  filters,
}: {
  reviews: Pagination;
  stats: ReviewStats;
  filters: ReviewFilters;
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    filters.status || 'all'
  );
  const [rating, setRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>(
    filters.rating || 'all'
  );
  const [verified, setVerified] = useState<'all' | 'yes' | 'no'>(filters.verified || 'all');

  const handleStatusFilterChange = (newStatus: string) => {
    const typedStatus = newStatus as typeof status;
    setStatus(typedStatus);
    router.get(
      '/admin/reviews',
      {
        search: search || undefined,
        status: newStatus !== 'all' ? newStatus : undefined,
        rating: rating !== 'all' ? rating : undefined,
        verified: verified !== 'all' ? verified : undefined,
      },
      { preserveState: true }
    );
  };

  const handleRatingFilterChange = (newRating: string) => {
    const typedRating = newRating as typeof rating;
    setRating(typedRating);
    router.get(
      '/admin/reviews',
      {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        rating: newRating !== 'all' ? newRating : undefined,
        verified: verified !== 'all' ? verified : undefined,
      },
      { preserveState: true }
    );
  };

  const handleVerifiedFilterChange = (newVerified: string) => {
    const typedVerified = newVerified as typeof verified;
    setVerified(typedVerified);
    router.get(
      '/admin/reviews',
      {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        rating: rating !== 'all' ? rating : undefined,
        verified: newVerified !== 'all' ? newVerified : undefined,
      },
      { preserveState: true }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      '/admin/reviews',
      {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        rating: rating !== 'all' ? rating : undefined,
        verified: verified !== 'all' ? verified : undefined,
      },
      { preserveState: true }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      approved: {
        bg: 'bg-green-100 text-green-800',
        text: 'Approved',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        text: 'Pending',
        icon: <Clock className="h-3 w-3" />,
      },
      rejected: {
        bg: 'bg-red-100 text-red-800',
        text: 'Rejected',
        icon: <XCircle className="h-3 w-3" />,
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
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer reviews and ratings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Total Reviews
              </CardTitle>
              <Star className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All customer reviews
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Approved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Published reviews
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Rejected
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Not published
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Avg Rating
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.average_rating} ⭐</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>
              Filter and manage customer reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by customer, car, or booking..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>

              <Select value={status} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={rating} onValueChange={handleRatingFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verified} onValueChange={handleVerifiedFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Verified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Verified</SelectItem>
                  <SelectItem value="no">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.data.map((review) => (
                      <TableRow key={review.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{review.user?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.user?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{review.car?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.car?.brand?.name}
                          </div>
                        </TableCell>
                        <TableCell>{renderStars(review.rating)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.comment}
                        </TableCell>
                        <TableCell>{getStatusBadge(review.status)}</TableCell>
                        <TableCell>
                          {new Date(review.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/reviews/${review.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {reviews.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(reviews.current_page - 1) * reviews.per_page + 1} to{' '}
                  {Math.min(reviews.current_page * reviews.per_page, reviews.total)} of{' '}
                  {reviews.total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviews.current_page === 1}
                    onClick={() =>
                      router.get(`/admin/reviews?page=${reviews.current_page - 1}`, {
                        search: search || undefined,
                        status: status !== 'all' ? status : undefined,
                        rating: rating !== 'all' ? rating : undefined,
                        verified: verified !== 'all' ? verified : undefined,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviews.current_page === reviews.last_page}
                    onClick={() =>
                      router.get(`/admin/reviews?page=${reviews.current_page + 1}`, {
                        search: search || undefined,
                        status: status !== 'all' ? status : undefined,
                        rating: rating !== 'all' ? rating : undefined,
                        verified: verified !== 'all' ? verified : undefined,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
