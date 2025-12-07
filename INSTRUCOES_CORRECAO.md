# Instruções para Corrigir o Problema dos Acessórios

## Problema Identificado

O erro "interno no servidor" acontece porque o banco de dados não possui a coluna `quantidade` na tabela `CarroAcessorio`, mas o código está tentando inserir dados nessa coluna.

## Solução - Passo a Passo

### Passo 1: Parar o Servidor

Primeiro, pare o servidor Node.js se estiver rodando (pressione `Ctrl+C` no terminal).

### Passo 2: Executar o Script SQL

Você precisa executar o script SQL no seu banco de dados PostgreSQL. Existem várias formas de fazer isso:

#### Opção A: Usando o psql (linha de comando)

```bash
psql -U seu_usuario -d nome_do_banco -f CORRIGIR_BANCO_DADOS.sql
```

Substitua:
- `seu_usuario` pelo seu usuário do PostgreSQL
- `nome_do_banco` pelo nome do seu banco de dados

#### Opção B: Usando pgAdmin ou outro cliente gráfico

1. Abra o pgAdmin ou seu cliente PostgreSQL favorito
2. Conecte-se ao banco de dados
3. Abra o arquivo `CORRIGIR_BANCO_DADOS.sql`
4. Execute o script

#### Opção C: Copiar e colar o comando SQL

Abra o terminal do PostgreSQL e execute:

```sql
ALTER TABLE CarroAcessorio 
ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;
```

### Passo 3: Verificar se a Correção Funcionou

Execute este comando no PostgreSQL para verificar:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'carroacessorio';
```

Você deve ver a coluna `quantidade` listada.

### Passo 4: Reiniciar o Servidor

Agora você pode reiniciar o servidor Node.js:

```bash
node server.js
```

### Passo 5: Testar

1. Acesse o painel administrativo
2. Adicione um novo carro
3. Selecione alguns acessórios e defina as quantidades
4. Salve o carro
5. Vá para a página inicial e clique em "Ver Detalhes" do carro
6. Os acessórios devem aparecer agora!

## Resumo das Alterações

### Arquivos Modificados:

1. **backend/controllers/carroController.js**
   - Método `criar`: Agora faz parse da string JSON dos acessórios
   - Método `atualizar`: Também suporta atualização de acessórios

2. **database/database_schema.sql**
   - Tabela `CarroAcessorio`: Adicionada coluna `quantidade`

### Script SQL Criado:

- **CORRIGIR_BANCO_DADOS.sql**: Script para adicionar a coluna no banco existente

## Observações Importantes

- **Carros antigos**: Carros adicionados antes desta correção não terão acessórios. Você precisará editá-los e adicionar os acessórios novamente.

- **Backup**: É sempre recomendável fazer backup do banco de dados antes de executar scripts de alteração.

- **Permissões**: Certifique-se de que seu usuário PostgreSQL tem permissão para alterar a estrutura das tabelas.

## Suporte

Se você encontrar algum erro ao executar o script SQL, verifique:

1. Se você está conectado ao banco de dados correto
2. Se o usuário tem permissões de ALTER TABLE
3. Se a tabela `CarroAcessorio` existe no banco de dados
4. As mensagens de erro no console do PostgreSQL

## Testando a Correção

Após executar todos os passos, adicione um carro de teste:

1. Nome: "Teste Acessórios"
2. Marca: "Teste"
3. Ano: 2024
4. Preço: 100000
5. Selecione 2-3 acessórios com quantidades diferentes
6. Salve o carro
7. Vá para "Ver Detalhes"
8. Os acessórios devem aparecer com suas quantidades

Se tudo funcionar, você pode deletar o carro de teste e adicionar seus carros reais!

