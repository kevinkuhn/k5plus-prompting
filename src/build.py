#!/usr/bin/env python3
"""Baut die drei Kursdecks (Beginner, Intermediate, Advanced).

Ausgaben (ins Repository-Root, bereit für GitHub Pages)
  index.html                       Startseite mit den drei Stufen
  <deck>/index.html, <slug>.html   Ein Deck pro Stufe; gemeinsame Dateien in assets/
  <deck>/print.html                Alle Seiten untereinander (Vorlage für das PDF)
  <deck>/<deck>.pdf                Handout (nur mit --pdf, braucht Chrome)

Aufruf: python3 src/build.py [--pdf]
"""
import html
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from decks import SITE, DECKS, CHAPTERS  # noqa: E402
from sources import SOURCES  # noqa: E402

ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800'
         '&family=IBM+Plex+Mono:wght@400;500&display=swap">')


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def plain(title):
    """Titel ohne <em>-Auszeichnung (für <title>, Navigation, Inhaltsverzeichnis)."""
    return re.sub(r"<[^>]+>", "", title)


# Schweizer Typografie: Gedankenstrich mit Abstand als Halbgeviertstrich, kein ß
_TAG = re.compile(r"<[^>]+>")


def normalize_de(fragment):
    out, pos = [], 0
    for m in _TAG.finditer(fragment):
        text = fragment[pos:m.start()]
        out.append(text.replace(" — ", " – ").replace("—", "–").replace("ß", "ss"))
        out.append(m.group(0))
        pos = m.end()
    out.append(fragment[pos:].replace(" — ", " – ").replace("—", "–").replace("ß", "ss"))
    return "".join(out)


# ---------------------------------------------------------------------------
# deck sequence
# ---------------------------------------------------------------------------
def sequence(deck):
    """Alle Seiten eines Decks in Reihenfolge: Titel, je Teil eine Trennseite plus Kapitel, Quellen, Dank."""
    seq = [{"slug": "index", "title": plain(deck["title"]), "short": "Start", "kind": "cover", "part": None}]
    num = 0
    for pi, part in enumerate(deck["parts"]):
        if part.get("divider", True):
            seq.append({"slug": f"teil-{pi + 1}", "title": part["title"], "short": part["title"],
                        "kind": "divider", "part": pi, "sub": part.get("sub", "")})
        for slug in part["chapters"]:
            if slug not in CHAPTERS:
                raise SystemExit(f'{deck["id"]}: Kapitel «{slug}» fehlt in decks.CHAPTERS')
            c = dict(CHAPTERS[slug], slug=slug, part=pi)
            c.setdefault("kind", "chapter")
            c.setdefault("short", plain(c["title"]))
            if c["kind"] == "chapter":
                num += 1
                c["num"] = num
            seq.append(c)
    seq.append({"slug": "quellen", "title": "Quellen", "short": "Quellen", "kind": "sources", "part": None})
    seq.append({"slug": "danke", "title": "Vielen Dank", "short": "Danke", "kind": "closing", "part": None})
    return seq


def href_for(slug):
    return f"{slug}.html"


def resolve(fragment, deck_slugs, cited, where=""):
    """[[ref:a,b]] -> Fussnoten-Links; href="@slug" -> Link im Deck (fehlt die Seite im Deck, bleibt nur der Text)."""
    known = {s["id"] for s in SOURCES}
    missing = []

    def ref_sub(m):
        parts = []
        for rid in [x.strip() for x in m.group(1).split(",")]:
            if rid not in known:
                missing.append(rid)
                continue
            if rid not in cited:
                cited.append(rid)
            n = cited.index(rid) + 1
            parts.append(f'<a href="quellen.html#src-{rid}" title="Quelle {n}">{n}</a>')
        return '<sup class="ref">' + ", ".join(parts) + "</sup>"

    fragment = re.sub(r"\[\[ref:([^\]]+)\]\]", ref_sub, fragment)
    if missing:
        raise SystemExit(f"{where}: unbekannte Quellen {missing}")

    def link_sub(m):
        slug, anchor, text = m.group(1), m.group(2), m.group(3)
        if slug not in deck_slugs:
            return text
        return f'<a href="{href_for(slug)}{"#" + anchor if anchor else ""}">{text}</a>'

    fragment = re.sub(r'<a href="@([a-z0-9-]+)(?:#([a-zA-Z0-9_-]+))?">([\s\S]*?)</a>', link_sub, fragment)
    return fragment.replace('src="img/', 'src="../assets/img/')


def fragment_for(slug, deck_slugs, cited):
    path = os.path.join(HERE, "content", CHAPTERS[slug].get("file", slug) + ".html")
    return normalize_de(resolve(read(path), deck_slugs, cited, slug))


