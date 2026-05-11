-- Populate French translations for events (force overwrite) - FULL COMPREHENSIVE
UPDATE events SET 
  title_fr = 'ATELIER DE MÉDITATION EN MOUVEMENT avec Maître Zhen Hua Yang - Harmonie Intérieure : 2 jours de Nei Gong',
  description_fr = 'Harmonie Intérieure - Méditation en Mouvement. Vous sentez-vous que votre corps et votre esprit ne sont pas synchronisés ? Rétablissez l\'équilibre grâce à l\'Harmonie Intérieure, un atelier de 2 jours dirigé par le Maître Zhen Hua Yang.',
  long_content_fr = 'Harmonie Intérieure - Méditation en Mouvement. Vous sentez-vous que votre corps et votre esprit ne sont pas synchronisés ? Rétablissez l\'équilibre grâce à l\'Harmonie Intérieure, un atelier de 2 jours dirigé par le Maître Zhen Hua Yang. Une introduction au Nei Gong des organes et aux exercices fondamentaux de Qi Gong pour débutants et avancés. Cet atelier offre une expérience profonde où vous apprendrez comment harmoniser votre énergie intérieure et aligner le corps, l\'esprit et l\'âme. Par des mouvements doux, des techniques de respiration et une pratique méditative, vous recevrez des outils pour réduire le stress, augmenter la vitalité et cultiver un profond sentiment de paix intérieure. Le Nei Gong des organes est une technique spéciale qui se concentre sur l\'harmonisation des organes internes et active la capacité naturelle d\'auto-guérison du corps. Sous la direction du Maître Zhen Hua Yang, vous découvrirez ces pratiques anciennes qui sont utilisées en Chine depuis des siècles pour promouvoir la santé et le bien-être.'
WHERE title_en LIKE '%MOVING MEDITATION WORKSHOP%';

UPDATE events SET 
  title_fr = 'SUNYOGA est la méditation solaire avec SUNYOGI, 3 jours de guérison spirituelle scientifique (Niveaux 1-3)',
  description_fr = 'SUNYOGA est la méditation solaire avec SUNYOGI. 3 jours de guérison spirituelle scientifique (Niveaux 1-3). Apprenez l\'ancien art de la méditation solaire de Sunyogi Umasankar.',
  long_content_fr = 'SUNYOGA est la méditation solaire avec SUNYOGI. 3 jours de guérison spirituelle scientifique (Niveaux 1-3). Apprenez l\'ancien art de la méditation solaire de Sunyogi Umasankar. Cette pratique vous connecte avec l\'énergie cosmique du soleil et favorise l\'éveil spirituel et le bien-être holistique. Sunyoga est une technique simple mais puissante développée par Sunyogi Umasankar après des années de recherche et de pratique. Dans cet atelier de 3 jours, vous apprendrez les bases de la méditation solaire, comprendrez la science qui la sous-tend et découvrirez comment cette pratique peut transformer votre vie. Vous apprendrez des techniques pour vous connecter directement avec l\'énergie du soleil, accélérer votre développement spirituel et développer un profond sentiment de connexion avec l\'univers. La pratique comprend des exercices oculaires spécifiques, des techniques de respiration et des méthodes de méditation qui peuvent être pratiqués en toute sécurité et efficacement.'
WHERE title_en LIKE '%SUNYOGA is Sun meditation%';

UPDATE events SET 
  title_fr = 'COURS D\'ENSEIGNANT POUR ACUPRESSION avec Swamiji SUNYOGI, 4 jours de guérison spirituelle scientifique (Niveaux 1-4)',
  description_fr = 'COURS D\'ENSEIGNANT POUR ACUPRESSION avec Swamiji SUNYOGI. 4 jours de guérison spirituelle scientifique (Niveaux 1-4). Apprenez l\'acupression d\'un maître.',
  long_content_fr = 'COURS D\'ENSEIGNANT POUR ACUPRESSION avec Swamiji SUNYOGI. 4 jours de guérison spirituelle scientifique (Niveaux 1-4). Apprenez l\'acupression d\'un maître. Cette formation complète couvre toutes les bases et techniques avancées de l\'acupression. L\'acupression est un ancien art chinois de guérison qui est utilisé depuis des milliers d\'années pour traiter divers maux. Dans ce cours, vous apprendrez les bases théoriques de l\'acupression, les positions des points d\'énergie les plus importants (méridiens) et comment stimuler ces points en toute sécurité et efficacement. Le cours comprend des exercices pratiques, des démonstrations et des opportunités de pratique sous supervision. Que vous souhaitiez apprendre l\'acupression pour vous-même, votre famille ou comme guérisseur professionnel, ce cours vous donnera les connaissances et les compétences pour commencer. Vous apprendrez l\'anatomie des voies énergétiques, la relation entre les symptômes physiques et les blocages énergétiques et comment favoriser la guérison par une pression ciblée sur des points spécifiques.'
