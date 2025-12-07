const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedidoController');

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

// Rotas para clientes logados
router.get('/admin', PedidoController.listarParaAdmin);
router.get('/meus-pedidos', verificarLogin, PedidoController.meusPedidos);
router.post('/checkout-completo', verificarLogin, PedidoController.criarCheckoutCompleto);
router.post('/comprar', verificarLogin, PedidoController.criarPedidoCompleto);
router.get('/usuario/:usuario_id', verificarLogin, PedidoController.buscarPorUsuario);

// Rotas protegidas (apenas admin)

// Rotas acessíveis a usuários autenticados (checkout)
router.post('/checkout-completo', verificarLogin, PedidoController.criarCheckoutCompleto);
router.post('/comprar', verificarLogin, PedidoController.criarCheckoutCompleto); // alias simples para compras rápidas

// Rotas para visualizar os próprios pedidos
router.get('/meus', verificarLogin, PedidoController.meusPedidos);

router.get('/', verificarAdmin, PedidoController.listar);
router.get('/estatisticas', verificarAdmin, PedidoController.obterEstatisticas);
router.get('/:id', verificarAdmin, PedidoController.buscarPorId);
router.post('/', verificarLogin, PedidoController.criar);
router.put('/:id', verificarAdmin, PedidoController.atualizar);
router.delete('/:id', verificarAdmin, PedidoController.deletar);

// Rotas para itens do pedido
router.post('/item', verificarAdmin, PedidoController.adicionarItem);
router.get('/:pedido_id/itens', verificarAdmin, PedidoController.buscarItens);

module.exports = router;
