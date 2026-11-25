"""Die drei Decks: Reihenfolge, Teile, Kapitel.

Der Text eines Kapitels liegt in content/<slug>.html. Ein Kapitel kann in mehreren Decks vorkommen;
Nummerierung, Inhaltsverzeichnis und Navigation entstehen pro Deck.

kind: «chapter» (Standard: Titel, Lead, eine Figur, «Mehr lesen») oder «page» (freie Seite, z. B. Ablauf, Übung).
Titel dürfen ein <em>…</em> enthalten: dieser Teil erscheint in der Akzentfarbe.
"""

SITE = {
    "title": "KI-Prompting",
    "kicker": "K5Plus · Prompt-Schulungen 2026",
    "headline": "KI-Prompting für die <em>öffentliche Verwaltung</em>",
    "subtitle": "Unterlagen zu den drei Schulungen für die Mitarbeitenden der K5-Gemeinden. "
                "Wähle die Stufe, in der du angemeldet bist.",
    "contact": {"name": "Kevin Kuhn", "phone": "+4178 863 28 20", "mail": "kevin.kuhn@gopf.com", "linkedin": "https://www.linkedin.com/in/kuhnkevin/"},
}

CHAPTERS = {
    # --- Rahmen ---
    "b-ablauf": {"title": "Ablauf", "kind": "page"},
    "umfrage": {"title": "Aus den <em>Umfragen</em>", "short": "Aus den Umfragen", "kind": "page"},
    "b-uebung-1": {"title": "Übung 1: Eine <em>Anfrage beantworten</em>", "short": "Übung 1: Anfrage beantworten", "kind": "page"},
    "b-uebung-2": {"title": "Übung 2: Einen Amtstext <em>verständlich machen</em>", "short": "Übung 2: Amtstext vereinfachen", "kind": "page"},
    "experiment": {"title": "Ein <em>Experiment</em>", "short": "Experiment", "kind": "page"},
    "ideen": {"title": "Wo könnte KI <em>bei dir</em> helfen?", "short": "Ideen sammeln", "kind": "page"},
    "b-spickzettel": {"title": "Spickzettel", "kind": "page"},

    "i-ablauf": {"title": "Ablauf", "kind": "page"},
    "i-uebung-1": {"title": "Übung 1: Die KI <em>baut den Prompt</em>", "short": "Übung 1: Sprach-Briefing", "kind": "page"},
    "i-uebung-2": {"title": "Übung 2: Ein Prompt, <em>zwei Tools</em>", "short": "Übung 2: Zwei Tools", "kind": "page"},
    "i-spickzettel": {"title": "Spickzettel", "kind": "page"},

    # --- Intermediate ---
    "eingabe-ausgabe": {"title": "Eingabe, Modell, <em>Ausgabe</em>", "short": "Eingabe und Ausgabe"},
    "kontextfenster": {"title": "Das <em>Kontextfenster</em>", "short": "Kontextfenster"},
    "context-rot": {"title": "Wenn das Gespräch <em>zu lang</em> wird", "short": "Lange Gespräche"},
    "techniken": {"title": "Ein Beispiel schlägt <em>jede Beschreibung</em>", "short": "Beispiele und Techniken"},
    "briefing": {"title": "<em>Sprechen</em> statt tippen: das Briefing", "short": "Sprechen statt tippen"},
    "prompt-hilfe": {"title": "Die KI <em>baut den Prompt</em>", "short": "KI als Prompt-Hilfe"},
    "system-prompt": {"title": "Vorlagen <em>hinterlegen</em>: der System-Prompt", "short": "Vorlagen hinterlegen"},
    "rag": {"title": "Wie heutige <em>Chatbots</em> arbeiten", "short": "So arbeiten Chatbots (RAG)", "wide": True},
    "kontext-mitgeben": {"title": "<em>Prüfbar</em> statt plausibel: Kontext mitgeben", "short": "Kontext mitgeben"},
    "ki-ton": {"title": "Kein <em>KI-Ton</em>", "short": "Kein KI-Ton"},
    "drei-kis": {"title": "Derselbe Prompt in <em>drei KIs</em>", "short": "Ein Prompt, drei KIs"},
    "tool-wahl": {"title": "Welches Tool <em>wofür</em>?", "short": "Welches Tool wofür"},
    "formate": {"title": "Mehr als <em>Frage und Antwort</em>", "short": "Tabellen, Protokolle, Bilder"},
    "agenten": {"title": "Vom Chatbot zum <em>Agenten</em>", "short": "Was ist ein Agent", "wide": True},
    "mehr-als-chat": {"title": "Dokumente, Werkzeuge, <em>Agenten</em>", "short": "Werkzeuge und Agenten"},

    # --- Advanced ---
    "a-ablauf": {"title": "Ablauf", "kind": "page"},
    "a-uebung-1": {"title": "Übung: Per Sprache zur <em>Agenten-Instruktion</em>", "short": "Übung: Agenten-Instruktion", "kind": "page"},
    "a-spickzettel": {"title": "Spickzettel", "kind": "page"},
    "markdown": {"title": "<em>Markdown</em>: Struktur, die das Modell versteht", "short": "Markdown"},
    "html-ergebnis": {"title": "<em>HTML</em> als Ergebnis: ein Bericht in einer Datei", "short": "HTML als Ergebnis"},
    "prompt-stufen": {"title": "Vom einfachen Satz zur <em>Agenten-Instruktion</em>", "short": "Vier Stufen"},
    "spektrum": {"title": "Vom Chat zum Agenten: <em>ein Spektrum</em>", "short": "Vom Chat zum Agenten"},
    "bausteine": {"title": "<em>Sechs Bausteine</em> eines Agenten", "short": "Sechs Bausteine"},
    "schleife": {"title": "So arbeitet ein Agent: <em>die Schleife</em>", "short": "Die Schleife"},
    "ausloeser": {"title": "Wie ein Agent <em>ausgelöst</em> wird", "short": "Auslöser"},
    "agent-builder": {"title": "Ein einfacher Agent mit <em>Agent Builder</em>", "short": "Agent Builder"},
    "gleiche-bausteine": {"title": "Gleiche Bausteine, <em>andere Namen</em>", "short": "Gleiche Bausteine"},
    "anbindung": {"title": "Werkzeuge, Connectors, <em>MCP und Skills</em>", "short": "Werkzeuge, MCP, Skills", "wide": True},
    "it-freigabe": {"title": "Was deine IT <em>vorab freigeben</em> muss", "short": "Was die IT freigibt"},
    "rechnet-nicht": {"title": "Ein Sprachmodell <em>rechnet nicht</em>", "short": "Rechnet nicht"},
    "fehlerkette": {"title": "Fehler pflanzen sich fort: <em>die Fehlerkette</em>", "short": "Die Fehlerkette"},
    "agent-pruefen": {"title": "<em>Sechs Wege</em>, einen Agenten zu prüfen", "short": "Sechs Prüfwege"},
    "risiken": {"title": "Die wichtigsten <em>Risiken</em> – und was dagegen hilft", "short": "Risiken"},
    "prompt-bibliothek": {"title": "Ein <em>Verzeichnis</em> der KI-Abläufe", "short": "Verzeichnis der KI-Abläufe"},
    "checkliste": {"title": "<em>Checkliste</em> vor dem Produktivstart", "short": "Checkliste"},

    # --- Was KI kann und was nicht ---
    "raten": {"title": "Ein Sprachmodell kann vor allem eines: <em>sehr gut raten</em>", "short": "Sehr gut raten"},
    "begriffe": {"title": "Drei Begriffe: <em>Prompt, Sprachmodell, Token</em>", "short": "Drei Begriffe"},
    "wuerfel": {"title": "Gleiche Frage, <em>andere Antwort</em>", "short": "Jedes Mal anders"},
    "erfinden": {"title": "Die KI <em>erfindet</em> manchmal Dinge", "short": "Erfinden und prüfen"},
    "lernt-nicht": {"title": "Das Modell <em>lernt nicht mit</em>", "short": "Lernt nicht mit"},
    "gut-schlecht": {"title": "Wofür KI <em>taugt</em> – und wofür nicht", "short": "Stärken und Schwächen"},

    # --- Prompten ---
    "prompt": {"title": "Was ist ein <em>Prompt</em>?", "short": "Der Prompt"},
    "kontext-statt-rolle": {"title": "<em>Kontext</em> schlägt Rolle", "short": "Kontext statt Rolle"},
    "schritte": {"title": "Grosse Aufgaben in <em>kleine Schritte</em> teilen", "short": "Kleine Schritte"},
    "runden": {"title": "In <em>Runden</em> arbeiten", "short": "In Runden arbeiten"},
    "rueckfragen": {"title": "Lass dir <em>Fragen stellen</em>", "short": "Rückfragen"},
    "standard-prompt": {"title": "Ein Prompt, der <em>fast immer</em> passt", "short": "Der Standard-Prompt"},
    "alltag": {"title": "Drei Beispiele aus dem <em>Gemeindealltag</em>", "short": "Gemeindealltag"},

    # --- Vertrauen und Sicherheit ---
    "best-practices": {"title": "Das Modell schreibt, <em>du unterschreibst</em>", "short": "Gewohnheiten und Prüfen"},
    "fremde-person": {"title": "Wohin geht <em>dein Prompt</em>?", "short": "Wohin geht der Prompt"},
    "organisation": {"title": "Die <em>Ampel</em>: was in welches Tool darf", "short": "Die Ampel"},
    "gratis": {"title": "Gratis heisst: du zahlst <em>mit Daten</em>", "short": "Gratis oder bezahlt"},
}

