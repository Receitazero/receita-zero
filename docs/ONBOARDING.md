# Vitrine Certa — Processo de Onboarding de Cliente

> Semana 2, Mês 1 (autônomo). Define O PROCESSO de coleta de dados → geração do site.
> ⚠️ GATE 4 (Mom Test) ainda aberto: este documento NÃO é validação de oferta com
> cliente real — é o processo interno para quando o gate abrir.

## Visão geral

```
Lead (WhatsApp) → Brief (15 min) → Geração (gera-site.js) → Prévia → Aprovação → Publicação (GitHub Pages) → Cobrança (GATE 5)
```

Prazo alvo: **prévia em 24–48h** após brief completo.

## Passo a passo

### 1. Recepção do lead
- Canal: WhatsApp (mesmo número dos sites demo).
- Perguntar: nome do negócio, ramo (mapear para 1 dos 8 nichos), cidade.
- Se o ramo não bater com nenhum nicho → usar o mais próximo e anotar no backlog (candidato a nicho novo, Semana 11).

### 2. Coleta do brief (template abaixo)
- Enviar o template de brief pelo WhatsApp. Meta: 15 minutos do cliente.
- Fotos: mínimo 3 (fachada/produto/equipe). Aceitar como vier; tratar depois.
- Se o cliente não tiver fotos, usar banco de imagens (Unsplash — vide `site-dfy/_unsplash_ids.json`) e sinalizar como placeholder.

### 3. Geração do site
- Montar o JSON de cliente (formato abaixo) e rodar:
  ```bash
  node references/gera-site.js cliente.json
  ```
- O script scaffolda `site-dfy/<nicho>/cliente-<slug>/` a partir do template do nicho,
  injetando nome, WhatsApp e itens de cardápio/serviços.
- Ajustes finos (cores, fotos reais, textos específicos) são feitos manualmente/via Hermes em cima do scaffold.

### 4. QA antes da prévia
```bash
node references/verify-syntax.js   # 0 erros
npm test                           # se mexeu em template compartilhado
```
- Conferir: botão WhatsApp com o número DO CLIENTE (não o demo), título/hero com o nome do negócio, preços corretos.

### 5. Prévia e aprovação
- Enviar link da prévia (GitHub Pages) pelo WhatsApp.
- Máximo 2 rodadas de ajuste incluídas no onboarding; a partir da 3ª, tratar como atualização (R$29) — comunicar com gentileza.

### 6. Publicação
- Merge na `main` → GitHub Pages publica.
- Plano Domínio Próprio (R$199): registrar `.com.br` + configurar DNS/SSL (processo detalhado na Semana 9).

### 7. Pós-venda
- Registrar cliente na planilha de leads (estrutura na Semana 3).
- Cobrança: **manual (GATE 5 aberto)** — não ativar cobrança automática.
- Oferecer pacote de atualização (Light R$99 / Full R$199) após 1º mês.

---

## Template de brief de coleta (enviar ao cliente)

```
📋 BRIEF — VITRINE CERTA (15 min)

1. Nome do negócio: ___
2. Ramo: (clínica / imobiliária / lavanderia / oficina / padaria / pet shop / pizzaria / salão / outro: ___)
3. Cidade/bairro: ___
4. WhatsApp de atendimento (com DDD): ___
5. Cores preferidas (até 2, ou "confio em vocês"): ___
6. Cardápio/serviços principais (até 8 itens, com preço):
   - Item — R$ ___
7. Horário de funcionamento: ___
8. Endereço (se quiser exibir): ___
9. Instagram (se tiver): ___
10. Fotos: envie aqui no WhatsApp 3 a 10 fotos (fachada, produtos, equipe)
11. Alguma coisa que seu site NÃO pode deixar de ter? ___
```

## Formato do JSON de cliente (entrada do gera-site.js)

```json
{
  "nome": "Pizzaria do Zé",
  "nicho": "pizzaria",
  "cidade": "São Vicente",
  "whatsapp": "5513999990000",
  "cores": { "primary": "#EF4444", "accent": "#FACC15" },
  "itens": [
    { "nome": "Margherita", "desc": "Molho, mozzarella e manjericão.", "preco": 38 },
    { "nome": "Calabresa", "desc": "Calabresa e cebola roxa.", "preco": 42 }
  ]
}
```

