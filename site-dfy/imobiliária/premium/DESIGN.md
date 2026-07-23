# DESIGN.md — Imobiliária Premium · "O PREÇO INTEIRO"

Fonte de verdade de tokens. Nenhum hex solto fora do `:root` (Hallmark gate 48).
Braço Vitrine Certa / Receita-Zero — **isolado da AAPSON**.

```
/* Hallmark · macrostructure: 04 Stat-Led · Vitrine Certa / Imobiliária Premium
   governado por=orçamento mensal (dinheiro) · objeto=uma conta de mês
   display=Newsreader · dados=Space Grotesk tabular
   pre-emit critique: P5 H5 E4 S4 R5 V5 */
```

## Por que este arquivo existe

O premium anterior (`_v1-catalogo-ouro.html`) era o simples **escurecido e invertido**:
mesmo ouro (`#C9A24B` → `#E0A63C`), fundo bege virando marrom. E a estrutura era o trio
default do domínio — hero foto → catálogo → mapa → CTA — que é o que todo site de
imobiliária faz. Nada ali justificava R$ 149.

**Diferença de espécie, não de grau:** o R$ 49 lista imóveis. Este soma a conta e diz
quais você não deve visitar.

## Princípio de cor — "segunda via de um contrato"

Cinza frio de formulário, de propósito longe de tudo que já existe no portfólio: a
pizzaria é creme, o salão é papel argila **quente**, o simples desta imobiliária é
bege + ouro. Um acento só, e ele é do dinheiro.

| Token | Hex | Uso | Contraste sobre `--via` |
|---|---|---|---|
| `--papel` | `#EDEFF2` | fundo | — |
| `--via` | `#FFFFFF` | a conta — é uma folha. **É aqui que o contraste se mede** | — |
| `--papel2` | `#E2E7ED` | superfície secundária, moldura da foto | — |
| `--linha` | `#C6CDD6` | fio de 1px | — |
| `--linha2` | `#7F8B9B` | **borda de campo e pontilhado** | 3,46:1 ✔ (mínimo de componente é 3) |
| `--tinta` | `#141C27` | texto | 17,14:1 ✔ |
| `--fumo` | `#5B6675` | secundário e tudo que "perdeu a cor" | 5,83:1 ✔ · 5,06:1 sobre `--papel` ✔ |
| `--cofre` | `#0F5A4A` | **único acento** — só o número que importa | 8,13:1 ✔ · 7,06:1 sobre `--papel` ✔ |

Teto: acento em ≤ 6% da tela. Fora do sistema: `#25D366` (ponto verde do WhatsApp —
cor de plataforma, não de marca).

**"Não cabe" não ganha vermelho: perde a cor.** Evita o par verde/vermelho (ruim para
daltônico) e mantém um acento só. **Perde com token, nunca com `opacity`** — a `.55` o
texto caía para **3,70:1**, e é justamente a linha que explica por que a visita não vale.
Com `--fumo` fica 5,06:1. Foi a lição nº 1 da skill batendo pela terceira vez.

## Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| A imobiliária fala | **Newsreader** (serifa de documento, não de revista) | h1, h2, rótulo do total |
| A conta soma | **Space Grotesk** com `tabular-nums` | todo valor, prazo e medida |

**Regra semântica:** *serifa = gente e escolha · grotesk tabular = dinheiro.*

Proibidas: Fraunces e a paleta Acid Circuit (AAPSON) · Instrument (pizzaria) · Archivo e
IBM Plex Mono (oficina) · Gloock e DM Sans (salão) · Anton e Inter (queimadas) ·
Playfair e Bodoni (default de revista).

## Forma — a assinatura é o sistema de fios

- Pontilhado de fatura entre rótulo e valor (`.pontos`), **fio duplo** acima do total.
  Nenhum outro nicho tem isso, e não se copia de um print: é sistema.
- Raio 2px. Oficina é 0, salão é 3 — nenhuma folha se lê como a outra.
- Escala: 4 · 8 · 12 · 16 · 24 · 40 · 64 · 104.

## Movimento — governado pelo dinheiro, não pelo scroll

Pizzaria: motor = hora. Oficina: consulta. Salão: duração. Aqui: **o orçamento**.

