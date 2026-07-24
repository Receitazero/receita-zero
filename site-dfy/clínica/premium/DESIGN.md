# Clínica Premium — "A RESPOSTA HONESTA" · a guia de elegibilidade

Braço **Vitrine Certa** — isolado da AAPSON. Nicho **8 de 8** (o último).
Skill: `site-premium-redesign`. Verificação medida em `scratchpad/clin_check.js`.

---

## 1. A pergunta real do balcão

Todo paciente liga e pergunta a **mesma** coisa: **"atende meu convênio?"** — e todo
site responde a mentira mais barata do setor: *"Sim, atendemos todos os convênios!"*.
Você descobre o contrário no balcão: seu plano não credencia aquela especialidade ali,
ou tem co-participação, ou está em carência. O premium antigo era pior ainda — nem
mencionava convênio: só precificava consulta **particular** (R$ 150 etc.) com um
formulário `especialidade × data × hora`, fingindo que plano não existe.

"A RESPOSTA HONESTA" responde de verdade: diga convênio + especialidade e a clínica
**emite a guia de elegibilidade** — cobre? co-participação? carência? e **qual é a
próxima vaga real** (a de convênio *e* a particular, porque não são a mesma).

---

## 2. Gate de repetição (skill §10) — por que difere dos outros 7

| Eixo | Escolha | Já usado? |
|---|---|---|
| Macroestrutura | **06 Conversational FAQ** (a página É a única pergunta do balcão, respondida) | não |
| Motor | **cobertura / elegibilidade** (a regra de acesso que vira fila) | não — família nova |
| Objeto/costume | **guia de elegibilidade** (papel destacável de autorização) | não |

**Motor "cobertura" vs os anteriores:** tempo (×3) resolve *quando*; dinheiro (imob.)
resolve *quanto*; matéria (lavand.) resolve *o que a coisa é*; quantidade (padaria)
resolve *quanto tem*; o indivíduo (pet) resolve *quem é o ser*. Aqui o sujeito é um
**par (convênio × especialidade)** que casa contra uma **matriz de credenciamento** →
veredito de elegibilidade. O pulo que nenhum concorrente mostra: **cobertura vira
espera** — o mesmo médico tem uma vaga de convênio (mais distante, fila cheia) e uma
particular (mais cedo). O plano não decide só **se**; decide **quando**.

Macro 06 escapa o trio default de clínica (foto de jaleco sorrindo · grade de
especialidades · agende-já). A espinha da página é a **conversa do balcão** que termina
numa **guia emitida** — não um formulário de agendamento.

---

## 3. Costume — "guia de elegibilidade" (o objeto do nicho)

O papel que a recepção de clínica preenche pra checar autorização de plano. Todo mundo
que já usou convênio reconhece.
- **Cabeçalho escuro** (`--azulfundo`) com nome da clínica + **nº de protocolo mono**
  (`ANDIRA-####`) e data de emissão — cara de documento oficial.
- **Serrilha destacável** (`.serr`, bolinhas radiais) logo abaixo do cabeçalho: a guia
  "se destaca" como um comprovante de verdade.
- **Badge de estado** (forma pill com borda + dot) + os campos em linhas pontilhadas
  (convênio, especialidade, valor, carência, profissional).
- **Caixa "próxima vaga"** com a data em serifada + a **comparação honesta** convênio ×
  particular embaixo.
- **Nota honesta** com barra lateral colorida por estado (o "não" explicado em prosa).
- **Carimbo rotacionado de dupla borda** (`SÓ PARTICULAR` / `EM CARÊNCIA`) — forma,
  nunca cor sozinha. Aparece só nos estados de bloqueio.
- **A mesma guia é o hero-eco:** o card de balcão no hero mostra a conversa
  (você pergunta → a maioria dos sites mente → **aqui** responde certo), então a guia
  abaixo é a materialização daquela resposta.

### Macro 06 executada SEM virar chatbot-slop
O card de balcão usa 3 balões (você / concorrência / aqui) só no hero, como **prova
editorial** da diferença — não é um chat interativo de IA. O corpo da página é a
**verificação → guia**, calma e clínica. Zero animação de scroll (o `translateY`/`reveal`
do premium antigo foi removido — era exatamente o slop que a skill combate).

### Fontes (proibida a Fraunces da AAPSON)
- `--disp` **Spectral** (serifada) — a calma documental de laudo médico (títulos, valores, datas).
- `--sans` **Public Sans** — o sans institucional/clínico (prosa, campos, badges).
- `--mono` **Spline Sans Mono** — nº de protocolo, kicker, carimbo (cara de formulário).

---

## 4. Cor = estado (skill §4), nunca cor sozinha

Quatro estados, cada um com **forma + cor** (badge com dot + marca própria na matriz):
- `coberto` (verde `--coberto`) — plano cobre, R$ 0. Marca: quadrado cheio.
- `copart` (âmbar `--copart`) — cobre com co-participação. Marca: círculo cheio + valor R$.
- `carencia` (vermelho `--carencia`) — cobre após liberar; **carimbo `EM CARÊNCIA`**,
  data de liberação, vaga vira particular. Marca: traço.
