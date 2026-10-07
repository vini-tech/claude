# Catálogo 03: Deep Dark e Cidade Ancestral

Status: **aprovado**.

Nomes de itens novos em inglês. Tiers conforme `DESIGN.md`.

## A assinatura do Deep Dark

- **Experiência** = o sculk se alimenta da experiência dos mobs que morrem perto dele.
  Usamos o Experience Nugget do Create, que sai ao triturar minérios.
- **Som e vibração** = sensores, gritadores e o Warden reagem a barulho.
- **Ametista** = no vanilla, a ametista ressoa com vibrações (sensor calibrado).
- **Silêncio** = é preciso se esgueirar no Deep Dark.

## O portão do Deep Dark: Dioptase e a Echo Chamber

- **Dioptase Ore** (minério novo): veios raros na ardósia profunda **dentro do bioma Deep Dark**.
  **Só a picareta de diamante minera** (os itens daqui são raros mas não são de nível netherita).
  Dioptásio é um mineral real, verde-azulado, da cor das luzes do sculk.
- **Raw Dioptase** → triturado/lavado → **Dioptase** → **Echo Casing**.
- **Echo Chamber** (máquina do Deep Dark): construída com Echo Casing.
  - Recurso do mundo: **silêncio**. A câmara só trabalha se não houver barulho num raio de ~8 blocos.
    Barulho = qualquer vibração do vanilla (passos, blocos quebrando, mobs andando) e também
    **máquinas do Create girando** por perto.
  - **Lã bloqueia o som**, exatamente como no vanilla (a lã já bloqueia vibrações para o sensor de sculk).
    Para usar a câmara no meio de uma fábrica, o jogador precisa **isolá-la com lã**, deixando passar só
    o eixo que a move e os funis/esteiras de entrada e saída.
  - Se houver barulho, o processo **pausa** (as luzes da câmara apagam e ela "escuta" de novo). Nada é perdido.
  - Precisa de rotação (velocidade = rapidez). O próprio eixo que a move não conta como barulho.
  - Mesmo slot de catalisador das outras máquinas.
  - Os óculos do engenheiro mostram quantas fontes de barulho ela está ouvindo, para o jogador achar
    o que falta isolar.
- Diferença das outras: a Soul Forge **coleta** um recurso (almas), a Rift Chamber depende de **onde**
  está (sobre o vazio), e a Echo Chamber depende de **como você constrói em volta** (isolamento).

## Receitas

### Sculk · T1
- **Implantador** com Experience Nugget sobre Deepslate → Sculk
- História: é o que o catalisador de sculk faz quando absorve experiência.

### Sculk Vein (Veio de Sculk) · T1
- **Serra mecânica:** 1 Sculk → 3 Sculk Vein
- História: "descascar" a camada fina do bloco.

### Sculk Sensor (Sensor de Sculk) · T2
*Útil para redstone.*
- **Montagem sequencial** (base: Sculk, 1 loop):
  1. Implantador: Redstone
  2. Implantador: String (os "tentáculos")
  3. Prensa
- Resultado: Sculk Sensor · 100%

### Sculk Catalyst (Catalisador de Sculk) · T2
- **Misturador:** 1 Bone Block + 4 Sculk + 5 Experience Nugget → Sculk Catalyst
- História: o catalisador nasce sobre os ossos de um mob, alimentado de experiência.

### Echo Shard (Fragmento de Eco) · T3
*Cidades ancestrais. Raro, utilidade baixa a média (bússola de recuperação).*
1. **Montagem sequencial** (base: Amethyst Shard, 3 loops):
   1. Implantador: Sculk Vein
   2. Implantador: Experience Nugget
   3. Prensa
   - Resultado: **Resonant Shard** (item novo) · 90%. Sucata: Amethyst Shard.
2. **Echo Chamber:** Resonant Shard → Echo Shard
- História: a ametista, que já ressoa com som, absorve o sculk. No silêncio total da câmara,
  o som fica "preso" dentro do cristal.

### Sculk Shrieker (Gritador de Sculk) · T3
*Raro, utilidade baixa (invoca o Warden).*
- **Echo Chamber:** 1 Sculk Sensor + 1 Bone Block + 1 Echo Shard → Sculk Shrieker
- História: o sensor que só ouvia aprende a gritar. O eco é a voz.

### Disco "otherside" e Disc Fragment 5 · T2
- Família dos discos (matriz **Engraving Die** na prensa), detalhada no catálogo de Discos.
  Toques do Deep Dark: Echo Shard (otherside) e Sculk Vein (fragmento 5).

### Moldes Ward e Silence
- Família dos moldes de ferraria (matriz **Template Die**), detalhada no catálogo de Moldes.
  O Silence (o molde mais raro do jogo) deve passar pela Echo Chamber.

## Itens novos desta categoria

| Item | Uso |
|---|---|
| Dioptase Ore | minério do Deep Dark, só picareta de diamante minera |
| Raw Dioptase, Dioptase | material do portão do Deep Dark |
| Echo Casing | carcaça das máquinas do Deep Dark |
| Echo Chamber | máquina especial do Deep Dark |
| Resonant Shard | intermediário do Echo Shard |

## Observação sobre o portão

Nenhum item do Deep Dark chega a T4/T5 pela regra de utilidade + raridade. Mesmo assim, a Echo Chamber
é usada pelos itens que só existem nas cidades ancestrais (fragmento de eco, gritador e o molde Silence),
com um portão mais leve (picareta de diamante) do que o do Nether e do End (netherita).
