# Portfolio assistant EU AI Act feature record

Status date: 2026-09-23

Feature: Donny website AI assistant

Accountable owner: Petri Lahdelma

Technical owner: Petri Lahdelma

Review state: Product controls implemented; owner/legal/vendor evidence still required where marked

Next scheduled review: 2026-12-01, or earlier on any change trigger below

This record applies the repository checklist to one defined feature. It is not a legal opinion, conformity assessment, certification, or guarantee against a fine.

## 1. Scope and intended purpose

Donny is a public, directly interactive AI assistant on digitaltableteur.com. It answers questions about published site content, services, work, and design-system topics. It may show verified site data, navigate to internal pages, prefill a contact flow after consent, draft text for the visitor to send, or open a booking interface. A visitor remains in control of any contact, email, or booking action.

Excluded uses:

- impersonating Petri or another human;
- ranking, scoring, profiling, or making decisions about people;
- recruitment, employment, education, credit, insurance, benefits, eligibility, or essential-service decisions;
- biometric categorisation or emotion recognition;
- legal, medical, financial, or investment advice;
- binding commitments about price, availability, delivery, hiring, or contracts;
- autonomous sending, purchasing, deletion, permission changes, or external publication.

Affected people are public site visitors, prospective clients, recruiters, and other people who choose to open the assistant.

## 2. Role and classification decision

Provisional role: Digitaltableteur is a deployer of the upstream model and is likely also a provider of the branded Donny AI system because it commissions/configures the system and puts it into service under its own name. The upstream model or gateway provider remains responsible for its own model/system duties. Qualified legal review must confirm the value-chain allocation and any Article 25 implications.

Provisional classification: non-high-risk on the current intended purpose. The assistant is not a regulated product safety component and its intended use does not match an Annex III decision use. This is a reasoned triage conclusion, not legal sign-off. Reclassify before any excluded use is enabled.

EU connection: the operator is based in Finland, the feature is offered on a public website, and its outputs may be used by people in the EU.

First market/service date: **owner must enter the verified production date**. Source history alone does not prove the legal placing-on-market or putting-into-service date.

## 3. System and data map

```text
visitor browser
  -> ChatWidget (visible AI identity, limitations, policy/report links)
  -> /api/chat (validation, prompt-injection guard, rate limit, no-store response)
  -> selected backend (OpenAI directly or OpenAI through Vercel AI Gateway)
  -> streamed response and approved tool result
  -> assistant message DOM marker + temporary sessionStorage copy

Optional visitor-controlled paths:
  -> contact review -> explicit send -> /api/contact
  -> booking interface -> visitor selects/submits with the booking provider
  -> lead prefill -> explicit consent -> contact-form review
```

Data categories:

- chat text entered by the visitor and recent conversation context;
- request IP used for rate limiting;
- aggregate token/model usage telemetry; raw IP was removed from token-usage Sentry extras;
- optional contact details entered in a separate reviewed contact workflow;
- session-only browser transcript in `sessionStorage`.

The chat route does not write a transcript to an application database. This does not establish upstream provider retention, training, sub-processor, or transfer behavior; those facts require account and contract evidence.

## 4. Core checklist mapping

