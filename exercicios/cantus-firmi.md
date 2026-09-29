# Cantus firmi

Melodias para os níveis 1–5. Cada uma já está no formato do verificador: copie a linha
para um arquivo novo, renomeie a voz para `cantus`, acrescente `cf: cantus` e escreva o
contraponto numa linha acima (ou abaixo) dela.

Para a 2ª, 3ª e 4ª espécies use `compasso: 2/2` (a semibreve continua durando 4 semínimas).
Para transpor uma voz uma oitava abaixo e usar o cantus firmus no baixo, troque o número da oitava.

| nº | modo | cantus firmus |
|---:|------|---------------|
| 1 | ré dórico (Fux) | `D4/4 F4 E4 D4 G4 F4 A4 G4 F4 E4 D4` |
| 2 | dó maior (jônio) | `C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4` |
| 3 | lá eólio | `A3/4 C4 B3 D4 C4 E4 D4 C4 B3 A3` |
| 4 | fá maior | `F4/4 G4 A4 F4 D4 E4 F4 C5 A4 F4 G4 F4` |
| 5 | sol mixolídio | `G3/4 C4 B3 G3 A3 C4 B3 D4 C4 B3 A3 G3` |
| 6 | mi frígio | `E4/4 C4 D4 E4 G4 F4 E4 D4 F4 E4` |

**Musica ficta.** Nos modos sem sensível (dórico, mixolídio, eólio), a nota abaixo da final
é elevada meio tom na cadência: C# em ré, F# em sol, G# em lá. No frígio a cadência é
diferente: o cantus firmus desce meio tom (F → E) e o contraponto acima sobe por tom
(D → E), formando 6ª maior → 8ª sem alteração.

Modelo de arquivo:

```
titulo: 1ª espécie, cantus firmus 2, contraponto acima
compasso: 4/4
tom: C maior
cf: cantus

contraponto: ...
cantus:      C4/4 D4 F4 E4 D4 G4 F4 E4 D4 C4
```
