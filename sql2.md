
-- =========================================================
-- Tambahan varian produk brand "Better" (brand_id = 42)
-- =========================================================
INSERT INTO warung_epon_db.products
(id, barcode, sku, name, category_id, brand_id, unit_id, cost_price, price, stock, min_stock, tax_percentage, discount_percentage, image_path, is_active, created_at, updated_at, deleted_at)
VALUES
(82, '8990000000082', 'B-0082', 'Better Sandwich Biscuit Cokelat 380gr', 4, 42, 5, 13000.00, 16000.00, 60, 10, 11.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL),
(83, '8990000000083', 'B-0083', 'Better Sandwich Biscuit Vanila 380gr', 4, 42, 5, 13000.00, 16000.00, 55, 10, 11.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL),
(84, '8990000000084', 'B-0084', 'Better Sandwich Biscuit Renceng (isi 10 sachet)', 4, 42, 7, 8000.00, 10000.00, 40, 5, 11.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL),
(85, '8990000000085', 'MB-0085', 'Muuch Better Sandwich Biscuit 274gr', 4, 42, 5, 11000.00, 14000.00, 48, 10, 11.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL);


-- =========================================================
-- Tambahan varian produk brand "Chitato" (brand_id = 38)
-- =========================================================
INSERT INTO warung_epon_db.products
(id, barcode, sku, name, category_id, brand_id, unit_id, cost_price, price, stock, min_stock, tax_percentage, discount_percentage, image_path, is_active, created_at, updated_at, deleted_at)
VALUES
(86, '8990000000086', 'C-0086', 'Chitato Ayam Bumbu 68gr', 4, 38, 1, 8000.00, 10000.00, 65, 5, 0.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL),
(87, '8990000000087', 'C-0087', 'Chitato Indomie Goreng 68gr', 4, 38, 1, 8500.00, 11000.00, 58, 5, 0.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL),
(88, '8990000000088', 'C-0088', 'Chitato Rasa Rendang 68gr', 4, 38, 1, 8500.00, 11000.00, 42, 5, 0.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL),
(89, '8990000000089', 'CL-0089', 'Chitato Lite Sapi Panggang 68gr', 4, 38, 1, 7500.00, 9500.00, 50, 5, 0.00, 0.00, '', 1, '2026-07-21 12:42:56', '2026-07-21 12:42:56', NULL);