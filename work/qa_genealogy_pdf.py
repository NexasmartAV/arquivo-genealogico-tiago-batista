from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

import pdfplumber


PDF = Path(
    r"C:\Users\TiagoBatista\Documents\Codex\2026-09-01\va\outputs"
    r"\Arquivo_Genealogico_Tiago_Batista\05_PDF_ARVORE"
    r"\Arvore_Genealogica_Tiago_Batista_v06_2026-09-01.pdf"
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

required = [
    "Joventino Pereira da Silva",
    "Maria Joaquina da Conceição",
    "Antônio Eleuterio",
    "Maria Joana Batista",
    "José Pereira da Silva",
    "Iraci Pereira da Silva",
    "Ivanildo Batista da Silva",
    "Ivan Batista da Silva",
    "Ivaneth",
    "Maria do Carmo Lemos",
    "Casamento do casal",
    "15/06/2010",
    "Campos Altos",
    "03.528-7",
    "B-13",
    "098V",
    "001531",
    "Donzilia Pereira Mendes",
    "20/06/1928",
    "53585",
    "B-14",
    "1788",
    "Hospital Sorocabana",
    "Girassóis-Osasco",
    "114743",
]

sensitive_patterns = {
    "cpf": r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b",
    "rg_formatado": r"\b\d{1,2}\.\d{3}\.\d{3}-[\dXx]\b",
    "telefone": r"\b(?:\(?\d{2}\)?[ -]?)?\d{4,5}-\d{4}\b",
    "sequencia_numerica_7_mais": r"\b\d{7,}\b",
    "dados_medicos": r"\b(?:CID|bronco?pneumonia|hipertens[aã]o|acidente vascular|insuf\.\s*resp)\b",
}

all_text: list[str] = []
out_of_bounds: list[tuple[int, str]] = []
page_count = 0

with pdfplumber.open(PDF) as pdf:
    page_count = len(pdf.pages)
    print(f"paginas={page_count}")
    for index, page in enumerate(pdf.pages, start=1):
        text = page.extract_text() or ""
        all_text.append(text)
        for word in page.extract_words():
            if (
                float(word["x0"]) < -0.5
                or float(word["top"]) < -0.5
                or float(word["x1"]) > page.width + 0.5
                or float(word["bottom"]) > page.height + 0.5
            ):
                out_of_bounds.append((index, str(word["text"])))
        print(
            f"pagina_{index}=largura:{page.width:.2f},altura:{page.height:.2f},"
            f"palavras:{len(page.extract_words())}"
        )

joined = "\n".join(all_text)
joined_normalized = " ".join(joined.split())
missing: list[str] = []
for item in required:
    present = item in joined_normalized
    print(f"obrigatorio[{item}]={present}")
    if not present:
        missing.append(item)
sensitive_hits: dict[str, int] = {}
for label, pattern in sensitive_patterns.items():
    count = len(re.findall(pattern, joined, flags=re.IGNORECASE))
    sensitive_hits[label] = count
    print(f"sensivel[{label}]={count}")

print(f"fora_dos_limites={len(out_of_bounds)}")
print(f"sha256={hashlib.sha256(PDF.read_bytes()).hexdigest()}")

problems: list[str] = []
if page_count != 4:
    problems.append(f"quantidade de páginas inesperada: {page_count}")
if missing:
    problems.append("texto obrigatório ausente: " + ", ".join(missing))
if any(sensitive_hits.values()):
    problems.append("possível dado sensível detectado")
if out_of_bounds:
    problems.append("texto fora dos limites da página")

if problems:
    print("qa=FALHOU")
    for problem in problems:
        print(f"problema={problem}")
    raise SystemExit(1)

print("qa=APROVADO")
