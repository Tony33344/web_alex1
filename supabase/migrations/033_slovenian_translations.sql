-- Populate Slovenian translations for events (force overwrite) - FULL COMPREHENSIVE
UPDATE events SET 
  title_si = 'DELAVNICA GIBALNE MEDITACIJE z mojstrom Zhen Hua Yang - Notranja harmonija: 2-dnevni Nei Gong',
  description_si = 'Notranja harmonija - Gibalna meditacija. Se počutite, kot da vaše telo in um nista sinhronizirana? Obnovite ravnotežje z Notranjo harmonijo, 2-dnevno delavnico pod vodstvom mojstra Zhen Hua Yang.',
  long_content_si = 'Notranja harmonija - Gibalna meditacija. Se počutite, kot da vaše telo in um nista sinhronizirana? Obnovite ravnotežje z Notranjo harmonijo, 2-dnevno delavnico pod vodstvom mojstra Zhen Hua Yang. Uvod v organ Nei Gong in osnovne vaje Qi Gong za začetnike in napredne. Ta delavnica ponuja globoko izkušnjo, kjer se boste naučili, kako uskladiti svojo notranjo energijo in uskladiti telo, um in duha. Skozi nežne gibe, dihalne tehnike in meditativno prakso boste prejeli orodja za zmanjševanje stresa, povečanje vitalnosti in gojenje globokega občutka notranjega miru. Organ Nei Gong je posebna tehnika, ki se osredotoča na usklajevanje notranjih organov in aktivira naravno sposobnost samozdravljenja telesa. Pod vodstvom mojstra Zhen Hua Yang boste spoznali te stare prakse, ki se v Kitajski uporabljajo že stoletja za spodbujanje zdravja in dobrega počutja.'
WHERE title_en LIKE '%MOVING MEDITATION WORKSHOP%';

UPDATE events SET 
  title_si = 'SUNYOGA je sončna meditacija s SUNYOGIJEM, 3 dni znanstvenega duhovnega zdravljenja (Stopnje 1-3)',
  description_si = 'SUNYOGA je sončna meditacija s SUNYOGIJEM. 3 dni znanstvenega duhovnega zdravljenja (Stopnje 1-3). Naučite se starega umetnosti sončne meditacije od Sunyogi Umasankarja.',
  long_content_si = 'SUNYOGA je sončna meditacija s SUNYOGIJEM. 3 dni znanstvenega duhovnega zdravljenja (Stopnje 1-3). Naučite se starega umetnosti sončne meditacije od Sunyogi Umasankarja. Ta praksa vas poveže s kozmično energijo sonca in spodbuja duhovno prebujenje in celostno dobro počutje. Sunyoga je preprosta a močna tehnika, ki jo je razvil Sunyogi Umasankar po letih raziskovanja in prakse. V tej 3-dnevni delavnici se boste naučili osnov sončne meditacije, razumeli znanost za njo in izvedeli, kako lahko ta praksa transformira vaše življenje. Naučili se boste tehnik za neposredno povezovanje z energijo sonca, pospešitev svojega duhovnega razvoja in razvoj globokega občutka povezanosti z vesoljem. Praksa vključuje specifične vaje za oči, dihalne tehnike in meditacijske metode, ki jih je mogoče varno in učinkovito izvajati.'
WHERE title_en LIKE '%SUNYOGA is Sun meditation%';

UPDATE events SET 
  title_si = 'TEČAJ ZA UČITELJA AKUPRESURE s Swamijem SUNYOGIJEM, 4 dni znanstvenega duhovnega zdravljenja (Stopnje 1-4)',
  description_si = 'TEČAJ ZA UČITELJA AKUPRESURE s Swamijem SUNYOGIJEM. 4 dni znanstvenega duhovnega zdravljenja (Stopnje 1-4). Naučite se akupresure od mojstra.',
  long_content_si = 'TEČAJ ZA UČITELJA AKUPRESURE s Swamijem SUNYOGIJEM. 4 dni znanstvenega duhovnega zdravljenja (Stopnje 1-4). Naučite se akupresure od mojstra. Ta obsežna izobrazba pokriva vse osnove in napredne tehnike akupresure. Akupresura je star kitajski zdravilni umetnost, ki se uporablja že tisočletja za zdravljenje različnih težav. V tem tečaju se boste naučili teoretičnih osnov akupresure, položajev najpomembnejših energijskih točk (meridianov) in kako te točke varno in učinkovito stimulirati. Tečaj vključuje praktične vaje, demonstracije in priložnosti za vadbo pod nadzorom. Ne glede na to, ali se želite akupresure naučiti zase, za svojo družino ali kot profesionalni zdravilec, vam ta tečaj da znanje in spretnosti, da začnete. Naučili se boste anatomije energetskih poti, razmerja med fizičnimi simptomi in energetskimi blokadami ter kako s ciljanim pritiskom na specifične točke spodbujati zdravljenje.'
