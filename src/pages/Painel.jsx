import { useState, useEffect, useRef, useCallback } from 'react'
import { initGapiClient, initGisClient, requestAccessToken, revokeToken, isAuthenticated, createCalendarEvent, listCalendarEvents } from '../googleCalendar'
import { supabase } from '../supabaseClient'
import { createPaymentLink } from '../mercadoPago'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const STRIPE_LINK_START = import.meta.env.VITE_STRIPE_LINK_START || '#'
const STRIPE_LINK_PREMIUM = import.meta.env.VITE_STRIPE_LINK_PREMIUM || '#'
const STRIPE_LINK_VIP = import.meta.env.VITE_STRIPE_LINK_VIP || '#'

// Agora usamos a data real do sistema
const DATA_REFERENCIA = new Date();

function Painel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme] = useState('dark')
  const [agendamentos, setAgendamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [despesas, setDespesas] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [assinanteAuth, setAssinanteAuth] = useState(null)
  const [editingServico, setEditingServico] = useState(null)
  const [editPreco, setEditPreco] = useState('')
  const [editNome, setEditNome] = useState('')
  const [editDuracao, setEditDuracao] = useState('')
  const [editChecklist, setEditChecklist] = useState('')
  const [editingCliente, setEditingCliente] = useState(null)
  const [editCliNome, setEditCliNome] = useState('')
  const [editCliCelular, setEditCliCelular] = useState('')
  const [editCliVeiculo, setEditCliVeiculo] = useState('')
  const [editCliPlaca, setEditCliPlaca] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('este_mes')
  const [pesquisa, setPesquisa] = useState('')
  const [pesquisaCliente, setPesquisaCliente] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCards, setSelectedCards] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Formulário Modal State
  const [formCelular, setFormCelular] = useState('')
  const [formNome, setFormNome] = useState('')
  const [formVeiculo, setFormVeiculo] = useState('')
  const [formPlaca, setFormPlaca] = useState('')
  const [formServico, setFormServico] = useState('')
  const getDefaultFormHorario = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [formHorario, setFormHorario] = useState(getDefaultFormHorario())
  const [formAgendFuncionario, setFormAgendFuncionario] = useState('')
  const [crmStatus, setCrmStatus] = useState(null) // 'found' | 'not-found' | null

  // Formulários Financeiro e Equipe
  const [formDespesaDesc, setFormDespesaDesc] = useState('')
  const [formDespesaValor, setFormDespesaValor] = useState('')
  const [formDespesaData, setFormDespesaData] = useState(new Date().toISOString().slice(0, 10))
  const [formDespesaCat, setFormDespesaCat] = useState('Geral')

  const [formFuncNome, setFormFuncNome] = useState('')
  const [formFuncCargo, setFormFuncCargo] = useState('Lavador')
  const [formFuncComissao, setFormFuncComissao] = useState('')
  const [formFuncTelefone, setFormFuncTelefone] = useState('')

  // MP State
  const [formMpToken, setFormMpToken] = useState('')
  
  // Bot State
  const [formBotNumero, setFormBotNumero] = useState('')

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingToken, setOnboardingToken] = useState('')
  
  // Whitelabel State
  const [formWhitelabelUrl, setFormWhitelabelUrl] = useState('')
  const [formWhitelabelColor, setFormWhitelabelColor] = useState('#0A0E17')
  const [formWhitelabelLogo, setFormWhitelabelLogo] = useState('')
  
  // Subscription State
  const [showSubscriptionBlock, setShowSubscriptionBlock] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')

  // Google Calendar State
  const [gcalConnected, setGcalConnected] = useState(true)
  const [gcalLoading, setGcalLoading] = useState(false)
  const [gcalEvents, setGcalEvents] = useState([])
  const [gcalSyncMsg, setGcalSyncMsg] = useState('')
  const gcalInitialized = useRef(false)
  const [agendaViewMode, setAgendaViewMode] = useState('calendar') // 'table' ou 'calendar'

  // Google Calendar Initialization
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com') return;

    const initGoogle = async () => {
      try {
        initGisClient(GOOGLE_CLIENT_ID, (tokenResponse) => {
          setGcalLoading(false);
          if (tokenResponse.error) {
            console.error('Erro no token:', tokenResponse);
            setGcalConnected(false);
            return;
          }
          setGcalConnected(true);
          setGcalSyncMsg('Conectado com sucesso!');
          setTimeout(() => setGcalSyncMsg(''), 3000);
          fetchGcalEvents();
        });
        await initGapiClient();
        await initGapiClient();
      } catch (err) {
        console.warn('Google API não disponível:', err);
      }
    };

    // Aguarda scripts carregarem
    const waitForScripts = setInterval(() => {
      if (typeof gapi !== 'undefined' && typeof google !== 'undefined' && google.accounts) {
        clearInterval(waitForScripts);
        if (!gcalInitialized.current) {
          gcalInitialized.current = true;
          initGoogle();
        }
      }
    }, 500);

    return () => clearInterval(waitForScripts);
  }, [])

  // Supabase Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return;
      const userId = session.user.id;

      const { data: servicosData } = await supabase.from('servicos').select('*').eq('user_id', userId)
      if (servicosData) {
        setServicos(servicosData)
        if (servicosData.length > 0 && !formServico) {
          setFormServico(servicosData[0].id)
        }
      }

      const { data: clientesData } = await supabase.from('clientes').select('*').eq('user_id', userId)
      if (clientesData) setClientes(clientesData)

      const { data: agendamentosData } = await supabase.from('agendamentos').select('*').eq('user_id', userId)
      if (agendamentosData) setAgendamentos(agendamentosData)

      const { data: despesasData } = await supabase.from('despesas').select('*').eq('user_id', userId)
      if (despesasData) setDespesas(despesasData)

      const { data: funcData } = await supabase.from('funcionarios').select('*').eq('user_id', userId)
      if (funcData) setFuncionarios(funcData)

      const { data: myUser } = await supabase.from('assinantes').select('*').eq('id', userId).single()
      if (myUser) {
        setAssinanteAuth(myUser)
        setFormMpToken(myUser.mp_access_token || '')
        setFormBotNumero(myUser.bot_numero_teste || '')
          
          let defaultSlug = '';
          if (myUser.nome_empresa) {
            defaultSlug = myUser.nome_empresa.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-');
          }
          setFormWhitelabelUrl(myUser.whitelabel_url || defaultSlug)
          setFormWhitelabelColor(myUser.whitelabel_color || '#0A0E17')
          setFormWhitelabelLogo(myUser.whitelabel_logo || '')
          
          if (!myUser.is_admin) {
            // Check Onboarding
            if (!myUser.mp_access_token) {
              setShowOnboarding(true)
            }
            
            // Check Subscription
            if (myUser.status_plano === 'inativo' || myUser.status_plano === 'pendente_pagamento') {
              setSubscriptionMessage('Você precisa iniciar o seu teste grátis para acessar o painel.');
              setShowSubscriptionBlock(true);
            } else if (myUser.status_plano === 'trial') {
              if (myUser.plano_expira_em) {
                const expDate = new Date(myUser.plano_expira_em);
                if (new Date() > expDate) {
                  setSubscriptionMessage('Sua assinatura ou período de teste expirou.');
                  setShowSubscriptionBlock(true);
                }
              }
            }
          }
        }
      }
    fetchData()

    // Realtime para Agendamentos (Atualiza o Dashboard instantaneamente se pago via webhook)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setAgendamentos(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
          } else if (payload.eventType === 'INSERT') {
            setAgendamentos(prev => {
              if (prev.find(a => a.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'DELETE') {
            setAgendamentos(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      document.documentElement.style.removeProperty('--accent-cyan');
      document.documentElement.style.removeProperty('--accent-blue');
    }
  }, [])

  // Efeito para aplicar a cor do Whitelabel no Painel em tempo real
  useEffect(() => {
    if (formWhitelabelColor && formWhitelabelColor !== '#0A0E17' && assinanteAuth?.nome_plano !== 'start') {
      document.documentElement.style.setProperty('--accent-cyan', formWhitelabelColor);
      document.documentElement.style.setProperty('--accent-blue', formWhitelabelColor);
    } else {
      document.documentElement.style.removeProperty('--accent-cyan');
      document.documentElement.style.removeProperty('--accent-blue');
    }
  }, [formWhitelabelColor, assinanteAuth?.nome_plano]);

  const fetchGcalEvents = useCallback(async () => {
    try {
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const events = await listCalendarEvents(now, thirtyDaysLater);
      setGcalEvents(events);
    } catch (err) {
      console.warn('Erro ao buscar eventos:', err);
    }
  }, [])

  const handleGcalConnect = () => {
    setGcalLoading(true)
    try {
      requestAccessToken()
    } catch (err) {
      console.error('Erro ao chamar popup do Google:', err)
      alert('Erro ao tentar conectar com Google.')
    }
    // Caso o usuário feche a janela do Google, volta ao normal em 8s
    setTimeout(() => setGcalLoading(false), 8000)
  }

  const handleGcalDisconnect = () => {
    revokeToken()
    setGcalConnected(false)
    setGcalEvents([])
    setGcalSyncMsg('Desconectado do Google Agenda.')
    setTimeout(() => setGcalSyncMsg(''), 3000)
  }



  // Efeito de Mousemove para Spotlight nas Cartas
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.spotlight-card')
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        card.style.setProperty('--mouse-x', `${x}px`)
        card.style.setProperty('--mouse-y', `${y}px`)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [agendamentos])

  // Monitoramento do Input de Celular para Busca de CRM
  useEffect(() => {
    if (formCelular.length >= 10) {
      const sanitized = formCelular.replace(/\D/g, '')
      const clienteEncontrado = clientes.find((c) => c.celular === sanitized)
      if (clienteEncontrado) {
        setFormNome(clienteEncontrado.nome)
        setFormVeiculo(clienteEncontrado.veiculo)
        setFormPlaca(clienteEncontrado.placa)
        setCrmStatus('found')
      } else {
        setCrmStatus('not-found')
      }
    } else {
      setCrmStatus(null)
    }
  }, [formCelular, clientes])

  // Alternador de Tema
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  // Clear selected cards on tab change
  useEffect(() => {
    setSelectedCards([])
  }, [activeTab])

  // Filtragem Dinâmica dos Dados
  const getFiltroDatas = () => {
    const hoje = new Date() // Data real do sistema
    
    return agendamentos.filter((a) => {
      const dataAgend = new Date(a.data_hora)
      
      // Filtro de Busca (Placa ou Cliente)
      const placaLimpa = (a.placa || '').replace(/[- ]/g, '').toLowerCase();
      const pesquisaLimpa = (pesquisa || '').replace(/[- ]/g, '').toLowerCase();
      const nomeLimpo = (a.cliente_nome || '').toLowerCase();
      const matchesSearch = pesquisa === '' || 
        placaLimpa.includes(pesquisaLimpa) || 
        nomeLimpo.includes(pesquisa.toLowerCase());

      if (!matchesSearch) return false;

      // Se houver pesquisa ativa, ignoramos os filtros de data para retornar globalmente
      if (pesquisa !== '') return true;

      // Filtros de Período
      if (filtroPeriodo === 'hoje') {
        return dataAgend.toDateString() === hoje.toDateString()
      } else if (filtroPeriodo === 'este_mes') {
        return dataAgend.getMonth() === hoje.getMonth() && dataAgend.getFullYear() === hoje.getFullYear()
      } else if (filtroPeriodo === 'mes_passado') {
        let lastMonth = hoje.getMonth() - 1;
        let year = hoje.getFullYear();
        if (lastMonth < 0) { lastMonth = 11; year--; }
        return dataAgend.getMonth() === lastMonth && dataAgend.getFullYear() === year
      }
      return true
    })
  }

  const listFiltrada = getFiltroDatas()

  // Cálculos Dinâmicos Financeiros para Cards 1 e 2
  const hoje = new Date() // Data real do sistema
  let metric1Value = 0;
  let metric2Value = 0;
  let metric1Label = '';
  let metric2Label = '';
  let metric1Footer = '';
  let metric2Footer = '';

  if (filtroPeriodo === 'hoje') {
    metric1Label = 'Faturamento Hoje';
    metric2Label = 'Faturamento Ontem';
    metric1Footer = 'vs. ontem';
    metric2Footer = 'Dia 14/06 completo';
    
    metric1Value = agendamentos
      .filter(a => new Date(a.data_hora).toDateString() === hoje.toDateString() && a.pago)
      .reduce((acc, curr) => acc + Number(curr.valor_total), 0);
      
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    metric2Value = agendamentos
      .filter(a => new Date(a.data_hora).toDateString() === ontem.toDateString() && a.pago)
      .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  } else if (filtroPeriodo === 'este_mes') {
    metric1Label = 'Faturamento Este Mês';
    metric2Label = 'Faturamento Mês Passado';
    metric1Footer = 'vs. mês anterior';
    metric2Footer = 'Mês passado completo';
    
    metric1Value = agendamentos
      .filter(a => new Date(a.data_hora).getMonth() === hoje.getMonth() && new Date(a.data_hora).getFullYear() === hoje.getFullYear() && a.pago)
      .reduce((acc, curr) => acc + Number(curr.valor_total), 0);
      
    let lastMonth = hoje.getMonth() - 1;
    let year = hoje.getFullYear();
    if (lastMonth < 0) { lastMonth = 11; year--; }

    metric2Value = agendamentos
      .filter(a => new Date(a.data_hora).getMonth() === lastMonth && new Date(a.data_hora).getFullYear() === year && a.pago)
      .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  } else if (filtroPeriodo === 'mes_passado') {
    metric1Label = 'Faturamento Mês Passado';
    metric2Label = 'Faturamento Mês Retrasado';
    metric1Footer = 'vs. mês retrasado';
    metric2Footer = 'Mês retrasado completo';
    
    let lastMonth = hoje.getMonth() - 1;
    let year = hoje.getFullYear();
    if (lastMonth < 0) { lastMonth = 11; year--; }

    let lastLastMonth = lastMonth - 1;
    let lastLastYear = year;
    if (lastLastMonth < 0) { lastLastMonth = 11; lastLastYear--; }

    metric1Value = agendamentos
      .filter(a => new Date(a.data_hora).getMonth() === lastMonth && new Date(a.data_hora).getFullYear() === year && a.pago)
      .reduce((acc, curr) => acc + Number(curr.valor_total), 0);
      
    metric2Value = agendamentos
      .filter(a => new Date(a.data_hora).getMonth() === lastLastMonth && new Date(a.data_hora).getFullYear() === lastLastYear && a.pago)
      .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  } else {
    // "todos"
    metric1Label = 'Faturamento Total';
    metric2Label = 'Média Mensal Estimada';
    metric1Footer = 'Todo o histórico';
    metric2Footer = 'Média geral por mês';
    
    const concluidosGeral = agendamentos.filter(a => a.pago);
    metric1Value = concluidosGeral.reduce((acc, curr) => acc + Number(curr.valor_total), 0);
    metric2Value = metric1Value > 0 ? metric1Value / 2 : 0; // Aproximação de 2 meses no MVP
  }

  // Cálculo da variação percentual
  const variacaoFaturamento = metric2Value > 0 && filtroPeriodo !== 'todos'
    ? (((metric1Value - metric2Value) / metric2Value) * 100).toFixed(1)
    : 0;

  // Variáveis fixas para a aba Financeiro
  const currMonth = hoje.getMonth();
  const currYear = hoje.getFullYear();
  let prevMonth = currMonth - 1;
  let prevYear = currYear;
  if (prevMonth < 0) { prevMonth = 11; prevYear--; }

  const faturamentoEsteMes = agendamentos
    .filter(a => new Date(a.data_hora).getMonth() === currMonth && new Date(a.data_hora).getFullYear() === currYear && a.pago)
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  const faturamentoMesPassado = agendamentos
    .filter(a => new Date(a.data_hora).getMonth() === prevMonth && new Date(a.data_hora).getFullYear() === prevYear && a.pago)
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  const faturamentoEsteAno = agendamentos
    .filter(a => new Date(a.data_hora).getFullYear() === currYear && a.pago)
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  const faturamentoAnoPassado = agendamentos
    .filter(a => new Date(a.data_hora).getFullYear() === (currYear - 1) && a.pago)
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0);

  const despesasEsteMes = despesas
    .filter(d => new Date(d.data).getMonth() === currMonth && new Date(d.data).getFullYear() === currYear)
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const despesasMesPassado = despesas
    .filter(d => new Date(d.data).getMonth() === prevMonth && new Date(d.data).getFullYear() === prevYear)
    .reduce((acc, curr) => acc + Number(curr.valor), 0);

  const lucroLiquidoEsteMes = faturamentoEsteMes - despesasEsteMes;
  const lucroLiquidoMesPassado = faturamentoMesPassado - despesasMesPassado;

  const variacaoAnual = faturamentoAnoPassado === 0 ? 100 : (((faturamentoEsteAno - faturamentoAnoPassado) / faturamentoAnoPassado) * 100).toFixed(1);

  // Ticket Médio
  const agendamentosConcluidos = agendamentos.filter(a => a.pago)
  const ticketMedio = agendamentosConcluidos.length > 0 
    ? (agendamentosConcluidos.reduce((acc, curr) => acc + Number(curr.valor_total), 0) / agendamentosConcluidos.length).toFixed(2)
    : 0

  const faturamentoTotalFiltrado = listFiltrada
    .filter(a => a.pago)
    .reduce((acc, curr) => acc + Number(curr.valor_total), 0)

  // Mudar Status de Pagamento
  const handleTogglePayment = async (agendamento) => {
    const novoStatus = !agendamento.pago;
    setAgendamentos(prev => prev.map(a => a.id === agendamento.id ? { ...a, pago: novoStatus } : a));
    const { error } = await supabase.from('agendamentos').update({ pago: novoStatus }).eq('id', agendamento.id);
    if (error) {
      alert("Erro ao atualizar pagamento: " + error.message);
      setAgendamentos(prev => prev.map(a => a.id === agendamento.id ? { ...a, pago: !novoStatus } : a));
    }
  }

  // Mudar Status do Veículo e Notificar Automaticamente o Cliente
  const handleUpdateStatus = async (id, newStatus) => {
    // Encontra o agendamento atual na lista
    const agendamento = agendamentos.find(a => a.id === id)
    if (!agendamento) return

    // Cria a versão atualizada do agendamento com o novo status para montar a mensagem
    const agendamentoAtualizado = { ...agendamento, status: newStatus }

    // Atualiza de forma otimista no estado local
    setAgendamentos(prev => prev.map(a => a.id === id ? agendamentoAtualizado : a))
    
    // Dispara a mensagem de aviso correspondente
    handleSendWhatsAppNotification(agendamentoAtualizado)

    // Atualiza o registro no banco de dados do Supabase
    const { error } = await supabase.from('agendamentos').update({ status: newStatus }).eq('id', id)
    if (error) console.error("Erro ao atualizar status:", error)
  }

  // Notificação Automática e Silenciosa via n8n
  const handleSendWhatsAppNotification = async (a) => {
    // Apenas se for "Plano VIP" ou "Plano Profissional" o sistema vai avisar sozinho
    // Para fins do MVP, vamos disparar o webhook para todos e o n8n decide o fluxo

    const servicoObj = servicos.find(s => s.id === a.servico_id);
    const servicoNome = servicoObj?.nome || 'Serviço';
    const checklistStr = servicoObj?.checklist || 'Lavagem Externa\nAspiração Interna\nHigienização de Painel\nAcabamento nos Pneus';
    const formattedChecklist = checklistStr.split('\n').filter(l => l.trim()).map(line => `✅ ${line.trim()}`).join('\n');

    let pixText = '';
    let paymentLink = '';

    if (!a.pago && a.status === 'ready') {
      paymentLink = await createPaymentLink(a.valor_total, `Lavagem: ${servicoNome}`, a.id, assinanteAuth?.mp_access_token);
      if (paymentLink) {
        pixText = `\n\nPara adiantar, acesse o link abaixo para realizar o pagamento (PIX ou Cartão):\n${paymentLink}`;
      }
    }

    let text = '';
    if (a.status === 'ready') {
      text = `Olá, *${a.cliente_nome}*! Seu *${a.veiculo_modelo}* (Placa: *${a.placa}*) está PRONTO para retirada! \n\nChecklist do serviço realizado (*${servicoNome}*):\n${formattedChecklist}\n\nValor total: *R$ ${Number(a.valor_total).toFixed(2)}*. Esperamos você!${pixText}`;
    } else if (a.status === 'progress') {
      text = `Olá, *${a.cliente_nome}*! O seu *${a.veiculo_modelo}* já entrou na nossa rampa de lavagem. Iniciamos o serviço de *${servicoNome}*. Avisaremos quando estiver pronto!`;
    }

    if (!text) return; // Se não for ready ou progress, não avisa

    const rawCelular = a.celular_cliente || '';
    const cleanCelular = rawCelular.replace(/\D/g, '');
    const phoneWithCountry = cleanCelular.startsWith('55') ? cleanCelular : `55${cleanCelular || '11999999999'}`;

    const payload = {
      event: `status_${a.status}`,
      client_name: a.cliente_nome,
      client_phone: phoneWithCountry,
      vehicle: a.veiculo_modelo,
      plate: a.placa,
      service: servicoNome,
      total_price: a.valor_total,
      payment_link: paymentLink,
      message_text: text
    };

    if (assinanteAuth?.nome_plano === 'vip') {
      try {
        // Dispara para o webhook de produção do n8n do usuário VIP
        await fetch('http://localhost:5678/webhook/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.log('Notificação enviada ao n8n com sucesso!');
      } catch (err) {
        console.error('Erro ao disparar webhook do n8n:', err);
        // Fallback
        const url = `https://api.whatsapp.com/send?phone=${payload.client_phone}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } else {
      // Para Start e Pro, abre o WhatsApp Web direto (não tem n8n integrado)
      const url = `https://api.whatsapp.com/send?phone=${payload.client_phone}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  }

  // Novo Agendamento
  const handleSaveAgendamento = async (e) => {
    e.preventDefault()
    if (!formNome || !formVeiculo || !formPlaca || !formCelular) return

    // Se o cliente é novo, adiciona no CRM
    const sanitizedCel = formCelular.replace(/\D/g, '')
    let clienteId = ''
    const exCliente = clientes.find(c => c.celular === sanitizedCel)
    
    if (!exCliente) {
      const novoCli = {
        nome: formNome,
        celular: sanitizedCel,
        veiculo: formVeiculo,
        placa: formPlaca.toUpperCase(),
        user_id: assinanteAuth.id
      }
      const { data: insertedCli, error: errCli } = await supabase.from('clientes').insert(novoCli).select().single()
      if (!errCli && insertedCli) {
        setClientes(prev => [...prev, insertedCli])
        clienteId = insertedCli.id
      } else if (errCli) {
        if (errCli.code === '23505' || errCli.message?.includes('clientes_celular_user_id_key')) {
          // O cliente já existe no banco (talvez inserido em outra aba/sessão), busca pelo celular
          const { data: existingDbCli } = await supabase.from('clientes').select('*').eq('celular', sanitizedCel).single();
          if (existingDbCli) {
            clienteId = existingDbCli.id;
            setClientes(prev => {
              if (prev.find(c => c.id === existingDbCli.id)) return prev;
              return [...prev, existingDbCli];
            }); // Atualiza o estado local sem duplicar
          }
        } else {
          console.error("Erro ao inserir cliente:", errCli)
          alert("Erro ao salvar cliente: " + (errCli.message || JSON.stringify(errCli)))
        }
      }
    } else {
      clienteId = exCliente.id
      // Atualiza os dados do cliente se houve mudança (ex: trocou de carro)
      const isChanged = exCliente.nome !== formNome || exCliente.veiculo !== formVeiculo || exCliente.placa !== formPlaca.toUpperCase();
      if (isChanged) {
        const updatedCli = { nome: formNome, veiculo: formVeiculo, placa: formPlaca.toUpperCase() };
        await supabase.from('clientes').update(updatedCli).eq('id', clienteId);
        setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, ...updatedCli } : c));
      }
    }

    const precoServico = servicos.find(s => s.id === formServico)?.preco || 50

    const novoAgendamento = {
      cliente_id: clienteId || null,
      servico_id: formServico || (servicos.length > 0 ? servicos[0].id : null),
      data_hora: new Date(formHorario).toISOString(),
      status: 'waiting',
      pago: false,
      valor_total: precoServico,
      placa: formPlaca.toUpperCase(),
      cliente_nome: formNome,
      veiculo_modelo: formVeiculo,
      celular_cliente: sanitizedCel,
      funcionario_id: formAgendFuncionario || null,
      user_id: assinanteAuth.id
    }

    const { data: insertedAgend, error: errAgend } = await supabase.from('agendamentos').insert(novoAgendamento).select().single()
    
    if (!errAgend && insertedAgend) {
      setAgendamentos(prev => [...prev, insertedAgend])
    } else {
      console.error("Erro ao salvar agendamento:", errAgend)
      alert("Erro ao salvar agendamento no Supabase: " + (errAgend?.message || JSON.stringify(errAgend)))
      return; // Stop execution if it failed to save
    }

    // Sincroniza com Google Calendar se conectado
    if (gcalConnected && isAuthenticated()) {
      const servicoInfo = servicos.find(s => s.id === formServico)
      try {
        await createCalendarEvent({
          summary: `LavaZap: ${servicoInfo?.nome || 'Servi\u00e7o'} - ${formPlaca.toUpperCase()}`,
          description: `Cliente: ${formNome}\nVe\u00edculo: ${formVeiculo}\nPlaca: ${formPlaca.toUpperCase()}\nValor: R$ ${Number(precoServico).toFixed(2)}`,
          startDateTime: formHorario,
          durationMinutes: servicoInfo?.duracao || 60,
          location: 'LavaZap - Lava-R\u00e1pido',
        })
        setGcalSyncMsg('Evento criado no Google Agenda!')
        setTimeout(() => setGcalSyncMsg(''), 3000)
        fetchGcalEvents()
      } catch (err) {
        console.warn('Falha ao criar evento no Google Calendar:', err)
        setGcalSyncMsg('Falha ao sincronizar com Google Agenda')
        setTimeout(() => setGcalSyncMsg(''), 4000)
      }
    }
    
    // Reset Form
    setFormCelular('')
    setFormNome('')
    setFormVeiculo('')
    setFormPlaca('')
    setFormServico(servicos.length > 0 ? servicos[0].id : '')
    setFormAgendFuncionario('')
    setCrmStatus(null)
    setIsModalOpen(false)
  }

  // Bulk Actions
  const handleSelectCard = (id) => {
    setSelectedCards(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  const handleBulkStatusChange = async (newStatus) => {
    setAgendamentos(prev => prev.map(a => selectedCards.includes(a.id) ? { ...a, status: newStatus } : a))
    const ids = [...selectedCards]
    setSelectedCards([])
    const { error } = await supabase.from('agendamentos').update({ status: newStatus }).in('id', ids)
    if (error) console.error("Erro no bulk update:", error)
  }

  const handleBulkDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar os agendamentos selecionados?')) {
      const ids = [...selectedCards]
      setAgendamentos(prev => prev.filter(a => !ids.includes(a.id)))
      setSelectedCards([])
      const { error } = await supabase.from('agendamentos').delete().in('id', ids)
      if (error) console.error("Erro no bulk delete:", error)
    }
  }

  // Serviços Actions
  const handleAddServico = async () => {
    const checklistPadrao = 'Lavagem Externa\\nAspiração Interna\\nHigienização de Painel\\nAcabamento nos Pneus (Pretinho)';
    const newServico = { nome: 'Novo Serviço', preco: 0, duracao: 30, checklist: checklistPadrao, user_id: assinanteAuth.id };
    const { data: inserted, error } = await supabase.from('servicos').insert(newServico).select().single()
    if (!error && inserted) {
      setServicos(prev => [...prev, inserted]);
      setEditingServico(inserted.id);
      setEditNome('Novo Serviço');
      setEditPreco(0);
      setEditDuracao(30);
      setEditChecklist(checklistPadrao);
    } else if (error) {
      alert("Erro ao criar serviço: " + error.message);
      console.error(error);
    }
  }

  const handleRemoveServico = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este serviço?')) {
      setServicos(prev => prev.filter(s => s.id !== id));
      await supabase.from('servicos').delete().eq('id', id);
    }
  }

  // Clientes Actions
  const startEditingCliente = (c) => {
    setEditingCliente(c.id);
    setEditCliNome(c.nome);
    setEditCliCelular(c.celular);
    setEditCliVeiculo(c.veiculo || '');
    setEditCliPlaca(c.placa || '');
  }

  const handleSaveEditCliente = async (id) => {
    const updated = { 
      nome: editCliNome, 
      celular: editCliCelular.replace(/\D/g, ''), 
      veiculo: editCliVeiculo, 
      placa: editCliPlaca.toUpperCase() 
    };
    
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    setEditingCliente(null);
    
    const { error } = await supabase.from('clientes').update(updated).eq('id', id);
    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar cliente: " + (error.message || JSON.stringify(error)));
    }
  }

  const handleDeleteCliente = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
      // Guardar o estado anterior caso a deleção falhe
      const backupClientes = [...clientes];
      setClientes(prev => prev.filter(c => c.id !== id));
      
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      
      if (error) {
         // Reverter deleção otimista
         setClientes(backupClientes);
         
         if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
           alert("❌ Não é possível apagar este cliente pois ele já possui veículos na fila de lavagem ou agendamentos no histórico.\n\nPara apagá-lo, você precisa deletar os agendamentos dele primeiro.");
         } else {
           alert("❌ Ocorreu um erro ao apagar o cliente. Tente novamente.");
         }
      }
    }
  }

  const handleAgendarPeloCliente = (c) => {
    setFormCelular(c.celular);
    setFormNome(c.nome);
    setFormVeiculo(c.veiculo || '');
    setFormPlaca(c.placa || '');
    setIsModalOpen(true);
  }

  const handleSaveEditServico = async (id) => {
    const updated = { nome: editNome, preco: Number(editPreco), duracao: Number(editDuracao), checklist: editChecklist }
    setServicos(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    setEditingServico(null);
    await supabase.from('servicos').update(updated).eq('id', id);
  }

  // Despesas Actions
  const handleSaveDespesa = async (e) => {
    e.preventDefault();
    if (!formDespesaDesc || !formDespesaValor || !formDespesaData) return;
    const newDespesa = {
      descricao: formDespesaDesc,
      valor: Number(formDespesaValor),
      data: formDespesaData,
      categoria: formDespesaCat,
      user_id: assinanteAuth.id
    };
    const { data, error } = await supabase.from('despesas').insert(newDespesa).select().single();
    if (!error && data) {
      setDespesas(prev => [...prev, data]);
      setFormDespesaDesc('');
      setFormDespesaValor('');
      setFormDespesaData(new Date().toISOString().slice(0, 10));
      setFormDespesaCat('Geral');
    } else if (error) {
      alert("Erro ao salvar despesa: " + error.message);
    }
  };

  const handleRemoveDespesa = async (id) => {
    if (window.confirm('Tem certeza?')) {
      setDespesas(prev => prev.filter(d => d.id !== id));
      await supabase.from('despesas').delete().eq('id', id);
    }
  };

  // Funcionarios Actions
  const handleSaveFuncionario = async (e) => {
    e.preventDefault();
    if (!formFuncNome) return;
    const newFunc = {
      nome: formFuncNome,
      cargo: formFuncCargo,
      comissao_percentual: Number(formFuncComissao) || 0,
      telefone: formFuncTelefone.replace(/\\D/g, ''),
      user_id: assinanteAuth.id
    };
    const { data, error } = await supabase.from('funcionarios').insert(newFunc).select().single();
    if (!error && data) {
      setFuncionarios(prev => [...prev, data]);
      setFormFuncNome('');
      setFormFuncCargo('Lavador');
      setFormFuncComissao('');
      setFormFuncTelefone('');
    } else if (error) {
      alert("Erro ao salvar funcionário: " + error.message);
    }
  };

  const handleRemoveFuncionario = async (id) => {
    if (window.confirm('Tem certeza?')) {
      setFuncionarios(prev => prev.filter(f => f.id !== id));
      await supabase.from('funcionarios').delete().eq('id', id);
    }
  };

  const handleSaveMpToken = async () => {
    if (!assinanteAuth) return;
    try {
      const { error } = await supabase.from('assinantes').update({ mp_access_token: formMpToken }).eq('id', assinanteAuth.id);
      if (error) throw error;
      alert('Token salvo com sucesso!');
      setAssinanteAuth(prev => ({ ...prev, mp_access_token: formMpToken }));
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar token. Verifique as permissões de segurança.');
    }
  };

  const handleSaveBotNumero = async () => {
    if (!assinanteAuth) return;
    try {
      const { error } = await supabase.from('assinantes').update({ bot_numero_teste: formBotNumero }).eq('id', assinanteAuth.id);
      if (error) throw error;
      alert('Número do bot salvo com sucesso!');
      setAssinanteAuth(prev => ({ ...prev, bot_numero_teste: formBotNumero }));
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar o número do bot.');
    }
  };

  const handleSaveWhitelabel = async () => {
    if (!assinanteAuth) return;
    try {
      const formattedUrl = formWhitelabelUrl.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const updates = { 
        whitelabel_url: formattedUrl,
        whitelabel_color: formWhitelabelColor,
        whitelabel_logo: formWhitelabelLogo
      };
      
      if (formattedUrl) {
        const { data: existing } = await supabase.from('assinantes').select('id').eq('whitelabel_url', formattedUrl).neq('id', assinanteAuth.id).maybeSingle();
        if (existing) {
          alert('Esta URL já está em uso por outro lava-rápido. Escolha outra.');
          return;
        }
      }
      
      const { error } = await supabase.from('assinantes').update(updates).eq('id', assinanteAuth.id);
      if (error) throw error;
      alert('Configurações da Página de Agendamento salvas com sucesso!');
      setAssinanteAuth(prev => ({ ...prev, ...updates }));
      setFormWhitelabelUrl(formattedUrl);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações.');
    }
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const handleLogoUpload = async (e) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${assinanteAuth.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadingLogo(true);
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
      if (data) {
        setFormWhitelabelLogo(data.publicUrl);
        alert("Logomarca enviada com sucesso! Clique em 'Salvar Configurações' para confirmar.");
      }
    } catch (error) {
      alert('Erro ao enviar a imagem: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveOnboardingToken = async (e) => {
    e.preventDefault();
    if (!assinanteAuth || !onboardingToken.trim()) return;
    try {
      const { error } = await supabase.from('assinantes').update({ mp_access_token: onboardingToken.trim() }).eq('id', assinanteAuth.id);
      if (error) throw error;
      setAssinanteAuth(prev => ({ ...prev, mp_access_token: onboardingToken.trim() }));
      setFormMpToken(onboardingToken.trim());
      setShowOnboarding(false);
      alert('Tudo pronto! Você já pode começar a faturar com o LavaZap.');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar token.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // --- Função para Renderizar o Calendário Semanal ---
  const renderCalendarView = () => {
    // Definimos a semana atual começando pelo domingo mais próximo
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Volta para o domingo

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Horários (08:00 às 18:00)
    const hours = [];
    for (let h = 8; h <= 18; h++) {
      hours.push(h);
    }

    // Calcular top em porcentagem: (hora - 8) / 10h totais * 100%
    const getTopPercent = (dateStr) => {
      const d = new Date(dateStr);
      const startHour = 8;
      const totalMinutesInDay = 10 * 60; // 8h to 18h
      const eventMinutes = (d.getHours() - startHour) * 60 + d.getMinutes();
      return Math.max(0, Math.min(100, (eventMinutes / totalMinutesInDay) * 100));
    };

    // Calcular height em porcentagem com base na duração (serviço)
    const getHeightPercent = (duracao) => {
      const totalMinutesInDay = 10 * 60;
      return (duracao / totalMinutesInDay) * 100;
    };

    // Verifica se os eventos são do mesmo dia (ignorando horário)
    const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-header-cell" style={{ borderRight: '1px solid var(--border-color)' }}>GMT-03</div>
          {days.map((day, idx) => (
            <div key={idx} className="calendar-header-cell">
              <div style={{ fontSize: '11px', fontWeight: 400 }}>{dayNames[day.getDay()]}</div>
              <div style={{ fontSize: '20px', marginTop: '4px', color: day.toDateString() === today.toDateString() ? 'var(--accent-blue)' : 'inherit' }}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="calendar-body">
          <div className="calendar-grid">
            {/* Coluna de Horários */}
            <div className="calendar-time-col">
              {hours.map(h => (
                <div key={h} className="calendar-time-slot">
                  {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                </div>
              ))}
            </div>

            {/* Colunas dos Dias */}
            {days.map((day, idx) => (
              <div key={idx} className="calendar-day-col">
                {/* Linha do horário atual (simulação para as 10:45) */}
                {day.toDateString() === today.toDateString() && (
                  <div className="calendar-current-time" style={{ top: `${((10.75 - 8) / 10) * 100}%` }}></div>
                )}

                {/* Eventos Locais */}
                {listFiltrada
                  .filter(a => isSameDay(new Date(a.data_hora), day))
                  .map(a => {
                    const servico = servicos.find(s => s.id === a.servico_id);
                    const duracao = servico ? servico.duracao : 60;
                    return (
                      <div 
                        key={a.id} 
                        className="calendar-event"
                        style={{ 
                          top: `${getTopPercent(a.data_hora)}%`, 
                          height: `${getHeightPercent(duracao)}%`,
                          backgroundColor: a.status === 'ready' ? 'var(--status-ready)' : a.status === 'progress' ? 'var(--status-progress)' : 'var(--status-waiting)',
                          opacity: a.status === 'ready' ? 0.7 : 1
                        }}
                      >
                        <div className="calendar-event-title">{a.cliente_nome} - {a.placa}</div>
                        <div className="calendar-event-time">
                          {new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {servico?.nome || 'Serviço'}
                        </div>
                      </div>
                    )
                })}

                {/* Eventos do Google Calendar */}
                {gcalConnected && gcalEvents
                  .filter(ev => ev.start?.dateTime && isSameDay(new Date(ev.start.dateTime), day))
                  .map(ev => {
                    const start = new Date(ev.start.dateTime);
                    const end = new Date(ev.end.dateTime);
                    const duracao = (end - start) / 1000 / 60; // em minutos
                    return (
                      <div 
                        key={ev.id} 
                        className="calendar-event"
                        style={{ 
                          top: `${getTopPercent(ev.start.dateTime)}%`, 
                          height: `${getHeightPercent(duracao)}%`,
                          backgroundColor: '#4285F4', // Azul do Google Calendar
                          right: '8px', left: 'auto', width: '80%', // Offset para não sobrepor totalmente
                          opacity: 0.9,
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        <div className="calendar-event-title"><i className="fa-brands fa-google" style={{marginRight: '4px'}}></i> {ev.summary}</div>
                        <div className="calendar-event-time">
                          {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'visible' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="logo-section">
          {formWhitelabelLogo && assinanteAuth?.nome_plano !== 'start' ? (
            <img src={formWhitelabelLogo} alt="Logo da Empresa" style={{ maxHeight: '36px', borderRadius: '4px' }} />
          ) : (
            <>
              <div className="logo-icon"><i className="fa-solid fa-bolt"></i></div>
              <div className="logo-text">{assinanteAuth?.nome_empresa || 'LavaZap'}</div>
            </>
          )}
        </div>
        <nav className="sidebar-menu">
          <div className="menu-category">Menu</div>
          <div 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-chart-simple"></i></span>
            <span>Dashboard / Fluxo</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('clientes'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-users"></i></span>
            <span>Clientes</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => { setActiveTab('agenda'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-regular fa-calendar-days"></i></span>
            <span>Agenda</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('servicos'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-shower"></i></span>
            <span>Serviços</span>
          </div>
          <div className="menu-category">Estatísticas</div>
          <div 
            className={`menu-item ${activeTab === 'relatorios' ? 'active' : ''}`}
            onClick={() => { setActiveTab('relatorios'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-chart-pie"></i></span>
            <span>Relatórios</span>
          </div>
          <div className="menu-category">Administração</div>
          <div 
            className={`menu-item ${activeTab === 'financeiro' ? 'active' : ''}`}
            onClick={() => { setActiveTab('financeiro'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-sack-dollar"></i></span>
            <span>Financeiro</span>
          </div>
          <div 
            className={`menu-item ${activeTab === 'equipe' ? 'active' : ''}`}
            onClick={() => { setActiveTab('equipe'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-user-tag"></i></span>
            <span>Equipe</span>
          </div>

          <div 
            className={`menu-item ${activeTab === 'configuracoes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('configuracoes'); setIsMobileMenuOpen(false); }}
          >
            <span className="menu-icon"><i className="fa-solid fa-gear"></i></span>
            <span>Configurações</span>
          </div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <a 
              href="https://wa.me/5511913151641?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20o%20meu%20painel%20LavaZap." 
              target="_blank" 
              rel="noreferrer"
              className="menu-item" 
              style={{ textDecoration: 'none' }}
            >
              <span className="menu-icon"><i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i></span>
              <span>Suporte</span>
            </a>
            <div 
              className="menu-item"
              onClick={handleLogout}
              style={{ color: 'var(--status-cancelled)' }}
            >
              <span className="menu-icon"><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
              <span>Sair da Conta</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {assinanteAuth?.status_plano === 'atrasado' && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-cancelled)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', animation: 'fadeInUp 0.3s ease-out' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--status-cancelled)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 style={{ color: 'var(--status-cancelled)', fontSize: '16px', marginBottom: '4px' }}>Aviso Importante: Pagamento em Atraso</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                Tentamos processar a sua mensalidade, mas ocorreu uma falha no cartão. Por favor, <strong>verifique seu e-mail</strong> para acessar o link seguro do Stripe e atualizar sua forma de pagamento. Se não for regularizado, sua conta será suspensa.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            {/* Header */}
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Fluxo de Lavagens</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Acompanhe os veículos em tempo real e realize agendamentos integrados com CRM.</p>
              </div>
          <div className="header-actions">
            {/* Campo de Busca por Placa/Cliente */}
            <div className="search-container">
              <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Placa ou Nome do cliente..." 
                className="search-input"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>

            {/* Filtro de Período Comparativo */}
            <select 
              className="filter-dropdown"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
            >
              <option value="hoje">Hoje</option>
              <option value="este_mes">Este Mês vs Mês Passado</option>
              <option value="mes_passado">Apenas Mês Passado</option>
              <option value="todos">Todo o Histórico</option>
            </select>

            {/* Alternador de Tema */}
            <button className="btn-theme" onClick={toggleTheme} title="Alternar tema">
              {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
            </button>

            {/* CTA de Novo Agendamento */}
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <span>+ Novo Agendamento</span>
            </button>
          </div>
        </header>

        {/* Metrics Strip */}
        <section className="metrics-strip">
          <div className="metric-card spotlight-card">
            <div className="metric-header">
              <span className="metric-label">{metric1Label}</span>
              <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(0, 180, 216, 0.1)', color: 'var(--accent-cyan)' }}><i className="fa-solid fa-sack-dollar"></i></div>
            </div>
            <div className="metric-value">R$ {metric1Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="metric-footer">
              {filtroPeriodo === 'todos' ? (
                <span className="metric-footer-text">{metric1Footer}</span>
              ) : (
                <>
                  <span className={`variance-badge ${Number(variacaoFaturamento) >= 0 ? 'positive' : 'negative'}`}>
                    {Number(variacaoFaturamento) >= 0 ? '▲' : '▼'} {Math.abs(variacaoFaturamento)}%
                  </span>
                  <span className="metric-footer-text">{metric1Footer}</span>
                </>
              )}
            </div>
          </div>

          <div className="metric-card spotlight-card">
            <div className="metric-header">
              <span className="metric-label">{metric2Label}</span>
              <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)' }}><i className="fa-regular fa-calendar-check"></i></div>
            </div>
            <div className="metric-value">R$ {metric2Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="metric-footer">
              <span className="metric-footer-text">{metric2Footer}</span>
            </div>
          </div>

          <div className="metric-card spotlight-card">
            <div className="metric-header">
              <span className="metric-label">Ticket Médio</span>
              <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)', color: 'var(--status-ready)' }}><i className="fa-solid fa-chart-line"></i></div>
            </div>
            <div className="metric-value">R$ {parseFloat(ticketMedio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="metric-footer">
              <span className="metric-footer-text">Média por lavagem</span>
            </div>
          </div>

          <div className="metric-card spotlight-card">
            <div className="metric-header">
              <span className="metric-label">Agendamentos Totais</span>
              <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: 'var(--status-waiting)' }}><i className="fa-solid fa-car"></i></div>
            </div>
            <div className="metric-value text-mono">{agendamentos.length}</div>
            <div className="metric-footer">
              <span className="metric-footer-text">Histórico completo</span>
            </div>
          </div>

          {/* Card Gradiente de Destaque Financeiro do Filtro */}
          <div className="metric-card gradient-card">
            <div className="metric-header">
              <span className="metric-label">Faturamento Filtrado</span>
              <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}><i className="fa-solid fa-trophy"></i></div>
            </div>
            <div className="metric-value">R$ {faturamentoTotalFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="metric-footer">
              <span className="metric-footer-text">Período ativo no filtro</span>
            </div>
          </div>
        </section>

        {/* Kanban Board Section */}
        <section className="kanban-section">
          <div className="kanban-board">
            {/* Coluna: Aguardando */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title-group">
                  <div className="column-dot waiting"></div>
                  <span className="column-title">Fila de Lavagem</span>
                </div>
                <span className="column-badge">{listFiltrada.filter(a => a.status === 'waiting' && (pesquisa !== '' || filtroPeriodo !== 'hoje' || new Date(a.data_hora).toDateString() === new Date().toDateString())).length}</span>
              </div>
              <div className="cards-container">
                {listFiltrada.filter(a => a.status === 'waiting' && (pesquisa !== '' || filtroPeriodo !== 'hoje' || new Date(a.data_hora).toDateString() === new Date().toDateString())).map((a) => (
                  <div 
                    key={a.id} 
                    className={`kanban-card spotlight-card ${selectedCards.includes(a.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectCard(a.id)}
                    style={selectedCards.includes(a.id) ? { borderColor: 'var(--accent-cyan)', boxShadow: '0 0 10px rgba(0, 180, 216, 0.15)' } : {}}
                  >
                    <div className="card-header-row">
                      <span className="car-plate">{a.placa}</span>
                      <span className="time-badge"><i className="fa-regular fa-clock"></i> {new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="car-info">
                      <span className="client-name">{a.cliente_nome}</span>
                      <span className="car-model">{a.veiculo_modelo}</span>
                    </div>
                    <div className="service-row">
                      <span className="badge-service">{servicos.find(s => s.id === a.servico_id)?.nome || 'Serviço'}</span>
                    </div>
                    <div className="card-footer-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="card-price" style={{ marginRight: 'auto' }}>R$ {Number(a.valor_total).toFixed(2)}</span>
                      <button 
                        className="btn-card-action" 
                        style={a.pago ? { color: '#10B981', borderColor: 'rgba(16,185,129,0.3)', padding: '6px' } : { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', padding: '6px' }}
                        onClick={(e) => { e.stopPropagation(); handleTogglePayment(a); }}
                        title={a.pago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      >
                        {a.pago ? <><i className="fa-solid fa-check"></i> Pago</> : <><i className="fa-solid fa-hand-holding-dollar"></i> Pendente</>}
                      </button>
                      <button className="btn-card-action" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(a.id, 'progress'); }}>
                        <span>Iniciar <i className="fa-solid fa-arrow-right"></i></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna: Em Execução */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title-group">
                  <div className="column-dot progress"></div>
                  <span className="column-title">Em Progresso</span>
                </div>
                <span className="column-badge">{listFiltrada.filter(a => a.status === 'progress' && (pesquisa !== '' || filtroPeriodo !== 'hoje' || new Date(a.data_hora).toDateString() === new Date().toDateString())).length}</span>
              </div>
              <div className="cards-container">
                {listFiltrada.filter(a => a.status === 'progress' && (pesquisa !== '' || filtroPeriodo !== 'hoje' || new Date(a.data_hora).toDateString() === new Date().toDateString())).map((a) => (
                  <div 
                    key={a.id} 
                    className={`kanban-card spotlight-card ${selectedCards.includes(a.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectCard(a.id)}
                    style={selectedCards.includes(a.id) ? { borderColor: 'var(--accent-cyan)', boxShadow: '0 0 10px rgba(0, 180, 216, 0.15)' } : {}}
                  >
                    <div className="card-header-row">
                      <span className="car-plate">{a.placa}</span>
                      <span className="status-badge progress">
                        <span className="pulse-dot"></span>
                        <span>LAVANDO</span>
                      </span>
                    </div>
                    <div className="car-info">
                      <span className="client-name">{a.cliente_nome}</span>
                      <span className="car-model">{a.veiculo_modelo}</span>
                    </div>
                    <div className="service-row">
                      <span className="badge-service">{servicos.find(s => s.id === a.servico_id)?.nome || 'Serviço'}</span>
                    </div>
                    <div className="card-footer-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="card-price" style={{ marginRight: 'auto' }}>R$ {Number(a.valor_total).toFixed(2)}</span>
                      <button 
                        className="btn-card-action" 
                        style={a.pago ? { color: '#10B981', borderColor: 'rgba(16,185,129,0.3)', padding: '6px' } : { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', padding: '6px' }}
                        onClick={(e) => { e.stopPropagation(); handleTogglePayment(a); }}
                        title={a.pago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      >
                        {a.pago ? <><i className="fa-solid fa-check"></i> Pago</> : <><i className="fa-solid fa-hand-holding-dollar"></i> Pendente</>}
                      </button>
                      <button className="btn-card-action" style={{ color: 'var(--status-ready)' }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(a.id, 'ready'); }}>
                        <span>Finalizar <i className="fa-solid fa-check"></i></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna: Pronto para Retirada */}
            <div className="kanban-column">
              <div className="column-header">
                <div className="column-title-group">
                  <div className="column-dot ready"></div>
                  <span className="column-title">Pronto</span>
                </div>
                <span className="column-badge">{listFiltrada.filter(a => a.status === 'ready' && (pesquisa !== '' || filtroPeriodo !== 'hoje' || new Date(a.data_hora).toDateString() === new Date().toDateString())).length}</span>
              </div>
              <div className="cards-container">
                {listFiltrada.filter(a => a.status === 'ready' && (pesquisa !== '' || filtroPeriodo !== 'hoje' || new Date(a.data_hora).toDateString() === new Date().toDateString())).map((a) => (
                  <div 
                    key={a.id} 
                    className={`kanban-card spotlight-card ${selectedCards.includes(a.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectCard(a.id)}
                    style={selectedCards.includes(a.id) ? { borderColor: 'var(--accent-cyan)', boxShadow: '0 0 10px rgba(0, 180, 216, 0.15)' } : {}}
                  >
                    <div className="card-header-row">
                      <span className="car-plate">{a.placa}</span>
                      <span className="status-badge ready">
                        <span className="pulse-dot"></span>
                        <span>PRONTO</span>
                      </span>
                    </div>
                    <div className="car-info">
                      <span className="client-name">{a.cliente_nome}</span>
                      <span className="car-model">{a.veiculo_modelo}</span>
                    </div>
                    <div className="service-row">
                      <span className="badge-service">{servicos.find(s => s.id === a.servico_id)?.nome || 'Serviço'}</span>
                    </div>
                    <div className="card-footer-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="card-price" style={{ marginRight: 'auto' }}>R$ {Number(a.valor_total).toFixed(2)}</span>
                      <button 
                        className="btn-card-action" 
                        style={a.pago ? { color: '#10B981', borderColor: 'rgba(16,185,129,0.3)', padding: '6px' } : { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)', padding: '6px' }}
                        onClick={(e) => { e.stopPropagation(); handleTogglePayment(a); }}
                        title={a.pago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                      >
                        {a.pago ? <><i className="fa-solid fa-check"></i> Pago</> : <><i className="fa-solid fa-hand-holding-dollar"></i> Pendente</>}
                      </button>
                      <button className="btn-card-action" onClick={(e) => { e.stopPropagation(); handleSendWhatsAppNotification(a); }}>
                        <span>WhatsApp <i className="fa-brands fa-whatsapp"></i></span>
                      </button>
                      <button className="btn-card-action" style={{ color: 'var(--status-progress)' }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(a.id, 'delivered'); }}>
                        <span>Entregue <i className="fa-solid fa-car-side"></i></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
          </>
        )}

        {activeTab === 'agenda' && (
          <div className="tab-content">
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Agenda</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Histórico completo e próximos agendamentos.</p>
              </div>
              <div className="header-actions">
                {gcalConnected && (
                  <button className="btn-secondary" onClick={fetchGcalEvents} style={{ gap: '8px' }}>
                    <i className="fa-solid fa-arrows-rotate"></i> Sincronizar
                  </button>
                )}
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  <span>+ Novo Agendamento</span>
                </button>
              </div>
            </header>

            {/* Google Calendar Sync Message */}
            {gcalSyncMsg && (
              <div style={{ padding: '12px 16px', backgroundColor: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: '10px', marginTop: '12px', color: 'var(--accent-cyan)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-check"></i> {gcalSyncMsg}
              </div>
            )}

            {/* Alternador de Visão e Agendamentos */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>
                  <i className="fa-regular fa-calendar-days" style={{ marginRight: '8px', color: 'var(--accent-cyan)' }}></i>
                  Agendamentos no Sistema ({listFiltrada.length})
                </h2>
                
                {/* View Mode Toggle */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                  <button 
                    style={{ 
                      padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
                      backgroundColor: agendaViewMode === 'table' ? 'var(--accent-cyan)' : 'transparent',
                      color: agendaViewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                      transition: '0.2s'
                    }}
                    onClick={() => setAgendaViewMode('table')}
                  >
                    <i className="fa-solid fa-list"></i> Tabela
                  </button>
                  <button 
                    style={{ 
                      padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
                      backgroundColor: agendaViewMode === 'calendar' ? 'var(--accent-blue)' : 'transparent',
                      color: agendaViewMode === 'calendar' ? '#fff' : 'var(--text-secondary)',
                      transition: '0.2s'
                    }}
                    onClick={() => setAgendaViewMode('calendar')}
                  >
                    <i className="fa-solid fa-calendar-week"></i> Calendário
                  </button>
                </div>
              </div>

              {agendaViewMode === 'calendar' ? (
                renderCalendarView()
              ) : (
                listFiltrada.length === 0 ? (
                  <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>
                    <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '12px' }}></i>
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhum agendamento encontrado.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Data e Hora</th>
                          <th>Cliente</th>
                          <th>Veículo</th>
                          <th>Placa</th>
                          <th>Serviço</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listFiltrada.sort((a,b) => new Date(b.data_hora) - new Date(a.data_hora)).map(a => (
                          <tr key={a.id}>
                            <td className="text-mono" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {new Date(a.data_hora).toLocaleDateString('pt-BR')} <span style={{ marginLeft: '6px' }}>{new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{a.cliente_nome}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{a.veiculo_modelo}</td>
                            <td><span className="car-plate" style={{ fontSize: '11px', padding: '4px 8px' }}>{a.placa}</span></td>
                            <td>{servicos.find(s => s.id === a.servico_id)?.nome || 'Serviço'}</td>
                            <td className="text-mono" style={{ fontWeight: 700 }}>R$ {a.valor_total.toFixed(2)}</td>
                            <td>
                              <span className={`status-badge ${a.status}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                <span className="pulse-dot"></span>
                                {a.status === 'waiting' ? 'Aguardando' : a.status === 'progress' ? 'Lavando' : 'Pronto'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>

            {/* Google Calendar Events */}
            {gcalConnected && gcalEvents.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h2 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  <i className="fa-brands fa-google" style={{ marginRight: '8px', color: '#4285F4' }}></i>
                  Próximos Eventos no Google Agenda ({gcalEvents.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {gcalEvents.map(evt => (
                    <div key={evt.id} className="spotlight-card" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '4px', height: '36px', borderRadius: '2px', backgroundColor: '#4285F4' }}></div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{evt.summary}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{evt.location || ''}</div>
                        </div>
                      </div>
                      <span className="text-mono" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleDateString('pt-BR') + ' ' + new Date(evt.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : evt.start?.date || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="tab-content">
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Clientes</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Histórico e CRM dos clientes registrados.</p>
              </div>
              <div className="header-actions">
                <div className="search-container">
                  <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Buscar cliente (nome, celular, placa)..." 
                    className="search-input"
                    value={pesquisaCliente}
                    onChange={(e) => setPesquisaCliente(e.target.value)}
                  />
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  <span>+ Novo Cliente (Agendar)</span>
                </button>
              </div>
            </header>
            
            {clientes.length === 0 ? (
              <div className="card-placeholder" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '20px', textAlign: 'center' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '15px' }}></i>
                <p>Nenhum cliente cadastrado no momento.</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Os clientes aparecerão aqui automaticamente após o primeiro agendamento.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', marginTop: '20px' }}>
                {clientes.filter(c => 
                  (c.nome || '').toLowerCase().includes((pesquisaCliente || '').toLowerCase()) || 
                  (c.celular || '').includes(pesquisaCliente || '') || 
                  ((c.placa || '').toLowerCase().includes((pesquisaCliente || '').toLowerCase())) ||
                  ((c.veiculo || '').toLowerCase().includes((pesquisaCliente || '').toLowerCase()))
                ).map(c => (
                  <div key={c.id} className="spotlight-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {editingCliente === c.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" value={editCliNome} onChange={(e) => setEditCliNome(e.target.value)} className="form-input" placeholder="Nome do Cliente" style={{ width: '100%' }} />
                        <input type="text" value={editCliCelular} onChange={(e) => setEditCliCelular(e.target.value)} className="form-input text-mono" placeholder="WhatsApp (somente números)" style={{ width: '100%' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" value={editCliVeiculo} onChange={(e) => setEditCliVeiculo(e.target.value)} className="form-input" placeholder="Veículo" style={{ flex: 1 }} />
                          <input type="text" value={editCliPlaca} onChange={(e) => setEditCliPlaca(e.target.value)} className="form-input text-mono" placeholder="Placa" style={{ width: '100px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button className="btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => setEditingCliente(null)}>Cancelar</button>
                          <button className="btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => handleSaveEditCliente(c.id)}>Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{c.nome}</h3>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-icon" onClick={() => startEditingCliente(c)} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}><i className="fa-solid fa-pen-to-square"></i></button>
                            <button className="btn-icon" onClick={() => handleDeleteCliente(c.id)} style={{ color: 'var(--status-cancelled)', background: 'transparent', border: 'none', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-brands fa-whatsapp" style={{ color: 'var(--accent-cyan)', width: '16px', textAlign: 'center' }}></i>
                            <span className="text-mono">{(c.celular || '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-car" style={{ color: 'var(--accent-cyan)', width: '16px', textAlign: 'center' }}></i>
                            <span>{c.veiculo || 'N/A'} - <strong className="text-mono" style={{ color: 'var(--text-primary)' }}>{c.placa || 'N/A'}</strong></span>
                          </div>
                        </div>

                        <button className="btn-primary" style={{ width: '100%', padding: '8px', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleAgendarPeloCliente(c)}>
                          <i className="fa-regular fa-calendar-plus"></i>
                          <span>Agendar Lavagem</span>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'servicos' && (
          <div className="tab-content">
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Serviços</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Catálogo de serviços oferecidos.</p>
              </div>
              <div className="header-actions">
                <button className="btn-primary" onClick={handleAddServico}>
                  <span>+ Novo Serviço</span>
                </button>
              </div>
            </header>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', marginTop: '20px' }}>
              {servicos.map(s => (
                <div key={s.id} className="spotlight-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  {editingServico === s.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input 
                        type="text" 
                        value={editNome} 
                        onChange={(e) => setEditNome(e.target.value)} 
                        className="form-input" 
                        placeholder="Nome do Serviço"
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                          <span style={{ position: 'absolute', left: '14px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>R$</span>
                          <input 
                            type="number" 
                            value={editPreco} 
                            onChange={(e) => setEditPreco(e.target.value)} 
                            className="form-input" 
                            style={{ width: '100%', paddingLeft: '40px' }}
                            placeholder="Preço"
                          />
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                          <span style={{ position: 'absolute', right: '14px', color: 'var(--text-secondary)', fontSize: '12px' }}>min</span>
                          <input 
                            type="number" 
                            value={editDuracao} 
                            onChange={(e) => setEditDuracao(e.target.value)} 
                            className="form-input" 
                            style={{ width: '100%', paddingRight: '40px' }}
                            placeholder="Duração"
                          />
                        </div>
                      </div>
                      <textarea 
                        value={editChecklist} 
                        onChange={(e) => setEditChecklist(e.target.value)} 
                        className="form-input" 
                        style={{ width: '100%', marginTop: '10px', height: '80px', resize: 'vertical' }}
                        placeholder="Checklist (um item por linha)"
                      />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditingServico(null)}>Cancelar</button>
                        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleSaveEditServico(s.id)}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>{s.nome}</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="btn-card-action" style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '14px' }} onClick={() => { setEditingServico(s.id); setEditPreco(s.preco); setEditNome(s.nome); setEditDuracao(s.duracao); setEditChecklist(s.checklist || ''); }}>
                            <i className="fa-solid fa-pen"></i> Editar
                          </button>
                          <button className="btn-card-action" style={{ background: 'transparent', border: 'none', color: 'var(--status-cancelled)', cursor: 'pointer', fontSize: '14px' }} title="Remover Serviço" onClick={() => handleRemoveServico(s.id)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', alignItems: 'center' }}>
                        <span>Duração: {s.duracao} min</span>
                        <strong style={{ color: 'var(--accent-cyan)' }}>R$ {Number(s.preco).toFixed(2)}</strong>
                      </div>
                      {s.checklist && (
                        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                          <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>Checklist do Serviço:</strong>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {s.checklist.split('\n').filter(Boolean).map((item, idx) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa-solid fa-check" style={{ color: 'var(--accent-cyan)' }}></i> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="tab-content">
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Financeiro</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gestão de receitas, despesas e lucro líquido.</p>
              </div>
            </header>
            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '20px' }}>
              <h2 style={{ marginBottom: '20px' }}>Resumo do Mês Atual</h2>
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Faturamento Bruto</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--status-progress)' }}>R$ {faturamentoEsteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Despesas</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--status-cancelled)' }}>R$ {despesasEsteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Lucro Líquido</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: lucroLiquidoEsteMes >= 0 ? 'var(--status-ready)' : 'var(--status-cancelled)' }}>
                    R$ {lucroLiquidoEsteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              {/* Formulário de Despesas */}
              <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '12px' }}>
                <h3>Lançar Nova Despesa</h3>
                <form onSubmit={handleSaveDespesa} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Descrição da Despesa</label>
                    <input className="form-input" placeholder="Ex: Conta de Luz" value={formDespesaDesc} onChange={e => setFormDespesaDesc(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valor (R$)</label>
                    <input className="form-input" type="number" step="0.01" placeholder="Ex: 150.00" value={formDespesaValor} onChange={e => setFormDespesaValor(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data</label>
                    <input className="form-input" type="date" value={formDespesaData} onChange={e => setFormDespesaData(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoria</label>
                    <select className="form-input" value={formDespesaCat} onChange={e => setFormDespesaCat(e.target.value)}>
                      <option value="Geral">Geral</option>
                      <option value="Produtos">Produtos/Insumos</option>
                      <option value="Contas">Contas (Água, Luz)</option>
                      <option value="Pessoal">Pessoal/Salários</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Adicionar Despesa</button>
                </form>
              </div>

              {/* Lista de Despesas */}
              <div style={{ flex: 2, backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '12px' }}>
                <h3>Histórico de Despesas</h3>
                <table className="data-table" style={{ width: '100%', marginTop: '15px' }}>
                  <thead>
                    <tr>
                      <th>DATA</th>
                      <th>DESCRIÇÃO</th>
                      <th>CATEGORIA</th>
                      <th>VALOR</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.length === 0 ? <tr><td colSpan="5">Nenhuma despesa registrada.</td></tr> : despesas.sort((a,b) => new Date(b.data) - new Date(a.data)).map(d => (
                      <tr key={d.id}>
                        <td>{new Date(d.data).toLocaleDateString('pt-BR')}</td>
                        <td>{d.descricao}</td>
                        <td>{d.categoria}</td>
                        <td style={{ color: 'var(--status-cancelled)' }}>R$ {Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td><button className="btn-secondary" onClick={() => handleRemoveDespesa(d.id)}><i className="fa-solid fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'equipe' && (
          <div className="tab-content">
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Equipe e Comissões</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Gerencie seus funcionários e pagamentos.</p>
              </div>
            </header>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              {/* Formulário de Funcionários */}
              <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '12px' }}>
                <h3>Novo Funcionário</h3>
                <form onSubmit={handleSaveFuncionario} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input className="form-input" placeholder="Ex: João da Silva" value={formFuncNome} onChange={e => setFormFuncNome(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cargo</label>
                    <input className="form-input" placeholder="Ex: Lavador" value={formFuncCargo} onChange={e => setFormFuncCargo(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comissão Padrão (%)</label>
                    <input className="form-input" type="number" placeholder="Ex: 30" value={formFuncComissao} onChange={e => setFormFuncComissao(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone (WhatsApp)</label>
                    <input className="form-input" placeholder="(11) 99999-9999" value={formFuncTelefone} onChange={e => setFormFuncTelefone(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Cadastrar Funcionário</button>
                </form>
              </div>

              {/* Lista de Funcionários e Comissões */}
              <div style={{ flex: 2, backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '12px' }}>
                <h3>Membros da Equipe</h3>
                <table className="data-table" style={{ width: '100%', marginTop: '15px' }}>
                  <thead>
                    <tr>
                      <th>NOME</th>
                      <th>CARGO</th>
                      <th>COMISSÃO (%)</th>
                      <th>COMISSÃO GERADA (ESTE MÊS)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionarios.length === 0 ? <tr><td colSpan="5">Nenhum funcionário cadastrado.</td></tr> : funcionarios.map(f => {
                      // Calcular comissões ganhas neste mês
                      const comissaoGanha = agendamentos
                        .filter(a => a.funcionario_id === f.id && a.pago && new Date(a.data_hora).getMonth() === currMonth && new Date(a.data_hora).getFullYear() === currYear)
                        .reduce((acc, a) => acc + (Number(a.valor_total) * (Number(f.comissao_percentual) / 100)), 0);
                      
                      return (
                        <tr key={f.id}>
                          <td><strong>{f.nome}</strong><br/><span style={{fontSize:'12px', color:'var(--text-secondary)'}}>{f.telefone}</span></td>
                          <td>{f.cargo}</td>
                          <td>{f.comissao_percentual}%</td>
                          <td style={{ color: 'var(--status-ready)' }}>R$ {comissaoGanha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td><button className="btn-secondary" onClick={() => handleRemoveFuncionario(f.id)}><i className="fa-solid fa-trash"></i></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'relatorios' && (() => {
          // Relatório: Desempenho por Serviço
          const servicosReport = servicos.map(s => {
            const agends = agendamentos.filter(a => a.servico_id === s.id && a.pago);
            return {
              id: s.id,
              nome: s.nome,
              qtd: agends.length,
              faturamento: agends.reduce((acc, a) => acc + Number(a.valor_total), 0)
            };
          }).sort((a, b) => b.faturamento - a.faturamento);

          // Relatório: Top Clientes
          const clientesMap = {};
          agendamentos.filter(a => a.pago).forEach(a => {
            if (!clientesMap[a.cliente_nome]) {
              clientesMap[a.cliente_nome] = { qtd: 0, faturamento: 0 };
            }
            clientesMap[a.cliente_nome].qtd += 1;
            clientesMap[a.cliente_nome].faturamento += Number(a.valor_total);
          });
          const topClientes = Object.entries(clientesMap)
            .map(([nome, data]) => ({ nome, ...data }))
            .sort((a, b) => b.faturamento - a.faturamento)
            .slice(0, 5);

          // Relatório: Taxa de Conclusão
          const totalAgendamentos = agendamentos.length;
          const totalConcluidos = agendamentos.filter(a => a.pago).length;
          const taxaConclusao = totalAgendamentos === 0 ? 0 : ((totalConcluidos / totalAgendamentos) * 100).toFixed(1);

          return (
            <div className="tab-content">
              <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
                <div>
                  <h1 className="title-lg">Relatórios</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Métricas e análise de desempenho da estética automotiva.</p>
                </div>
              </header>

              {/* Métricas Globais */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="spotlight-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total de Agendamentos</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalAgendamentos}</p>
                </div>
                <div className="spotlight-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Lavagens Pagas</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--status-ready)' }}>{totalConcluidos}</p>
                </div>
                <div className="spotlight-card" style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Taxa de Conclusão</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{taxaConclusao}%</p>
                </div>
              </div>

              {/* Tabelas de Relatório */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                {/* Desempenho por Serviço */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '16px', margin: 0, color: 'var(--text-primary)' }}>Desempenho por Serviço</h2>
                  </div>
                  <table className="data-table" style={{ margin: 0, width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Serviço</th>
                        <th>Lavagens</th>
                        <th>Faturamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicosReport.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sem dados</td></tr>
                      ) : (
                        servicosReport.map(s => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.nome}</td>
                            <td>{s.qtd}</td>
                            <td className="text-mono" style={{ color: 'var(--status-ready)' }}>R$ {s.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Top Clientes */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '16px', margin: 0, color: 'var(--text-primary)' }}>Top 5 Clientes Fiéis</h2>
                    <i className="fa-solid fa-crown" style={{ color: '#F59E0B' }}></i>
                  </div>
                  <table className="data-table" style={{ margin: 0, width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Visitas</th>
                        <th>Gasto Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientes.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sem dados</td></tr>
                      ) : (
                        topClientes.map((c, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {i === 0 && <span style={{ color: '#F59E0B' }}>🥇</span>}
                              {i === 1 && <span style={{ color: '#9CA3AF' }}>🥈</span>}
                              {i === 2 && <span style={{ color: '#D97706' }}>🥉</span>}
                              {i > 2 && <span style={{ width: '16px', display: 'inline-block', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>{i + 1}</span>}
                              {c.nome}
                            </td>
                            <td>{c.qtd}</td>
                            <td className="text-mono" style={{ color: 'var(--accent-cyan)' }}>R$ {c.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'configuracoes' && (
          <div className="tab-content">
            <header className="header">
              <button className="btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)}><i className="fa-solid fa-bars"></i></button>
              <div>
                <h1 className="title-lg">Configurações</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ajustes do sistema e perfil da loja.</p>
              </div>
              <div className="header-actions">
                <button className="btn-theme" onClick={toggleTheme} title="Alternar tema">
                  {theme === 'dark' ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                </button>
              </div>
            </header>

            {/* Tema */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-palette" style={{ color: 'var(--accent-cyan)' }}></i> Aparência
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tema atual: <strong style={{ color: 'var(--text-primary)' }}>{theme === 'dark' ? 'Escuro' : 'Claro'}</strong></span>
                <button className="btn-secondary" onClick={toggleTheme} style={{ gap: '8px' }}>
                  {theme === 'dark' ? <><i className="fa-solid fa-sun"></i> Mudar para Claro</> : <><i className="fa-solid fa-moon"></i> Mudar para Escuro</>}
                </button>
              </div>
            </div>

            {/* Mercado Pago */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-money-bill-transfer" style={{ color: '#009ee3' }}></i> Integração Mercado Pago
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Conecte sua conta do Mercado Pago para receber pagamentos diretamente na sua conta bancária. 
                  Gere um <strong>Access Token</strong> (Token de Acesso de Produção) no painel de desenvolvedor do Mercado Pago e cole abaixo.{' '}
                  <a href="https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                    <i className="fa-solid fa-circle-question"></i> Como gerar minha chave?
                  </a>
                </p>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Access Token de Produção</label>
                    <input 
                      type="password" 
                      className="form-input text-mono" 
                      placeholder="APP_USR-..." 
                      value={formMpToken} 
                      onChange={e => setFormMpToken(e.target.value)} 
                    />
                  </div>
                  <button className="btn-primary" onClick={handleSaveMpToken} style={{ whiteSpace: 'nowrap' }}>
                    <i className="fa-solid fa-floppy-disk"></i> Salvar Token
                  </button>
                </div>
                {assinanteAuth?.mp_access_token && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-ready)', fontSize: '14px', marginTop: '10px' }}>
                    <i className="fa-solid fa-circle-check"></i> <span>Conta conectada. Pagamentos habilitados.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Google Calendar */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i> Integração Google Agenda
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--status-ready)' }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Status: <strong style={{ color: 'var(--status-ready)' }}>Conectado</strong>
                  </span>
                </div>
              </div>

              {gcalSyncMsg && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.15)', borderRadius: '8px', color: 'var(--accent-cyan)', fontSize: '13px' }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i> {gcalSyncMsg}
                </div>
              )}
            </div>

            {/* Whitelabel / Página de Agendamento */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-store" style={{ color: 'var(--status-ready)' }}></i> Página de Agendamento (Whitelabel)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Configure a sua página pública onde os clientes poderão realizar agendamentos. 
                  Nos planos Profissional e VIP você pode alterar a cor de fundo e inserir sua logomarca.
                </p>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">URL Personalizada</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{window.location.origin}/</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="seu-lava-rapido" 
                      value={formWhitelabelUrl} 
                      onChange={e => setFormWhitelabelUrl(e.target.value)} 
                      style={{ flex: 1 }}
                    />
                  </div>
                  {assinanteAuth?.whitelabel_url && (
                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      <a href={`/${assinanteAuth.whitelabel_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>
                        <i className="fa-solid fa-external-link-alt"></i> Acessar minha página
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                    <label className="form-label">Cor Principal (Fundo)</label>
                    <input 
                      type="color" 
                      className="form-input" 
                      value={formWhitelabelColor} 
                      onChange={e => setFormWhitelabelColor(e.target.value)} 
                      disabled={assinanteAuth?.nome_plano === 'start'}
                      style={{ height: '40px', padding: '2px', cursor: assinanteAuth?.nome_plano === 'start' ? 'not-allowed' : 'pointer' }}
                    />
                    {assinanteAuth?.nome_plano === 'start' && <span style={{ fontSize: '11px', color: 'var(--status-cancelled)' }}>Exclusivo Profissional/VIP</span>}
                  </div>
                  <div className="form-group" style={{ flex: 2, minWidth: '250px' }}>
                    <label className="form-label">Logomarca (Imagem)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="https://..." 
                        value={formWhitelabelLogo} 
                        onChange={e => setFormWhitelabelLogo(e.target.value)} 
                        disabled={assinanteAuth?.nome_plano === 'start'}
                        style={{ flex: 1, marginBottom: 0 }}
                      />
                      <label className={`btn-secondary ${assinanteAuth?.nome_plano === 'start' ? 'disabled' : ''}`} style={{ cursor: 'pointer', margin: 0, padding: '10px 15px', whiteSpace: 'nowrap' }}>
                        {uploadingLogo ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-upload"></i>} Subir Arquivo
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/webp" 
                          style={{ display: 'none' }} 
                          onChange={handleLogoUpload}
                          disabled={assinanteAuth?.nome_plano === 'start' || uploadingLogo}
                        />
                      </label>
                    </div>
                    {assinanteAuth?.nome_plano === 'start' && <span style={{ fontSize: '11px', color: 'var(--status-cancelled)' }}>Exclusivo Profissional/VIP</span>}
                    {formWhitelabelLogo && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={formWhitelabelLogo} alt="Logo Preview" style={{ maxHeight: '60px', borderRadius: '4px' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                  <button className="btn-primary" onClick={handleSaveWhitelabel}>
                    <i className="fa-solid fa-floppy-disk"></i> Salvar Configurações da Loja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>

      {/* Floating Action Overlay for Bulk Selection */}
      {selectedCards.length > 0 && (
        <div className="bulk-actions-overlay">
          <div className="bulk-info">
            <span className="bulk-count">{selectedCards.length}</span>
            <span className="bulk-title">veículos selecionados na fila</span>
          </div>
          <div className="bulk-buttons">
            <button className="btn-bulk outline" onClick={() => handleBulkStatusChange('waiting')}>Mover para Aguardando</button>
            <button className="btn-bulk outline" onClick={() => handleBulkStatusChange('progress')}>Mover para Lavando</button>
            <button className="btn-bulk accent" onClick={() => handleBulkStatusChange('ready')}>Mover para Pronto</button>
            <button className="btn-bulk outline" style={{ color: 'var(--status-cancelled)', borderColor: 'rgba(251,113,133,0.2)' }} onClick={handleBulkDelete}>Deletar</button>
            <button className="btn-bulk outline" style={{ borderColor: 'var(--border-color)' }} onClick={() => setSelectedCards([])}>Cancelar</button>
          </div>
        </div>
      )}

      {/* CRM Booking Modal (Novo Agendamento) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="title-md">Agendar Novo Serviço</h2>
              <button className="modal-close" onClick={() => { setIsModalOpen(false); setCrmStatus(null); }}>&times;</button>
            </div>
            <form onSubmit={handleSaveAgendamento}>
              <div className="modal-body">
                {/* Busca Integrada do CRM por Celular */}
                <div className="crm-search-box">
                  <div className="form-group">
                    <label className="form-label">WhatsApp/Celular do Cliente *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 11999991111" 
                      className="form-input text-mono"
                      value={formCelular}
                      onChange={(e) => setFormCelular(e.target.value)}
                      required
                    />
                  </div>

                  {crmStatus === 'found' && (
                    <div className="crm-status-indicator found">
                      <span>✓ Cliente Recorrente Encontrado no CRM! Cadastro carregado.</span>
                    </div>
                  )}

                  {crmStatus === 'not-found' && (
                    <div className="crm-status-indicator not-found">
                      <span>✦ Novo Cliente! Digite os dados abaixo para cadastrá-lo.</span>
                    </div>
                  )}
                </div>

                {/* Dados Cadastrais */}
                <div className="form-group">
                  <label className="form-label">Nome do Cliente *</label>
                  <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    className="form-input"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Modelo do Veículo *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Civic 2022" 
                      className="form-input"
                      value={formVeiculo}
                      onChange={(e) => setFormVeiculo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Placa do Carro *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: ABC1D23" 
                      className="form-input text-mono"
                      value={formPlaca}
                      onChange={(e) => setFormPlaca(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Dados de Agendamento */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Serviço Pretendido</label>
                    <select 
                      className="filter-dropdown" 
                      style={{ height: '40px' }}
                      value={formServico}
                      onChange={(e) => setFormServico(e.target.value)}
                    >
                      {servicos.map(s => (
                        <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Data e Hora</label>
                    <input type="datetime-local" className="form-input" value={formHorario} onChange={(e) => setFormHorario(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Funcionário Responsável (Lavador)</label>
                  <select className="form-input" value={formAgendFuncionario} onChange={(e) => setFormAgendFuncionario(e.target.value)}>
                    <option value="">Não atribuído</option>
                    {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.comissao_percentual}%)</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setIsModalOpen(false); setCrmStatus(null); }}>Cancelar</button>
                <button type="submit" className="btn-primary">Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px', borderRadius: '16px', textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(0,158,227,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <i className="fa-solid fa-money-bill-transfer" style={{ color: '#009ee3', fontSize: '24px' }}></i>
            </div>
            <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '24px', fontWeight: '700' }}>Bem-vindo ao LavaZap! 🚀</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', fontSize: '15px' }}>
              Antes de cadastrar seu primeiro cliente e começar a lotar sua agenda, precisamos configurar sua conta para <strong>receber pagamentos via PIX e Cartão</strong>.
            </p>
            <div style={{ backgroundColor: 'rgba(0,158,227,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,158,227,0.2)', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ color: '#009ee3', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Integração Mercado Pago
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                Para garantir que o dinheiro dos serviços caia diretamente na sua conta bancária, cole seu <strong>Access Token de Produção</strong> abaixo.
              </p>
              <a href="https://www.mercadopago.com.br/developers/panel/credentials" target="_blank" rel="noopener" style={{ color: '#009ee3', fontSize: '14px', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Clique aqui para gerar o seu token <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
            
            <form onSubmit={handleSaveOnboardingToken} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>Token de Acesso (Access Token)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={onboardingToken} 
                  onChange={(e) => setOnboardingToken(e.target.value)} 
                  placeholder="Ex: APP_USR-..." 
                  required 
                  style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Salvar e Começar <i className="fa-solid fa-rocket"></i>
                </button>
                <button type="button" className="btn-secondary" onClick={handleLogout} style={{ padding: '16px', fontWeight: 'bold', color: 'var(--status-cancelled)', borderColor: 'var(--status-cancelled)' }} title="Sair da conta">
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Sair
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showSubscriptionBlock && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.98)',
          zIndex: 99999, /* Acima do onboarding se ambos estiverem true */
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '800px', padding: '40px', borderRadius: '16px', textAlign: 'center', animation: 'fadeInUp 0.5s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <i className="fa-solid fa-lock" style={{ color: 'var(--status-cancelled)', fontSize: '24px' }}></i>
            </div>
            <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '24px', fontWeight: '700' }}>Assinatura Necessária 🛑</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', fontSize: '15px' }}>
              {subscriptionMessage} Escolha um plano abaixo para liberar o sistema. O Plano Start possui <strong>7 dias grátis de teste</strong>.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px', textAlign: 'left' }}>
              {/* Start Plan */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Plano Start</h3>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>R$ 97<span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mês</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Página Pública Padrão</li>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Painel de Gestão / Agenda</li>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Até 150 agendamentos/mês</li>
                </ul>
                <a href={`${STRIPE_LINK_START}?prefilled_email=${encodeURIComponent(assinanteAuth?.email || '')}&client_reference_id=${assinanteAuth?.id}`} className="btn-secondary" style={{ display: 'block', textAlign: 'center', padding: '10px', textDecoration: 'none', width: '100%', fontSize: '13px', fontWeight: 'bold' }}>
                  Assinar Start (7 Dias Grátis)
                </a>
              </div>
              
              {/* Profissional Plan */}
              <div style={{ backgroundColor: 'rgba(0,180,216,0.05)', border: '1px solid var(--accent-cyan)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '16px', backgroundColor: 'var(--accent-cyan)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>Mais Escolhido</div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--accent-cyan)' }}>Profissional</h3>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>R$ 197<span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mês</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Whitelabel (Cores e Logo)</li>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Google Calendar Sync</li>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Até 500 agendamentos/mês</li>
                </ul>
                <a href={`${STRIPE_LINK_PREMIUM}?prefilled_email=${encodeURIComponent(assinanteAuth?.email || '')}&client_reference_id=${assinanteAuth?.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px', textDecoration: 'none', width: '100%', fontSize: '13px', fontWeight: 'bold' }}>
                  Assinar Profissional
                </a>
              </div>

              {/* VIP Plan */}
              <div style={{ backgroundColor: 'rgba(230,57,70,0.05)', border: '1px solid #E63946', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '16px', backgroundColor: '#E63946', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>Exclusivo</div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#E63946' }}>IA VIP</h3>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>R$ 297<span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/mês</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-secondary)', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Assistente IA de Agendamento</li>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Agendamentos Ilimitados</li>
                  <li><i className="fa-solid fa-check text-cyan" style={{ marginRight: '8px' }}></i>Suporte Prioritário VIP</li>
                </ul>
                <a href={`${STRIPE_LINK_VIP}?prefilled_email=${encodeURIComponent(assinanteAuth?.email || '')}&client_reference_id=${assinanteAuth?.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px', textDecoration: 'none', width: '100%', fontSize: '13px', fontWeight: 'bold', backgroundColor: '#E63946', borderColor: '#E63946' }}>
                  Assinar IA VIP
                </a>
              </div>
            </div>
            
            <button type="button" className="btn-secondary" onClick={handleLogout} style={{ fontWeight: 'bold', color: 'var(--text-secondary)', borderColor: 'transparent', backgroundColor: 'transparent' }} title="Sair da conta">
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sair da Conta
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Painel