| Check                             | Status                         | Evidence / rationale                                                                                                                     | Owner / next action                                                              |
| --------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 01.01 Describe use case           | Evidence recorded              | Scope and affected people above                                                                                                          | Owner reviews on each release                                                    |
| 01.02 EU connection               | Evidence recorded              | Finland operator + public EU-facing site                                                                                                 | Recheck if service geography changes                                             |
| 01.03 Legal role                  | Specialist review              | Provider + deployer is the conservative provisional position                                                                             | Obtain qualified role confirmation                                               |
| 01.04 Model vs product            | Evidence recorded              | System/data map separates UI, route, tools, model, gateway, operator                                                                     | Add deployed model/account evidence                                              |
| 01.05 Applicable dates            | Open                           | Article 50 applies; exact first service date is unverified                                                                               | Owner records production date/version                                            |
| 02.01 Prohibition screen          | Evidence recorded              | Intended/excluded uses and system prompt block decision, sensitive-inference and advice uses                                             | Legal review the full amended Article 5 screen                                   |
| 02.02 Emotion/biometric           | Not applicable                 | No sensor, biometric or emotion-inference input; explicitly prohibited                                                                   | Reopen if any such capability is proposed                                        |
| 02.03 High-risk routes            | Specialist review              | No Annex I safety component or Annex III intended use appears                                                                            | Legal confirmation before relying on classification                              |
| 02.04 Annex III exception         | Not applicable                 | No Annex III use is claimed, so no Article 6(3) exception is relied on                                                                   | Reopen on purpose change                                                         |
| 02.05 Enforce excluded uses       | Evidence recorded              | `chat-shared.ts` system rules + bounded tool selection                                                                                   | Add hostile misuse cases to each material release                                |
| 03.01 First-interaction notice    | Implemented                    | Launcher/title/header/intro explicitly identify an AI assistant before input                                                             | Preserve EN/FI/SV tests and rendered evidence                                    |
| 03.02 Machine-readable marking    | Open                           | Assistant DOM has `data-ai-generated`, `data-ai-output-type`, `data-ai-system`; this is not validated as a standard Article 50(2) marker | Confirm provider/integration method against current Commission guidance and Code |
| 03.03 Generated/altered media     | Open                           | No feature-specific deepfake media; site-wide asset inventory is not complete                                                            | Audit published images/audio/video asset by asset                                |
| 03.04 Public-interest text        | Open                           | Public policy says published content receives substantive human review; repository does not prove review for every item                  | Keep editor, sources, changes and approval with each relevant publication        |
| 03.05 Notice access/timing        | Implemented                    | Visible before input; localized; semantic dialog/aside; keyboard/a11y tests                                                              | Capture desktop/mobile/zoom/screen-reader evidence                               |
| 04.01 Capability boundary         | Implemented                    | Point-of-use notice, public policy and system prompt                                                                                     | Test out-of-scope prompts                                                        |
| 04.02 Suggestion vs execution     | Implemented                    | Contact flow has editable review + explicit send; email drafts do not auto-send; booking/navigation remain visitor controlled            | Preserve action-review tests                                                     |
| 04.03 Interruption/recovery       | Implemented                    | Stop on close/unmount, Escape/minimize, Clear, errors and contact fallback                                                               | Rehearse provider outage                                                         |
| 04.04 Meaningful human review     | Not applicable to live replies | Live replies are low-consequence and explicitly unreviewed; binding commitments require a person                                         | Reclassify if consequential decisions are introduced                             |
| 04.05 AI literacy                 | Open                           | Topics and operating rules are recorded below                                                                                            | Owner completes/date-stamps acknowledgement                                      |
| 05.01 Personal-data basis         | Specialist review              | Privacy notice describes chat processing; legal basis has not been independently assessed                                                | Privacy reviewer records purpose/basis and Article 13/14 coverage                |
| 05.02 Minimise/protect/delete     | Partly implemented             | 1,000-char input; bounded history; sessionStorage; clear action; no transcript DB                                                        | Confirm upstream retention and Sentry retention                                  |
| 05.03 Processors/transfers        | Open                           | OpenAI/Vercel routing is documented, but DPA, sub-processors, locations and transfer mechanism are deployment facts                      | Store current contracts/settings evidence                                        |
| 05.04 Supplier evidence           | Open                           | Exact deployed model and account settings are not in source control                                                                      | Record model/version, data-use settings, incident contact and change notice      |
| 05.05 Rights                      | Open                           | Site policy prohibits sensitive/confidential input; site-wide asset/source register is not complete                                      | Audit client/source rights and generated-media licensing                         |
| 06.01 Shared interaction contract | Implemented                    | `ChatWidget.spec.md`, contract JSON, public policy and this record                                                                       | Version with each behavior change                                                |
| 06.02 Adversarial testing         | Partly implemented             | Prompt-injection, rate-limit, behavior, storage, a11y and boundary tests exist                                                           | Add factuality/source and provider-failure evaluation set                        |
| 06.03 Evidence chain              | Open                           | Source files and tests are linked below; no signed release manifest exists                                                               | Add deployed commit/model/settings/evaluation manifest                           |
| 06.04 Monitoring/incidents        | Partly implemented             | Public problem-report link + contact route; incident steps below                                                                         | Record rehearsal and response owner availability                                 |
| 06.05 Change review               | Implemented as process         | Change triggers below                                                                                                                    | Make review a release-gate check                                                 |

