// src/lib/product.ts

const API_BASE = 'http://localhost:8001/api/products';

export interface Product {
  id: number;
  name: string;
  description: string;
  type: string; // Should match ProductType enum
  commission_rate: number;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  description: string;
  type: string;
  commission_rate: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  type?: string;
  commission_rate?: number;
}

export interface PremiumCalculation {
  premium: number;
}

// Get all products
export async function getProducts(skip = 0, limit = 100): Promise<Product[]> {
  const res = await fetch(`${API_BASE}?skip=${skip}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
}

// Get a single product
export async function getProduct(productId: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/${productId}`);
  if (!res.ok) throw new Error('Product not found');
  return await res.json();
}

// Create a new product
export async function createProduct(data: ProductCreate): Promise<Product> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return await res.json();
}

// Update an existing product
export async function updateProduct(productId: number, data: ProductUpdate): Promise<Product> {
  const res = await fetch(`${API_BASE}/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return await res.json();
}

// Calculate premium
export async function calculatePremium(
  productId: number,
  zone_id: number,
  fiscal_year: number,
  period_id: number,
  growing_season_id: number
): Promise<PremiumCalculation> {
  const url = `${API_BASE}/${productId}/calculate-premium?zone_id=${zone_id}&fiscal_year=${fiscal_year}&period_id=${period_id}&growing_season_id=${growing_season_id}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to calculate premium');
  return await res.json();
}
