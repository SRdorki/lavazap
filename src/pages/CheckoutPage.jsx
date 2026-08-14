import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { createPaymentLink } from '../mercadoPago';
import './CheckoutPage.css';

function CheckoutPage() {
  const { id } = useParams();

  const [agendamento, setAgendamento] = useState(null);
  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: agData, error: agErr } = await supabase
          .from('agendamentos')
          .select('*')
          .eq('id', id)
          .single();

        if (agErr || !agData) {
          setError('Pagamento não encontrado.');
          return;
        }
        setAgendamento(agData);

        const { data: storeData } = await supabase
          .from('assinantes')
          .select('id, nome_empresa, whitelabel_color, whitelabel_logo, nome_plano, mp_access_token')
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

  const handlePagar = async () => {
    if (!loja?.mp_access_token) {
      alert('O estabelecimento ainda não configurou o Mercado Pago. Entre em contato com eles.');
      return;
    }

    setIsRedirecting(true);
    try {
      const descricao = servico ? `Lavagem: ${servico.nome}` : 'Serviço de Lavagem';
      const url = await createPaymentLink(
        agendamento.valor_total,
        descricao,
        agendamento.id,
        loja.mp_access_token
      );

      if (url) {
        window.location.href = url;
      } else {
        alert('Não foi possível gerar o link de pagamento. Tente novamente.');
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado. Tente novamente.');
      setIsRedirecting(false);
    }
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

  if (agendamento.pago) {
    return (
      <div className="checkout-container">
        <div className="checkout-card">
          <div className="checkout-success">
            <div className="success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2>Pagamento Confirmado!</h2>
            <p>Obrigado! Seu pagamento já foi recebido.</p>
          </div>
        </div>
      </div>
    );
  }

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
          <button
            className="btn-pay"
            onClick={handlePagar}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Aguarde...
              </>
            ) : (
              <>
                <i className="fa-brands fa-pix" style={{ marginRight: '8px' }}></i>
                Pagar com Mercado Pago
              </>
            )}
          </button>
          <p className="secure-badge">
            <i className="fa-solid fa-lock"></i>
            Pagamento 100% seguro via Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
