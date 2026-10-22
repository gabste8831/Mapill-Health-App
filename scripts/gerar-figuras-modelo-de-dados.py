"""Gera as figuras do modelo de dados local (SQLite) e remoto (Supabase) para o TCC.

Uso: python scripts/gerar-figuras-modelo-de-dados.py docs/tcc

Layout fixo em vez do "organizar" do dbdiagram, que muda a cada vez e passava linhas por trás de
outras tabelas. As nove tabelas sincronizadas ficam no mesmo lugar nas duas figuras, para a
comparação ser feita de olho. Tabela ou coluna nova entra em `schema()` à mão: a fonte de verdade
continua sendo as migrations e o docs/supabase-schema.sql.

O PNG sai do Edge em modo headless, em escala 3, que é o que o Word precisa para não borrar.
"""
import os
import subprocess
import sys
from xml.sax.saxutils import escape

OUT_DIR = sys.argv[1]
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

W = 340          # largura da tabela
HEAD = 26
ROW = 20
GAP_X = 80       # espaço entre colunas, onde correm as ligações
GAP_Y = 36
MARGIN = 50
# Duas colunas: a figura entra em página retrato, na largura do texto.
COLS = [MARGIN + i * (W + GAP_X) for i in range(2)]
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
def layout(t, remote):
    pos = {}

    def stack(col, names, y=MARGIN):
        for n in names:
            pos[n] = (COLS[col], y)
            y += height(t[n]) + GAP_Y
        return y

    bottom1 = stack(0, ["medications", "inventory_items", "inventory_adjustments", "patient_profiles",
                        "consent_records"])
    bottom2 = stack(1, ["prescriptions", "dose_schedules", "intake_logs", "appointments"])

    group = None
    gy = max(bottom1, bottom2) + 4
    if remote:
        pos["auth.users"] = (COLS[0], gy)
    else:
        top = gy + 34
        pos["cmed_entries"] = (COLS[0], top)
        y = top
        for n in ("cmed_eans", "sync_state", "app_state"):
            pos[n] = (COLS[1], y)
            y += height(t[n]) + GAP_Y
        gx = COLS[0] - 20
        gbottom = max(y - GAP_Y, top + height(t["cmed_entries"])) + 20
        group = (gx, gy, COLS[1] + W + 20 - gx, gbottom - gy)
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

    def text(self, x, y, s, size=11.5, anchor="start", weight="normal", style="normal", fill="#000"):
        self.add(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" '
                 f'font-style="{style}" fill="{fill}">{escape(s)}</text>')


def draw_table(svg, name, cols, x, y):
    h = height(cols)
    svg.add(f'<rect x="{x}" y="{y}" width="{W}" height="{h}" fill="#fff" stroke="#000" stroke-width="1.2"/>')
    svg.add(f'<rect x="{x}" y="{y}" width="{W}" height="{HEAD}" fill="#d9d9d9" stroke="#000" stroke-width="1.2"/>')
    svg.text(x + W / 2, y + 18, name, size=14, anchor="middle", weight="bold")
    for i, col in enumerate(cols):
        ry = y + HEAD + ROW * i
        if i:
            svg.line(x, ry, x + W, ry, w=0.5, color="#c8c8c8")
        base = ry + 14.5
        if col["key"]:
            svg.text(x + 7, base, col["key"], size=10.5, weight="bold")
        svg.text(x + 36, base, col["name"], size=12.5,
                 weight="bold" if col["key"] == "PK" else "normal",
                 style="italic" if col["key"] == "FK" else "normal")
        svg.text(x + W - 34, base, col["type"], size=11.5, anchor="end", fill="#333")
        if col["nn"]:
            svg.text(x + W - 8, base, "NN", size=10, anchor="end", fill="#555")


def path(svg, pts, dashed):
    d = " ".join(f"{'M' if i == 0 else 'L'}{px},{py}" for i, (px, py) in enumerate(pts))
    dash = ' stroke-dasharray="6,4"' if dashed else ""
    svg.add(f'<path d="{d}" fill="none" stroke="#000" stroke-width="1.2"{dash}/>')


def mark_one(svg, x, y, d):
    for off in (8, 13):
        svg.line(x + d * off, y - 6, x + d * off, y + 6)


