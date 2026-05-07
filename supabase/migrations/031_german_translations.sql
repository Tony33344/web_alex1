-- Populate German translations for events (force overwrite)
UPDATE events SET 
  title_de = 'BEWEGTE MEDITATION WORKSHOP mit Meister Zhen Hua Yang - Innere Harmonie: 2-Tage Nei Gong',
  description_de = 'Innere Harmonie - Bewegte Meditation. Fühlen Sie sich, als ob Ihr Körper und Geist nicht synchron sind? Stellen Sie das Gleichgewicht durch Innere Harmonie wieder her, einen 2-tägigen Workshop unter der Leitung von Meister Zhen Hua Yang.',
  long_content_de = 'Innere Harmonie - Bewegte Meditation. Fühlen Sie sich, als ob Ihr Körper und Geist nicht synchron sind? Stellen Sie das Gleichgewicht durch Innere Harmonie wieder her, einen 2-tägigen Workshop unter der Leitung von Meister Zhen Hua Yang. Eine Einführung in Organ...'
WHERE title_en LIKE '%MOVING MEDITATION WORKSHOP%';

UPDATE events SET 
  title_de = 'SUNYOGA ist Sonnenmeditation mit SUNYOGI, 3 Tage wissenschaftliche spirituelle Heilung (Stufen 1-3)',
  description_de = 'SUNYOGA ist Sonnenmeditation mit SUNYOGI, 3 Tage wissenschaftliche spirituelle Heilung (Stufen 1-3)',
  long_content_de = 'SUNYOGA ist Sonnenmeditation mit SUNYOGI, 3 Tage wissenschaftliche spirituelle Heilung (Stufen 1-3)'
WHERE title_en LIKE '%SUNYOGA is Sun Meditation%';

UPDATE events SET 
  title_de = 'LEHRERKURS FÜR AKUPRESSUR mit Swamiji SUNYOGI, 4 Tage wissenschaftliche spirituelle Heilung (Stufen 1-4)',
  description_de = 'LEHRERKURS FÜR AKUPRESSUR mit Swamiji SUNYOGI, 4 Tage wissenschaftliche spirituelle Heilung (Stufen 1-4)',
  long_content_de = 'LEHRERKURS FÜR AKUPRESSUR mit Swamiji SUNYOGI, 4 Tage wissenschaftliche spirituelle Heilung (Stufen 1-4)'
WHERE title_en LIKE '%TEACHER COURSE for ACUPRESSURE%';

UPDATE events SET 
  title_de = 'HARMONIE INNEN: 2-Tage Reise zur Ganzheit',
  description_de = 'HARMONIE INNEN: 2-Tage Reise zur Ganzheit',
  long_content_de = 'HARMONIE INNEN: 2-Tage Reise zur Ganzheit'
WHERE title_en LIKE '%HARMONY WITHIN%';

-- Update location names to German
UPDATE events SET 
  location = REPLACE(location, 'Slovenia', 'Slowenien'),
  location_address = REPLACE(location_address, 'Slovenia', 'Slowenien')
WHERE location LIKE '%Slovenia%';

UPDATE events SET 
  location = REPLACE(location, 'Switzerland', 'Schweiz'),
  location_address = REPLACE(location_address, 'Switzerland', 'Schweiz')
WHERE location LIKE '%Switzerland%';

-- Populate German translations for blog posts
UPDATE blog_posts SET 
  title_de = 'Heilende Räume gestalten',
  excerpt_de = 'Wellness',
  content_de = content_en
WHERE title_en = 'Designing Spaces for Healing';

UPDATE blog_posts SET 
  title_de = 'Ritual und Rhythmus im modernen Leben',
  excerpt_de = 'Wellness',
  content_de = content_en
WHERE title_en = 'Ritual and Rhythm in Modern Life';

-- Populate German translations for health categories
UPDATE health_categories SET 
  name_de = 'Ernährung als Lebendigkeit',
  description_de = 'Ihr Körper ist ein alchemistisches Labor. Nahrung ist ein Bündel aus Erinnerung und Intelligenz. Das ist Leben, das mit Leben spricht.',
  long_content_de = long_content_en
