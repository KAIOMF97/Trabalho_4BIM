const pool = require("../config/database");
const Pedido = require("../models/Pedido");
const PedidoCompleto = require("../models/PedidoCompleto");

class PedidoController {
    static async criar(req, res) {
        try {
            const { usuario_id, status } = req.body;
            
            const novoPedido = await Pedido.criar(usuario_id, status);
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: "Pedido criado com sucesso",
                pedido: novoPedido 
            });
        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async listarParaAdmin(req, res) {
    try {
        // tentativa: query que junta pedidos + usuário + itens (se as colunas existirem)
        const sql = `
            SELECT
                p.*,
                json_build_object("id", u.id, "nome", u.nome, "email", u.email) AS usuario,
                COALESCE(json_agg(
                    json_build_object(
                        "item_id", ip.id,
                        "pedido_id", ip.pedido_id,
                        "carro_id", ip.carro_id,
                        "preco_unitario", ip.preco_unitario,
                        "quantidade", ip.quantidade
                    )
                ) FILTER (WHERE ip.id IS NOT NULL), "[]") AS itens
            FROM Pedido p
            LEFT JOIN Usuario u ON u.id = p.usuario_id
            LEFT JOIN ItemPedido ip ON ip.pedido_id = p.id
            GROUP BY p.id, u.id
            ORDER BY p.id DESC;
        `;
        const resultado = await pool.query(sql);
        return res.status(200).json({ sucesso: true, pedidos: resultado.rows });
    } catch (err) {
        console.error("Erro listarParaAdmin (query rica):", err);

        // fallback mais permissivo: buscar tabelas separadas e montar objeto em JS
        try {
            const pedidosRes = await pool.query("SELECT * FROM Pedido ORDER BY id DESC");
            let itensRes = { rows: [] };
            let usuariosRes = { rows: [] };
            try { itensRes = await pool.query("SELECT * FROM ItemPedido"); } catch(e){ console.warn("ItemPedido ausente ou erro:", e.message); }
            try { usuariosRes = await pool.query("SELECT * FROM Usuario"); } catch(e){ console.warn("Usuario ausente ou erro:", e.message); }

            const usuariosMap = new Map(usuariosRes.rows.map(u => [u.id, u]));
            const pedidos = pedidosRes.rows.map(p => {
                const itens = itensRes.rows.filter(i => String(i.pedido_id) === String(p.id));
                return { ...p, usuario: usuariosMap.get(p.usuario_id) || null, itens };
            });

            return res.status(200).json({ sucesso: true, pedidos });
        } catch (err2) {
            console.error("Erro listarParaAdmin (fallback):", err2);
            return res.status(500).json({ sucesso: false, erro: "Erro interno ao listar pedidos" });
        }
    }
}

