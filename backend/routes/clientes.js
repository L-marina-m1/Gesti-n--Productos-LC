const express = require('express');
const router = express.Router();

const controlador = require('../controllers/clientesController');

router.get('/', controlador.listar);
router.get('/:id', controlador.buscar);
router.post('/', controlador.crear);
router.put('/:id', controlador.actualizar);
router.delete('/:id', controlador.eliminar);

module.exports = router;