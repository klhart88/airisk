/* Program content for the Enterprise AI Risk, Governance & Audit Readiness program.
   Source: Program Design Plan v0.3. Edit here to change what the app shows. */
window.PROGRAM = {
  title: "AI Risk Competency Program",
  version: "Plan v0.3 · App Phase 1 + Advisor",

  sessions: [
    { n: 1, name: "Learn", time: "60 min", what: "10-minute spaced review of an earlier week, then the core reading" },
    { n: 2, name: "Understand", time: "60 min", what: "Framework study and concept review; self-check questions; the “explain it” prompt" },
    { n: 3, name: "Apply", time: "60–120 min", what: "Practical exercise and portfolio artifact; 10-minute reflection log entry" }
  ],

  competencies: [
    { id: "arch", name: "AI architecture and exposure", target: "4", understanding: "Week 1 self-check and “explain it”", application: "Artifact 1" },
    { id: "dep", name: "AI technology dependency assessment", target: "4", understanding: "Teach-back 1; Week 4 “explain it”", application: "Artifacts 1 and 6, Appendix A" },
    { id: "rmf", name: "NIST AI RMF application", target: "4", understanding: "Week 2 self-check; reflection log", application: "Week 2 crosswalk, Artifact 3" },
    { id: "risk", name: "Risk identification and classification", target: "4", understanding: "Week 3 self-check", application: "Artifact 2" },
    { id: "gov", name: "Governance and control mapping", target: "4", understanding: "Week 4 self-check", application: "Artifact 3" },
    { id: "evid", name: "Audit evidence evaluation", target: "3–4", understanding: "Teach-back 2", application: "Artifact 4" },
    { id: "reg", name: "Regulatory awareness", target: "3", understanding: "Week 6 self-check and “explain it”", application: "Week 6 matrix" },
    { id: "comm", name: "Executive risk communication", target: "4", understanding: "Teach-back 3", application: "Artifact 5" }
  ],

  levels: [
    { n: 1, name: "Awareness", desc: "Recognizes terminology and concepts" },
    { n: 2, name: "Comprehension", desc: "Explains concepts and relationships" },
    { n: 3, name: "Application", desc: "Applies concepts to a practical scenario" },
    { n: 4, name: "Assessment", desc: "Independently evaluates exposures and controls" },
    { n: 5, name: "Communication", desc: "Clearly communicates findings and recommendations to decision-makers" }
  ],

  weeks: [
    {
      n: 1,
      title: "AI architecture and enterprise exposure",
      focus: "Understand the components that introduce AI-related risk.",
      deliverable: "Artifact 1 — AI Application Intake & Exposure Map",
      objectives: [
        "Distinguish provider, model, LLM, application, capability and MCP server, with an example of each.",
        "Trace a user request through application, model, MCP server and enterprise data, and name the risk at each hop.",
        "Explain how an application not marketed as AI can still introduce AI risk."
      ],
      spacedReview: null,
      prompt: { type: "explain", text: "Why isn't asking “does this app use AI?” enough?" },
      topics: [
        "AI models, LLMs, model providers and AI-enabled applications",
        "Grounding, retrieval-augmented generation (RAG) and enterprise data sources",
        "APIs, integrations, orchestration and MCP servers",
        "Agents, autonomy, human oversight and downstream actions",
        "Third-party model and vendor dependencies",
        "Hidden AI: AI search, embedded summarization, external AI APIs, recommendations, background agents",
        "Practice: trace “Summarize the latest customer interactions and identify unresolved issues” from application to LLM to MCP server to enterprise data"
      ],
      readings: {
        core: [
          { t: "MCP Security Best Practices — purpose, scope and attack overview", u: "https://modelcontextprotocol.io/specification/latest/basic/security_best_practices" },
          { t: "NIST AI RMF 1.0, Part 1 (framing AI risk)", u: "https://www.nist.gov/itl/ai-risk-management-framework" }
        ],
        against: [ { t: "Project research: More Risk Assessment Considerations — model vs. LLM vs. MCP" } ],
        extension: [ { t: "OWASP Top 10 for LLM Applications 2026 — introduction", u: "https://genai.owasp.org/llm-top-10/" } ]
      },
      selfCheck: [
        { q: "What is the difference between a model and an LLM?", a: "An LLM is one type of model, trained on language to understand and generate text. Every LLM is a model, but models also include traditional machine learning, such as a fraud-detection or forecasting model." },
        { q: "Classify each: OpenAI, GPT, GPT-5.6, ChatGPT.", a: "OpenAI is the company (provider). GPT is a model family. GPT-5.6 is a specific model. ChatGPT is an application that uses models." },
        { q: "What does an MCP server provide, and does it do the reasoning?", a: "It exposes approved tools, data and actions to AI applications through a standard protocol. It is not a model and does not reason; its risk is about access and what actions it can execute." },
        { q: "Name three ways a conventional application can introduce AI without being marketed as AI.", a: "Any three of: AI-powered search, embedded summarization, an external AI API used for processing, AI recommendations or decision support, a background AI agent." },
        { q: "What are the four assessment layers?", a: "1) Application / AI capability; 2) Model / LLM provider and dependencies; 3) Data grounding and retrieval; 4) Integration / MCP / tool access." },
        { q: "What is grounding (or RAG), and why does it matter for risk?", a: "The model retrieves enterprise or external data to inform its answer. It determines what data is exposed to the model and provider, and the reliability of the sources affects accuracy and hallucination risk." }
      ]
    },
    {
      n: 2,
      title: "NIST AI Risk Management Framework",
      focus: "Establish a foundational risk management structure.",
      deliverable: "NIST AI RMF Assessment Crosswalk (working paper)",
      objectives: [
        "Describe the purpose of each AI RMF function (GOVERN, MAP, MEASURE, MANAGE) and how they interact.",
        "Locate the subcategories that address third-party and supply-chain AI risk, and explain what they expect.",
        "Use the Playbook to turn one subcategory into assessment questions."
      ],
      spacedReview: "Week 1 taxonomy — place each component in the RMF MAP function.",
      prompt: { type: "explain", text: "What does GOVERN 6 expect when a vendor app embeds a third-party model?" },
      topics: [
        "NIST AI RMF 1.0 functions: GOVERN, MAP, MEASURE, MANAGE",
        "Context, intended use, stakeholders and impact",
        "Risk identification, documentation and lifecycle risk management",
        "GOVERN 6: policies and procedures for third-party AI and supply-chain risk",
        "NIST Generative AI Profile (NIST AI 600-1): third-party GAI integrations, embedded models, procurement diligence"
      ],
      readings: {
        core: [
          { t: "NIST AI RMF 1.0, Part 2 — the Core (GOVERN, MAP, MEASURE, MANAGE)", u: "https://www.nist.gov/itl/ai-risk-management-framework" },
          { t: "AI RMF Playbook — GOVERN 6 entries", u: "https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook" }
        ],
        against: [ { t: "Project research: Understanding AI Models — GOVERN 6 discussion" } ],
        extension: [ { t: "NIST AI 600-1 (Generative AI Profile) — third-party and value-chain sections", u: "https://www.nist.gov/itl/ai-risk-management-framework" } ]
      },
      selfCheck: [
        { q: "Name the four AI RMF functions with one sentence on each.", a: "GOVERN: culture, policies and accountability for AI risk. MAP: establish context and identify risks. MEASURE: analyze, assess and track risks. MANAGE: prioritize, treat, respond to and monitor risks." },
        { q: "Which function is cross-cutting, informing the other three?", a: "GOVERN." },
        { q: "What does GOVERN 6 address?", a: "Policies and procedures for AI risks and benefits arising from third-party software, data and other supply-chain issues." },
        { q: "Is the NIST AI RMF mandatory?", a: "No. It is voluntary guidance. AI RMF 1.0 (January 2023) is current; NIST has said a revision is in progress." },
        { q: "What is NIST AI 600-1?", a: "The Generative AI Profile: a companion that applies the AI RMF to risks specific to generative AI, including third-party and embedded models." },
        { q: "What does the Playbook provide, and how should it be used?", a: "Suggested actions, references and documentation for each subcategory. It is voluntary: use as many or as few suggestions as fit the use case." }
      ]
    },
    {
      n: 3,
      title: "AI risk identification and classification",
      focus: "Identify the risks to consider during application onboarding, layer by layer.",
      deliverable: "Artifact 2 — AI Risk Classification Matrix; draft vendor questionnaire (Appendix A)",
      objectives: [
        "Classify an application's risks by category and by assessment layer (1–4).",
        "Explain the difference between inherent and residual risk, and score both for a sample risk.",
        "Identify the change events that should trigger reassessment, and why."
      ],
      spacedReview: "Week 2 GOVERN 6 — which risks in this week's matrix does it cover?",
      prompt: { type: "teachback", n: 1, text: "Explain to the Fraud/Risk director why approving an application is not the same as approving its AI." },
      topics: [
        "Model and provider risk; privacy and confidentiality; data quality, grounding and source reliability",
        "Cybersecurity and access control; third-party and supply-chain exposure; API, integration and MCP exposure",
        "Agent autonomy and unintended actions; reliability, hallucination and explainability; bias and fairness",
        "Regulatory and legal; human oversight; monitoring, incident response and change management",
        "Ecosystem conflict: a model provider outside the approved Copilot / approved-provider environment",
        "Model transparency: undisclosed or “proprietary” models with third-party foundations",
        "Change triggers: new AI feature, new MCP server, provider or version change",
        "Draft the vendor model-disclosure questionnaire (Appendix A)"
      ],
      readings: {
        core: [
          { t: "OWASP Top 10 for LLM Applications 2026 — sensitive information disclosure, supply chain, excessive agency", u: "https://genai.owasp.org/llm-top-10/" },
          { t: "NIST AI 600-1 — generative AI risk list", u: "https://www.nist.gov/itl/ai-risk-management-framework" }
        ],
        against: [ { t: "Project research: Understanding AI Models — dependency assessment questions" } ],
        extension: [
          { t: "MCP Security Best Practices — token passthrough and confused-deputy attacks", u: "https://modelcontextprotocol.io/specification/latest/basic/security_best_practices" },
          { t: "OWASP Top 10 for Agentic Applications" }
        ]
      },
      selfCheck: [
        { q: "What is the difference between inherent and residual risk?", a: "Inherent risk is the level before any controls are considered; residual risk is what remains after existing controls are applied." },
        { q: "Name three change events that should trigger reassessment of an existing application.", a: "Any three of: a new AI feature, a new MCP server or integration, a change of model provider or version, a change in data shared with the model, a vendor ownership change." },
        { q: "Why is a new model provider a risk even if the provider is reputable?", a: "Its data flows, retention, training use and controls have not been evaluated or authorized, and it operates outside the company's approved AI governance." },
        { q: "Which layer does an undisclosed foundation model sit in, and what is the main concern?", a: "Layer 2 (model / provider and dependencies). The concern is supply-chain transparency: you cannot assess data handling or change risk for a model you cannot name." },
        { q: "What is “excessive agency”?", a: "An AI system given more functionality, permissions or autonomy than it needs, so it can take unintended or harmful actions." },
        { q: "Why is hallucination also a data-grounding issue?", a: "If retrieval returns irrelevant, outdated or unreliable sources, the model can produce confident but wrong answers. Source quality is part of the control." }
      ]
    },
    {
      n: 4,
      title: "AI governance and control frameworks",
      focus: "How organizations establish accountability and oversight.",
      deliverable: "Artifact 3 — AI Governance & Control Framework",
      objectives: [
        "Explain the elements of an AI governance operating model, including ownership across Risk, Compliance, Legal, Audit and the business.",
        "Describe what an AI management system under ISO/IEC 42001 asks of an organization, at concept level.",
        "Apply the approved / new / undisclosed provider rules (Appendix B) to a sample vendor."
      ],
      spacedReview: "Week 3 matrix — assign an owner to each risk.",
      prompt: { type: "explain", text: "Why can an approved Copilot environment still be bypassed by a vendor app?" },
      topics: [
        "AI governance principles and operating models",
        "Roles, responsibilities and ownership",
        "AI policies and acceptable-use requirements",
        "ISO/IEC 42001 overview, including third-party relationships and allocation of AI responsibilities",
        "Governance across the AI application lifecycle; mapping governance expectations to controls",
        "Where an AI Technology & Model Risk Assessment sits between application risk assessment, TPRM and ongoing AI governance",
        "Approval rules for approved, new and undisclosed model providers (Appendix B)"
      ],
      readings: {
        core: [
          { t: "ISO/IEC 42001 overview", u: "https://www.iso.org/standard/42001" },
          { t: "NIST AI RMF — GOVERN function (re-read for governance structure)", u: "https://www.nist.gov/itl/ai-risk-management-framework" },
          { t: "IAPP AIGP Body of Knowledge v2.1 — Domain I", u: "https://iapp.org/certify/free-study-guides" }
        ],
        against: [ { t: "Project research: Understanding AI Models — approval scenarios A–C" } ],
        extension: [
          { t: "ISACA AI resources", u: "https://www.isaca.org/resources/artificial-intelligence" },
          { t: "IIA AI Auditing Framework (IIA members only)", u: "https://www.theiia.org/en/resources/knowledge-centers/artificial-intelligence" }
        ]
      },
      selfCheck: [
        { q: "What is ISO/IEC 42001?", a: "An international standard setting requirements for an AI management system: establishing, implementing, maintaining and continually improving how an organization governs AI." },
        { q: "What is the difference between a policy and a control?", a: "A policy states the expectation; a control is the specific activity that makes sure the expectation is met (and produces evidence that it was)." },
        { q: "Summarize approval scenarios A, B and C.", a: "A: approved provider — standard review. B: new provider outside the approved ecosystem — provider assessment or exception. C: undisclosed or uncontrolled — withhold approval until transparency and controls are sufficient." },
        { q: "Why doesn't approving Copilot approve a vendor's embedded model?", a: "The vendor's model can be a different provider or configuration, with its own data flows, retention and controls that sit outside Copilot's governance." },
        { q: "In the three lines model, who does what?", a: "First line: management owns and manages risk. Second line: risk and compliance functions set frameworks and oversee. Third line: internal audit gives independent assurance." },
        { q: "Who should own the decision to accept an AI risk?", a: "The accountable business owner or management, within the organization's risk appetite — not the assessor." }
      ]
    },
    {
      n: 5,
      title: "AI audit and control assessment",
      focus: "Move from identifying risks to evaluating whether controls address them.",
      deliverable: "Artifact 4 — AI Control Assessment & Evidence Register",
      objectives: [
        "Distinguish control design from operating effectiveness, with an AI example of each.",
        "Judge the reliability of different evidence types (vendor attestation, contract clause, system configuration, test result).",
        "Design a detective control for a silent model change."
      ],
      spacedReview: "Week 2 MEASURE and MANAGE — which controls produce the evidence they expect?",
      prompt: { type: "teachback", n: 2, text: "Explain why a vendor questionnaire answer is weaker evidence than a contract clause plus re-attestation." },
      topics: [
        "Control objectives and control activities; preventive, detective and corrective controls",
        "Control design versus operating effectiveness",
        "Evidence requests and evidence reliability",
        "Documentation of gaps and remediation; audit trails and accountability",
        "Evidence that a vendor notifies customers of model or provider changes, and contract clauses that require it",
        "Detective controls for silent AI changes: periodic re-attestation, release-note review, inventory reconciliation"
      ],
      readings: {
        core: [
          { t: "ISACA IT Audit Framework (ITAF), 5th ed. — AI/ML guidance (free with registration)", u: "https://www.isaca.org/resources/it-audit" },
          { t: "ISACA Audit Practitioner's Guide to Machine Learning, Part 1", u: "https://www.isaca.org/about-us/newsroom/press-releases/2022/new-isaca-publications-highlight-machine-learning-technology-and-compliance-risk-for-auditors" }
        ],
        against: [ { t: "Project research: More Risk Assessment Considerations — vendor disclosure questions" } ],
        extension: [
          { t: "ISACA Auditing Artificial Intelligence (2018, background only)", u: "https://www.isaca.org/resources/white-papers/auditing-artificial-intelligence" },
          { t: "IIA AI Auditing Framework (IIA members only)", u: "https://www.theiia.org/en/resources/knowledge-centers/artificial-intelligence" }
        ]
      },
      selfCheck: [
        { q: "What is the difference between control design and operating effectiveness?", a: "Design asks whether the control, as described, would address the risk. Operating effectiveness asks whether it actually worked consistently over a period, shown by evidence." },
        { q: "Give a preventive, a detective and a corrective control for an unannounced model change.", a: "Preventive: a contract clause requiring advance notice. Detective: periodic re-attestation or output monitoring that flags a change. Corrective: reassessment and suspension of the feature until reviewed." },
        { q: "Rank these from weakest to strongest evidence: system configuration export, vendor questionnaire answer, contract clause.", a: "Weakest: vendor questionnaire (self-reported). Stronger: contract clause (binding, but says what should happen). Strongest of these: system configuration or independent test evidence (shows what is actually happening)." },
        { q: "Describe one detective control for a silent model change.", a: "For example: quarterly vendor re-attestation of model provider and version, reconciled against the AI dependency inventory, with differences escalated." },
        { q: "What makes a gap finding actionable?", a: "It states the condition, the expected criteria, cause, effect or risk, a recommendation, an owner and a target date." },
        { q: "Why do audit trails matter for AI-assisted decisions?", a: "They let you reconstruct which model and version was used, what inputs it saw, who reviewed the output, and what decision was made." }
      ]
    },
    {
      n: 6,
      title: "Regulatory and compliance awareness",
      focus: "Understand the regulatory landscape without treating this program as legal training.",
      deliverable: "Regulatory & Compliance Considerations Matrix (working paper)",
      objectives: [
        "Summarize the EU AI Act's risk tiers and what places a system in each.",
        "Explain how existing privacy law applies when company data is sent to a third-party model.",
        "Identify when an issue should be escalated to Legal or Compliance rather than assessed by Risk."
      ],
      spacedReview: "Week 4 governance roles — who owns each regulatory consideration?",
      prompt: { type: "explain", text: "What changes when the data sent to a vendor's model is medical information?" },
      topics: [
        "EU AI Act overview and risk-based approach",
        "U.S. AI governance and regulatory developments, including state laws",
        "Privacy and data protection considerations",
        "Industry-specific obligations; vendor and contractual considerations",
        "Legal, Compliance, Risk and Audit responsibilities",
        "Sensitive data sent to third-party models: medical, customer and confidential information; training and retention terms"
      ],
      readings: {
        core: [
          { t: "EU AI Act FAQ", u: "https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act" },
          { t: "IAPP AIGP Body of Knowledge v2.1 — Domain II", u: "https://iapp.org/certify/free-study-guides" }
        ],
        against: [ { t: "Plan Section 1 — concern C8 (sensitive data in third-party AI)" } ],
        extension: [ { t: "ISACA Audit Practitioner's Guide to Machine Learning, Part 2 (compliance risk)", u: "https://www.isaca.org/about-us/newsroom/press-releases/2022/new-isaca-publications-highlight-machine-learning-technology-and-compliance-risk-for-auditors" } ]
      },
      selfCheck: [
        { q: "What are the EU AI Act's main risk tiers?", a: "Unacceptable risk (prohibited practices), high risk (strict obligations), limited risk (transparency obligations) and minimal risk (largely unregulated)." },
        { q: "Can the EU AI Act apply to a company outside the EU?", a: "Yes. It can apply when an AI system is placed on the EU market or its output is used in the EU, regardless of where the company is based." },
        { q: "Name three privacy questions to ask when company data goes to a third-party model.", a: "Any three of: is the purpose permitted, is there a processor agreement, where is data processed and stored, how long is it retained, is it used for training, who are the sub-processors." },
        { q: "What extra considerations apply when the data is medical information?", a: "It is a sensitive category; sector rules (for example HIPAA, depending on the entity) and contractual terms may apply. Minimize data sent, confirm no training use and short retention, and involve Compliance." },
        { q: "When should an issue go to Legal or Compliance rather than be decided by Risk?", a: "When it needs a legal applicability determination, interpretation of a regulation, or approval of contract terms." },
        { q: "Why is this week's material “awareness” only?", a: "The program is not legal training; it builds enough understanding to spot issues and escalate them, not to determine applicability." }
      ]
    },
    {
      n: 7,
      title: "End-to-end application risk assessment (capstone)",
      focus: "Apply every concept to a realistic, fictional scenario.",
      deliverable: "Completed assessment, plus first entry in Artifact 6 — AI Dependency & Model Inventory",
      scenario: "A third-party application analyzes incoming customer documents, extracts information, summarizes findings and recommends next steps to an employee. It uses a third-party LLM, enterprise document grounding and APIs. An employee reviews recommendations before consequential action.",
      complications: [
        "The vendor describes its AI as proprietary; a client case study suggests it also uses an undisclosed third-party foundation model.",
        "The underlying provider is not one of the company's approved providers.",
        "Midway through the assessment, the vendor announces it is adding an MCP connection to the company's document repository.",
        "The vendor has been acquired and is rebranding, so product documentation may be out of date."
      ],
      objectives: [
        "Complete an end-to-end assessment across all four layers without referring to the templates' guidance.",
        "Reach and defend an approval recommendation under Appendix B.",
        "Decide which complications require reassessment and which can be handled by condition of approval."
      ],
      spacedReview: "All self-check questions missed in Weeks 1–6 (see your review queue).",
      prompt: { type: "teachback", n: 3, text: "Give a five-minute walkthrough of the capstone findings, as if to the Fraud/Risk director." },
      topics: [
        "Complete application intake",
        "Map architecture and data flows across the four layers",
        "Identify and classify risks; apply the approval rules in Appendix B",
        "Map risks to controls; identify evidence needed",
        "Evaluate residual risk; record the application in the AI Dependency & Model Inventory"
      ],
      readings: {
        core: [
          { t: "AI RMF Playbook — MAP entries on third-party components", u: "https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook" },
          { t: "Plan Appendices A–C (questionnaire, approval scenarios, risk patterns)" }
        ],
        against: [ { t: "Both project research documents, in full" } ],
        extension: [ { t: "OWASP and MCP readings, re-read against the scenario" } ]
      },
      selfCheck: [
        { q: "What is the first question to put to a vendor whose AI is “proprietary” but may rely on a third-party model?", a: "Which foundation models and LLMs power the application today, and are any provided by third parties?" },
        { q: "Under Appendix B, what is the default recommendation while the provider stays undisclosed?", a: "Scenario C: withhold approval until the vendor gives enough transparency and controls are in place." },
        { q: "Does the new MCP connection to the document repository require reassessment? Why?", a: "Yes. It is a new integration that changes what the AI can access and possibly do (Layer 4), and may expose new data (Layer 3)." },
        { q: "Why does the vendor's acquisition matter to the assessment?", a: "Documentation may be outdated, and architecture, sub-processors and contract terms can change under new ownership. Validate the current state." },
        { q: "Give two possible conditions of approval.", a: "For example: a contractual commitment to notify model or provider changes; no training on company data with a stated retention period; restricting the feature's scope or data until review." },
        { q: "What fields belong in the AI Dependency & Model Inventory entry?", a: "Application, capability, AI type, model ownership, foundation provider, model/version, approved-provider status, data grounding, sensitive data sent, integrations, transparency, change-notification commitment, last verified date." }
      ]
    },
    {
      n: 8,
      title: "Executive reporting and competency validation",
      focus: "Communicate the assessment in a form useful to leadership.",
      deliverable: "Artifact 5 — Executive AI Risk Assessment Report",
      objectives: [
        "Write an executive summary that states the decision needed, the material exposures and the recommendation in under one page.",
        "Present residual risk and limitations honestly, without technical jargon.",
        "Self-assess against every competency target with cited evidence, and set the next learning goal (e.g., a certification path from Appendix E)."
      ],
      spacedReview: "Re-answer the Week 1 “explain it” prompt and compare it with your original answer.",
      prompt: { type: "explain", text: "Explain in one or two sentences, for a non-technical approver, why “the application is approved” does not mean “its AI is approved.”" },
      topics: [
        "Executive risk summaries and communicating material exposures",
        "Prioritizing remediation; documenting ownership and decisions",
        "Presenting residual risk and limitations",
        "Final self-assessment against the competency targets"
      ],
      readings: {
        core: [ { t: "IAPP AIGP Body of Knowledge v2.1 — Domains III–IV (governing development, deployment and use)", u: "https://iapp.org/certify/free-study-guides" } ],
        against: [ { t: "Your own Artifacts 1–6" } ],
        extension: [ { t: "Plan Appendix E — certification alignment" } ]
      },
      selfCheck: [
        { q: "What should an executive summary lead with?", a: "The decision needed and your recommendation, followed by the few material exposures that drive it." },
        { q: "How should residual risk be presented?", a: "Plainly: what risk remains after controls, how significant it is, and who needs to accept it." },
        { q: "What is the difference between a finding and a recommendation?", a: "A finding states what is wrong or missing and why it matters; a recommendation states what should be done about it, by whom." },
        { q: "Who should formally accept residual risk?", a: "The accountable business owner or management with the authority to do so under the risk appetite — not the assessor." },
        { q: "What ongoing monitoring should the report state?", a: "Who monitors, how often (for example re-attestation cadence), and which change events trigger reassessment." },
        { q: "What makes a limitation worth stating in the report?", a: "Anything that affects how much the reader can rely on the conclusion, such as missing vendor disclosure or evidence not yet tested." }
      ]
    }
  ]
};
