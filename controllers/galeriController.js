const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to delete a file
const deleteFile = (filePath) => {
  if (filePath && filePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, '..', 'public', filePath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error(`Failed to delete gallery file: ${fullPath}`, err);
      }
    });
  }
};

// 1. Get all gallery items (for public website)
exports.getGaleri = async (req, res, next) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      'SELECT id_galeri, nama_kegiatan, file_url, keterangan, tgl_kegiatan, tipe FROM Tabel_Galeri ORDER BY tgl_kegiatan DESC'
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

// 2. Create a gallery item (admin only)
exports.createGaleri = async (req, res, next) => {
  const { nama_kegiatan, keterangan, tgl_kegiatan, tipe } = req.body;
  let file_url = '';

  if (!nama_kegiatan || !tgl_kegiatan || !tipe) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    return res.status(400).json({
      status: 'error',
      message: 'Nama kegiatan, tanggal, dan tipe wajib diisi'
    });
  }

  if (tipe === 'Foto') {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File foto wajib diunggah untuk tipe Foto'
      });
    }
    file_url = `/uploads/${req.file.filename}`;
  } else {
    // For Video, get URL from the body field 'file_url'
    file_url = req.body.file_url;
    if (!file_url) {
      return res.status(400).json({
        status: 'error',
        message: 'Tautan video wajib diisi untuk tipe Video'
      });
    }
  }

  let connection;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO Tabel_Galeri (nama_kegiatan, file_url, keterangan, tgl_kegiatan, tipe) VALUES (?, ?, ?, ?, ?)',
      [nama_kegiatan, file_url, keterangan || null, tgl_kegiatan, tipe]
    );

    res.status(201).json({
      status: 'success',
      message: 'Dokumentasi galeri berhasil ditambahkan',
      data: {
        id_galeri: result.insertId,
        nama_kegiatan,
        file_url,
        tipe,
        tgl_kegiatan
      }
    });
  } catch (error) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// 3. Delete a gallery item (admin only)
exports.deleteGaleri = async (req, res, next) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await db.getConnection();

    // Fetch existing gallery item to check file
    const [rows] = await connection.query('SELECT file_url, tipe FROM Tabel_Galeri WHERE id_galeri = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Dokumentasi tidak ditemukan'
      });
    }

    const currentItem = rows[0];
    if (currentItem.tipe === 'Foto' && currentItem.file_url) {
      deleteFile(currentItem.file_url);
    }

    await connection.query('DELETE FROM Tabel_Galeri WHERE id_galeri = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Dokumentasi galeri berhasil dihapus'
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};