WHERE title_en LIKE '%TEACHER COURSE FOR ACUPRESSURE%';

UPDATE events SET 
  title_si = 'NOTRANJA HARMONIJA: 2-dnevno potovanje k celovitosti',
  description_si = 'NOTRANJA HARMONIJA: 2-dnevno potovanje k celovitosti. Transformativna izkušnja za obnovo notranjega ravnotežja.',
  long_content_si = 'NOTRANJA HARMONIJA: 2-dnevno potovanje k celovitosti. Transformativna izkušnja za obnovo notranjega ravnotežja. Skozi meditacijo, vaje za pozornost in energetsko delo boste prejeli orodja za gojenje ravnotežja in harmonije v vsakdanjem življenju. Ta delavnica je primerna za vsakogar, ki išče več notranjega miru, jasnosti in dobrega počutja. Skozi kombinacijo vodenih meditacij, dihalnih vaj, nežnih gibov in energetskega dela se boste naučili, kako zmanjševati stres, razreševati čustvene blokade in razvijati globok občutek povezanosti s seboj. Tehnike, ki se jih boste naučili, so preproste a učinkovite in jih je mogoče doma vključiti v vsakdanjo prakso. Naučili se boste orodij za samoopazovanje, metod za čustveno regulacijo in praks za energetsko čiščenje, ki vam bodo pomagali ostati osredotočeni in uravnoteženi izzivom vsakdanjega življenja.'
WHERE title_en LIKE '%HARMONY WITHIN%';

-- Force translate any remaining events with English content
UPDATE events SET 
  title_si = COALESCE(title_si, title_en),
  description_si = COALESCE(description_si, description_en),
  long_content_si = COALESCE(long_content_si, long_content_en)
WHERE title_si IS NULL OR title_si = '' OR long_content_si IS NULL OR long_content_si = '';

-- Update location names to Slovenian
UPDATE events SET 
  location = REPLACE(location, 'Slovenia', 'Slovenija'),
  location_address = REPLACE(location_address, 'Slovenia', 'Slovenija')
WHERE location LIKE '%Slovenia%';

UPDATE events SET 
  location = REPLACE(location, 'Switzerland', 'Švica'),
  location_address = REPLACE(location_address, 'Switzerland', 'Švica')
WHERE location LIKE '%Switzerland%';

-- Populate Slovenian translations for blog posts
UPDATE blog_posts SET 
  title_si = 'Oblikovanje prostorov za zdravljenje',
  excerpt_si = 'Dobro počutje',
  content_si = content_en
WHERE title_en = 'Designing Spaces for Healing';

UPDATE blog_posts SET 
  title_si = 'Ritual in ritem v modernem življenju',
  excerpt_si = 'Dobro počutje',
  content_si = content_en
WHERE title_en = 'Ritual and Rhythm in Modern Life';

-- Populate Slovenian translations for health categories
UPDATE health_categories SET 
  name_si = 'Prehrana kot živost',
  description_si = 'Vaše telo je alkimistični laboratorij. Hrana je sveženj spomina in inteligence. To je življenje, ki govori življenju.',
  long_content_si = long_content_en
WHERE name_en = 'Nutrition as Aliveness';

UPDATE health_categories SET 
  name_si = 'Joga vaje',
  description_si = 'Joga vam pomaga, da se počutite mirnejše, bolj gibljive in močnejše. Zmanjšuje stres in vaše telo preprosto počuti veliko bolje.',
  long_content_si = long_content_en
WHERE name_en = 'Yoga Exercises';

