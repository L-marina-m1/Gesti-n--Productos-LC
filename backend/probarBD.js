
require('dotenv').config();

const mariadb = require('mariadb');

async function probarConexion() {
    let conn;

    try {
        console.log('Probando conexión con MariaDB...');

        conn = await mariadb.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME
        });

        console.log('¡CONEXIÓN EXITOSA CON MARIADB!');

        const clientes = await conn.query(
            'SELECT * FROM clientes'
        );

        console.log('Clientes encontrados:', clientes);

        const contactos = await conn.query(
            'SELECT * FROM contactos'
        );

        console.log('Contactos encontrados:', contactos);

    } catch (error) {
        console.error('ERROR REAL:', error.message);
        console.error('Código:', error.code);
    } finally {
        if (conn) await conn.end();
    }
}

probarConexion();
