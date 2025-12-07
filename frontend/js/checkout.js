let carroSelecionado = null;
let parcelamentoSelecionado = null;
let metodosPagamento = null;
let currentStep = 1;
let formData = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se o usuário está logado
    const sessao = await Auth.verificarSessao();
    if (!sessao.logado) {
        alert('Você precisa fazer login para acessar o checkout.');
        window.location.href = '/frontend/pages/login.html';
        return;
    }

    // Obter ID do carro da URL
    const urlParams = new URLSearchParams(window.location.search);
    const carroId = urlParams.get('id');

    if (!carroId) {
        alert('Produto não encontrado.');
        window.location.href = '/frontend/pages/carros.html';
        return;
    }

    await carregarDadosCarro(carroId);
    configurarFormulario();
    preencherAnosVencimento();
    configurarMetodosPagamento();
});

async function carregarDadosCarro(carroId) {
    const loadingElement = document.getElementById('loading');
    const checkoutContainer = document.getElementById('checkout-container');
    const errorMessage = document.getElementById('error-message');

    try {
        const carro = await API.obterCarro(carroId);
        
        if (carro && !carro.erro) {
            carroSelecionado = carro;
            
            // Preencher informações do produto na sidebar
            document.getElementById('product-image').src = carro.imagem_url || 'https://via.placeholder.com/400x200?text=Sem+Imagem';
            document.getElementById('product-image').alt = carro.modelo;
            document.getElementById('product-name').textContent = carro.modelo;
            document.getElementById('product-details').textContent = `${carro.marca} - ${carro.ano}`;
            
            const preco = parseFloat(carro.preco);
            document.getElementById('product-price').textContent = `R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            document.getElementById('summary-subtotal').textContent = `R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            document.getElementById('summary-total').textContent = `R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            
            // Gerar opções de parcelamento
            gerarOpcoesParcelamento(preco);
            
            loadingElement.classList.add('hidden');
            checkoutContainer.classList.remove('hidden');
        } else {
            throw new Error('Carro não encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar carro:', error);
        loadingElement.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
}

function gerarOpcoesParcelamento(preco) {
    const container = document.getElementById('installment-options');
    const opcoes = [];
    
    // À vista (sem juros)
    opcoes.push({
        parcelas: 1,
        valor: preco,
        total: preco,
        juros: 0,
        descricao: 'À vista (sem juros)',
        detalhes: 'Pagamento único'
    });
    
    // Parcelamento com juros progressivos
    const taxasJuros = {
        2: 0.015,  // 1.5% ao mês
        3: 0.02,   // 2% ao mês
        6: 0.025,  // 2.5% ao mês
        12: 0.03,  // 3% ao mês
        18: 0.035, // 3.5% ao mês
        24: 0.04,  // 4% ao mês
        36: 0.045, // 4.5% ao mês
        48: 0.05   // 5% ao mês
    };
    
    Object.entries(taxasJuros).forEach(([parcelas, taxa]) => {
        const valorComJuros = preco * Math.pow(1 + taxa, parseInt(parcelas));
        const valorParcela = valorComJuros / parseInt(parcelas);
        
        opcoes.push({
            parcelas: parseInt(parcelas),
            valor: valorParcela,
            total: valorComJuros,
            juros: taxa * 100,
            descricao: `${parcelas}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            detalhes: `Total: R$ ${valorComJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${(taxa * 100).toFixed(1)}% a.m.)`
        });
    });
    
    container.innerHTML = opcoes.map((opcao, index) => `
        <div class="installment-option ${index === 0 ? 'selected' : ''}" onclick="selecionarParcelamento(${index})">
            <input type="radio" name="parcelamento" value="${index}" id="parcela-${index}" ${index === 0 ? 'checked' : ''} class="installment-radio">
            <div class="installment-details">
                <div class="installment-value">${opcao.descricao}</div>
                <div class="installment-total">${opcao.detalhes}</div>
            </div>
        </div>
    `).join('');
    
    // Selecionar à vista por padrão
    parcelamentoSelecionado = opcoes[0];
    atualizarResumoParcelamento();
    
    // Armazenar opções para uso posterior
    window.opcoesParcelamento = opcoes;
}

