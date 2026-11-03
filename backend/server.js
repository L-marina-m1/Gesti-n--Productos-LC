const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API REST de AtenciónTotal funcionando correctamente'
    });
});

// Comprobar conexión con MariaDB
app.get('/api/conexion', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT DATABASE() AS base_datos'
        );

        res.json({
            mensaje: 'Conexión exitosa con MariaDB',
            base_datos: resultado[0].base_datos
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al conectar con MariaDB',
            error: error.message
        });
    }
});

// Rutas de clientes
const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);

// Rutas de contactos
const contactosRoutes = require('./routes/contactos');
app.use('/api/contactos', contactosRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API de AtenciónTotal funcionando en http://localhost:${PORT}`);
});