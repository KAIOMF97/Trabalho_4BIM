-- ========================================
-- SCRIPT DE CORREÇÃO DO BANCO DE DADOS
-- ========================================
-- Este script adiciona a coluna 'quantidade' na tabela CarroAcessorio
-- Execute este script no seu banco de dados PostgreSQL antes de usar o sistema

-- Adicionar coluna quantidade na tabela CarroAcessorio
ALTER TABLE CarroAcessorio 
ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;

-- Verificar se a coluna foi adicionada com sucesso
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'carroacessorio';

-- Mensagem de confirmação
SELECT 'Coluna quantidade adicionada com sucesso!' AS status;