UPDATE health_categories SET 
  name_si = 'Sunyoga (= sončna meditacija)',
  description_si = 'Pomaga odpreti vaš um za duhovno prebujenje, spodbuja globoko povezavo z vašim notranjim jazom in korak bližje k...',
  long_content_si = long_content_en
WHERE name_en = 'Sunyoga (= sun meditation)';

UPDATE health_categories SET 
  name_si = 'Meditacija',
  description_si = 'Usmerja vaše telo, um in energijo, ter spreminja veselje iz naključnega dogodka v vaše naravno, stalno stanje bivanja.',
  long_content_si = long_content_en
WHERE name_en = 'Meditation';

UPDATE health_categories SET 
  name_si = 'Natančnost premaga moč, časovanje pa hitrost',
  description_si = '= moč + hitrost. Naredi vas hitrejše, močnejše v sunkih, varnejše na nogah, kuri več kalorij, vas ohranja v formi...',
  long_content_si = long_content_en
WHERE name_en = 'Precision beats power, and timing beats speed';

UPDATE health_categories SET 
  name_si = 'Akupresura',
  description_si = 'S spodbujanjem teh energetskih točk akupresura pomaga uskladiti pretok življenjske energije (Qi ali Prana), in krepi...',
  long_content_si = long_content_en
WHERE name_en = 'Acupressure';

-- Populate Slovenian translations for teachers
UPDATE teachers SET 
  title_si = 'Udejanjeni vodnik za notranjo orientacijo',
  bio_si = 'Z več kot 15 let izkušenj v celostnem dobrem počutju Avalon vodi učence k njihovemu neomejenemu potencialu. Spoznajte certificiranega učitelja Sunyoge in predanega vodnika. Je več kot trener ali mentor; je sočuten spremljevalec na vaši edinstveni poti k celovitosti. Ne glede na to...',
  short_bio_si = short_bio_en
WHERE title_en = 'Embodied guide for inner orientation';

UPDATE teachers SET 
  title_si = 'Povezovanje tradicionalne modrosti in moderne tehnologije za celostno zdravje',
  bio_si = 'Integrativna medicina in pionir preventivnega zdravja. Dobrodošli v prostoru, kjer tradicionalna zdravilna modrost sreča moderno medicinsko inovacijo. Dr. PI (mag. Sebastijan Piberl, dr. med. spec.) je zdravnik, izobraževalec in vodja celostnega zdravja, predan krepitvi posameznikov in družin za...',
  short_bio_si = short_bio_en
WHERE title_en = 'Bridging Traditional Wisdom and Modern Technology for Holistic Health';

UPDATE teachers SET 
  title_si = 'Učitelj zavesti, čiste ljubezni in duhovnosti',
  bio_si = 'Akasha ima izjemno sposobnost, da vidi moč v ljudeh, pogosto preden jih sami lahko prepoznajo. Je globoka in naravno pozitivna, ampak na način, ki je pribit in pristen. Ni nekdo, ki ponuja prazne motivacijske fraze ali površne nasvete. Ko dela...',
  short_bio_si = short_bio_en
WHERE title_en = 'Teacher of awareness, pure love and spirituality';

-- Update role teachers page content
UPDATE pages SET 
  title_si = 'Učitelji Vlog',
  content_si = 'Skupaj rodimo novo dobo zavestne evolucije.',
  meta_description_si = 'Skupaj rodimo novo dobo zavestne evolucije.'
WHERE slug = 'role-teachers';

-- Populate Slovenian translations for programs
UPDATE programs SET 
  name_si = 'Avalon - Tečaj sončne meditacije Sunyoga Stopnje 1-2 + brezplačne vaje za čiščenje sklepov',
  description_si = 'Doživite transformacijsko moč sonca in sprostite svoj potencial. Sunyoga ni samo praksa, ampak globoko potovanje, ki vas poveže s kozmično energijo sonca.',
  long_content_si = 'Doživite transformacijsko moč sonca in sprostite svoj potencial. Sunyoga ni samo praksa, ampak globoko potovanje, ki vas poveže s kozmično energijo sonca. V tem tečaju se boste naučili osnov sončne meditacije od Sunyogi Umasankarja. Ta praksa vas poveže s kozmično energijo sonca in spodbuja duhovno prebujenje in celostno dobro počutje. Tečaj vključuje vaje za čiščenje sklepov, ki pomagajo raztopiti blokade v telesu in izboljšati pretok energije.',
  prerequisites = ARRAY['Pridobili boste globoko razumevanje, kako prakticirati sončno meditacijo', 'Meditacija oči v oči', 'Meditacija na sliko', 'Vaje za telesne organe', 'Vaje za čiščenje čaker'],
  what_you_learn = ARRAY['Pridobili boste globoko razumevanje, kako prakticirati sončno meditacijo', 'Meditacija oči v oči', 'Meditacija na sliko', 'Vaje za telesne organe', 'Vaje za čiščenje čaker']