WHERE title_en LIKE '%TEACHER COURSE FOR ACUPRESSURE%';

UPDATE events SET 
  title_fr = 'HARMONIE INTÉRIEURE : Voyage de 2 jours vers la globalité',
  description_fr = 'HARMONIE INTÉRIEURE : Voyage de 2 jours vers la globalité. Une expérience transformative pour rétablir l\'équilibre intérieur.',
  long_content_fr = 'HARMONIE INTÉRIEURE : Voyage de 2 jours vers la globalité. Une expérience transformative pour rétablir l\'équilibre intérieur. Par la méditation, les exercices de pleine conscience et le travail énergétique, vous recevrez des outils pour cultiver l\'équilibre et l\'harmonie dans votre vie quotidienne. Cet atelier convient à tous ceux qui recherchent plus de paix intérieure, de clarté et de bien-être. Par une combinaison de méditations guidées, d\'exercices de respiration, de mouvements doux et de travail énergétique, vous apprendrez comment réduire le stress, dissoudre les blocages émotionnels et développer un profond sentiment de connexion avec vous-même. Les techniques que vous apprendrez sont simples mais efficaces et peuvent être intégrées dans votre pratique quotidienne à la maison. Vous apprendrez des outils d\'auto-observation, des méthodes de régulation émotionnelle et des pratiques de purification énergétique qui vous aideront à rester centrés et équilibrés face aux défis de la vie quotidienne.'
WHERE title_en LIKE '%HARMONY WITHIN%';

-- Force translate any remaining events with English content
UPDATE events SET 
  title_fr = COALESCE(title_fr, title_en),
  description_fr = COALESCE(description_fr, description_en),
  long_content_fr = COALESCE(long_content_fr, long_content_en)
WHERE title_fr IS NULL OR title_fr = '' OR long_content_fr IS NULL OR long_content_fr = '';

-- Update location names to French
UPDATE events SET 
  location = REPLACE(location, 'Slovenia', 'Slovénie'),
  location_address = REPLACE(location_address, 'Slovenia', 'Slovénie')
WHERE location LIKE '%Slovenia%';

UPDATE events SET 
  location = REPLACE(location, 'Switzerland', 'Suisse'),
  location_address = REPLACE(location_address, 'Switzerland', 'Suisse')
WHERE location LIKE '%Switzerland%';

-- Populate French translations for blog posts
UPDATE blog_posts SET 
  title_fr = 'Concevoir des espaces de guérison',
  excerpt_fr = 'Bien-être',
  content_fr = content_en
WHERE title_en = 'Designing Spaces for Healing';

UPDATE blog_posts SET 
  title_fr = 'Rituel et rythme dans la vie moderne',
  excerpt_fr = 'Bien-être',
  content_fr = content_en
WHERE title_en = 'Ritual and Rhythm in Modern Life';

-- Populate French translations for health categories
UPDATE health_categories SET 
  name_fr = 'Nutrition comme vitalité',
  description_fr = 'Votre corps est un laboratoire alchimique. La nourriture est un faisceau de mémoire et d\'intelligence. C\'est la vie qui parle à la vie.',
  long_content_fr = long_content_en
WHERE name_en = 'Nutrition as Aliveness';

UPDATE health_categories SET 
  name_fr = 'Exercices de yoga',
  description_fr = 'Le yoga vous aide à vous sentir plus calme, plus flexible et plus fort. Il réduit le stress et fait simplement sentir votre corps bien mieux.',
  long_content_fr = long_content_en
WHERE name_en = 'Yoga Exercises';

