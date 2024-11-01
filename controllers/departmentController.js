const { Pool } = require('pg');
const csv = require('csv-parser');
const fastcsv = require('fast-csv');
const fs = require('fs');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'UTM123',
    database: 'HR',
    port: 5432,
});

// Cargar datos desde CSV
exports.uploadCSV = (req, res) => {
  const filePath = req.file.path;
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const client = await pool.connect();
      try {
        for (const row of results) {
          await client.query(
            'INSERT INTO departments (department_id, department_name, manager_id, location_id) VALUES ($1, $2, $3, $4)',
            [row.department_id, row.department_name, row.manager_id, row.location_id]
          );
        }
        res.status(200).json({ message: 'Datos guardados correctamente desde CSV' });
      } catch (error) {
        res.status(500).json({ error: 'Error al cargar el CSV a la base de datos' });
      } finally {
        client.release();
        fs.unlinkSync(filePath);
      }
    });
};

// Exportar datos a CSV
exports.exportCSV = async (req, res) => {
  const filePath = './departments_export.csv';
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM departments');
    const csvStream = fastcsv.write(result.rows, { headers: true });
    const writeStream = fs.createWriteStream(filePath);
    csvStream.pipe(writeStream);

    writeStream.on('finish', () => {
      res.download(filePath, 'departments_export.csv', (err) => {
        if (err) throw err;
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al exportar datos a CSV' });
  } finally {
    client.release();
  }
};
