# KI-Prompting für die K5-Gemeinden

Unterlagen zu den Prompt-Schulungen für LuzernPlus / K5Plus (November und Dezember 2026): drei Decks für Beginner, Intermediate und Advanced. Jede Seite ist eine Folie für die Bildschirmfreigabe und hat darunter ein «Mehr lesen» zum Nachlesen.

## Bauen

```bash
python3 src/build.py          # schreibt index.html, assets/ und pro Stufe einen Ordner
python3 src/build.py --pdf    # zusätzlich ein Handout-PDF pro Stufe (braucht Google Chrome)
python3 -m http.server 8765   # Vorschau: http://localhost:8765/
```

Python 3.8 oder neuer, keine weiteren Abhängigkeiten. Die erzeugten Seiten liegen im Repository-Root und werden von GitHub Pages ausgeliefert (Branch `main`, Ordner `/`).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/decks.py` | Die drei Decks: Teile, Reihenfolge, Titel der Kapitel |
| `src/content/<slug>.html` | Ein Kapitel. Kann in mehreren Decks vorkommen |
| `src/widgets/` | Interaktive Figuren (`App.widget('name', fn)`) mit ihrem CSS |
| `src/assets/skin.css` | Erscheinungsbild: League Spartan, Violett `#3000b1`, nur helles Design |
| `src/sources.py` | Quellen. Eigene Einträge (Mitteilungen der K5-Gemeinden) stehen in `OWN` |

Ein Kapitel besteht aus Lead, der Zeile `<!-- /slide -->`, einer `<figure>`, optional `<div class="slide-notes">` und `<details class="more">`. Seiten mit `kind: "page"` (Ablauf, Übungen, Spickzettel) sind frei aufgebaut.

## Herkunft der Inhalte

Die Kapitel stammen aus drei eigenen Kursen und wurden in die Du-Form übertragen: «Prompting verstehen», «Sprachmodelle verstehen» und «KI-Agenten im Controlling». Beispiele stützen sich auf Mitteilungen, die Ebikon, Emmen, Horw, Kriens und Luzern selbst veröffentlicht haben; jede Zahl ist am Original geprüft und auf der Quellenseite verlinkt. Anfragen von Einwohnerinnen und Einwohnern in den Beispielen sind erfunden.

Offene Punkte sind auf den Seiten gelb als `TODO` markiert.
