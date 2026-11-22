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
    "contact": {"name": "Kevin Kuhn", "phone": "+4178 863 28 20", "mail": "kevin.kuhn@gopf.com", "linkedin": ""},
}

CHAPTERS = {
    # --- Rahmen ---
    "b-ablauf": {"title": "Ablauf", "kind": "page"},
    "umfrage": {"title": "Aus den <em>Umfragen</em>", "short": "Aus den Umfragen", "kind": "page"},
    "b-uebung-1": {"title": "Übung 1: Eine <em>Anfrage beantworten</em>", "short": "Übung 1: Anfrage beantworten", "kind": "page"},
    "b-uebung-2": {"title": "Übung 2: Einen Amtstext <em>verständlich machen</em>", "short": "Übung 2: Amtstext vereinfachen", "kind": "page"},
    "ideen": {"title": "Wo könnte KI <em>bei dir</em> helfen?", "short": "Ideen sammeln", "kind": "page"},
    "b-spickzettel": {"title": "Spickzettel", "kind": "page"},

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
        "date": "25.11.2026",
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
             "chapters": ["b-uebung-1", "b-uebung-2", "ideen"]},
            {"title": "Fragen", "chapters": ["b-spickzettel"]},
        ],
    },
    {
        "id": "intermediate", "level": "Intermediate", "stufe": 2, "ready": False,
        "kicker": "Intermediate-Kurs",
        "title": "<em>KI-Prompting</em> für die öffentliche Verwaltung",
        "date": "25.11.2026",
        "fits": ["Ich nutze KI regelmässig, z. B. für Texte, E-Mails oder Zusammenfassungen.",
                 "Die Resultate sind brauchbar, aber oft nicht ganz das, was ich will.",
                 "Ich arbeite meistens mit einem einzigen Tool."],
        "take": "Bessere Prompts, Spracheingabe, KI als Prompt-Hilfe und das richtige Tool für jede Aufgabe.",
        "parts": [],
    },
    {
        "id": "advanced", "level": "Advanced", "stufe": 3, "ready": False,
        "kicker": "Advanced-Kurs",
        "title": "<em>KI-Prompting</em> für die öffentliche Verwaltung",
        "date": "26.11.2026",
        "fits": ["Ich nutze KI mehrmals täglich.",
                 "Ich nutze mehrere Tools und habe eigene Vorlagen oder Prompts.",
                 "Mich interessieren Dateiformate, Automatisierung und Agenten."],
        "take": "Arbeiten mit Markdown und HTML, Agenten konfigurieren und ihre Resultate überprüfen.",
        "parts": [],
    },
]
