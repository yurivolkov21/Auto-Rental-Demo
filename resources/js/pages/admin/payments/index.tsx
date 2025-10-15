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
  total_amount_completed: string;
  total_amount_pending: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  data: Payment[];
  links: { url: string | null; label: string; active: boolean }[];
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
  const [status, setStatus] = useState(filters.status || '');
  const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
  const [paymentType, setPaymentType] = useState(filters.payment_type || '');

  const handleFilter = () => {
    router.get(
      '/admin/payments',
      {
        search: search || undefined,
        status: status || undefined,
        payment_method: paymentMethod || undefined,
        payment_type: paymentType || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setPaymentMethod('');
    setPaymentType('');
    router.get('/admin/payments');
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
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all payment transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_payments}</div>
              <p className="text-xs text-muted-foreground">All time payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                ${parseFloat(stats.total_amount_completed).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                ${parseFloat(stats.total_amount_pending).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter payments by status, method, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by transaction ID, booking code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Methods</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="full_payment">Full Payment</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilter}>
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              {payments.total} total payments found
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <a
                          href={`/admin/bookings/${payment.booking.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {payment.booking.booking_code}
                        </a>
                      </TableCell>
                      <TableCell>{payment.user.name}</TableCell>
                      <TableCell>{getMethodBadge(payment.payment_method)}</TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${parseFloat(payment.amount).toFixed(2)}
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

            {/* Pagination */}
            {payments.data.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {payments.from} to {payments.to} of {payments.total} payments
                </p>
                <div className="flex gap-2">
                  {payments.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
