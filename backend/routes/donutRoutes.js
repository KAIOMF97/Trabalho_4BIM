const express = require("express");
const router = express.Router();
const DonutController = require("../controllers/donutController");
const upload = require("../middleware/upload");

// Middleware para verificar se o usuário é admin
const verificarAdmin = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipo !== "admin") {
        return res.status(403).json({ erro: "Acesso negado. Apenas administradores." });
    }
    next();
};

// Rotas públicas (visualização)
router.get("/", DonutController.listarTodos);
router.get("/:id", DonutController.buscarPorId);
router.get("/categoria/:categoria_id", DonutController.listarPorCategoria);

// Rotas protegidas (apenas admin)
router.post("/", verificarAdmin, upload.single("imagem"), DonutController.criar);
router.put("/:id", verificarAdmin, upload.single("imagem"), DonutController.atualizar);
router.delete("/:id", verificarAdmin, DonutController.deletar);

module.exports = router;

