-- Skema Database untuk Dokumen Konveksi
CREATE DATABASE IF NOT EXISTS konveksi_db;
USE konveksi_db;

-- Tabel Profil Bisnis
CREATE TABLE IF NOT EXISTS business_profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(100),
    logo LONGTEXT -- Base64 or URL
);

-- Tabel Klien
CREATE TABLE IF NOT EXISTS clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Dokumen
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- INVOICE, QUOTATION, etc
    doc_number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    client_id INT,
    opening TEXT,
    closing TEXT,
    notes TEXT,
    terms TEXT,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax DECIMAL(15, 2) DEFAULT 0,
    discount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Tabel Item Dokumen (Line Items)
CREATE TABLE IF NOT EXISTS document_items (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50),
    description TEXT,
    specifications TEXT,
    quantity DECIMAL(10, 2),
    unit VARCHAR(20),
    price DECIMAL(15, 2),
    total DECIMAL(15, 2),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Tabel Section Dokumen (Untuk Kontrak/NDA - Pasal-pasal)
CREATE TABLE IF NOT EXISTS document_sections (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50),
    title VARCHAR(255),
    content TEXT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Data Default Profil
INSERT INTO business_profile (id, name, owner_name, address, phone, email) 
VALUES (1, 'BISNIS KONVEKSI SAYA', 'PEMILIK BISNIS', 'Jl. Industri Kreatif No. 123, Bandung', '0812-3456-7890', 'info@konveksi.com')
ON DUPLICATE KEY UPDATE name=name;