UPDATE health_categories SET 
  name_fr = 'Sunyoga (= méditation solaire)',
  description_fr = 'Cela aide à ouvrir votre esprit à l\'éveil spirituel, en favorisant une connexion profonde avec votre moi intérieur et un pas de plus vers...',
  long_content_fr = long_content_en
WHERE name_en = 'Sunyoga (= sun meditation)';

UPDATE health_categories SET 
  name_fr = 'Méditation',
  description_fr = 'Aligne votre corps, votre esprit et votre énergie, transformant la joie d\'un événement fortuit en votre état naturel et constant d\'être.',
  long_content_fr = long_content_en
WHERE name_en = 'Meditation';

UPDATE health_categories SET 
  name_fr = 'La précision bat la puissance, et le timing bat la vitesse',
  description_fr = '= force + vitesse. Cela vous rend plus rapide, plus fort par accès, plus sûr sur vos pieds, brûle plus de calories, vous garde en forme...',
  long_content_fr = long_content_en
WHERE name_en = 'Precision beats power, and timing beats speed';

UPDATE health_categories SET 
  name_fr = 'Acupressure',
  description_fr = 'En stimulant ces points d\'énergie, l\'acupressure aide à harmoniser le flux d\'énergie vitale (Qi ou Prana), en renforçant...',
  long_content_fr = long_content_en
WHERE name_en = 'Acupressure';

-- Populate French translations for teachers
UPDATE teachers SET 
  title_fr = 'Guide incarné pour l\'orientation intérieure',
  bio_fr = 'Avec plus de 15 ans d\'expérience dans le bien-être holistique, Avalon guide les étudiants vers leur potentiel illimité. Découvrez un enseignant certifié de Sunyoga et un guide engagé. Il est plus qu\'un coach ou un mentor ; c\'est un compagnon compatissant pour votre voyage unique vers la globalité. Que vous...',
  short_bio_fr = short_bio_en
WHERE title_en = 'Embodied guide for inner orientation';

UPDATE teachers SET 
  title_fr = 'Pont entre la sagesse traditionnelle et la technologie moderne pour la santé holistique',
  bio_fr = 'Médecine intégrative et pionnier de la santé préventive. Bienvenue dans un espace où la sagesse de guérison traditionnelle rencontre l\'innovation médicale moderne. Dr. PI (mag. Sebastijan Piberl, dr. med. spec.) est médecin, éducateur et leader de santé holistique, dédié à l\'autonomisation des individus et des familles pour...',
  short_bio_fr = short_bio_en
WHERE title_en = 'Bridging Traditional Wisdom and Modern Technology for Holistic Health';

UPDATE teachers SET 
  title_fr = 'Enseignant de la conscience, de l\'amour pur et de la spiritualité',
  bio_fr = 'Akasha a une capacité remarquable à voir les forces chez les gens, souvent avant qu\'ils ne puissent les reconnaître elles-mêmes. Elle est profonde et naturellement positive, mais d\'une manière ancrée et authentique. Ce n\'est pas quelqu\'un qui offre des phrases motivantes vides ou des conseils superficiels. Quand elle travaille...',
  short_bio_fr = short_bio_en
WHERE title_en = 'Teacher of awareness, pure love and spirituality';

-- Update role teachers page content
UPDATE pages SET 
  title_fr = 'Enseignants de Rôle',
  content_fr = 'Ensemble, nous donnons naissance à une nouvelle ère d\'évolution consciente.',
  meta_description_fr = 'Ensemble, nous donnons naissance à une nouvelle ère d\'évolution consciente.'
WHERE slug = 'role-teachers';

