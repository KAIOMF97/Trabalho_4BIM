# AutoMax - Sistema de Loja de Carros

## Descrição do Projeto

O AutoMax é um sistema completo de loja de carros desenvolvido com tecnologias web modernas, incluindo frontend em HTML, CSS e JavaScript, backend estruturado com Node.js e Express, e banco de dados PostgreSQL. O sistema oferece funcionalidades completas de e-commerce para venda de carros, com diferentes níveis de acesso para clientes e administradores.

## Funcionalidades Principais

### Para Clientes
- **Navegação de Carros**: Visualização de todos os carros disponíveis na loja
- **Detalhes do Produto**: Página detalhada de cada carro com especificações completas
- **Sistema de Compra**: Funcionalidade para realizar pedidos de carros
- **Autenticação**: Sistema de login e registro para clientes
- **Histórico de Pedidos**: Visualização dos pedidos realizados pelo cliente

### Para Administradores
- **Painel de Controle**: Interface administrativa completa
- **Gerenciamento de Carros**: CRUD completo para carros (criar, ler, atualizar, deletar)
- **Gerenciamento de Acessórios**: CRUD para acessórios de carros
- **Gerenciamento de Pedidos**: Visualização e controle de status dos pedidos
- **Gerenciamento de Usuários**: Administração de contas de usuários

## Arquitetura do Sistema

### Backend (Node.js + Express)
```
backend/
├── config/
│   └── database.js          # Configuração do banco de dados
├── controllers/
│   ├── usuarioController.js # Controlador de usuários
│   ├── carroController.js   # Controlador de carros
│   ├── acessorioController.js # Controlador de acessórios
│   └── pedidoController.js  # Controlador de pedidos
├── models/
│   ├── Usuario.js           # Modelo de usuário
│   ├── Carro.js            # Modelo de carro
│   ├── Acessorio.js        # Modelo de acessório
│   ├── DetalhesCarro.js    # Modelo de detalhes do carro
│   └── Pedido.js           # Modelo de pedido
└── routes/
    ├── usuarioRoutes.js     # Rotas de usuários
    ├── carroRoutes.js       # Rotas de carros
    ├── acessorioRoutes.js   # Rotas de acessórios
    └── pedidoRoutes.js      # Rotas de pedidos
```

### Frontend (HTML + CSS + JavaScript)
```
frontend/
├── css/
│   └── style.css           # Estilos principais
├── js/
│   ├── auth.js            # Funções de autenticação
│   └── api.js             # Comunicação com a API
└── pages/
    ├── index.html         # Página principal
    ├── login.html         # Página de login
    ├── registro.html      # Página de registro
    ├── carros.html        # Listagem de carros
    ├── carro-detalhes.html # Detalhes do carro
    ├── meus-pedidos.html  # Pedidos do usuário
    └── admin.html         # Painel administrativo
```

### Banco de Dados (PostgreSQL)
```
database/
├── database_schema.sql     # Script de criação das tabelas
├── dados_exemplo.sql       # Dados de exemplo para teste
└── corrigir_senhas.sql     # Script para correção de senhas
```

## Relacionamentos do Banco de Dados

O sistema implementa todos os tipos de relacionamentos solicitados:

### 1. Tabela sem Dependências
- **Acessorio**: Tabela independente com acessórios para carros

### 2. Relacionamento 1:1
- **Carro ↔ DetalhesCarro**: Cada carro possui detalhes únicos (cor, quilometragem, combustível, etc.)

### 3. Relacionamento 1:N
- **Usuario → Pedido**: Um usuário pode ter vários pedidos
- **Pedido → ItemPedido**: Um pedido pode ter vários itens

### 4. Relacionamento N:M
- **Carro ↔ Acessorio**: Carros podem ter múltiplos acessórios e acessórios podem estar em múltiplos carros (através da tabela CarroAcessorio)

## Tecnologias Utilizadas

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web para Node.js
- **PostgreSQL**: Sistema de gerenciamento de banco de dados
- **bcryptjs**: Criptografia de senhas
- **express-session**: Gerenciamento de sessões
- **cookie-parser**: Manipulação de cookies
- **cors**: Controle de acesso entre origens

### Frontend
- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e layout responsivo
- **JavaScript (ES6+)**: Interatividade e comunicação com API
- **Fetch API**: Requisições HTTP assíncronas

### Banco de Dados
- **PostgreSQL 14**: Banco de dados relacional
- **SQL**: Linguagem de consulta estruturada