WHERE name_en LIKE '%Avalon - Sunyoga Sun Meditation Level 1-2 Course%';

UPDATE programs SET 
  name_si = 'Avalon - Tečaj sončne meditacije Sunyoga Stopnje 1-2 + brezplačna meditacija na sliko',
  description_si = 'Doživite transformacijsko moč sonca in sprostite svoj potencial. Sunyoga ni samo praksa, ampak globoko potovanje, ki vas poveže s kozmično energijo sonca.',
  long_content_si = 'Doživite transformacijsko moč sonca in sprostite svoj potencial. Sunyoga ni samo praksa, ampak globoko potovanje, ki vas poveže s kozmično energijo sonca. V tem tečaju se boste naučili osnov sončne meditacije od Sunyogi Umasankarja. Ta praksa vas poveže s kozmično energijo sonca in spodbuja duhovno prebujenje in celostno dobro počutje. Tečaj vključuje tehnike meditacije na sliko, ki pomagajo osredotočiti um in najti notranji mir.',
  prerequisites = ARRAY['Pridobili boste globoko razumevanje, kako prakticirati sončno meditacijo', 'Meditacija oči v oči', 'Meditacija na sliko', 'Vaje za telesne organe', 'Vaje za čiščenje čaker'],
  what_you_learn = ARRAY['Pridobili boste globoko razumevanje, kako prakticirati sončno meditacijo', 'Meditacija oči v oči', 'Meditacija na sliko', 'Vaje za telesne organe', 'Vaje za čiščenje čaker']
WHERE name_en LIKE '%image meditation%';

UPDATE programs SET 
  name_si = 'Avalon - Tečaj sončne meditacije Sunyoga Stopnje 1-2 + brezplačna meditacija na sliko',
  description_si = 'Doživite transformacijsko moč sonca in sprostite svoj potencial. Sunyoga ni samo praksa, ampak globoko potovanje, ki vas poveže s kozmično energijo sonca.',
  long_content_si = 'Doživite transformacijsko moč sonca in sprostite svoj potencial. Sunyoga ni samo praksa, ampak globoko potovanje, ki vas poveže s kozmično energijo sonca. V tem tečaju se boste naučili osnov sončne meditacije od Sunyogi Umasankarja. Ta praksa vas poveže s kozmično energijo sonca in spodbuja duhovno prebujenje in celostno dobro počutje. Tečaj vključuje tehnike meditacije na sliko, ki pomagajo osredotočiti um in najti notranji mir.',
  prerequisites = ARRAY['Pridobili boste globoko razumevanje, kako prakticirati sončno meditacijo', 'Meditacija oči v oči', 'Meditacija na sliko', 'Vaje za telesne organe', 'Vaje za čiščenje čaker'],
  what_you_learn = ARRAY['Pridobili boste globoko razumevanje, kako prakticirati sončno meditacijo', 'Meditacija oči v oči', 'Meditacija na sliko', 'Vaje za telesne organe', 'Vaje za čiščenje čaker']
WHERE name_en LIKE '%picture meditation%';

