"""Quellenliste. Reihenfolge = Nummerierung. Im Text zitieren mit [[ref:id]]."""

SOURCES = [
    # --- 01 Der Prompt ---
    {"id": "anthropic-prompting", "group": "01-prompt",
     "text": "Anthropic. Prompt engineering overview (Claude Developer Platform, Entwicklerdokumentation, Stand 2026).",
     "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview"},
    {"id": "openai-prompting", "group": "01-prompt",
     "text": "OpenAI. Prompt engineering (Guide in der OpenAI-Entwicklerdokumentation, Stand 2026).",
     "url": "https://developers.openai.com/api/docs/guides/prompt-engineering"},

    # --- 02 Tokens ---
    {"id": "openai-tokens", "group": "02-tokens",
     "text": "OpenAI Help Center. What are tokens and how to count them? (Faustregel: 1 Token ≈ 4 Zeichen ≈ ¾ Wort im Englischen; 100 Tokens ≈ 75 Wörter).",
     "url": "https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them"},
    {"id": "tiktoken", "group": "02-tokens",
     "text": "OpenAI Cookbook. How to count tokens with tiktoken (Encoding o200k_base für GPT-4o und GPT-4o-mini; Vokabular von rund 200'000 Tokens).",
     "url": "https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken"},
    {"id": "token-languages", "group": "02-tokens",
     "text": "Petrov, A. et al. (2023). Language Model Tokenizers Introduce Unfairness Between Languages. NeurIPS 2023, arXiv:2305.15425 (gleicher Text braucht je nach Sprache bis zu 15-mal mehr Tokens).",
     "url": "https://arxiv.org/abs/2305.15425"},

    # --- 04 System-Prompt ---
    {"id": "anthropic-system-prompts", "group": "04-system-prompt",
     "text": "Anthropic. System prompts – Release Notes (veröffentlichte Systemprompts von claude.ai und der Claude-Apps, pro Modell datiert und laufend aktualisiert).",
     "url": "https://platform.claude.com/docs/en/release-notes/system-prompts/overview"},
    {"id": "anthropic-role", "group": "04-system-prompt",
     "text": "Anthropic. Prompting best practices, Abschnitt «Give Claude a role» (Entwicklerdokumentation, 2026; ersetzt die frühere Seite «Giving Claude a role with a system prompt»).",
     "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#give-claude-a-role"},

    # --- 05 Kontextfenster ---
    {"id": "claude-1m", "group": "05-context-window",
     "text": "Anthropic (12. August 2025). Claude Sonnet 4 now supports 1M tokens of context (Blog; Kontextfenster von 1 Mio. Tokens, ca. 75'000 Zeilen Code oder Dutzende Fachartikel in einer Anfrage).",
     "url": "https://claude.com/blog/1m-context"},
    {"id": "gemini-1m", "group": "05-context-window",
     "text": "Google (15. Februar 2024). Our next-generation model: Gemini 1.5 (Blog; Standard 128'000 Tokens, 1 Mio. Tokens zunächst nur in einer eingeschränkten Vorschau; ca. 700'000 Wörter oder 1 Stunde Video).",
     "url": "https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/"},
    {"id": "anthropic-context-eng", "group": "05-context-window",
     "text": "Anthropic Engineering (29. September 2025). Effective context engineering for AI agents (Blog; Kontext als begrenztes «Aufmerksamkeitsbudget» des Modells).",
     "url": "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"},

    # --- 06 Kontext ---
    {"id": "rag", "group": "06-context",
     "text": "Lewis, P. et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. NeurIPS 2020, arXiv:2005.11401.",
     "url": "https://arxiv.org/abs/2005.11401"},
    {"id": "gpt3-fewshot", "group": "06-context",
     "text": "Brown, T. et al. (2020). Language Models are Few-Shot Learners. NeurIPS 2020, arXiv:2005.14165 (GPT-3; Aufgaben lassen sich allein über Beispiele im Prompt lösen).",
     "url": "https://arxiv.org/abs/2005.14165"},

    # --- 07 Context Rot ---
    {"id": "context-rot", "group": "07-context-rot",
     "text": "Hong, K., Troynikov, A., Huber, J. / Chroma Research (14. Juli 2025). Context Rot: How Increasing Input Tokens Impacts LLM Performance (18 Modelle; Leistung sinkt mit wachsender Eingabelänge).",
     "url": "https://www.trychroma.com/research/context-rot"},
    {"id": "lost-in-middle", "group": "07-context-rot",
     "text": "Liu, N. F. et al. (2023). Lost in the Middle: How Language Models Use Long Contexts. arXiv:2307.03172 (Informationen in der Mitte langer Kontexte werden am schlechtesten genutzt).",
     "url": "https://arxiv.org/abs/2307.03172"},

    # --- 08 Statisch ---
    {"id": "openai-data-controls", "group": "08-static",
     "text": "OpenAI Help Center. How your data is used to improve model performance (Einstellung «Improve the model for everyone»; Business, Enterprise, Edu und API standardmässig nicht fürs Training).",
     "url": "https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance"},
    {"id": "openai-memory", "group": "08-static",
     "text": "OpenAI (Februar 2024). Memory and new controls for ChatGPT (Blog; ChatGPT merkt sich Informationen über Chats hinweg und personalisiert Antworten).",
     "url": "https://openai.com/index/memory-and-new-controls-for-chatgpt/"},
    {"id": "knowledge-cutoff", "group": "08-static",
     "text": "Anthropic. Models overview (Entwicklerdokumentation; Tabelle mit «Reliable knowledge cutoff» und «Training data cutoff» pro Modell, z. B. Claude Haiku 4.5: Feb. 2025).",
     "url": "https://platform.claude.com/docs/en/models/overview"},

    # --- 09 Techniken ---
    {"id": "cot", "group": "09-techniques",
     "text": "Wei, J. et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS 2022, arXiv:2201.11903.",
     "url": "https://arxiv.org/abs/2201.11903"},
    {"id": "anthropic-examples", "group": "09-techniques",
     "text": "Anthropic. Prompting best practices, Abschnitt «Use examples effectively» (Entwicklerdokumentation, 2026; ersetzt die frühere Seite zu Multishot-Prompting).",
     "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#use-examples-effectively"},

    # --- 13 Best Practices ---
    {"id": "anthropic-hallucinations", "group": "13-best-practices",
     "text": "Anthropic. Reduce hallucinations (Entwicklerdokumentation; «Ich weiss es nicht» erlauben, direkte Zitate verlangen, Aussagen mit Belegen prüfen lassen).",
     "url": "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"},
    {"id": "anthropic-clear", "group": "13-best-practices",
     "text": "Anthropic. Prompting best practices, Abschnitt «Be clear and direct» (Entwicklerdokumentation, 2026; ersetzt die frühere Seite «Be clear, direct, and detailed»).",
     "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct"},

    # --- 14 Wohin gehen die Daten ---
    {"id": "openai-privacy", "group": "14-where-does-it-go",
     "text": "OpenAI. Europe privacy policy (gilt für EWR, UK und Schweiz; Verantwortliche: OpenAI Ireland Ltd.; Stand «Updated: August 24, 2026»).",
     "url": "https://openai.com/policies/eu-privacy-policy/"},
    {"id": "anthropic-consumer-terms", "group": "14-where-does-it-go",
     "text": "Anthropic (28. August 2025). Updates to Consumer Terms and Privacy Policy (Free/Pro/Max: Training auf Chats, sofern nicht deaktiviert; 5 Jahre Aufbewahrung bei Zustimmung, sonst 30 Tage; Wahl bis 8. Okt. 2025).",
     "url": "https://www.anthropic.com/news/updates-to-our-consumer-terms"},
    {"id": "gemini-privacy", "group": "14-where-does-it-go",
     "text": "Google. Gemini Apps Privacy Hub (Support-Seite; geschulte Prüfpersonen lesen Stichproben von Chats; geprüfte Chats bis zu 3 Jahre aufbewahrt, auch nach Löschung; Standard-Aufbewahrung 18 Monate).",
     "url": "https://support.google.com/gemini/answer/13594961"},
    {"id": "openai-court-retention", "group": "14-where-does-it-go",
     "text": "OpenAI (5. Juni 2025, Update Okt. 2025). How we're responding to The New York Times' data demands (Gerichtsanordnung: auch gelöschte Chats aufbewahren; endete 26. Sept. 2025; Enterprise/Edu/ZDR ausgenommen).",
     "url": "https://openai.com/index/response-to-nyt-data-demands/"},

    # --- 15 Gratis heisst ---
    {"id": "meta-ai-ads", "group": "15-free-means",
     "text": "Meta (1. Oktober 2025). Improving Your Recommendations on Our Apps With AI at Meta (Newsroom; ab 16. Dez. 2025 fliessen Interaktionen mit Meta AI in Werbung und Empfehlungen; kein Opt-out; EU, UK, Südkorea ausgenommen).",
     "url": "https://about.fb.com/news/2025/10/improving-your-recommendations-apps-ai-meta/"},
    {"id": "openai-ads", "group": "15-free-means",
     "text": "OpenAI (9. Februar 2026, Updates bis Aug. 2026). Testing ads in ChatGPT (Werbung für Free- und Go-Nutzende, zuerst in den USA; Auswahl nach Chatthema, früheren Chats und Memory; Bezahlpläne werbefrei).",
     "url": "https://openai.com/index/testing-ads-in-chatgpt/"},
    {"id": "openai-terms", "group": "15-free-means",
     "text": "OpenAI. Europe Terms of Use (Nutzungsbedingungen für EWR, UK und Schweiz; Stand «Updated: January 16, 2026»; werden laufend geändert).",
     "url": "https://openai.com/policies/terms-of-use/"},
    {"id": "perplexity-privacy", "group": "15-free-means",
     "text": "Perplexity. Privacy Notice (Stand «Last updated: July 8, 2026»; Opt-out vom KI-Training über die Einstellung «AI data retention» im Konto, dokumentiert im Help Center «Data Collection at Perplexity»).",
     "url": "https://www.perplexity.ai/hub/legal/privacy-notice"},

    # --- 16 Was passiert ---
    {"id": "staab-inference", "group": "16-what-happens",
     "text": "Staab, R. et al. (2023). Beyond Memorization: Violating Privacy via Inference with Large Language Models. arXiv:2310.07298 (LLMs erschliessen Wohnort, Einkommen, Geschlecht u. a. aus Text; bis 85 % Top-1-Treffer).",
     "url": "https://arxiv.org/abs/2310.07298"},
    {"id": "openai-enterprise-privacy", "group": "16-what-happens",
     "text": "OpenAI. Enterprise privacy at OpenAI (Business, Enterprise, Edu, API: standardmässig kein Training auf Geschäftsdaten; Verschlüsselung AES-256 und TLS 1.2+; SOC 2; Aufbewahrung durch Kunden steuerbar).",
     "url": "https://openai.com/enterprise-privacy/"},
    {"id": "anthropic-commercial", "group": "16-what-happens",
     "text": "Anthropic. Commercial Terms of Service (Stand 17. Juni 2025; Anthropic trainiert keine Modelle mit Customer Content aus den kommerziellen Diensten und der API).",
     "url": "https://www.anthropic.com/legal/commercial-terms"},

    # --- 17 Organisation ---
    {"id": "dsg", "group": "17-organisation",
     "text": "Bundesgesetz über den Datenschutz (DSG), SR 235.1, in Kraft seit 1. September 2023. Fedlex.",
     "url": "https://www.fedlex.admin.ch/eli/cc/2022/491/de"},
    {"id": "stgb-320", "group": "17-organisation",
     "text": "Schweizerisches Strafgesetzbuch (StGB), SR 311.0, Art. 320 Verletzung des Amtsgeheimnisses (Freiheitsstrafe bis zu drei Jahren oder Geldstrafe; gilt auch nach Ende des Amtsverhältnisses). Fedlex.",
     "url": "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/de#art_320"},
    {"id": "edoeb-ki", "group": "17-organisation",
     "text": "EDÖB (9. November 2023). Geltendes Datenschutzgesetz ist auf KI direkt anwendbar (Mitteilung; Transparenzpflicht, ob Eingaben zum Training selbstlernender Programme verwendet werden).",
     "url": "https://www.edoeb.admin.ch/de/09112023-geltendes-dsg-ist-auf-ki-anwendbar"},
    {"id": "bund-genki", "group": "17-organisation",
     "text": "Bundeskanzlei (18. Januar 2024, V1.2). Merkblatt zur Verwendung von generativen KI-Werkzeugen in der Bundesverwaltung (Prompts können dem Training dienen, Daten meist im Ausland gespeichert; Vorgaben gelten).",
     "url": "https://www.bk.admin.ch/dam/de/sd-web/8Qmy4Jdh7Z6H/Merkblatt-zur-Verwendung-von-generativen-KI-Werkzeugen-in-der-Bundesverwaltung.pdf"},
    {"id": "zh-ki", "group": "17-organisation",
     "text": "Kanton Zürich, Finanzdirektion und Staatskanzlei (30. August 2023). Merkblatt zur Nutzung von Online-KI-Generatoren (keine Personendaten, Amtsgeheimnisse oder klassifizierten Informationen eingeben).",
     "url": "https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/politik-staat/kanton/kantonale-verwaltung/compliance/20230830_Merkblatt_zur_Nutzung_von_Online_KI-Generatoren%20(barrierefrei).pdf"},
    {"id": "isg", "group": "17-organisation",
     "text": "Bundesgesetz über die Informationssicherheit beim Bund (ISG), SR 128, in Kraft seit 1. Januar 2024; Art. 13 Klassifizierungsstufen «intern», «vertraulich», «geheim». Fedlex.",
     "url": "https://www.fedlex.admin.ch/eli/cc/2022/232/de#art_13"},
    {"id": "ms-copilot-enterprise", "group": "17-organisation",
     "text": "Microsoft Learn (Stand Mai 2026). Enterprise data protection in Microsoft Copilot, früher Microsoft 365 Copilot (Prompts und Antworten nicht fürs Training der Basismodelle; Verschlüsselung, Mandantenisolation).",
     "url": "https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection"},
]
