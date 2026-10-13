import type { ModuleDict } from './types';

/**
 * Promotions, tournaments, blogs, bonuses, rewards and roles — the sample copy
 * the placeholder constants carry plus the few labels core does not already
 * have (core owns the promo., tournament., blogs., bonus., rewards. and role.
 * labels).
 */
export const en = {
  /* Shared by the promotion detail page and every tournament card. */
  'content.sample.wagerRace': 'Endorphina Wager Race',

  'content.promo.clutchTitle': '$20,000 - Clutch Up!',
  'content.promo.clutchBody':
    'Get your selections settled early if the team you back goes 2 goals up',
  'content.promo.detailsBody':
    "Discover our exclusive casino promotion designed to bring you unbeatable value and thrilling rewards like never before. Enjoy a generous welcome bonus of up to 200% on your first deposit, plus 50 free spins on our most popular slot games. Loyal members unlock VIP perks including cashback offers, priority withdrawals, and access to high-stakes tournament events every weekend. Whether you're spinning the reels, hitting the blackjack tables, or trying your luck at live dealer games — this limited-time offer is crafted to maximize your winnings and elevate every moment of play.",
  'content.promo.starsOutOf5': '{value} out of 5',
  'content.promo.review1':
    'The promotion was easy to join and the bonus was credited instantly. Ended up winning more than I expected.',
  'content.promo.review2':
    'Super smooth sign-up process. The bonus made my week! Highly recommend.',
  'content.promo.review3':
    "Didn't expect to win, but this promotion really paid off. Instant credit too.",
  'content.promo.review4':
    'Joining was straightforward and I appreciated how quickly the bonus showed up.',
  'content.promo.review5':
    'Great promotion with instant rewards. It boosted my experience significantly.',
  'content.promo.review6':
    'The ease of entry and quick bonus credit made this my favorite promotion yet.',
  'content.promo.review7':
    'Fast and reliable! The bonus was credited right away and helped me win big.',
  'content.promo.review8':
    'A hassle-free promotion with instant bonuses. I ended up winning more than expected.',
  'content.promo.review9':
    'Smooth process and quick bonus credit. Definitely participating again next time.',

  'content.tournament.hidden': 'Hidden',

  /* "Sportbook" is the frame's own spelling — see BLOG_CATEGORIES. */
  'content.blogs.cat.inside': 'Rolluck Inside',
  'content.blogs.cat.sportsbook': 'Sportbook',
  'content.blogs.cat.ambassadors': 'Ambassadors',
  'content.blogs.cat.charity': 'Rolluck Charity',
  'content.blogs.cat.crypto': 'Crypto',
  'content.blogs.post.title': 'Worst Odds in Casino: Games You Should Avoid',
  'content.blogs.post.excerpt':
    'Learn about casino games with the worst odds, including slots, keno, and wheel of fortune. Find out which games give the house a bigger edge.',
  'content.blogs.article.p1':
    "Casino games can be fun, but some offer terrible chances of winning. I want to tell you about the worst odds in casino games so you can make better choices with your money. Slots are the most common trap. They have a house edge between 2% and 15%. While playing slots is simple, you can't use any strategy to win. The results are random, and the casino always has an advantage.",
  'content.blogs.article.p2':
    'Keno gives players the worst chances. The house edge ranges from 20% to 40%, making it nearly impossible to win in the long run.\nYou pick numbers from 1 to 80, but the odds are stacked heavily against you. The Wheel of Fortune isn’t much better. When you bet on the $1 space, which seems safest, the house still has an 11% edge.',
  'content.blogs.article.p3':
    'Betting on the joker space is even worse, with a 24% house advantage. If you want better chances of winning, try games that need skill. Many players who visit online casino sites prefer games like blackjack or video poker because they can use strategy to improve their odds.',
  'content.blogs.article.p4':
    'Remember that casinos design these games to make money. While you might get lucky and win sometimes, the house always has an advantage. Set a budget before playing and stick to it.',
  'content.blogs.article.p5': 'Your goal should be entertainment, not making money.',
  'content.blogs.article.p6':
    'The best approach is to play the games you enjoy but know your limits. The longer you play games with bad odds, the more likely you are to lose money.\nChoose games that make your money last longer and give you more play time for your budget.',

  'content.bonus.regular.furyWheel': 'Free Fury Wheel',
  'content.bonus.regular.weeklySport': 'Weekly Sport Bonus',
  'content.bonus.hours': '{count}h',
  'content.bonus.daysTime': '{days} d {time}',

  'content.role.superMaster': 'Super Master',
  'content.role.master': 'Master',
  'content.role.riskManagement': 'Risk Management',
  'content.role.accountant': 'Accountant',
  'content.role.customerSupport': 'Customer Support',
  'content.role.marketing': 'Marketing',
  'content.role.partner': 'Partner',
  'content.role.riskManagementTrainee': 'Risk Management Trainee',
} as const;

