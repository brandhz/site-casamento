require('dotenv').config({ path: __dirname + '/.env' });const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor do Casamento rodando perfeitamente! 💍');
});

// --- ROTA OFICIAL DO MERCADO PAGO ---
app.post('/api/criar-pagamento', async (req, res) => {
    try {
        const { titulo, preco, quantidade } = req.body;
        
        console.log(`[MERCADO PAGO] Gerando link de pagamento para: ${titulo} - R$ ${preco}`);

        const preference = new Preference(client);
        
        // Monta o pedido e envia para a API do Mercado Pago
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: "presente_casamento", 
                        title: titulo,
                        quantity: Number(quantidade) || 1,
                        unit_price: Number(preco),
                        currency_id: 'BRL',
                    }
                ],
                back_urls: {
                    success: "https://www.brandonnesamira.com.br",
                    failure: "https://www.brandonnesamira.com.br",
                    pending: "https://www.brandonnesamira.com.br"
                },
                auto_return: "approved", 
            }
        });

        // Devolve o link real do Checkout Pro para o front-end
        res.status(200).json({ 
            id: response.id,
            init_point: response.init_point 
        });

    } catch (error) {
        console.error('Erro ao gerar pagamento no Mercado Pago:', error);
        res.status(500).json({ error: 'Falha ao processar o pagamento no servidor' });
    }
});

// --- ROTA DO RSVP ---
app.post('/api/rsvp', async (req, res) => {
    try {
        const dadosConvidado = req.body;
        const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxAAJQZa60dQpwz5IDbIgqGZoMvIhQT6EbM1wTa0dLFiYjF4nFxDDryOPtLrDsyjweE/exec';

        const respostaGoogle = await fetch(googleScriptUrl, {
            method: 'POST',
            body: JSON.stringify(dadosConvidado),
            headers: { 'Content-Type': 'application/json' }
        });

        if (respostaGoogle.ok) {
            res.status(200).json({ mensagem: 'Presença confirmada com sucesso!' });
        } else {
            throw new Error('Falha ao gravar na planilha');
        }

    } catch (error) {
        console.error('Erro no RSVP:', error);
        res.status(500).json({ error: 'Erro ao salvar a confirmação.' });
    }
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});