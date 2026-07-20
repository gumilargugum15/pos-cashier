export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  discount?: number;
  image: string;
  favorite?: boolean;
  status: "active" | "inactive";
};

const emoji = (e: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='%23EEF2FF'/><text x='50%' y='54%' text-anchor='middle' font-size='34' dominant-baseline='middle'>${e}</text></svg>`,
  )}`;

export const products: Product[] = [
  { id: "1", name: "Organic Bananas 1kg", sku: "GRC-001", category: "Grocery", brand: "FreshCo", price: 2.5, cost: 1.4, stock: 42, image: emoji("🍌"), status: "active" },
  { id: "2", name: "Whole Milk 1L", sku: "GRC-002", category: "Grocery", brand: "DairyLand", price: 3.2, cost: 2.1, stock: 18, discount: 10, image: emoji("🥛"), status: "active" },
  { id: "3", name: "Espresso Beans 250g", sku: "BEV-014", category: "Beverage", brand: "Roasters", price: 12.9, cost: 6.5, stock: 6, image: emoji("☕"), favorite: true, status: "active" },
  { id: "4", name: "Sourdough Loaf", sku: "BAK-021", category: "Bakery", brand: "Artisan", price: 5.5, cost: 2.3, stock: 12, image: emoji("🍞"), status: "active" },
  { id: "5", name: "Aspirin 100mg", sku: "PHM-101", category: "Pharmacy", brand: "MediCare", price: 4.2, cost: 1.9, stock: 88, image: emoji("💊"), status: "active" },
  { id: "6", name: "USB-C Cable 1m", sku: "ELC-330", category: "Electronics", brand: "Voltix", price: 9.9, cost: 3.5, stock: 3, image: emoji("🔌"), status: "active" },
  { id: "7", name: "Cotton T-Shirt", sku: "CLT-501", category: "Clothing", brand: "Urban", price: 19.0, cost: 7.5, stock: 24, discount: 15, image: emoji("👕"), status: "active" },
  { id: "8", name: "Sneakers Runner", sku: "CLT-522", category: "Clothing", brand: "Urban", price: 79.0, cost: 34.0, stock: 9, image: emoji("👟"), status: "active" },
  { id: "9", name: "Orange Juice 1L", sku: "BEV-041", category: "Beverage", brand: "FreshCo", price: 4.5, cost: 2.2, stock: 22, image: emoji("🧃"), status: "active" },
  { id: "10", name: "Chocolate Bar", sku: "SNK-011", category: "Snacks", brand: "Cocoa", price: 2.0, cost: 0.9, stock: 120, image: emoji("🍫"), status: "active" },
  { id: "11", name: "Bluetooth Earbuds", sku: "ELC-410", category: "Electronics", brand: "Voltix", price: 49.0, cost: 22.0, stock: 5, image: emoji("🎧"), status: "active" },
  { id: "12", name: "Apples 1kg", sku: "GRC-018", category: "Grocery", brand: "FreshCo", price: 3.8, cost: 1.9, stock: 34, image: emoji("🍎"), status: "active" },
];

export const categories = ["All", "Grocery", "Beverage", "Bakery", "Pharmacy", "Electronics", "Clothing", "Snacks"];

export const salesTrend = [
  { day: "Mon", sales: 3200, profit: 1200 },
  { day: "Tue", sales: 2800, profit: 1050 },
  { day: "Wed", sales: 4100, profit: 1600 },
  { day: "Thu", sales: 3800, profit: 1450 },
  { day: "Fri", sales: 5200, profit: 2100 },
  { day: "Sat", sales: 6100, profit: 2500 },
  { day: "Sun", sales: 4700, profit: 1900 },
];

export const paymentMethods = [
  { name: "Cash", value: 42 },
  { name: "QRIS", value: 28 },
  { name: "Debit", value: 18 },
  { name: "Credit", value: 12 },
];

export const salesByCategory = [
  { name: "Grocery", value: 3800 },
  { name: "Beverage", value: 2100 },
  { name: "Bakery", value: 1400 },
  { name: "Electronics", value: 3200 },
  { name: "Clothing", value: 2600 },
  { name: "Pharmacy", value: 900 },
];

export const topProducts = [
  { name: "Espresso Beans", sold: 128 },
  { name: "Whole Milk", sold: 96 },
  { name: "Sourdough", sold: 74 },
  { name: "Bananas", sold: 61 },
  { name: "USB-C Cable", sold: 52 },
];

export const latestTransactions = [
  { id: "#TX-1029", customer: "Walk-in", items: 4, total: 24.6, method: "Cash", time: "12:41", status: "Paid" },
  { id: "#TX-1028", customer: "Sarah Chen", items: 2, total: 82.5, method: "QRIS", time: "12:33", status: "Paid" },
  { id: "#TX-1027", customer: "Walk-in", items: 6, total: 47.2, method: "Debit", time: "12:20", status: "Paid" },
  { id: "#TX-1026", customer: "Ahmad R.", items: 1, total: 12.9, method: "Cash", time: "12:12", status: "Refunded" },
  { id: "#TX-1025", customer: "Priya S.", items: 8, total: 156.0, method: "Credit", time: "11:58", status: "Paid" },
];