# ---------------------------------------------------------------------------
# page pieces
# ---------------------------------------------------------------------------
def toc_html(deck, seq, current_slug=None):
    out = ['<dialog class="toc" aria-label="Inhalt">', '<div class="toc-head">', '<h2>Inhalt</h2>',
           '<button class="toc-close" aria-label="Schliessen">×</button></div>', '<div class="toc-grid">']
    for pi, part in enumerate(deck["parts"]):
        out.append(f'<div class="toc-part"><h3>{part["title"]}</h3><ol>')
        for item in seq:
            if item["part"] != pi or item["kind"] == "divider":
                continue
            cur = ' aria-current="page"' if item["slug"] == current_slug else ""
            n = f'{item["num"]:02d}' if item.get("num") else "·"
            out.append(f'<li><a href="{href_for(item["slug"])}"{cur}><span class="n">{n}</span><span>{item["short"]}</span></a></li>')
        out.append("</ol></div>")
    out.append('<div class="toc-part"><h3>Mehr</h3><ol>')
    for slug, label in (("index", "Titelseite"), ("quellen", "Quellen"), ("danke", "Kontakt")):
        out.append(f'<li><a href="{href_for(slug)}"><span class="n">·</span><span>{label}</span></a></li>')
    out.append('<li><a href="../index.html"><span class="n">·</span><span>Alle drei Stufen</span></a></li>')
    out.append("</ol></div></div></dialog>")
    return "".join(out)


def top_html(deck, crumb="", progress=0):
    return ('<header class="top"><div class="top-row"><div class="top-left">'
            f'<a class="home" href="index.html">{SITE["title"]} · {deck["level"]}</a>'
            f'<span class="crumb">{crumb}</span></div>'
            '<div class="top-right">'
            '<button type="button" class="btn-ghost toc-btn" aria-haspopup="dialog">Inhalt</button>'
            f'</div></div><div class="progress"><span style="width:{progress}%"></span></div></header>')


def nav_html(prev=None, nxt=None, count=""):
    def link(cls, item, k):
        if item is None:
            return f'<a class="{cls} ph"><span class="k">{k}</span><span class="t"></span></a>'
        return (f'<a class="{cls}" href="{href_for(item["slug"])}"><span class="k">{k}</span>'
                f'<span class="t">{item["short"]}</span></a>')
    return ('<footer class="nav"><div class="nav-row">'
            + link("prev", prev, "← Zurück")
            + f'<span class="count">{count}</span>'
            + link("next", nxt, "Weiter →")
            + "</div></footer>")


def eyebrow(deck, item):
    part = deck["parts"][item["part"]]["title"] if item.get("part") is not None else ""
    n = f'<span class="n">{item["num"]:02d}</span>' if item.get("num") else ""
    return f'<div class="eyebrow"><span>{part}</span>{n}</div>'


def cover_body(deck, seq):
    return ('<div class="cover-photo"><img src="../assets/img/team.jpg" alt="">'
            '<img class="cover-logo" src="../assets/img/logo-white.png" alt="Gopf"></div>'
            '<div class="cover-text">'
            f'<div class="eyebrow"><span>{deck["kicker"]}</span></div>'
            f'<h1>{deck["title"]}</h1>'
            f'<p class="cover-date">{deck["date"]}</p>'
            f'<a class="start" href="{href_for(seq[1]["slug"])}">Los geht’s <span aria-hidden="true">→</span></a>'
            '<p class="cover-hint">Weiter mit <kbd>→</kbd>, zurück mit <kbd>←</kbd>. Jede Seite hat unten ein «Mehr lesen».</p>'
            '</div>')


def closing_body(deck):
    c = SITE["contact"]
    return ('<h1>Vielen Dank, dass du mit dabei warst!</h1>'
            '<div class="closing-row">'
            '<img class="closing-photo" src="../assets/img/kevin-round.jpg" alt="Kevin Kuhn">'
            '<img class="closing-qr" src="../assets/img/qr.png" alt="QR-Code zum Kontakt">'
            f'<div class="closing-contact"><p><b>{c["name"]}</b></p><p>{c["phone"]}<br>'
            f'<a href="mailto:{c["mail"]}">{c["mail"]}</a></p>'
            '<p class="closing-icons">'
            + (f'<a href="{c["linkedin"]}"><img src="../assets/img/linkedin.png" alt="LinkedIn"></a>' if c["linkedin"] else "")
            + f'<a href="mailto:{c["mail"]}"><img src="../assets/img/mail.png" alt="E-Mail"></a>'
            '<img class="closing-logo" src="../assets/img/logo-dark.png" alt="Gopf"></p></div>'
            '</div>'
            '<p class="closing-links"><a href="index.html">Zurück zum Anfang</a> · <a href="../index.html">Alle drei Stufen</a></p>')


