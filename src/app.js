const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const productoRoutes = require('./routes/producto.routes');
const compraRoutes = require('./routes/compra.routes');

app.use('/api', productoRoutes);
app.use('/api', compraRoutes);

app.set('port', process.env.PORT || 4000);

module.exports = app;