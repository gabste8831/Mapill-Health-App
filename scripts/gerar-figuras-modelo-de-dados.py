"""Gera as figuras do modelo de dados local (SQLite) e remoto (Supabase) para o TCC.

Uso: python scripts/gerar-figuras-modelo-de-dados.py docs/tcc

Layout fixo em vez do "organizar" do dbdiagram, que muda a cada vez e passava linhas por trás de
outras tabelas. As nove tabelas sincronizadas ficam no mesmo lugar nas duas figuras, para a
comparação ser feita de olho. Tabela ou coluna nova entra em `schema()` à mão: a fonte de verdade
continua sendo as migrations e o docs/supabase-schema.sql.

Duas colunas, sem legenda e com margem mínima: a figura entra em página retrato e o que limita a
letra é a altura da página. Com tudo numa figura só, cada pixel de altura poupado vira letra maior,
e a legenda e as notas cabem melhor na legenda da figura e no texto.

O PNG sai do Edge em modo headless, em escala 4, que é o que o Word precisa para não borrar.
"""
import os
import subprocess
import sys
from xml.sax.saxutils import escape

OUT_DIR = sys.argv[1]
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

W = 372          # largura da tabela
HEAD = 24
ROW = 18
FONT_NAME = 14.5
FONT_TYPE = 12.5
GAP_X = 62       # espaço entre as colunas, onde correm as ligações
GAP_Y = 16
GUTTER = 30      # margem das laterais, onde correm as ligações de uma tabela para outra da mesma coluna
EDGE_Y = 3
COLS = [GUTTER, GUTTER + W + GAP_X]
FONT = "Arial, Helvetica, sans-serif"


def c(name, typ, nn=False, key=""):
    return {"name": name, "type": typ, "nn": nn, "key": key}


# ---------------------------------------------------------------------------
# Definição das tabelas, nas duas versões
# ---------------------------------------------------------------------------
def schema(remote):
    T = (lambda local, rem: rem if remote else local)
    ID = c("id", T("TEXT", "uuid"), True, "PK")
    UID = [c("user_id", "uuid", True, "FK")] if remote else []
    TXT, INT, REAL = T("TEXT", "text"), T("INTEGER", "integer"), T("REAL", "real")
    BOOL, DATE, TS, JSON = T("INTEGER", "boolean"), T("TEXT", "date"), T("TEXT", "timestamptz"), T("TEXT", "jsonb")
    REF = T("TEXT", "uuid")
    sync = [c("updated_at", TS, True),
            c("server_updated_at", TS, True) if remote else c("synced_at", TS),
            c("deleted_at", TS)]

    t = {
        "medications": [ID] + UID + [
            c("name", TXT, True), c("active_ingredient", TXT, True), c("presentation", TXT, True),
            c("form", TXT, True), c("prescription_requirement", TXT, True), c("photo_uri", TXT),
            c("ean", TXT), c("from_cmed", BOOL, True)] + sync,
        "prescriptions": [ID] + UID + [
            c("medication_id", REF, True, "FK"), c("dose_amount", REAL, True), c("dose_unit", TXT, True),
            c("schedule", JSON, True), c("start_date", DATE, True), c("end_date", DATE),
            c("reminder_mode", TXT, True), c("intake_instructions", JSON, True), c("intake_note", TXT),
            c("notes", TXT), c("attachment_uri", TXT), c("attachment_kind", TXT),
            c("attachment_valid_until", DATE), c("renewal_reminder_lead_days", INT),
            c("renewal_reminder_enabled", BOOL, True), c("attachment_sync_opt_out", BOOL, True)] + sync,
        "dose_schedules": [ID] + UID + [
            c("prescription_id", REF, True, "FK"), c("scheduled_for", TS, True), c("amount", REAL, True),
            c("notification_id", TXT), c("snooze_count", INT, True)] + sync,
        "intake_logs": [ID] + UID + [
            c("dose_schedule_id", REF, True, "FK"), c("status", TXT, True), c("occurred_at", TS, True),
            c("corrects_log_id", REF, False, "FK")] + sync,
        "inventory_items": [ID] + UID + [
            c("medication_id", REF, True, "FK"), c("quantity", REAL, True), c("unit", TXT, True),
            c("low_stock_alert_enabled", BOOL, True), c("low_stock_alert_lead_days", INT),
            c("low_stock_alerted_at_quantity", REAL), c("storage_location", TXT)] + sync,
        "inventory_adjustments": [ID] + UID + [
            c("inventory_item_id", REF, True, "FK"), c("delta", REAL, True), c("reason", TXT, True)] + sync,
        "appointments": [ID] + UID + [
            c("title", TXT, True), c("scheduled_for", TS, True), c("location", TXT), c("professional", TXT),
            c("notes", TXT), c("reminder_lead_days", INT), c("reminder_on_day", BOOL, True),
            c("outcome", TXT), c("outcome_notes", TXT)] + sync,
        "patient_profiles": [ID] + UID + [
            c("full_name", TXT, True), c("date_of_birth", DATE), c("biological_sex", TXT),
            c("photo_uri", TXT), c("blood_type", TXT), c("allergies", JSON, True),
            c("emergency_contacts", JSON, True)]
            + ([] if remote else [c("emergency_contact_name", TXT), c("emergency_contact_phone", TXT),
                                  c("emergency_contact_relationship", TXT)])
            + [c("notes", TXT), c("photo_sync_opt_out", BOOL, True)] + sync,
        "consent_records": [ID] + UID + [
            c("terms_version", TXT, True), c("accepted_at", TS, True)] + sync,
    }
    if remote:
        t["auth.users"] = [c("id", "uuid", True, "PK")]
    else:
        t["cmed_entries"] = [c("id", "INTEGER", True, "PK"), c("name", "TEXT", True),
                             c("active_ingredient", "TEXT", True), c("strength", "TEXT", True),
                             c("prescription_requirement", "TEXT", True), c("search", "TEXT", True)]
        t["cmed_eans"] = [c("ean", "TEXT", True, "PK"), c("entry_id", "INTEGER", True, "FK")]
        t["sync_state"] = [c("table_name", "TEXT", True, "PK"), c("last_pulled_at", "TEXT")]
        t["app_state"] = [c("key", "TEXT", True, "PK"), c("value", "TEXT")]
    return t