def sources_body(cited):
    if not cited:
        return '<p class="intro">Dieses Deck zitiert keine externen Quellen.</p>'
    by_id = {s["id"]: s for s in SOURCES}
    out = ['<p class="intro">Zahlen und Aussagen in den Kapiteln verweisen auf diese Quellen. Titel stehen in der Originalsprache.</p>',
           '<div class="sources"><ol>']
    for n, rid in enumerate(cited, 1):
        s = by_id[rid]
        out.append(f'<li id="src-{rid}"><span class="n">{n}</span><span>{html.escape(s["text"])} '
                   f'<a href="{html.escape(s["url"])}" target="_blank" rel="noopener">{html.escape(s["url"])}</a></span></li>')
    out.append("</ol></div>")
    return "".join(out)


def article_html(deck, item, i, seq, cited, bodies):
    slug, kind = item["slug"], item["kind"]
    prev = seq[i - 1] if i > 0 else None
    nxt = seq[i + 1] if i + 1 < len(seq) else None
    attrs = {
        "id": slug, "data-title": plain(item["title"]),
        "data-prev": href_for(prev["slug"]) if prev else "",
        "data-next": href_for(nxt["slug"]) if nxt else "",
    }
    if item.get("num"):
        attrs["data-num"] = f'{item["num"]:02d}'
    attr_s = " ".join(f'{k}="{html.escape(str(v), quote=True)}"' for k, v in attrs.items())

    if kind == "cover":
        return f'<article class="cover" {attr_s}>{cover_body(deck, seq)}</article>'
    if kind == "divider":
        sub = f'<p>{item["sub"]}</p>' if item.get("sub") else ""
        return f'<article class="divider" {attr_s}><div class="divider-in"><h1>{item["title"]}</h1>{sub}</div></article>'
    if kind == "closing":
        return f'<article class="page closing" {attr_s}>{closing_body(deck)}</article>'
    if kind == "sources":
        return f'<article class="page" {attr_s}><h1>Quellen</h1>{sources_body(cited)}</article>'
    frag = bodies[slug]
    if kind == "page":
        return f'<article class="page" {attr_s}>{eyebrow(deck, item)}<h1>{item["title"]}</h1>{frag}</article>'
    if "<!-- /slide -->" not in frag:
        raise SystemExit(f"{slug}: Fragment braucht <!-- /slide --> nach dem Lead")
    lead, rest = frag.split("<!-- /slide -->", 1)
    fig_m = re.search(r"<figure[\s\S]*?</figure>", rest)
    if not fig_m:
        raise SystemExit(f"{slug}: Fragment braucht eine <figure>")
    figure = fig_m.group(0)
    notes_m = re.search(r'<div class="slide-notes">[\s\S]*?</div>', rest)
    notes = notes_m.group(0) if notes_m else ""
    more = rest.replace(figure, "", 1).replace(notes, "", 1)
    head = f'{eyebrow(deck, item)}<header class="slide"><h1>{item["title"]}</h1>{lead}</header>'
    return (f'<article class="chapter" {attr_s}><div class="col-text">{head}{notes}</div>'
            f'<div class="col-fig">{figure}</div>{more}</article>')


# ---------------------------------------------------------------------------
# assembly
# ---------------------------------------------------------------------------
def css_all():
    parts = [read(os.path.join(HERE, "assets", n)) for n in ("style.css", "widgets.css", "blocks.css")]
    wdir = os.path.join(HERE, "widgets")
    for name in sorted(os.listdir(wdir)):
        if name.endswith(".css"):
            parts.append(f"/* ---- {name} ---- */\n" + read(os.path.join(wdir, name)))
    parts.append(read(os.path.join(HERE, "assets", "skin.css")))
    return "\n".join(parts)


def widgets_js():
    parts = []
    wdir = os.path.join(HERE, "widgets")
    for name in sorted(os.listdir(wdir)):
        if name.endswith(".js"):
            parts.append(f"/* ---- {name} ---- */\n" + read(os.path.join(wdir, name)))
    return "\n".join(parts)


def head_html(title, prefix="../"):
    return ('<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            f'<title>{html.escape(title)}</title>{FONTS}'
            f'<link rel="stylesheet" href="{prefix}assets/style.css"></head>')


def build_assets():
    adir = os.path.join(ROOT, "assets")
    os.makedirs(os.path.join(adir, "img"), exist_ok=True)
    write(os.path.join(adir, "style.css"), css_all())
    shutil.copy(os.path.join(HERE, "assets", "app.js"), os.path.join(adir, "app.js"))
    write(os.path.join(adir, "widgets.js"), widgets_js())
    for name in os.listdir(os.path.join(HERE, "img")):
        shutil.copy(os.path.join(HERE, "img", name), os.path.join(adir, "img", name))


