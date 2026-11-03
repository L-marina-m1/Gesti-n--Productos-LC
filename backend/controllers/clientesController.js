const pool = require('../config/database');

const listar = async (req, res) => {
    try {
        const clientes = await pool.query(
            'SELECT * FROM clientes ORDER BY id_cliente DESC'
        );

        res.json(clientes);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al listar clientes',
            error: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            'SELECT * FROM clientes WHERE id_cliente = ?',
            [id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        res.json(resultado[0]);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar cliente',
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono } = req.body;

        if (!nombre || !apellido || !correo) {
            return res.status(400).json({
                mensaje: 'Nombre, apellido y correo son obligatorios'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO clientes (nombre, apellido, correo, telefono)
             VALUES (?, ?, ?, ?)`,
            [nombre, apellido, correo, telefono || null]
        );

        res.status(201).json({
            mensaje: 'Cliente registrado correctamente',
            id_cliente: Number(resultado.insertId)
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar cliente',
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correo, telefono } = req.body;

        if (!nombre || !apellido || !correo) {
            return res.status(400).json({
                mensaje: 'Nombre, apellido y correo son obligatorios'
            });
        }

        const resultado = await pool.query(
            `UPDATE clientes
             SET nombre = ?, apellido = ?, correo = ?, telefono = ?
             WHERE id_cliente = ?`,
            [nombre, apellido, correo, telefono || null, id]
        );

        if (Number(resultado.affectedRows) === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        res.json({ mensaje: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar cliente',
            error: error.message
        });
    }
};

const eliminar = async (req, res) => {
    let conn;

    try {
        const { id } = req.params;
        conn = await pool.getConnection();

        await conn.beginTransaction();

        // Primero eliminamos sus contactos asociados.
        await conn.query(
            'DELETE FROM contactos WHERE id_cliente = ?',
            [id]
        );

        const resultado = await conn.query(
            'DELETE FROM clientes WHERE id_cliente = ?',
            [id]
        );

        if (Number(resultado.affectedRows) === 0) {
            await conn.rollback();

            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        await conn.commit();

        res.json({ mensaje: 'Cliente y sus contactos eliminados correctamente' });
    } catch (error) {
        if (conn) await conn.rollback();

        res.status(500).json({
            mensaje: 'Error al eliminar cliente',
            error: error.message
        });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    listar,
    buscar,
    crear,
    actualizar,
    eliminar
};