-- Atualizar senhas com hashes corretos
UPDATE Usuario SET senha = '$2b$10$mPhlgXLVxV0Y3tykjMjfi.sSymyeKb.PlrKa6Q/N3Bcw7v05cHFXy' WHERE email = 'admin@automax.com';
UPDATE Usuario SET senha = '$2b$10$yQbcmm6Vj4c3Y/Zlay/iBuQa6sujMDZyyebM1ROVqRWnRAV3m6.nO' WHERE email = 'cliente@teste.com';
UPDATE Usuario SET senha = '$2b$10$yQbcmm6Vj4c3Y/Zlay/iBuQa6sujMDZyyebM1ROVqRWnRAV3m6.nO' WHERE email = 'maria@teste.com';