## 5. Conditional high-risk pathway

H01-H08 are provisionally not applicable because the intended use is not high-risk. This is not a blanket exemption. Before enabling any Annex I/III use, stop release and obtain specialist review for risk/quality management, data governance, technical documentation, conformity/registration, oversight, FRIA/DPIA, logs/retention, affected-person notices/explanations, monitoring, and serious-incident duties.

## 6. AI literacy operating record

The person operating or modifying Donny must review and understand:

1. the intended and excluded uses in this record;
2. hallucination, bias, prompt-injection, source-grounding and tool-misuse risks;
3. the first-interaction transparency and output-marking distinction;
4. personal-data minimisation, provider/account settings, and transfer/retention questions;
5. how to stop the feature, report an incident, preserve evidence and contact a qualified reviewer;
6. which changes trigger reclassification or a new legal/privacy review.

Acknowledgement: **owner must add name, date, material reviewed, and any identified gap before treating 04.05 as complete.**

## 7. Incident and reporting runbook

User report route: the chat notice opens a pre-addressed email to `mail@digitaltableteur.com` with subject “AI assistant report”.

On a credible report of harmful, deceptive, privacy-invasive, prohibited, or out-of-scope behavior:

1. acknowledge the report and preserve only the minimum evidence needed;
2. disable the affected tool or assistant if continued operation could cause harm;
3. record time, deployed commit, model/backend, prompt/tool version, inputs with personal data redacted, output and impact;
4. classify whether the issue is product quality, security, privacy, prohibited practice, transparency, or possible serious incident;
5. contact the relevant qualified reviewer and supplier incident contact;
6. correct, test and document the decision before re-enabling;
7. assess notification/reporting duties and deadlines under the AI Act, GDPR and other applicable law;
8. update this record and the evaluation set.

## 8. Change triggers

Reopen this review before release when any of these changes:

- intended purpose, target users or people affected;
- model, provider, gateway, data location, retention or training/data-use settings;
- retrieval corpus or ability to use private/client data;
- tools, autonomy, external actions or confirmation flow;
- use in employment, education, credit, insurance, benefits, health, public services, law enforcement, migration, justice, elections or regulated products;
- biometric, emotion, profiling or sensitive-trait capability;
- publication of AI-generated public-interest text or realistic altered media;
- material legal/guidance changes or an incident showing the existing classification is wrong.

## 9. Repository evidence

- `nextjs-app/shared/components/ChatWidget/ChatWidget.tsx`
- `nextjs-app/shared/components/ChatWidget/ChatHeader.tsx`
- `nextjs-app/shared/components/ChatWidget/ChatMessageBubble.tsx`
- `nextjs-app/shared/components/ChatWidget/ChatWidget.spec.md`
- `app/api/chat/route.ts`
- `app/api/chat-shared.ts`
- `app/api/donny-tools.ts`
- `nextjs-app/shared/components/pages/AiUsagePage/AiUsagePage.tsx`
- `nextjs-app/shared/components/pages/PrivacyPolicyPage/PrivacyPolicyPage.tsx`
- EN/FI/SV locale files and focused tests beside the components/routes

## 10. Official references checked

- Consolidated AI Act: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02024R1689-20260727
- Regulation (EU) 2026/1744: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32026R1744
- Commission Article 50 guidance: https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- Commission Article 50 FAQ: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- Commission AI literacy guidance: https://digital-strategy.ec.europa.eu/en/policies/ai-talent-skills-and-literacy
- Traficom transparency guidance: https://www.traficom.fi/en/ai-regulation/when-do-you-need-disclose-use-ai
- Finland Act 1377/2025: https://www.finlex.fi/en/legislation/2025/1377
