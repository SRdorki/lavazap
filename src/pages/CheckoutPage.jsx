import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { processPayment } from '../mercadoPago';
import './CheckoutPage.css';

// Carrega o script do SDK do MercadoPago dinamicamente (apenas uma vez)
function loadMercadoPagoScript() {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve(window.MercadoPago);
      return;
    }
    const existing = document.getElementById('mp-sdk-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.MercadoPago));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'mp-sdk-script';
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

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
  const [brickError, setBrickError] = useState('');

  // Ref do container onde o Brick vai ser montado
  const brickContainerRef = useRef(null);
  // Ref do controller do Brick (para destruir no unmount)
  const brickControllerRef = useRef(null);
  // Ref com os dados necessários para montar o Brick
  const paymentDataRef = useRef(null);

  // Carrega dados do Supabase
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
        }

        const { data: srvData } = await supabase
          .from('servicos')
          .select('*')
          .eq('id', agData.servico_id)
          .single();

        if (srvData) setServico(srvData);

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

  // Monta o Payment Brick via SDK nativo após os dados carregarem
  useEffect(() => {
    if (!agendamento || !loja?.mp_public_key || !brickContainerRef.current) return;
    if (agendamento.pago || paymentSuccess || pendingPaymentInfo) return;

    let destroyed = false;

    async function mountBrick() {
      try {
        // Garante que o script SDK está carregado
        await loadMercadoPagoScript();

        if (destroyed) return;

        // Destrói brick anterior se existir
        if (brickControllerRef.current) {
          await brickControllerRef.current.unmount();
          brickControllerRef.current = null;
        }

        const mp = new window.MercadoPago(loja.mp_public_key, { locale: 'pt-BR' });
        const bricksBuilder = mp.bricks();

        const settings = {
          initialization: {
            amount: Number(agendamento.valor_total),
          },
          customization: {
            paymentMethods: {
              ticket: 'all',
              bankTransfer: 'all',
              creditCard: 'all',
              debitCard: 'all',
              mercadoPago: 'all',
            },
          },
          callbacks: {
            onReady: () => {
              console.log('MercadoPago Payment Brick ready!');
            },
            onSubmit: async ({ formData }) => {
              setIsProcessing(true);
              try {
                const descricao = servico ? `Lavagem: ${servico.nome}` : 'Serviço de Lavagem';
                const result = await processPayment(formData, agendamento.id, descricao, loja.mp_access_token);

                if (result.error) {
                  alert(`Erro no pagamento: ${result.error}`);
                } else if (result.status === 'approved') {
                  setPaymentSuccess(true);
                } else if (result.status === 'in_process') {
                  alert('Pagamento em processamento. Avisaremos assim que for aprovado!');
                  setPaymentSuccess(true);
                } else if (result.status === 'pending') {
                  if (result.payment_method_id === 'pix' || result.point_of_interaction) {
                    setPendingPaymentInfo({
                      type: 'pix',
                      qrCode: result.point_of_interaction?.transaction_data?.qr_code,
                      qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
                    });
                  } else if (result.payment_type_id === 'ticket') {
                    setPendingPaymentInfo({
                      type: 'ticket',
                      url: result.transaction_details?.external_resource_url,
                    });
                  } else {
                    alert('Aguardando confirmação do pagamento.');
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
            },
            onError: (err) => {
              console.error('Erro no Brick:', err);
              setBrickError('Erro ao carregar o formulário de pagamento. Recarregue a página.');
            },
          },
        };

        if (destroyed) return;

        brickControllerRef.current = await bricksBuilder.create(
          'payment',
          'mp-payment-brick-container',
          settings
        );
      } catch (err) {
        console.error('Falha ao montar Payment Brick:', err);
        if (!destroyed) {
          setBrickError('Não foi possível carregar o formulário de pagamento. Recarregue a página.');
        }
      }
    }

    mountBrick();

    return () => {
      destroyed = true;
      if (brickControllerRef.current) {
        brickControllerRef.current.unmount().catch(() => {});
        brickControllerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendamento, loja, servico]);

  // Polling para verificar se o pagamento PIX foi concluído
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
          console.error('Erro ao checar status do pagamento:', err);
        }
      }, 5000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [pendingPaymentInfo, agendamento, paymentSuccess]);

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
                  <p>O lojista ainda não configurou a Chave Pública do Mercado Pago.</p>
                </div>
              ) : brickError ? (
                <div className="checkout-error" style={{ minHeight: 'auto', padding: '20px' }}>
                  <p>{brickError}</p>
                  <button
                    className="btn-pay"
                    style={{ marginTop: '12px' }}
                    onClick={() => { setBrickError(''); window.location.reload(); }}
                  >
                    Recarregar página
                  </button>
                </div>
              ) : (
                <div
                  style={{ opacity: isProcessing ? 0.5 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
                >
                  {/* Container onde o SDK nativo do MP monta o Brick */}
                  <div id="mp-payment-brick-container" ref={brickContainerRef}></div>
                  {isProcessing && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <i className="fa-solid fa-spinner fa-spin"></i> Processando pagamento...
                    </div>
                  )}
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
