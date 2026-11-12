const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
  res.json({ ok: true, total: rows.length, data: rows });
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
  if (!rows.length) throw new AppError('Producto no encontrado', 404);
  res.json({ ok: true, data: rows[0] });
});

const crear = asyncHandler(async (req, res) => {
  const { nombre, precio, stock = 0 } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO productos (nombre, precio, stock) VALUES ($1,$2,$3) RETURNING *',
    [nombre, precio, stock]
  );
  res.status(201).json({ ok: true, message: 'Producto creado', data: rows[0] });
});

const actualizar = asyncHandler(async (req, res) => {
  const { nombre, precio, stock = 0 } = req.body;
  const { rows } = await pool.query(
    'UPDATE productos SET nombre=$1, precio=$2, stock=$3 WHERE id=$4 RETURNING *',
    [nombre, precio, stock, req.params.id]
  );
  if (!rows.length) throw new AppError('Producto no encontrado', 404);
  res.json({ ok: true, message: 'Producto actualizado', data: rows[0] });
});

const eliminar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows.length) throw new AppError('Producto no encontrado', 404);
  res.json({ ok: true, message: 'Producto eliminado', data: rows[0] });
});

// TOP N de productos más vendidos: nombre y total de unidades
const topVendidos = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.nombre, SUM(d.cantidad)::int AS total_unidades_vendidas
       FROM productos p
       JOIN detalle_pedidos d ON d.producto_id = p.id
   GROUP BY p.id, p.nombre
   ORDER BY total_unidades_vendidas DESC, p.nombre ASC
      LIMIT $1`,
    [req.params.n]
  );
  res.json({ ok: true, top: req.params.n, data: rows });
});

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, topVendidos };