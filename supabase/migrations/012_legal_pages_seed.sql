-- ============================================
-- SEED: Disclaimer, Privacy Policy & Terms & Conditions pages
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses ON CONFLICT)
-- ============================================

INSERT INTO pages (slug, title_en, title_de, title_it, title_fr, title_hi, title_si, content_en, content_de, content_it, content_fr, content_hi, content_si, meta_description_en, meta_description_de, meta_description_it, meta_description_fr, meta_description_hi, meta_description_si, is_published, page_order)
VALUES (
  'disclaimer',
  'Disclaimer',
  'Impressum',
  'Disclaimer',
  'Mentions légales',
  'अस्वीकरण',
  'Izjava o odgovornosti',
  '<h2>Disclaimer / Legal Notice</h2>
<p>This website is provided by Infinity Role Teachers for informational purposes only.</p>
<h3>Company Information</h3>
<p><strong>Infinity Role Teachers</strong></p>
<p>Insert your company address, registration number, and contact details here.</p>
<h3>Content Disclaimer</h3>
<p>The content on this website is for general information purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.</p>
<h3>Limitation of Liability</h3>
<p>In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.</p>',
  '<h2>Impressum</h2>
<p>Diese Website wird von Infinity Role Teachers zu Informationszwecken bereitgestellt.</p>
<h3>Firmeninformationen</h3>
<p><strong>Infinity Role Teachers</strong></p>
<p>Fügen Sie hier Ihre Firmenadresse, Registriernummer und Kontaktdaten ein.</p>
<h3>Haftungsausschluss</h3>
<p>Der Inhalt dieser Website dient nur zu allgemeinen Informationszwecken. Wir geben keine Zusicherungen oder Garantien jeglicher Art, ob ausdrücklich oder stillschweigend, bezüglich der Vollständigkeit, Genauigkeit, Zuverlässigkeit, Eignung oder Verfügbarkeit der Website.</p>',
  '<h2>Disclaimer</h2>
<p>Questo sito web è fornito da Infinity Role Teachers a scopo informativo.</p>
<h3>Informazioni aziendali</h3>
<p><strong>Infinity Role Teachers</strong></p>
<p>Inserisci qui l''indirizzo aziendale, il numero di registrazione e i dettagli di contatto.</p>',
  '<h2>Mentions légales</h2>
<p>Ce site web est fourni par Infinity Role Teachers à des fins d''information.</p>
<h3>Informations sur l''entreprise</h3>
<p><strong>Infinity Role Teachers</strong></p>
<p>Insérez ici l''adresse de l''entreprise, le numéro d''enregistrement et les coordonnées.</p>',
  '<h2>अस्वीकरण</h2>
<p>यह वेबसाइट इन्फिनिटी रोल टीचर्स द्वारा सूचना उद्देश्यों के लिए प्रदान की जाती है।</p>',
  '<h2>Izjava o odgovornosti</h2>
<p>To spletno mesto zagotavlja Infinity Role Teachers za informativne namene.</p>',
  'Legal notice and disclaimer for Infinity Role Teachers website.',
  'Rechtlicher Hinweis und Impressum für Infinity Role Teachers Webseite.',
  'Avviso legale e disclaimer per il sito web di Infinity Role Teachers.',
  'Mentions légales pour le site web de Infinity Role Teachers.',
  'कानूनी सूचना और अस्वीकरण Infinity Role Teachers वेबसाइट के लिए।',
  'Pravno obvestilo in izjava o odgovornosti za spletno mesto Infinity Role Teachers.',
  true,
  10
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_de = EXCLUDED.title_de,
  title_it = EXCLUDED.title_it,
  title_fr = EXCLUDED.title_fr,
  title_hi = EXCLUDED.title_hi,
  title_si = EXCLUDED.title_si,
  content_en = EXCLUDED.content_en,
  content_de = EXCLUDED.content_de,
  content_it = EXCLUDED.content_it,
  content_fr = EXCLUDED.content_fr,
  content_hi = EXCLUDED.content_hi,
  content_si = EXCLUDED.content_si,
  meta_description_en = EXCLUDED.meta_description_en,
  meta_description_de = EXCLUDED.meta_description_de,
  meta_description_it = EXCLUDED.meta_description_it,
  meta_description_fr = EXCLUDED.meta_description_fr,
  meta_description_hi = EXCLUDED.meta_description_hi,
  meta_description_si = EXCLUDED.meta_description_si,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

INSERT INTO pages (slug, title_en, title_de, title_it, title_fr, title_hi, title_si, content_en, content_de, content_it, content_fr, content_hi, content_si, meta_description_en, meta_description_de, meta_description_it, meta_description_fr, meta_description_hi, meta_description_si, is_published, page_order)
VALUES (
  'privacy',
  'Privacy Policy',
  'Datenschutzerklärung',
  'Privacy Policy',
  'Politique de confidentialité',
  'गोपनीयता नीति',
  'Politika zasebnosti',
  '<h2>Privacy Policy</h2>
<p>Last updated: January 2025</p>
<h3>Information We Collect</h3>
<p>We collect information you provide directly to us when you create an account, register for events, sign up for membership, subscribe to our newsletter, or contact us. This may include your name, email address, phone number, and other personal information.</p>
<h3>How We Use Your Information</h3>
<p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and provide customer service.</p>
<h3>Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
<h3>Your Rights</h3>
<p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time.</p>
<h3>Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at: insert your email address here.</p>',
  '<h2>Datenschutzerklärung</h2>
<p>Zuletzt aktualisiert: Januar 2025</p>
<h3>Informationen, die wir sammeln</h3>
<p>Wir sammeln Informationen, die Sie uns direkt bereitstellen, wenn Sie ein Konto erstellen, sich für Veranstaltungen anmelden, eine Mitgliedschaft abschließen, unseren Newsletter abonnieren oder uns kontaktieren.</p>
<h3>Verwendung Ihrer Informationen</h3>
<p>Wir verwenden die gesammelten Informationen, um unsere Dienste bereitzustellen, Transaktionen zu verarbeiten und Ihnen Kundenservice zu bieten.</p>
<h3>Datensicherheit</h3>
<p>Wir implementieren geeignete technische und organisatorische Maßnahmen, um Ihre persönlichen Daten vor unbefugtem Zugriff zu schützen.</p>',
  '<h2>Privacy Policy</h2>
<p>Ultimo aggiornamento: Gennaio 2025</p>
<h3>Informazioni che raccogliamo</h3>
<p>Raccogliamo le informazioni che ci fornite direttamente quando create un account, vi iscrivete agli eventi, vi abbonate alla newsletter o ci contattate.</p>',
  '<h2>Politique de confidentialité</h2>
<p>Dernière mise à jour: Janvier 2025</p>
<h3>Informations que nous collectons</h3>
<p>Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, vous inscrivez à des événements, vous abonnez à notre newsletter ou nous contactez.</p>',
  '<h2>गोपनीयता नीति</h2>
<p>अंतिम अपडेट: जनवरी 2025</p><h3>हम जो जानकारी एकत्र करते हैं</h3><p>हम वह जानकारी एकत्र करते हैं जो आप हमें सीधे प्रदान करते हैं जब आप खाता बनाते हैं, घटनाओं के लिए साइन अप करते हैं, या हमसे संपर्क करते हैं।</p>',
  '<h2>Politika zasebnosti</h2><p>Zadnja posodobitev: Januar 2025</p><h3>Informacije, ki zbiramo</h3><p>Zbiramo informacije, ki nam jih neposredno zagotovite, ko ustvarite račun, se prijavite na dogodke ali nas kontaktirate.</p>',
  'Privacy policy for Infinity Role Teachers website - how we collect, use, and protect your data.',
  'Datenschutzerklärung für Infinity Role Teachers Webseite - wie wir Ihre Daten sammeln, verwenden und schützen.',
  'Privacy policy per il sito web di Infinity Role Teachers - come raccogliamo, usiamo e proteggiamo i vostri dati.',
  'Politique de confidentialité pour le site web de Infinity Role Teachers.',
  'इन्फिनिटी रोल टीचर्स वेबसाइट के लिए गोपनीयता नीति।',
  'Politika zasebnosti za spletno mesto Infinity Role Teachers.',
  true,
  11
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_de = EXCLUDED.title_de,
  title_it = EXCLUDED.title_it,
  title_fr = EXCLUDED.title_fr,
  title_hi = EXCLUDED.title_hi,
  title_si = EXCLUDED.title_si,
  content_en = EXCLUDED.content_en,
  content_de = EXCLUDED.content_de,
  content_it = EXCLUDED.content_it,
  content_fr = EXCLUDED.content_fr,
  content_hi = EXCLUDED.content_hi,
  content_si = EXCLUDED.content_si,
  meta_description_en = EXCLUDED.meta_description_en,
  meta_description_de = EXCLUDED.meta_description_de,
  meta_description_it = EXCLUDED.meta_description_it,
  meta_description_fr = EXCLUDED.meta_description_fr,
  meta_description_hi = EXCLUDED.meta_description_hi,
  meta_description_si = EXCLUDED.meta_description_si,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
