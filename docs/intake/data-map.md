# Intake data map

Generated from `app/lib/intake` by `npm run generate:intake-data-map`. Do not edit by hand.

## Classes

| Class | At rest | Travels to | Never in | Retention (proposal) |
| --- | --- | --- | --- | --- |
| Personal | AES-256-GCM answer document in MongoDB (key outside the database); email also kept as an HMAC for lookup | browser, intake function, MongoDB, PDF renderer, admin export | email bodies, Sentry, Vercel logs, analytics | draft 90 d after last edit; submission 24 mo |
| Third-party personal | AES-256-GCM answer document in MongoDB (key outside the database) | browser, intake function, MongoDB, PDF renderer, admin export | email bodies, Sentry, Vercel logs, analytics | draft 90 d after last edit; submission 24 mo |
| Business confidential | AES-256-GCM answer document in MongoDB (key outside the database) | browser, intake function, MongoDB, PDF renderer, admin export | email bodies, Sentry, Vercel logs, analytics | draft 90 d after last edit; submission 24 mo |
| Operational | AES-256-GCM answer document in MongoDB (key outside the database) | browser, intake function, MongoDB, PDF renderer, admin export | Sentry, Vercel logs, analytics | same as the submission it belongs to |

## Client intake & brand discovery (v1.0.0)

| Page | Field | Kind | Required | Class |
| --- | --- | --- | --- | --- |
| Client intake | `contact_name` | text | on submit | Personal |
| Client intake | `preferred_name` | text | no | Personal |
| Client intake | `business_name` | text | on submit | Business confidential |
| Client intake | `contact_role` | text | no | Personal |
| Client intake | `email` | email | on submit | Personal |
| Client intake | `phone` | tel | no | Personal |
| Client intake | `timezone` | text | no | Personal |
| Client intake | `contact_method` | text | no | Personal |
| Client intake | `services` | choices | no | Operational |
| Client intake | `project_summary` | longText | on submit | Business confidential |
| Client intake | `success` | longText | on submit | Business confidential |
| Client intake | `indicative_budget` | text | no | Business confidential |
| Client intake | `timing` | text | no | Business confidential |
| Client intake | `website` | text | no | Operational |
| Client intake | `referral` | text | no | Operational |
| Project & investment | `why_now` | longText | no | Business confidential |
| Project & investment | `top_priorities` | longText | no | Business confidential |
| Project & investment | `deliverables` | longText | no | Business confidential |
| Project & investment | `scope_in` | longText | no | Business confidential |
| Project & investment | `scope_out` | longText | no | Business confidential |
| Project & investment | `budget_status` | text | no | Business confidential |
| Project & investment | `budget_constraints` | text | no | Business confidential |
| Project & investment | `budget_covers` | choices | no | Operational |
| Project & investment | `investment_priorities` | longText | no | Business confidential |
| Business & audience | `business_story` | longText | no | Business confidential |
| Business & audience | `name_story` | longText | no | Business confidential |
| Business & audience | `mission` | longText | no | Business confidential |
| Business & audience | `internal_values` | longText | no | Business confidential |
| Business & audience | `desired_perception` | longText | no | Business confidential |
| Business & audience | `audience` | longText | no | Business confidential |
| Business & audience | `audience_value` | longText | no | Business confidential |
| Business & audience | `discovery_channels` | longText | no | Business confidential |
| Business & audience | `audience_outcome` | longText | no | Business confidential |
| Positioning & today | `competitors` | longText | no | Business confidential |
| Positioning & today | `strengths` | longText | no | Business confidential |
| Positioning & today | `difference` | longText | no | Business confidential |
| Positioning & today | `competitor_choice` | longText | no | Business confidential |
| Positioning & today | `last_update` | text | no | Business confidential |
| Positioning & today | `current_links` | text | no | Business confidential |
| Positioning & today | `current_problem` | longText | no | Business confidential |
| Positioning & today | `keep` | longText | no | Business confidential |
| Positioning & today | `remove` | longText | no | Business confidential |
| Positioning & today | `constraints` | longText | no | Business confidential |
| Creative direction | `look_feel` | longText | no | Business confidential |
| Creative direction | `inspiration` | longText | no | Business confidential |
| Creative direction | `dislikes` | longText | no | Business confidential |
| Creative direction | `colours` | longText | no | Business confidential |
| Creative direction | `typography` | longText | no | Business confidential |
| Creative direction | `asset_link` | text | no | Business confidential |
| Creative direction | `character_reach` | scale | no | Operational |
| Creative direction | `character_tone` | scale | no | Operational |
| Creative direction | `character_expression` | scale | no | Operational |
| Creative direction | `character_relationship` | scale | no | Operational |
| Creative direction | `character_era` | scale | no | Operational |
| Service details | `brand_wording` (conditional) | longText | no | Business confidential |
| Service details | `brand_uses` (conditional) | longText | no | Business confidential |
| Service details | `digital_requirements` (conditional) | longText | no | Business confidential |
| Service details | `content_requirements` (conditional) | longText | no | Business confidential |
| Service details | `maintenance` (conditional) | longText | no | Business confidential |
| Service details | `other_requirements` | longText | no | Business confidential |
| People & next steps | `start_date` | text | no | Business confidential |
| People & next steps | `launch_date` | text | no | Business confidential |
| People & next steps | `deadline_reason` | longText | no | Business confidential |
| People & next steps | `decision_maker` | longText | no | Third-party personal |
| People & next steps | `collaborators` | longText | no | Third-party personal |
| People & next steps | `responsibilities` | longText | no | Third-party personal |
| People & next steps | `dependencies` | longText | no | Business confidential |
| People & next steps | `review_complete` | confirm | on submit | Operational |
| People & next steps | `share_materials` | confirm | no | Operational |
| People & next steps | `acknowledgement_name` | text | on submit | Personal |