## Instalação e Configuração

### Pré-requisitos
- Node.js (versão 14 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm (gerenciador de pacotes do Node.js)

### Passo a Passo

1. **Clone ou extraia o projeto**
```bash
cd loja_carros
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o PostgreSQL**
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar senha do usuário postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Criar o banco de dados
sudo -u postgres createdb loja_carros
```

4. **Execute os scripts do banco de dados**
```bash
# Criar as tabelas
sudo -u postgres psql -d loja_carros -f database/database_schema.sql

# Inserir dados de exemplo
sudo -u postgres psql -d loja_carros -f database/dados_exemplo.sql
```

5. **Inicie o servidor**
```bash
npm start
```

6. **Acesse a aplicação**
- Abra o navegador e acesse: `http://localhost:3000`

## Credenciais de Teste

### Administrador
- **Email**: admin@automax.com
- **Senha**: admin123

### Cliente
- **Email**: cliente@teste.com
- **Senha**: cliente123

## Estrutura do Banco de Dados

### Tabelas Principais

#### Usuario
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(100))
- `email` (VARCHAR(100) UNIQUE)
- `senha` (VARCHAR(255))
- `tipo` (VARCHAR(20)) - 'cliente' ou 'admin'
- `data_criacao` (TIMESTAMP)

#### Carro
- `id` (SERIAL PRIMARY KEY)
- `modelo` (VARCHAR(50))
- `marca` (VARCHAR(50))
- `ano` (INTEGER)
- `preco` (DECIMAL(10,2))
- `descricao` (TEXT)
- `imagem_url` (VARCHAR(255))
- `data_criacao` (TIMESTAMP)

#### DetalhesCarro (Relacionamento 1:1)
- `id` (SERIAL PRIMARY KEY)
- `carro_id` (INTEGER UNIQUE REFERENCES Carro(id))
- `cor` (VARCHAR(30))
- `quilometragem` (INTEGER)
- `tipo_combustivel` (VARCHAR(20))
- `num_portas` (INTEGER)

#### Acessorio (Tabela sem dependências)
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(100))
- `descricao` (TEXT)
- `preco` (DECIMAL(10,2))

#### CarroAcessorio (Relacionamento N:M)
- `carro_id` (INTEGER REFERENCES Carro(id))
- `acessorio_id` (INTEGER REFERENCES Acessorio(id))
- PRIMARY KEY (carro_id, acessorio_id)

#### Pedido (Relacionamento 1:N com Usuario)
- `id` (SERIAL PRIMARY KEY)
- `usuario_id` (INTEGER REFERENCES Usuario(id))
- `data_pedido` (TIMESTAMP)
- `status` (VARCHAR(20))

#### ItemPedido (Relacionamento 1:N com Pedido)
- `id` (SERIAL PRIMARY KEY)
- `pedido_id` (INTEGER REFERENCES Pedido(id))
- `carro_id` (INTEGER REFERENCES Carro(id))
- `quantidade` (INTEGER)
- `preco_unitario` (DECIMAL(10,2))

## Funcionalidades Implementadas

### Sistema de Autenticação
- Login e logout com sessões
- Diferentes níveis de acesso (cliente/admin)
- Criptografia de senhas com bcrypt
- Proteção de rotas administrativas

### CRUDs Implementados

#### 1. CRUD sem Dependências - Acessórios
- **Create**: Adicionar novos acessórios
- **Read**: Listar todos os acessórios
- **Update**: Editar acessórios existentes
- **Delete**: Remover acessórios

#### 2. CRUD com Relacionamento 1:N - Pedidos
- **Create**: Criar novos pedidos com itens
- **Read**: Listar pedidos por usuário
- **Update**: Atualizar status dos pedidos
- **Delete**: Remover pedidos

#### 3. CRUD com Relacionamento N:M - Carros e Acessórios
- **Create**: Adicionar carros com acessórios
- **Read**: Listar carros com seus acessórios
- **Update**: Editar carros e seus acessórios
- **Delete**: Remover carros e relacionamentos

#### 4. CRUD com Relacionamento 1:1 - Carros e Detalhes
- **Create**: Criar carros com detalhes únicos
- **Read**: Visualizar carros com detalhes completos
- **Update**: Editar carros e seus detalhes
- **Delete**: Remover carros e detalhes associados

## API Endpoints

