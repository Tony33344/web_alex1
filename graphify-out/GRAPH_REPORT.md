# Graph Report - .  (2026-05-04)

## Corpus Check
- Large corpus: 286 files · ~112,062 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 698 nodes · 1011 edges · 31 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 107 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 78 edges
2. `getLocalizedField()` - 40 edges
3. `BasePage` - 33 edges
4. `createClient()` - 31 edges
5. `Input()` - 31 edges
6. `Badge()` - 27 edges
7. `cn()` - 23 edges
8. `LoginPage` - 23 edges
9. `EventsPage` - 23 edges
10. `AdminDashboardPage` - 22 edges

## Surprising Connections (you probably didn't know these)
- `getCaption()` --calls--> `getLocalizedField()`  [INFERRED]
  src/components/shared/GalleryGrid.tsx → src/lib/localization.ts
- `getAltText()` --calls--> `getLocalizedField()`  [INFERRED]
  src/components/shared/GalleryGrid.tsx → src/lib/localization.ts
- `getPlanName()` --calls--> `getLocalizedField()`  [INFERRED]
  src/app/[locale]/membership/MembershipClient.tsx → src/lib/localization.ts
- `POST()` --calls--> `createAdminClient()`  [INFERRED]
  src/app/api/stripe/webhook/route.ts → src/lib/supabase/admin.ts
- `generateMetadata()` --calls--> `getLocalizedField()`  [INFERRED]
  src/app/[locale]/role-teachers/[slug]/page.tsx → src/lib/localization.ts

## Communities (98 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (44): POST(), GET(), GET(), requireAdmin(), GET(), POST(), POST(), DELETE() (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (28): POST(), GET(), POST(), POST(), loadTemplate(), prepareEmail(), renderTemplate(), createTransporter() (+20 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (14): generateMetadata(), generateMetadata(), getLocalizedField(), generateMetadata(), generateMetadata(), getPage(), getPageSections(), getPageWithSections() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (12): handleLogout(), isActive(), p(), LanguageSwitcher(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (3): handleSubmit(), handleSubmit(), Input()

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (10): NotFound(), LocaleLayout(), getEvents(), getFeaturedEvent(), getHealthCategories(), getPrograms(), getTeachers(), getTestimonials() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (3): Dialog(), DialogClose(), DialogTrigger()

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (5): CheckoutDialog(), useUser(), getPlanName(), EnrollButton(), EnrollButtonClient()

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (7): getBlogPost(), getEvent(), getHealthCategory(), getTeacher(), EventRegisterButtonClient(), SmartImage(), generateMetadata()

### Community 16 - "Community 16"
Cohesion: 0.23
Nodes (5): getProgram(), computeEndDate(), formatDateRange(), formatDateRangeWithTime(), parseDurationDays()

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (5): createAndLoginAdmin(), cleanupAllTestUsers(), generateTestAdmin(), generateTestUser(), getLocalizedPath()

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (4): MembershipPage(), getGalleryImages(), getMembershipPlans(), getSettings()

### Community 27 - "Community 27"
Cohesion: 0.48
Nodes (5): addNew(), load(), move(), remove(), save()

### Community 32 - "Community 32"
Cohesion: 0.6
Nodes (3): handleDrop(), handleFileChange(), uploadFile()

## Knowledge Gaps
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Badge()` connect `Community 24` to `Community 8`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 29`, `Community 34`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 48`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 53`, `Community 55`?**
  _High betweenness centrality (0.404) - this node is a cross-community bridge._
- **Why does `Input()` connect `Community 7` to `Community 32`, `Community 34`, `Community 26`, `Community 11`, `Community 12`, `Community 44`, `Community 45`, `Community 15`, `Community 16`, `Community 13`, `Community 21`, `Community 54`, `Community 55`, `Community 56`, `Community 57`, `Community 58`?**
  _High betweenness centrality (0.324) - this node is a cross-community bridge._
- **Why does `ResetPasswordPage()` connect `Community 15` to `Community 9`?**
  _High betweenness centrality (0.285) - this node is a cross-community bridge._
- **Are the 45 inferred relationships involving `createAdminClient()` (e.g. with `verifyAndActivateSession()` and `POST()`) actually correct?**
  _`createAdminClient()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `getLocalizedField()` (e.g. with `getCaption()` and `getAltText()`) actually correct?**
  _`getLocalizedField()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._