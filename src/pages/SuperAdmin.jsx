import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
  const [assinantes, setAssinantes] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssinantes();
  }, []);

  async function fetchAssinantes() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }

      const { data, error } = await supabase
        .from('assinantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssinantes(data || []);
    } catch (err) {
      console.error('Erro ao buscar assinantes:', err);
      alert('Erro ao buscar assinantes.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'ativo' ? 'cancelado' : 'ativo';
    try {
      const { error } = await supabase
        .from('assinantes')
        .update({ status_plano: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAssinantes(); // recarregar
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status.');
    }
  }

  async function editWebhook(id, currentUrl) {
    const newUrl = window.prompt('Digite a nova URL do Webhook do n8n para este assinante (deixe em branco para remover):', currentUrl || '');
    if (newUrl === null) return; // Cancelou

    try {
      const { error } = await supabase
        .from('assinantes')
        .update({ n8n_webhook_url: newUrl.trim() })
        .eq('id', id);

      if (error) throw error;
      fetchAssinantes();
    } catch (err) {
      console.error('Erro ao atualizar webhook:', err);
      alert('Erro ao atualizar webhook. Lembre-se de adicionar a coluna n8n_webhook_url no banco de dados!');
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar Simples para Admin */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon"><i className="fa-solid fa-crown"></i></div>
          <span className="logo-text">LavaZap Admin</span>
        </div>
        <nav className="sidebar-menu">
          <div className="menu-category">Gestão</div>
          <a className="menu-item active">
            <i className="fa-solid fa-users menu-icon"></i> Assinantes
          </a>
          <div style={{ flexGrow: 1 }}></div>
          <a className="menu-item" onClick={() => navigate('/painel')}>
            <i className="fa-solid fa-arrow-left menu-icon"></i> Voltar ao Painel
          </a>
          <a className="menu-item" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>
            <i className="fa-solid fa-right-from-bracket menu-icon"></i> Sair
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="title-lg">Painel de Controle (Super Admin)</h1>
            <p className="text-muted">Gerencie os donos de lava-rápido usando o seu sistema.</p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-cyan)' }}>
            Carregando assinantes...
          </div>
        ) : (
          <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>E-MAIL DO ASSINANTE</th>
                  <th>DATA DE CADASTRO</th>
                  <th>TELEFONE</th>
                  <th>STATUS DO PLANO</th>
                  <th>VENCIMENTO DO TESTE</th>
                  <th>PERFIL</th>
                  <th>WEBHOOK N8N</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {assinantes.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhum assinante encontrado.</td></tr>
                ) : (
                  assinantes.map(ass => (
                    <tr key={ass.id}>
                      <td style={{ fontWeight: '600' }}>{ass.email}</td>
                      <td>{new Date(ass.created_at).toLocaleDateString('pt-BR')}</td>
                      <td>{ass.telefone || '-'}</td>
                      <td>
                        <span className={`status-badge ${ass.status_plano === 'ativo' ? 'progress' : ass.status_plano === 'pendente_pagamento' ? 'waiting' : ass.status_plano === 'atrasado' ? 'cancelled' : 'waiting'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                          <span className="pulse-dot"></span>
                          {ass.status_plano.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-mono" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {ass.plano_expira_em ? new Date(ass.plano_expira_em).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td>
                        {ass.is_admin ? <strong style={{ color: 'var(--status-ready)' }}>Super Admin</strong> : <span className="text-muted">Lava-Rápido</span>}
                      </td>
                      <td>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', height: 'auto', fontSize: '11px', whiteSpace: 'nowrap' }}
                          onClick={() => editWebhook(ass.id, ass.n8n_webhook_url)}
                          title={ass.n8n_webhook_url}
                        >
                          <i className="fa-solid fa-link" style={{ marginRight: '6px' }}></i> 
                          {ass.n8n_webhook_url ? 'Editar' : 'Adicionar'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', height: 'auto', fontSize: '12px', whiteSpace: 'nowrap' }}
                          onClick={() => toggleStatus(ass.id, ass.status_plano)}
                          disabled={ass.id === currentUserId}
                        >
                          {ass.status_plano === 'ativo' ? 'Cancelar Assinatura' : 'Ativar Assinatura'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
