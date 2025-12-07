const pool = require('../config/database');

class Carro {
    static async criar(modelo, marca, ano, preco, descricao, imagem_url) {
        try {
            const result = await pool.query(
                'INSERT INTO Carro (modelo, marca, ano, preco, descricao, imagem_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [modelo, marca, ano, preco, descricao, imagem_url]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async listarTodos() {
        try {
            const result = await pool.query('SELECT * FROM Carro ORDER BY modelo');
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const result = await pool.query('SELECT * FROM Carro WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async atualizar(id, modelo, marca, ano, preco, descricao, imagem_url) {
        try {
            const result = await pool.query(
                'UPDATE Carro SET modelo = $1, marca = $2, ano = $3, preco = $4, descricao = $5, imagem_url = $6 WHERE id = $7 RETURNING *',
                [modelo, marca, ano, preco, descricao, imagem_url, id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deletar(id) {
        try {
            const result = await pool.query('DELETE FROM Carro WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarComDetalhes(id) {
        try {
            const result = await pool.query(`
                SELECT c.*, d.cor, d.quilometragem, d.tipo_combustivel, d.num_portas
                FROM Carro c
                LEFT JOIN DetalhesCarro d ON c.id = d.carro_id
                WHERE c.id = $1
            `, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarComAcessorios(id) {
        try {
            const result = await pool.query(`
                SELECT c.*, a.id as acessorio_id, a.nome as acessorio_nome, a.descricao as acessorio_descricao, a.preco as acessorio_preco, ca.quantidade
                FROM Carro c
                LEFT JOIN CarroAcessorio ca ON c.id = ca.carro_id
                LEFT JOIN Acessorio a ON ca.acessorio_id = a.id
                WHERE c.id = $1
            `, [id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Carro;

