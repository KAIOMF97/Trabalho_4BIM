class API {
    static baseURL = '/api';

    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            return { erro: 'Erro de conexão' };
        }
    }

    // Carros
    static async listarCarros() {
        return await API.request('/carros');
    }

    static async buscarCarro(id) {
        return await API.request(`/carros/${id}`);
    }

    static async obterCarro(id) {
        return await API.buscarCarro(id);
    }

    static async buscarCarroComDetalhes(id) {
        return await API.request(`/carros/${id}/detalhes`);
    }

    static async buscarCarroComAcessorios(id) {
        return await API.request(`/carros/${id}/acessorios`);
    }

    static async criarCarro(carro) {
        return await API.request('/carros', {
            method: 'POST',
            body: JSON.stringify(carro),
        });
    }

    static async criarCarroComImagem(formData) {
        try {
            const response = await fetch(`${API.baseURL}/carros`, {
                method: 'POST',
                body: formData, // FormData não precisa de Content-Type
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            return { erro: 'Erro de conexão' };
        }
    }

    static async atualizarCarro(id, carro) {
        return await API.request(`/carros/${id}`, {
            method: 'PUT',
            body: JSON.stringify(carro),
        });
    }

    static async atualizarCarroComImagem(id, formData) {
        try {
            const response = await fetch(`${API.baseURL}/carros/${id}`, {
                method: 'PUT',
                body: formData, // FormData não precisa de Content-Type
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            return { erro: 'Erro de conexão' };
        }
    }

    static async deletarCarro(id) {
        return await API.request(`/carros/${id}`, {
            method: 'DELETE',
        });
    }

    static async criarDetalhesCarro(carroId, detalhes) {
        return await API.request(`/carros/${carroId}/detalhes`, {
            method: 'POST',
            body: JSON.stringify(detalhes),
        });
    }

    static async atualizarDetalhesCarro(carroId, detalhes) {
        return await API.request(`/carros/${carroId}/detalhes`, {
            method: 'PUT',
            body: JSON.stringify(detalhes),
        });
    }

    // Acessórios
    static async listarAcessorios() {
        return await API.request('/acessorios');
    }

    static async buscarAcessorio(id) {
        return await API.request(`/acessorios/${id}`);
    }

    static async criarAcessorio(acessorio) {
        return await API.request('/acessorios', {
            method: 'POST',
            body: JSON.stringify(acessorio),
        });
    }

    static async atualizarAcessorio(id, acessorio) {
        return await API.request(`/acessorios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(acessorio),
        });
    }

    static async deletarAcessorio(id) {
        return await API.request(`/acessorios/${id}`, {
            method: 'DELETE',
        });
    }

    static async adicionarAcessorioAoCarro(carroId, acessorioId) {
        return await API.request('/acessorios/carro/adicionar', {
            method: 'POST',
            body: JSON.stringify({ carroId, acessorioId }),
        });
    }

    static async removerAcessorioDoCarro(carroId, acessorioId) {
        return await API.request('/acessorios/carro/remover', {
            method: 'DELETE',
            body: JSON.stringify({ carroId, acessorioId }),
        });
    }

    // Pedidos
    static async listarPedidos() {
        return await API.request('/pedidos');
    }

    static async buscarPedido(id) {
        return await API.request(`/pedidos/${id}`);
    }

    static async buscarPedidosUsuario(usuarioId) {
        return await API.request(`/pedidos/usuario/${usuarioId}`);
    }

    static async criarPedido(pedido) {
        return await API.request('/pedidos', {
            method: 'POST',
            body: JSON.stringify(pedido),
        });
    }

    static async comprarCarro(carroId, quantidade = 1) {
        return await API.request('/pedidos/comprar', {
            method: 'POST',
            body: JSON.stringify({ carro_id: carroId, quantidade }),
        });
    }

    static async checkoutCompleto(dadosCheckout) {
        return await API.request('/pedidos/checkout-completo', {
            method: 'POST',
            body: JSON.stringify(dadosCheckout),
        });
    }

    static async meusPedidos() {
        return await API.request('/pedidos/meus-pedidos');
    }

    static async obterEstatisticasPedidos() {
        return await API.request('/pedidos/estatisticas');
    }

    static async atualizarPedido(id, status) {
        return await API.request(`/pedidos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    static async deletarPedido(id) {
        return await API.request(`/pedidos/${id}`, {
            method: 'DELETE',
        });
    }

    static async buscarItensPedido(pedidoId) {
        return await API.request(`/pedidos/${pedidoId}/itens`);
    }

    // Usuários
    static async listarUsuarios() {
        return await API.request('/usuarios');
    }

    static async buscarUsuario(id) {
        return await API.request(`/usuarios/${id}`);
    }

    static async atualizarUsuario(id, usuario) {
        return await API.request(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuario),
        });
    }

    static async deletarUsuario(id) {
        return await API.request(`/usuarios/${id}`, {
            method: 'DELETE',
        });
    }

    // Relatórios
    static async getVendasPorMarca(queryParams = '') {
        let url = '/relatorios/vendas-por-marca';
        if (queryParams) url += `?${queryParams}`;
        return await API.request(url);
    }

    static async getTop5CarrosMaisVendidos(queryParams = '') {
        let url = '/relatorios/top-5-carros';
        if (queryParams) url += `?${queryParams}`;
        return await API.request(url);
    }
}

// Exportar a classe API para uso em outros arquivos
// (A classe já está sendo exportada implicitamente, mas é bom garantir)
// module.exports = API; // Não é necessário em ambiente de browser
