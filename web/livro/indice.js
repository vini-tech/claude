/* Ordem de carregamento dos capítulos em módulos (cada um chama TEMAS.inserir).
 * Para acrescentar um capítulo: crie web/livro/<nome>.js e ponha o nome aqui. */
(function (raiz) {
  const LIVRO = ["contraponto", "cadencias", "ornamentos", "setimas", "forma", "secundarias", "aumentadas", "modulacao", "raros"];
  if (typeof module === "object" && module.exports) module.exports = LIVRO;
  else raiz.LIVRO = LIVRO;
})(this);
