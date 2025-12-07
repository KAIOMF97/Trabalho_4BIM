-- Inserir usuários de exemplo
INSERT INTO Usuario (nome, email, senha, tipo) VALUES 
(\'Administrador\', \'admin@automax.com\', \'$2b$10$YAapuTGgsZn0WfQM8H0jZuPS77.H9OleLreIsmRkiaUEun7xXPoX2\', \'admin\'), -- senha: admin123
(\'João Silva\', \'cliente@teste.com\', \'$2b$10$Xkv1ksnK2zwICBPha5U2d.tkQA3iF/5LEKdLbyAvF83nHXTB5A4Vm\', \'cliente\'), -- senha: cliente123
(\'Maria Santos\', \'maria@teste.com\', \'$2b$10$Xkv1ksnK2zwICBPha5U2d.tkQA3iF/5LEKdLbyAvF83nHXTB5A4Vm\', \'cliente\'); -- senha: cliente123

-- Inserir carros de exemplo
INSERT INTO Carro (modelo, marca, ano, preco, descricao, imagem_url) VALUES 
('Civic', 'Honda', 2022, 85000.00, 'Sedan compacto com excelente economia de combustível e tecnologia avançada.', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500'),
('Corolla', 'Toyota', 2023, 92000.00, 'O sedan mais vendido do mundo, com design moderno e alta confiabilidade.', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500'),
('Onix', 'Chevrolet', 2021, 65000.00, 'Hatch compacto ideal para o dia a dia na cidade.', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500'),
('HB20', 'Hyundai', 2022, 68000.00, 'Hatch moderno com ótimo custo-benefício.', 'https://images.unsplash.com/photo-1494976688153-d4d4c0b0f4d8?w=500'),
('Polo', 'Volkswagen', 2023, 78000.00, 'Hatch premium com acabamento refinado.', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500'),
('Compass', 'Jeep', 2022, 145000.00, 'SUV robusto para aventuras urbanas e off-road.', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500');

-- Inserir detalhes dos carros (relacionamento 1:1)
INSERT INTO DetalhesCarro (carro_id, cor, quilometragem, tipo_combustivel, num_portas) VALUES 
(1, 'Prata', 15000, 'Flex', 4),
(2, 'Branco', 8000, 'Flex', 4),
(3, 'Preto', 25000, 'Flex', 4),
(4, 'Vermelho', 12000, 'Flex', 4),
(5, 'Azul', 5000, 'Flex', 4),
(6, 'Cinza', 18000, 'Flex', 4);

-- Inserir acessórios (tabela sem dependências)
INSERT INTO Acessorio (nome, descricao, preco) VALUES 
('Ar Condicionado', 'Sistema de climatização automático', 2500.00),
('Direção Hidráulica', 'Direção assistida para maior conforto', 1200.00),
('Vidros Elétricos', 'Vidros com acionamento elétrico', 800.00),
('Trava Elétrica', 'Sistema de travamento centralizado', 600.00),
('Som Automotivo', 'Sistema de som com Bluetooth', 1500.00),
('Rodas de Liga Leve', 'Rodas esportivas de liga leve', 2000.00),
('Sensor de Estacionamento', 'Sensores traseiros para estacionamento', 900.00),
('Câmera de Ré', 'Câmera para auxiliar manobras', 1100.00);

-- Inserir relacionamentos N:M entre carros e acessórios
INSERT INTO CarroAcessorio (carro_id, acessorio_id) VALUES 
-- Civic (carro 1)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
-- Corolla (carro 2)
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 8),
-- Onix (carro 3)
(3, 1), (3, 3), (3, 4),
-- HB20 (carro 4)
(4, 1), (4, 2), (4, 3), (4, 4), (4, 7),
-- Polo (carro 5)
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6),
-- Compass (carro 6)
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8);

-- Inserir alguns pedidos de exemplo (relacionamento 1:N)
INSERT INTO Pedido (usuario_id, status) VALUES 
(2, 'concluido'),
(3, 'pendente');

-- Inserir itens dos pedidos
INSERT INTO ItemPedido (pedido_id, carro_id, quantidade, preco_unitario) VALUES 
(1, 3, 1, 65000.00),
(2, 1, 1, 85000.00);

