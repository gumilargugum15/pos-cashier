import {
  LayoutDashboard,
  ScanLine,
  Package,
  Tag,
  Award,
  Ruler,
  Users,
  Truck,
  ShoppingCart,
  Receipt,
  Warehouse,
  SlidersHorizontal,
  ArrowLeftRight,
  BarChart3,
  Wallet,
  UserCog,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  /** Permission required to see/access this item. Omit to allow any authenticated user. */
  permission?: string;
};

export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "POS / Cashier", url: "/pos", icon: ScanLine, badge: "F2", permission: "manage-sales" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/products", icon: Package, permission: "manage-products" },
      { title: "Categories", url: "/categories", icon: Tag, permission: "manage-products" },
      { title: "Brands", url: "/brands", icon: Award, permission: "manage-products" },
      { title: "Units", url: "/units", icon: Ruler, permission: "manage-products" },
      { title: "Customers", url: "/customers", icon: Users, permission: "manage-customers" },
      { title: "Suppliers", url: "/suppliers", icon: Truck, permission: "manage-suppliers" },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Purchases", url: "/purchases", icon: ShoppingCart, permission: "manage-purchases" },
      { title: "Sales", url: "/sales", icon: Receipt, permission: "manage-sales" },
      { title: "Inventory", url: "/inventory", icon: Warehouse, permission: "manage-inventory" },
      {
        title: "Stock Adjustment",
        url: "/stock-adjustment",
        icon: SlidersHorizontal,
        permission: "manage-inventory",
      },
      {
        title: "Transfer Stock",
        url: "/transfer-stock",
        icon: ArrowLeftRight,
        permission: "manage-inventory",
      },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3, permission: "view-reports" },
      { title: "Finance", url: "/finance", icon: Wallet, permission: "operate-cash-drawer" },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Users", url: "/users", icon: UserCog, permission: "manage-users" },
      { title: "Settings", url: "/settings", icon: Settings, permission: "manage-settings" },
    ],
  },
];

/** Flat map of route pathname -> required permission, derived from navGroups. */
export const routePermissions: Record<string, string> = Object.fromEntries(
  navGroups.flatMap((g) => g.items.filter((i) => i.permission).map((i) => [i.url, i.permission!])),
);
