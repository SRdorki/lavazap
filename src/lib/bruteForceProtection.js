/**
 * Brute-Force Protection Module
 * 
 * Captura o IP do cliente via ipify e bloqueia por 30 minutos
 * após 5 tentativas de login falhas consecutivas.
 * 
 * Armazena as tentativas na tabela `login_attempts` do Supabase
 * para persistência entre sessões/dispositivos.
 */

import { supabase } from '../supabaseClient';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutos

// Cache do IP em memória para não chamar a API a cada tentativa
let cachedIp = null;

/**
 * Busca o IP público do cliente via ipify
 */
export async function getClientIp() {
  if (cachedIp) return cachedIp;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.ipify.org/?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await response.json();
    cachedIp = data.ip;
    return cachedIp;
  } catch (err) {
    console.warn('[BruteForce] Não foi possível obter o IP:', err.message);
    // Fallback: usa um hash do user-agent como identificador parcial
    return `unknown-${hashString(navigator.userAgent)}`;
  }
}

/**
 * Hash simples para gerar um identificador de fallback
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Verifica se um IP está bloqueado (5+ tentativas nos últimos 30 min)
 * Retorna: { blocked: boolean, remainingMinutes: number, attempts: number }
 */
export async function checkIfBlocked(ip) {
  try {
    const cutoff = new Date(Date.now() - BLOCK_DURATION_MS).toISOString();

    const { data, error } = await supabase
      .from('login_attempts')
      .select('attempted_at')
      .eq('ip_address', ip)
      .eq('success', false)
      .gte('attempted_at', cutoff)
      .order('attempted_at', { ascending: false });

    if (error) {
      console.warn('[BruteForce] Erro ao verificar bloqueio:', error.message);
      return { blocked: false, remainingMinutes: 0, attempts: 0 };
    }

    const attempts = data?.length || 0;

    if (attempts >= MAX_ATTEMPTS) {
      // Calcula tempo restante baseado na tentativa mais antiga dentro da janela
      const oldestAttempt = new Date(data[data.length - 1].attempted_at);
      const unblockTime = new Date(oldestAttempt.getTime() + BLOCK_DURATION_MS);
      const remainingMs = unblockTime.getTime() - Date.now();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));

      return { blocked: true, remainingMinutes, attempts };
    }

    return { blocked: false, remainingMinutes: 0, attempts };
  } catch (err) {
    console.warn('[BruteForce] Erro inesperado:', err);
    return { blocked: false, remainingMinutes: 0, attempts: 0 };
  }
}

/**
 * Registra uma tentativa de login falhada
 */
export async function recordFailedAttempt(ip, email) {
  try {
    await supabase.from('login_attempts').insert({
      ip_address: ip,
      email: email?.toLowerCase()?.trim() || 'unknown',
      success: false,
    });
  } catch (err) {
    console.warn('[BruteForce] Erro ao registrar tentativa:', err);
  }
}

/**
 * Registra login bem-sucedido (limpa o histórico de falhas do IP)
 */
export async function recordSuccessfulLogin(ip, email) {
  try {
    // Insere registro de sucesso
    await supabase.from('login_attempts').insert({
      ip_address: ip,
      email: email?.toLowerCase()?.trim() || 'unknown',
      success: true,
    });

    // Remove tentativas falhas anteriores deste IP (reset do contador)
    await supabase
      .from('login_attempts')
      .delete()
      .eq('ip_address', ip)
      .eq('success', false);
  } catch (err) {
    console.warn('[BruteForce] Erro ao registrar sucesso:', err);
  }
}

/**
 * Formata a mensagem de bloqueio para exibir no UI
 */
export function getBlockMessage(remainingMinutes) {
  if (remainingMinutes <= 1) {
    return '🔒 IP bloqueado por muitas tentativas de login. Tente novamente em 1 minuto.';
  }
  return `🔒 IP bloqueado por muitas tentativas de login. Tente novamente em ${remainingMinutes} minutos.`;
}