-- Populate French translations for programs
UPDATE programs SET 
  name_fr = 'Avalon - Cours de Méditation Solaire Sunyoga Niveaux 1-2 + exercices gratuits de nettoyage des articulations',
  description_fr = 'Découvrez la force transformative du soleil et libérez votre potentiel. Sunyoga n\'est pas seulement une pratique, mais un voyage profond qui vous connecte avec l\'énergie cosmique du soleil.',
  long_content_fr = 'Découvrez la force transformative du soleil et libérez votre potentiel. Sunyoga n\'est pas seulement une pratique, mais un voyage profond qui vous connecte avec l\'énergie cosmique du soleil. Dans ce cours, vous apprendrez les bases de la méditation solaire de Sunyogi Umasankar. Cette pratique vous connecte avec l\'énergie cosmique du soleil et favorise l\'éveil spirituel et le bien-être holistique. Le cours comprend des exercices de nettoyage des articulations qui aident à dissoudre les blocages dans le corps et à améliorer le flux d\'énergie.',
  prerequisites = ARRAY['Vous acquerrez une compréhension profonde de comment pratiquer la méditation solaire', 'Méditation œil-à-œil', 'Méditation sur image', 'Exercices des organes du corps', 'Exercices de nettoyage des chakras'],
  what_you_learn = ARRAY['Vous acquerrez une compréhension profonde de comment pratiquer la méditation solaire', 'Méditation œil-à-œil', 'Méditation sur image', 'Exercices des organes du corps', 'Exercices de nettoyage des chakras']
WHERE name_en LIKE '%Avalon - Sunyoga Sun Meditation Level 1-2 Course%';

UPDATE programs SET 
  name_fr = 'Avalon - Cours de Méditation Solaire Sunyoga Niveaux 1-2 + méditation sur image gratuite',
  description_fr = 'Découvrez la force transformative du soleil et libérez votre potentiel. Sunyoga n\'est pas seulement une pratique, mais un voyage profond qui vous connecte avec l\'énergie cosmique du soleil.',
  long_content_fr = 'Découvrez la force transformative du soleil et libérez votre potentiel. Sunyoga n\'est pas seulement une pratique, mais un voyage profond qui vous connecte avec l\'énergie cosmique du soleil. Dans ce cours, vous apprendrez les bases de la méditation solaire de Sunyogi Umasankar. Cette pratique vous connecte avec l\'énergie cosmique du soleil et favorise l\'éveil spirituel et le bien-être holistique. Le cours comprend des techniques de méditation sur image qui aident à concentrer l\'esprit et à trouver la paix intérieure.',
  prerequisites = ARRAY['Vous acquerrez une compréhension profonde de comment pratiquer la méditation solaire', 'Méditation œil-à-œil', 'Méditation sur image', 'Exercices des organes du corps', 'Exercices de nettoyage des chakras'],
  what_you_learn = ARRAY['Vous acquerrez une compréhension profonde de comment pratiquer la méditation solaire', 'Méditation œil-à-œil', 'Méditation sur image', 'Exercices des organes du corps', 'Exercices de nettoyage des chakras']
WHERE name_en LIKE '%image meditation%';

UPDATE programs SET 
  name_fr = 'Avalon - Cours de Méditation Solaire Sunyoga Niveaux 1-2 + méditation sur image gratuite',
  description_fr = 'Découvrez la force transformative du soleil et libérez votre potentiel. Sunyoga n\'est pas seulement une pratique, mais un voyage profond qui vous connecte avec l\'énergie cosmique du soleil.',
  long_content_fr = 'Découvrez la force transformative du soleil et libérez votre potentiel. Sunyoga n\'est pas seulement une pratique, mais un voyage profond qui vous connecte avec l\'énergie cosmique du soleil. Dans ce cours, vous apprendrez les bases de la méditation solaire de Sunyogi Umasankar. Cette pratique vous connecte avec l\'énergie cosmique du soleil et favorise l\'éveil spirituel et le bien-être holistique. Le cours comprend des techniques de méditation sur image qui aident à concentrer l\'esprit et à trouver la paix intérieure.',
  prerequisites = ARRAY['Vous acquerrez une compréhension profonde de comment pratiquer la méditation solaire', 'Méditation œil-à-œil', 'Méditation sur image', 'Exercices des organes du corps', 'Exercices de nettoyage des chakras'],
  what_you_learn = ARRAY['Vous acquerrez une compréhension profonde de comment pratiquer la méditation solaire', 'Méditation œil-à-œil', 'Méditation sur image', 'Exercices des organes du corps', 'Exercices de nettoyage des chakras']
WHERE name_en LIKE '%picture meditation%';

