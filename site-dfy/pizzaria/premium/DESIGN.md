# DESIGN.md — Pizzaria Premium · "A NOITE INTEIRA"

Fonte de verdade de tokens. **Nenhum hex solto no CSS** (Hallmark gate 48).
Braço Vitrine Certa / Receita-Zero — **isolado da AAPSON**: sem Fraunces, sem Acid Circuit
(roxo/chartreuse/terra), sem Lenis, sem link pra AAPSON.

```
/* Hallmark · macrostructure: 14 Narrative Workflow · Vitrine Certa / Pizzaria Premium
   tema=hora-do-dia · acento=brasa (único) · display=Instrument Serif · dados=Instrument Sans tabular
   pre-emit critique: P5 H4 E4 S5 R4 V5 */
```

## Princípio de cor

**A cor só existe quando o forno está aceso.** O sistema é quase monocromático; o único
acento cromático é o fogo. Fechado = sem cor. Pico = brasa viva.
Teto: `--brasa` ≤3% da tela à noite, ≤1% de dia. É **luz**, nunca preenchimento de bloco.

## Tokens — NOITE (18:00–00:00)

| Token | Hex | Uso | Contraste s/ fundo |
|---|---|---|---|
| `--tinta` | `#141A2A` | Fundo (azul-noite; não preto, não marrom) | — |
| `--carvao` | `#0C1120` | Chão do forno, rodapé | — |
| `--tinta2` | `#1C2438` | Superfícies elevadas | — |
| `--linha` | `#2B3450` | Bordas 1px | — |
| `--giz` | `#EDEFF5` | Texto principal (branco frio) | 13,9:1 ✔ |
| `--fumaca` | `#98A0B8` | Texto secundário | 5,6:1 ✔ |
| `--brasa` | `#FF5A1F` | Acento único (calor) | 5,4:1 → **≥24px** |
| `--nucleo` | `#FFF1E6` | Núcleo branco-quente do fogo | — |

## Tokens — DIA (00:00–17:00) · "cal e sol"

| Token | Hex | Uso | Contraste |
|---|---|---|---|
| `--tinta` | `#ECEDF1` | Parede caiada (branco frio, **não** creme) | — |
| `--carvao` | `#DDDFE7` | Rodapé | — |
| `--tinta2` | `#F7F8FB` | Superfícies | — |
| `--linha` | `#D3D7E2` | Bordas | — |
| `--giz` | `#141A2A` | Texto (mesma tinta, invertida) | 14,6:1 ✔ |
| `--fumaca` | `#5C6478` | Secundário | 6,2:1 ✔ |
| `--brasa` | `#D6410E` | Brasa escurecida | 4,7:1 ✔ corpo ok |
| `--nucleo` | `#8A2B06` | Núcleo no claro | — |

Crepúsculo: 17:00–18:00 interpola os dois conjuntos via `--dia` (1→0).

## Tipografia

| Papel | Fonte | Pesos | Onde |
|---|---|---|---|
| Voz da casa | **Instrument Serif** | 400 + italic | h1, h2, nomes de pizza, depoimentos |
| Voz do forno | **Instrument Sans** | 400/500/600 `tabular-nums` | relógio, preços, minutos, tabelas, UI |

**Regra semântica:** serifa = a casa fala com você · sans tabular = a máquina reporta.
**Nunca as duas na mesma frase.**

- `h1` `clamp(2.75rem,7vw,5.5rem)` / 0.98 / `ls -0.02em`
- relógio `clamp(3rem,10vw,7rem)` peso 500 / `ls -0.04em` / `tabular-nums`
- corpo `1.0625rem` / 1.55
- Único ornamento permitido: itálico da Instrument Serif. Zero text-shadow, zero gradiente em texto.

## Variáveis de estado (governam a página inteira)

| Var | Faixa | Significado |
|---|---|---|
| `--dia` | 0→1 | 1 = tema claro (dia), 0 = tema escuro (noite) |
| `--calor` | 0→1 | 0 = forno apagado (sem cor), 1 = pico |
| `--noite` | 0→1 | progresso do scroll = a noite passando |

## Espaçamento / forma

- Escala: 4 · 8 · 12 · 16 · 24 · 40 · 64 · 104 (px)
- Raio: `2px` (linhas/chips) · `999px` (só pills de estado e `.wa-btn`)
- Borda: sempre `1px solid var(--linha)`. Sem side-stripe colorido (gate 5).
- Sem `box-shadow` decorativo. Exceção: `.wa-btn` (padrão herdado de `receita-zero-site-build`).

## Movimento

- Spring de interpolação contínua: `cur += (target-cur)*0.06` (0.12 ficou rápido demais — validado no aapson-site)
- Reveal: `clip-path: inset(100% 0 0 0)` → `inset(0)`, 520ms `cubic-bezier(.22,1,.36,1)`
- Brasa: keyframes em 0/17/23/61/79/100%, duração **4,7s** (primo — não fecha loop óbvio)
- `prefers-reduced-motion: reduce`: `--noite` por degrau, brasa estática, reveal = opacity instantânea

## Fora do sistema (exceções conscientes)

- `#25D366` — verde WhatsApp no `.wa-btn`. Cor de plataforma, não de marca.