export const translations: ModuleDict<typeof en> = {
  ar: {
    'content.sample.wagerRace': 'سباق رهانات Endorphina',
    'content.promo.clutchTitle': '$20,000 - كن حاسمًا!',
    'content.promo.clutchBody':
      'احصل على تسوية رهاناتك مبكرًا إذا تقدّم الفريق الذي تدعمه بفارق هدفين',
    'content.promo.detailsBody':
      'اكتشف عرض الكازينو الحصري المصمَّم ليمنحك قيمة لا تُضاهى ومكافآت مثيرة لم تعهدها من قبل. استمتع بمكافأة ترحيبية سخية تصل إلى 200% على إيداعك الأول، بالإضافة إلى 50 دورة مجانية على أشهر ألعاب السلوت لدينا. ويحصل الأعضاء الأوفياء على امتيازات VIP تشمل عروض الاسترداد النقدي، والسحوبات ذات الأولوية، والمشاركة في بطولات عالية الرهانات كل عطلة نهاية أسبوع. وسواء كنت تدير البكرات، أو تجلس إلى طاولات البلاك جاك، أو تجرّب حظك في ألعاب الموزّع المباشر — فقد صُمِّم هذا العرض المحدود المدة ليضاعف أرباحك ويرتقي بكل لحظة من لحظات اللعب.',
    'content.promo.starsOutOf5': '{value} من 5',
    'content.promo.review1':
      'كان الانضمام إلى العرض سهلًا وأُضيفت المكافأة فورًا. وانتهى بي الأمر بربح أكثر مما توقعت.',
    'content.promo.review2': 'عملية تسجيل سلسة للغاية. المكافأة صنعت أسبوعي! أنصح به بشدة.',
    'content.promo.review3': 'لم أتوقع الفوز، لكن هذا العرض أثمر فعلًا. والإضافة فورية أيضًا.',
    'content.promo.review4': 'كان الانضمام بسيطًا، وقدّرت سرعة ظهور المكافأة.',
    'content.promo.review5': 'عرض رائع بمكافآت فورية. لقد حسّن تجربتي بشكل كبير.',
    'content.promo.review6':
      'سهولة المشاركة وسرعة إضافة المكافأة جعلتا هذا العرض المفضّل لديّ حتى الآن.',
    'content.promo.review7': 'سريع وموثوق! أُضيفت المكافأة على الفور وساعدتني على تحقيق ربح كبير.',
    'content.promo.review8':
      'عرض خالٍ من المتاعب بمكافآت فورية. انتهى بي الأمر بربح أكثر مما توقعت.',
    'content.promo.review9':
      'عملية سلسة وإضافة سريعة للمكافأة. سأشارك مجددًا في المرة القادمة بالتأكيد.',
    'content.tournament.hidden': 'مخفي',
    'content.blogs.cat.inside': 'داخل Rolluck',
    'content.blogs.cat.sportsbook': 'المراهنات الرياضية',
    'content.blogs.cat.ambassadors': 'السفراء',
    'content.blogs.cat.charity': 'أعمال Rolluck الخيرية',
    'content.blogs.cat.crypto': 'العملات الرقمية',
    'content.blogs.post.title': 'أسوأ الاحتمالات في الكازينو: ألعاب يجب تجنّبها',
    'content.blogs.post.excerpt':
      'تعرّف على ألعاب الكازينو ذات أسوأ الاحتمالات، ومنها السلوت والكينو وعجلة الحظ. واكتشف أيّ الألعاب تمنح الكازينو أفضلية أكبر.',
    'content.blogs.article.p1':
      'قد تكون ألعاب الكازينو ممتعة، لكن بعضها يقدّم فرص فوز سيئة للغاية. أريد أن أحدّثك عن أسوأ الاحتمالات في ألعاب الكازينو حتى تتخذ قرارات أفضل بشأن أموالك. ماكينات السلوت هي الفخ الأكثر شيوعًا، إذ تتراوح أفضلية الكازينو فيها بين 2% و15%. ومع أن لعب السلوت بسيط، فلا يمكنك استخدام أي استراتيجية للفوز. النتائج عشوائية، والكازينو يملك الأفضلية دائمًا.',
    'content.blogs.article.p2':
      'يمنح الكينو اللاعبين أسوأ الفرص، إذ تتراوح أفضلية الكازينو بين 20% و40%، ما يجعل الفوز على المدى الطويل شبه مستحيل.\nتختار أرقامًا من 1 إلى 80، لكن الاحتمالات مكدّسة ضدك بشدة. وعجلة الحظ ليست أفضل بكثير؛ فعندما تراهن على خانة الـ $1، التي تبدو الأكثر أمانًا، تظل أفضلية الكازينو 11%.',
    'content.blogs.article.p3':
      'والمراهنة على خانة الجوكر أسوأ من ذلك، بأفضلية للكازينو تبلغ 24%. إذا أردت فرص فوز أفضل، فجرّب الألعاب التي تتطلب مهارة. كثير من اللاعبين الذين يزورون مواقع الكازينو على الإنترنت يفضّلون ألعابًا مثل البلاك جاك أو الفيديو بوكر لأنهم يستطيعون استخدام الاستراتيجية لتحسين احتمالاتهم.',
    'content.blogs.article.p4':
      'تذكّر أن الكازينوهات تصمّم هذه الألعاب لتحقيق الربح. قد يحالفك الحظ فتفوز أحيانًا، لكن الكازينو يملك الأفضلية دائمًا. حدّد ميزانية قبل اللعب والتزم بها.',
    'content.blogs.article.p5': 'يجب أن يكون هدفك الترفيه، لا كسب المال.',
    'content.blogs.article.p6':
      'أفضل نهج هو أن تلعب الألعاب التي تستمتع بها مع معرفة حدودك. فكلما طال لعبك لألعاب ذات احتمالات سيئة، زادت احتمالية خسارتك للمال.\nاختر ألعابًا تجعل أموالك تدوم أطول وتمنحك وقت لعب أكثر مقابل ميزانيتك.',
    'content.bonus.regular.furyWheel': 'عجلة Fury المجانية',
    'content.bonus.regular.weeklySport': 'مكافأة الرياضة الأسبوعية',
    'content.bonus.hours': '{count} س',
    'content.bonus.daysTime': '{days} ي {time}',
    'content.role.superMaster': 'المسؤول الأعلى',
    'content.role.master': 'المسؤول',
    'content.role.riskManagement': 'إدارة المخاطر',
    'content.role.accountant': 'محاسب',
    'content.role.customerSupport': 'دعم العملاء',
    'content.role.marketing': 'التسويق',
    'content.role.partner': 'شريك',
    'content.role.riskManagementTrainee': 'متدرب إدارة المخاطر',
  },
  tr: {
    'content.sample.wagerRace': 'Endorphina Bahis Yarışı',
    'content.promo.clutchTitle': '$20,000 - Fark Yarat!',
    'content.promo.clutchBody':
      'Desteklediğin takım 2 gol öne geçerse seçimlerin erkenden sonuçlandırılsın',
    'content.promo.detailsBody':
      'Size eşsiz bir değer ve daha önce hiç yaşamadığınız heyecan verici ödüller sunmak için tasarlanan özel casino promosyonumuzu keşfedin. İlk yatırımınızda %200’e varan cömert bir hoş geldin bonusunun yanı sıra en popüler slot oyunlarımızda 50 bedava dönüşün keyfini çıkarın. Sadık üyeler; nakit iade teklifleri, öncelikli para çekme ve her hafta sonu yüksek bahisli turnuva etkinliklerine erişim dahil VIP ayrıcalıklarının kilidini açar. İster makaraları çevirin, ister blackjack masalarına oturun, ister canlı krupiyer oyunlarında şansınızı deneyin — bu sınırlı süreli teklif, kazancınızı en üst düzeye çıkarmak ve oyunun her anını daha da keyifli kılmak için hazırlandı.',
    'content.promo.starsOutOf5': '5 üzerinden {value}',
    'content.promo.review1':
      'Promosyona katılmak kolaydı ve bonus anında yüklendi. Sonunda beklediğimden fazlasını kazandım.',
    'content.promo.review2':
      'Son derece sorunsuz bir kayıt süreci. Bonus haftamı güzelleştirdi! Kesinlikle tavsiye ederim.',
    'content.promo.review3':
      'Kazanmayı beklemiyordum ama bu promosyon gerçekten karşılığını verdi. Üstelik anında yüklendi.',
    'content.promo.review4':
      'Katılmak çok basitti ve bonusun ne kadar hızlı geldiğini takdir ettim.',
    'content.promo.review5':
      'Anında ödüller sunan harika bir promosyon. Deneyimimi önemli ölçüde güçlendirdi.',
    'content.promo.review6':
      'Katılım kolaylığı ve hızlı bonus yüklemesi bunu şimdiye kadarki en sevdiğim promosyon yaptı.',
    'content.promo.review7':
      'Hızlı ve güvenilir! Bonus hemen yüklendi ve büyük kazanmama yardımcı oldu.',
    'content.promo.review8':
      'Anında bonuslar sunan zahmetsiz bir promosyon. Sonunda beklediğimden fazlasını kazandım.',
    'content.promo.review9':
      'Sorunsuz süreç ve hızlı bonus yüklemesi. Bir dahaki sefere kesinlikle yine katılacağım.',
    'content.tournament.hidden': 'Gizli',
    'content.blogs.cat.inside': 'Rolluck’un İçinden',
    'content.blogs.cat.sportsbook': 'Spor Bahisleri',
    'content.blogs.cat.ambassadors': 'Elçiler',
    'content.blogs.cat.charity': 'Rolluck Yardım',
    'content.blogs.cat.crypto': 'Kripto',
    'content.blogs.post.title': 'Casinoda En Kötü Oranlar: Kaçınmanız Gereken Oyunlar',
    'content.blogs.post.excerpt':
      'Slotlar, keno ve çarkıfelek dahil en kötü oranlara sahip casino oyunlarını öğrenin. Hangi oyunların kasaya daha büyük bir avantaj sağladığını keşfedin.',
    'content.blogs.article.p1':
      'Casino oyunları eğlenceli olabilir, ancak bazıları korkunç kazanma şansları sunar. Paranızla ilgili daha iyi seçimler yapabilmeniz için size casino oyunlarındaki en kötü oranlardan bahsetmek istiyorum. Slotlar en yaygın tuzaktır. Kasa avantajları %2 ile %15 arasındadır. Slot oynamak basit olsa da kazanmak için herhangi bir strateji kullanamazsınız. Sonuçlar rastgeledir ve casino her zaman avantajlıdır.',
    'content.blogs.article.p2':
      'Keno, oyunculara en kötü şansı verir. Kasa avantajı %20 ile %40 arasında değişir; bu da uzun vadede kazanmayı neredeyse imkânsız kılar.\n1 ile 80 arasında sayılar seçersiniz, ancak oranlar ağır biçimde aleyhinizedir. Çarkıfelek de pek daha iyi değildir. En güvenli görünen $1 alanına bahis yaptığınızda bile kasanın %11 avantajı vardır.',
    'content.blogs.article.p3':
      'Joker alanına bahis yapmak ise %24 kasa avantajıyla daha da kötüdür. Daha iyi kazanma şansı istiyorsanız beceri gerektiren oyunları deneyin. Online casino sitelerini ziyaret eden birçok oyuncu, oranlarını iyileştirmek için strateji kullanabildikleri blackjack veya video poker gibi oyunları tercih eder.',
    'content.blogs.article.p4':
      'Casinoların bu oyunları para kazanmak için tasarladığını unutmayın. Bazen şanslı olup kazanabilirsiniz, ancak kasa her zaman avantajlıdır. Oynamadan önce bir bütçe belirleyin ve ona bağlı kalın.',
    'content.blogs.article.p5': 'Amacınız para kazanmak değil, eğlenmek olmalı.',
    'content.blogs.article.p6':
      'En iyi yaklaşım, keyif aldığınız oyunları oynamak ama sınırlarınızı bilmektir. Kötü oranlı oyunları ne kadar uzun oynarsanız, para kaybetme olasılığınız o kadar artar.\nParanızın daha uzun dayanmasını sağlayan ve bütçenize karşılık size daha fazla oyun süresi veren oyunları seçin.',
    'content.bonus.regular.furyWheel': 'Bedava Fury Çarkı',
    'content.bonus.regular.weeklySport': 'Haftalık Spor Bonusu',
    'content.bonus.hours': '{count} sa',
    'content.bonus.daysTime': '{days} g {time}',
    'content.role.superMaster': 'Süper Yönetici',
    'content.role.master': 'Yönetici',
    'content.role.riskManagement': 'Risk Yönetimi',
    'content.role.accountant': 'Muhasebeci',
    'content.role.customerSupport': 'Müşteri Desteği',
    'content.role.marketing': 'Pazarlama',
    'content.role.partner': 'İş Ortağı',
    'content.role.riskManagementTrainee': 'Risk Yönetimi Stajyeri',
  },
  hi: {
    'content.sample.wagerRace': 'Endorphina वेजर रेस',
    'content.promo.clutchTitle': '$20,000 - दम दिखाओ!',
    'content.promo.clutchBody':
      'जिस टीम का आप समर्थन करते हैं, वह 2 गोल से आगे हो जाए तो अपने चयन जल्दी सेटल करवाएं',
    'content.promo.detailsBody':
      'हमारे विशेष कैसीनो प्रमोशन को खोजें, जिसे आपको बेजोड़ वैल्यू और पहले कभी न मिले रोमांचक इनाम देने के लिए तैयार किया गया है। अपनी पहली जमा राशि पर 200% तक के शानदार वेलकम बोनस का आनंद लें, साथ ही हमारे सबसे लोकप्रिय स्लॉट गेम्स पर 50 फ्री स्पिन भी पाएं। वफादार सदस्य VIP सुविधाएं अनलॉक करते हैं, जिनमें कैशबैक ऑफ़र, प्राथमिकता वाली निकासी और हर वीकेंड हाई-स्टेक्स टूर्नामेंट इवेंट्स में प्रवेश शामिल है। चाहे आप रील्स घुमा रहे हों, ब्लैकजैक टेबल पर हों या लाइव डीलर गेम्स में अपनी किस्मत आज़मा रहे हों — यह सीमित समय का ऑफ़र आपकी जीत को अधिकतम करने और खेल के हर पल को और खास बनाने के लिए बनाया गया है।',
    'content.promo.starsOutOf5': '5 में से {value}',
    'content.promo.review1':
      'प्रमोशन में शामिल होना आसान था और बोनस तुरंत क्रेडिट हो गया। मैंने उम्मीद से ज़्यादा जीत लिया।',
    'content.promo.review2':
      'बेहद आसान साइन-अप प्रक्रिया। बोनस ने मेरा हफ़्ता बना दिया! ज़रूर आज़माएं।',
    'content.promo.review3':
      'जीतने की उम्मीद नहीं थी, लेकिन इस प्रमोशन ने सच में फ़ायदा दिलाया। क्रेडिट भी तुरंत मिला।',
    'content.promo.review4':
      'शामिल होना बिल्कुल सीधा था और बोनस जितनी जल्दी आया, वह मुझे बहुत अच्छा लगा।',
    'content.promo.review5':
      'तुरंत इनाम वाला शानदार प्रमोशन। इसने मेरे अनुभव को काफ़ी बेहतर बना दिया।',
    'content.promo.review6':
      'आसान एंट्री और तेज़ बोनस क्रेडिट ने इसे अब तक का मेरा पसंदीदा प्रमोशन बना दिया।',
    'content.promo.review7': 'तेज़ और भरोसेमंद! बोनस तुरंत क्रेडिट हुआ और इससे मुझे बड़ी जीत मिली।',
    'content.promo.review8':
      'तुरंत बोनस वाला झंझट-मुक्त प्रमोशन। मैंने उम्मीद से ज़्यादा जीत लिया।',
    'content.promo.review9': 'आसान प्रक्रिया और तेज़ बोनस क्रेडिट। अगली बार भी ज़रूर हिस्सा लूंगा।',
    'content.tournament.hidden': 'छिपा हुआ',
    'content.blogs.cat.inside': 'Rolluck इनसाइड',
    'content.blogs.cat.sportsbook': 'स्पोर्ट्सबुक',
    'content.blogs.cat.ambassadors': 'एंबेसडर',
    'content.blogs.cat.charity': 'Rolluck चैरिटी',
    'content.blogs.cat.crypto': 'क्रिप्टो',
    'content.blogs.post.title': 'कैसीनो में सबसे खराब ऑड्स: ऐसे गेम जिनसे आपको बचना चाहिए',
    'content.blogs.post.excerpt':
      'सबसे खराब ऑड्स वाले कैसीनो गेम्स के बारे में जानें, जिनमें स्लॉट, केनो और व्हील ऑफ़ फ़ॉर्च्यून शामिल हैं। पता करें कि कौन-से गेम हाउस को ज़्यादा बढ़त देते हैं।',
    'content.blogs.article.p1':
      'कैसीनो गेम्स मज़ेदार हो सकते हैं, लेकिन कुछ गेम्स में जीतने की संभावना बहुत खराब होती है। मैं आपको कैसीनो गेम्स के सबसे खराब ऑड्स के बारे में बताना चाहता हूं, ताकि आप अपने पैसों को लेकर बेहतर फ़ैसले ले सकें। स्लॉट्स सबसे आम जाल हैं। इनमें हाउस एज 2% से 15% के बीच होता है। स्लॉट खेलना आसान है, लेकिन जीतने के लिए आप कोई रणनीति इस्तेमाल नहीं कर सकते। नतीजे बेतरतीब होते हैं और कैसीनो के पास हमेशा बढ़त रहती है।',
    'content.blogs.article.p2':
      'केनो खिलाड़ियों को सबसे खराब मौके देता है। इसका हाउस एज 20% से 40% तक होता है, जिससे लंबे समय में जीतना लगभग असंभव हो जाता है।\nआप 1 से 80 तक के नंबर चुनते हैं, लेकिन ऑड्स पूरी तरह आपके ख़िलाफ़ होते हैं। व्हील ऑफ़ फ़ॉर्च्यून भी ज़्यादा बेहतर नहीं है। जब आप $1 वाले खाने पर दांव लगाते हैं, जो सबसे सुरक्षित लगता है, तब भी हाउस के पास 11% की बढ़त होती है।',
    'content.blogs.article.p3':
      'जोकर वाले खाने पर दांव लगाना तो और भी खराब है, जिसमें हाउस की बढ़त 24% है। अगर आप जीतने के बेहतर मौके चाहते हैं, तो ऐसे गेम आज़माएं जिनमें कौशल की ज़रूरत हो। ऑनलाइन कैसीनो साइट्स पर आने वाले कई खिलाड़ी ब्लैकजैक या वीडियो पोकर जैसे गेम पसंद करते हैं, क्योंकि उनमें वे अपने ऑड्स सुधारने के लिए रणनीति का इस्तेमाल कर सकते हैं।',
    'content.blogs.article.p4':
      'याद रखें कि कैसीनो ये गेम पैसे कमाने के लिए बनाते हैं। हो सकता है कभी-कभी किस्मत साथ दे और आप जीत जाएं, लेकिन हाउस के पास हमेशा बढ़त रहती है। खेलने से पहले बजट तय करें और उसी पर टिके रहें।',
    'content.blogs.article.p5': 'आपका लक्ष्य मनोरंजन होना चाहिए, पैसे कमाना नहीं।',
    'content.blogs.article.p6':
      'सबसे अच्छा तरीका है कि आप वे गेम खेलें जिनका आप आनंद लेते हैं, लेकिन अपनी सीमाएं जानें। आप खराब ऑड्स वाले गेम जितनी देर खेलेंगे, पैसे हारने की संभावना उतनी ही बढ़ेगी।\nऐसे गेम चुनें जो आपके पैसों को ज़्यादा देर तक चलाएं और आपके बजट में आपको ज़्यादा खेलने का समय दें।',
    'content.bonus.regular.furyWheel': 'फ्री Fury व्हील',
    'content.bonus.regular.weeklySport': 'साप्ताहिक स्पोर्ट बोनस',
    'content.bonus.hours': '{count} घं',
    'content.bonus.daysTime': '{days} दि {time}',
    'content.role.superMaster': 'सुपर व्यवस्थापक',
    'content.role.master': 'व्यवस्थापक',
    'content.role.riskManagement': 'जोखिम प्रबंधन',
    'content.role.accountant': 'लेखाकार',
    'content.role.customerSupport': 'ग्राहक सहायता',
    'content.role.marketing': 'मार्केटिंग',
    'content.role.partner': 'पार्टनर',
    'content.role.riskManagementTrainee': 'जोखिम प्रबंधन प्रशिक्षु',
  },
  fr: {
    'content.sample.wagerRace': 'Course aux mises Endorphina',
    'content.promo.clutchTitle': '$20,000 - Faites la différence !',
    'content.promo.clutchBody':
      "Faites régler vos sélections en avance si l'équipe que vous soutenez mène de 2 buts",
    'content.promo.detailsBody':
      "Découvrez notre promotion casino exclusive, conçue pour vous offrir une valeur imbattable et des récompenses plus palpitantes que jamais. Profitez d'un généreux bonus de bienvenue allant jusqu'à 200 % sur votre premier dépôt, ainsi que de 50 tours gratuits sur nos machines à sous les plus populaires. Les membres fidèles débloquent des avantages VIP, dont des offres de cashback, des retraits prioritaires et l'accès à des tournois à gros enjeux chaque week-end. Que vous fassiez tourner les rouleaux, que vous preniez place aux tables de blackjack ou que vous tentiez votre chance aux jeux avec croupier en direct, cette offre à durée limitée est pensée pour maximiser vos gains et sublimer chaque instant de jeu.",
    'content.promo.starsOutOf5': '{value} sur 5',
    'content.promo.review1':
      "Rejoindre la promotion a été facile et le bonus a été crédité instantanément. J'ai fini par gagner plus que prévu.",
    'content.promo.review2':
      'Inscription ultra fluide. Le bonus a illuminé ma semaine ! Je recommande vivement.',
    'content.promo.review3':
      "Je ne m'attendais pas à gagner, mais cette promotion a vraiment payé. Crédit instantané en plus.",
    'content.promo.review4':
      "L'inscription était simple et j'ai apprécié la rapidité avec laquelle le bonus est arrivé.",
    'content.promo.review5':
      'Super promotion avec des récompenses instantanées. Elle a nettement amélioré mon expérience.',
    'content.promo.review6':
      "La facilité de participation et le crédit rapide du bonus en ont fait ma promotion préférée jusqu'ici.",
    'content.promo.review7':
      "Rapide et fiable ! Le bonus a été crédité tout de suite et m'a aidé à gagner gros.",
    'content.promo.review8':
      "Une promotion sans prise de tête avec des bonus instantanés. J'ai fini par gagner plus que prévu.",
    'content.promo.review9':
      'Processus fluide et bonus crédité rapidement. Je participerai sans hésiter la prochaine fois.',
    'content.tournament.hidden': 'Masqué',
    'content.blogs.cat.inside': 'Rolluck en coulisses',
    'content.blogs.cat.sportsbook': 'Paris sportifs',
    'content.blogs.cat.ambassadors': 'Ambassadeurs',
    'content.blogs.cat.charity': 'Rolluck Solidarité',
    'content.blogs.cat.crypto': 'Crypto',
    'content.blogs.post.title': 'Les pires cotes du casino : les jeux à éviter',
    'content.blogs.post.excerpt':
      'Découvrez les jeux de casino aux pires cotes, dont les machines à sous, le keno et la roue de la fortune. Voyez quels jeux donnent un plus gros avantage à la maison.',
    'content.blogs.article.p1':
      "Les jeux de casino peuvent être amusants, mais certains offrent des chances de gain catastrophiques. Je veux vous parler des pires cotes des jeux de casino pour que vous puissiez faire de meilleurs choix avec votre argent. Les machines à sous sont le piège le plus courant. Leur avantage de la maison se situe entre 2 % et 15 %. Jouer aux machines à sous est simple, mais vous ne pouvez utiliser aucune stratégie pour gagner. Les résultats sont aléatoires et le casino garde toujours l'avantage.",
    'content.blogs.article.p2':
      "Le keno offre aux joueurs les pires chances. L'avantage de la maison va de 20 % à 40 %, ce qui rend presque impossible de gagner sur le long terme.\nVous choisissez des numéros de 1 à 80, mais les probabilités jouent lourdement contre vous. La roue de la fortune ne vaut guère mieux. Quand vous misez sur la case à 1 $, qui semble la plus sûre, la maison conserve tout de même un avantage de 11 %.",
    'content.blogs.article.p3':
      "Miser sur la case joker est encore pire, avec un avantage de la maison de 24 %. Si vous voulez de meilleures chances de gagner, essayez des jeux qui demandent de l'habileté. De nombreux joueurs qui fréquentent les sites de casino en ligne préfèrent des jeux comme le blackjack ou le vidéo poker, car ils peuvent recourir à une stratégie pour améliorer leurs chances.",
    'content.blogs.article.p4':
      "N'oubliez pas que les casinos conçoivent ces jeux pour gagner de l'argent. Vous aurez peut-être de la chance et gagnerez parfois, mais la maison garde toujours l'avantage. Fixez-vous un budget avant de jouer et tenez-vous-y.",
    'content.blogs.article.p5':
      "Votre objectif doit être le divertissement, pas de gagner de l'argent.",
    'content.blogs.article.p6':
      "La meilleure approche consiste à jouer aux jeux qui vous plaisent tout en connaissant vos limites. Plus vous jouez longtemps à des jeux aux mauvaises cotes, plus vous risquez de perdre de l'argent.\nChoisissez des jeux qui font durer votre argent plus longtemps et vous offrent plus de temps de jeu pour votre budget.",
    'content.bonus.regular.furyWheel': 'Roue Fury gratuite',
    'content.bonus.regular.weeklySport': 'Bonus sport hebdomadaire',
    'content.bonus.hours': '{count} h',
    'content.bonus.daysTime': '{days} j {time}',
    'content.role.superMaster': 'Super administrateur',
    'content.role.master': 'Administrateur',
    'content.role.riskManagement': 'Gestion des risques',
    'content.role.accountant': 'Comptable',
    'content.role.customerSupport': 'Service client',
    'content.role.marketing': 'Marketing',
    'content.role.partner': 'Partenaire',
    'content.role.riskManagementTrainee': 'Stagiaire en gestion des risques',
  },
  ru: {
    'content.sample.wagerRace': 'Гонка ставок Endorphina',
    'content.promo.clutchTitle': '$20,000 - Решающий момент!',
    'content.promo.clutchBody':
      'Ваши ставки рассчитываются досрочно, если команда, за которую вы болеете, ведёт в 2 гола',
    'content.promo.detailsBody':
      'Откройте для себя нашу эксклюзивную акцию казино, созданную, чтобы подарить вам непревзойдённую выгоду и захватывающие награды, каких ещё не было. Получите щедрый приветственный бонус до 200% на первый депозит, а также 50 бесплатных вращений в самых популярных слотах. Постоянные участники открывают VIP-привилегии, включая предложения кэшбэка, приоритетный вывод средств и доступ к турнирам с высокими ставками каждые выходные. Крутите ли вы барабаны, садитесь за столы блэкджека или испытываете удачу в играх с живыми дилерами — это ограниченное по времени предложение создано, чтобы приумножить ваши выигрыши и сделать каждый момент игры ярче.',
    'content.promo.starsOutOf5': '{value} из 5',
    'content.promo.review1':
      'Присоединиться к акции было легко, а бонус зачислили мгновенно. В итоге выиграл больше, чем ожидал.',
    'content.promo.review2':
      'Очень простая регистрация. Бонус сделал мою неделю! Очень рекомендую.',
    'content.promo.review3':
      'Не ожидал выиграть, но эта акция действительно окупилась. И зачисление мгновенное.',
    'content.promo.review4':
      'Принять участие было просто, и мне понравилось, как быстро пришёл бонус.',
    'content.promo.review5':
      'Отличная акция с мгновенными наградами. Она заметно улучшила мои впечатления.',
    'content.promo.review6':
      'Простота участия и быстрое зачисление бонуса сделали эту акцию моей любимой на сегодня.',
    'content.promo.review7':
      'Быстро и надёжно! Бонус зачислили сразу, и он помог мне крупно выиграть.',
    'content.promo.review8':
      'Акция без лишних хлопот с мгновенными бонусами. В итоге выиграл больше, чем ожидал.',
    'content.promo.review9':
      'Всё прошло гладко, бонус зачислили быстро. Обязательно поучаствую снова в следующий раз.',
    'content.tournament.hidden': 'Скрыто',
    'content.blogs.cat.inside': 'Rolluck изнутри',
    'content.blogs.cat.sportsbook': 'Ставки на спорт',
    'content.blogs.cat.ambassadors': 'Амбассадоры',
    'content.blogs.cat.charity': 'Благотворительность Rolluck',
    'content.blogs.cat.crypto': 'Криптовалюта',
    'content.blogs.post.title': 'Худшие шансы в казино: игры, которых стоит избегать',
    'content.blogs.post.excerpt':
      'Узнайте об играх казино с худшими шансами, включая слоты, кено и колесо фортуны. Выясните, какие игры дают казино наибольшее преимущество.',
    'content.blogs.article.p1':
      'Игры в казино могут быть увлекательными, но некоторые из них дают ужасные шансы на выигрыш. Я хочу рассказать вам о худших шансах в играх казино, чтобы вы могли разумнее распоряжаться своими деньгами. Слоты — самая распространённая ловушка. Преимущество казино в них составляет от 2% до 15%. Играть в слоты просто, но никакую стратегию для победы применить нельзя. Результаты случайны, а у казино всегда есть преимущество.',
    'content.blogs.article.p2':
      'Кено даёт игрокам худшие шансы. Преимущество казино составляет от 20% до 40%, поэтому выиграть на длинной дистанции почти невозможно.\nВы выбираете числа от 1 до 80, но шансы сильно против вас. Колесо фортуны ненамного лучше. Даже когда вы ставите на сектор $1, который кажется самым безопасным, у казино всё равно остаётся преимущество в 11%.',
    'content.blogs.article.p3':
      'Ставка на сектор джокера ещё хуже — преимущество казино 24%. Если вам нужны лучшие шансы на победу, попробуйте игры, требующие навыка. Многие игроки онлайн-казино предпочитают такие игры, как блэкджек или видеопокер, потому что могут применять стратегию, чтобы улучшить свои шансы.',
    'content.blogs.article.p4':
      'Помните, что казино создают эти игры, чтобы зарабатывать деньги. Иногда вам может повезти и вы выиграете, но у казино всегда есть преимущество. Установите бюджет перед игрой и придерживайтесь его.',
    'content.blogs.article.p5': 'Ваша цель — развлечение, а не заработок.',
    'content.blogs.article.p6':
      'Лучший подход — играть в игры, которые вам нравятся, но знать свои пределы. Чем дольше вы играете в игры с плохими шансами, тем выше вероятность проиграть деньги.\nВыбирайте игры, в которых ваши деньги тратятся медленнее и дают больше игрового времени в рамках вашего бюджета.',
    'content.bonus.regular.furyWheel': 'Бесплатное колесо Fury',
    'content.bonus.regular.weeklySport': 'Еженедельный спортивный бонус',
    'content.bonus.hours': '{count} ч',
    'content.bonus.daysTime': '{days} д {time}',
    'content.role.superMaster': 'Суперадминистратор',
    'content.role.master': 'Администратор',
    'content.role.riskManagement': 'Управление рисками',
    'content.role.accountant': 'Бухгалтер',
    'content.role.customerSupport': 'Служба поддержки',
    'content.role.marketing': 'Маркетинг',
    'content.role.partner': 'Партнёр',
    'content.role.riskManagementTrainee': 'Стажёр по управлению рисками',
  },
  pt: {
    'content.sample.wagerRace': 'Corrida de Apostas Endorphina',
    'content.promo.clutchTitle': '$20,000 - Hora da Virada!',
    'content.promo.clutchBody':
      'Tenha suas seleções liquidadas antecipadamente se o time em que você apostou abrir 2 gols de vantagem',
    'content.promo.detailsBody':
      'Descubra nossa promoção exclusiva de cassino, criada para oferecer um valor imbatível e recompensas emocionantes como nunca. Aproveite um generoso bônus de boas-vindas de até 200% no seu primeiro depósito, além de 50 rodadas grátis nos nossos caça-níqueis mais populares. Membros fiéis desbloqueiam vantagens VIP, incluindo ofertas de cashback, saques prioritários e acesso a torneios de alto valor todo fim de semana. Seja girando os rolos, sentando às mesas de blackjack ou tentando a sorte nos jogos com crupiê ao vivo — esta oferta por tempo limitado foi pensada para maximizar seus ganhos e elevar cada momento de jogo.',
    'content.promo.starsOutOf5': '{value} de 5',
    'content.promo.review1':
      'Foi fácil participar da promoção e o bônus foi creditado na hora. Acabei ganhando mais do que esperava.',
    'content.promo.review2':
      'Cadastro supertranquilo. O bônus fez a minha semana! Recomendo muito.',
    'content.promo.review3':
      'Não esperava ganhar, mas essa promoção realmente valeu a pena. E o crédito foi instantâneo.',
    'content.promo.review4': 'Participar foi simples e gostei da rapidez com que o bônus apareceu.',
    'content.promo.review5':
      'Ótima promoção com recompensas instantâneas. Melhorou muito a minha experiência.',
    'content.promo.review6':
      'A facilidade de participar e o crédito rápido do bônus fizeram desta a minha promoção favorita até agora.',
    'content.promo.review7':
      'Rápido e confiável! O bônus foi creditado na hora e me ajudou a ganhar muito.',
    'content.promo.review8':
      'Uma promoção sem complicação, com bônus instantâneos. Acabei ganhando mais do que esperava.',
    'content.promo.review9':
      'Processo tranquilo e bônus creditado rapidamente. Com certeza vou participar de novo na próxima.',
    'content.tournament.hidden': 'Oculto',
    'content.blogs.cat.inside': 'Bastidores da Rolluck',
    'content.blogs.cat.sportsbook': 'Apostas Esportivas',
    'content.blogs.cat.ambassadors': 'Embaixadores',
    'content.blogs.cat.charity': 'Rolluck Solidária',
    'content.blogs.cat.crypto': 'Cripto',
    'content.blogs.post.title': 'As piores probabilidades do cassino: jogos que você deve evitar',
    'content.blogs.post.excerpt':
      'Conheça os jogos de cassino com as piores probabilidades, incluindo caça-níqueis, keno e roda da fortuna. Descubra quais jogos dão à casa uma vantagem maior.',
    'content.blogs.article.p1':
      'Os jogos de cassino podem ser divertidos, mas alguns oferecem chances péssimas de ganhar. Quero falar sobre as piores probabilidades dos jogos de cassino para que você possa fazer escolhas melhores com o seu dinheiro. Os caça-níqueis são a armadilha mais comum. Eles têm uma vantagem da casa entre 2% e 15%. Embora jogar caça-níqueis seja simples, você não pode usar nenhuma estratégia para ganhar. Os resultados são aleatórios e o cassino sempre leva vantagem.',
    'content.blogs.article.p2':
      'O keno dá aos jogadores as piores chances. A vantagem da casa varia de 20% a 40%, o que torna quase impossível ganhar a longo prazo.\nVocê escolhe números de 1 a 80, mas as probabilidades estão fortemente contra você. A roda da fortuna não é muito melhor. Quando você aposta no espaço de $1, que parece o mais seguro, a casa ainda tem uma vantagem de 11%.',
    'content.blogs.article.p3':
      'Apostar no espaço do curinga é ainda pior, com uma vantagem da casa de 24%. Se você quer melhores chances de ganhar, experimente jogos que exigem habilidade. Muitos jogadores que visitam sites de cassino online preferem jogos como blackjack ou video poker, porque podem usar estratégia para melhorar suas chances.',
    'content.blogs.article.p4':
      'Lembre-se de que os cassinos criam esses jogos para ganhar dinheiro. Você pode ter sorte e ganhar de vez em quando, mas a casa sempre leva vantagem. Defina um orçamento antes de jogar e respeite-o.',
    'content.blogs.article.p5': 'Seu objetivo deve ser o entretenimento, não ganhar dinheiro.',
    'content.blogs.article.p6':
      'A melhor abordagem é jogar os jogos de que você gosta, mas conhecendo seus limites. Quanto mais tempo você joga jogos com probabilidades ruins, maior a chance de perder dinheiro.\nEscolha jogos que façam seu dinheiro durar mais e ofereçam mais tempo de jogo pelo seu orçamento.',
    'content.bonus.regular.furyWheel': 'Roda Fury Grátis',
    'content.bonus.regular.weeklySport': 'Bônus Esportivo Semanal',
    'content.bonus.hours': '{count} h',
    'content.bonus.daysTime': '{days} d {time}',
    'content.role.superMaster': 'Superadministrador',
    'content.role.master': 'Administrador',
    'content.role.riskManagement': 'Gestão de Riscos',
    'content.role.accountant': 'Contador',
    'content.role.customerSupport': 'Suporte ao Cliente',
    'content.role.marketing': 'Marketing',
    'content.role.partner': 'Parceiro',
    'content.role.riskManagementTrainee': 'Estagiário de Gestão de Riscos',
  },
  es: {
    'content.sample.wagerRace': 'Carrera de apuestas Endorphina',
    'content.promo.clutchTitle': '$20,000 - ¡A por todas!',
    'content.promo.clutchBody':
      'Liquida tus selecciones por adelantado si el equipo al que apoyas se pone 2 goles arriba',
    'content.promo.detailsBody':
      'Descubre nuestra promoción exclusiva de casino, diseñada para ofrecerte un valor inigualable y recompensas emocionantes como nunca antes. Disfruta de un generoso bono de bienvenida de hasta el 200% en tu primer depósito, además de 50 giros gratis en nuestras tragamonedas más populares. Los miembros fieles desbloquean ventajas VIP, como ofertas de cashback, retiros prioritarios y acceso a torneos de alto nivel cada fin de semana. Ya sea que gires los carretes, te sientes en las mesas de blackjack o pruebes suerte en los juegos con crupier en vivo, esta oferta por tiempo limitado está pensada para maximizar tus ganancias y elevar cada momento de juego.',
    'content.promo.starsOutOf5': '{value} de 5',
    'content.promo.review1':
      'Unirse a la promoción fue fácil y el bono se acreditó al instante. Acabé ganando más de lo que esperaba.',
    'content.promo.review2':
      'Registro súper fluido. ¡El bono me alegró la semana! Muy recomendable.',
    'content.promo.review3':
      'No esperaba ganar, pero esta promoción realmente valió la pena. Y el abono fue instantáneo.',
    'content.promo.review4': 'Unirse fue sencillo y agradecí lo rápido que apareció el bono.',
    'content.promo.review5':
      'Una promoción genial con recompensas instantáneas. Mejoró mucho mi experiencia.',
    'content.promo.review6':
      'La facilidad para participar y la rapidez del bono la convirtieron en mi promoción favorita hasta ahora.',
    'content.promo.review7':
      '¡Rápido y fiable! El bono se acreditó enseguida y me ayudó a ganar a lo grande.',
    'content.promo.review8':
      'Una promoción sin complicaciones con bonos instantáneos. Acabé ganando más de lo esperado.',
    'content.promo.review9':
      'Proceso fluido y bono acreditado rápidamente. Sin duda volveré a participar la próxima vez.',
    'content.tournament.hidden': 'Oculto',
    'content.blogs.cat.inside': 'Rolluck por dentro',
    'content.blogs.cat.sportsbook': 'Apuestas deportivas',
    'content.blogs.cat.ambassadors': 'Embajadores',
    'content.blogs.cat.charity': 'Rolluck Solidario',
    'content.blogs.cat.crypto': 'Cripto',
    'content.blogs.post.title': 'Las peores probabilidades del casino: juegos que deberías evitar',
    'content.blogs.post.excerpt':
      'Conoce los juegos de casino con las peores probabilidades, como las tragamonedas, el keno y la rueda de la fortuna. Descubre qué juegos le dan a la casa una ventaja mayor.',
    'content.blogs.article.p1':
      'Los juegos de casino pueden ser divertidos, pero algunos ofrecen pésimas probabilidades de ganar. Quiero hablarte de las peores probabilidades en los juegos de casino para que tomes mejores decisiones con tu dinero. Las tragamonedas son la trampa más común. Tienen una ventaja de la casa de entre el 2% y el 15%. Aunque jugar a las tragamonedas es sencillo, no puedes usar ninguna estrategia para ganar. Los resultados son aleatorios y el casino siempre tiene ventaja.',
    'content.blogs.article.p2':
      'El keno ofrece a los jugadores las peores probabilidades. La ventaja de la casa va del 20% al 40%, lo que hace casi imposible ganar a largo plazo.\nEliges números del 1 al 80, pero las probabilidades están muy en tu contra. La rueda de la fortuna no es mucho mejor. Cuando apuestas a la casilla de $1, que parece la más segura, la casa sigue teniendo una ventaja del 11%.',
    'content.blogs.article.p3':
      'Apostar a la casilla del comodín es aún peor, con una ventaja de la casa del 24%. Si quieres mejores probabilidades de ganar, prueba juegos que requieran habilidad. Muchos jugadores que visitan casinos en línea prefieren juegos como el blackjack o el videopóker porque pueden usar estrategias para mejorar sus probabilidades.',
    'content.blogs.article.p4':
      'Recuerda que los casinos diseñan estos juegos para ganar dinero. Puede que tengas suerte y ganes a veces, pero la casa siempre tiene ventaja. Fija un presupuesto antes de jugar y respétalo.',
    'content.blogs.article.p5': 'Tu objetivo debe ser entretenerte, no ganar dinero.',
    'content.blogs.article.p6':
      'Lo mejor es jugar a los juegos que disfrutas, pero conociendo tus límites. Cuanto más tiempo juegues a juegos con malas probabilidades, más probable será que pierdas dinero.\nElige juegos que hagan que tu dinero dure más y te den más tiempo de juego por tu presupuesto.',
    'content.bonus.regular.furyWheel': 'Rueda Fury gratis',
    'content.bonus.regular.weeklySport': 'Bono deportivo semanal',
    'content.bonus.hours': '{count} h',
    'content.bonus.daysTime': '{days} d {time}',
    'content.role.superMaster': 'Superadministrador',
    'content.role.master': 'Administrador',
    'content.role.riskManagement': 'Gestión de riesgos',
    'content.role.accountant': 'Contable',
    'content.role.customerSupport': 'Atención al cliente',
    'content.role.marketing': 'Marketing',
    'content.role.partner': 'Socio',
    'content.role.riskManagementTrainee': 'Becario de gestión de riesgos',
  },
  it: {
    'content.sample.wagerRace': 'Gara di puntate Endorphina',
    'content.promo.clutchTitle': '$20,000 - Fai la differenza!',
    'content.promo.clutchBody':
      'Fai liquidare in anticipo le tue selezioni se la squadra su cui punti va in vantaggio di 2 gol',
    'content.promo.detailsBody':
      "Scopri la nostra promozione esclusiva del casinò, pensata per offrirti un valore imbattibile e premi entusiasmanti come mai prima d'ora. Approfitta di un generoso bonus di benvenuto fino al 200% sul tuo primo deposito, oltre a 50 giri gratuiti sulle nostre slot più popolari. I membri fedeli sbloccano vantaggi VIP, tra cui offerte di cashback, prelievi prioritari e accesso a tornei ad alta posta ogni fine settimana. Che tu stia facendo girare i rulli, sedendoti ai tavoli di blackjack o tentando la fortuna con i giochi con croupier dal vivo, questa offerta a tempo limitato è studiata per massimizzare le tue vincite e rendere speciale ogni momento di gioco.",
    'content.promo.starsOutOf5': '{value} su 5',
    'content.promo.review1':
      "Partecipare alla promozione è stato facile e il bonus è stato accreditato all'istante. Alla fine ho vinto più di quanto mi aspettassi.",
    'content.promo.review2':
      'Registrazione semplicissima. Il bonus mi ha svoltato la settimana! Lo consiglio vivamente.',
    'content.promo.review3':
      "Non mi aspettavo di vincere, ma questa promozione ha davvero dato i suoi frutti. E l'accredito è stato immediato.",
    'content.promo.review4':
      'Partecipare è stato semplice e ho apprezzato la rapidità con cui è arrivato il bonus.',
    'content.promo.review5':
      'Ottima promozione con premi immediati. Ha migliorato notevolmente la mia esperienza.',
    'content.promo.review6':
      "La facilità di partecipazione e l'accredito rapido del bonus l'hanno resa la mia promozione preferita finora.",
    'content.promo.review7':
      'Veloce e affidabile! Il bonus è stato accreditato subito e mi ha aiutato a vincere alla grande.',
    'content.promo.review8':
      'Una promozione senza intoppi con bonus immediati. Alla fine ho vinto più del previsto.',
    'content.promo.review9':
      'Procedura fluida e bonus accreditato rapidamente. Parteciperò sicuramente di nuovo la prossima volta.',
    'content.tournament.hidden': 'Nascosto',
    'content.blogs.cat.inside': 'Dentro Rolluck',
    'content.blogs.cat.sportsbook': 'Scommesse sportive',
    'content.blogs.cat.ambassadors': 'Ambasciatori',
    'content.blogs.cat.charity': 'Rolluck Solidale',
    'content.blogs.cat.crypto': 'Cripto',
    'content.blogs.post.title': 'Le quote peggiori del casinò: i giochi da evitare',
    'content.blogs.post.excerpt':
      'Scopri i giochi da casinò con le quote peggiori, tra cui slot, keno e ruota della fortuna. Individua quali giochi danno al banco un vantaggio maggiore.',
    'content.blogs.article.p1':
      'I giochi da casinò possono essere divertenti, ma alcuni offrono possibilità di vincita pessime. Voglio parlarti delle quote peggiori nei giochi da casinò, così potrai fare scelte migliori con i tuoi soldi. Le slot sono la trappola più comune. Hanno un vantaggio del banco compreso tra il 2% e il 15%. Anche se giocare alle slot è semplice, non puoi usare alcuna strategia per vincere. I risultati sono casuali e il casinò ha sempre il vantaggio.',
    'content.blogs.article.p2':
      "Il keno offre ai giocatori le possibilità peggiori. Il vantaggio del banco va dal 20% al 40%, il che rende quasi impossibile vincere nel lungo periodo.\nScegli numeri da 1 a 80, ma le probabilità sono nettamente contro di te. La ruota della fortuna non è molto meglio. Quando punti sulla casella da $1, che sembra la più sicura, il banco ha comunque un vantaggio dell'11%.",
    'content.blogs.article.p3':
      'Puntare sulla casella del jolly è ancora peggio, con un vantaggio del banco del 24%. Se vuoi maggiori possibilità di vincita, prova giochi che richiedono abilità. Molti giocatori che frequentano i casinò online preferiscono giochi come il blackjack o il video poker, perché possono usare una strategia per migliorare le proprie probabilità.',
    'content.blogs.article.p4':
      'Ricorda che i casinò progettano questi giochi per guadagnare. Potresti essere fortunato e vincere ogni tanto, ma il banco ha sempre il vantaggio. Stabilisci un budget prima di giocare e rispettalo.',
    'content.blogs.article.p5':
      'Il tuo obiettivo dovrebbe essere il divertimento, non guadagnare soldi.',
    'content.blogs.article.p6':
      "L'approccio migliore è giocare ai giochi che ti piacciono, ma conoscendo i tuoi limiti. Più a lungo giochi a giochi con quote sfavorevoli, più è probabile che tu perda denaro.\nScegli giochi che facciano durare di più i tuoi soldi e ti offrano più tempo di gioco per il tuo budget.",
    'content.bonus.regular.furyWheel': 'Ruota Fury gratuita',
    'content.bonus.regular.weeklySport': 'Bonus sport settimanale',
    'content.bonus.hours': '{count} h',
    'content.bonus.daysTime': '{days} g {time}',
    'content.role.superMaster': 'Super amministratore',
    'content.role.master': 'Amministratore',
    'content.role.riskManagement': 'Gestione del rischio',
    'content.role.accountant': 'Contabile',
    'content.role.customerSupport': 'Assistenza clienti',
    'content.role.marketing': 'Marketing',
    'content.role.partner': 'Partner',
    'content.role.riskManagementTrainee': 'Tirocinante gestione del rischio',
  },
};
