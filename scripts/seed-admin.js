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

    // Clear existing data for fresh seed
    console.log('Clearing old publications and gallery items...');
    await connection.query('DELETE FROM Tabel_Publikasi');
    await connection.query('DELETE FROM Tabel_Galeri');

    // 2. Seed Initial Articles/News
    console.log('Creating initial dummy articles...');
    const dummyArticles = [
      {
        judul: 'HIQMA UIN Jakarta Gelar Halal Bihalal Lintas Generasi, Mempererat Ukhuwah Qur’ani Usai Ramadhan',
        isi: '<p>Himpunan Qari dan Qariah Mahasiswa (HIQMA) UIN Syarif Hidayatullah Jakarta sukses menggelar Halal Bihalal bertema “Meneguhkan Ukhuwah Qur’ani, Menguatkan Silaturahmi Lintas Generasi” di Aula Madya UIN Jakarta. Acara ini sekaligus menandai penutupan rangkaian program “Cahaya Ramadhan” yang diikuti anggota aktif dan alumni HIQMA dari berbagai angkatan.</p><p>Ketua Umum HIQMA, Muhammad Haikal Hibrizi, menegaskan bahwa Halal Bihalal bukan sekadar tradisi, melainkan sarana menyucikan diri dan memperbaiki hubungan antarmanusia. Senada, Dewan Pembina Organisasi (DPO) Hakim Widanul Ula berharap semangat saling memaafkan tidak hanya muncul saat Lebaran, tetapi menjadi kebiasaan dalam keseharian. Pembina HIQMA, Ustazah Dr. Hj. Yuminah Rohmatullah, M.B.A., M.A., pun menyampaikan harapan agar kepengurusan HIQMA ke depan semakin solid dan berkontribusi lebih besar bagi sivitas akademika UIN Jakarta.</p><p>Acara diramaikan dengan haflah tilawah, penampilan divisi perkusi dan gambus EL-HIQMA, serta sesi games interaktif. Puncak kegiatan adalah dua sesi sharing session. Ustadz Drs. KH. Syarifuddin Muhammad, M.M. menekankan bahwa siapa pun yang memuliakan Al-Qur’an akan dimuliakan oleh Al-Qur’an itu sendiri, dan mengajak peserta untuk tidak berhenti di membaca, melainkan mengamalkan serta menyebarkan nilai-nilainya.</p><p>Sesi kedua menghadirkan K.H. Mahsun Salim, M.A., RFA, salah satu pendiri HIQMA, yang berbagi kisah berdirinya organisasi sebagai wadah nyata pengembangan qari dan qariah di lingkungan kampus. Ia mengingatkan seluruh anggota agar tidak melupakan ruh awal pendirian HIQMA di tengah perkembangannya yang kini telah memiliki delapan divisi. Alumni HIQMA, Ustadz Muhammad Hafidz Adrian, S.Sos., CPSM., CIHC, menambahkan bahwa ketenangan hidup berbanding lurus dengan kedekatan seseorang terhadap Al-Qur’an.</p><p>Acara ditutup dengan doa bersama, penyerahan sertifikat, dan pembagian doorprize. HIQMA UIN Jakarta berharap semangat silaturahmi dan kecintaan terhadap Al-Qur’an yang tumbuh dalam momen ini terus terpelihara dalam kehidupan sehari-hari seluruh anggotanya.</p>',
        kategori: 'Berita',
        status: 'Published',
        thumbnail: '/uploads/halal-bihalal.jpg'
      },
      {
        judul: 'Pelantikan Pengurus Baru HIQMA UIN Jakarta Kabinet Ashfiya Bakti 2026',
        isi: '<p>Pelantikan kepengurusan baru berlangsung dengan khidmat di Student Center UIN Jakarta. Kepengurusan resmi disahkan dengan mengusung spirit perubahan dan pemasyarakatan Al-Qur\'an.</p>',
        kategori: 'Pengumuman',
        status: 'Published',
        thumbnail: null
      },
      {
        judul: 'Qari Delegasi HIQMA Raih Juara 1 MTQ Mahasiswa Tingkat Regional',
        isi: '<p>Kader terbaik divisi Tilawah kembali membanggakan nama almamater dengan menyabet gelar qari terbaik dalam ajang kompetisi seni Al-Qur\'an antar perguruan tinggi.</p>',
        kategori: 'Berita',
        status: 'Published',
        thumbnail: null
      },
      {
        judul: 'Keutamaan Membaca Al-Qur\'an secara Tartil dan Tajwid yang Benar',
        isi: '<p>Membaca Al-Qur\'an dengan tartil merupakan perintah agama untuk menghayati makna terdalam di balik baris kalimat kalam ilahi, sekaligus mendatangkan berkah.</p>',
        kategori: 'Artikel',
        status: 'Published',
        thumbnail: null
      }
    ];

    for (const art of dummyArticles) {
      await connection.query(
        'INSERT INTO Tabel_Publikasi (judul, isi, kategori, status, thumbnail) VALUES (?, ?, ?, ?, ?)',
        [art.judul, art.isi, art.kategori, art.status, art.thumbnail]
      );
    }
    console.log('Initial dummy articles seeded successfully.');

    // 3. Seed Initial Gallery Items
    console.log('Seeding initial gallery items...');
    const dummyGallery = [
      {
        nama_kegiatan: 'Halal Bihalal Keluarga Besar HIQMA 2026',
        file_url: '/uploads/halal-bihalal.jpg',
        keterangan: 'Foto bersama seluruh pengurus, anggota aktif, dan para alumni lintas generasi dalam acara Halal Bihalal Kabinet Ashfiya.',
        tgl_kegiatan: '2026-05-10',
        tipe: 'Foto'
      }
    ];

    for (const item of dummyGallery) {
      await connection.query(
        'INSERT INTO Tabel_Galeri (nama_kegiatan, file_url, keterangan, tgl_kegiatan, tipe) VALUES (?, ?, ?, ?, ?)',
        [item.nama_kegiatan, item.file_url, item.keterangan, item.tgl_kegiatan, item.tipe]
      );
    }
    console.log('Initial gallery items seeded successfully.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    if (connection) connection.release();
    db.end();
  }
}

seed();
