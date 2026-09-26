# Data boundaries

Status: unresolved; use fictional client data until the Center agrees on the production boundary.

Document with the Center:

- Existing EHR or record system and whether referrals reference or duplicate its records.
- Minimum required referral fields, including whether client identity is stored here.
- Which teams and roles may read, create, assign, and update each record.
- Consent, retention, deletion, audit access, and incident handling requirements.
- Hosting, vendor agreements, and applicable compliance requirements before production use.

Public access should expose published service information only. Keep client information out of source control, seeds, routine logs, analytics, and model prompts. A client identifier linked to a service can still be sensitive.

Supabase privileged credentials bypass RLS; never put them in browser bundles. Audit records also need restricted access and a defined retention policy.