WHERE name_en = 'Nutrition as Aliveness';

UPDATE health_categories SET 
  name_de = 'Yoga-Übungen',
  description_de = 'Yoga hilft Ihnen, sich ruhiger, flexibler und stärker zu fühlen. Es lindert Stress und lässt Ihren Körper einfach besser fühlen.',
  long_content_de = long_content_en
WHERE name_en = 'Yoga Exercises';

UPDATE health_categories SET 
  name_de = 'Sunyoga (= Sonnenmeditation)',
  description_de = 'Es hilft, Ihren Geist für spirituelles Erwachen zu öffnen und fördert eine tiefe Verbindung zu Ihrem inneren Selbst und einen Schritt näher an...',
  long_content_de = long_content_en
WHERE name_en = 'Sunyoga (= sun meditation)';

UPDATE health_categories SET 
  name_de = 'Meditation',
  description_de = 'Richtet Ihren Körper, Geist und Energie aus und verwandelt Freude von einem zufälligen Ereignis in Ihren natürlichen, konstanten Zustand des Seins.',
  long_content_de = long_content_en
WHERE name_en = 'Meditation';

UPDATE health_categories SET 
  name_de = 'Präzision schlägt Kraft, und Timing schlägt Geschwindigkeit',
  description_de = '= Stärke + Geschwindigkeit. Es macht Sie schneller, stärker in Schüben, sicherer auf den Füßen, verbrennt mehr Kalorien, hält Sie fühlen...',
  long_content_de = long_content_en
WHERE name_en = 'Precision beats power, and timing beats speed';

UPDATE health_categories SET 
  name_de = 'Akupressur',
  description_de = 'Durch Stimulierung dieser Energiepunkte hilft die Akupressur, den Fluss der Lebensenergie (Qi oder Prana) zu harmonisieren und zu ermächtigen...',
  long_content_de = long_content_en
WHERE name_en = 'Acupressure';

-- Populate German translations for teachers
UPDATE teachers SET 
  title_de = 'Verkörperter Führer für innere Orientierung',
  bio_de = bio_en,
  short_bio_de = short_bio_en
WHERE title_en = 'Embodied guide for inner orientation';

UPDATE teachers SET 
  title_de = 'Traditionelle Weisheit und moderne Technologie für ganzheitliche Gesundheit verbinden',
  bio_de = bio_en,
  short_bio_de = short_bio_en
WHERE title_en = 'Bridging Traditional Wisdom and Modern Technology for Holistic Health';

UPDATE teachers SET 
  title_de = 'Lehrer des Bewusstseins, der reinen Liebe und Spiritualität',
  bio_de = bio_en,
  short_bio_de = short_bio_en
WHERE title_en = 'Teacher of awareness, pure love and spirituality';

-- Populate German translations for programs
UPDATE programs SET 
  name_de = 'Avalon - Sunyoga Sonnenmeditation Stufe 1-2 Kurs + kostenlose Gelenkreinigungsübungen',
  description_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.',
  long_content_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.'
WHERE name_en LIKE '%joint cleansing exercises%';

UPDATE programs SET 
  name_de = 'Avalon - Sunyoga Sonnenmeditation Stufe 1-2 Kurs + kostenlose Bildmeditation',
  description_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.',
  long_content_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.'
WHERE name_en LIKE '%picture meditation%';

UPDATE programs SET 
  name_de = 'Avalon - Sunyoga Sonnenmeditation Stufe 1-2 Kurs + kostenlose Chakra-Reinigungsübungen',
  description_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.',
  long_content_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.'
WHERE name_en LIKE '%chakra cleansing exercises%';

UPDATE programs SET 
  name_de = 'Avalon - Sunyoga Sonnenmeditation Stufe 1-2 Kurs + kostenlose Körperorganübungen',
  description_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.',
  long_content_de = 'Erleben Sie die transformative Kraft der Sonne und entfesseln Sie Ihr Potenzial. Sunyoga ist nicht nur eine Praxis, sondern eine tiefe Reise, die Sie mit der kosmischen Energie der Sonne verbindet.'
