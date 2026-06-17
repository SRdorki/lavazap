import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './BookingPage.css';

function BookingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [loja, setLoja] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form (Populated from URL)
  const [nome, setNome] = useState(searchParams.get('nome') || '');
  const [celular, setCelular] = useState(searchParams.get('celular') || '');
  const [placa, setPlaca] = useState(searchParams.get('placa') || '');
  const [veiculo, setVeiculo] = useState(searchParams.get('veiculo') || '');
  const [servicoId, setServicoId] = useState(searchParams.get('servicoId') || '');
  const getDefaultFormHorario = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [dataHora, setDataHora] = useState(getDefaultFormHorario());
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    async function loadLoja() {
      if (['painel', 'login', 'admin'].includes(slug)) return;

      try {
        const { data: storeData } = await supabase
          .from('assinantes')
          .select('id, nome_empresa, email, whitelabel_url, whitelabel_color, whitelabel_logo, nome_plano')
          .eq('whitelabel_url', slug)
          .single();

        if (storeData) {
          setLoja(storeData);
          
          if (storeData.whitelabel_color && storeData.nome_plano !== 'start') {
            document.documentElement.style.setProperty('--primary-color', storeData.whitelabel_color);
          } else {
            document.documentElement.style.removeProperty('--primary-color');
          }

          const { data: srvs } = await supabase.from('servicos').select('*');
          if (srvs) {
            setServicos(srvs);
            if (srvs.length > 0 && !searchParams.get('servicoId')) {
              setServicoId(srvs[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar a loja:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLoja();

    return () => document.documentElement.style.removeProperty('--primary-color');
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loja) return;

    try {
      const precoServico = servicos.find(s => s.id === servicoId)?.preco || 0;

      const novoAgendamento = {
        servico_id: servicoId,
        data_hora: new Date(dataHora).toISOString(),
        status: 'waiting',
        pago: false,
        valor_total: precoServico,
        placa: placa.toUpperCase(),
        cliente_nome: nome,
        veiculo_modelo: veiculo,
        celular_cliente: celular.replace(/\D/g, '')
      };

      const { error } = await supabase.from('agendamentos').insert(novoAgendamento);
      if (error) throw error;
      
      setSucesso(true);
    } catch (err) {
      alert("Erro ao realizar agendamento: " + err.message);
    }
  };

  if (loading) return <div className="booking-loading">Carregando agenda...</div>;
  if (!loja) return <div className="booking-error"><h2>Lava-Rápido não encontrado!</h2><Link to="/">Voltar</Link></div>;

  return (
    <div className="booking-container">
      <div className="booking-card">
        <div className="booking-header">
          {loja.whitelabel_logo && loja.nome_plano !== 'start' ? (
            <img src={loja.whitelabel_logo} alt={loja.nome_empresa} style={{ maxHeight: '60px', borderRadius: '8px' }} />
          ) : (
            <h2>{loja.nome_empresa || 'LavaZap Agendamento'}</h2>
          )}
          <h1>Agendamento Online</h1>
          <p>Preencha os dados para confirmar seu horário.</p>
        </div>

        {sucesso ? (
          <div className="booking-success">
            <h2>Agendamento Confirmado!</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group"><label>Seu Nome</label><input type="text" required value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div className="form-group"><label>WhatsApp</label><input type="tel" required value={celular} onChange={e => setCelular(e.target.value)} /></div>
            <div className="form-group"><label>Veículo</label><input type="text" required value={veiculo} onChange={e => setVeiculo(e.target.value)} /></div>
            <div className="form-group"><label>Placa</label><input type="text" required value={placa} onChange={e => setPlaca(e.target.value)} /></div>
            <div className="form-group">
              <label>Serviço</label>
              <select required value={servicoId} onChange={e => setServicoId(e.target.value)}>
                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Data e Horário desejado</label>
              <input type="datetime-local" required value={dataHora} onChange={e => setDataHora(e.target.value)} />
            </div>

            <button type="submit" className="btn-primary booking-submit">Confirmar Horário</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
