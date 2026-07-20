import { apiClient, type ApiSuccess, type ApiSuccessPaginated } from "@/lib/api-client";
import type { Product, ProductListParams, ProductPayload } from "@/types/product";
import type { PaginatedResponse } from "@/types/common";

function buildFormData(payload: ProductPayload): FormData {
  const formData = new FormData();

  formData.append("sku", payload.sku);
  formData.append("name", payload.name);
  formData.append("category_id", String(payload.category_id));
  formData.append("brand_id", String(payload.brand_id));
  formData.append("unit_id", String(payload.unit_id));
  formData.append("cost_price", String(payload.cost_price));
  formData.append("price", String(payload.price));

  if (payload.barcode) formData.append("barcode", payload.barcode);
  if (payload.stock !== undefined) formData.append("stock", String(payload.stock));
  if (payload.min_stock !== undefined) formData.append("min_stock", String(payload.min_stock));
  if (payload.tax_percentage !== undefined)
    formData.append("tax_percentage", String(payload.tax_percentage));
  if (payload.discount_percentage !== undefined) {
    formData.append("discount_percentage", String(payload.discount_percentage));
  }
  if (payload.is_active !== undefined) formData.append("is_active", payload.is_active ? "1" : "0");
  if (payload.image) formData.append("image", payload.image);

  return formData;
}

export async function listProducts(params: ProductListParams): Promise<PaginatedResponse<Product>> {
  const { data } = await apiClient.get<ApiSuccessPaginated<Product>>("/products", { params });
  return { data: data.data, meta: data.meta };
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<ApiSuccess<Product>>("/products", buildFormData(payload));
  return data.data;
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const formData = buildFormData(payload);
  formData.append("_method", "PUT");
  const { data } = await apiClient.post<ApiSuccess<Product>>(`/products/${id}`, formData);
  return data.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
