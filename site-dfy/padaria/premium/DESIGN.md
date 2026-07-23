# Padaria Premium — "SAIU AGORA" · fonte de verdade de design

Braço **Vitrine Certa** — isolado da AAPSON. Nicho 6 de 8.
Skill: `site-premium-redesign`. Verificação medida em `scratchpad/pad_check.js`.

---

## 1. O que este site responde (a pergunta real do balcão)

Padaria de bairro no WhatsApp recebe uma pergunta, o dia inteiro: **"tem X agora?"**.
Todo site de padaria mostra foto de pão e tabela de preço — nenhum responde isso.

"SAIU AGORA" lê a hora e, pra cada item, resolve **em que fornada estamos, quanto já
vendeu, quanto resta, e quando sai a próxima**. E quando acabou, diz **"ACABOU — próxima
fornada às HH:MM"** antes do cliente sair de casa. Esse "não" honesto é o que justifica o
premium (lição 4 da skill): o concorrente de R$49 nunca economiza a viagem do cliente.

---

## 2. Gate de repetição (skill §10) — por que este é diferente dos outros 5

| Eixo | Escolha | Já usado? |
|---|---|---|
| Macroestrutura | **01 Bento Grid** | não (pizzaria=14, oficina=05, salão=19, imobiliária=04, lavanderia=13) |
| Motor | **quantidade / fornada** (o que a coisa TEM) | não — abre família nova (tempo×3, dinheiro×1, matéria×1) |
| Objeto/costume | **saco de pão kraft** | não |

Bento Grid escapa o **trio default de comida** (Photographic · Long Document · Catalogue) —
que é exatamente o que faz todo site de padaria ser igual. A página abre pela **vitrine
viva**, peças de tamanhos diferentes, cada uma com seu estado carimbado — não por hero
fotográfico → preço → encomenda.

---

## 3. Costume — "saco de pão kraft" (`data-costume="kraft"`)

Papel pardo manila + **listra vermelha clássica de padaria** + tipografia de **carimbo de
borracha**. Distinto da etiqueta tecida da lavanderia (nicho 5) em 4 eixos deliberados:

| Eixo | Lavanderia (etiqueta) | Padaria (saco) |
|---|---|---|
| Papel/tecido | ecru tecido (trama) | pardo kraft (grão grosso de papel) |
| Acento | anil (azulante) | carmim (listra de padaria) |
| Marca no material | costura / overlock | carimbo de borracha rotacionado |
| Tipo de traço | pontos de costura | tinta chapada e uppercase |

Grão do papel = `repeating-linear-gradient` sutil no `body`. `.faixa` = a listra vermelha.
`.carimbo` = selo ACABOU (dupla borda vermelha rotacionada — forma, nunca cor sozinha).

### Fontes (proibidas as dos outros nichos, e a Fraunces da AAPSON)
- `--cond` **Big Shoulders Display** — o carimbo **dá o estado** (uppercase, condensada).
- `--sans` **Hanken Grotesk** — a padaria **explica** (prosa, preço, horário).
- **Fraunces REMOVIDA** (era do premium antigo; é fonte de marca AAPSON → viola isolamento).

---

## 4. Cor = estado (skill §4), nunca cor sozinha

O vapor (`.steam`) **só existe** quando um item acabou de sair do forno (`s==='saiu'`, <12min)
— governado pela var `--quente`, não pelo scroll. Quando um item **ACABOU**, ele **perde a
cor** e ganha uma **forma** (o carimbo vermelho), não só um tom — legível sem enxergar cor.

Estados: `saiu` · `quentinho` · `vitrine` · `acabando` (≤22% da fornada) · `acabou`.

---

## 5. Paleta manila e contraste (medido renderizado)

Pivô no build (23/jul): a 1ª paleta era kraft **médio** na página (`--saco:#B58A57`) e reprovou
4 pares de contraste (texto claro e cards sobre fundo médio). Solução: **página manila clara**,
mantendo **kraft escuro** só onde há texto claro (CTA/rodapé). Contraste se mede em **dois
lugares**: a página (`--saco`) e a superfície da etiqueta (`--rotulo`).

| Token | Hex | Papel | Piso onde é medido |
|---|---|---|---|
| `--saco` | `#E0CDA2` | página (manila claro) | superfície de texto |
| `--rotulo` | `#F4ECD8` | superfície da etiqueta | superfície de texto |
| `--rotulo2` | `#E9DBBD` | etiqueta secundária | — |
| `--saco2` | `#A87C48` | saco do hero (decorativo) | — |
| `--escuro` | `#6E4F2C` | CTA e rodapé (fundo escuro) | superfície de texto claro |
| `--vinco2` | `#83693F` | borda de campo / nav | 3:1 não-texto |
| `--tinta` | `#241B0E` | texto/carimbo preto | 4.5 |
| `--fumo` | `#5A4526` | texto secundário | 4.5 |
| `--carmim` | `#9E2415` | listra, carimbo ACABOU | 4.5 (texto) |
| `--forno` | `#A85608` | brasa (SAIU/quentinho, display) | 3 (large) |
| `--zap` | `#0F5E30` | verde WhatsApp (texto no botão) | 4.5, medido em `--saco` |

Todos os 14 pares medidos passam (menor folga: `vinco2/saco` borda 3.31 ≥ 3; `forno/saco`
large 3.36 ≥ 3; `rotulo82/escuro` rodapé 4.89 ≥ 4.5). `.tab-wrap` (`overflow-x:auto` +
`table{min-width:520px}`) evita overflow do quadro de fornadas em 320px.

---

## 6. Um estado por parâmetro de URL (lição 2)

Servem ao painel de demonstração **e** ao link que a dona manda no WhatsApp:

- `?item=<id>` — seleciona a peça e desce até a etiqueta
- `?ver=fornadas` — abre/desce até o quadro de fornadas
- `?agora=HH:MM` — congela a hora (print / foto de estado)
- `?demo` — acelera o dia (20 min de padaria por segundo real)

---

## 7. Bloco revendável (o que muda por cliente)

Toda a config numa constante `CASA` no topo do `<script>`: `nome`, `wa`, `abre`, `fecha`, e
`itens[]` (cada um: `id, nome, tipo, preco, rende, vendeEm, fornadas[], nota`). `TAMANHO`
mapeia quais itens ganham tile grande/wide no bento. Trocar de padaria = editar um bloco.

---

## 8. Armadilhas evitadas (skill §2)

- **Foto de pão em close** ("iguala todo site"): zero fotos — silhuetas SVG por tipo.
- **translateY + IntersectionObserver de template**: removido; a única animação é o vapor,
  governado pela matéria (item saiu do forno), não pelo scroll.
- **Texto em gradiente na marca** (assinatura de landing): removido.
- **SEO corrompido** do arquivo antigo (`R<meta…>49` injetado): reescrito limpo, schema `Bakery`.
- **`prefers-reduced-motion`**: mata o vapor.

O premium antigo foi preservado em `_v1-encomenda-preco.html` (`git mv`), nada apagado.

---

## 9. Gate de verificação (rodar antes de fechar)

`node scratchpad/pad_check.js` — 0 pageerror em 8 horas do dia · 7 itens resolvem estado sem
`undefined`/`NaN` · carimbos ACABOU crescem 0→3 ao longo do dia (honesto) · sem scroll-x de
320 a 1440 · zero token AAPSON · hex fora do `:root` só as cores do SVG do saco · 14 pares de
contraste ≥ piso. Print lido a cada checkpoint (lição 11).
