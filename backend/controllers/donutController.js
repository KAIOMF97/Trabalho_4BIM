const Donut = require("../models/Donut");
const fs = require("fs");
const path = require("path");

class DonutController {
    static async criar(req, res) {
        try {
            const { nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id } = req.body;
            let imagem_produto = null;

            if (req.file) {
                imagem_produto = `/uploads/donuts/${req.file.filename}`;
            }

            const donut = await Donut.criar(nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto);

            res.status(201).json({
                sucesso: true,
                mensagem: "Donut criado com sucesso",
                donut: donut
            });
        } catch (error) {
            console.error("Erro ao criar donut:", error);
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error("Erro ao remover arquivo:", unlinkError);
                }
            }
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async listarTodos(req, res) {
        try {
            const donuts = await Donut.listarTodos();
            res.json(donuts);
        } catch (error) {
            console.error("Erro ao listar donuts:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const donut = await Donut.buscarPorId(id);

            if (!donut) {
                return res.status(404).json({ erro: "Donut não encontrado" });
            }

            res.json(donut);
        } catch (error) {
            console.error("Erro ao buscar donut:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id } = req.body;

            const donutAtual = await Donut.buscarPorId(id);
            if (!donutAtual) {
                if (req.file) {
                    try {
                        fs.unlinkSync(req.file.path);
                    } catch (unlinkError) {
                        console.error("Erro ao remover arquivo:", unlinkError);
                    }
                }
                return res.status(404).json({ erro: "Donut não encontrado" });
            }

            let imagem_produto = donutAtual.imagem_produto; // Manter imagem atual por padrão

            if (req.file) {
                imagem_produto = `/uploads/donuts/${req.file.filename}`;

                if (donutAtual.imagem_produto && donutAtual.imagem_produto.startsWith("/uploads/")) {
                    const imagemAntigaPath = path.join(__dirname, "../../", donutAtual.imagem_produto);
                    try {
                        if (fs.existsSync(imagemAntigaPath)) {
                            fs.unlinkSync(imagemAntigaPath);
                        }
                    } catch (unlinkError) {
                        console.error("Erro ao remover imagem antiga:", unlinkError);
                    }
                }
            }

            const donut = await Donut.atualizar(id, nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto);

            res.json({
                sucesso: true,
                mensagem: "Donut atualizado com sucesso",
                donut: donut
            });
        } catch (error) {
            console.error("Erro ao atualizar donut:", error);
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error("Erro ao remover arquivo:", unlinkError);
                }
            }
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;

            const donut = await Donut.buscarPorId(id);
            if (!donut) {
                return res.status(404).json({ erro: "Donut não encontrado" });
            }

            await Donut.deletar(id);

            if (donut.imagem_produto && donut.imagem_produto.startsWith("/uploads/")) {
                const imagemPath = path.join(__dirname, "../../", donut.imagem_produto);
                try {
                    if (fs.existsSync(imagemPath)) {
                        fs.unlinkSync(imagemPath);
                    }
                } catch (unlinkError) {
                    console.error("Erro ao remover imagem:", unlinkError);
                }
            }

            res.json({
                sucesso: true,
                mensagem: "Donut deletado com sucesso"
            });
        } catch (error) {
            console.error("Erro ao deletar donut:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async listarPorCategoria(req, res) {
        try {
            const { categoria_id } = req.params;
            const donuts = await Donut.listarPorCategoria(categoria_id);
            res.json(donuts);
        } catch (error) {
            console.error("Erro ao listar donuts por categoria:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }
}

module.exports = DonutController;

