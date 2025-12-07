const pool = require("../config/database");

class Relatorio {
    /**
     * Gera o relatório de vendas por marca.
     * @param {number} mes - Mês para filtrar (1-12).
     * @param {number} ano - Ano para filtrar.
     * @returns {Promise<Array>} Lista de marcas com o total de carros vendidos.
     */
    static async vendasPorMarca(mes, ano) {
        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        if (mes && ano) {
            whereClause = `
                JOIN Pedido p ON p.id = ip.pedido_id
                WHERE EXTRACT(MONTH FROM p.data_pedido) = $${paramIndex++} AND EXTRACT(YEAR FROM p.data_pedido) = $${paramIndex++}
            `;
            params.push(mes, ano);
        } else if (ano) {
            whereClause = `
                JOIN Pedido p ON p.id = ip.pedido_id
                WHERE EXTRACT(YEAR FROM p.data_pedido) = $${paramIndex++}
            `;
            params.push(ano);
        }

        const sql = `
            SELECT
                c.marca,
                SUM(ip.quantidade) AS total_vendido
            FROM ItemPedido ip
            JOIN Carro c ON c.id = ip.carro_id
            ${whereClause}
            GROUP BY c.marca
            ORDER BY total_vendido DESC;
        `;
        const resultado = await pool.query(sql, params);
        return resultado.rows;
    }

    /**
     * Gera o relatório dos Top 5 carros mais vendidos.
     * @param {number} mes - Mês para filtrar (1-12).
     * @param {number} ano - Ano para filtrar.
     * @returns {Promise<Array>} Lista dos 5 carros mais vendidos.
     */
    static async top5CarrosMaisVendidos(mes, ano) {
        let whereClause = '';
        const params = [];
        let paramIndex = 1;

        if (mes && ano) {
            whereClause = `
                JOIN Pedido p ON p.id = ip.pedido_id
                WHERE EXTRACT(MONTH FROM p.data_pedido) = $${paramIndex++} AND EXTRACT(YEAR FROM p.data_pedido) = $${paramIndex++}
            `;
            params.push(mes, ano);
        } else if (ano) {
            whereClause = `
                JOIN Pedido p ON p.id = ip.pedido_id
                WHERE EXTRACT(YEAR FROM p.data_pedido) = $${paramIndex++}
            `;
            params.push(ano);
        }

        const sql = `
            SELECT
                c.modelo,
                c.marca,
                c.ano,
                SUM(ip.quantidade) AS total_vendido
            FROM ItemPedido ip
            JOIN Carro c ON c.id = ip.carro_id
            ${whereClause}
            GROUP BY c.id, c.modelo, c.marca, c.ano
            ORDER BY total_vendido DESC
            LIMIT 5;
        `;
        const resultado = await pool.query(sql, params);
        return resultado.rows;
    }
}

module.exports = Relatorio;
