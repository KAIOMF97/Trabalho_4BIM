-- Script para adicionar o campo quantidade na tabela CarroAcessorio
-- Execute este script no seu banco de dados PostgreSQL

-- Adicionar coluna quantidade se ela não existir
ALTER TABLE CarroAcessorio 
ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;

-- Verificar a estrutura da tabela
\d CarroAcessorio

