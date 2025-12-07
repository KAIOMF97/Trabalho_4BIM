const pool = require('../config/database');
const crypto = require('crypto');

class PedidoCompleto {
    static async criarPedidoCompleto(dadosCheckout) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { 
                usuario_id, 
                carro_id, 
                dadosPessoais, 
                endereco, 
                pagamento, 
                cartao 
            } = dadosCheckout;
            
            // 1. Buscar dados do carro
            const carroResult = await client.query('SELECT * FROM Carro WHERE id = $1', [carro_id]);
            if (carroResult.rows.length === 0) {
                throw new Error('Carro não encontrado');
            }
            const carro = carroResult.rows[0];
            
            // 2. Criar o pedido principal
            const pedidoResult = await client.query(`
                INSERT INTO Pedido (usuario_id, status, valor_total, metodo_pagamento, observacoes) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `, [
                usuario_id, 
                'pendente', 
                pagamento.parcelamento.total,
                pagamento.metodo,
                `Compra de ${carro.modelo} - ${carro.marca} ${carro.ano}`
            ]);
            const pedido = pedidoResult.rows[0];
            
            // 3. Adicionar item do pedido
            await client.query(`
                INSERT INTO ItemPedido (pedido_id, carro_id, quantidade, preco_unitario) 
                VALUES ($1, $2, $3, $4)
            `, [pedido.id, carro_id, 1, carro.preco]);
            
            // 4. Salvar dados pessoais do checkout
            await client.query(`
                INSERT INTO DadosCheckout (
                    pedido_id, nome_completo, cpf, email, telefone, 
                    data_nascimento, rg
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                pedido.id,
                dadosPessoais.nome,
                dadosPessoais.cpf,
                dadosPessoais.email,
                dadosPessoais.telefone,
                dadosPessoais.dataNascimento,
                dadosPessoais.rg
            ]);
            
            // 5. Salvar endereço de entrega
            await client.query(`
                INSERT INTO EnderecoEntrega (
                    pedido_id, cep, cidade, endereco, estado, complemento
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                pedido.id,
                endereco.cep,
                endereco.cidade,
                endereco.endereco,
                endereco.estado,
                endereco.complemento || null
            ]);
            
