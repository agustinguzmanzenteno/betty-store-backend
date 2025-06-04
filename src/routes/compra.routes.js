const express = require('express');
const router = express.Router();
const controller = require('../controllers/compra.controller');

router.post('/detalle-compra', controller.crearDetalleCompra);
router.get('/detalle-compras', controller.obtenerDetalleCompras);
router.get('/detalle-compra/:id', controller.obtenerDetalleCompraPorId);
router.put('/detalle-compra/:id', controller.actualizarDetalleCompra);
router.delete('/detalle-compra/:id', controller.eliminarDetalleCompra);

module.exports = router;