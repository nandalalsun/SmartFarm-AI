-- Clean up existing data (Safe Truncate)
TRUNCATE TABLE sale_item, payment_transaction, credit_ledger, sale, purchase, customer, product, bill_staging_queue CASCADE;

DROP TABLE IF EXISTS bill_staging_queue;
CREATE TABLE bill_staging_queue (
    id UUID PRIMARY KEY,
    image_url TEXT,
    extracted_json JSONB,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    user_id UUID
);

-- Insert Products
INSERT INTO product (id, name, category, cost_price, selling_price, unit, current_stock) VALUES
(gen_random_uuid(), 'Broiler Feed', 'FEED', 25.00, 30.00, 'BAG', 100),
(gen_random_uuid(), 'Layer Feed', 'FEED', 26.00, 31.00, 'BAG', 100),
(gen_random_uuid(), 'Antibiotics', 'MEDICINE', 10.00, 15.00, 'PIECE', 50),
(gen_random_uuid(), 'Vitamins', 'MEDICINE', 12.00, 18.00, 'PIECE', 50),
(gen_random_uuid(), 'Live Chicken', 'LIVE_CHICK', 5.00, 9.00, 'PIECE', 0);

-- Insert Customers
INSERT INTO customer (id, name, phone, address, email, customer_type, credit_limit, current_total_balance, registered_at) VALUES
(gen_random_uuid(), 'John Farmer', '5550101', '123 Farm Rd', 'john@farm.com', 'FARMER', 5000.00, 0.00, NOW()),
(gen_random_uuid(), 'Alice Butcher', '5550102', '456 Market St', 'alice@meat.com', 'BUTCHER', 2000.00, 0.00, NOW()),
(gen_random_uuid(), 'Bob Retail', '5550103', '789 Home Ln', 'bob@home.com', 'RETAIL', 500.00, 0.00, NOW());

-- Output counts
SELECT 'Products' as table_name, count(*) as count FROM product
UNION ALL
SELECT 'Customers', count(*) FROM customer;
