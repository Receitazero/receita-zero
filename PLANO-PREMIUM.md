# Plano Premium — Vitrine Certa (8 nichos)

Braço isolado da AAPSON. Cada nicho tem versão Simples (`index.html`) e Premium (`premium/index.html`).
Premium = mistura de **funcional + visual pesado** (critério B), cada um com mecânica UAU própria e
inspiração em repositório famoso de design do GitHub. Pasta por nicho: `site-dfy/{nicho}/premium/`.

## Critérios fixados (aprovados pelo user)
- (A) Estrutura: `premium/` dentro de cada nicho (Simples + Premium convivendo)
- (B) Premium = funcional real + visual pesado (justifica R$149)
- (C) Lotes com checkpoint (user vê o Lote 1 antes do 2)
- Repositório de inspiração clonado em `_refs/codewithsadee_vcard-personal-portfolio` (técnicas: CSS vars, glass, @keyframes)

## Mecânica UAU por nicho (cada uma única, diferente entre si) — STATUS ✅ TODOS FEITOS E VALIDADOS
| # | Nicho | Vibe / Inspiração | Diferencial UAU Premium | Arquivo | Status |
|---|---|---|---|---|---|
| 1 | 🍕 Pizzaria | immersive menu scroll (dark vermelho) | Cardápio imersivo c/ parallax por sabor + tabs + builder de pizza | site-dfy/pizzaria/premium/index.html | ✅ FEITO |
| 2 | 🥖 Padaria | editorial/warm (cream) | Storytelling "do forno à mesa" + grid de pães c/ hover de receita + encomenda por data | site-dfy/padaria/premium/index.html | ✅ FEITO |
| 3 | 🐾 Pet shop | playful/rounded (laranja/rosa) | Avatar do pet (cor+nome ao vivo) + calculadora de banho + carousel tutores | site-dfy/pet/premium/index.html | ✅ FEITO |
| 4 | 🔧 Oficina | tech/dark/utilitário (verde neon) | Orçamento interativo em tempo real (carro+serviço→preço) + selo garantia SVG animado | site-dfy/oficina/premium/index.html | ✅ FEITO |
| 5 | 💇 Salão | glam/glass (rosa) | Agenda visual de horários ao vivo (ocupado/livre) + galeria before/after + pacotes | site-dfy/salão/premium/index.html | ✅ FEITO |
| 6 | 🦷 Clínica | clean/medical trust (azul claro) | Booking de consulta (esp+data→WhatsApp) + tour em scroll (stops revelam) | site-dfy/clínica/premium/index.html | ✅ FEITO |
| 7 | 🧺 Lavanderia | fresh/minimal (verde menta) | Simulador de custo por peso (slider) + timeline "deixou→lavado→entrega" animada | site-dfy/lavanderia/premium/index.html | ✅ FEITO |
| 8 | 🏠 Imobiliária | luxe/grid (dourado escuro) | Grid de imóveis c/ filtro (tipo/bairro/preço) + mini-mapa c/ pinos + ficha modal | site-dfy/imobiliária/premium/index.html | ✅ FEITO |

## Correções aplicadas nesta sessão
- Bug crítico nos 8 sites SIMPLES: função `vcLead()` tinha quebra de linha literal dentro de string
  (SyntaxError) → script abortava → `.reveal` invisível → "erro" que o user viu na landing (iframe carregava o Simples quebrado).
  Corrigido em todos os 8 (junta strings + `\n` explícito). `node --check` + render confirmam 0 erros.
- Pizzaria Premium: `.perk` CSS duplicado removido; abas do cardápio (Tradicionais/Especiais/Doces) agora filtram de verdade; grid do builder consertado.
- Imobiliária Premium: conflito de `const fPreco` (já declarado) → renomeado para `fPrecoEl`.

## Interface "cola link → monta o site" (GERADOR)
Arquivo existe: `receita-zero/gerador.html` (beta). Funciona:
- [x] Colar link Maps/Instagram → detecta nome (Maps q/place, Insta @)
- [x] Selecionar nicho → pré-visualiza o layout SIMPLES do nicho num iframe
- [x] API key opcional do Maps → puxa nome/endereço/foto via Place API (best-effort)
- [x] Botão "Gerar meu site de verdade" → abre WhatsApp com resumo
Próximas melhorias (futuro): heurística automática de nicho a partir do link; persistir rascunho em localStorage;
conectar direto ao template Premium (upsell R$149); ligar ao motor de lead (GAS CRM isolado em `lead-engine/code.gs`).

## Landing (receita-zero/index.html)
- Hero + "Veja rodando" (iframe dos Simples) + NOVO bloco "Quer a versão completa?" com grid de 8 links pros Premium
- Planos Essencial R$49 / Premium R$149, FAQ, CTAs WhatsApp.

## Validação
- `node --check` em TODOS os 14 arquivos (8 Simples + 6 Premium novos + pizzaria/padaria Premium + landing + gerador): OK
- Render Playwright (Chromium) em cada Premium: mecânica interativa funciona, 0 pageerrors, `.reveal` 100% visível
- Landing sem PAGEERROR (era o bug dos Simples no iframe)

## Deploy
- Repo: github.com/Receitazero/receita-zero (conta isolada, não AAPSON)
- Pages: https://receitazero.github.io/receita-zero/receita-zero/index.html
- Número WhatsApp: 5511970776856 (AAPSON, autorizado)
- Assets (banner.jpg, p1/p2/p3.jpg, etc.) são placeholders — trocar pelas fotos reais do cliente.
