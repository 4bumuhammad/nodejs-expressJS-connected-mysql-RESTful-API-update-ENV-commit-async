require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware untuk parsing body permintaan menjadi JSON
app.use(bodyParser.json());

// Konfigurasi koneksi database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  insecureAuth: process.env.DB_INSECUREAUTH
};

app.put('/api/data/:id', async (req, res) => {
  const id = req.params.id;
  const { nama, alamat } = req.body;

  let connection;

  try {
    // Membuat koneksi database secara asinkron
    connection = await mysql.createConnection(dbConfig);

    // Memulai transaksi
    await connection.beginTransaction();

    // Perbarui data di tabel pertama
    const updateQuery1 = 'UPDATE usersbanyak SET nama = ?, alamat = ? WHERE id = ?';
    await connection.query(updateQuery1, [nama, alamat, id]);

    // Perbarui data di tabel kedua
    const updateQuery2 = 'UPDATE userlain SET nama = ?, alamat = ? WHERE id = ?';
    await connection.query(updateQuery2, [nama, alamat, id]);    

    // Commit transaksi jika berhasil
    await connection.commit();

    res.status(200).json({ message: 'Data berhasil diperbarui.' });
  } catch (error) {
    // Rollback transaksi jika terjadi kesalahan
    await connection.rollback();

    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data.' });
  } finally {
    if (connection) {
      // Tutup koneksi database
      connection.end();
    }
  }
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});
