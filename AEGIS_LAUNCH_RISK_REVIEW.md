# AEGIS Launch Risk Review

This is an implementation review for the current early-stage build. It is not legal advice, a security certification, or a claim that AEGIS is compliant with any particular law or standard.

| Issue | Why it matters | Where it occurs | Severity | Recommended action | Fixed? | Professional legal review? |
| --- | --- | --- | --- | --- | --- | --- |
| No production authentication or account recovery | The current demo profile is shared and cannot safely separate users. | API routes and demo seed data | Critical | Add managed authentication, session handling, account verification, recovery, and user-scoped records before real use. | No | Yes |
| No server-side role/relationship authorization | Hiding controls in the UI is not enough for family, supporter, emergency, or admin access. | All AEGIS API routes | Critical | Add authenticated user context, relationship checks, least-privilege policies, and authorization tests for every sensitive endpoint. | No | Yes |
| Emergency flow is notification-only | Users could misunderstand a support-network notification as emergency dispatch. | `/emergency` and `POST /api/emergency-alerts` | High | Keep the current explicit language; add verified notification delivery and local emergency-service guidance appropriate to each deployment geography. | Partially | Yes |
| Consent history and audit logging are incomplete | Sensitive sharing decisions need traceability, revocation, and review. | Privacy permissions and API mutations | High | Add consent records, immutable audit events, retention rules, and access history tied to authenticated users. | No | Yes |
| Generic first-build data model | The current schema supports a usable demo but does not model users, roles, relationships, or ownership. | `lib/db/src/schema/aegis.ts` | High | Migrate to relational user/network/permission tables before onboarding real households. | No | Yes |
| Legal copy is a review template | Privacy, terms, cookies, and contact content must reflect the actual entity, geography, vendors, retention, and rights process. | Public legal routes | High | Replace placeholders with counsel-reviewed policy text and verified business information. | No | Yes |
| Health data governance is not complete | Even reminder-only data can be sensitive and may trigger local obligations. | Health reminders and permissions | Medium | Define data classification, encryption, retention, export/deletion, and sharing rules for the deployment geography. | No | Yes |
| Accessibility has not received a formal WCAG audit | The build includes accessible patterns but needs testing with assistive technology and large-text settings. | Entire frontend | Medium | Run keyboard, screen-reader, contrast, zoom, focus, reduced-motion, and mobile touch testing with representative users. | No | No |
| No delivery guarantees for notifications | The app currently records notification intent; it does not prove delivery or responder availability. | Emergency and notifications API | Medium | Integrate a verified notification provider, delivery status, retry policy, and honest user-facing status copy. | No | Possibly |
| No analytics or third-party embeds | This reduces current privacy exposure but also means product usage measurement is not yet available. | Frontend | Low | If analytics are later added, document vendors, cookies, consent, retention, and opt-out before enabling them. | Yes for this build | Possibly |

## Current safety boundaries

- No diagnosis, treatment recommendation, or clinical accuracy claim.
- No claim that AEGIS itself is an emergency service.
- No fake testimonials, partner logos, certifications, user counts, reviews, or provider availability.
- No precise location collection in the first build.
- Demo records are fictional and use `example.test` contact data.

## Release decision

**Not ready for production users.** Ready for internal product exploration and continued implementation as an early-stage foundation.