function selecionarParcelamento(index) {
    // Remover seleção anterior
    document.querySelectorAll('.installment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Selecionar nova opção
    const opcaoSelecionada = document.querySelectorAll('.installment-option')[index];
    opcaoSelecionada.classList.add('selected');
    
    // Marcar radio button
    document.getElementById(`parcela-${index}`).checked = true;
    
    // Armazenar seleção
    parcelamentoSelecionado = window.opcoesParcelamento[index];
    
    // Atualizar resumo
    atualizarResumoParcelamento();
}

function atualizarResumoParcelamento() {
    if (!parcelamentoSelecionado) return;
    
    document.getElementById('summary-installment').textContent = parcelamentoSelecionado.descricao;
    document.getElementById('summary-total').textContent = `R$ ${parcelamentoSelecionado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function configurarMetodosPagamento() {
    const metodos = document.querySelectorAll('.payment-method');
    
    metodos.forEach(metodo => {
        metodo.addEventListener('click', () => {
            // Remover seleção anterior
            metodos.forEach(m => m.classList.remove('selected'));
            
            // Selecionar novo método
            metodo.classList.add('selected');
            
            const metodoPagamento = metodo.dataset.method;
            
            // Atualizar resumo
            const nomeMetodo = {
                'credit': 'Cartão de Crédito',
                'debit': 'Cartão de Débito',
                'financing': 'Financiamento'
            };
            
            document.getElementById('summary-payment').textContent = nomeMetodo[metodoPagamento];
            
            // Mostrar/ocultar seções baseado no método
            const cardSection = document.getElementById('card-section');
            const installmentSection = document.getElementById('installment-section');
            
            if (metodoPagamento === 'financing') {
                cardSection.style.display = 'none';
                installmentSection.style.display = 'none';
            } else {
                cardSection.style.display = 'block';
                installmentSection.style.display = metodoPagamento === 'credit' ? 'block' : 'none';
            }
        });
    });
}

function configurarFormulario() {
    const form = document.getElementById('checkout-form');
    
    // Aplicar máscaras
    aplicarMascaras();
    
    // Configurar validação em tempo real
    configurarValidacao();
    
    // Submit do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validarEtapaAtual()) {
            await processarCompra();
        }
    });
}

function aplicarMascaras() {
    // Máscara CPF
    document.getElementById('cpf').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });
    
    // Máscara RG
    document.getElementById('rg').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1})$/, '$1-$2');
        e.target.value = value;
    });
    
    // Máscara Telefone
    document.getElementById('telefone').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });
    
    // Máscara CEP
    document.getElementById('cep').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });
    
    // Máscara Cartão de Crédito
    document.getElementById('numero-cartao').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        e.target.value = value;
    });
    
    // Máscara CVV
    document.getElementById('cvv').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Buscar CEP automaticamente
    document.getElementById('cep').addEventListener('blur', buscarCEP);
}

async function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('endereco').value = `${data.logradouro}, ${data.bairro}`;
                document.getElementById('estado').value = data.uf;
                
                // Validar campos preenchidos automaticamente
                validarCampo('cidade');
                validarCampo('endereco');
                validarCampo('estado');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }
}

function configurarValidacao() {
    const campos = [
        'nome', 'cpf', 'email', 'telefone', 'data-nascimento', 'rg',
        'cep', 'cidade', 'endereco', 'estado',
        'numero-cartao', 'nome-cartao', 'cvv', 'mes-vencimento', 'ano-vencimento'
    ];
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.addEventListener('blur', () => validarCampo(campo));
            elemento.addEventListener('input', () => limparErro(campo));
        }
    });
}

function validarCampo(campo) {
    const elemento = document.getElementById(campo);
    const valor = elemento.value.trim();
    let erro = '';
    
    switch (campo) {
        case 'nome':
            if (!valor) erro = 'Nome é obrigatório';
            else if (valor.length < 3) erro = 'Nome deve ter pelo menos 3 caracteres';
            else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) erro = 'Nome deve conter apenas letras';
            break;
            
        case 'cpf':
            if (!valor) erro = 'CPF é obrigatório';
            else if (!validarCPF(valor)) erro = 'CPF inválido';
            break;
            
        case 'email':
            if (!valor) erro = 'E-mail é obrigatório';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) erro = 'E-mail inválido';
            break;
            
        case 'telefone':
            if (!valor) erro = 'Telefone é obrigatório';
            else if (valor.replace(/\D/g, '').length < 10) erro = 'Telefone inválido';
            break;
            
        case 'data-nascimento':
            if (!valor) erro = 'Data de nascimento é obrigatória';
            else {
                const hoje = new Date();
                const nascimento = new Date(valor);
                const idade = hoje.getFullYear() - nascimento.getFullYear();
                if (idade < 18) erro = 'Você deve ter pelo menos 18 anos';
                if (nascimento > hoje) erro = 'Data de nascimento inválida';
            }
            break;
            
        case 'rg':
            if (!valor) erro = 'RG é obrigatório';
            else if (valor.replace(/\D/g, '').length < 7) erro = 'RG inválido';
            break;
            
        case 'cep':
            if (!valor) erro = 'CEP é obrigatório';
            else if (valor.replace(/\D/g, '').length !== 8) erro = 'CEP inválido';
            break;
            
        case 'cidade':
            if (!valor) erro = 'Cidade é obrigatória';
            break;
            
        case 'endereco':
            if (!valor) erro = 'Endereço é obrigatório';
            break;
            
        case 'estado':
            if (!valor) erro = 'Estado é obrigatório';
            break;
            
        case 'numero-cartao':
            if (!valor) erro = 'Número do cartão é obrigatório';
            else if (valor.replace(/\D/g, '').length < 13) erro = 'Número do cartão inválido';
            else if (!validarCartaoCredito(valor)) erro = 'Número do cartão inválido';
            break;
            
        case 'nome-cartao':
            if (!valor) erro = 'Nome no cartão é obrigatório';
            else if (valor.length < 3) erro = 'Nome no cartão muito curto';
            break;
            
        case 'cvv':
            if (!valor) erro = 'CVV é obrigatório';
            else if (valor.length < 3) erro = 'CVV inválido';
            break;
            
        case 'mes-vencimento':
            if (!valor) erro = 'Mês de vencimento é obrigatório';
            break;
            
        case 'ano-vencimento':
            if (!valor) erro = 'Ano de vencimento é obrigatório';
            break;
    }
    
    if (erro) {
        mostrarErro(campo, erro);
        return false;
    } else {
        mostrarSucesso(campo);
        return true;
    }
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function validarCartaoCredito(numero) {
    numero = numero.replace(/\D/g, '');
    
    // Algoritmo de Luhn
    let soma = 0;
    let alternar = false;
    
    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = parseInt(numero.charAt(i));
        
        if (alternar) {
            digito *= 2;
            if (digito > 9) {
                digito = (digito % 10) + 1;
            }
        }
        
        soma += digito;
        alternar = !alternar;
    }
    
    return (soma % 10) === 0;
}

function mostrarErro(campo, mensagem) {
    const elemento = document.getElementById(campo);
    const errorElement = document.getElementById(`${campo}-error`);
    const successElement = document.getElementById(`${campo}-success`);
    
    elemento.classList.add('error');
    elemento.classList.remove('success');
    
    if (errorElement) {
        errorElement.textContent = mensagem;
        errorElement.style.display = 'flex';
    }
    
    if (successElement) {
        successElement.style.display = 'none';
    }
}

function mostrarSucesso(campo) {
    const elemento = document.getElementById(campo);
    const errorElement = document.getElementById(`${campo}-error`);
    const successElement = document.getElementById(`${campo}-success`);
    
    elemento.classList.remove('error');
    elemento.classList.add('success');
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    if (successElement) {
        successElement.textContent = 'Válido';
        successElement.style.display = 'flex';
    }
}

function limparErro(campo) {
    const elemento = document.getElementById(campo);
    const errorElement = document.getElementById(`${campo}-error`);
    const successElement = document.getElementById(`${campo}-success`);
    
    elemento.classList.remove('error');
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    if (successElement) {
        successElement.style.display = 'none';
    }
}

function nextStep() {
    if (validarEtapaAtual()) {
        salvarDadosEtapa();
        
        if (currentStep < 3) {
            currentStep++;
            atualizarEtapa();
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        atualizarEtapa();
    }
}

function atualizarEtapa() {
    // Ocultar todas as seções
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`section-${i}`).classList.add('hidden');
    }
    
    // Mostrar seção atual
    document.getElementById(`section-${currentStep}`).classList.remove('hidden');
    
    // Atualizar indicadores de etapa
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step-${i}`);
        const connector = document.getElementById(`connector-${i}`);
        
        step.classList.remove('active', 'completed');
        if (connector) connector.classList.remove('completed');
        
        if (i < currentStep) {
            step.classList.add('completed');
            if (connector) connector.classList.add('completed');
        } else if (i === currentStep) {
            step.classList.add('active');
        }
    }
    
    // Atualizar botões
    const btnPrevious = document.getElementById('btn-previous');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    
    btnPrevious.style.display = currentStep > 1 ? 'block' : 'none';
    btnNext.style.display = currentStep < 3 ? 'block' : 'none';
    btnSubmit.style.display = currentStep === 3 ? 'block' : 'none';
}