DECKS = [
    {
        "id": "beginner", "level": "Beginner", "stufe": 1, "ready": True,
        "kicker": "Beginner-Kurs",
        "title": "Intro zu <em>KI-Prompting</em> für die öffentliche Verwaltung",
        "date": "Durchführungen: 25.11. · 26.11. · 1.12. · 21.12.2026",
        "fits": ["Ich habe KI-Tools noch nie oder nur kurz ausprobiert.",
                 "Ich weiss nicht genau, was ich eintippen soll.",
                 "Ich möchte verstehen, was KI kann – und was nicht."],
        "take": "Die ersten eigenen Prompts schreiben, Möglichkeiten und Grenzen kennen.",
        "parts": [
            {"title": "Start", "divider": False, "chapters": ["b-ablauf"]},
            {"title": "Was KI kann und was nicht", "sub": "Was passiert eigentlich, wenn ich etwas eintippe?",
             "chapters": ["begriffe", "raten", "erfinden", "lernt-nicht", "gut-schlecht"]},
            {"title": "Was tippe ich ein?", "sub": "Die ersten eigenen Prompts.",
             "chapters": ["prompt", "kontext-statt-rolle", "schritte", "runden", "rueckfragen", "standard-prompt"]},
            {"title": "Gemeindealltag", "sub": "Einfache Beispiele, die du morgen brauchen kannst.",
             "chapters": ["alltag"]},
            {"title": "Vertrauen und Sicherheit", "sub": "Welches Tool passt, und welche Daten darf ich teilen?",
             "chapters": ["best-practices", "fremde-person", "organisation"]},
            {"title": "Übungen", "sub": "30 Minuten, zwei Übungen zum Nachmachen.",
             "chapters": ["b-uebung-1", "b-uebung-2", "experiment", "ideen"]},
            {"title": "Fragen", "chapters": ["b-spickzettel"]},
        ],
    },
    {
        "id": "intermediate", "level": "Intermediate", "stufe": 2, "ready": True,
        "kicker": "Intermediate-Kurs",
        "title": "<em>KI-Prompting</em> für die öffentliche Verwaltung",
        "date": "Durchführungen: 25.11. · 30.11. · 2.12. · 9.12. · 10.12. · 15.12. · 17.12.2026",
        "fits": ["Ich nutze KI regelmässig, z. B. für Texte, E-Mails oder Zusammenfassungen.",
                 "Die Resultate sind brauchbar, aber oft nicht ganz das, was ich will.",
                 "Ich arbeite meistens mit einem einzigen Tool."],
        "take": "Bessere Prompts, Spracheingabe, KI als Prompt-Hilfe und das richtige Tool für jede Aufgabe.",
        "parts": [
            {"title": "Start", "divider": False, "chapters": ["i-ablauf"]},
            {"title": "Warum Prompts wirken", "sub": "Was das Modell liest, und wie viel davon.",
             "chapters": ["schritte", "eingabe-ausgabe", "kontextfenster", "context-rot"]},
            {"title": "Techniken", "sub": "Weniger Runden bis zum brauchbaren Ergebnis.",
             "chapters": ["kontext-statt-rolle", "techniken", "rueckfragen", "briefing", "prompt-hilfe", "system-prompt"]},
            {"title": "Qualität", "sub": "Weniger Erfundenes, weniger KI-Ton.",
             "chapters": ["rag", "kontext-mitgeben", "ki-ton"]},
            {"title": "Tool und Datenschutz", "sub": "Welches Tool wann, und was ist heikel?",
             "chapters": ["drei-kis", "tool-wahl", "lernt-nicht", "gratis", "organisation"]},
            {"title": "Mehr als Frage und Antwort", "sub": "Tabellen, Protokolle, Bilder, und was ein Agent ist.",
             "chapters": ["formate", "agenten"]},
            {"title": "Übungen", "sub": "30 Minuten, zwei Übungen zum Nachmachen.",
             "chapters": ["i-uebung-1", "i-uebung-2", "experiment", "ideen"]},
            {"title": "Fragen", "chapters": ["i-spickzettel"]},
        ],
    },
    {
        "id": "advanced", "level": "Advanced", "stufe": 3, "ready": True,
        "kicker": "Advanced-Kurs",
        "title": "<em>KI-Prompting</em> für die öffentliche Verwaltung",
        "date": "Durchführungen: 26.11. · 30.11. · 4.12. · 21.12. · 22.12.2026",
        "fits": ["Ich nutze KI mehrmals täglich.",
                 "Ich nutze mehrere Tools und habe eigene Vorlagen oder Prompts.",
                 "Mich interessieren Dateiformate, Automatisierung und Agenten."],
        "take": "Arbeiten mit Markdown und HTML, Agenten konfigurieren und ihre Resultate überprüfen.",
        "parts": [
            {"title": "Start", "divider": False, "chapters": ["a-ablauf"]},
            {"title": "Formate", "sub": "Markdown hinein, HTML heraus.",
             "chapters": ["markdown", "html-ergebnis", "prompt-stufen"]},
            {"title": "Agenten", "sub": "Aufsetzen: Bausteine, Schleife, Auslöser.",
             "chapters": ["schritte", "spektrum", "bausteine", "schleife", "ausloeser", "agent-builder", "gleiche-bausteine"]},
            {"title": "Anbindung", "sub": "Wie der Agent an Dokumente und Systeme kommt.",
             "chapters": ["rag", "anbindung", "it-freigabe"]},
            {"title": "Prüfen", "sub": "Überwachen und die Resultate überprüfen.",
             "chapters": ["rechnet-nicht", "fehlerkette", "agent-pruefen", "risiken"]},
            {"title": "Governance", "sub": "Was bleibt, wenn die Schulung vorbei ist.",
             "chapters": ["prompt-bibliothek", "checkliste"]},
            {"title": "Übung", "sub": "25 Minuten, eine Übung zum Nachmachen.",
             "chapters": ["a-uebung-1", "experiment", "ideen"]},
            {"title": "Fragen", "chapters": ["a-spickzettel"]},
        ],
    },
]
