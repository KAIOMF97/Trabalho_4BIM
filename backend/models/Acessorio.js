const pool = require('../config/database');

class Acessorio {
    static async criar(nome, descricao, preco) {
        try {
            const result = await pool.query(
                'INSERT INTO Acessorio (nome, descricao, preco) VALUES ($1, $2, $3) RETURNING *',
                [nome, descricao, preco]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async listarTodos() {
        try {
            const result = await pool.query('SELECT * FROM Acessorio ORDER BY nome');
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const result = await pool.query('SELECT * FROM Acessorio WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async atualizar(id, nome, descricao, preco) {
        try {
            const result = await pool.query(
                'UPDATE Acessorio SET nome = $1, descricao = $2, preco = $3 WHERE id = $4 RETURNING *',
                [nome, descricao, preco, id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deletar(id) {
        try {
            const result = await pool.query('DELETE FROM Acessorio WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async adicionarAoCarro(carroId, acessorioId, quantidade = 1) {
        try {
            const result = await pool.query(
                'INSERT INTO CarroAcessorio (carro_id, acessorio_id, quantidade) VALUES ($1, $2, $3) RETURNING *',
                [carroId, acessorioId, quantidade]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async adicionarMultiplosAoCarro(carroId, acessorios) {
        try {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                
                // Primeiro, remover todos os acessórios existentes do carro
                await client.query('DELETE FROM CarroAcessorio WHERE carro_id = $1', [carroId]);
                
                // Depois, adicionar os novos acessórios
                for (const acessorio of acessorios) {
                    await client.query(
                        'INSERT INTO CarroAcessorio (carro_id, acessorio_id, quantidade) VALUES ($1, $2, $3)',
                        [carroId, acessorio.acessorio_id, acessorio.quantidade]
                    );
                }
                
                await client.query('COMMIT');
                return true;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            throw error;
        }
    }

    static async removerDoCarro(carroId, acessorioId) {
        try {
            const result = await pool.query(
                'DELETE FROM CarroAcessorio WHERE carro_id = $1 AND acessorio_id = $2 RETURNING *',
                [carroId, acessorioId]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Acessorio;

