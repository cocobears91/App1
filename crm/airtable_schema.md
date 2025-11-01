# Airtable CRM Blueprint for Equity Consulting Pipeline

## Base Structure Overview
- **Tables**: `Leads`, `Organizations`, `Opportunities`, `Engagements`, `Outreach Logs`, `Assets Library`, `Tasks & Follow-ups`.
- **Interfaces**: Executive dashboard, Outreach queue, Hot leads view, Calendar view synchronized with Google Calendar.
- **Automations**: Alert routing, lead scoring updates, email drafting, Calendly sync, nurture reminders.

---

## Table Definitions & Key Fields

### 1. Leads
| Field | Type | Notes |
| --- | --- | --- |
| `Lead Name` | Single line text | “First Last” or “Role – District” |
| `Organization` | Linked record → `Organizations` | One-to-many |
| `Role` | Single select | Superintendent, CAO, Principal, Board Chair, Program Director, Grant Officer |
| `Email` | Email | Primary outreach channel |
| `Phone` | Phone | Optional |
| `LinkedIn URL` | URL | For Sales Navigator/Phantombuster |
| `Source` | Single select | GovWin, Bonfire, EdJoin, Referral, LinkedIn, Conference, Inbound Form |
| `Trigger Insight` | Long text | Paste key quote from board minutes, news, RFP |
| `Pain Point Tags` | Multi select | Achievement Gaps, Equity Audit, Teen Parents, Attendance, Leadership Gap, AI Reporting |
| `Budget Signal` | Multi select | ESSER, Title I, General Fund, Foundation Grant, Emergency Funding |
| `Location` | Single line text | City/State |
| `Distance from 77494 (mi)` | Formula | `DISTANCE({Lat/Long}, 29.7604, -95.7986)` via automation or script |
| `Travel Surcharge Needed` | Formula | `IF({Distance from 77494 (mi)}>30, "Yes", "No")` |
| `Lead Status` | Single select | New, Researching, Qualified, Outreach, Warm, Hot, Closed – Won, Closed – Lost |
| `Lead Score` | Formula | See scoring model below |
| `Next Action Date` | Date | Drives follow-up automation |
| `Owner` | Collaborator | Usually Dr. Bukky or VA |
| `Notes` | Long text | Call notes, additional intel |

**Lead Score Formula**

```text
25 * IF({Urgency Flag}, 1, 0) +
20 * IF({Budget Signal}, 1, 0) +
15 * IF({Travel Surcharge Needed}="No", 1, 0) +
20 * IF(SEARCH("Teen", ARRAYJOIN({Pain Point Tags}))>0, 1, 0) +
20 * IF({Decision Maker?}="Yes", 1, 0)
```

- `Urgency Flag` generated via automation when trigger insight contains “deadline”, “board ordered”, “compliance”.
- `Decision Maker?` checkbox or single select.
- Leads ≥70 flagged as `Hot` (automation updates status and notifies owner).

### 2. Organizations
| Field | Type | Notes |
| --- | --- | --- |
| `Organization Name` | Primary field | District/Charter/Foundation/EdTech |
| `Type` | Single select | Public District, Charter Network, Foundation, NGO, EdTech |
| `State` | Single select | Use shortlist of target states |
| `Enrollment` | Number | If applicable |
| `Demographics Notes` | Long text | Key data on diverse populations |
| `Existing Initiatives` | Long text | Equity programs, single-mom support, AI pilots |
| `Warmth` | Single select | Cold, Warm, Existing Relationship |
| `Leads` | Linked records ← `Leads` | Rollup for quick access |
| `Open Opportunities` | Rollup ← `Opportunities` | Filter where status ≠ Closed |
| `Last Outreach Date` | Rollup `MAX(values)` from `Opportunities` |

### 3. Opportunities
| Field | Type | Notes |
| --- | --- | --- |
| `Opportunity Name` | Primary | e.g., “Equity Sprint – Houston ISD” |
| `Lead` | Linked record → `Leads` | Primary contact |
| `Organization` | Lookup from `Lead` | Autofill |
| `Service Package` | Single select | Equity Sprint, Rapid Audit, Coaching Bundle, Keynote |
| `Pricing Model` | Formula | Pulls from `Service Package` and modality |
| `Modality` | Single select | Remote, Hybrid, In-Person |
| `Travel Surcharge` | Formula | `IF(AND({Modality}="In-Person", {Distance}>30), IF({Service Package}="Equity Sprint", 500, IF({Service Package}="Rapid Audit", 1000, IF({Service Package}="Executive Coaching Bundle", 400, 500))), 0)` |
| `Monthly Value` | Currency | For retainers |
| `Total Value` | Currency | For flat projects (Monthly * months or flat fee + surcharge) |
| `Stage` | Single select | Discovery, Scoping, Proposal Sent, Verbal Yes, Contracting, Won, Lost |
| `Probability %` | Formula | Stage-based weighting |
| `Weighted Value` | Formula | `({Total Value} * {Probability %})/100` |
| `Close Date` | Date | Expected |
| `Next Step` | Long text | Summary of required action |