- `soparticular` (aço `--slate`) — plano **não credencia** aqui; **carimbo `SÓ PARTICULAR`**,
  só particular. Marca: anel vazado. O "não" honesto.
- (`particular` escolhido = badge aço "Particular", sem carimbo — é opção, não bloqueio.)

---

## 5. Paleta azul-clínico e contraste (medido renderizado)

Azul-clínico **reservado desde o nicho 5** (lição 16) — mas executado como **tinta
sobre papel**, não o gradiente-texto neon do premium antigo (`--grad` removido). Um
único azul de acento (`--azul #1A5A9E`), fundo escuro de guia (`--azulfundo`), estados
em verde/âmbar/vermelho/aço. Sem colisão com os outros 7 (nenhum usa azul-clínico + serif).

| Token | Hex | Papel | Piso medido |
|---|---|---|---|
| `--paper` | `#EEF2F6` | página (branco clínico frio) | superfície de texto |
| `--card` | `#FFFFFF` | guia / formulário | superfície de texto |
| `--ink` | `#132335` | tinta quase-preta | 15.9 |
| `--muted` | `#46586B` | secundário | 7.3 |
| `--faint` | `#6E7F90` | legendas | 4.1 texto / 3.7 borda |
| `--azul` | `#1A5A9E` | acento credenciado | 7.0 |
| `--coberto` | `#15743F` | verde estado | 5.8 |
| `--copart` | `#9A5B00` | âmbar co-part | 5.4 |
| `--carencia` | `#A32F49` | vermelho carência | 6.9 |
| `--slate` | `#3D4F60` | aço só-particular | 8.5 |
| `--line2` | `#78899A` | borda de campo | 3.19 paper / 3.59 card |
| — | `#EAF1F8` s/ `--azulfundo` | texto claro no fundo escuro | 10.5 |

**18 pares medidos passam** em 3 superfícies (paper, card, azulfundo). Menor folga:
`line2/paper` 3.19 ≥ 3. Borda de campo tem piso próprio 3:1 (lição 8) — `#93A5B5`
inicial dava 2.53 e reprovava.

---

## 6. Um estado por parâmetro de URL (lição 2)

Serve ao painel de demonstração **e** ao link que o dono manda no WhatsApp:
- `?conv=particular|unimed|bradesco|amil|sulamerica` · `?esp=clinico|cardio|derma|ortoped|gineco|pediatria`
- `?adesao=YYYY-MM-DD` — data de entrada no plano (dispara o cálculo de carência).
- `?agora=HH:MM` — congela a hora (a base é 23/jul/2026 10:30, determinística p/ o print).
- `?demo` — preenche um caso exemplo (SulAmérica / dermato → co-part) + mostra o chip `demo`.

---

## 7. Bloco revendável (o que muda por cliente)

Constante `CASA` no topo do `<script>`: `nome, bairro, wa, abre, fecha`, o objeto
`esp{}` (rótulo, ícone, preço particular, fila-base, profissional) e o objeto
`convenios{}` (o que cada plano **cobre**, `copart` R$, `carencia` dias, `filaMult`).
Trocar de clínica = editar esses dois objetos; o motor `emitir()`, a matriz e o render
se regeneram sozinhos (a tabela e os cards de especialidade são montados de `CASA`).

---

## 8. Armadilhas evitadas (skill §2) + o que o print pegou (lição 11)

- **`reveal`/`translateY` no scroll + `IntersectionObserver`** do premium antigo: removidos
  (era o slop-hallmark). Página calma, sem animação de entrada.
- **Gradiente-texto neon** (`--grad` + `-webkit-background-clip:text`): removido. Azul só
  como tinta sólida de acento.
- **SEO corrompido** (`R<meta…>49` injetado no og/ld+json, igual à padaria/pet): reescrito,
  schema `MedicalClinic`.
- **Bug de vaga nula no estado particular** (só o print/erro pegou): `vagaConv` era `null`
  pra particular → `fmtData(null)` quebrava. Estado particular agora tem ramo próprio no
  motor; badge "Particular", vaga = a particular.
- **`só particular` como badge do particular escolhido**: separado — `particular`
  (opção, badge neutro) vs `soparticular` (bloqueio, carimbo).
- **`<table>` da matriz** vive em `.matriz-wrap` com `overflow-x:auto` → sem scroll-x da
  página de 320 a 1440; só a tabela rola no mobile.
- `prefers-reduced-motion`: mata o `scroll-behavior` e as transições.

Premium antigo preservado em `_v1-booking-tour.html` (`git mv`), nada apagado.

---

## 9. Gate de verificação (rodar antes de fechar)

`node scratchpad/clin_check.js` — 7 estados (coberto, co-part, não-credenciado,
carência bloqueada, carência liberada, particular, demo) sem `pageerror`/console-error,
sem `undefined/NaN/null` na guia · carimbo só nos estados de bloqueio · matriz completa ·
vaga de convênio **mais distante** que a particular (o "quando") · sem scroll-x de 320 a
1440 · zero token AAPSON · **18 pares de contraste ≥ piso**. Print lido a cada checkpoint
(hero, co-part, não-credenciado c/ carimbo, carência, matriz, mobile demo).
