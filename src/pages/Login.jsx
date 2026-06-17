import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import logoImg from '../assets/lavazap_final_logo_nobg.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Captura erros do Supabase que vêm na URL (ex: link expirado)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error_description');
    if (hashError) {
      setError(decodeURIComponent(hashError).replace(/\+/g, ' '));
      window.history.replaceState(null, '', window.location.pathname); // Limpa a URL
    }
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        navigate('/painel');
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              telefone: telefone.trim(),
              nome_empresa: nomeEmpresa.trim()
            }
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Se necessário, verifique seu e-mail ou faça login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, digite seu e-mail para receber o link de recuperação.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      alert('Se este e-mail estiver cadastrado, você receberá um link de recuperação em instantes.');
      setIsResettingPassword(false);
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError(err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      alert('Senha atualizada com sucesso! Você já pode acessar seu painel.');
      setIsRecovering(false);
      setPassword('');
      navigate('/painel');
    } catch (err) {
      console.error("Update Password Error:", err);
      setError(err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glow-bg"></div>
      
      <div className="login-card glass-card">
        <div className="logo text-center" style={{ justifyContent: 'center', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
          <img src={logoImg} alt="LavaZap Logo" style={{ height: '140px', objectFit: 'contain' }} />
        </div>
        
        <h2 className="text-center" style={{ marginBottom: '8px' }}>
          {isRecovering ? 'Crie uma nova senha' : (isResettingPassword ? 'Recuperar Senha' : (isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'))}
        </h2>
        <p className="text-center text-muted" style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
          {isRecovering ? 'Digite sua nova senha segura abaixo' : (isResettingPassword ? 'Enviaremos um link para redefinir sua senha' : (isLogin ? 'Acesse o seu painel de gestão' : 'Comece a lotar sua agenda agora mesmo'))}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={isRecovering ? handleUpdatePassword : (isResettingPassword ? handleResetPassword : handleAuth)} className="login-form">
          {!isRecovering && (
            <div className="form-group">
              <label>E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="seu@email.com"
                required 
              />
            </div>
          )}
          {!isLogin && !isResettingPassword && !isRecovering && (
            <>
              <div className="form-group">
                <label>Nome do Lava-Rápido / Estética</label>
                <input 
                  type="text" 
                  value={nomeEmpresa} 
                  onChange={(e) => setNomeEmpresa(e.target.value)} 
                  placeholder="Nome do seu negócio"
                  required={!isLogin} 
                />
              </div>
              <div className="form-group">
                <label>Telefone (WhatsApp)</label>
                <input 
                  type="text" 
                  value={telefone} 
                  onChange={(e) => setTelefone(e.target.value)} 
                  placeholder="(11) 99999-9999"
                  required={!isLogin} 
                />
              </div>
            </>
          )}
          
          {(!isResettingPassword || isRecovering) && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>{isRecovering ? 'Nova Senha' : 'Senha'}</label>
                {isLogin && !isRecovering && (
                  <button 
                    type="button" 
                    className="link-button" 
                    onClick={() => setIsResettingPassword(true)}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block mt-4" disabled={loading}>
            {loading ? 'Aguarde...' : (isRecovering ? 'Salvar Nova Senha' : (isResettingPassword ? 'Enviar Link de Recuperação' : (isLogin ? 'Entrar no Painel' : 'Criar Conta')))}
          </button>
        </form>

        <div className="login-footer text-center" style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          {isRecovering ? (
             <button className="link-button" onClick={() => setIsRecovering(false)}>
               &larr; Voltar para o Login
             </button>
          ) : isResettingPassword ? (
            <button className="link-button" onClick={() => setIsResettingPassword(false)}>
              &larr; Voltar para o Login
            </button>
          ) : (
            <>
              <span className="text-muted">
                {isLogin ? 'Ainda não tem uma conta? ' : 'Já tem uma conta? '}
              </span>
              <button className="link-button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Cadastre-se' : 'Faça Login'}
              </button>
            </>
          )}
        </div>
        
        <div className="text-center" style={{ marginTop: '16px', fontSize: '0.85rem' }}>
          <Link to="/" className="text-muted" style={{ textDecoration: 'none' }}>&larr; Voltar para a Home</Link>
        </div>
      </div>
    </div>
  );
}
