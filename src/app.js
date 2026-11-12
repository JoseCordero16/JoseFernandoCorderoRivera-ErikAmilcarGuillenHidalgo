const express = require('express');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, message: 'API pedidosDB funcionando' }));

app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/pedidos', require('./routes/pedidos.routes'));
app.use('/api/detalles', require('./routes/detalles.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;