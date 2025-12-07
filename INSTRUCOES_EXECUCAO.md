# Instruções de Execução - AutoMax

## Guia Rápido de Instalação e Execução

### 1. Preparação do Ambiente

#### Instalar Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

#### Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviços
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configuração do Banco de Dados

```bash
# Configurar senha do usuário postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Criar banco de dados
sudo -u postgres createdb loja_carros

# Verificar se o banco foi criado
sudo -u postgres psql -l | grep loja_carros
```

### 3. Configuração do Projeto

```bash
# Navegar para o diretório do projeto
cd loja_carros

# Instalar dependências
npm install

# Verificar se as dependências foram instaladas
ls node_modules/
```

### 4. Inicialização do Banco de Dados

```bash
# Executar script de criação das tabelas
sudo -u postgres psql -d loja_carros -f database/database_schema.sql

# Inserir dados de exemplo
sudo -u postgres psql -d loja_carros -f database/dados_exemplo.sql

# Verificar se as tabelas foram criadas
sudo -u postgres psql -d loja_carros -c "\dt"
```

### 5. Execução do Servidor

```bash
# Iniciar o servidor
npm start

# O servidor estará disponível em: http://localhost:3000
```

### 6. Acesso ao Sistema

#### Página Principal
- URL: `http://localhost:3000`
- Descrição: Página inicial com listagem de carros

#### Login de Administrador
- URL: `http://localhost:3000/frontend/pages/login.html`
- Email: `admin@automax.com`
- Senha: `admin123`

#### Login de Cliente
- URL: `http://localhost:3000/frontend/pages/login.html`
- Email: `cliente@teste.com`
- Senha: `cliente123`

#### Painel Administrativo
- URL: `http://localhost:3000/frontend/pages/admin.html`
- Acesso: Apenas para usuários administradores

## Solução de Problemas Comuns

### Erro: "Cannot connect to database"
```bash
# Verificar se o PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar o PostgreSQL se necessário
sudo systemctl restart postgresql

# Verificar se o banco existe
sudo -u postgres psql -l | grep loja_carros
```

### Erro: "Port 3000 already in use"
```bash
# Encontrar processo usando a porta 3000
sudo lsof -i :3000

# Matar o processo (substitua PID pelo número do processo)
kill -9 PID

# Ou usar uma porta diferente modificando server.js
```

### Erro: "Permission denied" ao executar scripts SQL
```bash
# Copiar arquivos SQL para /tmp
sudo cp database/*.sql /tmp/

# Executar com permissões adequadas
sudo -u postgres psql -d loja_carros -f /tmp/database_schema.sql
sudo -u postgres psql -d loja_carros -f /tmp/dados_exemplo.sql
```

### Erro: "bcryptjs not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## Comandos Úteis para Desenvolvimento

### Verificar Status do Banco
```bash
# Conectar ao banco
sudo -u postgres psql -d loja_carros

# Listar tabelas
\dt

# Verificar dados de uma tabela
SELECT * FROM Usuario;

# Sair do psql
\q
```

### Logs do Servidor
```bash
# Executar com logs detalhados
DEBUG=* npm start

# Ou apenas logs da aplicação
npm start | tee server.log
```

### Backup do Banco de Dados
```bash
# Criar backup
sudo -u postgres pg_dump loja_carros > backup_loja_carros.sql

# Restaurar backup
sudo -u postgres psql -d loja_carros < backup_loja_carros.sql
```

## Estrutura de URLs do Sistema

### Páginas Públicas
- `/` - Página inicial
- `/frontend/pages/login.html` - Login
- `/frontend/pages/registro.html` - Registro
- `/frontend/pages/carros.html` - Listagem de carros

### Páginas Protegidas (Requer Login)
- `/frontend/pages/meus-pedidos.html` - Pedidos do usuário
- `/frontend/pages/carro-detalhes.html` - Detalhes e compra

### Páginas Administrativas (Requer Login Admin)
- `/frontend/pages/admin.html` - Painel de controle

### API Endpoints
- `/api/usuarios/*` - Endpoints de usuários
- `/api/carros/*` - Endpoints de carros
- `/api/acessorios/*` - Endpoints de acessórios
- `/api/pedidos/*` - Endpoints de pedidos

## Configurações Avançadas

### Alterar Porta do Servidor
Edite o arquivo `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Altere para a porta desejada
```

### Configurar Banco de Dados Remoto
Edite o arquivo `backend/config/database.js`:
```javascript
const pool = new Pool({
    user: 'seu_usuario',
    host: 'seu_host',
    database: 'loja_carros',
    password: 'sua_senha',
    port: 5432,
});
```

### Configurar CORS para Produção
Edite o arquivo `server.js`:
```javascript
app.use(cors({
    origin: 'https://seu-dominio.com',
    credentials: true
}));
```

## Monitoramento e Manutenção

### Verificar Performance
```bash
# Monitorar uso de CPU e memória
top -p $(pgrep node)

# Verificar conexões do banco
sudo -u postgres psql -d loja_carros -c "SELECT * FROM pg_stat_activity;"
```

### Limpeza de Logs
```bash
# Limpar logs do sistema (se aplicável)
sudo journalctl --vacuum-time=7d

# Rotacionar logs da aplicação
logrotate /etc/logrotate.d/loja_carros
```

## Deployment em Produção

### Preparação para Produção
1. Configurar variáveis de ambiente
2. Usar HTTPS
3. Configurar proxy reverso (nginx)
4. Implementar backup automático
5. Configurar monitoramento

### Exemplo de Configuração Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Contato e Suporte

Para dúvidas ou problemas:
1. Verifique este guia de instruções
2. Consulte o README.md principal
3. Verifique os logs de erro
4. Entre em contato com o desenvolvedor

---

**Nota**: Este sistema foi desenvolvido para fins educacionais seguindo os requisitos do projeto acadêmico. Para uso em produção, considere implementar medidas adicionais de segurança e performance.

