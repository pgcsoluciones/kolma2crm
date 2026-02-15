-- KOLMA2 CRM - FASE A: Tablas Core

-- 1. PLANES DE SUSCRIPCION
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_setup INTEGER NOT NULL DEFAULT 0,
    conversation_limit INTEGER NOT NULL,
    features TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. SUPER ADMINS
CREATE TABLE IF NOT EXISTS super_admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. STORES (Colmados)
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);

-- 4. SUSCRIPCIONES
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    setup_paid INTEGER DEFAULT 0,
    setup_paid_at TEXT,
    current_period_start TEXT,
    current_period_end TEXT,
    conversations_used INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- 5. PAGOS
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    subscription_id TEXT,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    reference TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 6. USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'owner',
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 7. CLIENTES
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    neighborhood TEXT,
    notes TEXT,
    credit_limit REAL DEFAULT 0,
    current_debt REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE INDEX IF NOT EXISTS idx_clients_store ON clients(store_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- 8. FIADOS
CREATE TABLE IF NOT EXISTS fiados (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('CHARGE', 'PAYMENT')),
    balance REAL NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE INDEX IF NOT EXISTS idx_fiados_client ON fiados(client_id);

-- DATOS INICIALES: Planes
INSERT OR IGNORE INTO plans (id, name, display_name, price_monthly, price_setup, conversation_limit, features) VALUES
('plan_basic', 'basic', 'Basico', 1950, 4900, 300, '{"whatsapp":true,"sales_agent":false}'),
('plan_professional', 'professional', 'Profesional', 3500, 4900, 1200, '{"whatsapp":true,"sales_agent":true,"tickets":true}'),
('plan_enterprise', 'enterprise', 'Empresa', 9900, 4900, 5000, '{"whatsapp":true,"sales_agent":true,"api":true}');

-- DATOS INICIALES: Super Admin (password: admin123)
INSERT OR IGNORE INTO super_admins (id, email, password, name) VALUES
('sa_001', 'admin@kolma2crm.com', 'admin123', 'Super Admin');