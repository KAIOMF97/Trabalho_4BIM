const Relatorio = require("../models/Relatorio");

class RelatorioController {
    /**
     * Rota para obter o relatório de vendas por marca.
     */
    static async getVendasPorMarca(req, res) {
        try {
            const { mes, ano } = req.query;
            const relatorio = await Relatorio.vendasPorMarca(mes, ano);
            res.json({ sucesso: true, relatorio });
        } catch (error) {
            console.error("Erro ao gerar relatório de vendas por marca:", error);
            res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
        }
    }

    /**
     * Rota para obter o relatório dos Top 5 carros mais vendidos.
     */
    static async getTop5CarrosMaisVendidos(req, res) {
        try {
            const { mes, ano } = req.query;
            const relatorio = await Relatorio.top5CarrosMaisVendidos(mes, ano);
            res.json({ sucesso: true, relatorio });
        } catch (error) {
            console.error("Erro ao gerar relatório de Top 5 carros:", error);
            res.status(500).json({ sucesso: false, erro: "Erro interno do servidor" });
        }
    }
}

module.exports = RelatorioController;
