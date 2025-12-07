const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
    static async criar(nome, email, senha, tipo = 'cliente') {
        try {
            const senhaHash = await bcrypt.hash(senha, 10);
            const result = await pool.query(
                'INSERT INTO Usuario (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING *',
                [nome, email, senhaHash, tipo]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorEmail(email) {
        try {
            const result = await pool.query('SELECT * FROM Usuario WHERE email = $1', [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorId(id) {
        try {
            const result = await pool.query('SELECT * FROM Usuario WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async listarTodos() {
        try {
            const result = await pool.query('SELECT id, nome, email, tipo FROM Usuario ORDER BY nome');
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async atualizar(id, nome, email, tipo) {
        try {
            const result = await pool.query(
                'UPDATE Usuario SET nome = $1, email = $2, tipo = $3 WHERE id = $4 RETURNING *',
                [nome, email, tipo, id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deletar(id) {
        try {
            const result = await pool.query('DELETE FROM Usuario WHERE id = $1 RETURNING *', [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async verificarSenha(senhaPlana, senhaHash) {
        return await bcrypt.compare(senhaPlana, senhaHash);
    }
}

module.exports = Usuario;

