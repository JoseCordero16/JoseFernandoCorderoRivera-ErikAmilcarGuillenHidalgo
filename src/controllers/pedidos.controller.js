const pool = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const existe = require('../utils/existe');

const listar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pe.*, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido
       FROM pedidos pe JOIN usuarios u ON u.id = pe.usuario_id
   ORDER BY pe.id`
  );
  res.json({ ok: true, total: rows.length, data: rows });
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pe.*, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido
       FROM pedidos pe JOIN usuarios u ON u.id = pe.usuario_id
      WHERE pe.id = $1`,
    [req.params.id]
  );
  if (!rows.length) throw new AppError('Pedido no encontrado', 404);
  res.json({ ok: true, data: rows[0] });
});

const crear = asyncHandler(async (req, res) => {
  const { usuario_id, estado = 'pendiente' } = req.body;
  await existe('usuarios', usuario_id, 'Usuario');
  const { rows } = await pool.query(
    'INSERT INTO pedidos (usuario_id, estado) VALUES ($1,$2) RETURNING *',
    [usuario_id, estado]
  );
  res.status(201).json({ ok: true, message: 'Pedido creado', data: rows[0] });
});

const actualizar = asyncHandler(async (req, res) => {
  const { usuario_id, estado = 'pendiente' } = req.body;
  await existe('usuarios', usuario_id, 'Usuario');
  const { rows } = await pool.query(
    'UPDATE pedidos SET usuario_id=$1, estado=$2 WHERE id=$3 RETURNING *',
    [usuario_id, estado, req.params.id]
  );
  if (!rows.length) throw new AppError('Pedido no encontrado', 404);
  res.json({ ok: true, message: 'Pedido actualizado', data: rows[0] });
});

const eliminar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query('DELETE FROM pedidos WHERE id = $1 RETURNING *', [req.params.id]);
  if (!rows.length) throw new AppError('Pedido no encontrado', 404);
  res.json({ ok: true, message: 'Pedido eliminado (sus detalles también)', data: rows[0] });
});

// Pedidos realizados por un cliente específico
const porCliente = asyncHandler(async (req, res) => {
  await existe('usuarios', req.params.usuarioId, 'Usuario');
  const { rows } = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY fecha DESC, id DESC',
    [req.params.usuarioId]
  );
  res.json({ ok: true, total: rows.length, data: rows });
});

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, porCliente };