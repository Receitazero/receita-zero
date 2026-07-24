# Fase 1 ATLAS — Follow-up de Lead (MOCK LOCAL, sem credenciais)

> Status: **mock local determinístico**. Não há rede, não há API, não há secret.
> Tudo roda 100% offline a partir de uma fixture fictícia.

## O que este entregável faz

- `references/atlas-followup-mock.js` — lê um JSON de leads e monta a **fila de
  follow-up ordenada por prioridade**.
- `references/_fixtures/leads-demo.json` — 3 leads inventados (nome fantasia,
  nicho, data do último contato). Dados 100% fictícios, sem PII real.

### Regra de prioridade
- Lead com **> 7 dias** sem contato → **PRIORIDADE ALTA** (🔴)
- Lead com **≤ 7 dias** sem contato → **PRIORIDADE NORMAL** (🟢)

A fila é ordenada: ALTA primeiro (mais antigo no topo), depois NORMAL.

### Como testar de verdade
```bash
cd /c/Users/kauea/dev/receita-zero
node references/atlas-followup-mock.js
# ou apontar para outra fixture:
node references/atlas-followup-mock.js references/_fixtures/leads-demo.json
```

Saída esperada (fixture atual): 2 ALTA (Pet Shop 25d, Padaria 21d) + 1 NORMAL
(Salão 4d). Exit code 0 se a fila foi montada.

## O que falta para ligar no sistema real (etapa futura — precisa credenciais)

Este mock é o "esqueleto" da Fase 1. Para virar produção é preciso:

1. **ATLAS F1 (ler leads reais)** — substituir a leitura do JSON fixo por uma
   consulta aos leads reais (hoje: Sheets `docs/LEADS-SHEETS.md` ou webhook F1
   já existente, antecipado na Semana 3). **GATE 👤:** liberar credencial NIM/Z-API.
2. **ATLAS F4 (disparar follow-up)** — em vez de só imprimir a fila, o script
   aciona o F4 para mandar a mensagem de follow-up (brandmark VC nos contatos
   F1/F6, conforme plano VIVO S7).
3. **Agendamento** — rodar em cron `every 30m` (padrão Avança) para manter a
   fila viva. QA contínuo reaproveita o `npm test` já verde.
4. **Secrets** — credenciais NIM/Z-API devem ir para o cofre local
   (`references/_fixtures/` e `*.json` de lead NÃO sobem para o Pages; estão no
   `.gitignore` e são commitados com `-f` apenas localmente quando necessário).

## Princípio
Não reconstruir o que o ATLAS já tem. A Vitrine Certa é tenant white-label: a
Fase 1 reaproveita F1 (leitura) + F4 (follow-up) do ATLAS, só aplicando a marca
e a regra de prioridade do PO.