    static async listar(req, res) {
        try {
            const pedidos = await PedidoCompleto.listarPedidosCompletos();
            res.json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedidos:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }



    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const pedido = await Pedido.buscarPorId(id);
            
            if (!pedido) {
                return res.status(404).json({ erro: "Pedido não encontrado" });
            }
            
            res.json(pedido);
        } catch (error) {
            console.error("Erro ao buscar pedido:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async buscarPorUsuario(req, res) {
        try {
            const { usuario_id } = req.params;
            const pedidos = await Pedido.buscarPorUsuario(usuario_id);
            res.json(pedidos);
        } catch (error) {
            console.error("Erro ao buscar pedidos do usuário:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const pedido = await Pedido.atualizar(id, status);
            
            if (!pedido) {
                return res.status(404).json({ erro: "Pedido não encontrado" });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: "Pedido atualizado com sucesso",
                pedido: pedido 
            });
        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const pedido = await Pedido.deletar(id);
            
            if (!pedido) {
                return res.status(404).json({ erro: "Pedido não encontrado" });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: "Pedido deletado com sucesso" 
            });
        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async adicionarItem(req, res) {
        try {
            const { pedido_id, carro_id, quantidade, preco_unitario } = req.body;
            
            const item = await Pedido.adicionarItem(pedido_id, carro_id, quantidade, preco_unitario);
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: "Item adicionado ao pedido com sucesso",
                item: item 
            });
        } catch (error) {
            console.error("Erro ao adicionar item ao pedido:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async buscarItens(req, res) {
        try {
            const { pedido_id } = req.params;
            const itens = await Pedido.buscarItens(pedido_id);
            res.json(itens);
        } catch (error) {
            console.error("Erro ao buscar itens do pedido:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    static async criarPedidoCompleto(req, res) {
        try {
            const { carro_id, quantidade } = req.body;
            const usuario_id = req.session.usuario.id;

            // Buscar o carro para obter o preço
            const Carro = require("../models/Carro");
            const carro = await Carro.buscarPorId(carro_id);
            
            if (!carro) {
                return res.status(404).json({ erro: "Carro não encontrado" });
            }

            // Criar o pedido
            const novoPedido = await Pedido.criar(usuario_id, "pendente");
            
            // Adicionar o item ao pedido
            await Pedido.adicionarItem(novoPedido.id, carro_id, quantidade, carro.preco);
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: "Pedido realizado com sucesso",
                pedido: novoPedido 
            });
        } catch (error) {
            console.error("Erro ao criar pedido completo:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    // Nova função para checkout completo
       // Nova função para checkout completo
    static async criarCheckoutCompleto(req, res) {
        try {
            const usuario_id = req.session.usuario.id;
            const dadosCheckout = {
                usuario_id,
                ...req.body
            };

            // Tentar usar o fluxo completo (mais completo, usa várias tabelas)
            try {
                const resultado = await PedidoCompleto.criarPedidoCompleto(dadosCheckout);
                return res.status(201).json(resultado);
            } catch (error) {
                console.error("Erro em PedidoCompleto.criarPedidoCompleto:", error);

                // Fallback: criar pedido simples usando apenas as tabelas existentes
                // (Pedido e ItemPedido) para garantir que o usuário consiga finalizar a compra.
                const { carro_id, quantidade = 1 } = req.body;
                if (!carro_id) {
                    return res.status(400).json({
                        sucesso: false,
                        erro: "carro_id ausente no pedido",
                        mensagem: "Não foi possível processar o checkout completo e carro_id não foi fornecido."
                    });
                }

                const Carro = require("../models/Carro");
                const Pedido = require("../models/Pedido");

                const carro = await Carro.buscarPorId(carro_id);
                if (!carro) {
                    return res.status(404).json({ sucesso: false, erro: "Carro não encontrado" });
                }

                const novoPedido = await Pedido.criar(usuario_id, "pendente");
                await Pedido.adicionarItem(novoPedido.id, carro_id, quantidade, carro.preco);

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Pedido criado com sucesso (fallback simplificado)",
                    pedidoId: novoPedido.id,
                    pedido: novoPedido
                });
            }
        } catch (error) {
            console.error("Erro ao criar checkout completo:", error);
            res.status(500).json({
                sucesso: false,
                erro: "Erro interno do servidor"
            });
        }
    }

    // Função para obter estatísticas (admin)
    static async obterEstatisticas(req, res) {
        try {
            // Verificar se é admin
            if (req.session.usuario.tipo !== "admin") {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            const estatisticas = await PedidoCompleto.obterEstatisticasPedidos();
            res.json(estatisticas);
        } catch (error) {
            console.error("Erro ao obter estatísticas:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    // Função para buscar pedidos do usuário logado
    static async meusPedidos(req, res) {
        try {
            const usuario_id = req.session.usuario.id;
            const pedidos = await PedidoCompleto.listarPedidosCompletos(usuario_id);
            res.json(pedidos);
        } catch (error) {
            console.error("Erro ao buscar meus pedidos:", error);
            res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }
}

module.exports = PedidoController;