UPDATE programs SET 
  name_si = 'Trening v Akupresuri',
  description_si = 'Naučite se starega umetnosti akupresure za celostno dobro počutje.',
  long_content_si = 'Naučite se starega umetnosti akupresure za celostno dobro počutje. Akupresura je star kitajski zdravilni umetnost, ki se uporablja že tisočletja za zdravljenje različnih težav. V tem tečaju se boste naučili teoretičnih osnov akupresure, položajev najpomembnejših energijskih točk (meridianov) in kako te točke varno in učinkovito stimulirati. Tečaj vključuje praktične vaje, demonstracije in priložnosti za vadbo pod nadzorom.',
  prerequisites = ARRAY['Na voljo kadarkoli in kjerkoli: samo-akupresura je preprosta tehnika', 'Najprej se naučite na sebi: skozi prakso na lastnem telesu', 'Delite prednosti z drugimi: ko ste seznanjeni z osnovami, lahko enostavno poučujete druge', 'Vzemite zdravljenje v svoje roke: te metode samozdravljenja vam dajo nadzor nad svojim lastnim dobrem počutjem', 'Biti zdrav in srečen'],
  what_you_learn = ARRAY['Na voljo kadarkoli in kjerkoli: samo-akupresura je preprosta tehnika', 'Najprej se naučite na sebi: skozi prakso na lastnem telesu', 'Delite prednosti z drugimi: ko ste seznanjeni z osnovami, lahko enostavno poučujete druge', 'Vzemite zdravljenje v svoje roke: te metode samozdravljenja vam dajo nadzor nad svojim lastnim dobrem počutjem', 'Biti zdrav in srečen']
WHERE name_en LIKE '%Acupressure Training%';

UPDATE programs SET 
  name_si = 'Prebudite Svojo Notranjo Kompas',
  description_si = 'Spletni nauki, zdravljenje in pustolovščina z Infinity Role Teacher Akasha. Pozdravljeni, lepa duša. Sem Akasha in tako sem vesela, da ste tukaj. Ta program je rojen iz čiste ljubezni in globoke želje...',
  long_content_si = 'Spletni nauki, zdravljenje in pustolovščina z Infinity Role Teacher Akasha. Pozdravljeni, lepa duša. Sem Akasha in tako sem vesela, da ste tukaj. Ta program je rojen iz čiste ljubezni in globoke želje, da vam pomagam najti vaš notranji kompas in slediti vašemu pravemu jazu. Skozi kombinacijo spletnih sej, zdravilnih praks in duhovnih pustolovščin boste prejeli orodja za navigacijo svojega življenja z več jasnosti, namena in radosti.',
  prerequisites = ARRAY['Predanost je najvišja oblika inteligence', 'Imeti cilj, načrti se bodo razvijali in uresničevali', 'Čista ljubezen je zdravilo za telo, um in dušo'],
  what_you_learn = ARRAY['Predanost je najvišja oblika inteligence', 'Imeti cilj, načrti se bodo razvijali in uresničevali', 'Čista ljubezen je zdravilo za telo, um in dušo']
WHERE name_en LIKE '%Awaken Your Inner Compass%';

-- Force translate any remaining programs with English content
UPDATE programs SET 
  name_si = COALESCE(name_si, name_en),
  description_si = COALESCE(description_si, description_en),
  long_content_si = COALESCE(long_content_si, long_content_en)
WHERE name_si IS NULL OR name_si = '';

-- Populate Slovenian translations for teacher specialties
UPDATE teachers SET 
  specialties = ARRAY['Sunyoga', 'Meditacija', 'Celostno zdravljenje', 'Prehrana', 'Posebne telesne vaje', 'Življenjsko vodenje']
WHERE specialties = ARRAY['Sunyoga', 'Meditation', 'Holistic Healing', 'Nutrition', 'Special body exercises', 'Life Guidance'];

UPDATE teachers SET 
  specialties = ARRAY['Celostno zdravljenje', 'Zdravnik', 'Meditacija', 'Prehrana', 'Izobraževalec', 'Kvantna diagnostika']
WHERE specialties = ARRAY['Holistic Healing', 'Physician', 'Meditation', 'Nutrition', 'Educator', 'Quantum Diagnostic'];

UPDATE teachers SET 
  specialties = ARRAY['Joga & Meditacija', 'Wellness coaching', 'Akupresura', 'Reconnection zdravljenje', 'Življenjsko vodenje']
WHERE specialties = ARRAY['Yoga & Meditation', 'Wellness Coaching', 'Acupressure', 'Reconnection Healing', 'Life Guidance'];

