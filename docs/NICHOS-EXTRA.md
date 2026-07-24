# Vitrine Certa — Nichos EXTRA (proposta + geração)

> Direção da CEO (24/jul/2026): expandir catálogo de nichos com tiers **standard / plus / premium**.
> Status: **WIP-aprovar** — commit local em `wip/nichos-extra`, SEM push até aprovação.

## Nichos existentes (8)
clínica, imobiliária, lavanderia, oficina, padaria, pet, pizzaria, salão.

## Nichos NOVOS propostos (8)

| # | Nicho | Base de template sugerida | Racional |
|---|-------|---------------------------|----------|
| 1 | **Barbearia** ✅ gerado | salão | mesmo fluxo agenda/serviços, copy masculina |
| 2 | **Restaurante** ✅ gerado | pizzaria | cardápio + pedidos WhatsApp já prontos |
| 3 | Advocacia | clínica | agendamento de consulta → consulta jurídica |
| 4 | Dentista | clínica | mesma estrutura de especialidades/convênios |
| 5 | Personal trainer | salão | serviços + planos recorrentes |
| 6 | Escola de idiomas | clínica | turmas/horários + matrícula via WhatsApp |
| 7 | Salão de festas / buffet | pizzaria | galeria + orçamento via WhatsApp |
| 8 | Pet grooming móvel | pet | derivado direto do nicho pet, agenda a domicílio |

## Tiers gerados (determinísticos, via `references/gera-nicho.js`)

Reusa a lógica de injeção do `gera-site.js` (wa.me, title/h1, override de cores `:root`,
substituição de termos de copy) copiando os 3 tiers do nicho base — **sem tocar** o nicho
base, o `index.html` da raiz, nem `premium/` de clientes de outros nichos.

### Barbearia (base: salão)
- `site-dfy/barbearia/standard/` — 18.3 KB, 4 assets, 3 wa.me, 14 trocas de copy
- `site-dfy/barbearia/plus/` — 24.2 KB, 4 assets, 5 wa.me, 16 trocas
- `site-dfy/barbearia/premium/` — 34.6 KB, 4 assets, 12 trocas
- Cores: primary `#1a1a1a`, accent `#c9a227` (preto + dourado)

### Restaurante (base: pizzaria)
- `site-dfy/restaurante/standard/` — 18.7 KB, 4 assets, 3 wa.me, 42 trocas
- `site-dfy/restaurante/plus/` — 31.2 KB, 4 assets, 4 wa.me, 46 trocas
- `site-dfy/restaurante/premium/` — 65.4 KB, 4 assets, 26 trocas
- Cores: primary `#7a2e1d`, accent `#e8b04b` (terracota + âmbar)

## Como gerar outro nicho
```bash
node references/gera-nicho.js references/_fixtures/nicho-<slug>.json
npm test   # SYNTAX + PLAYWRIGHT devem ficar verdes
```
Config JSON: `{ nicho, base_dir, titulo, cidade, whatsapp, cores{primary,accent}, termos[[de,para]] }`.

## Pendências (pós-aprovação da CEO)
- [ ] Aprovar copy/fotos dos 2 nichos gerados (fotos ainda são do nicho base).
- [ ] Registrar novos nichos em `tenant_vitrinecerta.json`.
- [ ] Push + Pages após aprovação (`wip/nichos-extra` → main).
- [ ] Gerar os demais 6 nichos da tabela conforme demanda comercial.