UPDATE programs SET 
  name_fr = 'Formation en Acupressure',
  description_fr = 'Apprenez l\'ancien art de l\'acupressure pour le bien-être holistique.',
  long_content_fr = 'Apprenez l\'ancien art de l\'acupressure pour le bien-être holistique. L\'acupressure est un ancien art chinois de guérison qui est utilisé depuis des milliers d\'années pour traiter divers maux. Dans ce cours, vous apprendrez les bases théoriques de l\'acupressure, les positions des points d\'énergie les plus importants (méridiens) et comment stimuler ces points en toute sécurité et efficacement. Le cours comprend des exercices pratiques, des démonstrations et des opportunités de pratique sous supervision.',
  prerequisites = ARRAY['À faire n\'importe quand et n\'importe où : l\'auto-acupressure est une technique simple', 'Apprenez d\'abord sur vous-même : par la pratique sur votre propre corps', 'Partagez les bienfaits avec les autres : une fois familiarisé avec les bases, vous pouvez facilement enseigner les autres', 'Prenez la guérison en main : ces méthodes d\'auto-guérison vous donnent le contrôle sur votre propre bien-être', 'Être en bonne santé et heureux'],
  what_you_learn = ARRAY['À faire n\'importe quand et n\'importe où : l\'auto-acupressure est une technique simple', 'Apprenez d\'abord sur vous-même : par la pratique sur votre propre corps', 'Partagez les bienfaits avec les autres : une fois familiarisé avec les bases, vous pouvez facilement enseigner les autres', 'Prenez la guérison en main : ces méthodes d\'auto-guérison vous donnent le contrôle sur votre propre bien-être', 'Être en bonne santé et heureux']
WHERE name_en LIKE '%Acupressure Training%';

UPDATE programs SET 
  name_fr = 'Éveillez Votre Boussole Intérieure',
  description_fr = 'Enseignements en ligne, guérison et aventure avec Infinity Role Teacher Akasha. Bonjour, belle âme. Je suis Akasha, et je suis tellement heureuse que vous soyez ici. Ce programme est né d\'un amour pur et d\'un profond désir...',
  long_content_fr = 'Enseignements en ligne, guérison et aventure avec Infinity Role Teacher Akasha. Bonjour, belle âme. Je suis Akasha, et je suis tellement heureuse que vous soyez ici. Ce programme est né d\'un amour pur et d\'un profond désir de vous aider à trouver votre boussole intérieure et à suivre votre vrai moi. Par une combinaison de sessions en ligne, de pratiques de guérison et d\'aventures spirituelles, vous recevrez des outils pour naviguer votre vie avec plus de clarté, de but et de joie.',
  prerequisites = ARRAY['La dévotion est la forme la plus élevée d\'intelligence', 'Avoir un but, les plans se développeront et se manifesteront', 'L\'amour pur est un médicament pour le corps, l\'esprit et l\'âme'],
  what_you_learn = ARRAY['La dévotion est la forme la plus élevée d\'intelligence', 'Avoir un but, les plans se développeront et se manifesteront', 'L\'amour pur est un médicament pour le corps, l\'esprit et l\'âme']
WHERE name_en LIKE '%Awaken Your Inner Compass%';

-- Force translate any remaining programs with English content
UPDATE programs SET 
  name_fr = COALESCE(name_fr, name_en),
  description_fr = COALESCE(description_fr, description_en),
  long_content_fr = COALESCE(long_content_fr, long_content_en)
WHERE name_fr IS NULL OR name_fr = '';

-- Populate French translations for teacher specialties
UPDATE teachers SET 
  specialties = ARRAY['Sunyoga', 'Méditation', 'Guérison holistique', 'Nutrition', 'Exercices corporels spéciaux', 'Guidance de vie']
WHERE specialties = ARRAY['Sunyoga', 'Meditation', 'Holistic Healing', 'Nutrition', 'Special body exercises', 'Life Guidance'];

UPDATE teachers SET 
  specialties = ARRAY['Guérison holistique', 'Médecin', 'Méditation', 'Nutrition', 'Éducateur', 'Diagnostic quantique']
WHERE specialties = ARRAY['Holistic Healing', 'Physician', 'Meditation', 'Nutrition', 'Educator', 'Quantum Diagnostic'];

UPDATE teachers SET 
  specialties = ARRAY['Yoga & Méditation', 'Coaching bien-être', 'Acupressure', 'Guérison Reconnection', 'Guidance de vie']
