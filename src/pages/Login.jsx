import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import logoImg from '../assets/lavazap_final_logo_nobg.png';

/* ═══════════════════════════════════════════════════
   MAIN LOGIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error_description');
    if (hashError) {
      setError(decodeURIComponent(hashError).replace(/\+/g, ' '));
      window.history.replaceState(null, '', window.location.pathname);
    }
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);

    try {
      const cleanEmail = email.trim();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate('/painel');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              telefone: telefone.trim(),
              nome_empresa: nomeEmpresa.trim(),
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // Se deu tudo certo, usuário é automaticamente logado, enviamos pro painel
        navigate('/painel');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Por favor, digite seu e-mail.'); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSuccess('Enviamos um link de recuperação para seu e-mail.');
      setIsResettingPassword(false);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('A senha deve ter 6+ caracteres.'); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess('Senha atualizada! Redirecionando...');
      setIsRecovering(false);
      setPassword('');
      setTimeout(() => navigate('/painel'), 1500);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-stars" aria-hidden="true"></div>
      <div className="login-ambient" aria-hidden="true"></div>
      <div className="login-grid" aria-hidden="true"></div>

      <Link to="/" className="login-back-link">
        <i className="fa-solid fa-arrow-left"></i>
        Página inicial
      </Link>

      <div className="login-card">
        <div className="login-card-accent"></div>

        <div className="login-logo-wrap">
          <img src={logoImg} alt="LavaZap" className="login-logo" />
        </div>

        <div className="login-heading">
          <h1 className="login-title">
            {isRecovering ? 'Nova senha' : isResettingPassword ? 'Recuperar senha' : isLogin ? 'Bem-vindo de volta' : 'Criar conta grátis'}
          </h1>
          <p className="login-subtitle">
            {isRecovering ? 'Digite sua nova senha segura abaixo.' : isResettingPassword ? 'Enviaremos um link para seu e-mail.' : isLogin ? 'Acesse o seu painel de gestão LavaZap.' : 'Comece com 7 dias grátis. Sem cartão.'}
          </p>
        </div>

        {error && (
          <div className="login-alert login-alert-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="login-alert login-alert-success">
            <i className="fa-solid fa-circle-check"></i>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={isRecovering ? handleUpdatePassword : isResettingPassword ? handleResetPassword : handleAuth} className="login-form" noValidate>
          {!isRecovering && (
            <div className="login-field">
              <label className="login-label">E-mail</label>
              <div className="login-input-wrap">
                <i className="fa-solid fa-envelope login-input-icon"></i>
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && !isResettingPassword && !isRecovering && (
            <>
              <div className="login-field">
                <label className="login-label">Nome do Lava-Rápido</label>
                <div className="login-input-wrap">
                  <i className="fa-solid fa-store login-input-icon"></i>
                  <input
                    type="text"
                    className="login-input"
                    value={nomeEmpresa}
                    onChange={e => setNomeEmpresa(e.target.value)}
                    placeholder="Nome do negócio"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Celular (WhatsApp)</label>
                <div className="login-input-wrap">
                  <i className="fa-brands fa-whatsapp login-input-icon"></i>
                  <input
                    type="tel"
                    className="login-input"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {(!isResettingPassword || isRecovering) && (
            <div className="login-field">
              <div className="login-label-row">
                <label className="login-label">{isRecovering ? 'Nova Senha' : 'Senha'}</label>
                {isLogin && !isRecovering && (
                  <button type="button" className="login-forgot" onClick={() => { setIsResettingPassword(true); setError(null); setSuccess(null); }}>
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="login-input-wrap">
                <i className="fa-solid fa-lock login-input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-pw"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="login-eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? <><span className="login-spinner"></span> Aguarde...</> : 
             isRecovering ? 'Salvar Nova Senha' : 
             isResettingPassword ? 'Enviar Link de Recuperação' : 
             isLogin ? 'Entrar no Painel' : 
             <><i className="fa-solid fa-arrow-right"></i> Criar Conta</>}
          </button>
        </form>

        <div className="login-footer">
          {isRecovering || isResettingPassword ? (
            <button className="login-link" onClick={() => { setIsRecovering(false); setIsResettingPassword(false); setError(null); }}>
              <i className="fa-solid fa-arrow-left"></i> Voltar para o Login
            </button>
          ) : (
            <p className="login-toggle-text">
              {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
              {' '}
              <button className="login-link" onClick={() => { setIsLogin(v => !v); setError(null); setSuccess(null); }}>
                {isLogin ? 'Cadastre-se grátis' : 'Faça login'}
              </button>
            </p>
          )}
        </div>

        <p className="login-privacy">
          Ao continuar, você concorda com nossa{' '}
          <Link to="/privacidade">Política de Privacidade</Link> e <Link to="/cookies">Política de Cookies</Link>.
        </p>
      </div>
    </div>
  );
}
