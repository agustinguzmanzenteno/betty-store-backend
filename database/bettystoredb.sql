CREATE DATABASE IF NOT EXISTS bettystoredb;
USE bettystoredb;

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contrasenia VARCHAR(255) NOT NULL,
  rol VARCHAR(150) NOT NULL
);

CREATE TABLE imagen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombreImagen VARCHAR(255),
  url TEXT,
  tipoArchivo VARCHAR(150),
  idPublico VARCHAR(150),
  descripcion TEXT,
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codProd BIGINT UNIQUE,
  nomProd VARCHAR(255),
  categoriaProd VARCHAR(255),
  descripcionProd VARCHAR(255),
  precioProd DOUBLE,
  cantidadProd INT,
  fechaProd DATE,
  imagen_id INT,
  FOREIGN KEY (imagen_id) REFERENCES imagen(id) ON DELETE SET NULL
);

CREATE TABLE detallecompra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codDetCompra INT UNIQUE,
  nomDetCompra VARCHAR(255),
  cantDetCompra INT,
  precioDetCompra DOUBLE,
  fechaDetCompra DATE,
  producto_id INT,
  FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE SET NULL
);

CREATE TABLE detalleventa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codDetVenta INT UNIQUE,
  nomDetVenta VARCHAR(255),
  cantDetVenta INT,
  precioDetVenta DOUBLE,
  fechaDetVenta DATE,
  producto_id INT,
  FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE SET NULL
);