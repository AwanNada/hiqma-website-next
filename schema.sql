-- Script Schema Database untuk Website Resmi UKM HIQMA UIN Jakarta
-- DBMS: MySQL / MariaDB

CREATE DATABASE IF NOT EXISTS db_hiqma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_hiqma;

-- ==========================================
-- 1. TABEL ADMIN
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. TABEL ANGGOTA
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Anggota (
    id_anggota INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    nim VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- password terenkripsi (bcrypt/argon2)
    jurusan VARCHAR(100) NOT NULL,
    angkatan INT NOT NULL,
    no_telepon VARCHAR(20) NULL,
    foto VARCHAR(255) NULL DEFAULT 'default_profile.jpg',
    status ENUM('Aktif', 'Alumni', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. TABEL DIVISI
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Divisi (
    id_divisi INT AUTO_INCREMENT PRIMARY KEY,
    nama_divisi VARCHAR(100) UNIQUE NOT NULL,
    deskripsi TEXT NULL,
    foto VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. TABEL ANGGOTA_DIVISI (Junction Table Many-to-Many)
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Anggota_Divisi (
    id_anggota INT NOT NULL,
    id_divisi INT NOT NULL,
    PRIMARY KEY (id_anggota, id_divisi),
    FOREIGN KEY (id_anggota) REFERENCES Tabel_Anggota(id_anggota) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_divisi) REFERENCES Tabel_Divisi(id_divisi) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. TABEL LAYANAN TALENT
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_LayananTalent (
    id_layanan INT AUTO_INCREMENT PRIMARY KEY,
    nama_layanan VARCHAR(100) UNIQUE NOT NULL,
    deskripsi TEXT NULL,
    tersedia BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. TABEL BOOKING
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Booking (
    id_booking INT AUTO_INCREMENT PRIMARY KEY,
    no_booking VARCHAR(50) UNIQUE NOT NULL,
    nama_pemohon VARCHAR(150) NOT NULL,
    kontak VARCHAR(50) NOT NULL, -- email/no.whatsapp pemohon
    instansi VARCHAR(150) NULL,
    nama_acara VARCHAR(150) NOT NULL,
    tanggal_acara DATE NOT NULL,
    lokasi TEXT NOT NULL,
    catatan TEXT NULL,
    status ENUM('Menunggu', 'Diproses', 'Diterima', 'Ditolak', 'Selesai') DEFAULT 'Menunggu',
    catatan_admin TEXT NULL,
    tgl_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. TABEL BOOKING LAYANAN (Junction Table Many-to-Many)
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_BookingLayanan (
    id_booking INT NOT NULL,
    id_layanan INT NOT NULL,
    PRIMARY KEY (id_booking, id_layanan),
    FOREIGN KEY (id_booking) REFERENCES Tabel_Booking(id_booking) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_layanan) REFERENCES Tabel_LayananTalent(id_layanan) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. TABEL PUBLIKASI
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Publikasi (
    id_publikasi INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi LONGTEXT NOT NULL,
    tgl_terbit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    kategori VARCHAR(100) NOT NULL, -- e.g., 'Berita', 'Artikel', 'Pengumuman'
    thumbnail VARCHAR(255) NULL,
    status ENUM('Draft', 'Published') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. TABEL GALERI
-- ==========================================
CREATE TABLE IF NOT EXISTS Tabel_Galeri (
    id_galeri INT AUTO_INCREMENT PRIMARY KEY,
    nama_kegiatan VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    keterangan TEXT NULL,
    tgl_kegiatan DATE NOT NULL,
    tipe ENUM('Foto', 'Video') DEFAULT 'Foto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- QUERY INSERT DATA AWAL (SEEDS)
-- ==========================================

-- Data Awal Tabel_Divisi
INSERT INTO Tabel_Divisi (nama_divisi, deskripsi, foto) VALUES
('Tilawah', 'Divisi seni melantunkan ayat suci Al-Qur''an dengan keindahan lagu (nagham) dan tajwid yang benar.', 'divisi_tilawah.jpg'),
('Shalawat', 'Divisi seni tarik suara islami yang fokus pada pujian-pujian kepada Nabi Muhammad SAW.', 'divisi_shalawat.jpg'),
('Syarhil Qur''an', 'Divisi penyampaian pesan-pesan Al-Qur''an melalui kolaborasi pidato, tilawah, dan puitisasi terjemah.', 'divisi_syarhil.jpg'),
('Hadrah', 'Divisi seni rebana klasik dengan lantunan syair-syair pujian islami berirama dinamis.', 'divisi_hadrah.jpg'),
('Marawis', 'Divisi seni musik perkusi islami yang khas dengan tempo cepat dan enerjik.', 'divisi_marawis.jpg'),
('Qasidah', 'Divisi seni musik vokal dan instrumental khas Timur Tengah dengan pesan-pesan dakwah.', 'divisi_qasidah.jpg'),
('Tahfiz', 'Divisi bimbingan hafalan Al-Qur''an dan pendalaman makna ayat-ayat suci.', 'divisi_tahfiz.jpg'),
('Kaligrafi', 'Divisi seni menulis indah ayat-ayat Al-Qur''an dengan berbagai kaidah khat arab.', 'divisi_kaligrafi.jpg'),
('MC', 'Divisi public speaking yang fokus pada pelatihan pemandu acara formal maupun non-formal.', 'divisi_mc.jpg')
ON DUPLICATE KEY UPDATE deskripsi = VALUES(deskripsi);

-- Data Awal Tabel_LayananTalent
INSERT INTO Tabel_LayananTalent (nama_layanan, deskripsi, tersedia) VALUES
('Tilawah', 'Pelayanan qari'' dan qari''ah untuk pembacaan ayat suci Al-Qur''an di berbagai acara formal maupun non-formal.', TRUE),
('Shalawat', 'Penampilan tim paduan suara shalawat untuk memeriahkan dan memberikan keberkahan acara Anda.', TRUE),
('Syarhil Qur''an', 'Penampilan tim Syarhil Qur''an yang siap menyampaikan pesan dakwah interaktif (3 orang: Qari, Penterjemah, Syarah).', TRUE),
('Hadrah', 'Penampilan tim Hadrah lengkap untuk mengiringi prosesi pernikahan, pengajian, dan acara hari besar Islam.', TRUE),
('Marawis', 'Penampilan tim Marawis dinamis untuk memeriahkan penyambutan tamu, walimah, atau festival.', TRUE),
('Qasidah', 'Penampilan tim seni musik Qasidah untuk mengisi acara panggung dakwah maupun hajatan keluarga.', TRUE),
('Tahfiz', 'Pelayanan tasmi'' Al-Qur''an atau doa hafidz/hafidzah untuk kelancaran acara syukuran.', TRUE),
('Kaligrafi', 'Pembuatan dekorasi kaligrafi langsung di lokasi acara (Live Writing) atau pemesanan karya seni kaligrafi eksklusif.', TRUE),
('MC', 'Pelayanan pembawa acara (master of ceremony) berkemampuan publik speaking islami dan bilingual untuk memandu jalannya acara.', TRUE)
ON DUPLICATE KEY UPDATE deskripsi = VALUES(deskripsi);