function validarEtapaAtual() {
    let campos = [];
    
    switch (currentStep) {
        case 1:
            campos = ['nome', 'cpf', 'email', 'telefone', 'data-nascimento', 'rg'];
            break;
        case 2:
            campos = ['cep', 'cidade', 'endereco', 'estado'];
            break;
        case 3:
            const metodoPagamento = document.querySelector('.payment-method.selected').dataset.method;
            if (metodoPagamento !== 'financing') {
                campos = ['numero-cartao', 'nome-cartao', 'cvv', 'mes-vencimento', 'ano-vencimento'];
            }
            
            // Validar data de vencimento
            const mes = parseInt(document.getElementById('mes-vencimento').value);
            const ano = parseInt(document.getElementById('ano-vencimento').value);
            const hoje = new Date();
            const dataVencimento = new Date(ano, mes - 1);
            
            if (dataVencimento <= hoje) {
                mostrarErro('mes-vencimento', 'Data de vencimento inválida');
                mostrarErro('ano-vencimento', 'Data de vencimento inválida');
                return false;
            }
            break;
    }
    
    let valido = true;
    campos.forEach(campo => {
        if (!validarCampo(campo)) {
            valido = false;
        }
    });
    
    return valido;
}

function salvarDadosEtapa() {
    switch (currentStep) {
        case 1:
            formData.dadosPessoais = {
                nome: document.getElementById('nome').value,
                cpf: document.getElementById('cpf').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                dataNascimento: document.getElementById('data-nascimento').value,
                rg: document.getElementById('rg').value
            };
            break;
        case 2:
            formData.endereco = {
                cep: document.getElementById('cep').value,
                cidade: document.getElementById('cidade').value,
                endereco: document.getElementById('endereco').value,
                estado: document.getElementById('estado').value,
                complemento: document.getElementById('complemento').value
            };
            break;
        case 3:
            const metodoPagamento = document.querySelector('.payment-method.selected').dataset.method;
            formData.pagamento = {
                metodo: metodoPagamento,
                parcelamento: parcelamentoSelecionado
            };
            
            if (metodoPagamento !== 'financing') {
                formData.cartao = {
                    numero: document.getElementById('numero-cartao').value,
                    nome: document.getElementById('nome-cartao').value,
                    cvv: document.getElementById('cvv').value,
                    mesVencimento: document.getElementById('mes-vencimento').value,
                    anoVencimento: document.getElementById('ano-vencimento').value
                };
            }
            break;
    }
}

