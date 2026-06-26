const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to delete a file
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(__dirname, '..', 'public', filePath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error(`Failed to delete file: ${fullPath}`, err);
      }
    });
  }
};

// 1. Get published publications (for public website)
exports.getPublished = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      'SELECT id_publikasi, judul, isi, tgl_terbit, kategori, thumbnail, created_at FROM Tabel_Publikasi WHERE status = ? ORDER BY tgl_terbit DESC',
      ['Published']
    );
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// 2. Get all publications (for admin dashboard)
exports.getAll = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      'SELECT id_publikasi, judul, isi, tgl_terbit, kategori, thumbnail, status, created_at FROM Tabel_Publikasi ORDER BY created_at DESC'
    );
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// 3. Create a publication (admin only)
exports.create = async (req, res, next) => {
  const { judul, isi, kategori, status } = req.body;
  const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;

  if (!judul || !isi || !kategori) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      deleteFile(`/uploads/${req.file.filename}`);
    }
    return res.status(400).json({
      status: 'error',
      message: 'Judul, isi, dan kategori wajib diisi'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO Tabel_Publikasi (judul, isi, kategori, thumbnail, status) VALUES (?, ?, ?, ?, ?)',
      [judul, isi, kategori, thumbnail, status || 'Draft']
    );

    res.status(201).json({
      status: 'success',
      message: 'Publikasi berhasil dibuat',
      data: {
        id_publikasi: result.insertId,
        judul,
        kategori,
        thumbnail,
        status: status || 'Draft'
      }
    });
  } catch (error) {
    if (req.file) {
      deleteFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// 4. Update a publication (admin only)
exports.update = async (req, res, next) => {
  const { id } = req.params;
  const { judul, isi, kategori, status } = req.body;
  let thumbnail = null;

  if (!judul || !isi || !kategori) {
    if (req.file) {
      deleteFile(`/uploads/${req.file.filename}`);
    }
    return res.status(400).json({
      status: 'error',
      message: 'Judul, isi, dan kategori wajib diisi'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // Fetch existing publication to get current thumbnail
    const [rows] = await connection.query('SELECT thumbnail FROM Tabel_Publikasi WHERE id_publikasi = ?', [id]);
    if (rows.length === 0) {
      if (req.file) {
        deleteFile(`/uploads/${req.file.filename}`);
      }
      return res.status(404).json({
        status: 'error',
        message: 'Publikasi tidak ditemukan'
      });
    }

    const currentPub = rows[0];

    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
      // Delete old thumbnail if a new one is uploaded
      if (currentPub.thumbnail) {
        deleteFile(currentPub.thumbnail);
      }
    } else {
      // Keep existing thumbnail if no new one is uploaded
      thumbnail = currentPub.thumbnail;
    }

    await connection.query(
      'UPDATE Tabel_Publikasi SET judul = ?, isi = ?, kategori = ?, thumbnail = ?, status = ? WHERE id_publikasi = ?',
      [judul, isi, kategori, thumbnail, status, id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Publikasi berhasil diperbarui',
      data: {
        id_publikasi: id,
        judul,
        kategori,
        thumbnail,
        status
      }
    });
  } catch (error) {
    if (req.file) {
      deleteFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// 5. Delete a publication (admin only)
exports.delete = async (req, res, next) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await db.getConnection();

    // Fetch existing publication to find thumbnail
    const [rows] = await connection.query('SELECT thumbnail FROM Tabel_Publikasi WHERE id_publikasi = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Publikasi tidak ditemukan'
      });
    }

    const currentPub = rows[0];
    if (currentPub.thumbnail) {
      deleteFile(currentPub.thumbnail);
    }

    await connection.query('DELETE FROM Tabel_Publikasi WHERE id_publikasi = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Publikasi berhasil dihapus'
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};
