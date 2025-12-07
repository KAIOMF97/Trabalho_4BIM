const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'loja_carros_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Servir arquivos estáticos
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'frontend')));

// Importar rotas
const pedidoRoutes = require('./backend/routes/pedidoRoutes');
const usuarioRoutes = require('./backend/routes/usuarioRoutes');
const carroRoutes = require('./backend/routes/carroRoutes');
const acessorioRoutes = require('./backend/routes/acessorioRoutes');
const donutRoutes = require('./backend/routes/donutRoutes');
const relatorioRoutes = require('./backend/routes/relatorioRoutes');

// Usar rotas
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/carros', carroRoutes);
app.use('/api/acessorios', acessorioRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/donuts", donutRoutes);
app.use("/api/relatorios", relatorioRoutes);

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