            // 6. Salvar dados de pagamento
            await client.query(`
                INSERT INTO DadosPagamento (
                    pedido_id, metodo_pagamento, parcelas, valor_parcela, 
                    valor_total, taxa_juros
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                pedido.id,
                pagamento.metodo,
                pagamento.parcelamento.parcelas,
                pagamento.parcelamento.valor,
                pagamento.parcelamento.total,
                pagamento.parcelamento.juros / 100 || 0
            ]);
            
            // 7. Salvar dados do cartão (se aplicável)
            if (cartao && pagamento.metodo !== 'financing') {
                // Hash dos últimos 4 dígitos para exibição segura
                const numeroLimpo = cartao.numero.replace(/\D/g, '');
                const ultimosDigitos = numeroLimpo.slice(-4);
                const numeroHash = `****-****-****-${ultimosDigitos}`;
                
                await client.query(`
                    INSERT INTO DadosCartao (
                        pedido_id, numero_cartao_hash, nome_cartao, 
                        mes_vencimento, ano_vencimento
                    ) VALUES ($1, $2, $3, $4, $5)
                `, [
                    pedido.id,
                    numeroHash,
                    cartao.nome,
                    parseInt(cartao.mesVencimento),
                    parseInt(cartao.anoVencimento)
                ]);
            }
            
            await client.query('COMMIT');
            
            return {
                sucesso: true,
                pedido: pedido,
                pedidoId: pedido.id,
                mensagem: 'Pedido criado com sucesso'
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao criar pedido completo:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    
    static async buscarPedidoCompleto(pedidoId) {
        try {
            // Buscar dados principais do pedido
            const pedidoResult = await pool.query(`
                SELECT p.*, u.nome as usuario_nome, u.email as usuario_email
                FROM Pedido p
                JOIN Usuario u ON p.usuario_id = u.id
                WHERE p.id = $1
            `, [pedidoId]);
            
            if (pedidoResult.rows.length === 0) {
                return null;
            }
            
            const pedido = pedidoResult.rows[0];
            
            // Buscar itens do pedido
            const itensResult = await pool.query(`
                SELECT ip.*, c.modelo, c.marca, c.ano, c.imagem_url
                FROM ItemPedido ip
                JOIN Carro c ON ip.carro_id = c.id
                WHERE ip.pedido_id = $1
            `, [pedidoId]);
            
            // Buscar dados do checkout
            const dadosCheckoutResult = await pool.query(`
                SELECT * FROM DadosCheckout WHERE pedido_id = $1
            `, [pedidoId]);
            
            // Buscar endereço de entrega
            const enderecoResult = await pool.query(`
                SELECT * FROM EnderecoEntrega WHERE pedido_id = $1
            `, [pedidoId]);
            
            // Buscar dados de pagamento
            const pagamentoResult = await pool.query(`
                SELECT * FROM DadosPagamento WHERE pedido_id = $1
            `, [pedidoId]);
            
            // Buscar dados do cartão
            const cartaoResult = await pool.query(`
                SELECT * FROM DadosCartao WHERE pedido_id = $1
            `, [pedidoId]);
            
            return {
                pedido: pedido,
                itens: itensResult.rows,
                dadosCheckout: dadosCheckoutResult.rows[0] || null,
                endereco: enderecoResult.rows[0] || null,
                pagamento: pagamentoResult.rows[0] || null,
                cartao: cartaoResult.rows[0] || null
            };
            
        } catch (error) {
            console.error('Erro ao buscar pedido completo:', error);
            throw error;
        }
    }
    
    static async listarPedidosCompletos(usuario_id = null) {
        try {
            let query = `
                SELECT 
                    p.*,
                    u.nome as usuario_nome,
                    u.email as usuario_email,
                    dc.nome_completo,
                    dc.cpf,
                    dc.telefone,
                    dc.email as email_checkout,
                    ee.cep,
                    ee.cidade as endereco_cidade,
                    ee.endereco as endereco_completo,
                    ee.estado as endereco_estado,
                    dp.metodo_pagamento,
                    dp.parcelas,
                    dp.valor_parcela,
                    dp.valor_total,
                    c.modelo as carro_modelo,
                    c.marca as carro_marca,
                    c.ano as carro_ano,
                    c.preco as carro_preco,
                    COUNT(ip.id) as total_itens
                FROM Pedido p
                JOIN Usuario u ON p.usuario_id = u.id
                LEFT JOIN DadosCheckout dc ON p.id = dc.pedido_id
                LEFT JOIN EnderecoEntrega ee ON p.id = ee.pedido_id
                LEFT JOIN DadosPagamento dp ON p.id = dp.pedido_id
                LEFT JOIN ItemPedido ip ON p.id = ip.pedido_id
                LEFT JOIN Carro c ON ip.carro_id = c.id
            `;
            
            let params = [];
            
            if (usuario_id) {
                query += ' WHERE p.usuario_id = $1';
                params.push(usuario_id);
            }
            
            query += `
                GROUP BY p.id, u.nome, u.email, dc.nome_completo, dc.cpf, dc.telefone, dc.email,
                         ee.cep, ee.cidade, ee.endereco, ee.estado,
                         dp.metodo_pagamento, dp.parcelas, dp.valor_parcela, dp.valor_total,
                         c.modelo, c.marca, c.ano, c.preco
                ORDER BY p.data_pedido DESC
            `;
            
            const result = await pool.query(query, params);
            return result.rows;
            
        } catch (error) {
            console.error('Erro ao listar pedidos completos:', error);
            throw error;
        }
    }
    
    static async atualizarStatusPedido(pedidoId, novoStatus, observacoes = null) {
        try {
            let query = 'UPDATE Pedido SET status = $1';
            let params = [novoStatus, pedidoId];
            
            if (observacoes) {
                query += ', observacoes = $3';
                params.splice(2, 0, observacoes);
            }
            
            query += ' WHERE id = $2 RETURNING *';
            
            const result = await pool.query(query, params);
            return result.rows[0];
            
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            throw error;
        }
    }
    
    static async obterEstatisticasPedidos() {
        try {
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_pedidos,
                    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
                    COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
                    COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
                    COALESCE(SUM(valor_total), 0) as valor_total_vendas,
                    COALESCE(AVG(valor_total), 0) as ticket_medio
                FROM Pedido
                WHERE data_pedido >= CURRENT_DATE - INTERVAL '30 days'
            `);
            
            return result.rows[0];
            
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }
}

module.exports = PedidoCompleto;
