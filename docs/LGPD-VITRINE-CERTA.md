# Vitrine Certa — LGPD & HITL (GATE 6=A, herdado do ATLAS)

> Semana 3 · Adaptação da lógica LGPD/HITL do ATLAS (aristoteles/) para a marca
> Vitrine Certa. O arquivo GATE_HITL_LGPD.md não existia no ATLAS; esta versão
> consolida os princípios REAIS já codificados lá (`lead_engine_outreach.py`,
> `optin_campaign.py`, `webhook_zapi.py`) e os aplica à VC.

## Princípios herdados do ATLAS

1. **Opt-in explícito antes de qualquer conversa comercial.** A 1ª mensagem PEDE
   CONSENTIMENTO; só quem responde SIM entra no funil (blinda ToS WhatsApp + LGPD).
   Na VC: leads vindos do formulário do site já consentiram (preencheram por vontade
   própria); leads de prospecção ativa seguem o opt-in do ATLAS.
2. **HITL em toda decisão de relacionamento.** No ATLAS, o fechamento (bate-papo) é
   sempre com humano (CEO). Na VC: nenhum site/conteúdo do cliente é PUBLICADO sem
   aprovação humana (o operador revisa a prévia — passo 5 do ONBOARDING.md).
3. **Audit trail.** Toda mensagem/evento é logado (`AUDIT TRAIL` no webhook do ATLAS).
   Na VC: `lead-engine/bridge-log.jsonl` registra cada lead encaminhado ao F1.
4. **Isolamento de dados por tenant.** `isolate_tenant_state()` garante que dados da
   VC (tenant `vitrinecerta`) não vazam para outros tenants do ATLAS.

## Regras específicas da Vitrine Certa

- **Minimização**: planilha de leads guarda só nome, nicho, whatsapp, origem, status,
  site, data (ver `docs/LEADS-SHEETS.md`). Nada de CPF, endereço completo ou dado sensível.
- **Finalidade**: dados usados exclusivamente para criar/manter o site contratado e
  comunicação sobre ele.
- **Publicação HITL (GATE 6)**: fotos, textos e preços do cliente só vão ao ar após o
  PRÓPRIO cliente aprovar a prévia por WhatsApp (registro escrito = evidência de
  consentimento de publicação).
- **Direito de exclusão**: a pedido, remover a linha da planilha + derrubar o site
  (git rm + Pages) em até 72h; registrar a exclusão no bridge-log.
- **Eco/self-message**: mensagens enviadas pela própria operação (fromMe) nunca são
  tratadas como resposta de lead (herdado do webhook do ATLAS).

## O que NÃO fazer

- ❌ Disparo frio em massa sem opt-in (risco de ban + violação LGPD).
- ❌ Publicar conteúdo do cliente sem aprovação escrita.
- ❌ Commitar dados pessoais reais no repo (leads ficam na planilha; o repo só tem fakes/QA).
