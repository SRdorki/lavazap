export const createPaymentLink = async (amount, description, agendamentoId, userToken) => {
  if (!userToken) {
    console.warn("Mercado Pago token não encontrado. O assinante não configurou o token nas Configurações.");
    return null;
  }
  const token = userToken;

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        external_reference: agendamentoId,
        notification_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-webhook`,
        items: [
          {
            title: description,
            quantity: 1,
            unit_price: Number(amount)
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.init_point) {
      return data.init_point; // URL de checkout do Mercado Pago
    } else {
      console.error("Erro ao gerar link de pagamento no Mercado Pago:", data);
      return null;
    }
  } catch (error) {
    console.error("Exceção ao chamar a API do Mercado Pago:", error);
    return null;
  }
};
