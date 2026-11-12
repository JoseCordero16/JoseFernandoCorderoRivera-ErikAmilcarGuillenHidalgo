const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM usuarios ORDER BY id');
  res.json({ ok: true, total: rows.length, data: rows });
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
  if (!rows.length) throw new AppError('Usuario no encontrado', 404);
  res.json({ ok: true, data: rows[0] });
});

const crear = asyncHandler(async (req, res) => {
  const { nombre, apellido, correo, telefono = null } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO usuarios (nombre, apellido, correo, telefono) VALUES ($1,$2,$3,$4) RETURNING *',
    [nombre, apellido, correo, telefono]
  );
  res.status(201).json({ ok: true, message: 'Usuario creado', data: rows[0] });
});

const actualizar = asyncHandler(async (req, res) => {
  const { nombre, apellido, correo, telefono = null } = req.body;
  const { rows } = await pool.query(
    'UPDATE usuarios SET nombre=$1, apellido=$2, correo=$3, telefono=$4 WHERE id=$5 RETURNING *',
    [nombre, apellido, correo, telefono, req.params.id]
  );
  if (!rows.length) throw new AppError('Usuario no encontrado', 404);
  res.json({ ok: true, message: 'Usuario actualizado', data: rows[0] });
});

const eliminar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows.length) throw new AppError('Usuario no encontrado', 404);
  res.json({ ok: true, message: 'Usuario eliminado', data: rows[0] });
});

// Filtro por columna (búsqueda parcial, sin distinguir mayúsculas)
const filtrarPor = (columna) =>
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE ${columna} ILIKE $1 ORDER BY id`,
      [`%${req.params.valor}%`]
    );
    res.json({ ok: true, total: rows.length, data: rows });
  });

module.exports = {
  listar, obtenerPorId, crear, actualizar, eliminar,
  filtrarPorNombre: filtrarPor('nombre'),
  filtrarPorApellido: filtrarPor('apellido'),
  filtrarPorCorreo: filtrarPor('correo'),
};