### 4. Engagements
| Field | Type | Notes |
| --- | --- | --- |
| `Engagement Name` | Primary | Mirrors opportunity upon win |
| `Opportunity` | Linked record → `Opportunities` | |
| `Start Date` | Date | |
| `End Date` | Date | |
| `Cadence` | Multi select | Weekly Check-in, Biweekly Coaching, Monthly Board Brief |
| `Delivery Mode` | Single select | Remote, Local In-Person, Hybrid |
| `Travel Reimbursement Terms` | Single select | Included, Flat Rate, Client Reimburses Toll |
| `Meeting Link` | URL | Zoom/Meet |
| `Status` | Single select | Active, Paused, Completed |
| `Deliverables` | Long text | Track progress |
| `Files` | Attachment | Store proposals, briefs |

### 5. Outreach Logs
| Field | Type | Notes |
| --- | --- | --- |
| `Outreach Date` | Date | |
| `Lead` | Linked record → `Leads` | |
| `Channel` | Single select | Email, LinkedIn, Call, SMS |
| `Touch #` | Number | 0–5 |
| `Template` | Single select | Intro Email, Follow-Up, Value Add, etc. |
| `Status` | Single select | Sent, Scheduled, Replied |
| `Response Summary` | Long text | |
| `Next Action Date` | Formula | `DATEADD({Outreach Date}, {Follow-Up Interval}, 'days')` |

### 6. Assets Library
| Field | Type | Notes |
| --- | --- | --- |
| `Asset Name` | Primary | Pricing One-Pager, Deer Valley Case Study, etc. |
| `Type` | Single select | Case Study, Template, Slide Deck, Video |
| `URL/File` | Attachment or URL | |
| `Use Cases` | Multi select | Equity Sprint, Teen Parents, AI Dashboard |
| `Latest Version` | Checkbox | |

### 7. Tasks & Follow-ups
| Field | Type | Notes |
| --- | --- | --- |
| `Task` | Primary | e.g., “Send proposal draft to Houston ISD” |
| `Lead/Opportunity` | Linked record | |
| `Due Date` | Date | |
| `Assigned To` | Collaborator | |
| `Status` | Single select | Not Started, In Progress, Waiting, Complete |
| `Priority` | Single select | High, Medium, Low |

---

## Automations
1. **Lead Intake & Enrichment**
   - Trigger: New record in `Leads` with empty `Lead Score`.
   - Actions: Call external script (Make/Zapier) to enrich contact (Apollo/PeopleDataLabs); update `Distance` via geocoding API; set `Urgency Flag` when `Trigger Insight` contains keywords.

2. **Lead Scoring Update**
   - Trigger: When `Lead Score` changes and ≥70.
   - Actions: Set `Lead Status` → Hot, notify owner via email/Slack, add to `Hot Leads` view.

3. **Outreach Sequence**
   - Trigger: `Lead Status` → Qualified.
   - Actions: Create first `Outreach Log` record, send automated intro email (via Gmail integration) using template tokens, schedule follow-up task 3 days later.

4. **Travel Surcharge Reminder**
   - Trigger: `Travel Surcharge Needed` = Yes & `Service Package` is In-Person.
   - Actions: Post comment in record reminding to include surcharge in proposal; update `Pricing Model` formula output.

5. **Calendly Sync**
   - Trigger: New Calendly event.
   - Actions: Match email to `Lead`; create/update `Opportunity` or `Engagement`; set `Next Action Date` based on meeting outcome.

6. **Post-Meeting Follow-Up**
   - Trigger: `Next Action Date` is today & `Lead Status` ≠ Closed.
   - Actions: Send reminder task; optionally draft recap email using AI script referencing `Meeting Notes` field.

7. **Nurture Loop**
   - Trigger: `Lead Status` = Warm & no outreach logged in 30 days.
   - Actions: Add to newsletter list; schedule LinkedIn touch.

---

## Interface Ideas
- **Dashboard**: Tiles for Hot leads, pipeline value, upcoming meetings, travel-required opportunities.
- **Outreach Kanban**: By `Lead Status` with quick action buttons (Send Email, Log Call).
- **Local Radius Map**: Use extension to map leads within 30 miles vs surcharge-required.
- **Content Library**: Quick select to copy asset links into emails.

---

## Scripts & Formulas Snippets
- **Distance Calculation (Make/Zapier)**
  - Call Google Maps API with lead address; write back lat/long and miles.
- **Travel Surcharge Formula**

```text
IF(
  AND({Modality}="In-Person", {Distance from 77494 (mi)}>30),
  SWITCH(
    {Service Package},
    "Equity Turnaround Sprint", "$500 per month travel surcharge",
    "Rapid Audit & Action Plan", "$1,000 travel surcharge",
    "Executive Coaching Bundle", "$400 travel surcharge",
    "Keynote + Workshop Bundle", "$500 travel surcharge",
    "Custom"
  ),
  "Included"
)
```

- **Availability Reference**: Create formula field `Suggested Meeting Windows` with default text “Weekday mornings CST (Mon–Thu). Limited PST overlap by request. Fridays after 12pm CST unavailable. Sundays unavailable due to church commitments.”

---

## Implementation Checklist
1. Clone Airtable base template and set collaborator permissions.
2. Populate `Assets Library` with pricing sheet, proposal template, case studies.
3. Integrate Calendly + Gmail + Google Calendar via Make/Zapier.
4. Configure automations in Airtable per above; test each trigger.
5. Import existing contacts/leads; dedupe using email.
6. Connect dashboard interface for daily review.
