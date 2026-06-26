const db = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('Starting database seeding...');
  let connection;
  try {
    connection = await db.getConnection();

    // 1. Seed Admin Account
    console.log('Checking Tabel_Admin...');
    const [admins] = await connection.query('SELECT * FROM Tabel_Admin LIMIT 1');
    if (admins.length === 0) {
      console.log('No admin found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('hiqma2026', 10);
      await connection.query(
        'INSERT INTO Tabel_Admin (nama, email, password) VALUES (?, ?, ?)',
        ['Administrator HIQMA', 'admin@hiqma.org', hashedPassword]
      );
      console.log('Default admin created successfully: admin@hiqma.org / hiqma2026');
    } else {
      console.log('Admin account already exists. Skipping...');
    }

    // 2. Seed Initial Articles/News
    console.log('Checking Tabel_Publikasi...');
    const [articles] = await connection.query('SELECT * FROM Tabel_Publikasi LIMIT 1');
    if (articles.length === 0) {
      console.log('No publications found. Creating initial dummy articles...');
      const dummyArticles = [
        {
          judul: 'Pelantikan Pengurus Baru HIQMA UIN Jakarta Kabinet Ashfiya Bakti 2026',
          isi: 'Pelantikan kepengurusan baru berlangsung dengan khidmat di Student Center UIN Jakarta. Kepengurusan resmi disahkan dengan mengusung spirit perubahan dan pemasyarakatan Al-Qur\'an.',
          kategori: 'Pengumuman',
          status: 'Published'
        },
        {
          judul: 'Qari Delegasi HIQMA Raih Juara 1 MTQ Mahasiswa Tingkat Regional',
          isi: 'Kader terbaik divisi Tilawah kembali membanggakan nama almamater dengan menyabet gelar qari terbaik dalam ajang kompetisi seni Al-Qur\'an antar perguruan tinggi.',
          kategori: 'Berita',
          status: 'Published'
        },
        {
          judul: 'Safari Ramadhan 1447 H: Tebar Keberkahan dengan Tasmi\' Al-Qur\'an',
          isi: 'HIQMA sukses merampungkan rangkaian Safari Ramadhan dengan mengadakan pengajian umum, bakti sosial, serta penampilan tim seni islami di wilayah Jabodetabek.',
          kategori: 'Berita',
          status: 'Published'
        },
        {
          judul: 'Keutamaan Membaca Al-Qur\'an secara Tartil dan Tajwid yang Benar',
          isi: 'Membaca Al-Qur\'an dengan tartil merupakan perintah agama untuk menghayati makna terdalam di balik baris kalimat kalam ilahi, sekaligus mendatangkan berkah.',
          kategori: 'Artikel',
          status: 'Published'
        }
      ];

      for (const art of dummyArticles) {
        await connection.query(
          'INSERT INTO Tabel_Publikasi (judul, isi, kategori, status) VALUES (?, ?, ?, ?)',
          [art.judul, art.isi, art.kategori, art.status]
        );
      }
      console.log('Initial dummy articles seeded successfully.');
    } else {
      console.log('Publications already exist. Skipping...');
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    if (connection) connection.release();
    // Close the DB pool to allow the script to exit
    db.end();
  }
}

seed();
