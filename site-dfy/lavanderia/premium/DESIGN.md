# DESIGN.md — Lavanderia Premium · "SAI OU NÃO SAI"

Costume: **etiqueta têxtil**. A página inteira é uma etiqueta de conservação costurada.
Braço Vitrine Certa / Receita-Zero — **isolado da AAPSON**.

```
/* Hallmark · macrostructure: 13 Index-First · Vitrine Certa / Lavanderia Premium
   costume=ETIQUETA TÊXTIL · objeto=a etiqueta ISO 3758
   voz=Barlow Condensed (caixa alta, tecida) · prosa=Barlow · acento=anil (overlock) */
```

## Por que este arquivo existe (o segundo redesign)

O v1 (`_v1-simulador-kg.html`) era o simples com slider: mesma mecânica (custo por kg),
paleta verde-menta escurecida, motion de template. Substituído por "SAI OU NÃO SAI" —
o veredito de mancha × fibra, com o "não sai" dito na cara.

**A primeira versão do redesign passou por todos os gates medidos e mesmo assim leu como
"sem personalidade"** (feedback da dona da conta). O mecanismo estava certo; faltava
**costume**. A correção não foi mexer no motor — foi vestir a página com o **objeto do
nicho**: a etiqueta de roupa. Substrato de fita crua, costura de overlock em anil como
borda protagonista, tipografia condensada de etiqueta em caixa alta, e os **símbolos ISO
3758 ampliados** como sistema visual (tira do hero + legenda + etiqueta de cada peça).

## Princípio de cor — "fita crua e overlock anil"

Longe dos outros nichos: pizzaria creme/noite, oficina concreto, salão argila quente,
imobiliária cinza-azulado. Aqui, **fita de algodão cru** (ecru quente) com **um acento só:
anil** — o azulante de lavanderia, e a cor da linha de overlock.

| Token | Hex | Uso | Contraste sobre `--etiqueta` |
|---|---|---|---|
| `--fita` | `#E7DECB` | fundo — fita crua (trama sutil em `repeating-linear-gradient`) | — |
| `--etiqueta` | `#F4EFE2` | superfície da etiqueta. **contraste se mede AQUI** | — |
| `--etiqueta2` | `#DED3BC` | superfície secundária | — |
| `--linha` | `#CDC1A6` | fio de 1px tracejado | — |
| `--linha2` | `#877A5B` | **costura e borda de campo** | 3,68:1 ✔ (piso de componente é 3) |
| `--tinta` | `#221C11` | fio escuro tecido (texto) | 14,72:1 ✔ |
| `--fumo` | `#6A5E46` | secundário e o "não sai" que perde a cor | 5,54:1 ✔ · 4,76 sobre `--fita` ✔ |
| `--anil` | `#243E82` | **único acento** — overlock, X de proibição, SAI, WhatsApp | 8,77:1 ✔ · 7,53 sobre `--fita` ✔ |

**"Não sai" não ganha vermelho: perde a cor** (`--fumo`) e ganha o **X do próprio padrão
ISO** (desenhado em `--anil`). Perde com token, nunca com `opacity`.

Fora do sistema: `#25D366` (ponto verde do WhatsApp).

## Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| A etiqueta fala | **Barlow Condensed** (caixa alta, tracking, condensada industrial) | h1, veredito, rótulos, dados, símbolos |
| A lavanderia explica | **Barlow** (humanista, mesma superfamília) | prosa (`.porque`, `.caso`, `.cuidado`), tabela |

Proibidas: Fraunces + Acid Circuit (AAPSON) · Instrument (pizzaria) · Archivo + IBM Plex
Mono (oficina) · Gloock + DM Sans (salão) · Newsreader + Space Grotesk (imobiliária) ·
Anton + Inter · Playfair + Bodoni · Bricolage + Literata (v1 desta lavanderia, arquivado).

## Forma — a assinatura é a costura

- **Overlock**: `.sew` = borda sólida `--linha2` com tracejado `--anil` por dentro (`::before`
  inset). A etiqueta principal usa a `.costura` SVG animada (`@keyframes agulha`, a linha
  sendo dada quando a combinação muda — governada pela matéria, não pelo scroll).
- **Símbolos ISO 3758** desenhados em SVG inline (não terceirizados): tira ampliada no hero,
  legenda educativa, e a etiqueta real de cada peça. O X é do padrão — proibição em qualquer país.
- Raio 2px. `prefers-reduced-motion` → costura pronta.

## Decisões de honestidade (é o produto)

- **O veredito diz "não sai" na cara**, com o porquê químico em prosa (corante = fibra tingida;
  poliéster oleofílico; enzima come proteína da fibra tanto quanto da mancha).
- **Peça recusada é peça sem conta**: "não cobramos". Couro vai para a oficina certa.
- **O calor é modificador, não eixo**: só rebaixa proteína/tanino, nunca condena — e avisa.
- **Os símbolos são os reais da etiqueta da peça**, não decoração: educam a pessoa a ler a
  própria roupa (seção legenda) — o objeto do nicho vira serviço.

## Armadilhas que a medição pegou

1. A **tabela de preços estourava a 320px** (354px num viewport de 320) — nenhum outro teste
   acusou, só o `scrollWidth`. Envolvida em `.tab-wrap{overflow-x:auto}`: a tabela larga rola
   na própria caixa, o corpo da página não.
2. `aspect-ratio` nas fotos precisa de `height:auto` junto (os atributos `width`/`height` do
   `<img>` viram altura definida) — mesma lição dos outros nichos.
