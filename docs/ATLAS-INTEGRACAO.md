# Vitrine Certa × ATLAS — Mapa de Integração (reaproveitamento, NÃO reconstrução)

> Doc do PO Técnico (Hermes) · Semana 1, Mês 1 · Fase 0.
> Fonte canônica: skill `vitrine-certa-atlas-integracao` + `aristoteles/tenant_brand.py`.
> **Princípio:** a Vitrine Certa é um TENANT white-label do ATLAS. Não reimplementa o que já existe.

---

## 1. O que o ATLAS já tem (não reconstruir)

O ATLAS (AAPSON) opera 6/6 funcionários IA, RAG por nicho, multi-tenant white-label
(`tenant_brand.py`) e landings PME. A VC pluga como tenant `vitrinecerta`.

| Função ATLAS | Papel | Estado |
|--------------|-------|--------|
| **F1 Receptionist** | Recebe e qualifica lead | ✅ existe |
| **F2 Nutrição** | Prospecção em lote | ✅ existe |
| **F3 Reviews** | Reputação | ✅ existe |
| **F4 Dunning** | Follow-up / cobrança suave | ✅ existe |
| **F5 Conciliação** | Financeiro | ✅ existe |
| **F6 Auditor** | Suporte/QA | ✅ existe |
| **RAG por nicho** | Conhecimento por vertical | ✅ existe |
| **Landings PME/WL** | `atlas-pme-landing.html` | ✅ existe |

---

## 2. Mapeamento de necessidades da VC → solução ATLAS

| Necessidade VC | Solução ATLAS (REAPROVEITAR) | Gap para fechar |
|----------------|------------------------------|-----------------|
| Lead vindo do gerador de site | **F1 Receptionist** | Conectar Sheets→webhook ATLAS — **GATE 👤 (Semana 3)** |
| Follow-up de lead que não fechou | **F4 Dunning**, plugado ao tenant `vitrinecerta` | Ativar tenant no F4 — Fase 1 |
| Suporte ao cliente | **F1 + F6** com brandmark VC | Brandmark (já no `tenant_vitrinecerta.json`) |
| RAG por nicho (8 verticais) | **RAG do ATLAS**, mapeado por `rag_source: atlas:rag/<nicho>` | Mapeado no tenant (Fase 0 ✅) |
| Prospecção de novos clientes | **F2 + landing WL** | Reaproveitar — Semana 10 (GATE custo NIM/Z-API) |
| Cardápio dinâmico | — (NOVO) | Usar **F1 + prompt**, NÃO criar novo empregado — Fase 2 |

---

## 3. RAG por nicho — mapa reaproveitado

Os 8 nichos da VC apontam para as bases RAG existentes do ATLAS (ver
`tenant_vitrinecerta.json → nichos.<nicho>.rag_source`):

| Nicho VC | `rag_source` | Site DFY |
|----------|--------------|----------|
| clínica | `atlas:rag/clinica` | `site-dfy/clínica` |
| imobiliária | `atlas:rag/imobiliaria` | `site-dfy/imobiliária` |
| lavanderia | `atlas:rag/lavanderia` | `site-dfy/lavanderia` |
| oficina | `atlas:rag/oficina` | `site-dfy/oficina` |
| padaria | `atlas:rag/padaria` | `site-dfy/padaria` |
| pet | `atlas:rag/pet` | `site-dfy/pet` |
| pizzaria | `atlas:rag/pizzaria` | `site-dfy/pizzaria` |
| salão | `atlas:rag/salao` | `site-dfy/salão` |

> Não recriar bases de conhecimento — consumir as do ATLAS via `rag_source`.

---

## 4. Landings PME a reaproveitar (não duplicar)

- `atlas-pme-landing.html` (ATLAS) → base de landing white-label.
- Sites DFY em `site-dfy/<nicho>/{index,plus,premium}` (VC) → já prontos, 8 nichos × 3 tiers.
- ❌ **Não duplicar** a landing genérica do ATLAS; a VC usa suas próprias vitrines por nicho
  e o ATLAS entra apenas como backend de lead/follow-up.

---

## 5. Isolamento multi-tenant

- `tenant_vitrinecerta.json` define `isolamento.state_path = tenants/vitrinecerta/state`.
- `isolate_tenant_state()` do ATLAS garante que dados NÃO vazam entre tenants.
- Brandmark "Vitrine Certa" via `swap_brandmark()` — sem tocar no código canônico do ATLAS.

---

## 6. Fases (o que é Fase 0 vs GATE 👤)

| Fase | Escopo | Dono | Status |
|------|--------|------|--------|
| **Fase 0** | `tenant_vitrinecerta.json` + mapear nichos + este doc | Hermes | ✅ Semana 1 |
| **Fase 1** | Sheets→webhook ATLAS, F4 follow-up, brandmark nos contatos | CEO libera | ⛔ **GATE 👤** (Semana 3) |
| **Fase 2** | Cardápio via F1+prompt (Hermes edita site) | Hermes (pós-gate) | ⏳ Mês 2 |

---

## 7. Decisões que ficam com o CEO (GATE 👤 — não avançar sozinho)

1. Usar ATLAS (NIM + Z-API) como backend IA da VC? (custo recorrente)
2. Cardápio: pacote Full ou cobrança à parte (R$29/un)?
3. Conectar Sheets→webhook ATLAS (Fase 1).

---

## 8. Não fazer (anti-escopo)

- ❌ Reimplementar receptionist/dunning/RAG (o ATLAS já tem).
- ❌ Criar "funcionário de cardápio" se F1 + prompt resolve.
- ❌ Duplicar a landing PME do ATLAS.

---
*Gerado autonomamente pelo Hermes (PO Técnico) — Semana 1, Mês 1. Integração = reaproveitamento.*

---

## Fase 1 — Sheets→F1 (ANTECIPADO, Semana 3)

**Por que antecipamos:** o GATE 4 (Mom Test) foi WAIVED pelo CEO (confiança no produto),
logo o gatilho que segurava a Fase 1 no GATE 3 sumiu. Decisão: executar Sheets→F1 já.

**Como funciona (validado com mock em 23/07/2026):**
1. Planilha de leads (`docs/LEADS-SHEETS.md`) recebe linha (form do site via
   `references/leads.js` + Apps Script, ou manual).
2. Gatilho do Apps Script faz POST em `references/sheets-atlas-bridge.js` (`:8737/lead`).
3. Bridge normaliza o WhatsApp (DDI 55) e traduz a linha para o payload que o
   `webhook_zapi.py` do ATLAS entende (`{phone, text:{message}, fromMe:false,
   tenant:"vitrinecerta"}`) → POST `:8080/webhook` (F1 Receptionist).
4. Resposta do F1 é registrada em `lead-engine/bridge-log.jsonl` (auditoria).
5. HITL: operador promove `status` na planilha; nada é publicado sem humano (GATE 6).

Evidência: `node references/sheets-atlas-bridge.js --mock` → `BRIDGE_MOCK_OK`, log em
`lead-engine/bridge-log.jsonl`. Pendências para produção: URL pública do bridge
(tunnel/VPS) + gatilho real no Apps Script — GATE 👤 execução.
