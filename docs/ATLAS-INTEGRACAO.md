# Integração Vitrine Certa × ATLAS (white-label)

> Princípio: NÃO reconstruir. O ATLAS (AAPSON) já tem 6/6 funcionários IA, RAG,
> multi-tenant white-label, dunning e landings. A Vitrine Certa vira um TENANT.

## O que já existe (ATLAS — estado 22/jul)
- F1 Receptionist: capta lead + RAG por nicho + responde WhatsApp
- F2 Nutrição: conteúdo/relacionamento
- F3 Reviews: reputação
- F4 Dunning: cobrança WhatsApp (3 templates pt-BR)
- F5 Conciliação: financeiro
- F6 Auditor: QA/HITL
- `tenant_brand.py`: isolamento + brandmark (white-label pronto)
- Landings PME + WL (HTTP 200)
- QA 6/6 suites PASS

## O que a Vitrine Certa já tem
- Gerador (Maps/Insta → preview) na landing
- 8 sites simples + 8 premiums (Claude codando)
- Lead capture → Google Sheets → Telegram (Hermes)
- Plano financeiro: R$49/149/199

## Mapeamento (integração, não rebuild)

| Necessidade VC | Solução ATLAS existente | Gap |
|----------------|------------------------|-----|
| Captar lead do gerador | F1 Receptionist | ⚠️ Conectar Sheets→ATLAS |
| Follow-up de lead | F4 Dunning | ⚠️ Plugar tenant VC |
| Suporte pós-venda | F1 + F6 Auditor | ⚠️ Brandmark VC |
| Atualizar cardápio | — | 🔴 NOVO (ver abaixo) |
| Prospectar PME | F2 Nutrição + landing | ✅ reaproveitar |

## Plano de ação (3 fases)

### Fase 0 — Preparar tenant (Hermes, autônomo)
- [ ] Criar `tenant_vitrinecerta.json` (brandmark, cor, nome) pro `tenant_brand.py`
- [ ] Mapear nichos VC → nichos RAG do ATLAS (pizzaria, pet, etc.)
- [ ] Doc `ATLAS-INTEGRACAO.md` no repo VC

### Fase 1 — Ponte de leads (GATE 👤: chave NIM + Z-API)
- [ ] Hermes lê Sheets → POST no webhook do ATLAS (ou F1 consome direto)
- [ ] ATLAS responde lead no WhatsApp com brandmark VC
- [ ] F4 Dunning faz follow-up de quem não fechou

### Fase 2 — Cardápio como extensão (novo, mas leve)
- [ ] NÃO criar novo funcionário. Usar F1 + prompt "atualizar cardápio do cliente X"
- [ ] Hermes gere a mudança no site (R$29/item via plano financeiro)
- [ ] F6 Auditor valida antes de subir

## Decisões de negócio (GATE 👤)
- [ ] Usar ATLAS como backend de IA da VC? (custo NIM + Z-API)
- [ ] Ou manter Hermes + Sheets e só usar ATLAS pra prospecção pesada?
- [ ] Cardápio: incluir no pacote Full ou cobrar à parte?

## Não fazer
- ❌ Reimplementar receptionist / dunning / RAG
- ❌ Criar "funcionário de cardápio" se F1 resolve com prompt
- ❌ Duplicar landing (ATLAS já tem `atlas-pme-landing.html`)
