const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'softjob',
  password: 'postgres',
  port: 5432,
});

// Middleware CORS (Permite conexión con frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// POST /usuarios (Acepta "lenguage" como en tu frontend)
app.post('/usuarios', async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body; // <<<--- Campo "lenguage" (igual que tu front)
    if (!email || !password || !rol || !lenguage) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    await pool.query(
      'INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, rol, lenguage]
    );
    res.status(201).json({ message: 'Usuario registrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /login (Devuelve token JWT)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!rows.length || !bcrypt.compareSync(password, rows[0].password)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'az_AZ', { expiresIn: '1h' });
    res.json({ token, user: { email, rol: rows[0].rol, lenguage: rows[0].lenguage } }); // <<<--- Campo "lenguage"
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /usuarios (Devuelve datos con el campo "lenguage")
app.get('/usuarios', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'az_AZ');
    const { rows } = await pool.query(
      'SELECT email, rol, lenguage FROM usuarios WHERE email = $1', // <<<--- Campo "lenguage"
      [decoded.email]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: 'Token inválido' });
  }
});

// Inicia el servidor
app.listen(3000, () => console.log('Servidor listo en http://localhost:3000'));