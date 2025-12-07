const express = require('express');
const router = express.Router();
const AcessorioController = require('../controllers/acessorioController');

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

// Rotas públicas (visualização)
router.get('/', AcessorioController.listar);
router.get('/:id', AcessorioController.buscarPorId);

// Rotas protegidas (apenas admin)
router.post('/', verificarAdmin, AcessorioController.criar);
router.put('/:id', verificarAdmin, AcessorioController.atualizar);
router.delete('/:id', verificarAdmin, AcessorioController.deletar);

// Rotas para relacionamento N:M entre carros e acessórios
router.post('/carro/adicionar', verificarAdmin, AcessorioController.adicionarAoCarro);
router.delete('/carro/remover', verificarAdmin, AcessorioController.removerDoCarro);

module.exports = router;

