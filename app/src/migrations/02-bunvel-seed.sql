-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES
('Ani', 'ani@example.com'),
('Ravi', 'ravi@example.com'),
('Sana', 'sana@example.com');


-- ===========================
-- CATEGORY
-- ===========================
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

INSERT INTO category (name, description) VALUES
('Electronics', 'Devices and gadgets'),
('Books', 'Printed and digital books'),
('Clothing', 'Wearable items');


-- ===========================
-- PRODUCTS
-- ===========================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (name, price, category_id) VALUES
('Laptop', 85000.00, 1),
('Smartphone', 45000.00, 1),
('Novel - The Lost City', 499.00, 2),
('T-Shirt', 699.00, 3);


-- ===========================
-- ORDERS
-- ===========================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO orders (user_id, product_id, quantity, total_price, status) VALUES
(1, 1, 1, 85000.00, 'completed'),
(2, 3, 2, 998.00, 'pending'),
(3, 4, 1, 699.00, 'completed'),
(1, 2, 1, 45000.00, 'pending');


-- ===========================
-- LOGS (HEAVY DATA FOR TESTING)
-- ===========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    level TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    request_id UUID DEFAULT gen_random_uuid(),
    latency_ms INTEGER,
    extra_col_01 TEXT,
    extra_col_02 TEXT,
    extra_col_03 TEXT,
    extra_col_04 TEXT,
    extra_col_05 TEXT,
    extra_col_06 TEXT,
    extra_col_07 TEXT,
    extra_col_08 TEXT,
    extra_col_09 TEXT,
    extra_col_10 TEXT
);

-- SAFE INSERT — user_id always valid
INSERT INTO logs (
    user_id, action, level, ip_address, user_agent, metadata, latency_ms,
    extra_col_01, extra_col_02, extra_col_03, extra_col_04, extra_col_05,
    extra_col_06, extra_col_07, extra_col_08, extra_col_09, extra_col_10
)
SELECT
    (SELECT id FROM users ORDER BY random() LIMIT 1) AS user_id,
    (ARRAY['login', 'logout', 'create_order', 'view_product', 'update_profile'])[floor(random()*5)+1] AS action,
    (ARRAY['info', 'warning', 'error'])[floor(random()*3)+1] AS level,
    ('192.168.1.' || (RANDOM() * 255)::int)::inet,
    'Mozilla/5.0 (X11; Linux x86_64)' AS user_agent,
    jsonb_build_object(
        'session', md5(random()::text),
        'path', (ARRAY['/home','/product','/order','/profile'])[floor(random()*4)+1]
    ),
    (RANDOM() * 500)::int AS latency_ms,
    md5(random()::text), md5(random()::text), md5(random()::text),
    md5(random()::text), md5(random()::text), md5(random()::text),
    md5(random()::text), md5(random()::text), md5(random()::text), md5(random()::text)
FROM generate_series(1, 5000);
