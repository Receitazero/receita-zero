# DESIGN.md — Oficina Premium · "VOCÊ VÊ O QUE A GENTE VÊ"

Fonte de verdade de tokens. Nenhum hex solto fora do `:root` (Hallmark gate 48).
Braço Vitrine Certa / Receita-Zero — **isolado da AAPSON**: sem Fraunces, sem Acid Circuit.
Também **sem Instrument Serif/Sans** — essas são da pizzaria; nichos não se repetem.

```
/* Hallmark · macrostructure: 05 Workbench · Vitrine Certa / Oficina Premium
   governado por=input(placa) · cor=codigo de status, sem cor de marca
   display=Archivo Expanded · dados=IBM Plex Mono
   pre-emit critique: P5 H4 E4 S5 R4 V5 */
```

## Princípio de cor

**Esta oficina não tem cor de marca.** Todos os outros 7 nichos têm um par cromático; este é o
único neutro. A identidade é a **grade e a tipografia**. A cor existe apenas como **código de
status** — do jeito que aparece numa oficina de verdade: marcação de piso, etiqueta de peça,
luz de painel. Status nunca vira fundo de seção; vive em pastilha, linha de laudo e trilho.

Aprendido da Vestre (via SiteInspire): **o industrial vem de honestidade estrutural, não de
fantasia de galpão.** Proibido: chapa xadrez, textura de graxa, fita zebrada, ícone de chave
inglesa, fundo de fibra de carbono.

## Tokens — base neutra

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--concreto` | `#E9E7E2` | Fundo. Cinza morno de piso polido — **não é creme** | — |
| `--concreto2` | `#DCD9D2` | Faixas, cabeçalho de tabela, superfície elevada | — |
| `--risco` | `#C9C6BF` | Linhas de grade 1px | — |
| `--grafite` | `#191C21` | Texto principal e blocos escuros | 14,9:1 ✔ |
| `--fumo` | `#5E646E` | Texto secundário | 5,8:1 ✔ |
| `--giz` | `#F5F4F1` | Texto sobre blocos de grafite | 14,1:1 ✔ |

## Tokens — código de status (a única cor da página)

Contraste aferido em pixel **sobre `--giz` (`#F5F4F1`)**, que é a superfície mais clara da
página — é onde a ficha e o laudo vivem. Aferir sobre `--concreto` mentia por ~1 ponto.

| Token | Hex | Significado | Sobre `--giz` |
|---|---|---|---|
| `--aguardando` | `#8F5A05` | aguardando sua aprovação | 5,26:1 ✔ |
| `--exec` | `#2A6288` | em execução / em teste | 5,96:1 ✔ |
| `--pronto` | `#256B44` | pronto para retirada | 5,85:1 ✔ |
| `--urgente` | `#A3372A` | achado urgente no laudo | 6,09:1 ✔ |

Teto: cor de status ≤ 6% da tela. Se passar disso virou dashboard.

## Tipografia

| Papel | Fonte | Pesos | Onde |
|---|---|---|---|
| Voz da oficina | **Archivo** (eixo `wdth` expandido nos títulos) | 500/600/700 | h1, h2, rótulos de seção |
| Voz do dado | **IBM Plex Mono** | 400/500 | placa, nº de OS, hora, preço, código de peça, bancada |

**Regra semântica:** *grotesk = gente falando · mono = o que está escrito na ordem de serviço.*
**Placa nunca sai em grotesk.** Mono é informação, nunca enfeite "tech" — contraponto anotado da
Polybion, que num tema técnico não usa mono nenhuma.

- `h1` `clamp(2.4rem,5.5vw,4.4rem)` / .96 / `ls -.03em` / `wdth 112` / caixa alta
- número grande (lição da Mærsk) `clamp(2.6rem,6vw,4.6rem)` mono 500 `ls -.04em`
- corpo `1rem` / 1.6
- Zero itálico. Zero text-shadow. Zero gradiente em texto.

## Espaçamento / forma

- Escala: 4 · 8 · 12 · 16 · 24 · 40 · 64 · 104
- **Raio 0** em tudo. Nada arredondado — exceto pastilha de status e `.wa-btn` (999px).
  A quina viva é metade da identidade.
- Borda: `1px solid var(--risco)`. Sem sombra decorativa.
- Grade de blueprint no fundo: linhas a cada 32px, `--risco` a 35% de opacidade.

## Movimento — input-driven, não scroll-driven

Contraste deliberado com a pizzaria, onde o scroll era o motor. Aqui quase nada anima no
scroll; o orçamento de movimento vai para o momento da consulta.

- Ficha monta linha a linha: stagger 40ms, `clip-path` horizontal
- Trilho de estágios preenche por `stroke-dashoffset` (transição, nunca loop)
- Spring de interpolação contínua: `cur += (target-cur)*0.06`
- `prefers-reduced-motion`: tudo vira troca instantânea; a ficha continua correta

## Fora do sistema (exceções conscientes)

- `#25D366` — verde WhatsApp no `.wa-btn`. Cor de plataforma, não de marca.
