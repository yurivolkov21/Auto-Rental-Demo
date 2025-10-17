import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Users,
  Car,
  Calendar,
  Banknote,
  Star,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { BreadcrumbItem } from '@/types';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    verified: number;
  };
  cars: {
    total: number;
    available: number;
    rented: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  revenue: {
    total: number;
    today: number;
    month: number;
  };
  reviews: {
    total: number;
    pending: number;
    approved: number;
    average_rating: number;
  };
}

interface ChartData {
  monthlyBookings: Array<{ month: string; bookings: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  bookingsByStatus: Array<{ status: string; count: number; fill: string }>;
  reviewsByRating: Array<{ rating: string; count: number; fill: string }>;
}

interface DashboardProps {
  stats: DashboardStats;
  charts: ChartData;
}

export default function AdminDashboard({ stats, charts }: DashboardProps) {
  const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin' }];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Chart configurations
  const bookingsChartConfig = {
    bookings: {
      label: 'Bookings',
      color: '#3b82f6',
    },
  } satisfies ChartConfig;

  const revenueChartConfig = {
    revenue: {
      label: 'Revenue',
      color: '#22c55e',
    },
  } satisfies ChartConfig;

  const statusChartConfig = {
    count: {
      label: 'Bookings',
    },
  } satisfies ChartConfig;

  const ratingChartConfig = {
    count: {
      label: 'Reviews',
    },
  } satisfies ChartConfig;

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to AutoRental admin panel</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Users Stats */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users.active} active · {stats.users.verified} verified
              </p>
            </CardContent>
          </Card>

          {/* Cars Stats */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.cars.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.cars.available} available · {stats.cars.rented} rented
              </p>
            </CardContent>
          </Card>

          {/* Bookings Stats */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.bookings.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.bookings.pending} pending · {stats.bookings.confirmed} confirmed
              </p>
            </CardContent>
          </Card>

          {/* Revenue Stats */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Banknote className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(stats.revenue.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                Today: {formatCurrency(stats.revenue.today)}
              </p>
            </CardContent>
          </Card>

          {/* Reviews Stats */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.reviews.total}</div>
              <p className="text-xs text-muted-foreground">
                Avg rating: {stats.reviews.average_rating} ⭐
              </p>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.reviews.pending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.reviews.approved} approved
              </p>
            </CardContent>
          </Card>

          {/* Completed Bookings */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.bookings.completed}
              </div>
              <p className="text-xs text-muted-foreground">
                {((stats.bookings.completed / stats.bookings.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
              <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(stats.revenue.month)}
              </div>
              <p className="text-xs text-muted-foreground">
                {((stats.revenue.month / stats.revenue.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chart 1: Monthly Bookings Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Monthly Bookings Trend
              </CardTitle>
              <CardDescription>Bookings over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={bookingsChartConfig} className="h-[300px] w-full">
                <BarChart data={charts.monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Monthly Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Monthly Revenue Trend
              </CardTitle>
              <CardDescription>Revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                <LineChart data={charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 3: Bookings by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                Bookings by Status
              </CardTitle>
              <CardDescription>Distribution of booking statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={statusChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={charts.bookingsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Chart 4: Reviews by Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Reviews by Rating
              </CardTitle>
              <CardDescription>Distribution of customer ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={ratingChartConfig} className="h-[300px] w-full">
                <BarChart data={charts.reviewsByRating} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="rating"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
