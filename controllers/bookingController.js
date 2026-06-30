const db = require('../config/db');

// Map frontend service string values to database id_layanan (1 to 9)
const talentMapping = {
  'Tilawah': 1,
  'Shalawat': 2,
  'Syarhil': 3,
  'Hadrah': 4,
  'Marawis': 5,
  'Qasidah': 6,
  'Tahfiz': 7,
  'Kaligrafi': 8,
  'MC': 9
};

exports.createBooking = async (req, res, next) => {
  const {
    nama_pemohon,
    instansi,
    kontak,
    email,
    nama_acara,
    tanggal_acara,
    lokasi,
    catatan,
    layanan
  } = req.body;

  // Basic Validation
  if (!nama_pemohon || !kontak || !nama_acara || !tanggal_acara || !lokasi || !layanan || !Array.isArray(layanan) || layanan.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Semua kolom wajib diisi dengan benar dan harus memilih minimal satu layanan.'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    // Start Transaction
    await connection.beginTransaction();

    // 1. Generate Unique Booking Number
    // Format: HQM-YYYYMMDD-[4 Digit Random]
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    const no_booking = `HQM-${todayStr}-${randSuffix}`;

    // 2. Format custom note with "Lainnya" text if provided
    let finalCatatan = catatan || '';
    const otherLayananText = req.body.layanan_lainnya;
    if (otherLayananText && otherLayananText.trim()) {
      finalCatatan = `[Layanan Kustom / Lainnya: ${otherLayananText.trim()}]\n${finalCatatan}`;
    }

    // 3. Insert into Tabel_Booking
    const [bookingResult] = await connection.query(
      `INSERT INTO Tabel_Booking (no_booking, nama_pemohon, kontak, email, instansi, nama_acara, tanggal_acara, lokasi, catatan, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')`,
      [no_booking, nama_pemohon, kontak, email || null, instansi || null, nama_acara, tanggal_acara, lokasi, finalCatatan]
    );

    const bookingId = bookingResult.insertId;

    // 4. Map and Insert into Tabel_BookingLayanan (Junction Table)
    for (const item of layanan) {
      // Map frontend value (e.g. 'Tilawah') to DB id_layanan
      const mappedId = talentMapping[item];
      if (mappedId) {
        await connection.query(
          'INSERT INTO Tabel_BookingLayanan (id_booking, id_layanan) VALUES (?, ?)',
          [bookingId, mappedId]
        );
      }
    }

    // Commit Transaction
    await connection.commit();

    res.status(201).json({
      status: 'success',
      message: 'Booking berhasil disimpan di database.',
      data: {
        no_booking
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
