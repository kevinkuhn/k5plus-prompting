"""Quellenliste. Reihenfolge = Nummerierung. Im Text zitieren mit [[ref:id]].

«group» ist das Kapitel, in dem die Quelle zum ersten Mal vorkommt (bestimmt den Abschnitt auf der Quellenseite).
Microsoft-Learn-Daten in Klammern = letzte Aktualisierung der Seite; abgerufen Oktober 2026.
"""

MSL = "https://learn.microsoft.com/en-us/"

SOURCES = [
    # --- 01 Was ist ein Agent ---
    {"id": "russell-norvig", "group": "01-agent",
     "text": "Russell, S.; Norvig, P. (2021). Artificial Intelligence – A Modern Approach, 4. Aufl. Pearson (Agent: nimmt seine Umgebung über Sensoren wahr und wirkt über Aktoren auf sie ein).",
     "url": "https://aima.cs.berkeley.edu/"},
    {"id": "wooldridge", "group": "01-agent",
     "text": "Wooldridge, M.; Jennings, N. R. (1995). Intelligent agents: theory and practice. The Knowledge Engineering Review 10(2), 115–152 (Autonomie, Reaktivität, Proaktivität, soziale Fähigkeit).",
     "url": "https://doi.org/10.1017/S0269888900008122"},
    {"id": "anthropic-agents", "group": "01-agent",
     "text": "Schluntz, E.; Zhang, B. (2024). Building effective agents. Anthropic (Workflows vs. Agenten, «augmented LLM», Routing, Risiko sich aufschaukelnder Fehler).",
     "url": "https://www.anthropic.com/research/building-effective-agents"},

    # --- 03 Bausteine ---
    {"id": "wang-survey", "group": "03-building-blocks",
     "text": "Wang, L. et al. (2024). A survey on large language model based autonomous agents. Frontiers of Computer Science 18 (vier Module: Profil, Gedächtnis, Planung, Aktion).",
     "url": "https://doi.org/10.1007/s11704-024-40231-1"},

    # --- 04 Schleife ---
    {"id": "react", "group": "04-loop",
     "text": "Yao, S. et al. (2023). ReAct: Synergizing reasoning and acting in language models. ICLR 2023, arXiv:2210.03629.",
     "url": "https://arxiv.org/abs/2210.03629"},

    # --- 05 Auslöser ---
    {"id": "ms-agent-builder", "group": "05-triggers",
     "text": "Microsoft Learn. Agent Builder in Microsoft 365 Copilot (30.09.2026).",
     "url": MSL + "microsoft-365/copilot/extensibility/agent-builder"},
    {"id": "ms-cs-tools", "group": "05-triggers",
     "text": "Microsoft Learn. Copilot Studio: Add tools (01.10.2026); Event triggers (09.09.2026); Agent flows (03.08.2026).",
     "url": MSL + "microsoft-copilot-studio/authoring-triggers-about"},
    {"id": "claude-code-docs", "group": "05-triggers",
     "text": "Anthropic. Claude Code Documentation – Setup, Memory, Skills, Subagents, Settings, Headless, Routines, Costs (Stand Oktober 2026).",
     "url": "https://code.claude.com/docs"},

    # --- 07 Rechnen ---
    {"id": "dziri", "group": "07-no-calculator",
     "text": "Dziri, N. et al. (2023). Faith and Fate: Limits of transformers on compositionality. NeurIPS 2023, arXiv:2305.18654 (Multiplikation mit GPT-4, Werte aus Tabelle gerundet).",
     "url": "https://arxiv.org/abs/2305.18654"},
    {"id": "bie", "group": "07-no-calculator",
     "text": "Bie, A. et al. (2026). AI-rithmetic. arXiv:2602.10416 (Preprint; Genauigkeit bei der Addition sinkt mit der Stellenzahl).",
     "url": "https://arxiv.org/abs/2602.10416"},
    {"id": "pal", "group": "07-no-calculator",
     "text": "Gao, L. et al. (2023). PAL: Program-aided language models. ICML 2023, arXiv:2211.10435.",
     "url": "https://arxiv.org/abs/2211.10435"},

    # --- 08 Nicht-Determinismus ---
    {"id": "atil", "group": "08-nondeterminism",
     "text": "Atil, B. et al. (2025). Non-determinism of «deterministic» LLM settings. arXiv:2408.04667 v5 (Preprint; 5 Modelle, 8 Aufgaben, je 10 Läufe).",
     "url": "https://arxiv.org/abs/2408.04667"},
    {"id": "ms-instructions", "group": "08-nondeterminism",
     "text": "Microsoft Learn. Write effective instructions for declarative agents (11.08.2026).",
     "url": MSL + "microsoft-365/copilot/extensibility/declarative-agent-instructions"},

    # --- 10 Modellgrösse ---
    {"id": "kaplan", "group": "10-model-size",
     "text": "Kaplan, J. et al. (2020). Scaling laws for neural language models. arXiv:2001.08361.",
     "url": "https://arxiv.org/abs/2001.08361"},
    {"id": "snell", "group": "10-model-size",
     "text": "Snell, C. et al. (2024). Scaling LLM test-time compute optimally can be more effective than scaling model parameters. arXiv:2408.03314.",
     "url": "https://arxiv.org/abs/2408.03314"},
    {"id": "anthropic-thinking", "group": "10-model-size",
     "text": "Anthropic. Extended thinking (Entwicklerdokumentation; Denk-Tokens werden als Ausgabe-Tokens verrechnet).",
     "url": "https://platform.claude.com/docs/en/build-with-claude/extended-thinking"},
    {"id": "ms-build-agents", "group": "10-model-size",
     "text": "Microsoft Learn. Build agents with Agent Builder (30.09.2026).",
     "url": MSL + "microsoft-365/copilot/extensibility/agent-builder-build-agents"},
    {"id": "anthropic-pricing", "group": "10-model-size",
     "text": "Anthropic. Claude Pricing und API Pricing (abgerufen 20.10.2026; auch platform.claude.com/docs/en/about-claude/pricing).",
     "url": "https://claude.com/pricing"},

    # --- 11 Modellwahl ---
    {"id": "ms-billing", "group": "11-model-routing",
     "text": "Microsoft Learn. Copilot Studio: Billing rates and management (15.10.2026); Copilot Studio licensing.",
     "url": MSL + "microsoft-copilot-studio/requirements-messages-management"},

    # --- 12 Preismodelle ---
    {"id": "ms-licensing-guide", "group": "12-pricing",
     "text": "Microsoft. Microsoft Copilot Studio Licensing Guide; Microsoft 365 Copilot Enterprise pricing (USD-Listenpreise).",
     "url": "https://www.microsoft.com/licensing/guidance/Microsoft-Copilot-Studio"},

    # --- 14 Vier Stufen ---
    {"id": "prompt-report", "group": "14-prompt-levels",
     "text": "Schulhoff, S. et al. (2024). The Prompt Report: A systematic survey of prompting techniques. arXiv:2406.06608 (58 Techniken in sechs Familien).",
     "url": "https://arxiv.org/abs/2406.06608"},
    {"id": "brown", "group": "14-prompt-levels",
     "text": "Brown, T. et al. (2020). Language models are few-shot learners. NeurIPS 2020, arXiv:2005.14165.",
     "url": "https://arxiv.org/abs/2005.14165"},
    {"id": "wei", "group": "14-prompt-levels",
     "text": "Wei, J. et al. (2022). Chain-of-thought prompting elicits reasoning in large language models. NeurIPS 2022, arXiv:2201.11903.",
     "url": "https://arxiv.org/abs/2201.11903"},
    {"id": "kojima", "group": "14-prompt-levels",
     "text": "Kojima, T. et al. (2022). Large language models are zero-shot reasoners. NeurIPS 2022, arXiv:2205.11916.",
     "url": "https://arxiv.org/abs/2205.11916"},

    # --- 17 Lizenzen ---
    {"id": "ms-prereq", "group": "17-licensing",
     "text": "Microsoft Learn. Agent capabilities and licensing; Cost considerations (30.09.2026).",
     "url": MSL + "microsoft-365/copilot/extensibility/prerequisites"},

    # --- 18 IT-Freigaben ---
    {"id": "ms-admin", "group": "18-it-prereq",
     "text": "Microsoft Learn. Agent settings in the Microsoft 365 admin center; Set up pay-as-you-go (13.10.2026).",
     "url": MSL + "microsoft-365/admin/manage/agent-settings"},
    {"id": "ms-knowledge", "group": "18-it-prereq",
     "text": "Microsoft Learn. Add knowledge to agents (30.09.2026); Share and manage agents (07.08.2026).",
     "url": MSL + "microsoft-365/copilot/extensibility/agent-builder-add-knowledge"},
    {"id": "ms-dlp", "group": "18-it-prereq",
     "text": "Microsoft Learn. Copilot Studio: Data policies (15.10.2026).",
     "url": MSL + "microsoft-copilot-studio/admin-data-loss-prevention"},

    # --- 20 Copilot Studio ---
    {"id": "ms-cs-start", "group": "20-copilot-studio",
     "text": "Microsoft Learn. Copilot Studio: Get started (22.09.2026); Create your first agent; SharePoint knowledge (05.10.2026).",
     "url": MSL + "microsoft-copilot-studio/fundamentals-get-started"},
    {"id": "ms-cs-test", "group": "20-copilot-studio",
     "text": "Microsoft Learn. Copilot Studio: Test your agent (04.07.2026); Agent evaluation (06.10.2026); Publish channels (24.09.2026).",
     "url": MSL + "microsoft-copilot-studio/authoring-test-bot"},

    # --- 21 Claude-App ---
    {"id": "claude-support", "group": "21-claude-app",
     "text": "Anthropic Support. What are projects; Using skills in Claude; Schedule recurring tasks.",
     "url": "https://support.claude.com"},
    {"id": "mcp", "group": "21-claude-app",
     "text": "Anthropic (2024). Introducing the Model Context Protocol.",
     "url": "https://www.anthropic.com/news/model-context-protocol"},

    # --- 26 Validierung ---
    {"id": "zheng", "group": "26-validation",
     "text": "Zheng, L. et al. (2023). Judging LLM-as-a-judge with MT-Bench and Chatbot Arena. NeurIPS 2023, arXiv:2306.05685 (Verzerrungen bei Position, Länge und eigenen Texten).",
     "url": "https://arxiv.org/abs/2306.05685"},
    {"id": "nist", "group": "26-validation",
     "text": "NIST (2023). Artificial Intelligence Risk Management Framework (AI RMF 1.0), NIST AI 100-1 (Govern, Map, Measure, Manage).",
     "url": "https://doi.org/10.6028/NIST.AI.100-1"},

    # --- 27 Risiken ---
    {"id": "owasp", "group": "27-risks",
     "text": "OWASP (2025). OWASP Top 10 for LLM Applications 2025.",
     "url": "https://genai.owasp.org/llm-top-10/"},
    {"id": "gartner", "group": "27-risks",
     "text": "Gartner (25.06.2025). Gartner predicts over 40% of agentic AI projects will be canceled by end of 2027. Pressemitteilung.",
     "url": "https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027"},
    {"id": "willison-trifecta", "group": "27-risks",
     "text": "Willison, S. (16.06.2025). The lethal trifecta for AI agents: private data, untrusted content, and external communication. Simon Willison’s Weblog.",
     "url": "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"},
    {"id": "meta-rule-of-two", "group": "27-risks",
     "text": "Meta (31.10.2025). Agents Rule of Two: A Practical Approach to AI Agent Security (höchstens zwei von drei Eigenschaften pro Sitzung; sonst Freigabe durch einen Menschen).",
     "url": "https://ai.meta.com/blog/practical-ai-agent-security/"},
    {"id": "anthropic-auto-mode", "group": "27-risks",
     "text": "Hughes, J. (25.03.2026). How we built Claude Code auto mode: a safer way to skip permissions. Anthropic Engineering (Nutzer bestätigen 93 % der Rückfragen; Erhebungsmethode nicht angegeben).",
     "url": "https://www.anthropic.com/engineering/claude-code-auto-mode"},

    # --- 28 Checkliste ---
    {"id": "ai-act", "group": "28-checklist",
     "text": "Verordnung (EU) 2024/1689 (KI-Verordnung, «AI Act»), Art. 4 KI-Kompetenz.",
     "url": "https://eur-lex.europa.eu/eli/reg/2024/1689/oj"},
]
