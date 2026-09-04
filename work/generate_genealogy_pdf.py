from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(r"C:\Users\TiagoBatista\Documents\Codex\2026-09-01\va")
OUT_DIR = ROOT / "outputs" / "Arquivo_Genealogico_Tiago_Batista" / "05_PDF_ARVORE"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PDF = OUT_DIR / "Arvore_Genealogica_Tiago_Batista_v06_2026-09-01.pdf"

PAGE_W, PAGE_H = landscape(A4)

BG = HexColor("#F7F6F2")
INK = HexColor("#1F2933")
MUTED = HexColor("#5F6B76")
NAVY = HexColor("#264653")
PLUM = HexColor("#6F4E7C")
GREEN = HexColor("#006B4F")
AMBER = HexColor("#A85D00")
BLUE = HexColor("#3D6D8C")
GREY = HexColor("#6B7280")
RED = HexColor("#8B2635")
LIGHT_GREEN = HexColor("#E7F2EE")
LIGHT_AMBER = HexColor("#F8EEDF")
LIGHT_BLUE = HexColor("#E8F0F5")
LIGHT_GREY = HexColor("#ECEDEF")
LIGHT_RED = HexColor("#F5E8EB")
WHITE = HexColor("#FFFFFF")
LINE = HexColor("#D7D9D6")

STATUS = {
    "C": (GREEN, LIGHT_GREEN, "C - Documento com imagem"),
    "D": (AMBER, LIGHT_AMBER, "D - Documento informado; imagem pendente"),
    "R": (BLUE, LIGHT_BLUE, "R - Relato familiar"),
    "A": (GREY, LIGHT_GREY, "A - A confirmar"),
    "X": (RED, LIGHT_RED, "X - Conflito aberto"),
}


def register_fonts():
    pdfmetrics.registerFont(TTFont("Segoe", r"C:\Windows\Fonts\segoeui.ttf"))
    pdfmetrics.registerFont(TTFont("Segoe-Bold", r"C:\Windows\Fonts\segoeuib.ttf"))
    pdfmetrics.registerFont(TTFont("Segoe-Semibold", r"C:\Windows\Fonts\seguisb.ttf"))
    pdfmetrics.registerFont(TTFont("Segoe-Light", r"C:\Windows\Fonts\segoeuil.ttf"))


def width(text, font="Segoe", size=9):
    return pdfmetrics.stringWidth(str(text), font, size)


def wrap(text, font, size, max_width):
    text = str(text).strip()
    if not text:
        return []
    paragraphs = text.split("\n")
    result = []
    for paragraph in paragraphs:
        words = paragraph.split()
        if not words:
            result.append("")
            continue
        line = words[0]
        for word in words[1:]:
            trial = f"{line} {word}"
            if width(trial, font, size) <= max_width:
                line = trial
            else:
                result.append(line)
                line = word
        result.append(line)
    return result


def fit_lines(text, font, size, max_width, max_lines):
    lines = wrap(text, font, size, max_width)
    if len(lines) <= max_lines:
        return lines
    clipped = lines[:max_lines]
    last = clipped[-1]
    while last and width(last + "...", font, size) > max_width:
        last = last[:-1]
    clipped[-1] = last.rstrip() + "..."
    return clipped


