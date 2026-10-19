/* Ordem de carregamento dos capítulos em módulos (cada um chama TEMAS.inserir).
 * Para acrescentar um capítulo: crie web/livro/<nome>.js e ponha o nome aqui. */
(function (raiz) {
  const LIVRO = ["nivel1", "nivel2", "nivel3", "contraponto", "cadencias", "ornamentos", "setimas", "forma", "secundarias", "aumentadas", "modulacao", "raros", "perguntas-n1", "perguntas-n2a", "perguntas-n2b", "perguntas-n3", "perguntas-n4a", "perguntas-n4b"];
  if (typeof module === "object" && module.exports) module.exports = LIVRO;
  else raiz.LIVRO = LIVRO;
})(this);