Nichos válidos (chaves do `tenant_vitrinecerta.json`): `clinica`, `imobiliaria`,
`lavanderia`, `oficina`, `padaria`, `pet`, `pizzaria`, `salao`.

## Restrições / LGPD
- NÃO coletar CPF, dados bancários ou dados de clientes do cliente (só dados do negócio).
- Política LGPD formal = GATE 6 (pendente). Até lá: mínimo necessário, nada de repasse.

---
*Gerado autonomamente pelo Hermes (PO) — Semana 2, Mês 1.*

---

## Pipeline de Lead → Site (Semana 3, antecipada — GATE 4=WAIVED)

```
Formulário do site DFY (vcLead → captureLead, references/leads.js)
        │ POST JSON
        ▼
Apps Script (docs/LEAD-APPS-SCRIPT.js) grava linha na planilha (docs/LEADS-SHEETS.md)
        │ gatilho onChange (status=novo)
        ▼
Bridge (references/sheets-atlas-bridge.js, :8737 POST /lead)
        │ traduz p/ payload Z-API-like {phone, text.message, tenant:vitrinecerta}
        ▼
ATLAS F1 Receptionist (webhook_zapi.py :8080/webhook) qualifica o lead
        │ resposta registrada em lead-engine/bridge-log.jsonl
        ▼
Operador (HITL) promove status → `qualificado` → brief (seções 1–2 acima)
        ▼
gera-site.js scaffolda site-dfy/<nicho>/cliente-<slug>/ (seção 3)
        ▼
Hermes/F1 injeta cardápio (GATE 2=C: R$29/un via F1 + prompt)
        ▼
HITL LGPD (GATE 6): humano aprova conteúdo do cliente ANTES de publicar
  (docs/LGPD-VITRINE-CERTA.md) → GitHub Pages → cobrança (GATE 5, ver docs/COBRANCA-MP.md)
```

- Teste do bridge sem Sheets real: `node references/sheets-atlas-bridge.js --mock` → `BRIDGE_MOCK_OK`.
- Identidade visual: quando cada nicho ganhar `DESIGN.md` (token spec Google), o
  `gera-site.js` deve ler o YAML front matter (colors/typography) e injetar como
  `var(--token)` no `:root` do scaffold — NUNCA hardcodar cor fora de token (gate 48
  da skill Premium). Até lá, o scaffold herda os tokens do template do nicho.

## Pacotes de Atualização (Semana 6, Mês 2 — cross-sell; GATE 5=B)

Após o cliente contratar um plano mensal (Essencial/Premium/Domínio), oferecer os
pacotes de atualização — estes SÃO os "planos de manutenção" cobrados à parte e que
alimentam o MRR recorrente:

| Pacote | Valor | Tipo MP | Inclui | Script de execução |
|--------|-------|---------|--------|--------------------|
| **Light** | R$99/mês | `preapproval` | 2 atualizações de cardápio/fotos por mês | `atualiza-site.js` (2x/mês) |
| **Full** | R$199/mês | `preapproval` | Atualizações ilimitadas + 1 melhoria/mês | `atualiza-site.js` sob demanda |

- **Cardápio avulso (fora do pacote):** R$29/un via `references/atualiza-site.js`
  (pagamento único `preference` + Pix). Ver `docs/AUTOMACAO-CARDAPIO-ATUALIZACAO.md`.
- **Bug/correção:** grátis (incluído) — não gera cobrança.
- **Fluxo de upsell:** landing (Premium R$149) → upsell domínio (R$199) →
  cross-sell pacote (Light R$99 / Full R$199) → manutenção avulsa (R$29).
- **Cobrança:** Mercado Pago recorrente (`preapproval`), sem manual. Webhook
  `mp-webhook.js` (a criar no GATE 👤) marca `status` na planilha. Ver `docs/COBRANCA-MP.md`.
- **Ativação no onboarding:** ao fechar o contrato, registrar na planilha
  (`docs/LEADS-SHEETS.md`) as colunas `plano` + `pacote` (Light/Full/vazio) para o
  bridge gerar a assinatura certa.
