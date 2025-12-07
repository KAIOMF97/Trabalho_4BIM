const pool = require('../config/database');

class Pedido {
    static async criar(usuario_id, status = 'pendente') {
        try {
            const result = await pool.query(
                'INSERT INTO Pedido (usuario_id, status) VALUES ($1, $2) RETURNING *',
                [usuario_id, status]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async listarTodos() {
        try {
            const result = await pool.query(`
                SELECT p.*, u.nome as usuario_nome, u.email as usuario_email
                FROM Pedido p
                JOIN Usuario u ON p.usuario_id = u.id
                ORDER BY p.data_pedido DESC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const result = await pool.query(`
                SELECT p.*, u.nome as usuario_nome, u.email as usuario_email
                FROM Pedido p
                JOIN Usuario u ON p.usuario_id = u.id
                WHERE p.id = $1
            `, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorUsuario(usuario_id) {
        try {
            const result = await pool.query('SELECT * FROM Pedido WHERE usuario_id = $1 ORDER BY data_pedido DESC', [usuario_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async atualizar(id, status) {
        try {
            const result = await pool.query(
                'UPDATE Pedido SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deletar(id) {
        try {
            const result = await pool.query('DELETE FROM Pedido WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async adicionarItem(pedido_id, carro_id, quantidade, preco_unitario) {
        try {
            const result = await pool.query(
                'INSERT INTO ItemPedido (pedido_id, carro_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
                [pedido_id, carro_id, quantidade, preco_unitario]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarItens(pedido_id) {
        try {
            const result = await pool.query(`
                SELECT ip.*, c.modelo, c.marca, c.ano
                FROM ItemPedido ip
                JOIN Carro c ON ip.carro_id = c.id
                WHERE ip.pedido_id = $1
            `, [pedido_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Pedido;

