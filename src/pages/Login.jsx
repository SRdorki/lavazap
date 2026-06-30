import React, { useState, useEffect, useRef } from 'react';
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
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef([]);
  
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
      const cleanEmail = email.trim().toLowerCase();
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
        
        // Exibir tela de código (OTP)
        setSuccess('Conta criada! Verifique seu e-mail e digite o código de 8 dígitos abaixo.');
        setIsVerifyingOtp(true);
        // Removemos o setPassword('') para guardar a senha e fazer auto-login caso o antivírus consuma o token
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

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const digit = value.replace(/\D/g, '');
    if (!digit && value !== '') return;

    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);

    // Auto-focus next input if a digit was entered
    if (digit && index < 7) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 8);
    
    if (digitsOnly) {
      const newValues = [...otpValues];
      for (let i = 0; i < digitsOnly.length; i++) {
        if (i < 8) newValues[i] = digitsOnly[i];
      }
      setOtpValues(newValues);
      
      // Focus on the next empty input or the last input
      const nextIndex = Math.min(digitsOnly.length, 7);
      otpRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCodeStr = otpValues.join('');
    if (otpCodeStr.length < 8) { setError('Por favor, digite todos os 8 números do código.'); return; }
    try {
      setLoading(true); setError(null); setSuccess(null);
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = otpCodeStr; // Já está limpo pois handleOtpChange restringe para números
      
      if (cleanToken.length !== 8) {
        setError('O código precisa ter exatamente 8 números.');
        setLoading(false);
        return;
      }

      let authError;
      const { error: errSignup } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup'
      });
      authError = errSignup;

      // Fallback para 'email' caso o template gerado pelo Supabase tenha sido de Magic Link
      if (errSignup && errSignup.message.includes('expired or is invalid')) {
        const { error: errEmail } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'email'
        });
        if (!errEmail) {
          authError = null; // Sucesso no fallback!
        }
      }

      if (authError) {
        // Anti-vírus consumiu o token? Se sim, o usuário já está confirmado!
        // Vamos tentar fazer o login silencioso. Se der certo, ignoramos o erro do token.
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (!loginError) {
          authError = null; // Login funcionou! Conta já estava confirmada.
        } else {
          // Se o login falhou, mostramos o erro original E o erro do login para investigar
          throw new Error(`Token Inválido. (Info extra: ${loginError.message})`);
        }
      }

      if (authError) throw authError;
      navigate('/painel');
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
            {isVerifyingOtp ? 'Confirme seu E-mail' : isRecovering ? 'Nova senha' : isResettingPassword ? 'Recuperar senha' : isLogin ? 'Bem-vindo de volta' : 'Criar conta grátis'}
          </h1>
          <p className="login-subtitle">
            {isVerifyingOtp ? 'Digite o código de 8 dígitos que enviamos para seu e-mail.' : isRecovering ? 'Digite sua nova senha segura abaixo.' : isResettingPassword ? 'Enviaremos um link para seu e-mail.' : isLogin ? 'Acesse o seu painel de gestão LavaZap.' : 'Comece com 7 dias grátis. Sem cartão.'}
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

        <form onSubmit={isVerifyingOtp ? handleVerifyOtp : isRecovering ? handleUpdatePassword : isResettingPassword ? handleResetPassword : handleAuth} className="login-form" noValidate>
          {isVerifyingOtp ? (
            <div className="login-field">
              <label className="login-label" style={{ textAlign: 'center', display: 'block' }}>Código de Confirmação</label>
              <div className="login-otp-container">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="login-otp-square"
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    required
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? <><span className="login-spinner"></span> Aguarde...</> : 
             isVerifyingOtp ? 'Verificar Código' :
             isRecovering ? 'Salvar Nova Senha' : 
             isResettingPassword ? 'Enviar Link de Recuperação' : 
             isLogin ? 'Entrar no Painel' : 
             <><i className="fa-solid fa-arrow-right"></i> Criar Conta</>}
          </button>
        </form>

        <div className="login-footer">
          {isVerifyingOtp ? (
            <button className="login-link" onClick={() => { setIsVerifyingOtp(false); setError(null); setSuccess(null); }}>
              <i className="fa-solid fa-arrow-left"></i> Voltar
            </button>
          ) : isRecovering || isResettingPassword ? (
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
