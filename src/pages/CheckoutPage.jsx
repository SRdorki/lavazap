import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { processPayment } from '../mercadoPago';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import './CheckoutPage.css';

// Garante que initMercadoPago só é chamado uma vez por chave pública
let mpInitializedKey = null;

function CheckoutPage() {
  const { id } = useParams();
  
  const [agendamento, setAgendamento] = useState(null);
  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingPaymentInfo, setPendingPaymentInfo] = useState(null);
  // Só renderiza o Brick depois que o MP estiver inicializado
  const [mpReady, setMpReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: agData, error: agErr } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('id', id)
          .single();

        if (agErr || !agData) {
          setError('Pagamento não existe');
          return;
        }

        setAgendamento(agData);

        const { data: storeData } = await supabase
          .from('assinantes')
          .select('id, nome_empresa, whitelabel_color, whitelabel_logo, nome_plano, mp_access_token, mp_public_key')
          .eq('id', agData.user_id)
          .single();

        if (storeData) {
          setLoja(storeData);
          if (storeData.whitelabel_color && storeData.nome_plano !== 'start') {
            document.documentElement.style.setProperty('--primary-color', storeData.whitelabel_color);
          }
          if (storeData.mp_public_key) {
            // Só inicializa se ainda não foi inicializado com esta chave
            if (mpInitializedKey !== storeData.mp_public_key) {
              initMercadoPago(storeData.mp_public_key, { locale: 'pt-BR' });
              mpInitializedKey = storeData.mp_public_key;
            }
            // Pequeno delay para garantir que o SDK registrou tudo antes de montar o Brick
            setTimeout(() => setMpReady(true), 300);
          }
        }

        const { data: srvData } = await supabase
          .from('servicos')
          .select('*')
          .eq('id', agData.servico_id)
          .single();

        if (srvData) {
          setServico(srvData);
        }

      } catch (err) {
        console.error('Erro ao carregar checkout:', err);
        setError('Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      document.documentElement.style.removeProperty('--primary-color');
    };
  }, [id]);

  // Polling para verificar se o pagamento foi concluído (útil para PIX)
  useEffect(() => {
    let intervalId;
    
    if (pendingPaymentInfo && agendamento && !agendamento.pago && !paymentSuccess) {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('agendamentos')
            .select('pago')
            .eq('id', agendamento.id)
            .single();
            
          if (!error && data && data.pago) {
            setPaymentSuccess(true);
            setPendingPaymentInfo(null);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Erro ao checar status do pagamento:", err);
        }
      }, 5000); // Checa a cada 5 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pendingPaymentInfo, agendamento, paymentSuccess]);

  const handlePaymentSubmit = async ({ selectedPaymentMethod, formData }) => {
    setIsProcessing(true);
    try {
      const descricao = servico ? `Lavagem: ${servico.nome}` : 'Serviço de Lavagem';
      const result = await processPayment(formData, agendamento.id, descricao, loja.mp_access_token);
      
      if (result.error) {
        alert(`Erro no pagamento: ${result.error}`);
      } else if (result.status === 'approved') {
        setPaymentSuccess(true);
        // Opcional: Atualizar agendamento.pago = true no Supabase aqui também
      } else if (result.status === 'in_process') {
        alert('Pagamento em processamento. Avisaremos assim que for aprovado!');
        setPaymentSuccess(true);
      } else if (result.status === 'pending') {
        if (result.payment_method_id === 'pix' || result.point_of_interaction) {
          setPendingPaymentInfo({
            type: 'pix',
            qrCode: result.point_of_interaction?.transaction_data?.qr_code,
            qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64
          });
        } else if (result.payment_type_id === 'ticket') {
           setPendingPaymentInfo({
             type: 'ticket',
             url: result.transaction_details?.external_resource_url
           });
        } else {
           alert('Aguardando o pagamento (ex: aguardando PIX ou boleto).');
        }
      } else {
        alert('Pagamento recusado ou com falha. Tente outro método.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro inesperado.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onError = async (error) => {
    console.error("Erro no Brick:", error);
    alert("Erro ao carregar o pagamento do Mercado Pago: " + (error?.message || JSON.stringify(error)));
  };

  if (loading) {
    return (
      <div className="checkout-loading-screen">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Carregando seu pedido...</p>
      </div>
    );
  }

  if (error || !agendamento) {
    return (
      <div className="checkout-error">
        <h2>{error || 'Pagamento não existe'}</h2>
        <p>Verifique o link ou entre em contato com o estabelecimento.</p>
      </div>
    );
  }

  const isPaid = agendamento.pago || paymentSuccess;

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <div className="checkout-header">
          {loja?.whitelabel_logo ? (
            <img src={loja.whitelabel_logo} alt={loja.nome_empresa} className="checkout-logo" />
          ) : (
            <h2 className="title-lg">{loja?.nome_empresa || 'LavaZap'}</h2>
          )}
          <h1>Checkout Seguro</h1>
        </div>

        {isPaid ? (
          <div className="checkout-success">
            <div className="success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2>Pagamento Confirmado!</h2>
            <p>Obrigado! Seu pagamento foi recebido com sucesso.</p>
          </div>
        ) : pendingPaymentInfo ? (
          <div className="checkout-pending" style={{ textAlign: 'center', padding: '20px' }}>
            <h2 style={{ marginBottom: '15px', color: '#333' }}>Aguardando Pagamento</h2>
            {pendingPaymentInfo.type === 'pix' && (
              <div>
                <p style={{ marginBottom: '15px', color: '#555', fontSize: '15px' }}>Escaneie o QR Code abaixo com o aplicativo do seu banco:</p>
                {pendingPaymentInfo.qrCodeBase64 && (
                  <img 
                    src={`data:image/jpeg;base64,${pendingPaymentInfo.qrCodeBase64}`} 
                    alt="QR Code PIX" 
                    style={{ maxWidth: '200px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '1px solid #ddd' }} 
                  />
                )}
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                  <p style={{ fontSize: '14px', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Ou copie o código (PIX Copia e Cola):</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={pendingPaymentInfo.qrCode || ''} 
                      className="form-input" 
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px', padding: '10px' }} 
                    />
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        navigator.clipboard.writeText(pendingPaymentInfo.qrCode);
                        alert('Código PIX copiado!');
                      }}
                      style={{ padding: '10px 16px', flexShrink: 0 }}
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {pendingPaymentInfo.type === 'ticket' && (
              <div>
                <p style={{ marginBottom: '15px', color: '#555' }}>Seu boleto foi gerado com sucesso!</p>
                <a href={pendingPaymentInfo.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                   <i className="fa-solid fa-file-invoice"></i> Visualizar/Imprimir Boleto
                </a>
              </div>
            )}
            <p style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
              Após o pagamento, o status do agendamento será atualizado automaticamente. Você já pode fechar esta página.
            </p>
          </div>
        ) : (
          <>
            <div className="checkout-summary">
              <h3>Resumo do Serviço</h3>
              <div className="summary-item">
                <span>Cliente</span>
                <strong>{agendamento.cliente_nome}</strong>
              </div>
              <div className="summary-item">
                <span>Veículo</span>
                <strong>{agendamento.veiculo_modelo} (Placa: {agendamento.placa})</strong>
              </div>
              <div className="summary-item">
                <span>Serviço</span>
                <strong>{servico?.nome || 'Serviço de Lavagem'}</strong>
              </div>
              <div className="summary-total">
                <span>Total a Pagar</span>
                <strong>R$ {Number(agendamento.valor_total).toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>

            <div className="checkout-actions">
              {!loja?.mp_public_key ? (
                <div className="checkout-error" style={{ minHeight: 'auto', padding: '20px' }}>
                  <p>O lojista ainda não configurou a Chave Pública do Mercado Pago para pagamentos transparentes.</p>
                </div>
              ) : !mpReady ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', marginBottom: '12px', display: 'block' }}></i>
                  <p style={{ margin: 0, fontSize: '14px' }}>Carregando opções de pagamento...</p>
                </div>
              ) : (
                <div className="payment-brick-wrapper" style={{ opacity: isProcessing ? 0.5 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}>
                  <Payment
                    initialization={{ amount: Number(agendamento.valor_total) }}
                    customization={{
                      paymentMethods: {
                        ticket: "all",
                        bankTransfer: "all",
                        creditCard: "all",
                        debitCard: "all",
                        mercadoPago: "all",
                      },
                    }}
                    onSubmit={handlePaymentSubmit}
                    onError={onError}
                    onReady={() => console.log('Payment Brick is ready!')}
                  />
                  {isProcessing && <div style={{ textAlign: 'center', marginTop: '10px' }}><i className="fa-solid fa-spinner fa-spin"></i> Processando pagamento...</div>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