Uma animação só: `@keyframes imprime` (260 ms, escalonado 50 ms por linha), as linhas da
conta descendo até o total. Frase de negócio: *"é a conta sendo somada na sua frente."*
`prefers-reduced-motion` → aparece pronta, com os mesmos números (verificado: 5 linhas,
total R$ 1.821, opacidade 1).

## Decisões de honestidade (é o produto, não o enfeite)

- **Cada linha diz quem paga por lei.** IPTU e seguro incêndio são do proprietário
  (art. 22, VIII) e chegam ao inquilino por cláusula de repasse. Está escrito na conta.
- **A caução usa o teto legal de 3 aluguéis**, não uma estimativa otimista — o número
  nunca surpreende para cima. E a página diz que ela volta corrigida: é depósito, não taxa.
- **Só uma garantia pode ser exigida** (art. 37, parágrafo único). A letra miúda avisa que
  pedir caução *e* fiador é irregular — inclusive contra a própria imobiliária.
- **O motivo do "não cabe" nomeia a linha culpada:** "cabe no aluguel, não cabe no
  condomínio: R$ 480 por mês, todo mês" vale mais que "estoura R$ 21".
- **O hero é calculado do acervo**, não digitado: mude um imóvel e o número muda junto.
  Vanity metric é número que não se move.
- **A foto vem depois do preço**, dentro da conta. É deliberado: foto primeiro é o que
  todo concorrente faz.
- **`?im=` desce até a conta**, não ao topo. Quem abre o link do corretor pediu aquele
  imóvel — obrigar a procurar de novo é desperdício.

## Armadilhas que só a medição pegou

1. `--linha2` em `#9BA6B4` dava **2,47:1** — reprova como borda de campo (mínimo 3).
   Escurecido para `#7F8B9B` → 3,46:1.
2. `opacity:.55` na linha "não cabe" derrubava o texto para **3,70:1**. Trocado por token.
3. `.foto img` com `aspect-ratio:4/3` era **ignorado**: os atributos `width`/`height` do
   `<img>` viram altura definida na folha do navegador. A foto saía retrato. Precisa de
   `height:auto` junto.
4. Sem `#lista` + `scroll-margin`, os cinco quadros do painel ficavam **idênticos** — o
   hero ocupava a miniatura inteira e a barra sticky comia o primeiro imóvel.

## Perfis de cor — arquitetos brasileiros (seletor no topo)

Cinco perfis, trocáveis ao vivo pelo seletor no topo da página e por `?tema=`. **Só a
cor muda** — fontes (Newsreader + Space Grotesk), escala e forma são fixas: é a mesma
conta em papéis diferentes. Cada perfil é um bloco `[data-tema]` que sobrescreve os oito
tokens de cor e **passa pelos mesmos pisos medidos** (`--fumo` e `--cofre` ≥ 4,5:1 sobre
`--via` e sobre `--papel`; `--linha2` ≥ 3:1). Um acento só por perfil.

Não é toggle para o inquilino — é **perfil de configuração**: o corretor escolhe um e o
`?tema=` viaja no link (mesma lógica de `?ate=`/`?im=`). O switcher ao vivo existe para o
showcase da Vitrine Certa.

| Perfil | Arquiteto | Acento (`--cofre`) | `--cofre/via` | `--cofre/papel` | menor razão |
|---|---|---|---|---|---|
| Concreto *(default)* | Paulo Mendes da Rocha | `#0F5A4A` cofre-verde | 8,13 | 7,06 | 3,46 (linha2) |
| Curvas | Oscar Niemeyer | `#17439B` cobalto | 8,85 | 7,84 | 3,75 |
| Granilite | Artacho Jurado | `#0C665C` teal | 6,36 | 5,70 | 3,82 |
| MASP | Lina Bo Bardi | `#B4122B` vermelho | 6,29 | 5,50 | 3,94 |
| Calçada | Burle Marx | `#1E6B34` verde tropical | 6,55 | 5,76 | 4,01 |

Medido nos 5 perfis (Playwright): nenhuma razão reprova. **Artacho** tem tie local — ele
construiu boa parte da orla de Santos nos anos 50, do lado de São Vicente. **Lina**: o
vermelho lidera os números que cabem; o "estoura" segue cinza/riscado, então não há par
vermelho/verde. Confirmado no print, não só no número (lição 11).

## Fora do sistema (exceções conscientes)

- `#25D366` — verde do WhatsApp no `.wa-btn` (todos os perfis).
