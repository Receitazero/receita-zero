# Vitrine Certa — Cobrança Mercado Pago (GATE 5=B, PREPARAÇÃO — NÃO implementado)

> Semana 3 · Plano de integração. Secrets NÃO existem ainda (GATE 👤 execução).
> NADA aqui é código em produção; é o caminho para quando o CEO liberar as credenciais.

## Modelo de cobrança (preços canônicos)

| Plano | Valor | Tipo MP |
|-------|-------|---------|
| Essencial | R$49/mês | Assinatura (preapproval) |
| Plus | R$99/mês | Assinatura |
| Premium | R$149/mês | Assinatura |
| Domínio/Full | R$199/mês | Assinatura |
| Cardápio avulso (GATE 2=C) | R$29/un | Pagamento único (preference + Pix) |

## Endpoints MP a usar

1. **Assinaturas**: `POST https://api.mercadopago.com/preapproval`
   - body: `{reason: "Vitrine Certa — Plano <X>", auto_recurring: {frequency:1, frequency_type:"months", transaction_amount:<valor>, currency_id:"BRL"}, payer_email, back_url, external_reference:"<lead_id>"}`
2. **Pagamento único (cardápio R$29)**: `POST /checkout/preferences` (Pix + cartão).
3. **Consulta**: `GET /preapproval/{id}` e `GET /v1/payments/{id}`.

## Webhook de retorno

- Endpoint próprio: reutilizar o padrão do bridge — `references/sheets-atlas-bridge.js`
  ganhará rota `POST /mp-webhook` (ou script irmão `mp-webhook.js`) que:
  1. valida `x-signature` do MP (HMAC com o secret do webhook);
  2. em `payment.approved` / `preapproval.authorized` → atualiza `status` do lead na
     planilha (`cliente`) e loga em `lead-engine/bridge-log.jsonl`;
  3. em `payment.rejected`/cancelamento → aciona F4 Dunning do ATLAS (tenant vitrinecerta).
- URL pública: mesma pendência do bridge (tunnel/VPS) — decidir junto.

## Secrets (NUNCA commitar)

| Secret | Onde fica |
|--------|-----------|
| `MP_ACCESS_TOKEN` (produção) | cofre local `C:\Users\kauea\secrets\` (NTFS-hardened) |
| `MP_WEBHOOK_SECRET` | idem |
| Test credentials (sandbox) | idem, sufixo `_TEST` |

Scripts lerão via `process.env.MP_ACCESS_TOKEN` — jamais literal no repo. `.gitignore`
já não cobre `secrets/` porque o cofre fica FORA do repo.

## Passos quando o GATE 👤 abrir

1. CEO cria app no painel MP (conta Receita-Zero, NÃO AAPSON) e deposita secrets no cofre.
2. Testar em sandbox: criar preapproval de R$49 + simular webhook.
3. Implementar `references/mp-webhook.js` + testes mock (mesmo padrão `--mock` do bridge).
4. Ligar F4 Dunning para inadimplência (já existe no ATLAS).
5. Só então divulgar link de pagamento aos clientes.
