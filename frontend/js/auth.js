class Auth {
    static async verificarSessao() {
        try {
            const response = await fetch('/api/usuarios/sessao');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            return { logado: false };
        }
    }

    static async login(email, senha) {
        try {
            const response = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { sucesso: false, erro: 'Erro de conexão' };
        }
    }

    static async registrar(nome, email, senha, tipo = 'cliente') {
        try {
            const response = await fetch('/api/usuarios/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, email, senha, tipo }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao registrar:', error);
            return { sucesso: false, erro: 'Erro de conexão' };
        }
    }

    static async logout() {
        try {
            const response = await fetch('/api/usuarios/logout', {
                method: 'POST',
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { sucesso: false, erro: 'Erro de conexão' };
        }
    }

    static atualizarInterface(usuario) {
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');
        const adminPanel = document.getElementById('admin-panel');

        if (usuario) {
            // Usuário logado
            if (userInfo) {
                userInfo.innerHTML = `
                    <span>Olá, ${usuario.nome}</span>
                    ${usuario.tipo === 'admin' ? '<a href="/frontend/pages/admin.html" class="btn btn-secondary" id="admin-btn">Painel de Controle</a>' : ''}
                    <button class="btn btn-danger" id="logout-btn">Logout</button>
                `;

                // Adicionar evento de logout
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async () => {
                        const result = await Auth.logout();
                        if (result.sucesso) {
                            window.location.href = '/';
                        }
                    });
                }
            }

            if (loginBtn) {
                loginBtn.style.display = 'none';
            }

            if (adminPanel && usuario.tipo === 'admin') {
                adminPanel.style.display = 'block';
            }
        } else {
            // Usuário não logado
            if (userInfo) {
                userInfo.innerHTML = '';
            }

            if (loginBtn) {
                loginBtn.style.display = 'inline-block';
            }

            if (adminPanel) {
                adminPanel.style.display = 'none';
            }
        }
    }

    static async inicializar() {
        const sessao = await Auth.verificarSessao();
        if (sessao.logado) {
            Auth.atualizarInterface(sessao.usuario);
        } else {
            Auth.atualizarInterface(null);
        }
        return sessao;
    }

    static redirecionarSeNaoLogado() {
        Auth.verificarSessao().then(sessao => {
            if (!sessao.logado) {
                window.location.href = '/frontend/pages/login.html';
            }
        });
    }

    static redirecionarSeNaoAdmin() {
        Auth.verificarSessao().then(sessao => {
            if (!sessao.logado || sessao.usuario.tipo !== 'admin') {
                window.location.href = '/';
            }
        });
    }
}

// Inicializar autenticação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    Auth.inicializar();
});