def draw_wrapped(c, text, x, y_top, max_width, font="Segoe", size=8, leading=None,
                 color=INK, max_lines=None):
    leading = leading or size * 1.25
    lines = wrap(text, font, size, max_width)
    if max_lines is not None:
        lines = fit_lines(text, font, size, max_width, max_lines)
    c.setFont(font, size)
    c.setFillColor(color)
    y = y_top
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def page_base(c, title, subtitle, page_number, total_pages=4, accent=NAVY):
    c.setFillColor(BG)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(accent)
    c.rect(0, PAGE_H - 9, PAGE_W, 9, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont("Segoe-Bold", 21)
    c.drawString(24, PAGE_H - 42, title)
    c.setFillColor(MUTED)
    c.setFont("Segoe", 9.2)
    c.drawString(25, PAGE_H - 59, subtitle)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(24, 37, PAGE_W - 24, 37)
    c.setFont("Segoe", 7.5)
    c.setFillColor(MUTED)
    c.drawString(24, 23, "Arquivo familiar - versão 06 - 01/09/2026")
    footer = "Árvore de pesquisa: vínculos sem imagem documental permanecem sujeitos a confirmação."
    c.drawCentredString(PAGE_W / 2, 23, footer)
    c.drawRightString(PAGE_W - 24, 23, f"Página {page_number} de {total_pages}")


def panel(c, x, y, w, h, title, color, subtitle=None):
    c.setFillColor(Color(color.red, color.green, color.blue, alpha=0.055))
    c.setStrokeColor(Color(color.red, color.green, color.blue, alpha=0.24))
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 10, stroke=1, fill=1)
    c.setFillColor(color)
    c.setFont("Segoe-Semibold", 10)
    c.drawString(x + 12, y + h - 18, title)
    if subtitle:
        c.setFont("Segoe", 7)
        c.setFillColor(MUTED)
        c.drawRightString(x + w - 12, y + h - 18, subtitle)


