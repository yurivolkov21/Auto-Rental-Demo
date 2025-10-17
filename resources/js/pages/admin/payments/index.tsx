import { useState } from 'react';
import { router } from '@inertiajs/react';
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
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  TrendingDown,
} from 'lucide-react';
import type { Payment } from '@/types/models/payment';
import type { BreadcrumbItem } from '@/types';

interface PaymentStats {
  total_payments: number;
  completed: number;
  pending: number;
  failed: number;
  total_amount_completed: string; // Legacy
  total_amount_pending: string; // Legacy
  total_amount_completed_vnd: string;
  total_amount_completed_usd: string;
  total_amount_pending_vnd: string;
  total_amount_pending_usd: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: Payment[];
}

interface Filters {
  status?: string;
  payment_method?: string;
  payment_type?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Payments', href: '/admin/payments' },
];

export default function PaymentIndex({
  payments,
  stats,
  filters,
}: {
  payments: Pagination;
  stats: PaymentStats;
  filters: Filters;
}) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
  const [paymentType, setPaymentType] = useState(filters.payment_type || 'all');

  const handleStatusFilterChange = (newStatus: string) => {
    setStatus(newStatus);
    router.get(
      '/admin/payments',
      {
        search: search || undefined,
        status: newStatus !== 'all' ? newStatus : undefined,
        payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
        payment_type: paymentType !== 'all' ? paymentType : undefined,
      },
      { preserveState: true }
    );
  };

  const handlePaymentMethodFilterChange = (newMethod: string) => {
    setPaymentMethod(newMethod);
    router.get(
      '/admin/payments',
      {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        payment_method: newMethod !== 'all' ? newMethod : undefined,
        payment_type: paymentType !== 'all' ? paymentType : undefined,
      },
      { preserveState: true }
    );
  };

  const handlePaymentTypeFilterChange = (newType: string) => {
    setPaymentType(newType);
    router.get(
      '/admin/payments',
      {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
        payment_type: newType !== 'all' ? newType : undefined,
      },
      { preserveState: true }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      '/admin/payments',
      {
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
        payment_type: paymentType !== 'all' ? paymentType : undefined,
      },
      { preserveState: true }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      completed: {
        bg: 'bg-green-100 text-green-800',
        text: 'Completed',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        text: 'Pending',
        icon: <Clock className="h-3 w-3" />,
      },
      failed: {
        bg: 'bg-red-100 text-red-800',
        text: 'Failed',
        icon: <XCircle className="h-3 w-3" />,
      },
      refunded: {
        bg: 'bg-purple-100 text-purple-800',
        text: 'Refunded',
        icon: <TrendingDown className="h-3 w-3" />,
      },
      cancelled: {
        bg: 'bg-gray-100 text-gray-800',
        text: 'Cancelled',
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

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      paypal: 'bg-blue-100 text-blue-800',
      credit_card: 'bg-purple-100 text-purple-800',
      bank_transfer: 'bg-indigo-100 text-indigo-800',
      cash: 'bg-green-100 text-green-800',
      wallet: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all payment transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Total Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.total_payments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time transactions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <div className="text-xs text-muted-foreground mt-1">
                <div>{parseFloat(stats.total_amount_completed_vnd || '0').toLocaleString('vi-VN')} ₫</div>
                <div className="text-[10px]">≈ ${parseFloat(stats.total_amount_completed_usd || '0').toFixed(2)} USD</div>
              </div>
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
              <div className="text-xs text-muted-foreground mt-1">
                <div>{parseFloat(stats.total_amount_pending_vnd || '0').toLocaleString('vi-VN')} ₫</div>
                <div className="text-[10px]">≈ ${parseFloat(stats.total_amount_pending_usd || '0').toFixed(2)} USD</div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium leading-tight">
                Failed
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{stats.failed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Failed transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              Filter and search through all payment transactions
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
                    placeholder="Search by transaction ID, booking code..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentMethod} onValueChange={handlePaymentMethodFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentType} onValueChange={handlePaymentTypeFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="full_payment">Full Payment</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.data.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {payment.transaction_id.substring(0, 20)}...
                      </TableCell>
                      <TableCell>
                        {payment.booking ? (
                          <a
                            href={`/admin/bookings/${payment.booking.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {payment.booking.booking_code}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{payment.user?.name || 'N/A'}</TableCell>
                      <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {parseFloat(payment.amount_vnd).toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ ${parseFloat(payment.amount_usd).toFixed(2)} USD
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.visit(`/admin/payments/${payment.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>

            {/* Pagination */}
            {payments.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(payments.current_page - 1) * payments.per_page + 1} to{' '}
                  {Math.min(payments.current_page * payments.per_page, payments.total)} of{' '}
                  {payments.total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={payments.current_page === 1}
                    onClick={() =>
                      router.get(`/admin/payments?page=${payments.current_page - 1}`, {
                        status: status !== 'all' ? status : undefined,
                        payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
                        payment_type: paymentType !== 'all' ? paymentType : undefined,
                        search: search || undefined,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={payments.current_page === payments.last_page}
                    onClick={() =>
                      router.get(`/admin/payments?page=${payments.current_page + 1}`, {
                        status: status !== 'all' ? status : undefined,
                        payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
                        payment_type: paymentType !== 'all' ? paymentType : undefined,
                        search: search || undefined,
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