### Autenticação
- `POST /api/usuarios/login` - Fazer login
- `POST /api/usuarios/logout` - Fazer logout
- `POST /api/usuarios/registro` - Registrar novo usuário
- `GET /api/usuarios/sessao` - Verificar sessão atual

### Carros
- `GET /api/carros` - Listar todos os carros
- `GET /api/carros/:id` - Buscar carro por ID
- `POST /api/carros` - Criar novo carro (admin)
- `PUT /api/carros/:id` - Atualizar carro (admin)
- `DELETE /api/carros/:id` - Deletar carro (admin)

### Acessórios
- `GET /api/acessorios` - Listar todos os acessórios
- `GET /api/acessorios/:id` - Buscar acessório por ID
- `POST /api/acessorios` - Criar novo acessório (admin)
- `PUT /api/acessorios/:id` - Atualizar acessório (admin)
- `DELETE /api/acessorios/:id` - Deletar acessório (admin)

### Pedidos
- `GET /api/pedidos` - Listar todos os pedidos (admin)
- `GET /api/pedidos/usuario/:id` - Listar pedidos do usuário
- `POST /api/pedidos` - Criar novo pedido
- `PUT /api/pedidos/:id` - Atualizar status do pedido (admin)
- `DELETE /api/pedidos/:id` - Deletar pedido (admin)

## Segurança

### Medidas Implementadas
- **Criptografia de Senhas**: Uso do bcrypt para hash das senhas
- **Controle de Sessão**: Gerenciamento seguro de sessões de usuário
- **Validação de Entrada**: Validação de dados nos controladores
- **Controle de Acesso**: Verificação de permissões para rotas administrativas
- **CORS**: Configuração adequada para requisições entre origens

## Responsividade

O sistema foi desenvolvido com design responsivo, garantindo uma experiência adequada em:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Interface adaptada para telas médias
- **Mobile**: Layout otimizado para dispositivos móveis

## Testes Realizados

### Testes Funcionais
- ✅ Login e logout de usuários
- ✅ Registro de novos usuários
- ✅ Navegação entre páginas
- ✅ Visualização de carros
- ✅ Funcionalidades do painel administrativo
- ✅ CRUDs de carros, acessórios e pedidos
- ✅ Sistema de sessões e cookies

### Testes de Integração
- ✅ Comunicação frontend-backend
- ✅ Operações no banco de dados
- ✅ Autenticação e autorização
- ✅ Relacionamentos entre tabelas

## Estrutura de Arquivos do Projeto

```
loja_carros/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── acessorioController.js
│   │   ├── carroController.js
│   │   ├── pedidoController.js
│   │   └── usuarioController.js
│   ├── models/
│   │   ├── Acessorio.js
│   │   ├── Carro.js
│   │   ├── DetalhesCarro.js
│   │   ├── Pedido.js
│   │   └── Usuario.js
│   └── routes/
│       ├── acessorioRoutes.js
│       ├── carroRoutes.js
│       ├── pedidoRoutes.js
│       └── usuarioRoutes.js
├── database/
│   ├── corrigir_senhas.sql
│   ├── dados_exemplo.sql
│   └── database_schema.sql
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   └── auth.js
│   └── pages/
│       ├── admin.html
│       ├── carro-detalhes.html
│       ├── carros.html
│       ├── index.html
│       ├── login.html
│       ├── meus-pedidos.html
│       └── registro.html
├── package.json
├── README.md
└── server.js
```

## Considerações Finais

O sistema AutoMax foi desenvolvido seguindo as melhores práticas de desenvolvimento web, com uma arquitetura bem estruturada que separa claramente as responsabilidades entre frontend, backend e banco de dados. Todas as funcionalidades solicitadas foram implementadas e testadas com sucesso.

### Pontos Fortes do Projeto
- **Arquitetura Modular**: Separação clara entre camadas (MVC)
- **Segurança**: Implementação adequada de autenticação e autorização
- **Relacionamentos Completos**: Todos os tipos de relacionamento de banco de dados implementados
- **Interface Intuitiva**: Design limpo e responsivo
- **Código Organizado**: Estrutura de pastas e arquivos bem definida

### Tecnologias Modernas
- Uso de JavaScript ES6+ com async/await
- API RESTful bem estruturada
- Design responsivo com CSS3
- Banco de dados relacional com PostgreSQL

O projeto está pronto para uso e pode ser facilmente expandido com novas funcionalidades conforme necessário.

