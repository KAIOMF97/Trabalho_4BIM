const pool = require("../config/database");

class Donut {
    static async criar(nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto) {
        try {
            const result = await pool.query(
                "INSERT INTO produtos (nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async listarTodos() {
        try {
            const result = await pool.query(`
                SELECT p.*, c.nome_categoria 
                FROM produtos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id_categoria 
                WHERE p.ativo = true 
                ORDER BY p.nome_produto
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const result = await pool.query(`
                SELECT p.*, c.nome_categoria 
                FROM produtos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id_categoria 
                WHERE p.id_produto = $1 AND p.ativo = true
            `, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async atualizar(id, nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto) {
        try {
            const result = await pool.query(
                "UPDATE produtos SET nome_produto = $1, descricao_produto = $2, preco_produto = $3, quantidade_estoque = $4, categoria_id = $5, imagem_produto = $6 WHERE id_produto = $7 RETURNING *",
                [nome_produto, descricao_produto, preco_produto, quantidade_estoque, categoria_id, imagem_produto, id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deletar(id) {
        try {
            const result = await pool.query("UPDATE produtos SET ativo = false WHERE id_produto = $1 RETURNING id_produto", [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async listarPorCategoria(categoria_id) {
        try {
            const result = await pool.query(`
                SELECT p.*, c.nome_categoria 
                FROM produtos p 
                LEFT JOIN categorias c ON p.categoria_id = c.id_categoria 
                WHERE p.categoria_id = $1 AND p.ativo = true 
                ORDER BY p.nome_produto
            `, [categoria_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Donut;

