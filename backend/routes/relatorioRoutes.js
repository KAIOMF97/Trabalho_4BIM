const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/relatorioController');

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

// Rotas protegidas (apenas admin)
router.get('/vendas-por-marca', verificarAdmin, RelatorioController.getVendasPorMarca);
router.get('/top-5-carros', verificarAdmin, RelatorioController.getTop5CarrosMaisVendidos);

module.exports = router;
