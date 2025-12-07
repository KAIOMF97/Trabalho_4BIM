const Usuario = require('../models/Usuario');

class UsuarioController {
    static async registrar(req, res) {
        try {
            const { nome, email, senha, tipo } = req.body;

            // Verificar se o usuário já existe
            const usuarioExistente = await Usuario.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(400).json({ erro: 'Email já cadastrado' });
            }

            // Criar novo usuário
            const novoUsuario = await Usuario.criar(nome, email, senha, tipo);
            
            // Remover senha da resposta
            delete novoUsuario.senha;
            
            res.status(201).json({ 
                sucesso: true, 
                mensagem: 'Usuário criado com sucesso',
                usuario: novoUsuario 
            });
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Buscar usuário por email
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'Credenciais inválidas' });
            }

            // Verificar senha
            const senhaValida = await Usuario.verificarSenha(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas' });
            }

            // Criar sessão
            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            };

            // Remover senha da resposta
            delete usuario.senha;

            res.json({ 
                sucesso: true, 
                mensagem: 'Login realizado com sucesso',
                usuario: usuario 
            });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ erro: 'Erro ao fazer logout' });
                }
                res.clearCookie('connect.sid');
                res.json({ sucesso: true, mensagem: 'Logout realizado com sucesso' });
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async verificarSessao(req, res) {
        try {
            if (req.session.usuario) {
                res.json({ 
                    logado: true, 
                    usuario: req.session.usuario 
                });
            } else {
                res.json({ logado: false });
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async listar(req, res) {
        try {
            const usuarios = await Usuario.listarTodos();
            res.json(usuarios);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.buscarPorId(id);
            
            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            // Remover senha da resposta
            delete usuario.senha;
            
            res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, tipo } = req.body;

            const usuario = await Usuario.atualizar(id, nome, email, tipo);
            
            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            // Remover senha da resposta
            delete usuario.senha;
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Usuário atualizado com sucesso',
                usuario: usuario 
            });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuario.deletar(id);
            
            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: 'Usuário deletado com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
}

module.exports = UsuarioController;

