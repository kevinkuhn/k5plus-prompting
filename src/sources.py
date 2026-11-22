"""Quellenliste: zusammengeführt aus den drei Kursen, aus denen die Kapitel stammen, plus eigene Einträge.

Im Text zitieren mit [[ref:id]]. Pro Deck erscheinen nur die dort zitierten Quellen, nummeriert nach erstem Vorkommen.
Bei gleicher id gewinnt der erste Eintrag (eigene, dann Prompting, Sprachmodelle, Agenten).
"""
from sources_up import SOURCES as _UP
from sources_ull import SOURCES as _ULL
from sources_pfc import SOURCES as _PFC

# Veröffentlichungen der K5-Gemeinden, die als Beispiele dienen. Vor Gebrauch am Original geprüft.
OWN = [
    {"id": "ebikon-budget-2027", "group": "k5",
     "text": "Gemeinde Ebikon (18. November 2026). Einwohnerrat genehmigt Budget 2027 und Kredit für Gebiet Bahnhof Ost.",
     "url": "https://www.ebikon.ch/news/einwohnerrat-genehmigt-budget-2027-und-kredit-fuer-gebiet-bahnhof-ost"},
    {"id": "kriens-stadtkern", "group": "k5",
     "text": "Kanton Luzern und Stadt Kriens (16. November 2026). Medienmitteilung: Kanton Luzern und Stadt Kriens planen gemeinsam die Neugestaltung des Stadtkerns.",
     "url": "https://www.stadt-kriens.ch/politik-und-verwaltung/aktuelle-nachrichten.page/1845/news/25685"},
    {"id": "kriens-wohnbaureglement", "group": "k5",
     "text": "Stadt Kriens. Wohnbaureglement der Stadt Kriens vom 28. Mai 2026 (Erlass Nr. 7906, gültig ab 1. November 2026).",
     "url": "https://www.stadt-kriens.ch/stadtbuero/dienstleistungen/rechtssammlung.page/508"},
    {"id": "luzern-mindestlohn-2027", "group": "k5",
     "text": "Stadt Luzern (29. Oktober 2026). Stadtluzerner Mindestlohn 2027 beträgt 23 Franken – Kontrollstrukturen sind im Aufbau.",
     "url": "https://www.stadtluzern.ch/aktuelles/newslist/3034615"},
    {"id": "emmen-parkgebuehren", "group": "k5",
     "text": "Gemeinde Emmen (10. November 2026). Parkgebühren: Einwohnerrat stellt sich hinter die Erhöhung.",
     "url": "https://www.emmen.ch/aktuellesinformationen/3045409"},
    {"id": "horw-hergiswilerstrasse", "group": "k5",
     "text": "Gemeinde Horw (6. November 2026). Bauarbeiten auf der Hergiswilerstrasse.",
     "url": "https://www.horw.ch/aktuellesinformationen/3043273"},
]

SOURCES, _seen = [], set()
for _s in OWN + _UP + _ULL + _PFC:
    if _s["id"] not in _seen:
        _seen.add(_s["id"])
        SOURCES.append(_s)
