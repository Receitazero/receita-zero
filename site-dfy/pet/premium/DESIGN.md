# Pet Premium — "DO JEITO DELE" · a carteirinha do bicho

Braço **Vitrine Certa** — isolado da AAPSON. Nicho 7 de 8.
Skill: `site-premium-redesign`. Verificação medida em `scratchpad/pet_check.js`.

---

## 1. A pergunta real do balcão

Tutor no WhatsApp pergunta, o dia inteiro: **"quanto é o banho do meu cachorro?"** — e a
resposta honesta é *"depende do cachorro"*. Porte, pelo, temperamento e idade mudam o serviço,
o tempo, o preço e **quem põe a mão**. Todo site de pet responde com uma tabela `porte×serviço`
(o simples E o premium antigo faziam exatamente isso). Nenhum diz o **"não"** que justifica o
premium (lição 4): "seu cão é reativo → a gente vê pessoalmente antes, não agenda online" ·
"idoso 8+ → banho morno, sem secador quente". O barato aceita qualquer cão por qualquer preço.

"DO JEITO DELE" preenche o bicho e **emite a carteira dele**: serviço, tempo real na casa,
preço, tosador designado, protocolo de cuidado e o veredito de estado.

---

## 2. Gate de repetição (skill §10) — por que difere dos outros 6

| Eixo | Escolha | Já usado? |
|---|---|---|
| Macroestrutura | **10 Card/Profile** (a página É uma carteirinha) | não |
| Motor | **o indivíduo** (porte × pelo × temperamento × idade → tudo) | não — família nova |
| Objeto/costume | **carteira de banho & tosa + tag de coleira metálica** | não |

**Motor "o indivíduo" vs "matéria" da lavanderia** (a adjacência mais próxima): na lavanderia
o sujeito é uma peça inerte classificada por símbolos ISO → veredito sai/não sai. Aqui o sujeito
é um **ser vivo com temperamento e nome**, e a saída inclui **quem cuida** e um **protocolo de
segurança** (o eixo de confiança), não só um preço. Famílias de motor agora: tempo×3, dinheiro,
matéria, quantidade, **indivíduo**.

Macro 10 escapa o **trio default de pet** (fotos de bicho fofo · grade de serviços · depoimentos).
A espinha da página é a própria **ficha que se emite**.

---

## 3. Costume — "carteira de banho" (`data-costume` implícito)

Caderneta de vacinação com a **foto do cão** + carimbo de documento. Artefato que todo dono reconhece.
- **Capa berry** (`--capa`) com kicker carimbado.
- **A foto do cão na carteirinha**: ilustração autoral (golden, tons quentes, `url(#gold)`)
  num porta-retrato Polaroid inclinado, com cantoneiras de foto e **carimbo-selo de pata** no
  canto (referência robertaspizza: desenho autoral vence foto/blob). A **legenda viva** grava
  nome + porte embaixo; uma **plaquinha de aço na coleira** com ponto que muda de cor com o
  estado (verde=vaga · rosa=cuidado · aço=avaliar). *(A v1 do hero era só uma tag de aço gravada —
  lia como um borrão cinza; trocada pela foto do bicho, que é o que a carteirinha realmente tem.)*
- **O cão SE REDESENHA com a ficha (o UAU do motor "o indivíduo"):** os 4 eixos mudam a
  ilustração, não só a legenda. **Pelo = FORMA da orelha** (curto/médio = caída · longo = orelha
  longa ondulada recortada na moldura · duplo = juba fofa + orelha pontuda); **temperamento =
  POSIÇÃO da orelha + expressão** (tranquilo sorri · agitado ofega língua pra fora · medroso
  orelha pra trás + sobrancelha preocupada + boca fechada · reativo orelha ereta + testa franzida
  + dentinhos); **idade** (filhote = olhos maiores · idoso = focinho grisalho); **porte** = escala.
  Anatomia aterrada em **refs Pollinations (R$0)** usadas só como olho (§5.1 da skill), nunca como
  asset — o desenho continua vetor e reativo.
- **A mesma carteirinha aparece 2×** (hero + ao lado dos chips) via `<symbol>`/`<use href="#cart">`:
  o JS mexe num único `#cart` e as duas cópias atualizam juntas — assim você **vê o cão mudar
  enquanto preenche**, sem duplicar lógica nem colidir ids. O desenho é recortado na janela da
  foto (`clipPath #pw`), então orelha/juba que passam da moldura são cortadas como num retrato real.
- **Páginas porcelana pautadas** — `repeating-linear-gradient` no `body` (as linhas da caderneta).
- **Carimbo "AVALIAR ANTES"** (dupla borda de aço rotacionada) = forma, nunca cor sozinha.

### Fontes (proibida a Fraunces da AAPSON, que estava no premium antigo)
- `--disp` **Bricolage Grotesque** — oficialidade de documento (títulos, gravação, carimbo).
- `--sans` **Instrument Sans** — a casa explica (prosa, campos, protocolo).
- **Fraunces + Baloo 2 REMOVIDAS** (Fraunces é fonte de marca AAPSON → viola isolamento).