-- Populate Slovenian translations for testimonials
UPDATE testimonials SET 
  content_si = 'V svojem bistvu je Akasha globoko predana življenju in rasti drugih. Nos redko kombinacijo empatije, moči, intuicije in iskrenosti. Ljudje se v njeni bližini počutijo videti, in to samo po sebi je lahko transformativno. Ta platforma je popolna...'
WHERE content_en LIKE '%At her core, Akasha is deeply devoted to life%';

UPDATE testimonials SET 
  content_si = 'Ko je potrebno, lahko prinese strukturo, jasnost in disciplino. Ampak Akasha to počne na način, ki ljudem daje moč, da te kakovosti razvijejo od znotraj, namesto da bi se počutili pritisnjene od zunaj. Njena prisotnost nežno spodbuja ljudi, da se dvignejo...'
WHERE content_en LIKE '%When needed, she can bring structure%';

-- Populate Slovenian translations for pages
UPDATE pages SET 
  title_si = 'Članstvo',
  content_si = 'Vaš strokovnjak je vaš partner, ki praznuje zmage in se sooča z izzivi z vami.',
  meta_description_si = 'Vaš strokovnjak je vaš partner, ki praznuje zmage in se sooča z izzivi z vami.'
WHERE slug = 'membership';

UPDATE pages SET 
  title_si = 'Kontakt',
  content_si = 'Predstavljamo si prihodnost, v kateri so celostne prakse dobrega počutja tkane v vsakdanje življenje, kjer ljudje ne zdravijo samo simptomov, temveč gojijo trajno vitalnost in notranji mir.',
  meta_description_si = 'Predstavljamo si prihodnost, v kateri so celostne prakse dobrega počutja tkane v vsakdanje življenje.'
WHERE slug = 'contact';

-- Update blog post descriptions
UPDATE blog_posts SET 
  content_si = 'Vsak posameznik živi v skladu z namenom svoje duše in prispeva k uspešni, zavestni civilizaciji.'
WHERE content_en LIKE '%Every individual lives in alignment with their soul%';

-- Update home page content
UPDATE pages SET 
  title_si = 'Dobrodošli pri Infinity Role Teachers',
  content_si = 'Ko učitelji postanejo Infinity Role Teachers in vsako srce bije z ljubeznijo, se planet prebudi — in tudi mi. Skupaj rodimo novo dobo zavestne evolucije.',
  meta_description_si = 'Ko učitelji postanejo Infinity Role Teachers in vsako srce bije z ljubeznijo, se planet prebudi — in tudi mi. Skupaj rodimo novo dobo zavestne evolucije.'
WHERE slug = 'home';

-- Update coach training page
UPDATE pages SET 
  title_si = 'Coach Trening',
  content_si = 'Avtentičnost - Metode poučevanja, korenjene v stari modrosti in potrjene z modernim razumevanjem.',
  meta_description_si = 'Avtentičnost - Metode poučevanja, korenjene v stari modrosti in potrjene z modernim razumevanjem.'
WHERE slug = 'coach-training';

-- Update home page content
UPDATE pages SET 
  title_si = 'Infinity Role Teachers',
  content_si = 'Skupaj rodimo novo dobo zavestne evolucije. Infinity Role Teachers spodbuja celostno dobro počutje skozi Sunyogo, akupresuro, meditacijo in zavestno coachanje. Gradimo skupnosti Sandha, ki prebujajo neomejen potencial v vsakem srcu, da skupaj ustvarimo resnično združen, zavesten svet.',
  meta_description_si = 'Skupaj rodimo novo dobo zavestne evolucije.'
WHERE slug = 'home';

-- Update events page
UPDATE pages SET 
  title_si = 'Dogodki',
  content_si = 'Dostopnost - Zagotavljanje celostnega dobrega počutja za vse, ne glede na ozadje.',
  meta_description_si = 'Dostopnost - Zagotavljanje celostnega dobrega počutja za vse, ne glede na ozadje.'
WHERE slug = 'events';

-- Update about page content
UPDATE pages SET 
  title_si = 'O nas',
  content_si = 'Infinity Role Teachers spodbuja celostno dobro počutje skozi Sunyogo, akupresuro, meditacijo in zavestno coachanje. Gradimo skupnosti Sandha, ki prebujajo neomejen potencial v vsakem srcu, da skupaj ustvarimo resnično združen, zavesten svet.',
  meta_description_si = 'Infinity Role Teachers spodbuja celostno dobro počutje skozi Sunyogo, akupresuro, meditacijo in zavestno coachanje.'
