-- =============================================
-- Tabela: login_attempts
-- Proteção anti brute-force com rastreamento de IP
-- =============================================

-- Cria a tabela
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  email text NOT NULL DEFAULT 'unknown',
  attempted_at timestamptz DEFAULT now() NOT NULL,
  success boolean DEFAULT false NOT NULL
);

-- Índice para buscas rápidas por IP + tempo
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
  ON login_attempts (ip_address, attempted_at DESC);

-- Índice para limpeza automática
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at 
  ON login_attempts (attempted_at);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Permite inserções anônimas (necessário para registrar tentativas antes do login)
CREATE POLICY "Allow anonymous insert on login_attempts"
  ON login_attempts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permite leitura anônima (necessário para verificar bloqueio antes do login)
CREATE POLICY "Allow anonymous select on login_attempts"
  ON login_attempts
  FOR SELECT
  TO anon
  USING (true);

-- Permite deleção anônima (necessário para limpar tentativas após login bem-sucedido)
CREATE POLICY "Allow anonymous delete on login_attempts"
  ON login_attempts
  FOR DELETE
  TO anon
  USING (true);

-- Permite acesso total para usuários autenticados (admin pode gerenciar)
CREATE POLICY "Allow authenticated full access on login_attempts"
  ON login_attempts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- LIMPEZA AUTOMÁTICA (Opcional - requer pg_cron)
-- Se você tem pg_cron habilitado no Supabase, execute:
-- =============================================
-- SELECT cron.schedule(
--   'cleanup-login-attempts',
--   '0 */6 * * *',  -- A cada 6 horas
--   $$DELETE FROM login_attempts WHERE attempted_at < now() - interval '2 hours'$$
-- );
