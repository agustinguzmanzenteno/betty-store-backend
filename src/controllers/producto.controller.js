const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

exports.crearProducto = (req, res) => {
  const { codProd, nomProd, categoriaProd, descripcionProd, precioProd, cantidadProd, fechaProd } = req.body;

  const sql = 'INSERT INTO producto (codProd, nomProd, categoriaProd, descripcionProd, precioProd, cantidadProd, fechaProd) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [codProd, nomProd, categoriaProd, descripcionProd, precioProd, cantidadProd, fechaProd], (err, result) => {
    if (err) return res.status(500).send(err);

    const idProducto = result.insertId;

    if (req.file) {
      const imagenUrl = req.file.path;
      const publicId = req.file.filename;
      
      const sqlImg = 'INSERT INTO imagen (url, idPublico, nombreImagen, tipoArchivo) VALUES (?, ?, ?, ?)';
      db.query(sqlImg, [imagenUrl, publicId, req.file.originalname, req.file.mimetype], (errImg, imgResult) => {
        if (errImg) return res.status(500).send(errImg);
        
        const idImagen = imgResult.insertId;

        const sqlUpdate = 'UPDATE producto SET imagen_id = ? WHERE id = ?';
        db.query(sqlUpdate, [idImagen, idProducto], (errUpdate) => {
          if (errUpdate) return res.status(500).send(errUpdate);

          res.status(201).json({ message: 'Producto creado con imagen correctamente', id: idProducto });
        });
      });
    } else {
      res.status(201).json({ message: 'Producto creado sin imagen', id: idProducto });
    }
  });
};

exports.obtenerProductos = (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.codProd,
      p.nomProd,
      p.categoriaProd,
      p.descripcionProd,
      p.precioProd,
      p.cantidadProd,
      p.fechaProd,
      i.url AS imagenUrl
    FROM producto p
    LEFT JOIN imagen i ON p.imagen_id = i.id
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.obtenerProductoPorId = (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      p.id,
      p.codProd,
      p.nomProd,
      p.categoriaProd,
      p.descripcionProd,
      p.precioProd,
      p.cantidadProd,
      p.fechaProd,
      i.url AS imagenUrl
    FROM producto p
    LEFT JOIN imagen i ON p.imagen_id = i.id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(result[0]);
  });
};

exports.actualizarProducto = (req, res) => {
  const idProducto = req.params.id;
  const { codProd, nomProd, categoriaProd, descripcionProd, precioProd, cantidadProd, fechaProd } = req.body;

  const sqlSelect = `
    SELECT p.*, i.id AS imagenId, i.idPublico 
    FROM producto p 
    LEFT JOIN imagen i ON p.imagen_id = i.id 
    WHERE p.id = ?
  `;

  db.query(sqlSelect, [idProducto], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    const productoActual = result[0];

    const actualizarDatos = (nuevoIdImagen = null) => {
      const sqlUpdate = `
        UPDATE producto 
        SET codProd = ?, nomProd = ?, categoriaProd = ?, descripcionProd = ?, precioProd = ?, cantidadProd = ?, fechaProd = ?, imagen_id = ?
        WHERE id = ?
      `;
      db.query(sqlUpdate, [codProd, nomProd, categoriaProd, descripcionProd, precioProd, cantidadProd, fechaProd, nuevoIdImagen, idProducto], (errUpdate) => {
        if (errUpdate) return res.status(500).send(errUpdate);
        res.json({ message: 'Producto actualizado correctamente' });
      });
    };

    if (req.file) {
      if (productoActual.idPublico) {
        cloudinary.uploader.destroy(productoActual.idPublico, (error) => {
          if (error) console.error('Error al eliminar de Cloudinary:', error);
        });

        db.query('DELETE FROM imagen WHERE id = ?', [productoActual.imagenId], (errDelete) => {
          if (errDelete) return res.status(500).send(errDelete);
        });
      }

      const nuevaUrl = req.file.path;
      const nuevoPublicId = req.file.filename;
      const sqlImg = 'INSERT INTO imagen (url, idPublico, nombreImagen, tipoArchivo) VALUES (?, ?, ?, ?)';
      db.query(sqlImg, [nuevaUrl, nuevoPublicId, req.file.originalname, req.file.mimetype], (errImg, imgResult) => {
        if (errImg) return res.status(500).send(errImg);
        const nuevoIdImagen = imgResult.insertId;
        actualizarDatos(nuevoIdImagen);
      });
    } else {
      actualizarDatos(productoActual.imagenId);
    }
  });
};

exports.eliminarProducto = (req, res) => {
  const idProducto = req.params.id;

  const sqlSelect = `
    SELECT p.id, i.id AS imagenId, i.idPublico
    FROM producto p
    LEFT JOIN imagen i ON p.imagen_id = i.id
    WHERE p.id = ?
  `;

  db.query(sqlSelect, [idProducto], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    const producto = result[0];

    const eliminarImagenYProducto = () => {
      if (producto.imagenId) {
        db.query('DELETE FROM imagen WHERE id = ?', [producto.imagenId], (errImgDel) => {
          if (errImgDel) return res.status(500).send(errImgDel);
          eliminarProductoFinal();
        });
      } else {
        eliminarProductoFinal();
      }
    };

    const eliminarProductoFinal = () => {
      db.query('DELETE FROM producto WHERE id = ?', [idProducto], (errDelete) => {
        if (errDelete) return res.status(500).send(errDelete);
        res.json({ message: 'Producto eliminado correctamente' });
      });
    };

    if (producto.idPublico) {
      cloudinary.uploader.destroy(producto.idPublico, (error) => {
        if (error) {
          console.error('Error al eliminar imagen de Cloudinary:', error);
          return res.status(500).json({ message: 'Error al eliminar imagen de Cloudinary' });
        }
        eliminarImagenYProducto();
      });
    } else {
      eliminarImagenYProducto();
    }
  });
};