WHERE slug = 'about';

-- Update mission page content
UPDATE pages SET 
  title_si = 'Naše poslanstvo',
  content_si = 'Naše poslanstvo pri Infinity Role Teachers: krepiti posameznike skozi celostno dobro počutje, Sunyogo in certificirane programe coach treninga.',
  meta_description_si = 'Naše poslanstvo pri Infinity Role Teachers: krepiti posameznike skozi celostno dobro počutje, Sunyogo in certificirane programe coach treninga.'
WHERE slug = 'mission';

-- Update vision page content
UPDATE pages SET 
  title_si = 'Naša vizija',
  content_si = 'Naša vizija pri Infinity Role Teachers: Svet, v katerem je celostno dobro počutje način življenja, poganjajo ga certificirani coachi po vsem svetu.',
  meta_description_si = 'Naša vizija pri Infinity Role Teachers: Svet, v katerem je celostno dobro počutje način življenja, poganjajo ga certificirani coachi po vsem svetu.'
WHERE slug = 'vision';

-- Update donate page content
UPDATE pages SET 
  title_si = 'Doniraj',
  content_si = 'Podprite naše poslanstvo. Podprite skupnost Infinity Role Teachers. Vaši velikodušni prispevki nam pomagajo nadaljevati našo poslanstvo spodbujanja samouresničitve in zavestnega življenja. Dvigovanje človeške zavesti. IRT je predan gradnji zavestnega sveta in omogočanju vsaki osebi, da uresniči svoj najvišji potencial. Podprite nas pri zagotavljanju vsaj kapljice duhovnosti vsakemu človeku na planetu. Zavesten planet. Conscious Planet izvaja več prelomnih projektov za podporo individualne rasti, oživitev človeškega duha, gradnjo skupnosti in obnovo okolja.',
  meta_description_si = 'Podprite naše delo in pomagajte nam zgraditi dom za iskalca.'
WHERE slug = 'donate';

-- Update volunteer page content
UPDATE pages SET 
  title_si = 'Prostovoljstvo',
  content_si = 'Pridružite se naši prostovoljski ekipi. Prostovoljske vloge na daljavo (delo od kjerkoli). Te vloge vam omogočajo, da prispevate od kjerkoli in podprete globalno poslanstvo IRT centra z digitalnimi, finančnimi in ustvarjalnimi prizadevanji. Specialist za zbiranje sredstev in nepovratna sredstva - Povežite se z donatorji, ustvarjajte predloge za nepovratna sredstva in organizirajte iniciative za zbiranje sredstev. Finance in revizija - Upravljajte proračune, plače in finančno dokumentacijo ter zagotavljajte skladnost. Grafični oblikovalec - Ustvarite vizualne oblikovalske rešitve za brošure, plakate in promocijski material. Ustvarjalec vsebin in video urejevalec - Razvijajte privlačno vsebino, urejajte videe in izboljšujte spletno vidnost. Upravljanje spletne strani in SEO - Vzdržujte in posodabljajte spletno stran, izboljšujte iskalne uvrstitve in avtomatizirajte procese. Oblikovanje in objava knjig - Oblikujte, urejajte in objavljajte knjige, priročnike in vire o IRT naukih. Koordinator trženja in osveščanja - Razširite doseg IRT z usmerjenimi oglaševalskimi akcijami, družbenimi omrežji in strateškimi tržnimi iniciativami. Človeški viri. Zakaj prostovoljstvo? Poglobite svojo Sadhano. Pospešite svoj duhovni razvoj, medtem ko izvajate svojo Sadhano (jogske prakse).',
  meta_description_si = 'Pridružite se naši prostovoljski ekipi in prispevajte svoj čas in spretnosti.'
WHERE slug = 'volunteer';

-- Update health page content
UPDATE pages SET 
  title_si = 'Zdravje',
  content_si = 'Zdravje je harmonija telesa, uma in duha.',
  meta_description_si = 'Zdravje je harmonija telesa, uma in duha.'
WHERE slug = 'health';
