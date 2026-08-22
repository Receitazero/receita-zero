-- 0003_evento_visita.sql
-- Tabela de eventos de visita (analytics do Vitrine Certa).
-- Os sites são estáticos (GitHub Pages/Vercel) e o beacon vem SEM auth de usuário.
-- Logo: escrita e leitura são feitas pelo BACKEND (api/v1/events) usando a
-- SUPABASE_SERVICE_ROLE_KEY. RLS é endurecida para service_role (bypass natural)
-- + uma policy explícita que barra qualquer cliente anon/JWT comum de escrever
-- direto na tabela (o único caminho válido é a function serverless).
-- Modelo de dados: domínio de NEGÓCIO da VC (observabilidade do site do PME).

CREATE TABLE IF NOT EXISTS public.evento_visita (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   text NOT NULL DEFAULT 'landing',
  nicho       text NOT NULL DEFAULT 'landing',
  path        text NOT NULL,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evento_visita_tenant_created
  ON public.evento_visita (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evento_visita_nicho_created
  ON public.evento_visita (nicho, created_at DESC);

ALTER TABLE public.evento_visita ENABLE ROW LEVEL SECURITY;

-- Barra INSERT/SELECT direto de JWT comum (authenticated). Só service_role
-- (usado pela function) e o dono (auth.uid() dono do tenant, se houver) passam.
DROP POLICY IF EXISTS "evento_visita_no_anon_write" ON public.evento_visita;
CREATE POLICY "evento_visita_no_anon_write" ON public.evento_visita
  FOR ALL
  USING (false)
  WITH CHECK (false);
