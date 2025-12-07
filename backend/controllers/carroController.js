const Carro = require('../models/Carro');
const DetalhesCarro = require('../models/DetalhesCarro');
const fs = require('fs');
const path = require('path');

class CarroController {
    static async criar(req, res) {
        try {
            let { modelo, marca, ano, preco, descricao, acessorios } = req.body;
            
            // Verificar se uma imagem foi enviada
            let imagem_url = null;
            if (req.file) {
                imagem_url = `/uploads/carros/${req.file.filename}`;
            }
            
            const novoCarro = await Carro.criar(modelo, marca, ano, preco, descricao, imagem_url);
            
            // Se acessórios foram fornecidos, adicionar ao carro
            // Parse da string JSON se necessário (quando vem de FormData)
            if (acessorios) {
                if (typeof acessorios === 'string') {
                    try {
                        acessorios = JSON.parse(acessorios);
                    } catch (parseError) {
                        console.error('Erro ao fazer parse dos acessórios:', parseError);
                        acessorios = null;
                    }
                }
                
                if (Array.isArray(acessorios) && acessorios.length > 0) {
                    const Acessorio = require('../models/Acessorio');
                    await Acessorio.adicionarMultiplosAoCarro(novoCarro.id, acessorios);
                }
            }
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Carro criado com sucesso',
                carro: novoCarro 
            });
        } catch (error) {
            console.error('Erro ao criar carro:', error);
            
            // Remover arquivo de imagem se houve erro
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Erro ao remover arquivo:', unlinkError);
                }
            }
            
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async listar(req, res) {
        try {
            const carros = await Carro.listarTodos();
            res.json(carros);
        } catch (error) {
            console.error('Erro ao listar carros:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const carro = await Carro.buscarPorId(id);
            
            if (!carro) {
                return res.status(404).json({ erro: 'Carro não encontrado' });
            }
            
            res.json(carro);
        } catch (error) {
            console.error('Erro ao buscar carro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async buscarComDetalhes(req, res) {
        try {
            const { id } = req.params;
            const carro = await Carro.buscarComDetalhes(id);
            
            if (!carro) {
                return res.status(404).json({ erro: 'Carro não encontrado' });
            }
            
            res.json(carro);
        } catch (error) {
            console.error('Erro ao buscar carro com detalhes:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async buscarComAcessorios(req, res) {
        try {
            const { id } = req.params;
            const resultados = await Carro.buscarComAcessorios(id);
            
            if (!resultados || resultados.length === 0) {
                return res.status(404).json({ erro: 'Carro não encontrado' });
            }

            // Organizar os dados do carro e acessórios
            const carro = {
                id: resultados[0].id,
                modelo: resultados[0].modelo,
                marca: resultados[0].marca,
                ano: resultados[0].ano,
                preco: resultados[0].preco,
                descricao: resultados[0].descricao,
                imagem_url: resultados[0].imagem_url,
                acessorios: []
            };

            // Adicionar acessórios se existirem
            resultados.forEach(row => {
                if (row.acessorio_id) {
                    carro.acessorios.push({
                        id: row.acessorio_id,
                        nome: row.acessorio_nome,
                        descricao: row.acessorio_descricao,
                        preco: row.acessorio_preco,
                        quantidade: row.quantidade
                    });
                }
            });
            
            res.json(carro);
        } catch (error) {
            console.error('Erro ao buscar carro com acessórios:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            let { modelo, marca, ano, preco, descricao, acessorios } = req.body;

            // Buscar carro atual para obter a imagem existente
            const carroAtual = await Carro.buscarPorId(id);
            if (!carroAtual) {
                // Remover arquivo de imagem se houve erro
                if (req.file) {
                    try {
                        fs.unlinkSync(req.file.path);
                    } catch (unlinkError) {
                        console.error('Erro ao remover arquivo:', unlinkError);
                    }
                }
                return res.status(404).json({ erro: 'Carro não encontrado' });
            }

            let imagem_url = carroAtual.imagem_url; // Manter imagem atual por padrão
            
            // Se uma nova imagem foi enviada
            if (req.file) {
                imagem_url = `/uploads/carros/${req.file.filename}`;
                
                // Remover imagem antiga se existir
                if (carroAtual.imagem_url && carroAtual.imagem_url.startsWith('/uploads/')) {
                    const imagemAntigaPath = path.join(__dirname, '../../', carroAtual.imagem_url);
                    try {
                        if (fs.existsSync(imagemAntigaPath)) {
                            fs.unlinkSync(imagemAntigaPath);
                        }
                    } catch (unlinkError) {
                        console.error('Erro ao remover imagem antiga:', unlinkError);
                    }
                }
            }

            const carro = await Carro.atualizar(id, modelo, marca, ano, preco, descricao, imagem_url);
            
            // Se acessórios foram fornecidos, atualizar os acessórios do carro
            // Parse da string JSON se necessário (quando vem de FormData)
            if (acessorios) {
                if (typeof acessorios === 'string') {
                    try {
                        acessorios = JSON.parse(acessorios);
                    } catch (parseError) {
                        console.error('Erro ao fazer parse dos acessórios:', parseError);
                        acessorios = null;
                    }
                }
                
                if (Array.isArray(acessorios)) {
                    const Acessorio = require('../models/Acessorio');
                    await Acessorio.adicionarMultiplosAoCarro(id, acessorios);
                }
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Carro atualizado com sucesso',
                carro: carro 
            });
        } catch (error) {
            console.error('Erro ao atualizar carro:', error);
            
            // Remover arquivo de imagem se houve erro
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Erro ao remover arquivo:', unlinkError);
                }
            }
            
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;
            
            // Buscar carro para obter informações da imagem antes de deletar
            const carro = await Carro.buscarPorId(id);
            if (!carro) {
                return res.status(404).json({ erro: 'Carro não encontrado' });
            }
            
            // Deletar carro do banco de dados
            const carroRemovido = await Carro.deletar(id);
            
            // Remover imagem do servidor se existir
            if (carro.imagem_url && carro.imagem_url.startsWith('/uploads/')) {
                const imagemPath = path.join(__dirname, '../../', carro.imagem_url);
                try {
                    if (fs.existsSync(imagemPath)) {
                        fs.unlinkSync(imagemPath);
                    }
                } catch (unlinkError) {
                    console.error('Erro ao remover imagem:', unlinkError);
                }
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Carro deletado com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao deletar carro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async criarDetalhes(req, res) {
        try {
            const { carro_id } = req.params;
            const { cor, quilometragem, tipo_combustivel, num_portas } = req.body;
            
            const detalhes = await DetalhesCarro.criar(carro_id, cor, quilometragem, tipo_combustivel, num_portas);
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Detalhes do carro criados com sucesso',
                detalhes: detalhes 
            });
        } catch (error) {
            console.error('Erro ao criar detalhes do carro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async atualizarDetalhes(req, res) {
        try {
            const { carro_id } = req.params;
            const { cor, quilometragem, tipo_combustivel, num_portas } = req.body;
            
            const detalhes = await DetalhesCarro.atualizar(carro_id, cor, quilometragem, tipo_combustivel, num_portas);
            
            if (!detalhes) {
                return res.status(404).json({ erro: 'Detalhes do carro não encontrados' });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Detalhes do carro atualizados com sucesso',
                detalhes: detalhes 
            });
        } catch (error) {
            console.error('Erro ao atualizar detalhes do carro:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
}

module.exports = CarroController;