WHERE name_en LIKE '%body organ exercises%';

UPDATE programs SET 
  name_de = 'Akupressur-Training',
  description_de = 'Akupressur: Ein ganzheitlicher Weg zur Heilung. In der Welt der ganzheitlichen Wellness hat Sunyogi Umasankar den Weg zur optimalen Gesundheit durch die alte Kunst der Akupressur beleuchtet.',
  long_content_de = 'Akupressur: Ein ganzheitlicher Weg zur Heilung. In der Welt der ganzheitlichen Wellness hat Sunyogi Umasankar den Weg zur optimalen Gesundheit durch die alte Kunst der Akupressur beleuchtet.'
WHERE name_en LIKE '%Acupressure Training%';

UPDATE programs SET 
  name_de = 'Erwecken Sie Ihren inneren Kompass',
  description_de = 'Online-Lehren, Heilung und Abenteuer mit Infinity Role Teacher Akasha. Hallo, schöne Seele. Ich bin Akasha, und ich bin so froh, dass Sie hier sind. Dieses Programm ist aus reiner Liebe und einem tiefen Wunsch geboren...',
  long_content_de = 'Online-Lehren, Heilung und Abenteuer mit Infinity Role Teacher Akasha. Hallo, schöne Seele. Ich bin Akasha, und ich bin so froh, dass Sie hier sind. Dieses Programm ist aus reiner Liebe und einem tiefen Wunsch geboren...'
WHERE name_en LIKE '%Awaken Your Inner Compass%';

-- Update program prerequisites and what_you_learn arrays
UPDATE programs SET 
  prerequisites = ARRAY['Sie werden ein tiefes Verständnis dafür erlangen, wie man Sonnenmeditation praktiziert', 'Auge-zu-Auge-Meditation', 'Auf-Bild-Meditation', 'Körperorganübungen', 'Chakra-Reinigungsübungen']
WHERE name_en LIKE '%Avalon - Sunyoga Sun Meditation Level 1-2 Course%';

UPDATE programs SET 
  prerequisites = ARRAY['Jederzeit und überall tun: Selbst-Akupressur ist eine einfache Technik', 'Lernen Sie es zuerst an sich selbst: Durch Übung am eigenen Körper', 'Teilen Sie die Vorteile mit anderen: Sobald Sie mit den Grundlagen vertraut sind, können Sie andere leicht unterrichten', 'Nehmen Sie die Heilung in die eigenen Hände: Diese Selbstheilungsmethoden geben Ihnen die Kontrolle über Ihr eigenes Wohlbefinden', 'Gesund und glücklich sein']
WHERE name_en LIKE '%Acupressure Training%';

UPDATE programs SET 
  prerequisites = ARRAY['Hingabe ist die höchste Form der Intelligenz', 'Ein Ziel zu haben, Pläne werden sich entwickeln und manifestieren', 'Reine Liebe ist eine Medizin für Körper, Geist und Seele']
WHERE name_en LIKE '%Awaken Your Inner Compass%';

-- Populate German translations for teacher specialties
UPDATE teachers SET 
  specialties = ARRAY['Meditation', 'Ganzheitliche Heilung', 'Ernährung', 'Spezielle Körperübungen', 'Lebensberatung']
WHERE specialties = ARRAY['Meditation', 'Holistic Healing', 'Nutrition', 'Special body exercises', 'Life Guidance'];

UPDATE teachers SET 
  specialties = ARRAY['Ganzheitliche Heilung', 'Arzt', 'Meditation', 'Ernährung', 'Pädagoge', 'Quantendiagnostik']
WHERE specialties = ARRAY['Holistic Healing', 'Physician', 'Meditation', 'Nutrition', 'Educator', 'Quantum Diagnostic'];

UPDATE teachers SET 
  specialties = ARRAY['Yoga & Meditation', 'Wellness-Coaching', 'Akupressur', 'Reconnection-Heilung', 'Lebensberatung']
