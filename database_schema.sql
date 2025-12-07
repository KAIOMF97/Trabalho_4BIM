
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL -- 'cliente' ou 'admin'
);

CREATE TABLE Carro (
    id SERIAL PRIMARY KEY,
    modelo VARCHAR(255) NOT NULL,
    marca VARCHAR(255) NOT NULL,
    ano INTEGER NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    imagem_url VARCHAR(255)
);

CREATE TABLE DetalhesCarro (
    id SERIAL PRIMARY KEY,
    carro_id INTEGER UNIQUE NOT NULL REFERENCES Carro(id) ON DELETE CASCADE,
    cor VARCHAR(50),
    quilometragem INTEGER,
    tipo_combustivel VARCHAR(50),
    num_portas INTEGER
);

CREATE TABLE Acessorio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2)
);

CREATE TABLE CarroAcessorio (
    carro_id INTEGER NOT NULL REFERENCES Carro(id) ON DELETE CASCADE,
    acessorio_id INTEGER NOT NULL REFERENCES Acessorio(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (carro_id, acessorio_id)
);

CREATE TABLE Pedido (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES Usuario(id) ON DELETE CASCADE,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL, -- 'pendente', 'concluido', 'cancelado'
    valor_total DECIMAL(10, 2),
    metodo_pagamento VARCHAR(50),
    observacoes TEXT
);

CREATE TABLE ItemPedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES Pedido(id) ON DELETE CASCADE,
    carro_id INTEGER NOT NULL REFERENCES Carro(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10, 2) NOT NULL
);


