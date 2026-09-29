"""Gera web/exemplos.js a partir de exercicios/exemplos/*.txt.

Rode depois de mudar um exemplo:  python web/gerar_exemplos.py
(tests/test_web.py avisa se o arquivo gerado ficou desatualizado.)
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def gerar() -> str:
    exemplos = []
    for arq in sorted((RAIZ / "exercicios" / "exemplos").glob("*.txt")):
        texto = arq.read_text(encoding="utf-8")
        titulo = next((l.split(":", 1)[1].strip() for l in texto.splitlines()
                       if l.lower().startswith("titulo:")), arq.stem)
        nivel = int(arq.stem[5:7]) if arq.stem.startswith("nivel") else 1
        exemplos.append({"arquivo": arq.name, "titulo": titulo, "nivel": nivel, "texto": texto})
    corpo = json.dumps(exemplos, ensure_ascii=False, indent=1)
    return f"// gerado por web/gerar_exemplos.py; não edite à mão\nwindow.EXEMPLOS = {corpo};\n"


if __name__ == "__main__":
    (RAIZ / "web" / "exemplos.js").write_text(gerar(), encoding="utf-8")