## Design systems intake & discovery (v1.0.0)

| Page | Field | Kind | Required | Class |
| --- | --- | --- | --- | --- |
| Design systems intake | `contact_name` | text | on submit | Personal |
| Design systems intake | `company` | text | on submit | Business confidential |
| Design systems intake | `email` | email | on submit | Personal |
| Design systems intake | `role` | text | no | Personal |
| Design systems intake | `phone` | tel | no | Personal |
| Design systems intake | `timezone` | text | no | Personal |
| Design systems intake | `system_links` | text | no | Business confidential |
| Design systems intake | `services` | choices | no | Operational |
| Design systems intake | `main_problem` | longText | on submit | Business confidential |
| Design systems intake | `desired_change` | longText | on submit | Business confidential |
| Design systems intake | `budget` | text | no | Business confidential |
| Design systems intake | `timing` | text | no | Business confidential |
| Design systems intake | `trigger` | text | no | Business confidential |
| System landscape | `purpose` | longText | no | Business confidential |
| System landscape | `scope` | longText | no | Business confidential |
| System landscape | `users` | longText | no | Business confidential |
| System landscape | `reach` | longText | no | Business confidential |
| System landscape | `sources` | longText | no | Third-party personal |
| System landscape | `current_state` | choices | no | Operational |
| System landscape | `mismatch` | longText | no | Business confidential |
| System landscape | `evidence` | longText | no | Business confidential |
| Foundations & coverage | `token_source` | longText | no | Business confidential |
| Foundations & coverage | `themes` | longText | no | Business confidential |
| Foundations & coverage | `foundations` | longText | no | Business confidential |
| Foundations & coverage | `coverage` | longText | no | Business confidential |
| Foundations & coverage | `a11y` | longText | no | Business confidential |
| Foundations & coverage | `behaviour` | longText | no | Business confidential |
| Foundations & coverage | `priority_components` | longText | no | Business confidential |
| Engineering & quality | `stack` | longText | no | Business confidential |
| Engineering & quality | `distribution` | longText | no | Business confidential |
| Engineering & quality | `parity` | longText | no | Business confidential |
| Engineering & quality | `verification` | longText | no | Business confidential |
| Engineering & quality | `documentation` | longText | no | Business confidential |
| Engineering & quality | `quality_gaps` | longText | no | Business confidential |
| Engineering & quality | `constraints_eng` | longText | no | Business confidential |
| Governance & capacity | `sponsor` | longText | no | Third-party personal |
| Governance & capacity | `system_owner` | longText | no | Third-party personal |
| Governance & capacity | `capacity` | longText | no | Business confidential |
| Governance & capacity | `decisions` | longText | no | Business confidential |
| Governance & capacity | `contributions` | longText | no | Business confidential |
| Governance & capacity | `exceptions` | longText | no | Business confidential |
| Governance & capacity | `support` | longText | no | Business confidential |
| Governance & capacity | `governance_pain` | longText | no | Business confidential |
| Adoption & migration | `adoption` | longText | no | Business confidential |
| Adoption & migration | `barriers` | longText | no | Business confidential |
| Adoption & migration | `metrics` | longText | no | Business confidential |
| Adoption & migration | `migration_sources` (conditional) | longText | no | Business confidential |
| Adoption & migration | `migration_constraints` (conditional) | longText | no | Business confidential |
| Adoption & migration | `pilot` (conditional) | longText | no | Business confidential |
| Adoption & migration | `migration_done` (conditional) | longText | no | Business confidential |
| AI & automation | `ai_goal` (conditional) | longText | no | Business confidential |
| AI & automation | `ai_today` (conditional) | longText | no | Business confidential |
| AI & automation | `ai_context` (conditional) | longText | no | Business confidential |
| AI & automation | `ai_permissions` (conditional) | longText | no | Business confidential |
| AI & automation | `ai_review` (conditional) | longText | no | Business confidential |
| AI & automation | `ai_pilot` (conditional) | longText | no | Business confidential |
| Goals & engagement | `success_measures` | longText | no | Business confidential |
| Goals & engagement | `engagement_outputs` | longText | no | Business confidential |
| Goals & engagement | `start` | text | no | Business confidential |
| Goals & engagement | `deadline` | text | no | Business confidential |
| Goals & engagement | `funding` | longText | no | Business confidential |
| Goals & engagement | `approval` | longText | no | Third-party personal |
| Goals & engagement | `dependencies` | longText | no | Business confidential |
| Goals & engagement | `review_complete` | confirm | on submit | Operational |
| Goals & engagement | `share_materials` | confirm | no | Operational |
| Goals & engagement | `ack_name` | text | on submit | Personal |
