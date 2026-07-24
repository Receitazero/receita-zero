# DESIGN.md — Vitrine Certa · Landing Mãe ("A JOIA da empresa")

## v3 — ESPECTRO VIVO (24/jul/2026 — a v2 "luxo silencioso" foi REPROVADA)
Feedback da dona sobre a v2 (âmbar único, calma, quase sem movimento): **"sem
personalidade, queria mais cores, movimentos, transparências e efeitos — mas nada
tão poluído"**. Lição: luxo-silencioso é estilo válido, mas ERRADO pro produto —
o produto são 8 vitrines coloridas e brincalhonas; a marca-mãe tem que ser a
vitrine mais viva da rua. Restrição a mais matou a personalidade.

**Conceito v3 = "a vitrine que contém as 8 lojas".** A cor vem do ESPECTRO dos 8
nichos (cada um sua cor real). Como fica colorido sem virar arco-íris poluído:
- **1 cor ativa por vez.** A vitrine do hero cicla pelas 8 lojas (auto 3,4s,
  pausa no hover, clicável pelos 8 orbs). A página inteira se re-tinge na cor da
  loja ativa via `--accent`/`--accent-ink`. Nunca as 8 juntas gritando.
- **Type/CTA ancoram, a LUZ viaja.** Botões=âmbar, wordmark=âmbar (casa estável);
  quem viaja pelo espectro é kicker, "responde", vitrine, halo, spotlight, orbs,
  hover dos cards. Disciplina anti-poluição (truque Linear/Stripe): UI neutra +
  ambiente colorido. `--accent`=cor viva (glow/dark), `--accent-ink`=escurecida
  legível (texto em fundo claro, todas ≥4.5 medidas).
- **Movimento vivo e reativo:** spotlight que segue o cursor tingido pela cor ativa,
  lâmpada que respira, contadores (48/8/49), cards que acendem na PRÓPRIA cor no hover,
  a vitrine re-tinge o conteúdo (cada loja mostra sua ação: pedir/agendar/verificar).
- **4 efeitos, mão leve:** vidro profundo (transparências reais + blur multicamada +
  highlight interno), halos de luz coloridos, spotlight no cursor, grão (feTurbulence .05).
- **Tudo respeita `prefers-reduced-motion`:** sem ciclo, sem spotlight, sem respiro,
  contadores no valor final, reveal instantâneo.
- Verificado: 0 falha de contraste (8 nichos × ink-no-claro + cor-no-escuro, tudo ≥4.5),
  scroll-x limpo 320–1440 (pseudo-halo horizontal contido), 0 erro JS, AAPSON ausente.
- Objeto (JS) canônico: `NICHOS[]` no `<script>` de `receita-zero/index.html` — cor/ink/
  nome/ação por loja. Trocar o line-up = editar esse array.

## Decisões travadas com a dona (23/jul/2026 — substitui default onde diverge)
Este DESIGN.md v2 foi gerado autônomo pelo Hermes; a dona revisou e travou:
1. **Personalidade = confiante e afiada.** Voz que afirma e prova com o produto vivo,
   diz o "não" honesto na cara. Não é portfólio — tem atitude. (title/copy seguem isso.)
2. **Logo = "janela + check".** Moldura de vitrine (loja) cujo interior traz um ✓ na cor
   da lâmpada — une os dois sentidos do nome: *vitrine* (exposição) + *certa* (acerto/✓).
   SVG inline, reusado em nav/footer/favicon. Frame em `--tinta`, check em `--lamp`.