async function processarCompra() {
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Processando...';
    
    try {
        // Salvar dados da etapa atual
        salvarDadosEtapa();
        
        // Simular processamento de pagamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Criar pedido completo no sistema
        const dadosCheckout = {
            carro_id: carroSelecionado.id,
            dadosPessoais: formData.dadosPessoais,
            endereco: formData.endereco,
            pagamento: formData.pagamento,
            cartao: formData.cartao
        };
        
        const resultado = await API.checkoutCompleto(dadosCheckout);
        
        if (resultado.sucesso) {
            // Salvar dados da compra para exibição
            const dadosCompra = {
                carro: carroSelecionado,
                formData: formData,
                pedidoId: resultado.pedidoId || Math.floor(Math.random() * 1000000),
                dataCompra: new Date().toISOString()
            };
            
            localStorage.setItem('ultimaCompra', JSON.stringify(dadosCompra));
            
            // Mostrar tela de sucesso
            mostrarTelaSuccesso(dadosCompra);
        } else {
            throw new Error(resultado.erro || 'Erro ao processar compra');
        }
        
    } catch (error) {
        console.error('Erro ao processar compra:', error);
        alert('Erro ao processar compra: ' + error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Finalizar Compra';
    }
}

function mostrarTelaSuccesso(dadosCompra) {
    document.getElementById('checkout-container').classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');
    
    document.getElementById('order-number').textContent = `#${dadosCompra.pedidoId}`;
    document.getElementById('order-date').textContent = new Date(dadosCompra.dataCompra).toLocaleDateString('pt-BR');
    
    // Scroll para o topo
    window.scrollTo(0, 0);
}

function preencherAnosVencimento() {
    const select = document.getElementById('ano-vencimento');
    const anoAtual = new Date().getFullYear();
    
    for (let ano = anoAtual; ano <= anoAtual + 15; ano++) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        select.appendChild(option);
    }
}

// Inicializar primeira etapa
document.addEventListener('DOMContentLoaded', () => {
    atualizarEtapa();
});
