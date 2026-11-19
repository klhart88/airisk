/* Learning content: a "Key concepts" primer for each week, and Reference pages.
   Written in a small markdown subset: ## and ### headings, paragraphs, "- " bullets,
   "1. " numbered lists, | tables |, and **bold**. Vendor names are deliberately left out. */
window.LEARNING = {

  concepts: {
    1: `
### The AI vocabulary
| Term | What it is | Example |
| --- | --- | --- |
| Provider | The company that builds models | OpenAI, Anthropic, Google, Meta |
| Model family | A line of related models from a provider | GPT, Claude, Gemini, Llama |
| Model | One specific trained model and version | GPT-5.6, Claude Sonnet |
| Application | The product people use, built on one or more models | ChatGPT, Claude.ai, Copilot, a vendor SaaS app |
| Capability | What the AI does inside a process | Summarizing, document analysis, recommendations |
| MCP server | A connection layer that gives AI access to tools and data; not a model | A server that lets an assistant read SharePoint or create Jira tasks |

**Model vs. LLM.** A model is any system trained to predict, classify or generate. An LLM is one type of model, trained on language. Every LLM is a model, but a fraud-detection or forecasting model is a model that isn't an LLM.

**MCP servers** expose approved tools, data and actions to AI applications through a standard protocol. They don't do the reasoning; their risk is about **access**: what they can reach, with what permissions, and what actions they can take.

**Grounding (RAG)** means the model retrieves data, often enterprise documents, to inform its answer. It decides what data the model and its provider see, and the quality of those sources affects accuracy and hallucination.

### Hidden AI
An application that isn't marketed as AI can still bring in AI risk through AI-powered search, embedded summarization, an external AI API, AI recommendations, or a background agent.

### The four assessment layers
1. **Application / AI capability:** what it does, for whom, and what decisions it influences
2. **Model / provider and dependencies:** which models, from whom, hosted where, and who else is involved
3. **Data grounding and retrieval:** what data it uses and sends, retention, training use
4. **Integration / MCP / tool access:** what it connects to and what it can do

The application tells you what the business is using. The model tells you what provides the intelligence. The MCP server tells you what that intelligence can access and do.`,

    2: `
### The four functions of the NIST AI RMF
| Function | Purpose |
| --- | --- |
| GOVERN | Culture, policies, roles and accountability for AI risk. Cross-cutting: it informs the other three |
| MAP | Establish context and intended use, and identify risks |
| MEASURE | Analyze, assess and track the risks identified |
| MANAGE | Prioritize and treat risks, respond to incidents, and monitor over time |

**GOVERN 6** covers policies and procedures for AI risks and benefits that come from third-party software, data and other supply-chain issues. It is the RMF's anchor for vendor apps that embed someone else's model.

**Status.** The AI RMF is voluntary guidance, not regulation. Version 1.0 (January 2023) is current; NIST has said a revision is in progress.

**Companions.** NIST AI 600-1, the Generative AI Profile, applies the RMF to generative AI risks, including third-party and embedded models. The Playbook gives suggested actions, references and documentation for each subcategory. Use as many or as few suggestions as fit the situation.`,

    3: `
### Inherent vs. residual risk
**Inherent risk** is the level before any controls are considered. **Residual risk** is what remains after the existing controls are applied. A risk can be high inherently and acceptable residually if the controls are strong and working.

### Risks that come from the AI layers
- **New provider:** even a reputable one brings data flows, retention, training use and controls the company hasn't evaluated, outside its approved AI governance (Layer 2).
- **Undisclosed model:** a vendor calling its AI "proprietary" while relying on an unnamed third-party model is a supply-chain transparency problem: you can't assess data handling or change risk for a model you can't name (Layer 2).
- **Excessive agency:** an AI system given more functions, permissions or autonomy than it needs can take unintended or harmful actions (Layer 4).
- **Hallucination:** confident but wrong answers. It is partly a grounding issue: irrelevant, outdated or unreliable sources lead to bad answers (Layer 3).

### Change triggers: when to reassess an existing application
- A new AI feature, such as AI search added to a conventional app
- A new integration or MCP server, such as access to an internal document store
- A change of model provider or version
- A change in what data is shared with the model
- A vendor acquisition or ownership change

Each can change the risk profile materially without any new application request.`,

    4: `
### Policies, controls and ownership
A **policy** states the expectation. A **control** is the specific activity that makes sure the expectation is met, and produces evidence that it was.

**The three lines model:**
- **First line:** management and the business own and manage risk.
- **Second line:** risk and compliance functions set frameworks and provide oversight.
- **Third line:** internal audit gives independent assurance.

**Accepting risk** is the accountable business owner's or management's decision, within the organization's risk appetite. It is not the assessor's decision.

### ISO/IEC 42001
An international standard that sets requirements for an AI management system: how an organization establishes, implements, maintains and continually improves its governance of AI, including third-party relationships and how AI responsibilities are allocated.

### Model provider approval scenarios
| Scenario | Situation | Handling |
| --- | --- | --- |
| A — Approved provider | Uses a model already approved under an enterprise arrangement | Standard security, privacy and data-flow review |
| B — New provider | Uses a provider outside the approved ecosystem | Provider assessment or policy exception |
| C — Undisclosed or uncontrolled | Can't name its provider, changes models without notice, or can't explain data handling | Withhold approval until transparency and controls are adequate |

**Why an approved Copilot environment can still be bypassed:** a vendor app can embed a different provider or configuration, with its own data flows, retention and controls that sit outside Copilot's governance. Approving an application is not approving its AI.`,

    5: `
### Design vs. operating effectiveness
**Design** asks whether the control, as described, would address the risk. **Operating effectiveness** asks whether it actually worked, consistently, over a period, shown by evidence.

### Types of control: an unannounced model change
| Type | Purpose | Example |
| --- | --- | --- |
| Preventive | Stop it happening | Contract clause requiring advance notice of model or provider changes |
| Detective | Find it if it happens | Quarterly vendor re-attestation of provider and version, reconciled against the AI dependency inventory |
| Corrective | Fix it once found | Reassess, and suspend the feature until reviewed |

### How reliable is the evidence?
From weakest to strongest:
1. **Vendor questionnaire answer:** self-reported
2. **Contract clause:** binding, but says what *should* happen
3. **System configuration or independent test:** shows what *is* happening

### Findings and audit trails
An actionable finding states the **condition**, the expected **criteria**, the **cause**, the **effect or risk**, a **recommendation**, an **owner** and a **target date**.

Audit trails for AI-assisted decisions let you reconstruct which model and version was used, what inputs it saw, who reviewed the output, and what was decided.`,

    6: `
### EU AI Act: risk tiers
| Tier | Treatment |
| --- | --- |
| Unacceptable risk | Prohibited practices |
| High risk | Strict obligations: risk management, data governance, documentation, human oversight |
| Limited risk | Transparency obligations, such as telling people they are dealing with AI |
| Minimal risk | Largely unregulated |

It can apply to a company outside the EU when an AI system is placed on the EU market or its output is used in the EU.

### Sending company data to a third-party model
Questions to ask:
- Is the purpose permitted, and is there a processor agreement?
- Where is data processed and stored, and for how long?
- Is it used for training?
- Who are the sub-processors?

**Medical information** is a sensitive category. Sector rules may apply depending on the entity, along with contract terms. Minimize what is sent, confirm no training use and short retention, and involve Compliance.

### Knowing when to escalate
Send it to Legal or Compliance when it needs a legal applicability determination, an interpretation of a regulation, or approval of contract terms. This week builds enough awareness to spot those issues, not to decide them.`,

    7: `
### Working the capstone
1. **Intake:** complete the four-layer picture before judging anything.
2. **Disclosure first:** the opening vendor question is which foundation models and LLMs power the application today, and whether any come from third parties. See the questionnaire in the Assessment toolkit.
3. **Apply the scenarios:** while the provider stays undisclosed, the default is Scenario C: withhold approval until there is enough transparency and the controls are in place.
4. **Sort the complications:**
    - The new MCP connection to the document repository requires reassessment: it changes what the AI can access and do (Layer 4) and may expose new data (Layer 3).
    - The acquisition means documentation may be out of date, and architecture, sub-processors and contract terms can change: validate the current state.
5. **Conditions of approval:** for example, contractual notice of model or provider changes; no training on company data with a stated retention period; limiting the feature's scope or data until reviewed.
6. **Record it** in the AI Dependency & Model Inventory: application, capability, AI type, model ownership, foundation provider, model and version, approved-provider status, data grounding, sensitive data sent, integrations, transparency, change-notice commitment, last verified date.`,

    8: `
### Writing for decision-makers
- **Lead with the decision and your recommendation,** then the few material exposures that drive it. Keep the summary to one page.
- **A finding vs. a recommendation:** a finding states what is wrong or missing and why it matters; a recommendation states what should be done, by whom.
- **Residual risk:** say plainly what remains after controls, how significant it is, and who needs to accept it. Acceptance belongs to the accountable owner, not the assessor.
- **Monitoring:** state who monitors, how often (such as the re-attestation cadence), and which change events trigger reassessment.
- **Limitations:** state anything that affects how far the reader can rely on the conclusion, such as missing vendor disclosure or evidence not yet tested.

**In one sentence for a non-technical approver:** approving the application tells us the business can use it; it doesn't tell us whether the AI inside it, and where our data goes, is acceptable.`
  },

  references: {
    "models-llm-mcp": {
      title: "Model, LLM and MCP server",
      source: "Adapted from project research: More Risk Assessment Considerations",
      body: `
These three terms describe different parts of an AI ecosystem. They are related, but not interchangeable.

- **Model:** the underlying technology that performs a task or makes predictions.
- **LLM:** a specific type of model designed to understand and generate human language.
- **MCP server:** a connection layer that lets an AI application or model interact with external tools, systems and data.

## 1. Model
A model is a computational system trained on data to recognize patterns, make predictions, classify information, generate outputs or perform other tasks. It is the underlying intelligence.

Examples: GPT-5.6; Claude Sonnet; Gemini; a machine-learning model that detects fraudulent transactions; a predictive model that forecasts customer behavior. A model doesn't have to be generative AI. It can be a traditional machine-learning model.

**Enterprise question:** what model is used, who developed it, what was it trained to do, and what data does it process?

## 2. LLM (large language model)
An LLM is a category of model trained on large amounts of language data to understand, interpret and generate human language. An LLM is a model, but not every model is an LLM.

| Provider | LLM family |
| --- | --- |
| OpenAI | GPT |
| Anthropic | Claude |
| Google | Gemini |
| Meta | Llama |
| Microsoft | Phi |

A naming distinction that matters in vendor reviews: OpenAI is a company; GPT is a family of models; GPT-5.6 is a specific model; ChatGPT is an application that uses models. The same distinction applies to Anthropic and Claude, and to Google and Gemini.

**Enterprise question:** which LLM provider is used, which specific model and version is deployed, and what information is sent to it?

## 3. MCP server (Model Context Protocol server)
An MCP server exposes approved tools, resources and contextual information to AI applications through the Model Context Protocol: a standard way to connect AI applications to other systems. An assistant might use one to retrieve SharePoint content, look up a customer record, query a database or create a Jira task.

An MCP server is not a model. It generally provides access, not reasoning.

**Enterprise question:** what systems can it reach, with what permissions, what information can it expose, and what actions can it execute?

## 4. How they work together
An employee asks an assistant: "Summarize the latest customer interactions and identify unresolved issues."

1. **The application** (the employee-facing assistant) receives the request.
2. **The model / LLM** interprets it, reasons, and works out what information it needs.
3. **The MCP server** provides access to approved systems, such as the CRM or document store.
4. **Enterprise data and tools** supply the records, history and documents.

The LLM uses what is retrieved to form its answer. The MCP server mediates access; it doesn't automatically authorize every action requested.

## 5. Comparing the three
| Attribute | Model | LLM | MCP server |
| --- | --- | --- | --- |
| Primary purpose | Performs computational tasks | Understands and generates language | Connects AI to systems |
| AI intelligence | Depends on the model | Yes | No, not inherently |
| Trained on data | Usually | Yes | Not necessarily |
| Accesses external data | Not inherently | Through integrations and tools | Exposes connected resources |
| Executes actions | Not inherently | Through tools | Can expose executable tools |
| Governance focus | Model risk | Generative AI risk | Integration and access risk |

## 6. Governance dimensions
| Dimension | What is assessed |
| --- | --- |
| Model governance | Provider, model and version, training, validation, performance, model risk |
| LLM governance | Prompt handling, hallucination, grounding, data exposure, output controls |
| MCP governance | Connected systems, permissions, authentication, data access, tool execution |
| AI application governance | The whole application, which may combine several models, proprietary AI features and integrations |

Evaluating only the application vendor or its advertised AI features can leave significant dependencies unidentified.

## 7. Change can matter as much as new applications
Each of these can change the enterprise risk profile without a new application:
- A conventional application adds an AI-powered search feature using an external LLM.
- An existing AI application adds an MCP server to access internal SharePoint content.
- An application changes its underlying model provider, for example from OpenAI to Anthropic.

## 8. Build the assessment on four layers
1. Application / AI capability
2. Model / LLM provider and dependencies
3. Data grounding and retrieval
4. Integration / MCP / tool access

This matters because an application that isn't marketed as AI can still introduce AI risk through embedded models, AI-powered search, retrieval-augmented generation or external AI services.

**The application tells us what the business is using. The model tells us what provides the intelligence. The MCP server tells us what the intelligence can access and potentially do.**`
    },

    "ai-dependencies": {
      title: "Providers, models and hidden AI dependencies",
      source: "Adapted from project research: Understanding AI Models – Risk Assessment",
      body: `
## 1. Companies, model families and applications
Anthropic and OpenAI are companies; GPT is a family of models developed by OpenAI. Think of it as the difference between a manufacturer, its products, and the applications customers use them through.

| Company | Model family | User-facing application |
| --- | --- | --- |
| OpenAI | GPT | ChatGPT |
| Anthropic | Claude | Claude |
| Google | Gemini | Gemini |
| Meta | Llama | Meta AI |
| xAI | Grok | Grok |
| Microsoft | Multiple providers | Copilot |

Claude and Gemini are names used both for model families and for consumer applications, so it's worth asking which one is meant.

## 2. Four classifications for an AI inventory
| Classification | Example |
| --- | --- |
| AI developer / provider | OpenAI, Anthropic |
| AI model | GPT, Claude, Gemini |
| AI application | ChatGPT, Claude.ai, Copilot |
| AI capability / implementation | Summarization, document analysis, agentic workflow |

An enterprise might prohibit direct employee use of ChatGPT, approve Microsoft Copilot, allow Copilot to use an underlying OpenAI or Anthropic model, and separately run an application that calls GPT through an API. Those are different governance decisions, even with the same underlying provider.

**Takeaway:** AI governance shouldn't stop at approving an application. It needs visibility into the provider, the underlying model, the application, data grounding, integrations and capabilities.

## 3. Can a vendor app bring in a conflicting model?
Yes. A company can standardize on Microsoft Copilot as its approved AI platform and still introduce other models through third-party applications, SaaS vendors, APIs and embedded AI features.

**Approving an application does not automatically mean approving its underlying AI technology.**

A new vendor application could introduce:
- A model provider not previously approved
- A different model version or configuration
- External transmission of company information
- New data retention, training or processing arrangements
- AI capabilities that operate outside the company's existing Copilot governance

The application may be legitimate and valuable; its AI architecture still creates risk considerations to assess.

## 4. AI technology dependency assessment
| Area | Question |
| --- | --- |
| Model provider | Which AI model providers does the application use? |
| Model identification | Which model family and version is used? |
| Model changes | Can the vendor change models without notifying the company? |
| Data transmission | What company information is sent to external model providers? |
| Data retention | Is input or output data retained, or used for model training? |
| Data grounding | What internal or external sources can the model access? |
| Security | How are identity, permissions and sensitive data protected? |
| Governance | Can the company audit, monitor and restrict AI functionality? |
| Subcontractors | Are other AI providers involved in processing? |

The vendor should disclose not only its primary model provider but any downstream AI service providers. NIST guidance on generative AI specifically addresses third-party integrations, embedded models, data protection, procurement diligence and transparency.

## 5. Does a different model automatically create a conflict?
No. Three scenarios:

| Scenario | Example | Concern | Handling |
| --- | --- | --- | --- |
| A — Approved provider | Vendor uses an already approved GPT model through an approved enterprise arrangement | Lower | Still needs application-level security, privacy and data-flow review |
| B — New provider | Vendor uses Anthropic Claude, while the enterprise has standardized on Microsoft/OpenAI services | Additional review | Exception or additional provider assessment, depending on policy |
| C — Undisclosed or uncontrolled | Vendor can't name its provider, changes models without notice, or can't explain how data is processed | High | Withhold approval until transparency and controls are established |

A different model isn't the problem in itself. The problem is technology, data flows and exposures the enterprise hasn't evaluated or authorized.

## 6. Where this fits in governance
Three disciplines connect:
1. **Enterprise application risk assessment:** is the application appropriate, secure, compliant and suitable for its purpose?
2. **AI technology & model risk assessment (the proposed addition):** what models, providers, agents, data sources and external dependencies does it introduce?
3. **AI governance & ongoing monitoring:** are the approved models, integrations, data flows and capabilities operating within policy?

Related frameworks: NIST AI RMF GOVERN 6 (third-party and supply-chain AI risk); ISO/IEC 42001 (third-party relationships and allocation of AI responsibilities); third-party risk management (vendor oversight, contract requirements, ongoing monitoring).

## 7. Why traditional application questions aren't enough
Application reviews have traditionally asked: who owns it, where is it hosted, what data does it access, who can access it, and what business process does it support? With AI, that isn't sufficient. An application with no native AI could still introduce AI risk through AI-powered search, embedded summarization, an external AI API, AI recommendations or decision support, or an agent working behind the scenes.

**The application itself may not be AI, but its dependencies and capabilities may be.**

An enterprise-wide **AI Dependency & Model Inventory**, connected to the application inventory and vendor risk process, shows not just which AI applications have been approved, but which AI technologies have been indirectly authorized through them.`
    },

    "toolkit": {
      title: "Assessment toolkit",
      source: "From the Program Design Plan, Appendices A–C",
      body: `
## Vendor AI technology disclosure questionnaire
Questions 1–7 are mandatory when sensitive data, such as medical or customer information, is processed.

| # | Area | Question |
| --- | --- | --- |
| 1 | Model provider | Which foundation models and LLMs power the application today? |
| 2 | Third-party models | Are any models provided by OpenAI, Anthropic, Google, Microsoft or other third parties? |
| 3 | Hosting | Are models hosted in the vendor's environment or reached through external APIs? |
| 4 | Routing | Does the application route requests dynamically between different models? |
| 5 | Data transmission | Is company data sent to third-party model providers? Which data? |
| 6 | Training use | Are customer inputs or outputs used for model training or fine-tuning? |
| 7 | Change notice | Will the vendor notify the company when underlying models or providers change? |
| 8 | Model identification | Which model family and version is deployed? |
| 9 | Retention | How long are inputs and outputs retained, and where? |
| 10 | Grounding | What internal or external sources can the model access? |
| 11 | Security | How are identity, permissions and sensitive data protected? |
| 12 | Governance | Can the company audit, monitor and restrict AI functionality? |
| 13 | Sub-processors | Which other AI service providers are involved in processing? |
| 14 | Integrations | Which MCP servers, APIs or agents are used, and what can they access or execute? |

## Model provider approval scenarios
| Scenario | Situation | Concern | Handling |
| --- | --- | --- | --- |
| A — Approved provider | Uses an already approved model through an approved enterprise arrangement | Lower | Standard application-level security, privacy and data-flow review |
| B — New provider | Uses a provider outside the approved ecosystem | Additional review | Provider assessment or policy exception |
| C — Undisclosed or uncontrolled | Can't name its provider, changes models without notice, or can't explain data processing | High | Withhold approval until transparency and controls are sufficient |

## Risk patterns from company research
**Pattern 1: undisclosed third-party model behind "proprietary" AI.** A vendor analyzing medical records for insurance, underwriting, claims and legal users described its AI as proprietary and internally developed. A customer's published case study, however, described the implementation as using a third-party generative AI model with limited transparency and an undisclosed provider. The vendor was also being acquired and rebranded, so its documentation was no longer a reliable guide to its current architecture.
- The model supply chain is an independent risk dimension; stopping at the application vendor misses it.
- With sensitive data, questionnaire items 1–7 are mandatory.
- Ownership changes are a reassessment trigger.

**Pattern 2: one application, many AI components.** A widely used sales application combines multiple models, proprietary AI features and integrations with external systems.
- Evaluating only the vendor or its advertised AI features can leave significant dependencies unidentified.
- The assessment must cover all four layers and the application as a whole.`
    }
  }
};