WHERE specialties = ARRAY['Yoga & Meditation', 'Wellness Coaching', 'Acupressure', 'Reconnection Healing', 'Life Guidance'];

-- Populate German translations for testimonials
UPDATE testimonials SET 
  content_de = 'In ihrem Kern ist Akasha tief dem Leben und dem Wachstum anderer gewidmet. Sie trägt eine seltene Kombination aus Empathie, Stärke, Intuition und Ehrlichkeit. Menschen fühlen sich in ihrer Nähe gesehen, und das allein kann transformierend sein. Diese Plattform komplett...'
WHERE content_en LIKE '%At her core, Akasha is deeply devoted to life%';

UPDATE testimonials SET 
  content_de = 'Wenn nötig, kann sie Struktur, Klarheit und Disziplin bringen. Doch Akasha tut dies auf eine Weise, die Menschen ermächtigt, diese Qualitäten von innen heraus zu entwickeln, anstatt sich von außen unter Druck gesetzt zu fühlen. Ihre Präsenz drängt Menschen sanft dazu aufzusteigen...'
WHERE content_en LIKE '%When needed, she can bring structure%';

-- Populate German translations for pages
UPDATE pages SET 
  title_de = 'Mitgliedschaft',
  content_de = 'Ihr Experte ist Ihr Partner, feiert Siege mit Ihnen und navigiert durch Herausforderungen.',
  meta_description_de = 'Ihr Experte ist Ihr Partner, feiert Siege mit Ihnen und navigiert durch Herausforderungen.'
WHERE slug = 'membership';

UPDATE pages SET 
  title_de = 'Kontakt',
  content_de = 'Wir unsen uns eine Zukunft, in der ganzheitliche Wellness-Praktiken in den Alltag gewoben sind, in der Menschen nicht nur Symptome behandeln, sondern anhaltende Vitalität und inneren Frieden kultivieren.',
  meta_description_de = 'Wir unsen uns eine Zukunft, in der ganzheitliche Wellness-Praktiken in den Alltag gewoben sind.'
WHERE slug = 'contact';

-- Update blog post descriptions
UPDATE blog_posts SET 
  content_de = 'Jedes Individuum lebt im Einklang mit dem Zweck seiner Seele und trägt zu einer blühenden, bewussten Zivilisation bei.'
WHERE content_en LIKE '%Every individual lives in alignment with their soul%';

-- Update home page content
UPDATE pages SET 
  title_de = 'Willkommen bei Infinity Role Teachers',
  content_de = 'Wenn Lehrer zu Infinity Role Teachers werden und jedes Herz mit Liebe schlägt, erwacht der Planet – und auch wir. Gemeinsam gebären wir eine neue Ära des bewussten Wandels.',
  meta_description_de = 'Wenn Lehrer zu Infinity Role Teachers werden und jedes Herz mit Liebe schlägt, erwacht der Planet – und auch wir. Gemeinsam gebären wir eine neue Ära des bewussten Wandels.'
WHERE slug = 'home';

-- Update coach training page
UPDATE pages SET 
  title_de = 'Coach-Ausbildung',
  content_de = 'Authentizität - Lehrmethoden, die in alter Weisheit verwurzelt und durch modernes Verständnis validiert sind.',
  meta_description_de = 'Authentizität - Lehrmethoden, die in alter Weisheit verwurzelt und durch modernes Verständnis validiert sind.'
WHERE slug = 'coach-training';

-- Update blog page
UPDATE pages SET 
  title_de = 'Blog',
  content_de = 'Jedes Individuum lebt im Einklang mit dem Zweck seiner Seele und trägt zu einer blühenden, bewussten Zivilisation bei.',
  meta_description_de = 'Jedes Individuum lebt im Einklang mit dem Zweck seiner Seele und trägt zu einer blühenden, bewussten Zivilisation bei.'
WHERE slug = 'blog';

-- Update footer links in settings or create footer translations
-- These are typically in settings or a separate table, for now we'll update the navigation if needed

