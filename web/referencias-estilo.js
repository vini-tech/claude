/* Gerado por tests/calibrar_estilo.js a partir das soluções do livro: não edite à mão.
 * Para cada nível, a faixa de cada número do relatório de estilo: [percentil 10, percentil 90, nº de soluções]. */
(function (raiz) {
  const REFERENCIAS = {
    1: {
      porGrau: [37.8, 81.7, 34],
      posClimax: [15.6, 78.8, 33],
      ambito: [5, 9, 34],
      imperfeitas: [38, 80, 26],
      contrario: [10, 71, 26],
      saltosSimultaneos: [1, 3, 21],
      climaxJunto: [0, 0, 26],
      complementaridade: [0.6, 2.27, 26],
      npvi: [4, 47.8, 24],
    },
    2: {
      porGrau: [33, 83.3, 60],
      posClimax: [0, 80.2, 39],
      ambito: [4, 8, 60],
      notasRepetidas: [1, 3, 30],
      npvi: [7.5, 42, 56],
      imperfeitas: [25, 100, 48],
      contrario: [0, 68.8, 48],
      climaxJunto: [0, 1, 48],
      complementaridade: [1.05, 2.04, 48],
      dominantes: [67, 100, 48],
      saltosSimultaneos: [1, 3, 28],
      climaxRepetido: [2, 3, 21],
    },
    3: {
      porGrau: [33, 78, 28],
      posClimax: [22, 75.2, 15],
      ambito: [6, 9, 28],
      npvi: [9.6, 58.6, 28],
      imperfeitas: [3, 73.2, 24],
      contrario: [10, 25.4, 24],
      climaxJunto: [0, 1, 24],
      complementaridade: [1.13, 2.72, 24],
      dominantes: [60, 90.7, 24],
      saltosSimultaneos: [1, 3, 18],
      climaxRepetido: [2, 5.6, 13],
      notasRepetidas: [1, 4.8, 13],
    },
    4: {
      porGrau: [33, 79.6, 63],
      climaxRepetido: [2, 3.5, 16],
      ambito: [5, 8, 63],
      npvi: [11, 36, 62],
      imperfeitas: [25, 75, 53],
      contrario: [18, 63.8, 53],
      climaxJunto: [0, 1, 53],
      complementaridade: [1.12, 1.82, 53],
      dominantes: [67, 100, 53],
      posClimax: [8.4, 73.8, 47],
      notasRepetidas: [1, 1, 34],
      saltosSimultaneos: [1, 3, 38],
    },
  };
  if (typeof module === "object" && module.exports) module.exports = REFERENCIAS;
  else raiz.ReferenciasEstilo = REFERENCIAS;
})(this);