def crumb_for(deck, item):
    if item.get("part") is None:
        return ""
    return deck["parts"][item["part"]]["title"]


def build_deck(deck):
    seq = sequence(deck)
    slugs = {it["slug"] for it in seq}
    out_dir = os.path.join(ROOT, deck["id"])
    if os.path.isdir(out_dir):
        shutil.rmtree(out_dir)
    cited, bodies = [], {}
    for it in seq:  # erst alle Fragmente, damit die Quellenseite alle Zitate kennt
        if it["kind"] in ("chapter", "page"):
            bodies[it["slug"]] = fragment_for(it["slug"], slugs, cited)
    site = f'{SITE["title"]} · {deck["level"]}'
    n_seq = len(seq) - 1
    arts = []
    for i, item in enumerate(seq):
        art = article_html(deck, item, i, seq, cited, bodies)
        arts.append(art)
        prev = seq[i - 1] if i > 0 else None
        nxt = seq[i + 1] if i + 1 < len(seq) else None
        progress = round(i / n_seq * 100)
        title = site if item["kind"] == "cover" else f'{plain(item["title"])} – {site}'
        page = (head_html(title)
                + f'<body data-mode="multi" data-deck="{deck["id"]}" data-kind="{item["kind"]}" data-site="{html.escape(site)}"><div class="app-root">'
                + '<a class="skip" href="#main">Zum Inhalt springen</a>'
                + top_html(deck, crumb_for(deck, item), progress)
                + f'<main id="main">{art}</main>'
                + nav_html(prev, nxt, f"{i + 1} / {len(seq)}")
                + '</div>' + toc_html(deck, seq, item["slug"])
                + '<script src="../assets/app.js"></script><script src="../assets/widgets.js"></script></body></html>')
        write(os.path.join(out_dir, item["slug"] + ".html"), page)
    # Druckversion: alle Seiten untereinander, «Mehr lesen» aufgeklappt
    printed = "".join(arts).replace('<details class="more">', '<details class="more" open>')
    write(os.path.join(out_dir, "print.html"),
          head_html(site) + f'<body data-mode="print" data-deck="{deck["id"]}" data-site="{html.escape(site)}"><div class="app-root">'
          f'<main id="main">{printed}</main></div>'
          '<script src="../assets/app.js"></script><script src="../assets/widgets.js"></script></body></html>')
    n_ch = sum(1 for it in seq if it["kind"] == "chapter")
    print(f'{deck["id"]}: {len(seq)} Seiten, davon {n_ch} Kapitel, {len(cited)} Quellen')


def build_home():
    cards = []
    for d in DECKS:
        fits = "".join(f"<li>{x}</li>" for x in d["fits"])
        tag, go = ("a", "Zum Deck →") if d["ready"] else ("div", "Folgt in Kürze")
        cards.append(f'<{tag} class="level" href="{d["id"]}/index.html"><p class="k">Stufe {d["stufe"]}</p>'
                     f'<h2>{d["level"]}</h2><ul>{fits}</ul>'
                     f'<p class="k">Das nehme ich mit</p><p class="take">{d["take"]}</p>'
                     f'<span class="go">{go}</span></{tag}>')
    page = (head_html(SITE["title"], prefix="")
            + f'<body data-mode="multi" data-kind="home" data-site="{html.escape(SITE["title"])}"><div class="app-root">'
            '<main id="main"><article class="home-page">'
            '<img class="home-logo" src="assets/img/logo-dark.png" alt="Gopf">'
            f'<div class="eyebrow"><span>{SITE["kicker"]}</span></div>'
            f'<h1>{SITE["headline"]}</h1><p class="lead">{SITE["subtitle"]}</p>'
            f'<div class="levels">{"".join(cards)}</div>'
            '</article></main></div></body></html>')
    write(os.path.join(ROOT, "index.html"), normalize_de(page))


CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
]


def build_pdf(deck):
    chrome = next((c for c in CHROME_CANDIDATES if shutil.which(c) or os.path.exists(c)), None)
    if not chrome:
        raise SystemExit("PDF: Google Chrome oder Chromium nicht gefunden")
    out = os.path.join(ROOT, deck["id"], f'ki-prompting-{deck["id"]}.pdf')
    subprocess.run([chrome, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    "--virtual-time-budget=10000", "--run-all-compositor-stages-before-draw",
                    f"--print-to-pdf={out}", "file://" + os.path.join(ROOT, deck["id"], "print.html")],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"PDF: {os.path.getsize(out) / 1024:.0f} KB -> {out}")


if __name__ == "__main__":
    build_assets()
    build_home()
    for deck in DECKS:
        if not deck["ready"]:
            continue
        build_deck(deck)
        if "--pdf" in sys.argv:
            build_pdf(deck)