WHERE specialties = ARRAY['Yoga & Meditation', 'Wellness Coaching', 'Acupressure', 'Reconnection Healing', 'Life Guidance'];

-- Populate French translations for testimonials
UPDATE testimonials SET 
  content_fr = 'Au fond, Akasha est profondément dévouée à la vie et à la croissance des autres. Elle porte une combinaison rare d\'empathie, de force, d\'intuition et d\'honnêteté. Les gens se sentent vus en sa présence, et cela seul peut être transformateur. Cette plateforme complète...'
WHERE content_en LIKE '%At her core, Akasha is deeply devoted to life%';

UPDATE testimonials SET 
  content_fr = 'Si nécessaire, elle peut apporter structure, clarté et discipline. Mais Akasha le fait d\'une manière qui habilite les gens à développer ces qualités de l\'intérieur, plutôt que de se sentir pressurisés de l\'extérieur. Sa présence pousse doucement les gens à monter...'
WHERE content_en LIKE '%When needed, she can bring structure%';

-- Populate French translations for pages
UPDATE pages SET 
  title_fr = 'Adhésion',
  content_fr = 'Votre expert est votre partenaire, célébrant les victoires et naviguant les défis avec vous.',
  meta_description_fr = 'Votre expert est votre partenaire, célébrant les victoires et naviguant les défis avec vous.'
WHERE slug = 'membership';

UPDATE pages SET 
  title_fr = 'Contact',
  content_fr = 'Nous envisageons un avenir où les pratiques de bien-être holistique sont tissées dans le tissu de la vie quotidienne, où les gens ne traitent pas seulement les symptômes, mais cultivent une vitalité durable et une paix intérieure.',
  meta_description_fr = 'Nous envisageons un avenir où les pratiques de bien-être holistique sont tissées dans le tissu de la vie quotidienne.'
WHERE slug = 'contact';

-- Update blog post descriptions
UPDATE blog_posts SET 
  content_fr = 'Chaque individu vit en alignement avec le but de son âme, contribuant à une civilisation prospère et consciente.'
WHERE content_en LIKE '%Every individual lives in alignment with their soul%';

-- Update home page content
UPDATE pages SET 
  title_fr = 'Bienvenue chez Infinity Role Teachers',
  content_fr = 'Lorsque les enseignants deviennent Infinity Role Teachers et que chaque cœur bat d\'amour, la planète s\'éveille — et nous aussi. Ensemble, nous donnons naissance à une nouvelle ère d\'évolution consciente.',
  meta_description_fr = 'Lorsque les enseignants deviennent Infinity Role Teachers et que chaque cœur bat d\'amour, la planète s\'éveille — et nous aussi. Ensemble, nous donnons naissance à une nouvelle ère d\'évolution consciente.'
WHERE slug = 'home';

-- Update coach training page
UPDATE pages SET 
  title_fr = 'Formation de Coach',
  content_fr = 'Authenticité - Méthodes d\'enseignement ancrées dans la sagesse ancienne et validées par la compréhension moderne.',
  meta_description_fr = 'Authenticité - Méthodes d\'enseignement ancrées dans la sagesse ancienne et validées par la compréhension moderne.'
WHERE slug = 'coach-training';

-- Update home page content
UPDATE pages SET 
  title_fr = 'Infinity Role Teachers',
  content_fr = 'Ensemble, nous donnons naissance à une nouvelle ère d\'évolution consciente. Infinity Role Teachers promeut le bien-être holistique par le Sunyoga, l\'acupressure, la méditation et le coaching conscient. Nous construisons des communautés Sandha qui éveillent le potentiel illimité dans chaque cœur, pour créer ensemble un monde véritablement uni et conscient.',
  meta_description_fr = 'Ensemble, nous donnons naissance à une nouvelle ère d\'évolution consciente.'
WHERE slug = 'home';

-- Update events page
UPDATE pages SET 
  title_fr = 'Événements',
  content_fr = 'Accessibilité - Rendre le bien-être holistique accessible à tous, indépendamment du contexte.',
  meta_description_fr = 'Accessibilité - Rendre le bien-être holistique accessible à tous, indépendamment du contexte.'
WHERE slug = 'events';

