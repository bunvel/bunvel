-- PostgreSQL E-commerce Sample Data

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================
-- ENUMS
-- =====================================
CREATE TYPE order_status AS ENUM ('pending','paid','shipped','cancelled');
CREATE TYPE payment_status AS ENUM ('pending','paid','failed');

-- =====================================
-- TABLES
-- =====================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) CHECK (price >= 0),
    category_id INT REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory (
    product_id INT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    stock INT CHECK (stock >= 0) DEFAULT 0
);

CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    address_line TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    zip_code VARCHAR(20)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10,2) CHECK (total >= 0) DEFAULT 0,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity > 0),
    price NUMERIC(10,2) CHECK (price >= 0)
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50),
    amount NUMERIC(10,2) CHECK (amount >= 0),
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount NUMERIC(5,2) CHECK (discount >= 0),
    valid_until DATE
);

-- =====================================
-- INDEXES
-- =====================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_inventory_low_stock ON inventory(stock) WHERE stock < 10;

-- =====================================
-- VIEWS
-- =====================================
CREATE VIEW user_order_summary AS
SELECT u.id AS user_id,
       u.name,
       u.email,
       COUNT(o.id) AS total_orders,
       COALESCE(SUM(o.total),0) AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

CREATE VIEW product_sales_summary AS
SELECT p.id AS product_id,
       p.name,
       COALESCE(SUM(oi.quantity),0) AS total_sold,
       COALESCE(SUM(oi.price * oi.quantity),0) AS total_revenue
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id;

-- =====================================
-- MATERIALIZED VIEW
-- =====================================
CREATE MATERIALIZED VIEW top_selling_products AS
SELECT p.id AS product_id,
       p.name,
       SUM(oi.quantity) AS total_sold
FROM products p
JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;

CREATE UNIQUE INDEX idx_top_selling_products
ON top_selling_products(product_id);

-- =====================================
-- FUNCTIONS
-- =====================================
CREATE OR REPLACE FUNCTION calculate_order_total(o_id INT)
RETURNS NUMERIC AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(quantity * price)
         FROM order_items
         WHERE order_id = o_id),
        0
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_coupon(o_id INT, c_code VARCHAR)
RETURNS VOID AS $$
DECLARE
    discount_value NUMERIC;
BEGIN
    SELECT discount INTO discount_value
    FROM coupons
    WHERE code = c_code AND valid_until >= CURRENT_DATE
    LIMIT 1;

    IF discount_value IS NOT NULL THEN
        UPDATE orders
        SET total = GREATEST(total - discount_value, 0)
        WHERE id = o_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- TRIGGERS
-- =====================================

CREATE OR REPLACE FUNCTION update_inventory()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INT;
BEGIN
    SELECT stock
    INTO current_stock
    FROM inventory
    WHERE product_id = NEW.product_id
    FOR UPDATE;

    IF current_stock IS NULL THEN
        RAISE EXCEPTION 'Inventory not found for product %', NEW.product_id;
    END IF;

    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product % (available %, requested %)',
            NEW.product_id, current_stock, NEW.quantity;
    END IF;

    UPDATE inventory
    SET stock = stock - NEW.quantity
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory
BEFORE INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory();

CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total = calculate_order_total(NEW.order_id)
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

-- =====================================
-- SAMPLE DATA
-- =====================================

INSERT INTO users(name, email, password)
SELECT 'User ' || g,
       'user' || g || '@example.com',
       encode(gen_random_bytes(8),'hex')
FROM generate_series(1,1000) g;

INSERT INTO categories(name, description) VALUES
('Electronics','Electronic gadgets'),
('Clothing','Apparel'),
('Home','Home products'),
('Books','Books');

INSERT INTO products(name, description, price, category_id)
SELECT 'Product ' || g,
       'Description ' || g,
       (RANDOM()*100 + 1)::NUMERIC(10,2),
       (g % 4 + 1)
FROM generate_series(1,500) g;

INSERT INTO inventory(product_id, stock)
SELECT id, (RANDOM()*100)::INT + 50 FROM products;

INSERT INTO orders(user_id)
SELECT (RANDOM()*999 + 1)::INT
FROM generate_series(1,5000);

-- Disable inventory trigger for bulk load
ALTER TABLE order_items DISABLE TRIGGER trg_update_inventory;

DO $$
DECLARE
    o RECORD;
    p RECORD;
BEGIN
    FOR o IN SELECT id FROM orders LOOP
        FOR p IN SELECT id, price FROM products ORDER BY RANDOM() LIMIT (RANDOM()*5 + 1)::INT LOOP
            INSERT INTO order_items(order_id, product_id, quantity, price)
            VALUES (o.id, p.id, (RANDOM()*3 + 1)::INT, p.price);
        END LOOP;
    END LOOP;
END $$;

ALTER TABLE order_items ENABLE TRIGGER trg_update_inventory;

UPDATE orders SET total = calculate_order_total(id);

INSERT INTO payments(order_id, payment_method, amount, status, paid_at)
SELECT id, 'card', total, 'paid', NOW()
FROM orders
WHERE total > 0;

UPDATE orders SET status = 'paid'
WHERE id IN (SELECT order_id FROM payments WHERE status = 'paid');

WITH unique_pairs AS (
    SELECT o.user_id, oi.product_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.user_id, oi.product_id
    ORDER BY RANDOM()
    LIMIT 3000
)
INSERT INTO reviews(user_id, product_id, rating, comment)
SELECT user_id, product_id, (RANDOM()*4)::INT + 1, 'Good product'
FROM unique_pairs;

INSERT INTO coupons(code, discount, valid_until) VALUES
('SAVE10', 10, CURRENT_DATE + 30),
('SAVE20', 20, CURRENT_DATE + 30);

DELETE FROM orders
WHERE id NOT IN (SELECT DISTINCT order_id FROM order_items);

REFRESH MATERIALIZED VIEW top_selling_products;

-- =====================================
-- DONE
-- =====================================
