document.addEventListener('DOMContentLoaded', () => {
    const botoesPresente = document.querySelectorAll('.btn-gift');

    botoesPresente.forEach(botao => {
        botao.addEventListener('click', async (event) => {
            event.preventDefault();
            
            const botaoAtual = event.target;
            const textoOriginal = botaoAtual.innerText;
            
            botaoAtual.innerText = 'Gerando link...';
            botaoAtual.disabled = true;

            const card = botaoAtual.closest('.gift-card');
            const titulo = card.querySelector('h3').innerText;
            const precoTexto = card.querySelector('.price').innerText;
            
            const precoNumerico = parseFloat(precoTexto.replace('R$', '').replace('.', '').replace(',', '.').trim());

            try {
                const resposta = await fetch('http://localhost:3000/api/criar-pagamento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo: `Presente Casamento: ${titulo}`,
                        preco: precoNumerico,
                        quantidade: 1
                    })
                });

                const dados = await resposta.json();

                if (resposta.ok && dados.init_point) {
                    window.location.href = dados.init_point;
                } else {
                    showToast('Não foi possível gerar o link de pagamento agora. Tente novamente em instantes.');
                    botaoAtual.innerText = textoOriginal;
                    botaoAtual.disabled = false;
                }

            } catch (erro) {
                console.error('Erro de conexão:', erro);
                showToast('Erro ao conectar com o servidor. O back-end está rodando?');
                botaoAtual.innerText = textoOriginal;
                botaoAtual.disabled = false;
            }
        });
    });
});

    const formRsvp = document.getElementById('form-rsvp');
    
    if(formRsvp) {
        formRsvp.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            
            const botaoForm = formRsvp.querySelector('button');
            botaoForm.innerText = 'Enviando...';
            botaoForm.disabled = true;

            const dados = {
                nome: document.getElementById('nome-convidado').value,
                telefone: document.getElementById('telefone-convidado').value,
                status: document.getElementById('status-presenca').value,
                pessoas: document.getElementById('qtd-pessoas').value
            };

            try {
                const resposta = await fetch('http://localhost:3000/api/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (resposta.ok) {
                    showToast('Obrigado! Sua confirmação foi registrada com sucesso.');
                    formRsvp.reset(); 
                } else {
                    showToast('Deu um errinho ao enviar. Pode tentar de novo?');
                }
            } catch (erro) {
                console.error('Erro:', erro);
                showToast('Erro ao conectar com o servidor.');
            } finally {
                botaoForm.innerText = 'Enviar Confirmação';
                botaoForm.disabled = false;
            }
        });
    }

function showToast(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = mensagem;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3300);
}

function abrirTab(evt, nomeTab) {
    const conteudos = document.getElementsByClassName("tab-content");
    for (let i = 0; i < conteudos.length; i++) {
        conteudos[i].classList.remove("active");
    }

    const botoes = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < botoes.length; i++) {
        botoes[i].classList.remove("active");
    }

    document.getElementById(nomeTab).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function filtrarPrecos(faixa, botao) {
    // 1. Marca o botão clicado como ativo
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    botao.classList.add('active');

    // 2. Pega todos os cards (de todas as abas para garantir)
    const cards = document.querySelectorAll('.gift-card');

    cards.forEach(card => {
        const precoTexto = card.querySelector('.price').innerText;
        // Limpa o texto para pegar só o número
        const valor = parseFloat(precoTexto.replace(/[^\d,]/g, '').replace(',', '.'));

        let deveMostrar = false;

        if (faixa === 'todos') deveMostrar = true;
        else if (faixa === 'ate-100' && valor <= 100) deveMostrar = true;
        else if (faixa === '100-500' && valor > 100 && valor <= 500) deveMostrar = true;
        else if (faixa === '500-1500' && valor > 500 && valor <= 1500) deveMostrar = true;
        else if (faixa === 'acima-1500' && valor > 1500) deveMostrar = true;

        // 3. Em vez de mexer no .style.display, usamos classList
        if (deveMostrar) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}