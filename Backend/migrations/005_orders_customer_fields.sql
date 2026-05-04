-- Backend/migrations/005_orders_customer_fields.sql
ALTER TABLE orders
  ADD COLUMN customer_telefono VARCHAR(30) NULL AFTER customer_email,
  ADD COLUMN customer_message TEXT NULL AFTER customer_telefono;
