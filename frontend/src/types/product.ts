export type Product = {
  id: number;
  barcode: string | null;
  sku: string;
  name: string;
  category_id: number;
  category_name: string | null;
  brand_id: number;
  brand_name: string | null;
  unit_id: number;
  unit_name: string | null;
  cost_price: number;
  price: number;
  stock: number;
  min_stock: number;
  tax_percentage: number;
  discount_percentage: number;
  image_url: string | null;
  is_active: boolean;
  is_low_stock: boolean;
  created_at: string;
};

export type ProductListParams = {
  search?: string;
  category_id?: number | "";
  brand_id?: number | "";
  is_active?: "" | "0" | "1";
  low_stock?: "" | "1";
  sort?: "name" | "sku" | "price" | "cost_price" | "stock" | "is_active" | "created_at";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type ProductPayload = {
  barcode?: string | null;
  sku: string;
  name: string;
  category_id: number;
  brand_id: number;
  unit_id: number;
  cost_price: number;
  price: number;
  stock?: number;
  min_stock?: number;
  tax_percentage?: number;
  discount_percentage?: number;
  is_active?: boolean;
  image?: File | null;
};
