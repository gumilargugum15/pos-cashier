<?php

namespace App\Services;

use App\Repositories\Contracts\CustomerRepositoryInterface;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\SaleRepositoryInterface;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function __construct(
        private readonly SaleRepositoryInterface $sales,
        private readonly ProductRepositoryInterface $products,
        private readonly CustomerRepositoryInterface $customers,
    ) {
    }

    public function summary(): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $todaySales = $this->sales->totalForDate($today);
        $yesterdaySales = $this->sales->totalForDate($yesterday);

        $todayProfit = $this->sales->profitForDate($today);
        $yesterdayProfit = $this->sales->profitForDate($yesterday);

        $todayCount = $this->sales->countForDate($today);
        $yesterdayCount = $this->sales->countForDate($yesterday);

        return [
            'stats' => [
                'today_sales' => $todaySales,
                'today_sales_change_percent' => $this->percentChange($todaySales, $yesterdaySales),
                'today_profit' => $todayProfit,
                'today_profit_change_percent' => $this->percentChange($todayProfit, $yesterdayProfit),
                'transactions_count' => $todayCount,
                'transactions_change_percent' => $this->percentChange($todayCount, $yesterdayCount),
                'products_count' => $this->products->countActive(),
                'customers_count' => $this->customers->count(),
                'low_stock_count' => $this->products->countLowStock(),
                'pending_orders_count' => $this->sales->pendingCount(),
                'cash_in_drawer' => $this->sales->cashTotalForDate($today),
            ],
            'sales_trend' => $this->sales->salesTrend(7)->values(),
            'payment_methods' => $this->sales->paymentMethodBreakdown($today)->values(),
            'sales_by_category' => $this->sales->salesByCategory(Carbon::today()->startOfWeek())->values(),
            'top_products' => $this->products->topSelling(5, Carbon::today()->subDays(30))->values(),
            'latest_transactions' => $this->sales->latestTransactions(5)->values(),
            'low_stock_products' => $this->products->lowStock(5)->values(),
        ];
    }

    private function percentChange(float|int $current, float|int $previous): ?float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
