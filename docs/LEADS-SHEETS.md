# Vitrine Certa — Planilha de Leads (Google Sheets)

> Semana 3 (antecipada), Mês 1 · PO Técnico (Hermes) · GATE 4=WAIVED → Sheets→ATLAS liberado AGORA.

## Estrutura da planilha (aba `leads`)

| Coluna | Nome | Tipo | Exemplo | Origem do valor |
|--------|------|------|---------|-----------------|
| A | `nome` | texto | Pizzaria do João | form do site (`vcLead`) ou manual |
| B | `nicho` | enum (8) | pizzaria | `location.pathname` do site DFY |
| C | `whatsapp` | texto (E.164 BR) | 5511999998888 | form do site |
| D | `origem` | enum | `contato` \| `gerador` \| `manual` \| `indicacao` | leads.js / operador |
| E | `status` | enum | `novo` → `qualificado` → `proposta` → `cliente` → `perdido` | F1 / operador |
| F | `site_gerado` | url | https://receitazero.github.io/.../cliente-joao/ | gera-site.js |
| G | `data` | ISO datetime | 2026-07-23T14:00:00-03:00 | Apps Script (`new Date()`) |

Regras:
- `whatsapp` sempre só dígitos com DDI 55 (o bridge normaliza).
- `status` inicial é sempre `novo`; só F1/operador promovem.
- Nunca gravar dados sensíveis além de nome/whatsapp (LGPD — ver `docs/LGPD-VITRINE-CERTA.md`).

## Entrada de dados (2 caminhos)

1. **Site DFY → Apps Script → Sheets**: `references/leads.js` (já injetado pelos 8 Simples
   via `inject-leads.js`) faz POST JSON pro Web App do Apps Script
   (`docs/LEAD-APPS-SCRIPT.js`), que grava a linha.
2. **Manual**: operador digita a linha (origem=`manual`).

## Gatilho de saída (Sheets → ATLAS F1)

**Gatilho: `onChange`/`onFormSubmit` do Apps Script** (ou polling do bridge): toda linha NOVA
com `status=novo` dispara POST para o bridge (`references/sheets-atlas-bridge.js`), que
traduz a linha para o formato do webhook F1 do ATLAS (`http://localhost:8080/webhook`,
payload Z-API-like `{phone, text:{message}}`). O F1 Receptionist qualifica e responde;
o bridge registra a resposta e o operador (HITL) promove o `status`.

Sem Sheets real ainda? O bridge aceita `--mock` e roda o fluxo com 1 linha fake — usado
no QA da Semana 3.