-- Update about page content
UPDATE pages SET 
  title_fr = 'À propos',
  content_fr = 'Infinity Role Teachers promeut le bien-être holistique par le Sunyoga, l\'acupressure, la méditation et le coaching conscient. Nous construisons des communautés Sandha qui éveillent le potentiel illimité dans chaque cœur, pour créer ensemble un monde véritablement uni et conscient.',
  meta_description_fr = 'Infinity Role Teachers promeut le bien-être holistique par le Sunyoga, l\'acupressure, la méditation et le coaching conscient.'
WHERE slug = 'about';

-- Update mission page content
UPDATE pages SET 
  title_fr = 'Notre Mission',
  content_fr = 'Notre mission chez Infinity Role Teachers : autonomiser les individus par le bien-être holistique, le Sunyoga et les programmes de formation certifiés de coach.',
  meta_description_fr = 'Notre mission chez Infinity Role Teachers : autonomiser les individus par le bien-être holistique, le Sunyoga et les programmes de formation certifiés de coach.'
WHERE slug = 'mission';

-- Update vision page content
UPDATE pages SET 
  title_fr = 'Notre Vision',
  content_fr = 'Notre vision chez Infinity Role Teachers : Un monde où le bien-être holistique est un mode de vie, animé par des coaches certifiés dans le monde entier.',
  meta_description_fr = 'Notre vision chez Infinity Role Teachers : Un monde où le bien-être holistique est un mode de vie, animé par des coaches certifiés dans le monde entier.'
WHERE slug = 'vision';

-- Update donate page content
UPDATE pages SET 
  title_fr = 'Faire un don',
  content_fr = 'Soutenez notre mission. Soutenez la communauté Infinity Role Teachers. Vos généreuses contributions nous aident à poursuivre notre mission de promotion de l\'autoréalisation et de la vie consciente. Élévation de la conscience humaine. IRT est dédié à la construction d\'un monde conscient et permet à chaque personne de réaliser son plus haut potentiel. Soutenez-nous pour offrir à chaque personne sur la planète au moins une goutte de spiritualité. Planète consciente. Conscious Planet met en œuvre plusieurs projets novateurs pour soutenir la croissance individuelle, revitaliser l\'esprit humain, construire des communautés et restaurer l\'environnement.',
  meta_description_fr = 'Soutenez notre travail et aidez-nous à construire un foyer pour le chercheur.'
WHERE slug = 'donate';

-- Update volunteer page content
UPDATE pages SET 
  title_fr = 'Bénévolat',
  content_fr = 'Rejoignez notre équipe de bénévoles. Rôles de bénévoles à distance (travail de n\'importe où). Ces rôles vous permettent de contribuer de n\'importe où et de soutenir la mission mondiale du centre IRT par des efforts numériques, financiers et créatifs. Spécialiste en levée de fonds et subventions - Connectez-vous avec des donateurs, créez des propositions de subventions et organisez des initiatives de levée de fonds. Finances & Audit - Gérez les budgets, la paie et les documents financiers et assurez la conformité. Graphiste - Créez des designs visuels pour des brochures, des affiches et du matériel promotionnel. Créateur de contenu & Éditeur vidéo - Développez du contenu engageant, montez des vidéos et améliorez la visibilité en ligne. Gestion de site web & SEO - Maintenez et mettez à jour le site web, améliorez les classements de recherche et automatisez les processus. Conception & publication de livres - Concevez, éditez et publiez des livres, des manuels et des ressources sur les enseignements IRT. Coordinateur marketing & sensibilisation - Étendez la portée d\'IRT par des campagnes publicitaires ciblées, les réseaux sociaux et des initiatives marketing stratégiques. Ressources humaines. Pourquoi faire du bénévolat ? Approfondissez votre Sadhana. Accélérez votre croissance spirituelle tout en pratiquant votre Sadhana (pratiques yogiques).',
  meta_description_fr = 'Rejoignez notre équipe de bénévoles et contribuez votre temps et vos compétences.'
WHERE slug = 'volunteer';

-- Update health page content
UPDATE pages SET 
  title_fr = 'Santé',
  content_fr = 'La santé est l\'harmonie du corps, de l\'esprit et de l\'âme.',
  meta_description_fr = 'La santé est l\'harmonie du corps, de l\'esprit et de l\'âme.'
WHERE slug = 'health';