def card(c, x, y, w, h, title, details, status="R", badge=None,
         emphasis=False, title_size=9.2, detail_size=7.1, title_lines=2,
         detail_lines=3, secondary_badge=None):
    status_key = status if status in STATUS else status.split("/")[0]
    color, tint, _ = STATUS.get(status_key, STATUS["A"])
    fill = WHITE if not emphasis else Color(tint.red, tint.green, tint.blue, alpha=0.75)
    c.setFillColor(fill)
    c.setStrokeColor(color)
    c.setLineWidth(1.8 if emphasis else 1.15)
    if status_key in ("D", "R", "A"):
        c.setDash(4, 2) if status_key == "D" else c.setDash(2, 2)
    else:
        c.setDash()
    c.roundRect(x, y, w, h, 8, stroke=1, fill=1)
    c.setDash()

    badge_text = badge or status
    badge_w = max(22, width(badge_text, "Segoe-Bold", 6.7) + 12)
    c.setFillColor(color)
    c.roundRect(x + w - badge_w - 7, y + h - 17, badge_w, 12, 5, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("Segoe-Bold", 6.7)
    c.drawCentredString(x + w - badge_w / 2 - 7, y + h - 13.3, badge_text)

    usable_title_w = w - badge_w - 22
    title_text = fit_lines(title, "Segoe-Semibold", title_size, usable_title_w, title_lines)
    c.setFillColor(INK)
    c.setFont("Segoe-Semibold", title_size)
    ty = y + h - 15
    for line in title_text:
        c.drawString(x + 8, ty, line)
        ty -= title_size * 1.12

    dy = min(ty - 3, y + h - 34)
    detail_text = fit_lines(details, "Segoe", detail_size, w - 16, detail_lines)
    c.setFont("Segoe", detail_size)
    c.setFillColor(MUTED)
    for line in detail_text:
        c.drawString(x + 8, dy, line)
        dy -= detail_size * 1.24

    if secondary_badge:
        secondary_color, _, _ = STATUS.get(secondary_badge, STATUS["X"])
        pill_text = f"{secondary_badge} - conflito" if secondary_badge == "X" else secondary_badge
        pill_w = width(pill_text, "Segoe-Bold", 5.8) + 11
        c.setFillColor(secondary_color)
        c.roundRect(x + w - pill_w - 6, y + 5, pill_w, 10, 4, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Segoe-Bold", 5.8)
        c.drawCentredString(x + w - pill_w / 2 - 6, y + 7.4, pill_text)


def connector(c, x1, y1, x2, y2, status="R", bus_y=None):
    status_key = status if status in STATUS else status.split("/")[0]
    color, _, _ = STATUS.get(status_key, STATUS["A"])
    c.setStrokeColor(color)
    c.setLineWidth(2.0 if status_key == "C" else 1.45)
    if status_key == "D":
        c.setDash(6, 3)
    elif status_key in ("R", "A"):
        c.setDash(2, 2)
    else:
        c.setDash()
    if bus_y is None:
        bus_y = (y1 + y2) / 2
    c.line(x1, y1, x1, bus_y)
    c.line(x1, bus_y, x2, bus_y)
    c.line(x2, bus_y, x2, y2)
    c.setDash()


def parents_to_child(c, parent_centers, parent_bottom, child_center, child_top, status="R", bus_y=None):
    status_key = status if status in STATUS else status.split("/")[0]
    color, _, _ = STATUS.get(status_key, STATUS["A"])
    c.setStrokeColor(color)
    c.setLineWidth(2.0 if status_key == "C" else 1.45)
    if status_key == "D":
        c.setDash(6, 3)
    elif status_key in ("R", "A"):
        c.setDash(2, 2)
    else:
        c.setDash()
    if bus_y is None:
        bus_y = (parent_bottom + child_top) / 2
    for px in parent_centers:
        c.line(px, parent_bottom, px, bus_y)
    c.line(min(parent_centers), bus_y, max(parent_centers), bus_y)
    union_x = sum(parent_centers) / len(parent_centers)
    c.line(union_x, bus_y, child_center, bus_y)
    c.line(child_center, bus_y, child_center, child_top)
    c.setDash()


def status_legend(c, x, y, w, h, key, compact=False):
    color, tint, label = STATUS[key]
    c.setFillColor(tint)
    c.setStrokeColor(color)
    c.setLineWidth(1)
    if key in ("D", "R", "A"):
        c.setDash(3, 2)
    else:
        c.setDash()
    c.roundRect(x, y, w, h, 6, stroke=1, fill=1)
    c.setDash()
    c.setFillColor(color)
    c.circle(x + 13, y + h / 2, 6, stroke=0, fill=1)
    c.setFillColor(WHITE)
    c.setFont("Segoe-Bold", 6.5)
    c.drawCentredString(x + 13, y + h / 2 - 2.2, key)
    c.setFillColor(INK)
    c.setFont("Segoe-Semibold" if not compact else "Segoe", 6.8 if compact else 7.1)
    text = label.split(" - ", 1)[1]
    c.drawString(x + 24, y + h / 2 - 2.4, text)


def page_one(c):
    page_base(
        c,
        "Árvore genealógica de Tiago Batista da Silva",
        "Linha direta conhecida - relações classificadas conforme a evidência disponível no arquivo",
        1,
        accent=NAVY,
    )

    panel(c, 22, 122, 535, 390, "RAMO PATERNO", NAVY, "Pernambuco - Alagoas - São Paulo")
    panel(c, 570, 122, 249, 390, "RAMO MATERNO", PLUM, "Minas Gerais - São Paulo")

    # Conectores paternos, desenhados antes dos cartões.
    connector(c, 109.5, 426, 160, 299, "C", bus_y=409)
    connector(c, 280.5, 426, 317.5, 395, "R", bus_y=411)
    connector(c, 459, 426, 479.5, 395, "R", bus_y=411)
    parents_to_child(c, [317.5, 479.5], 333, 405, 299, "C", bus_y=316)
    # As declarações de Iraci e José listam Ivanildo entre os filhos de cada um.
    connector(c, 160, 237, 270, 202, "C", bus_y=224)
    connector(c, 405, 237, 310, 202, "C", bus_y=214)

    # Ramo materno e convergência em Tiago.
    connector(c, 694, 237, 695, 202, "R", bus_y=219)
    parents_to_child(c, [290, 695], 144, 420, 118, "C", bus_y=132)

    # Cartões dos ascendentes paternos.
    card(c, 32, 426, 155, 55,
         "Joventino Pereira da Silva + Maria Joaquina da Conceição",
         "Pais de José e Donzilia diretamente visíveis nos documentos arquivados.",
         "C", title_size=8.0, detail_size=6.4, title_lines=3, detail_lines=2)
    card(c, 203, 426, 155, 55,
         "Eleutério Batista da Silva + Vicentina Maria",
         "Pais de Antônio segundo relato familiar.",
         "R", title_size=8.0, detail_size=6.4, title_lines=3, detail_lines=2)
    card(c, 374, 426, 170, 55,
         "Pai não identificado + Joana Maria de Lima",
         "Ascendência de Maria Joana; local informado ainda a conferir.",
         "R", title_size=8.0, detail_size=6.3, title_lines=3, detail_lines=2)

    card(c, 255, 333, 125, 62,
         "Antônio Eleuterio Batista",
         "Pai de Iraci na declaração arquivada. 27/02/1905, Quipapá/PE, ainda por relato.",
         "C", title_size=8.5, detail_size=6.5, title_lines=2, detail_lines=3)
    card(c, 415, 333, 129, 62,
         "Maria Joana Batista",
         "Mãe de Iraci na declaração arquivada. Data, local e nome ampliado ainda por relato.",
         "C", title_size=8.5, detail_size=6.3, title_lines=2, detail_lines=3)

    card(c, 85, 237, 150, 62,
         "José Pereira da Silva",
         "12/12/1920, Palmares/PE - 15/06/2010, Hospital Sorocabana-Lapa/SP. Girassóis-Osasco.",
         "C", badge="C", title_size=9.0, detail_size=6.35, title_lines=2, detail_lines=4)
    card(c, 330, 237, 150, 62,
         "Iraci Pereira da Silva",
         "12/08/1928, São José da Laje/AL - 05/06/2009. Filiação diretamente visível.",
         "C", title_size=9.0, detail_size=6.4, title_lines=2, detail_lines=3)

    card(c, 210, 144, 160, 58,
         "Ivanildo Batista da Silva",
         "Pai de Tiago no RG; filho de José e Iraci nas declarações funerárias arquivadas.",
         "C", badge="C", emphasis=True, title_size=8.8, detail_size=6.35, detail_lines=3)

    # Ramo materno.
    card(c, 584, 237, 220, 62,
         "João Vitorino Pires + Maria Bendita de Jesus",
         "Avós maternos. Grafia Bendita/Benedita e demais dados aguardam documento.",
         "R", title_size=8.8, detail_size=6.6, title_lines=2, detail_lines=3)
    card(c, 610, 144, 170, 58,
         "Maria do Carmo Lemos da Silva",
         "Nome e maternidade no RG. 'Maria do Carmo Lemos' pode ser o nome anterior ao casamento.",
         "C", badge="C + R", emphasis=True, title_size=8.7, detail_size=6.35, detail_lines=3)

    card(c, 335, 60, 170, 58,
         "Tiago Batista da Silva",
         "Pessoa central. Filiação documentada na identidade arquivada.",
         "C", emphasis=True, title_size=10.2, detail_size=7.0, title_lines=2, detail_lines=2)

    callout(c, 590, 338, 204, 102, "NOTA DE LEITURA",
            "O sinal + agrupa pessoas e não prova, sozinho, casamento ou parentalidade individual. A declaração de Iraci resolveu a divergência materna em favor de Maria Joana Batista; Maria Francisca fica apenas como pista pública conflitante.", PLUM)


def child_card(c, x, y, w, h, title, details, highlight=False, badge="R"):
    card(c, x, y, w, h, title, details, "C",
         badge=badge,
         emphasis=highlight, title_size=8.0, detail_size=6.4,
         title_lines=2, detail_lines=4)


def mini_card(c, x, y, w, h, title, details, status="R", badge=None):
    card(c, x, y, w, h, title, details, status, badge=badge,
         title_size=7.8, detail_size=6.2, title_lines=2, detail_lines=2)


def page_two(c):
    page_base(
        c,
        "Família ampliada e ramos colaterais",
        "Os grupos abaixo unem documento, relato e pistas; a disposição não representa ordem de nascimento",
        2,
        accent=PLUM,
    )

    card(c, 300, 436, 242, 62,
         "José Pereira da Silva + Iraci Pereira da Silva",
         "As declarações de José e Iraci listam os mesmos seis filhos. A parentalidade de ambos está documentada.",
         "C", badge="C", emphasis=True, title_size=10.0, detail_size=6.6, title_lines=2, detail_lines=3)

    children = [
        ("Everaldo", "Filho de José e Iraci nas duas declarações. Nome completo e datas pendentes.", False, "C"),
        ("Ivan Batista da Silva", "'Ivan' está nas declarações; o próprio Ivan informou nome completo, 1947 e São José da Laje/AL.", False, "C + R"),
        ("Ivanildo Batista da Silva", "Filho de José e Iraci nas declarações e pai de Tiago no RG.", True, "C"),
        ("Ivaneth", "Filha de ambos com esta grafia; declarante identificada como filha.", False, "C"),
        ("Ivanize", "Filha de José e Iraci nas duas declarações. Datas e registro próprio pendentes.", False, "C"),
        ("Edson", "Filho de José e Iraci nas duas declarações. Nome completo e dados pendentes.", False, "C"),
    ]
    x0, gap, cw, cy, ch = 23, 8, 126, 323, 80
    centers = [x0 + i * (cw + gap) + cw / 2 for i in range(6)]
    c.setStrokeColor(GREEN)
    c.setLineWidth(2.0)
    c.setDash()
    parent_center = 421
    parent_bottom = 436
    bus_y = 419
    c.line(parent_center, parent_bottom, parent_center, bus_y)
    c.line(min(centers), bus_y, max(centers), bus_y)
    for center in centers:
        c.line(center, bus_y, center, cy + ch)
    c.setDash()

    for i, (name, details, direct, badge) in enumerate(children):
        child_card(c, x0 + i * (cw + gap), cy, cw, ch, name, details, direct, badge)

    c.setFillColor(MUTED)
    c.setFont("Segoe", 7.1)
    c.drawCentredString(PAGE_W / 2, 311,
                        "Conectores verdes: as declarações de José e Iraci documentam os mesmos seis filhos.")
    c.drawCentredString(PAGE_W / 2, 302,
                        "A disposição é ordem de trabalho e não equivale necessariamente à ordem de nascimento.")

    # Três grupos colaterais.
    panels = [
        (24, "IRMÃOS E CANDIDATOS DE JOSÉ", NAVY),
        (294, "IRMÃOS ATRIBUÍDOS A IRACI", NAVY),
        (564, "RAMO COLATERAL MATERNO", PLUM),
    ]
    for x, title, color in panels:
        panel(c, x, 65, 254, 220, title, color)

    mini_card(c, 36, 190, 230, 48, "Romeu Pereira da Silva?",
              "Pernambuco; sobrenome e filiação comum ainda não comprovados.", "R")
    mini_card(c, 36, 126, 230, 48, "Donzilia Pereira Mendes",
              "Mesmos pais de José; 20/06/1928, Palmares/PE. Provável 'Ducilia'.", "C", badge="C + H")
    draw_wrapped(c, "Termo C-96/189/53585. A equivalência Donzilia = 'Ducilia' ainda requer confirmação.",
                 36, 105, 230, size=6.6, color=MUTED, max_lines=3)

    mini_card(c, 306, 190, 230, 48, "Helena",
              "Relato familiar; casada com José Carlos. Nome civil e datas pendentes.", "R")
    mini_card(c, 306, 126, 230, 48, "Joana?",
              "Possível irmã de Iraci; teria um filho chamado Jorge.", "A")
    draw_wrapped(c, "Outros irmãos ainda não foram identificados com segurança.",
                 306, 105, 230, size=6.6, color=MUTED, max_lines=2)

    mini_card(c, 576, 205, 230, 42, "Cleuza",
              "Tia materna; falecida; viveu em Ibiá/MG; esposa de Jessé Porcina.", "R")
    mini_card(c, 576, 151, 230, 42, "Abadia",
              "Tia materna; demais dados ainda não informados.", "R")
    mini_card(c, 576, 97, 230, 42, "Orivaldo?",
              "Possível tio materno; identidade e vínculo a confirmar.", "A")


def draw_table(c, x, top_y, col_widths, header, rows, row_heights):
    table_w = sum(col_widths)
    header_h = 30
    c.setFillColor(NAVY)
    c.setStrokeColor(NAVY)
    c.rect(x, top_y - header_h, table_w, header_h, stroke=0, fill=1)
    cx = x
    c.setFillColor(WHITE)
    c.setFont("Segoe-Semibold", 7.2)
    for label, cw in zip(header, col_widths):
        c.drawString(cx + 6, top_y - 19, label)
        cx += cw

    y = top_y - header_h
    for idx, (row, rh) in enumerate(zip(rows, row_heights)):
        fill = WHITE if idx % 2 == 0 else HexColor("#F1F2EF")
        c.setFillColor(fill)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.rect(x, y - rh, table_w, rh, stroke=1, fill=1)
        cx = x
        for col_idx, (text, cw) in enumerate(zip(row, col_widths)):
            if col_idx == 2:
                key = text.split()[0].replace("+", "").replace("/", "")[:1]
                key = key if key in STATUS else "A"
                color, tint, _ = STATUS[key]
                c.setFillColor(tint)
                c.roundRect(cx + 5, y - 22, cw - 10, 15, 5, stroke=0, fill=1)
                c.setFillColor(color)
                c.setFont("Segoe-Bold", 6.8)
                c.drawCentredString(cx + cw / 2, y - 17.5, text)
            else:
                draw_wrapped(c, text, cx + 6, y - 12, cw - 12,
                             font="Segoe-Semibold" if col_idx == 0 else "Segoe",
                             size=6.5 if col_idx == 0 else 6.25,
                             leading=7.6, color=INK if col_idx == 0 else MUTED,
                             max_lines=5)
            cx += cw
        y -= rh
    return y


def callout(c, x, y, w, h, title, body, color=RED):
    tint = Color(color.red, color.green, color.blue, alpha=0.085)
    c.setFillColor(tint)
    c.setStrokeColor(color)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 8, stroke=1, fill=1)
    c.setFillColor(color)
    c.setFont("Segoe-Semibold", 8.3)
    c.drawString(x + 9, y + h - 17, title)
    draw_wrapped(c, body, x + 9, y + h - 32, w - 18,
                 size=6.55, leading=8.1, color=INK, max_lines=8)


def page_three(c):
    page_base(
        c,
        "Evidências, conflitos e próximas certidões",
        "A classificação é aplicada aos vínculos; uma pessoa pode ter alguns dados documentados e outros ainda por relato",
        3,
        accent=AMBER,
    )

    lx, ly, lw, lh, gap = 24, 488, 150, 28, 7
    for i, key in enumerate(["C", "D", "R", "A", "X"]):
        status_legend(c, lx + i * (lw + gap), ly, lw, lh, key, compact=True)

    c.setFillColor(INK)
    c.setFont("Segoe-Semibold", 11)
    c.drawString(24, 466, "Mapa dos vínculos principais")
    c.setFont("Segoe", 6.8)
    c.setFillColor(MUTED)
    c.drawRightString(546, 466, "Na tabela, códigos unidos por + indicam estados simultâneos do vínculo.")

    headers = ["Vínculo", "Fonte atualmente conhecida", "Estado", "Próxima comprovação"]
    rows = [
        ("Tiago <- Ivanildo e Maria do Carmo",
         "Documento de identidade arquivado com imagem disponível.",
         "C",
         "Sem pendência para os nomes dos pais de Tiago."),
        ("José: filiação, óbito e sepultamento",
         "Declaração funerária integral e livro cemiterial confirmam os campos principais.",
         "C",
         "Localizar a certidão civil e sua matrícula usando Cartório Lapa e DO 114743."),
        ("Iraci <- Antônio e Maria Joana",
         "Declaração de óbito municipal arquivada com filiação diretamente legível.",
         "C",
         "Obter certidão civil para corroboração e pesquisa das gerações anteriores."),
        ("Ivanildo <- Iraci / José",
         "As duas declarações listam Ivanildo como filho; o RG de Tiago liga Ivanildo a Tiago.",
         "C",
         "Nascimento próprio ainda desejável para data, local e filiação civil completa."),
        ("Donzilia <- Jovintino e Maria Joaquina",
         "Termo civil C-96, fl. 189, nº 53585; mesmos pais documentados de José.",
         "C",
         "Nascimento em Palmares e casamento B-14/72/1788; confirmar apelido 'Ducilia'."),
        ("Maria do Carmo <- João e Maria Bendita",
         "Relato familiar; grafia Bendita/Benedita ainda não resolvida.",
         "R + A",
         "Certidão de nascimento em Campos Altos/MG."),
        ("Antônio e Maria Joana <- ascendentes",
         "Eleutério, Vicentina e Joana Maria constam apenas em relato familiar detalhado.",
         "R + A",
         "Nascimento/casamento/óbito em Quipapá, Colônia Leopoldina e região."),
    ]
    draw_table(c, 24, 454, [132, 157, 62, 171], headers, rows, [46, 49, 49, 46, 49, 49, 49])

    callout(c, 565, 315, 252, 139, "RESOLVIDO: mãe de Iraci",
            "A declaração de óbito arquivada mostra Maria Joana Batista como mãe de Iraci. Maria Francisca de Lima, exibida no perfil público colaborativo, permanece apenas como pista conflitante e não integra a linha principal.", GREEN)
    callout(c, 565, 203, 252, 98, "HIPÓTESE SEPARADA: pais de Antônio",
            "A família informa Eleutério Batista da Silva e Vicentina Maria. Basílio Eleotério Batista aparece em árvore colaborativa, mas permanece fora da linha principal até existir certidão que faça a conexão.", GREY)
    callout(c, 565, 68, 252, 121, "PRÓXIMAS PROVAS PRIORITÁRIAS",
            "1. Casamento de José e Iraci: B-13, 098V, 001531.\n2. Casamento de Maria e Ivanildo, se local/ano surgirem.\n3. Nascimento/batismo de Maria do Carmo.\n4. Nascimentos de José e Donzilia em Palmares.\n5. Certidões próprias dos filhos.", AMBER)

    c.setFillColor(MUTED)
    c.setFont("Segoe", 6.7)
    c.drawString(24, 58, "Fontes desta versão: Registro Mestre v5; identidade de Tiago; declarações funerárias de Iraci e José; livro cemiterial de José;")
    c.drawString(24, 48, "termo civil de Donzilia; relatos diretos de Tiago e Ivan; rotas oficiais. Imagens restritas não foram incorporadas por privacidade.")


def page_four(c):
    page_base(
        c,
        "Ramo materno - investigação em Minas Gerais",
        "O objetivo desta etapa é obter provas primárias sem transformar homônimos ou variantes de grafia em parentes confirmados",
        4,
        accent=PLUM,
    )

    panel(c, 24, 337, 515, 177, "BASE FAMILIAR ATUAL", PLUM,
          "Campos Altos - Pratinha - Ibiá")
    connector(c, 307, 431, 329, 431, "R", bus_y=431)
    card(c, 43, 388, 264, 86,
         "João Vitorino Pires + Maria Bendita de Jesus",
         "Pais de Maria do Carmo por relato familiar. Vitorino/Victorino, Pires/Pirez e Bendita/Benedita são variantes somente para busca.",
         "R", title_size=9.0, detail_size=6.7, title_lines=2, detail_lines=4)
    card(c, 329, 388, 190, 86,
         "Maria do Carmo Lemos da Silva",
         "Mãe de Tiago no RG. O mestre original e Tiago apontam 'Maria do Carmo Lemos' como possível nome anterior.",
         "C", badge="C + R", emphasis=True, title_size=8.8, detail_size=6.7,
         title_lines=2, detail_lines=4)
    draw_wrapped(c,
                 "Ponto-chave: o RG confirma a relação entre Tiago e Maria do Carmo, mas não confirma o ano, o município de nascimento nem os pais dela.",
                 43, 365, 476, size=6.8, leading=8.2, color=MUTED, max_lines=3)

    callout(c, 560, 337, 258, 177, "RESULTADO DA BUSCA PÚBLICA",
            "Não apareceu correspondência inequívoca para Maria do Carmo Lemos da Silva, Maria do Carmo Lemos, o casal com Ivanildo, João Vitorino ou Maria Bendita. Isso não significa que os registros não existam: a web pública não permitiu ligar um registro à família com segurança.", GREY)

    panel(c, 24, 75, 794, 242, "CAMINHO DE PROVA", NAVY,
          "Nenhum pedido, pagamento ou contato foi realizado")

    card(c, 42, 188, 235, 88,
         "1. Nascimento civil",
         "Pesquisar em Campos Altos, CNS 03.528-7, de 1950 a 1956, usando 'Maria do Carmo Lemos' e o nome do RG.",
         "D", badge="ROTA", title_size=9.3, detail_size=6.9, title_lines=2, detail_lines=4)
    card(c, 303, 188, 235, 88,
         "2. Casamento do casal",
         "Prova mais forte do nome anterior. Pesquisar quando houver município e faixa de ano do casamento com Ivanildo.",
         "D", badge="ROTA", title_size=9.3, detail_size=6.9, title_lines=2, detail_lines=4)
    card(c, 564, 188, 235, 88,
         "3. Batismo e geração anterior",
         "Buscar o batismo em Campos Altos/Pratinha; depois, o casamento de João Vitorino e Maria Bendita.",
         "D", badge="ROTA", title_size=9.3, detail_size=6.9, title_lines=2, detail_lines=4)

    callout(c, 42, 94, 757, 72, "ORDEM RECOMENDADA",
            "Começar pelo nascimento em Campos Altos porque já há município e janela de 1950 a 1956. Se Tiago informar onde e aproximadamente quando Maria do Carmo e Ivanildo se casaram, o casamento vira a primeira busca. Depois seguir para o batismo e a geração anterior.", GREEN)

    c.setFillColor(MUTED)
    c.setFont("Segoe", 6.6)
    c.drawString(24, 58, "Rotas verificadas: Registro Civil de Campos Altos; Central do Registro Civil de Minas Gerais; coleções civis e católicas do FamilySearch;")
    c.drawString(24, 48, "Paróquia Santa Terezinha de Campos Altos e fundos históricos de Santo Antônio de Pratinha. Pesquisa pública sem correspondência inequívoca.")


def build_pdf():
    register_fonts()
    c = canvas.Canvas(str(OUT_PDF), pagesize=landscape(A4), pageCompression=1)
    c.setTitle("Árvore Genealógica de Tiago Batista da Silva")
    c.setAuthor("Arquivo familiar de Tiago Batista")
    c.setSubject("Árvore genealógica de pesquisa com classificação de evidências")
    c.setCreator("Codex")

    page_one(c)
    c.showPage()
    page_two(c)
    c.showPage()
    page_three(c)
    c.showPage()
    page_four(c)
    c.showPage()
    c.save()
    return OUT_PDF


if __name__ == "__main__":
    result = build_pdf()
    print(result)
