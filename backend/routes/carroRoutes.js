const express = require('express');
const router = express.Router();
const CarroController = require('../controllers/carroController');
const upload = require('../middleware/upload');

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipo !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

// Rotas públicas (visualização)
router.get('/', CarroController.listar);
router.get('/:id', CarroController.buscarPorId);
router.get('/:id/detalhes', CarroController.buscarComDetalhes);
router.get('/:id/acessorios', CarroController.buscarComAcessorios);

// Rotas protegidas (apenas admin)
router.post('/', verificarAdmin, upload.single('imagem'), CarroController.criar);
router.put('/:id', verificarAdmin, upload.single('imagem'), CarroController.atualizar);
router.delete('/:id', verificarAdmin, CarroController.deletar);

// Rotas para detalhes do carro (relacionamento 1:1)
router.post('/:carro_id/detalhes', verificarAdmin, CarroController.criarDetalhes);
router.put('/:carro_id/detalhes', verificarAdmin, CarroController.atualizarDetalhes);

module.exports = router;