---

## 4. Cor = estado (skill §4), nunca cor sozinha

Três estados, cada um com **forma + cor**, legível sem enxergar cor:
- `ok` (verde `--vaga`) — pode hoje; a frase conta as vagas do porte.
- `cuidado` (rosa `--cuidado`) — agendável, com protocolo especial (idoso / medroso).
- `avaliar` (aço `--metal`) — reativo: **carimbo** aparece, preço vira "sob avaliação",
  tempo vira "avaliar", tosador vira a sênior. O "não" honesto, com forma própria.

O ponto de esmalte da tag acompanha o estado. Sem animação de scroll — nada de `translateY`.

---

## 5. Paleta carteirinha e contraste (medido renderizado)

Berry (não teal — teal é petshop base + lavanderia; azul-clínico **reservado pra clínica**,
o próximo nicho). Rosa/verde/aço como estados. Sem colisão com os outros 7.

| Token | Hex | Papel | Piso medido |
|---|---|---|---|
| `--porcelana` | `#EEEAE1` | página | superfície de texto |
| `--ficha` | `#F7F4ED` | card da ficha | superfície de texto |
| `--capa` | `#5A2440` | capa/CTA/head da ficha (fundo escuro) | superfície de texto claro |
| `--tinta` | `#22171D` | texto quase-preto | 4.5 |
| `--fumo` | `#574A52` | texto secundário | 4.5 |
| `--vaga` | `#1C7A44` | verde coleira (estado ok) | 4.5 texto / 3 borda |
| `--cuidado` | `#A8324F` | rosa (estado cuidado, "não" do protocolo) | 4.5 |
| `--metal` | `#3C4550` | aço da tag / carimbo | 4.5 texto / 3 borda |
| `--linha2` | `#8A7F6D` | borda de campo | 3 não-texto |

**18 pares medidos passam**, em 3 superfícies (porcelana, ficha, capa) + as caixas de estado
tingidas. Menores folgas: `linha2/porcelana` 3.28 ≥ 3 · `linha2/ficha` 3.58 ≥ 3 ·
`vaga/ficha` 4.88 ≥ 4.5. Texto claro na capa berry: `porcelana/capa` 9.93.

---

## 6. Um estado por parâmetro de URL (lição 2)

Serve ao painel de demonstração **e** ao link que o dono manda no WhatsApp (o cão já vem preenchido):
- `?porte=P|M|G|GG` · `?pelo=curto|medio|longo|duplo` · `?temp=tranquilo|agitado|medroso|reativo`
  · `?idade=filhote|adulto|idoso` — reconstroem a carteira e descem até ela.
- `?agora=HH:MM` — congela a hora (as vagas do dia dependem dela).
- `?demo` — preenche um cão exemplo (Meg, GG/duplo/medroso/idoso), mostra o badge.

---

## 7. Bloco revendável (o que muda por cliente)

Constante `CASA` no topo do `<script>`: `nome, bairro, wa, abre, fecha, tosadores{}, vagasDia{}`.
Tabelas `PRECO_PORTE`, `MIN_PORTE`, `PELO`, `TEMP`, `IDADE` são a régua do negócio. Trocar de
pet shop = editar esses blocos; o motor `emitir()` e o render não mudam.

---

## 8. Armadilhas evitadas (skill §2) + o que o print pegou (lição 11)

- **Glow aurora** (`body::before` radial + `@keyframes glow{translateY}`) do premium antigo: removido.
- **Tabela `porte×serviço`** (mesma espécie do simples): substituída por **ficha do indivíduo**.
- **SEO corrompido** (`R<meta…>49` injetado, igual à padaria): reescrito, schema `PetStore`.
- **Carimbo sobre a barra da ficha** (o bug da oficina, lição 11): reposicionado pra área vazia
  entre a caixa de estado e o botão — só apareceu no print, passou em 100% dos números.
- **Linha de protocolo contraditória** ("sem cuidado extra, rapidinho" num cão que morde):
  no estado `avaliar` a lista de protocolo fica vazia.
- **`<table>`** não há; grids usam `.tab-wrap` onde poderia estourar. Sem scroll-x 320–1440.
- `prefers-reduced-motion`: mata as transições.

Premium antigo preservado em `_v1-avatar-calc.html` (`git mv`), nada apagado.

---

## 9. Gate de verificação (rodar antes de fechar)

`node scratchpad/pet_check.js` — 6 combinações (incl. 2 reativas → presencial) sem `pageerror`,
sem campo `undefined/NaN/R$ vazio` · carimbo só no estado `avaliar` · vagas por porte caem ao
longo do dia e **GG lota** de tarde (o "não") · sem scroll-x de 320 a 1440 · zero token AAPSON ·
hex fora do `:root` só as cores do SVG do aço/esmalte · **18 pares de contraste ≥ piso**.
Print lido a cada checkpoint (desktop cuidado + desktop avaliar + mobile demo).
