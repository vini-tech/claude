# Currículo: da regra estrita à escrita livre

A ideia é simples: **primeiro obedecer a tudo, depois ganhar o direito de desobedecer**.
Cada nível acrescenta material novo (mais notas, mais vozes, mais harmonia, a textura do piano) e,
ao mesmo tempo, solta algumas regras do nível anterior. Uma regra afrouxa em quatro passos:

| passo      | o que significa |
|------------|-----------------|
| **erro**   | o exercício não passa. |
| **aviso**  | evite. Pode acontecer, mas deve ser raro. |
| **info**   | a regra está quebrada e você sabe disso. O verificador só mostra onde. |
| desligada  | a regra não se aplica mais a esse estilo. |

O nível **info** é o centro da proposta: nos níveis finais você quebra regras de propósito,
e o verificador aponta cada quebra. Aí você decide, compasso a compasso, se ela foi escolha
ou descuido.

## Os níveis

| nível | assunto | o que afrouxa |
|------:|---------|---------------|
| [1](nivel-01-primeira-especie.md) | Contraponto a 2 vozes, 1ª espécie | nada: tudo é erro |
| [2](nivel-02-segunda-especie.md) | 2ª espécie (2 contra 1) | entram dissonâncias de passagem no tempo fraco |
| [3](nivel-03-terceira-especie.md) | 3ª espécie (4 contra 1) | bordadura e cambiata |
| [4](nivel-04-quarta-especie.md) | 4ª espécie (síncopes) | dissonância no tempo forte, como retardo |
| [5](nivel-05-quinta-especie.md) | 5ª espécie (florido), 2 e 3 vozes | ritmo livre |
| [6](nivel-06-harmonia-diatonica.md) | Harmonia a 4 vozes, diatônica | saltos de 6ª, melodias menos rígidas; o estilo de contraponto sai, entra o coral |
| [7](nivel-07-harmonia-cromatica.md) | Harmonia cromática e modulação | cromatismo melódico, dissonâncias por salto viram aviso |
| [8](nivel-08-estilo-classico.md) | Estilo clássico ao piano | a textura do piano: só vozes externas; ocultas, cruzamentos e apojaturas viram aviso |
| [9](nivel-09-romantico.md) | Linguagem romântica | paralelas viram aviso; dissonâncias sem resolução |
| [10](nivel-10-livre.md) | Escrita livre | quase tudo vira **info** |

A tabela completa, regra por regra, sai do próprio verificador:

```
python -m verificador --tabela
```

```
                                        1  2  3  4  5  6  7  8  9 10
ritmo_da_especie                        E  E  E  E  -  -  -  -  -  -
dissonancia_proibida                    E  -  -  -  -  -  -  -  -  -
dissonancia_tempo_forte                 -  E  E  E  E  -  -  -  -  -
retardo_nao_permitido                   -  E  E  -  -  -  -  -  -  -
bordadura_na_2a_especie                 -  E  -  -  -  -  -  -  -  -
dissonancia_aproximacao                 -  E  E  E  E  E  A  A  I  I
dissonancia_resolucao                   -  E  E  E  E  E  E  A  A  I
retardo_resolve_descendo                -  -  -  E  E  E  E  A  I  I
quintas_paralelas                       E  E  E  E  E  E  E  E  A  I
oitavas_paralelas                       E  E  E  E  E  E  E  E  A  I
quintas_oitavas_ocultas                 E  E  E  E  E  E  E  A  I  -
quintas_tempo_forte                     -  A  A  -  -  -  -  -  -  -
paralelas_imperfeitas_excessivas        A  A  A  A  A  -  -  -  -  -
unissono_interno                        E  A  A  A  A  -  -  -  -  -
cruzamento_de_vozes                     E  E  E  E  E  E  E  A  I  -
sobreposicao_de_vozes                   A  A  A  A  A  E  E  A  -  -
espacamento                             A  A  A  A  A  E  E  A  -  -
extensao_da_voz                         -  -  -  -  -  E  E  -  -  -
salto_maior_que_oitava                  E  E  E  E  E  E  E  A  I  I
intervalo_melodico_aumentado_diminuto   E  E  E  E  E  E  A  A  I  -
salto_de_sexta_ou_setima                E  E  E  E  E  A  A  -  -  -
salto_nao_compensado                    E  E  E  E  E  A  A  I  -  -
saltos_consecutivos                     E  E  E  E  E  A  A  I  -  -
nota_repetida                           A  E  E  A  A  -  -  -  -  -
ponto_culminante                        A  A  A  A  A  -  -  -  -  -
ambito_melodico                         A  A  A  A  A  -  -  -  -  -
inicio_perfeito                         E  E  E  E  E  -  -  -  -  -
final_perfeito                          E  E  E  E  E  -  -  -  -  -
cadencia_contraponto                    E  E  E  E  E  -  -  -  -  -
sensivel_resolve                        -  -  -  -  -  E  E  A  I  -
sensivel_dobrada                        -  -  -  -  -  E  E  A  I  -
cadencia_autentica                      -  -  -  -  -  A  A  A  I  -
```

Para mudar a curva (deixar uma regra rígida por mais tempo, por exemplo), edite
`verificador/niveis.py`. A tabela está lá, escrita do mesmo jeito.

## Como estudar cada nível

1. **Leia** a página do nível e rode `python -m verificador --regras -n N` para ver as regras ativas.
2. **Ouça e analise** o repertório indicado *antes* de escrever. As regras descrevem um som;
   quem conhece o som erra menos.
3. **Escreva** os exercícios. Toque cada um ao piano e cante cada voz sozinha.
   Se uma linha não dá para cantar, ela ainda não está boa, mesmo que passe no verificador.
4. **Verifique** com `python -m verificador arquivo.txt -n N` e corrija até passar.
5. **Avance** quando cumprir o critério no fim da página do nível.

O verificador não enxerga tudo. Ele não sabe se a melodia é bonita, se a forma se sustenta,
se a harmonia tem direção. Cada página tem uma lista de pontos que só você (ou um professor)
consegue avaliar.

## Ritmo sugerido

Com 30 a 60 minutos por dia: cerca de 2 a 4 semanas por nível de contraponto (1–5),
1 a 2 meses nos níveis de harmonia (6–7), e os níveis 8–10 sem prazo, porque aí você já
está compondo peças. Voltar a um nível anterior de vez em quando (um exercício de
1ª espécie como aquecimento) é tão útil quanto avançar.

## Bibliografia geral

- J. J. Fux, *Gradus ad Parnassum* (1725). Em inglês: *The Study of Counterpoint*, trad. Alfred Mann.
  A base dos níveis 1–5.
- Knud Jeppesen, *Counterpoint: The Polyphonic Vocal Style of the Sixteenth Century*.
- Peter Schubert, *Modal Counterpoint, Renaissance Style*.
- Arnold Schoenberg, *Exercícios preliminares em contraponto*; *Harmonia*;
  *Fundamentos da composição musical*.
- Paul Hindemith, *Harmonia tradicional*.
- H. J. Koellreutter, *Harmonia funcional*.
- Edward Aldwell & Carl Schachter, *Harmony and Voice Leading*.
- Walter Piston, *Harmony*.
- Esther Scliar, *Fraseologia musical*.
- William Caplin, *Classical Form*.
- Vincent Persichetti, *Twentieth-Century Harmony*.
