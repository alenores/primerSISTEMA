const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');
const { authenticateToken } = require('../middleware/auth');

// Ruta de login
router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Rutas de alumnos
router.get('/alumnos', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alumnos ORDER BY apellido, nombre');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener alumnos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post('/alumnos', authenticateToken, async (req, res) => {
    const { nombre, apellido, color_pelo } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO alumnos (nombre, apellido, color_pelo) VALUES ($1, $2, $3) RETURNING *',
            [nombre, apellido, color_pelo]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear alumno:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Rutas de asistencias
router.get('/asistencias', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, al.nombre as alumno_nombre, al.apellido as alumno_apellido, m.nombre as materia
            FROM asistencias a
            JOIN alumnos al ON a.alumno_id = al.id
            JOIN materias m ON a.materia_id = m.id
            ORDER BY a.fecha DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

router.post('/asistencias', authenticateToken, async (req, res) => {
    const { alumno_id, materia_id, fecha } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO asistencias (alumno_id, materia_id, fecha) VALUES ($1, $2, $3) RETURNING *',
            [alumno_id, materia_id, fecha]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear asistencia:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router; 