def mark_many(svg, x, y, d, optional):
    tip = x + d * 12
    for dy in (-7, 0, 7):
        svg.line(tip, y, x, y + dy)
    if optional:
        svg.add(f'<circle cx="{x + d * 18}" cy="{y}" r="4" fill="#fff" stroke="#000" stroke-width="1.2"/>')
    else:
        svg.line(x + d * 17, y - 6, x + d * 17, y + 6)


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
        svg.text(gx + 12, gy + 21, "Somente no aparelho, não sincronizadas", size=13, weight="bold")

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

    # Rodapé: legenda e notas.
    bottom = max(y + height(t[n]) for n, (x, y) in pos.items())
    if group:
        bottom = max(bottom, group[1] + group[3])
    if remote:
        ux, uy = pos["auth.users"]
        notes_auth = ["Tabela do Supabase Auth. É referenciada pelo user_id",
                      "de todas as tabelas acima, com chave estrangeira real",
                      "(on delete cascade) e RLS user_id = auth.uid()."]
        for i, s in enumerate(notes_auth):
            svg.text(COLS[1], uy + 18 + i * 17, s, size=12)
        bottom = max(bottom, uy + 18 + len(notes_auth) * 17)

    ly = bottom + 40
    lx = COLS[0]
    svg.text(lx, ly, "Legenda", size=13, weight="bold")
    # Um texto por item: o SVG junta espaços seguidos e os três rótulos virariam uma frase só.
    for i, (sigla, rotulo) in enumerate((("PK", "chave primária"), ("FK", "chave estrangeira"),
                                         ("NN", "não nulo"))):
        svg.text(lx + i * 150, ly + 21, sigla, size=12, weight="bold")
        svg.text(lx + i * 150 + 26, ly + 21, rotulo, size=12)
    yy = ly + 46
    path(svg, [(lx, yy), (lx + 70, yy)], dashed)
    mark_one(svg, lx, yy, 1)
    mark_many(svg, lx + 70, yy, -1, False)
    svg.text(lx + 84, yy + 4, "um para muitos, obrigatório", size=12)
    yy += 24
    path(svg, [(lx, yy), (lx + 70, yy)], dashed)
    mark_one(svg, lx, yy, 1)
    mark_many(svg, lx + 70, yy, -1, True)
    svg.text(lx + 84, yy + 4, "um para muitos, opcional", size=12)

    if remote:
        notes = [
            "Linhas tracejadas são vínculos lógicos mantidos pelo aplicativo. Entre as tabelas do",
            "aplicativo não há chave estrangeira no banco, só a de user_id para auth.users.",
            "photo_uri e attachment_uri existem, mas sobem sempre vazias, porque os arquivos",
            "não são sincronizados. notification_id sobe e é ignorado pelos outros aparelhos.",
        ]
    else:
        notes = [
            "Linhas contínuas são referências declaradas no esquema (REFERENCES). O SQLite só as",
            "aplica com PRAGMA foreign_keys ligado, e o aplicativo não o liga.",
            "medications.ean é consultado em cmed_eans.ean, sem chave estrangeira.",
            "As colunas emergency_contact_* são legadas, substituídas por emergency_contacts.",
        ]
    ny = yy + 36
    for i, s in enumerate(notes):
        svg.text(lx, ny + i * 18, s, size=12)

    width = COLS[1] + W + MARGIN
    height_total = ny + (len(notes) - 1) * 18 + MARGIN
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height_total}" '
            f'viewBox="0 0 {width} {height_total}" font-family="{FONT}">'
            f'<rect width="100%" height="100%" fill="#fff"/>' + "".join(svg.parts) + "</svg>",
            width, height_total)


for remote, name in ((False, "modelo-de-dados-local"), (True, "modelo-de-dados-remoto")):
    content, w, h = render(remote)
    svg_path = os.path.abspath(os.path.join(OUT_DIR, name + ".svg"))
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(content)
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=3", f"--window-size={w},{h}",
                    f"--screenshot={svg_path[:-4]}.png", "file:///" + svg_path.replace(os.sep, "/")],
                   check=True, stderr=subprocess.DEVNULL)
    print(name, w, h)
