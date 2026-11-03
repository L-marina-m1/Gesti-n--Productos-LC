const pool = require('../config/database');

const listar = async (req, res) => {
    try {
        const contactos = await pool.query(`
            SELECT
                c.id_contacto,
                c.id_cliente,
                c.plataforma,
                c.usuario_contacto,
                c.descripcion,
                cl.nombre,
                cl.apellido,
                cl.correo
            FROM contactos c
            INNER JOIN clientes cl
                ON c.id_cliente = cl.id_cliente
            ORDER BY c.id_contacto DESC
        `);

        res.json(contactos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al listar contactos',
            error: error.message
        });
    }
};

const buscar = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            'SELECT * FROM contactos WHERE id_contacto = ?',
            [id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                mensaje: 'Contacto no encontrado'
            });
        }

        res.json(resultado[0]);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar contacto',
            error: error.message
        });
    }
};

const crear = async (req, res) => {
    try {
        const {
            id_cliente,
            plataforma,
            usuario_contacto,
            descripcion
        } = req.body;

        if (!id_cliente || !plataforma) {
            return res.status(400).json({
                mensaje: 'El cliente y la plataforma son obligatorios'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO contactos
             (id_cliente, plataforma, usuario_contacto, descripcion)
             VALUES (?, ?, ?, ?)`,
            [
                id_cliente,
                plataforma,
                usuario_contacto || null,
                descripcion || null
            ]
        );

        res.status(201).json({
            mensaje: 'Contacto registrado correctamente',
            id_contacto: Number(resultado.insertId)
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar contacto',
            error: error.message
        });
    }
};

const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_cliente,
            plataforma,
            usuario_contacto,
            descripcion
        } = req.body;

        if (!id_cliente || !plataforma) {
            return res.status(400).json({
                mensaje: 'El cliente y la plataforma son obligatorios'
            });
        }

        const resultado = await pool.query(
            `UPDATE contactos
             SET id_cliente = ?, plataforma = ?,
                 usuario_contacto = ?, descripcion = ?
             WHERE id_contacto = ?`,
            [
                id_cliente,
                plataforma,
                usuario_contacto || null,
                descripcion || null,
                id
            ]
        );

        if (Number(resultado.affectedRows) === 0) {
            return res.status(404).json({
                mensaje: 'Contacto no encontrado'
            });
        }

        res.json({ mensaje: 'Contacto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar contacto',
            error: error.message
        });
    }
};

const eliminar = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            'DELETE FROM contactos WHERE id_contacto = ?',
            [id]
        );

        if (Number(resultado.affectedRows) === 0) {
            return res.status(404).json({
                mensaje: 'Contacto no encontrado'
            });
        }

        res.json({ mensaje: 'Contacto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar contacto',
            error: error.message
        });
    }
};

module.exports = {
    listar,
    buscar,
    crear,
    actualizar,
    eliminar
};