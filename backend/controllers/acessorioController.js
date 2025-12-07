const Acessorio = require('../models/Acessorio');

class AcessorioController {
    static async criar(req, res) {
        try {
            const { nome, descricao, preco } = req.body;
            
            const novoAcessorio = await Acessorio.criar(nome, descricao, preco);
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Acessório criado com sucesso',
                acessorio: novoAcessorio 
            });
        } catch (error) {
            console.error('Erro ao criar acessório:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async listar(req, res) {
        try {
            const acessorios = await Acessorio.listarTodos();
            res.json(acessorios);
        } catch (error) {
            console.error('Erro ao listar acessórios:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const acessorio = await Acessorio.buscarPorId(id);
            
            if (!acessorio) {
                return res.status(404).json({ erro: 'Acessório não encontrado' });
            }
            
            res.json(acessorio);
        } catch (error) {
            console.error('Erro ao buscar acessório:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao, preco } = req.body;

            const acessorio = await Acessorio.atualizar(id, nome, descricao, preco);
            
            if (!acessorio) {
                return res.status(404).json({ erro: 'Acessório não encontrado' });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Acessório atualizado com sucesso',
                acessorio: acessorio 
            });
        } catch (error) {
            console.error('Erro ao atualizar acessório:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const acessorio = await Acessorio.deletar(id);
            
            if (!acessorio) {
                return res.status(404).json({ erro: 'Acessório não encontrado' });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Acessório deletado com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao deletar acessório:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async adicionarAoCarro(req, res) {
        try {
            const { carroId, acessorioId } = req.body;
            
            const resultado = await Acessorio.adicionarAoCarro(carroId, acessorioId);
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Acessório adicionado ao carro com sucesso',
                relacao: resultado 
            });
        } catch (error) {
            console.error('Erro ao adicionar acessório ao carro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async removerDoCarro(req, res) {
        try {
            const { carroId, acessorioId } = req.body;
            
            const resultado = await Acessorio.removerDoCarro(carroId, acessorioId);
            
            if (!resultado) {
                return res.status(404).json({ erro: 'Relação não encontrada' });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Acessório removido do carro com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao remover acessório do carro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
}

module.exports = AcessorioController;

