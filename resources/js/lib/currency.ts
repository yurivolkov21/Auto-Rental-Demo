/**
 * Format amount to Vietnamese Dong (VND) currency
 */
export function formatCurrency(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(numAmount);
}

/**
 * Format amount to compact format (e.g., 1.5M, 2.3K)
 */
export function formatCurrencyCompact(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(numAmount);
}

/**
 * Format number with thousand separators (no currency symbol)
 */
export function formatNumber(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN').format(numValue);
}
