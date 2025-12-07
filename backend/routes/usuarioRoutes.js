const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');

// Middleware para verificar se o usuário está logado
const verificarLogin = (req, res, next) => {
    if (!req.session.usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }
    next();
};

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

// Rotas públicas
router.post('/registrar', UsuarioController.registrar);
router.post('/login', UsuarioController.login);
router.post('/logout', UsuarioController.logout);
router.get('/sessao', UsuarioController.verificarSessao);

// Rotas protegidas (apenas admin)
router.get('/', verificarAdmin, UsuarioController.listar);
router.get('/:id', verificarAdmin, UsuarioController.buscarPorId);
router.put('/:id', verificarAdmin, UsuarioController.atualizar);
router.delete('/:id', verificarAdmin, UsuarioController.deletar);

module.exports = router;

