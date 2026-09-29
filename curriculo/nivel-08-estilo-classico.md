# Nível 8 — Estilo clássico ao piano: frase, forma e textura

Até aqui as vozes eram vozes. Agora se escreve **para o piano**: melodia acompanhada,
baixo de Alberti, oitavas, acordes quebrados. Uma "voz" pode aparecer e sumir. O foco sai
da nota a nota e vai para a **frase** e a **forma**.

## O que muda

- **Muda o que é verificado:** o verificador reduz a peça às **vozes externas** (a nota mais aguda e a mais grave de cada momento) e só compara essas duas. É o esqueleto que o estilo clássico mais protege. Vale para qualquer partitura em MusicXML.
- **Afrouxa:** quintas/oitavas ocultas, cruzamento, sobreposição, espaçamento: viram aviso. A textura de piano mistura registros o tempo todo.
- **Afrouxa:** dissonâncias por salto e sem resolução por grau viram aviso. Entram a **apojatura** (chega por salto, resolve por grau) e a **escapada** (chega por grau, sai por salto).
- **Afrouxa:** saltos grandes na melodia viram aviso ou info; a extensão das vozes do coral desliga.
- **Continua erro:** 5ªs e 8ªs paralelas entre as vozes externas.

## Conteúdo

- **Frase:** motivo, ideia básica, **sentença** (apresentação + continuação) e **período** (antecedente + consequente).
- **Cadências** como pontuação: semicadência, cadência autêntica imperfeita e perfeita.
- **Textura:** baixo de Alberti, acordes batidos, oitavas quebradas no baixo (o "murky bass"), melodia em terças e sextas, pedal de dominante.
- **Formas:** binária (minueto), ternária (minueto e trio), rondó, tema e variações, noção de forma-sonata.

## Exercícios

1. Um **período** de 8 compassos (antecedente termina em semicadência; consequente em cadência autêntica perfeita).
2. Uma **sentença** de 8 compassos no modelo de Beethoven, Sonata op. 2 nº 1, 1º movimento.
3. Mesma melodia, três acompanhamentos: acordes em bloco, Alberti, arpejo.
4. Um **minueto e trio** completo.
5. **Tema e 4 variações** sobre um tema seu de 8 compassos.

Escreva no MuseScore (ou outro editor), exporte em MusicXML e verifique:

```
python -m verificador minueto.musicxml -n 8 --tom "G maior"
```

## O que só você avalia

- As frases têm proporção (4+4, 2+2+4)? A cadência cai onde a frase pede?
- A mão esquerda acompanha sem atrapalhar? O registro está bem usado?
- O desenvolvimento da ideia é lógico, sem enchimento?

## Ouvir e analisar

- Clementi, Sonatinas op. 36.
- Mozart, Sonata em dó maior K. 545.
- Beethoven, Sonatas op. 49 nº 1 e 2; op. 2 nº 1.
- Haydn, sonatas para piano (as primeiras, mais curtas).

**Leitura:** Schoenberg, *Fundamentos da composição musical*; Esther Scliar, *Fraseologia musical*; Caplin, *Classical Form*.

## Para avançar

Um minueto e trio, um tema com variações e um movimento de sonatina completos, sem erros.