def height(cols):
    return HEAD + ROW * len(cols)


# ---------------------------------------------------------------------------
# Layout fixo: as nove tabelas sincronizadas ocupam o mesmo lugar nas duas figuras
# ---------------------------------------------------------------------------
GROUP_LABEL = 26
GROUP_PAD = 12


def layout(t, remote):
    pos = {}

    def stack(col, names, y):
        for n in names:
            pos[n] = (COLS[col], y)
            y += height(t[n]) + GAP_Y
        return y

    left = ["medications", "inventory_items", "inventory_adjustments", "patient_profiles", "consent_records"]
    right = ["prescriptions", "dose_schedules", "intake_logs", "appointments"]
    bottom1 = stack(0, left, EDGE_Y)
    bottom2 = stack(1, right, EDGE_Y)

    group = None
    if remote:
        # auth.users vai para o pé da coluna mais curta, sem abrir uma faixa nova na figura.
        col = 0 if bottom1 <= bottom2 else 1
        pos["auth.users"] = (COLS[col], min(bottom1, bottom2))
    else:
        gy = max(bottom1, bottom2) - GAP_Y + 14
        top = gy + GROUP_LABEL
        pos["cmed_entries"] = (COLS[0], top)
        stack(0, ["app_state"], top + height(t["cmed_entries"]) + GAP_Y)
        y = stack(1, ["cmed_eans", "sync_state"], top)
        bottom = max(y - GAP_Y, pos["app_state"][1] + height(t["app_state"]))
        gx = COLS[0] - GROUP_PAD
        group = (gx, gy, COLS[1] + W + GROUP_PAD - gx, bottom + GROUP_PAD - gy)
    return pos, group


# ---------------------------------------------------------------------------
# Desenho
# ---------------------------------------------------------------------------
class Svg:
    def __init__(self):
        self.parts = []

    def add(self, s):
        self.parts.append(s)

    def line(self, x1, y1, x2, y2, w=1.2, color="#000"):
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{w}"/>')

    def text(self, x, y, s, size, anchor="start", weight="normal", style="normal", fill="#000"):
        self.add(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" '
                 f'font-style="{style}" fill="{fill}">{escape(s)}</text>')


def draw_table(svg, name, cols, x, y):
    h = height(cols)
    svg.add(f'<rect x="{x}" y="{y}" width="{W}" height="{h}" fill="#fff" stroke="#000" stroke-width="1.2"/>')
    svg.add(f'<rect x="{x}" y="{y}" width="{W}" height="{HEAD}" fill="#d9d9d9" stroke="#000" stroke-width="1.2"/>')
    svg.text(x + W / 2, y + 17, name, size=15.5, anchor="middle", weight="bold")
    for i, col in enumerate(cols):
        ry = y + HEAD + ROW * i
        if i:
            svg.line(x, ry, x + W, ry, w=0.5, color="#c8c8c8")
        base = ry + 13.8
        if col["key"]:
            svg.text(x + 5, base, col["key"], size=11.5, weight="bold")
        svg.text(x + 31, base, col["name"], size=FONT_NAME,
                 weight="bold" if col["key"] == "PK" else "normal",
                 style="italic" if col["key"] == "FK" else "normal")
        svg.text(x + W - 29, base, col["type"], size=FONT_TYPE, anchor="end", fill="#333")
        if col["nn"]:
            svg.text(x + W - 4, base, "NN", size=10.5, anchor="end", fill="#555")


