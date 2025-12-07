const pool = require('../config/database');

class DetalhesCarro {
    static async criar(carro_id, cor, quilometragem, tipo_combustivel, num_portas) {
        try {
            const result = await pool.query(
                'INSERT INTO DetalhesCarro (carro_id, cor, quilometragem, tipo_combustivel, num_portas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [carro_id, cor, quilometragem, tipo_combustivel, num_portas]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async buscarPorCarroId(carro_id) {
        try {
            const result = await pool.query('SELECT * FROM DetalhesCarro WHERE carro_id = $1', [carro_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async atualizar(carro_id, cor, quilometragem, tipo_combustivel, num_portas) {
        try {
            const result = await pool.query(
                'UPDATE DetalhesCarro SET cor = $1, quilometragem = $2, tipo_combustivel = $3, num_portas = $4 WHERE carro_id = $5 RETURNING *',
                [cor, quilometragem, tipo_combustivel, num_portas, carro_id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deletar(carro_id) {
        try {
            const result = await pool.query('DELETE FROM DetalhesCarro WHERE carro_id = $1 RETURNING *', [carro_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = DetalhesCarro;

