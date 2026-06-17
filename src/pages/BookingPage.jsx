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
  const [veiculo, setVeiculo] = useState(searchParams.get('veiculo') || searchParams.get('modelo') || '');
  const [servicoId, setServicoId] = useState(searchParams.get('servicoId') || '');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState(searchParams.get('data') || todayStr);
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
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

          const { data: srvsAll, error: srvsErr } = await supabase.from('servicos').select('*');
          const srvs = srvsAll ? srvsAll.filter(s => s.user_id === storeData.id) : [];
          console.log("LOG DEBUG BookingPage -> storeData.id:", storeData.id);
          console.log("LOG DEBUG BookingPage -> srvsAll:", srvsAll);
          console.log("LOG DEBUG BookingPage -> srvs:", srvs);
          console.log("LOG DEBUG BookingPage -> srvsErr:", srvsErr);
          
          if (srvsAll) {
            setServicos(srvsAll); // TEMPORARY FIX: Set all services to see if it renders
            if (srvsAll.length > 0 && !searchParams.get('servicoId')) {
              setServicoId(srvsAll[0].id);
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

  // Load Availability
  useEffect(() => {
    if (!loja || !dataSelecionada || !servicoId || servicos.length === 0) return;

    async function loadAvailability() {
      const startOfDay = new Date(`${dataSelecionada}T00:00:00`).toISOString();
      const endOfDay = new Date(`${dataSelecionada}T23:59:59`).toISOString();

      const { data: agendamentosDia } = await supabase
        .from('agendamentos')
        .select('data_hora, servico_id')
        .eq('user_id', loja.id)
        .gte('data_hora', startOfDay)
        .lte('data_hora', endOfDay);

      const servicoSelecionado = servicos.find(s => s.id === servicoId);
      const duracaoMinutos = servicoSelecionado ? servicoSelecionado.duracao : 60;

      const slots = [];
      const inicioExpediente = 8 * 60; // 08:00
      const fimExpediente = 18 * 60; // 18:00

      for (let min = inicioExpediente; min <= fimExpediente; min += 30) {
        const slotStart = min;
        const slotEnd = min + duracaoMinutos;

        if (slotEnd > fimExpediente) continue;

        let conflito = false;
        if (agendamentosDia) {
          for (let ag of agendamentosDia) {
            const agDate = new Date(ag.data_hora);
            const agStartMin = agDate.getHours() * 60 + agDate.getMinutes();
            
            const agServico = servicos.find(s => s.id === ag.servico_id);
            const agDuracao = agServico ? agServico.duracao : 60;
            const agEndMin = agStartMin + agDuracao;

            // Intersecção de horários: StartA < EndB AND EndA > StartB
            if (slotStart < agEndMin && slotEnd > agStartMin) {
              conflito = true;
              break;
            }
          }
        }

        if (!conflito) {
          const hours = Math.floor(min / 60).toString().padStart(2, '0');
          const minutes = (min % 60).toString().padStart(2, '0');
          slots.push(`${hours}:${minutes}`);
        }
      }

      setHorariosDisponiveis(slots);
      setHorarioSelecionado('');
    }

    loadAvailability();
  }, [dataSelecionada, servicoId, loja, servicos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loja) return;
    if (!horarioSelecionado) {
      alert("Por favor, selecione um horário disponível.");
      return;
    }

    try {
      const precoServico = servicos.find(s => s.id === servicoId)?.preco || 0;
      const cleanCelular = celular.replace(/\D/g, '');

      // CRM: Cadastra ou Atualiza Cliente
      const { data: exCliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('user_id', loja.id)
        .eq('celular', cleanCelular)
        .single();

      let finalClienteId = null;
      if (!exCliente) {
        const novoCli = {
          user_id: loja.id,
          nome,
          celular: cleanCelular,
          veiculo: veiculo,
          placa: placa.toUpperCase()
        };
        const { data: insertedCli } = await supabase.from('clientes').insert(novoCli).select().single();
        if (insertedCli) finalClienteId = insertedCli.id;
      } else {
        finalClienteId = exCliente.id;
      }

      const dataHoraIso = new Date(`${dataSelecionada}T${horarioSelecionado}:00`).toISOString();

      const novoAgendamento = {
        user_id: loja.id,
        cliente_id: finalClienteId,
        servico_id: servicoId,
        data_hora: dataHoraIso,
        status: 'waiting',
        pago: false,
        valor_total: precoServico,
        placa: placa.toUpperCase(),
        cliente_nome: nome,
        veiculo_modelo: veiculo,
        celular_cliente: cleanCelular
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
          <p style={{color: 'red', fontSize: '10px'}}>Debug Loja ID: {loja.id}</p>
        </div>

        {sucesso ? (
          <div className="booking-success">
            <h2>Agendamento Confirmado!</h2>
            <p>Seu horário foi reservado com sucesso e os dados salvos em nosso sistema.</p>
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
                <option value="" disabled>Selecione um serviço...</option>
                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Data Desejada</label>
              <input type="date" required value={dataSelecionada} onChange={e => setDataSelecionada(e.target.value)} min={todayStr} />
            </div>

            <div className="form-group">
              <label>Horários Disponíveis</label>
              {servicos.length === 0 ? (
                <div className="no-slots">
                  Nenhum serviço cadastrado nesta loja.
                </div>
              ) : !servicoId ? (
                <div className="no-slots">
                  Selecione um serviço para visualizar os horários.
                </div>
              ) : horariosDisponiveis.length > 0 ? (
                <div className="time-slots-grid">
                  {horariosDisponiveis.map(slot => (
                    <div 
                      key={slot} 
                      className={`time-slot ${horarioSelecionado === slot ? 'selected' : ''}`}
                      onClick={() => setHorarioSelecionado(slot)}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-slots">
                  Nenhum horário disponível para a duração deste serviço na data selecionada.
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary booking-submit" disabled={!horarioSelecionado}>
              Confirmar Horário
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingPage;


