const db = require('../config/db');

exports.crearDetalleCompra = (req, res) => {
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'No se enviaron productos' });
  }

  const valores = productos.map(prod => [
    prod.codDetCompra,
    prod.nomDetCompra || '',
    prod.cantDetCompra,
    prod.precioDetCompra,
    prod.fechaDetCompra,
    prod.producto_id
  ]);

  const sqlInsert = `
    INSERT INTO detallecompra 
    (codDetCompra, nomDetCompra, cantDetCompra, precioDetCompra, fechaDetCompra, producto_id)
    VALUES ?
  `;

  db.query(sqlInsert, [valores], (err, result) => {
    if (err) return res.status(500).send(err);

    const actualizaciones = productos.map(prod => {
      return new Promise((resolve, reject) => {
        const sqlUpdate = `
          UPDATE producto 
          SET cantidadProd = cantidadProd + ? 
          WHERE id = ?
        `;
        db.query(sqlUpdate, [prod.cantDetCompra, prod.producto_id], (errUpd) => {
          if (errUpd) reject(errUpd);
          else resolve();
        });
      });
    });

    Promise.all(actualizaciones)
      .then(() => {
        res.status(201).json({ message: 'Detalle de compra registrado y stock actualizado correctamente', insertados: result.affectedRows });
      })
      .catch(errStock => {
        res.status(500).json({ message: 'Error al actualizar stock', error: errStock });
      });
  });
};

exports.obtenerDetalleCompras = (req, res) => {
  const sql = `
    SELECT dc.*, p.nomProd 
    FROM detallecompra dc
    LEFT JOIN producto p ON dc.producto_id = p.id
    ORDER BY dc.fechaDetCompra DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
};

exports.obtenerDetalleCompraPorId = (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT dc.*, p.nomProd 
    FROM detallecompra dc
    LEFT JOIN producto p ON dc.producto_id = p.id
    WHERE dc.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Detalle no encontrado' });
    res.json(result[0]);
  });
};

exports.actualizarDetalleCompra = (req, res) => {
  const id = req.params.id;
  const { codDetCompra, nomDetCompra, cantDetCompra, precioDetCompra, fechaDetCompra, producto_id } = req.body;

  const sqlSelect = 'SELECT * FROM detallecompra WHERE id = ?';
  db.query(sqlSelect, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Detalle no encontrado' });

    const anterior = result[0];

    const sqlUpdate = `
      UPDATE detallecompra
      SET codDetCompra = ?, nomDetCompra = ?, cantDetCompra = ?, precioDetCompra = ?, fechaDetCompra = ?, producto_id = ?
      WHERE id = ?
    `;

    db.query(sqlUpdate, [codDetCompra, nomDetCompra, cantDetCompra, precioDetCompra, fechaDetCompra, producto_id, id], (errUpdate) => {
      if (errUpdate) return res.status(500).send(errUpdate);

      const sqlStock = `
        UPDATE producto 
        SET cantidadProd = cantidadProd - ? + ?
        WHERE id = ?
      `;
      db.query(sqlStock, [anterior.cantDetCompra, cantDetCompra, producto_id], (errStock) => {
        if (errStock) return res.status(500).send(errStock);
        res.json({ message: 'Detalle actualizado y stock ajustado correctamente' });
      });
    });
  });
};

exports.eliminarDetalleCompra = (req, res) => {
  const id = req.params.id;

  const sqlSelect = 'SELECT * FROM detallecompra WHERE id = ?';
  db.query(sqlSelect, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Detalle no encontrado' });

    const { cantDetCompra, producto_id } = result[0];

    const sqlDelete = 'DELETE FROM detallecompra WHERE id = ?';
    db.query(sqlDelete, [id], (errDel) => {
      if (errDel) return res.status(500).send(errDel);

      const sqlStock = `
        UPDATE producto 
        SET cantidadProd = cantidadProd - ?
        WHERE id = ?
      `;
      db.query(sqlStock, [cantDetCompra, producto_id], (errStock) => {
        if (errStock) return res.status(500).send(errStock);
        res.json({ message: 'Detalle eliminado y stock ajustado correctamente' });
      });
    });
  });
};