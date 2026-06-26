const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM Tabel_Admin WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    const admin = rows[0];
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: admin.id_admin, nama: admin.nama, email: admin.email },
      process.env.JWT_SECRET || 'super_secret_jwt_key_hiqma_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      admin: {
        id: admin.id_admin,
        nama: admin.nama,
        email: admin.email
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};