-- Update about page content
UPDATE pages SET 
  title_de = 'Über uns',
  content_de = 'Infinity Role Teachers fördert ganzheitliches Wohlbefinden durch Sunyoga, Akupressur, Meditation und bewusstes Coaching. Wir bauen Sandha-Gemeinschaften auf, die das unbegrenzte Potenzial in jedem Herzen erwecken, um eine wirklich vereinte, bewusste Welt gemeinsam zu erschaffen.',
  meta_description_de = 'Infinity Role Teachers fördert ganzheitliches Wohlbefinden durch Sunyoga, Akupressur, Meditation und bewusstes Coaching.'
WHERE slug = 'about';

-- Update mission page content
UPDATE pages SET 
  title_de = 'Unsere Mission',
  content_de = 'Unsere Mission bei Infinity Role Teachers: Individuen durch ganzheitliches Wohlbefinden, Sunyoga und zertifizierte Coach-Ausbildungsprogramme zu stärken.',
  meta_description_de = 'Unsere Mission bei Infinity Role Teachers: Individuen durch ganzheitliches Wohlbefinden, Sunyoga und zertifizierte Coach-Ausbildungsprogramme zu stärken.'
WHERE slug = 'mission';

-- Update vision page content
UPDATE pages SET 
  title_de = 'Unsere Vision',
  content_de = 'Unsere Vision bei Infinity Role Teachers: Eine Welt, in der ganzheitliches Wohlbefinden eine Lebensweise ist, angetrieben von zertifizierten Coaches weltweit.',
  meta_description_de = 'Unsere Vision bei Infinity Role Teachers: Eine Welt, in der ganzheitliches Wohlbefinden eine Lebensweise ist, angetrieben von zertifizierten Coaches weltweit.'
WHERE slug = 'vision';

-- Update donate page content
UPDATE pages SET 
  title_de = 'Spenden',
  content_de = 'Unterstützen Sie unsere Arbeit und helfen Sie uns, ein Zuhause für den Suchenden zu bauen.',
  meta_description_de = 'Unterstützen Sie unsere Arbeit und helfen Sie uns, ein Zuhause für den Suchenden zu bauen.'
WHERE slug = 'donate';

-- Update volunteer page content
UPDATE pages SET 
  title_de = 'Freiwillig',
  content_de = 'Werden Sie Teil unseres Freiwilligenteams. Fern Freiwilligenrollen (Arbeiten von überall aus). Diese Rollen ermöglichen es Ihnen, von überall aus beizutragen und die globale Mission des IRT-Zentrums durch digitale, finanzielle und kreative Bemühungen zu unterstützen. Fundraising & Grant-Spezialist – Verbinden Sie sich mit Spendern, erstellen Sie Grant-Anträge und organisieren Sie Fundraising-Initiativen. Finanzen & Audit – Verwalten Sie Budgets, Gehaltsabrechnungen und Finanzunterlagen und sorgen Sie für Compliance. Grafikdesigner – Erstellen Sie visuelle Designs für Broschüren, Poster und Werbematerialien. Content Creator & Video-Editor – Entwickeln Sie ansprechende Inhalte, bearbeiten Sie Videos und verbessern Sie die Online-Sichtbarkeit. Website-Management & SEO – Pflegen und aktualisieren Sie die Website, verbessern Sie Suchrankings und automatisieren Sie Prozesse. Buchdesign & -veröffentlichung – Designen, bearbeiten und veröffentlichen Sie Bücher, Handbücher und Ressourcen zu IRT-Lehren. Marketing & Outreach-Koordinator – Erweitern Sie die Reichweite von IRT durch gezielte Werbeaktionen, soziale Medien und strategische Marketinginitiativen. Personalwesen. Warum freiwillig? Vertiefen Sie Ihre Sadhana. Beschleunigen Sie Ihr spirituelles Wachstum, während Sie Ihre Sadhana (yogische Praktiken) ausüben.',
  meta_description_de = 'Werden Sie Teil unseres Freiwilligenteams und tragen Sie Ihre Zeit und Fähigkeiten bei.'
WHERE slug = 'volunteer';
