-- Populate German translations for events
UPDATE events SET 
  title_de = 'BEWEGTE MEDITATION WORKSHOP mit Meister Zhen Hua Yang - Innere Harmonie: 2-Tage Nei Gong',
  brief_description_de = 'Innere Harmonie - Bewegte Meditation. Fühlen Sie sich, als ob Ihr Körper und Geist nicht synchron sind? Stellen Sie das Gleichgewicht durch Innere Harmonie wieder her, einen 2-tägigen Workshop unter der Leitung von Meister Zhen Hua Yang. Eine Einführung in Organ...',
  description_de = 'Innere Harmonie - Bewegte Meditation. Fühlen Sie sich, als ob Ihr Körper und Geist nicht synchron sind? Stellen Sie das Gleichgewicht durch Innere Harmonie wieder her, einen 2-tägigen Workshop unter der Leitung von Meister Zhen Hua Yang.'
WHERE title_en = 'MOVING MEDITATION WORKSHOP with Master Zhen Hua Yang - Inner Harmony: 2-Days Nei Gong';

UPDATE events SET 
  title_de = 'SUNYOGA ist Sonnenmeditation mit SUNYOGI, 3 Tage wissenschaftliche spirituelle Heilung (Stufen 1-3)',
  brief_description_de = 'SUNYOGA ist Sonnenmeditation mit SUNYOGI, 3 Tage wissenschaftliche spirituelle Heilung (Stufen 1-3)',
  description_de = 'SUNYOGA ist Sonnenmeditation mit SUNYOGI, 3 Tage wissenschaftliche spirituelle Heilung (Stufen 1-3)'
WHERE title_en = 'SUNYOGA is Sun Meditation with SUNYOGI, 3-days of Scientific Spiritual Healing (Levels1-3)';

UPDATE events SET 
  title_de = 'LEHRERKURS FÜR AKUPRESSUR mit Swamiji SUNYOGI, 4 Tage wissenschaftliche spirituelle Heilung (Stufen 1-4)',
  brief_description_de = 'LEHRERKURS FÜR AKUPRESSUR mit Swamiji SUNYOGI, 4 Tage wissenschaftliche spirituelle Heilung (Stufen 1-4)',
  description_de = 'LEHRERKURS FÜR AKUPRESSUR mit Swamiji SUNYOGI, 4 Tage wissenschaftliche spirituelle Heilung (Stufen 1-4)'
WHERE title_en = 'TEACHER COURSE for ACUPRESSURE with Swamiji SUNYOGI, 4-days of Scientific Spiritual Healing (Levels1-4)';

UPDATE events SET 
  title_de = 'HARMONIE INNEN: 2-Tage Reise zur Ganzheit',
  brief_description_de = 'HARMONIE INNEN: 2-Tage Reise zur Ganzheit',
  description_de = 'HARMONIE INNEN: 2-Tage Reise zur Ganzheit'
WHERE title_en = 'HARMONY WITHIN: 2 - days journey to wholeness';

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
  description_de = description_en,
  long_content_de = long_content_en
WHERE name_en LIKE '%Avalon - Sunyoga Sun Meditation Level 1-2 Course + free joint cleansing exercises%';

UPDATE programs SET 
  name_de = 'Avalon - Sunyoga Sonnenmeditation Stufe 1-2 Kurs + kostenlose Bildmeditation',
  description_de = description_en,
  long_content_de = long_content_en
WHERE name_en LIKE '%Avalon - Sunyoga Sun Meditation Level 1-2 Course + free picture meditation%';

UPDATE programs SET 
  name_de = 'Avalon - Sunyoga Sonnenmeditation Stufe 1-2 Kurs + kostenlose Chakra-Reinigungsübungen',
  description_de = description_en,
  long_content_de = long_content_en
WHERE name_en LIKE '%Avalon - Sunyoga Sun Meditation Level 1-2 Course + free chakra cleansing exercises%';
