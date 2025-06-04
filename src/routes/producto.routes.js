const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const controller = require('../controllers/producto.controller');

router.post('/producto', upload.single('imagen'), controller.crearProducto);
router.get('/productos', controller.obtenerProductos);
router.get('/producto/:id', controller.obtenerProductoPorId);
router.put('/producto/:id', upload.single('imagen'), controller.actualizarProducto);
router.delete('/producto/:id', controller.eliminarProducto);

module.exports = router;