def path(svg, pts, dashed):
    d = " ".join(f"{'M' if i == 0 else 'L'}{px},{py}" for i, (px, py) in enumerate(pts))
    dash = ' stroke-dasharray="6,4"' if dashed else ""
    svg.add(f'<path d="{d}" fill="none" stroke="#000" stroke-width="1.2"{dash}/>')


def mark_one(svg, x, y, d):
    for off in (6, 10):
        svg.line(x + d * off, y - 5, x + d * off, y + 5)


def mark_many(svg, x, y, d, optional):
    tip = x + d * 10
    for dy in (-6, 0, 6):
        svg.line(tip, y, x, y + dy)
    if optional:
        svg.add(f'<circle cx="{x + d * 15}" cy="{y}" r="3.5" fill="#fff" stroke="#000" stroke-width="1.2"/>')
    else:
        svg.line(x + d * 14, y - 5, x + d * 14, y + 5)


def row_y(t, pos, table, col):
    names = [cc["name"] for cc in t[table]]
    return pos[table][1] + HEAD + ROW * names.index(col) + ROW / 2


def link(svg, t, pos, parent, child, fk, side, dashed, optional=False, offset=24):
    """Pai.id -> filho.fk. side: 'across' (colunas vizinhas), 'left' ou 'right' (mesma coluna)."""
    y1, y2 = row_y(t, pos, parent, "id"), row_y(t, pos, child, fk)
    px, cx = pos[parent][0], pos[child][0]
    if side == "across":
        a, b = px + W, cx
        mid = (a + b) / 2
        path(svg, [(a, y1), (mid, y1), (mid, y2), (b, y2)], dashed)
        mark_one(svg, a, y1, 1)
        mark_many(svg, b, y2, -1, optional)
    else:
        d = -1 if side == "left" else 1
        edge = px if side == "left" else px + W
        g = edge + d * offset
        path(svg, [(edge, y1), (g, y1), (g, y2), (edge, y2)], dashed)
        mark_one(svg, edge, y1, d)
        mark_many(svg, edge, y2, d, optional)


def render(remote):
    t = schema(remote)
    pos, group = layout(t, remote)
    svg = Svg()
    dashed = remote

    if group:
        gx, gy, gw, gh = group
        svg.add(f'<rect x="{gx}" y="{gy}" width="{gw}" height="{gh}" fill="none" stroke="#000" '
                f'stroke-width="1" stroke-dasharray="6,4"/>')
        svg.text(gx + 10, gy + 18, "Somente no aparelho, não sincronizadas", size=14.5, weight="bold")

    for name, cols in t.items():
        draw_table(svg, name, cols, *pos[name])

    link(svg, t, pos, "medications", "prescriptions", "medication_id", "across", dashed)
    link(svg, t, pos, "medications", "inventory_items", "medication_id", "left", dashed)
    link(svg, t, pos, "inventory_items", "inventory_adjustments", "inventory_item_id", "right", dashed)
    # Lados alternados na coluna da direita: no mesmo lado, as duas ligações se cruzariam.
    link(svg, t, pos, "prescriptions", "dose_schedules", "prescription_id", "right", dashed)
    link(svg, t, pos, "dose_schedules", "intake_logs", "dose_schedule_id", "left", dashed)
    link(svg, t, pos, "intake_logs", "intake_logs", "corrects_log_id", "right", dashed, optional=True)
    if not remote:
        link(svg, t, pos, "cmed_entries", "cmed_eans", "entry_id", "across", False)

    bottom = max(y + height(t[n]) for n, (x, y) in pos.items())
    if group:
        bottom = max(bottom, group[1] + group[3])
    width = COLS[1] + W + GUTTER
    height_total = bottom + EDGE_Y + 1
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height_total}" '
            f'viewBox="0 0 {width} {height_total}" font-family="{FONT}">'
            f'<rect width="100%" height="100%" fill="#fff"/>' + "".join(svg.parts) + "</svg>",
            width, height_total)


# Área útil da página A4 com as margens da ABNT, menos a legenda e a fonte da figura.
PAGE_W_CM, PAGE_H_CM = 16.0, 22.5

for remote, name in ((False, "modelo-de-dados-local"), (True, "modelo-de-dados-remoto")):
    content, w, h = render(remote)
    svg_path = os.path.abspath(os.path.join(OUT_DIR, name + ".svg"))
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(content)
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=4", f"--window-size={w},{h}",
                    f"--screenshot={svg_path[:-4]}.png", "file:///" + svg_path.replace(os.sep, "/")],
                   check=True, stderr=subprocess.DEVNULL)
    cm_por_px = min(PAGE_W_CM / w, PAGE_H_CM / h)
    pt = FONT_NAME * cm_por_px / 2.54 * 72
    print(f"{name}: {w}x{h}px, cabe com {w * cm_por_px:.1f} x {h * cm_por_px:.1f} cm, letra ~{pt:.1f} pt")