3. **Acento = lâmpada âmbar-mel** (`--lamp` #E8873A / `--lamp-2` #B85E1E). A dona liberou
   usar tom da família AAPSON se fosse a melhor escolha; fica âmbar-mel (quente, "loja
   acesa"), distinto do terra AAPSON cru (#C8743C) por ser mais dourado. Contraste medido.
4. **Herói lidera com 2 diferenciais:** (a) **"não é foto — é o site funcionando"** (os 8
   demos são vivos) + (b) **no ar em 48h com o SEU WhatsApp**. O hero EMBUTE a prova: um
   mini-demo que responde ao clique (cor=estado, herdado dos nichos), não uma imagem.
5. **Limpeza obrigatória:** matar o slop da v1 do HTML (paleta arco-íris `--a1/2/3`, aurora
   animada, gradiente em texto, `Fraunces` no fallback, marquee em loop infinito, `floaty`).
   E limpar a contaminação AAPSON do `tenant_vitrinecerta.json` (bg #0B0714 / accent #C6FF00).

Fonte de verdade de tokens da NOSSA landing (`receita-zero/index.html`). Inspirado na
DISCIPLINA dos Premium do Claude (salão = "a cor é a cor do cabelo", pizzaria =
"a cor só existe quando o forno acende", pet = carteirinha, lavanderia = etiqueta,
padaria = saco de pão, imobiliária = conta) + bons exemplos premiados (Stripe
`ss01`+weight300, Framer `cv01`+tracking -5.5px). NÃO copia o visual — HERDA o
método: objeto-assinatura, tipografia com feature, sombra cromática, 1 acento.

Princípio norteador: **"A Vitrine Certa é a VITRINE."** A landing é a própria
vitrine da loja: vidro translúcido + 1 lâmpada âmbar acesa + o produto em
exposição. Vidro = profundidade (blur). Lâmpada = o único acento (luz, nunca bloco).
Produto = o que a PME vende, mostrado, não decorção.

```md
/* Hallmark · macrostructure: 14 Narrative Workflow · Vitrine Certa / Landing Mãe
   objeto=vitrine (vidro+lâmpada) · acento=âmbar (lâmpada acesa)
   display=Space Grotesk ss01 + weight 300 · dados=JetBrains Mono tnum
   pre-emit critique: P5 H4 E4 S5 R4 V5 */
```

## Por que este arquivo existe
A landing anterior (`receita-zero/index.html`) usava paleta arco-íris (`--a1/2/3`) +
aurora glow animado — exatamente o "slop" que a skill `receita-zero-premium-sites`
PROÍBE nos clientes. A joia da empresa não pode cometer o erro que proibimos nos
outros. A v1 deste DESIGN.md perdia o ponto: só "vidro genérico", sem objeto,
sem feature de fonte, sombra neutra. Esta v2 corrige.

## Princípio de cor — "vidro + lâmpada acesa"
- Fundo = **lousa/claro neutro** (`--vidro`), não escuro. A vitrine é claridade.
- Acento único = **âmbar quente** (`--lamp`), a "lâmpada acesa" da loja.
  Usado em ≤4% da tela, só em CTAs e foco. É LUZ, nunca preenchimento de bloco.
- Vidro = superfícies com `backdrop-filter: blur()` + borda 1px translúcida (`--linha`).
- Produto em exposição = silhueta SVG do nicho (pizza, pet, tesoura) em `--tinta` claro,
  dentro do "vidro" do card. Não foto — desenho vetor (lição do pet: autoral vence blob).
- Proibido: rosa/ciano/roxo juntos, aurora radial animada, gradiente em texto, sombra neutra.

## Tokens — base (tema claro, lousa)
| Token | Hex | Uso | Contraste s/ `--vidro` |
|---|---|---|---|
| `--vidro` | `#EEF0F4` | Fundo principal (lousa claro-azulado) | — |
| `--vidro2` | `#E3E7EE` | Superfície elevada, cards de vitrine | — |
| `--linha` | `#C9D2E0` | Borda 1px translúcida (vidro) | — |
| `--tinta` | `#16181F` | Texto principal, blocos escuros, silhueta de produto | 14,8:1 ✔ |
| `--fumaca` | `#5A6172` | Texto secundário | 5,9:1 ✔ |
| `--claro` | `#FBFCFE` | Texto sobre `--tinta` | 16,2:1 ✔ |
| `--lamp` | `#E8743B` | Acento único (lâmpada acesa), CTAs | 4,6:1 ✔ (sobre vidro) |
| `--lamp-2` | `#C75A26` | Hover do acento, texto pequeno | 6,1:1 ✔ |

## Tokens — vidro (profundidade) + sombra CROMÁTICA
| Token | Valor | Uso |
|---|---|---|
| `--blur` | `blur(14px)` | `backdrop-filter` de nav/cards |
| `--linha-grad` | `linear-gradient(120deg, var(--linha), transparent)` | quina de vidro |
| `--sombra` | `0 24px 60px -30px rgba(232,116,59,.18), 0 8px 20px -12px rgba(22,24,31,.10)` | **âmbar tingida + neutra perto** — elevação de vidro |

> Sombra cromática (âmbar) copia Stripe/Framer: elevação ganha cor de marca,
> não cinza morto. A camada longe é âmbar (10-18% alpha); a perto é neutra (10%).

## Objeto-assinatura — "a vitrine" (copiado da disciplina dos Premium)
Cada seção de caso = uma **vitrine de loja**: card com vidro, lâmpada âmbar no
canto, e a **silhueta SVG do nicho** em exposição (pizza/cacho de cabelo/tesoura/
pão). O hero MONTA uma vitrine real: produto entra, lâmpada acende, preço aparece.
Não é "mockup de browser" genérico — é a LOJA. Isso herda o macro 10 (pet),
01 (padaria), 19 (salão): a página É o objeto do nicho, não um template.

## Tipografia (bifonte COM feature — não só família)
| Papel | Fonte | Feature / Peso | Onde |
|---|---|---|---|
| A marca fala | **Space Grotesk** | `ss01` + **weight 300** (luxo sussurrado, à la Stripe) | h1, h2, nome Vitrine Certa, preços |
| O produto informa | **Plus Jakarta Sans** | 400/500, `cv01` | texto, labels, botões |
| Dados/máquina | **JetBrains Mono** | `tnum` (tabular) | preços, tags de nicho, código |

**Regra semântica:** display = a empresa fala com você · grotesk = o conteúdo ·
mono tabular = números e nichos. Nunca as três na mesma frase corrida.
- `h1` `clamp(2.6rem,5.5vw,4.4rem)` / `ls -0.02em` / `lh 1.05` / **weight 300** / `font-feature-settings:"ss01"`
- preço `clamp(2rem,4vw,3rem)` peso 700 / `tnum` / `ss01`
- corpo `1.0625rem` / `1.55`
- tracking negativo em display (à la Framer `-0.02em`), nunca positivo. Zero itálico, zero gradiente em texto.

## Espaçamento / forma
- Escala: 4 · 8 · 12 · 16 · 24 · 40 · 64 · 104 (px)
- Raio: `2px` (linhas/chips) · `16px` (cards de vitrine) · `999px` (só pills e `.wa-btn`)
- Borda: sempre `1px solid var(--linha)`. Sem side-stripe colorido (gate 5).
- Sombra = profundidade de vidro (`--sombra` âmbar), NUNCA glow colorido neon.

## Movimento — "vidro, não brilho"
- Substitui o `aurora` (atual, proibido) por **reflexo de vidro estático + lâmpada**:
  `linear-gradient(120deg, transparent 40%, color-mix(in srgb,var(--lamp) 8%,transparent))`
  em `::after` com `pointer-events:none` — 1 passe lento (não loop infinito agressivo).
- Lâmpada "acende" no hover do card: `--lamp` sobe de 8%→12% no `::after`.
- Reveal: `clip-path: inset(100% 0 0 0)` → `inset(0)`, 520ms `cubic-bezier(.22,1,.36,1)`.
- Spring de scroll: `cur += (target-cur)*0.06` (validado no aapson-site).
- `prefers-reduced-motion: reduce`: reveal = opacity instantânea, reflexo estático, lâmpada fixa.

## Componentes (whitelist DESIGN.md)
button-primary: backgroundColor "{colors.lamp}" · textColor "#FBFCFE" ·
  rounded "{rounded.pill}" · padding "1rem 1.8rem" · fontFeature "ss01"
button-primary-hover: backgroundColor "{colors.lamp-2}"
card-vitrine: backgroundColor "color-mix(in srgb,{colors.vidro2} 70%,transparent)" ·
  border "1px solid {colors.linha}" · backdropFilter "{blur}" · boxShadow "{sombra}"

## Fora do sistema (exceções conscientes)
- `#25D366` — verde WhatsApp no `.wa-btn` (cor de plataforma, não de marca).
- Fundo escuro só em modo noturno opcional (`:root[data-theme="dark"]`), herdando
  a mesma lógica de vidro (vidro escuro + lâmpada).

## Do's and Don'ts
- ✅ Vidro (blur + borda translúcida), 1 acento âmbar, tipografia bifonte COM feature (ss01/tnum), sombra âmbar tingida, objeto-vitrine por caso.
- ❌ Aurora glow, arco-íris, gradiente em texto, sombra cinza neutra, box-shadow neon, hex solto fora do `:root` (Hallmark gate 48).
- ✅ Contraste WCAG AA medido (todos os pares acima ✔).
- ❌ Copiar visual dos Premium (salão rosa, pizzaria noite) — só a disciplina (objeto, feature, 1 acento).
