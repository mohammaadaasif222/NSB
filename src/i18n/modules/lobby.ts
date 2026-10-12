import type { ModuleDict } from './types';

/**
 * The lobby and everything around it: the landing hero, the rail, the header
 * trays, the footer, the sportsbook and the illustrative sample rows.
 */
export const en = {
  // Lobby hero (signed out)
  'lobby.hero.title': 'READY TO ROLL YOUR LUCK',
  'lobby.hero.dialCode': 'Country calling code',
  'lobby.hero.continueWith': 'Continue with {method}',
  'lobby.hero.continueWithEmail': 'Continue with Email',
  'lobby.hero.moreOptions': 'More options',
  'lobby.hero.todaysWinnings': "{amount} Today's Winnings",
  'lobby.hero.biggestWin': '{amount} Biggest Win',
  'lobby.hero.trustPrivacy': 'Complete Privacy',
  'lobby.hero.trustFair': 'Provably Fair',
  'lobby.hero.trustWithdrawals': 'Instant Withdrawals',
  'lobby.hero.casinoSubtitle': 'Slots, live tables and 12 Rolluck Originals',
  'lobby.hero.sportsSubtitle': 'Football, Tennis, Basketball and 12 other sports',

  // Welcome-offer banner
  'lobby.bonus.eyebrow': 'Limited-time offer',
  'lobby.bonus.promoCode': 'Promo code: {code}',
  'lobby.bonus.copy': 'Copy {code}',

  // Lobby FAQ (sample copy pending compliance sign-off)
  'lobby.faq.q1': 'What types of casino games are available on your platform?',
  'lobby.faq.a1':
    "Our platform offers a wide variety of casino games designed to suit every player's preference and skill level. You can explore an extensive collection of classic and modern slot machines featuring stunning graphics and exciting bonus rounds. Table game enthusiasts can enjoy timeless favorites like blackjack, roulette, baccarat, and poker in multiple variations. We also feature a thrilling live dealer section where you can interact with professional dealers in real time. For those who love instant wins, our selection includes scratch cards, keno, and virtual lottery-style games. Progressive jackpot games are available across slots and table games, offering life-changing prize pools. Video poker fans can choose from dozens of variants including Jacks or Better and Deuces Wild.",
  'lobby.faq.q2': 'How do I claim my welcome bonus after signing up?',
  'lobby.faq.a2':
    'Your welcome package is attached to your account the moment registration completes — there is nothing to redeem by hand. Make your first deposit and the matched amount plus the free spins are credited automatically, with the promo code applied if you entered one on the lobby banner. Progress toward the wagering requirement is shown on your dashboard, and the bonus balance converts to withdrawable funds as soon as that requirement is met. Bonus funds are always spent after your real balance, so you are never wagering the bonus while cash is available.',
  'lobby.faq.q3': 'What payment methods are accepted for deposits and withdrawals?',
  'lobby.faq.a3':
    'Deposits and withdrawals are available through major cards, popular e-wallets and a range of cryptocurrencies. Every method your account is eligible for is listed in the wallet once you are signed in, along with its minimum, maximum and expected clearing time. Crypto deposits credit after the network confirmations shown on the deposit screen; card and wallet payments are usually instant. Withdrawals return to the method you deposited with wherever the payment provider requires it.',
  'lobby.faq.q4': 'Is my personal and financial information kept secure?',
  'lobby.faq.a4':
    'All traffic between your device and our servers is encrypted in transit, and payment details are handled by our payment partners rather than stored on our systems. Account access can be protected with two-factor authentication from your security settings, and every sign-in and withdrawal generates a notification so an unfamiliar session is easy to spot. We only ask for the identity documents our licence obliges us to collect, and those are retained no longer than the licence requires.',
  'lobby.faq.q5': 'How long does it take to process a withdrawal request?',
  'lobby.faq.a5':
    'Most withdrawals are reviewed and approved within a few hours of being requested. Once approved, how quickly the money reaches you depends on the method: crypto typically lands within minutes of the transaction being broadcast, e-wallets the same day, and card refunds within a few business days depending on your issuer. A first withdrawal may take longer if identity verification has not yet been completed — clearing that once keeps every later payout on the fast path.',
  'lobby.faq.q6': 'Are your games provably fair and independently audited?',
  'lobby.faq.a6':
    "Rolluck Originals are provably fair: every round is generated from a server seed, your own client seed and a nonce, and you can change your client seed and verify any past round yourself from the game screen. Third-party titles use the studio's own certified random number generators, which are tested by independent laboratories, and each provider's return-to-player figure is published on the game's detail page.",

  // Category rail
  'lobby.rail.welcomeTitle': 'Welcome package — {amount} + {count} free spins',
  'lobby.rail.welcomePackage': 'Welcome package',
  'lobby.rail.freeSpins': '+ {count} free spins',
  'lobby.rail.joinTelegram': 'Join Telegram',
  'lobby.rail.suggestionBox': 'Suggestion Box',

  // Site footer
  'lobby.footer.contactQuestions': 'Questions',
  'lobby.footer.contactBugBounty': 'Bug bounty reports',
  'lobby.footer.contactPartner': 'Become a partner',
  'lobby.footer.contactMarketing': 'Marketing',
  'lobby.footer.providers': 'Providers',
  'lobby.footer.live': 'Live',
  'lobby.footer.drops': 'Rolluck Drops',
  'lobby.footer.referral': 'Referral System',
  'lobby.footer.affiliate': 'Affiliate System',
  'lobby.footer.swapCrypto': 'Swap Crypto',
  'lobby.footer.reportBug': 'Report Bug',
  'lobby.footer.privacy': 'Privacy Policy',
  'lobby.footer.terms': 'Terms of Service',
  'lobby.footer.sportsTerms': 'Sports Betting T&C',
  'lobby.footer.earn': 'Earn',
  'lobby.footer.help': 'Help',
  'lobby.footer.other': 'Other',
  'lobby.footer.playResponsibly': 'Play Responsibly',
  'lobby.footer.securePayments': 'Safe & Secure Payments',
  'lobby.footer.securityPriority': 'Your security is our priority',
  'lobby.footer.backToTop': 'Back to top',
  'lobby.footer.copyright': 'Copyright © {year} Rolluck. All rights reserved.',

  // Sport names
  'lobby.sport.soccer': 'Soccer',
  'lobby.sport.tennis': 'Tennis',
  'lobby.sport.basketball': 'Basketball',
  'lobby.sport.counterStrike': 'Counter-Strike',
  'lobby.sport.football': 'Football',
  'lobby.sport.americanFootball': 'Football',
  'lobby.sport.esports': 'Esports',
  'lobby.sport.cs2': 'CS2',
  'lobby.sport.fifa': 'FIFA',
  'lobby.sport.cricket': 'Cricket',
  'lobby.sport.tableTennis': 'Table Tennis',
  'lobby.sport.valorant': 'Valorant',
  'lobby.sport.chess': 'Chess',
  'lobby.sport.dota2': 'Dota 2',
  'lobby.sport.lol': 'League of Legends',
  'lobby.sport.golf': 'Golf',
  'lobby.sport.live': 'Live',
  'lobby.sport.boxing': 'Boxing',
  'lobby.sport.iceHockey': 'Ice Hockey',
  'lobby.sport.volleyball': 'Volleyball',
  'lobby.sport.wrestling': 'Wrestling',
  'lobby.sport.sportsbook': 'Sportsbook',
  'lobby.sport.mma': 'MMA',
  'lobby.sport.horseRacing': 'Horse Racing',
  'lobby.sport.baseball': 'Baseball',
  'lobby.sport.hockey': 'Hockey',

  // Sportsbook
  'lobby.sports.liveGames': 'Live Games',
  'lobby.sports.england': 'England',
  'lobby.sports.thirdQuarter': '3rd Quarter',

  // Crash preview
  'lobby.crash.currentPayout': 'CURRENT PAYOUT',
  'lobby.crash.playing': '{count} playing',
  'lobby.crash.autoCashout': 'Auto Cashout',
  'lobby.crash.autoCashoutHint': 'Optional multiplier limit',
  'lobby.crash.autoCashoutMultiplier': 'Auto cashout multiplier',
  'lobby.crash.clearAutoCashout': 'Clear auto cashout',
  'lobby.crash.winOnCashout': 'Win on cashout:',
  'lobby.crash.networkFee': 'Network fee:',

  // Streamers row
  'lobby.streams.freeSpinsBlurb': 'Free spins on {game} at {amount} a spin.',
  'lobby.streams.autoSpinBlurb': 'Auto-spinning {game} at {amount} a spin.',
  'lobby.streams.alt': '{name} streaming {game}',
  'lobby.streams.paused': 'Paused',
  'lobby.streams.open': 'Open stream',
  'lobby.streams.share': 'Share',

  // Header balance menu
  'lobby.balance.label': 'Wallet balance',
  'lobby.balance.displayingIn': 'Displaying currency in {currency}',
  'lobby.balance.walletSettings': 'Wallet Settings',

  // Support chat tray
  'lobby.chat.soon': 'Live chat with our support team is coming soon.',
  'lobby.chat.placeholder': 'Your message…',
  'lobby.chat.message': 'Your message',

  // Notification centre
  'lobby.notices.platform': 'Platform',
  'lobby.notices.personal': 'Personal',
  'lobby.notices.personalEmpty': 'You have no personal notifications yet.',
  'lobby.notices.fifaTitle': "Enter FIFA Fury World Cup '26",
  'lobby.notices.fifaBody':
    'The biggest football event in history is live! A massive $600 000 prize pool awaits you on the tournament board.',

  // Casino category chips
  'lobby.chips.blackjack': 'Blackjack',
  'lobby.chips.roulette': 'Roulette',
  'lobby.chips.baccarat': 'Baccarat',
  'lobby.chips.gameShows': 'Game Shows',
  'lobby.chips.boostedRtp': 'Boosted RTP',
  'lobby.chips.newArrivals': 'New Arrivals',

  // Tournaments shelf
  'lobby.tournaments.wagerRace': '{provider} Wager Race',

  // Recent winners
  'lobby.winners.title': 'Recent Winners',
  'lobby.winners.liveBets': 'Live Bets',
  'lobby.winners.activeWins': 'Active wins',
  'lobby.winners.allBets': 'All bets',
  'lobby.winners.casinoWins': 'Casino wins',
  'lobby.winners.casinoBets': 'Casino bets',
  'lobby.winners.sportsBets': 'Sports bets',
  'lobby.winners.cardTitle': '{user} won {payout} on {game}',

  // Rewards tray raffle card
  'lobby.raffle.title': '{amount} WEEKLY RAFFLE',
  'lobby.raffle.active': 'Raffle Entry Active',

  // Game pages
  'lobby.game.breadcrumb': 'Breadcrumb',
} as const;

export const translations: ModuleDict<typeof en> = {
  ar: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'هل أنت مستعد لتجربة حظك',
    'lobby.hero.dialCode': 'رمز الاتصال الدولي',
    'lobby.hero.continueWith': 'المتابعة باستخدام {method}',
    'lobby.hero.continueWithEmail': 'المتابعة بالبريد الإلكتروني',
    'lobby.hero.moreOptions': 'خيارات أخرى',
    'lobby.hero.todaysWinnings': 'أرباح اليوم {amount}',
    'lobby.hero.biggestWin': 'أكبر ربح {amount}',
    'lobby.hero.trustPrivacy': 'خصوصية تامة',
    'lobby.hero.trustFair': 'عدالة قابلة للإثبات',
    'lobby.hero.trustWithdrawals': 'سحب فوري',
    'lobby.hero.casinoSubtitle': 'ماكينات سلوت وطاولات مباشرة و12 لعبة من Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'كرة القدم والتنس وكرة السلة و12 رياضة أخرى',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'عرض لفترة محدودة',
    'lobby.bonus.promoCode': 'رمز العرض: {code}',
    'lobby.bonus.copy': 'نسخ {code}',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'ما أنواع ألعاب الكازينو المتوفرة على منصتكم؟',
    'lobby.faq.a1':
      'تقدم منصتنا تشكيلة واسعة من ألعاب الكازينو المصممة لتناسب تفضيلات كل لاعب ومستوى مهارته. يمكنك استكشاف مجموعة كبيرة من ماكينات السلوت الكلاسيكية والحديثة بتصاميم رائعة وجولات مكافآت مثيرة. ويستمتع محبو ألعاب الطاولة بالمفضلات الخالدة مثل البلاك جاك والروليت والباكارات والبوكر بعدة أشكال. كما نقدم قسمًا مثيرًا للموزعين المباشرين حيث يمكنك التفاعل مع موزعين محترفين في الوقت الفعلي. ولمحبي الأرباح الفورية، تضم تشكيلتنا بطاقات الخدش والكينو وألعابًا افتراضية على طراز اليانصيب. وتتوفر ألعاب الجاكبوت التصاعدي في ماكينات السلوت وألعاب الطاولة، مع جوائز قادرة على تغيير الحياة. ويمكن لعشاق الفيديو بوكر الاختيار من بين عشرات الأنواع، منها Jacks or Better وDeuces Wild.',
    'lobby.faq.q2': 'كيف أحصل على مكافأة الترحيب بعد التسجيل؟',
    'lobby.faq.a2':
      'تُضاف باقة الترحيب إلى حسابك فور اكتمال التسجيل، فلا حاجة لاستردادها يدويًا. قم بإيداعك الأول وسيُضاف المبلغ المطابق والدورات المجانية تلقائيًا، مع تطبيق رمز العرض إن كنت قد أدخلته في لافتة الردهة. يظهر تقدمك نحو شرط الرهان في لوحة التحكم، ويتحول رصيد المكافأة إلى أموال قابلة للسحب بمجرد استيفاء هذا الشرط. تُستخدم أموال المكافأة دائمًا بعد رصيدك الحقيقي، فلا تراهن أبدًا بالمكافأة ما دام لديك رصيد نقدي.',
    'lobby.faq.q3': 'ما طرق الدفع المقبولة للإيداع والسحب؟',
    'lobby.faq.a3':
      'تتوفر الإيداعات والسحوبات عبر البطاقات الرئيسية والمحافظ الإلكترونية الشائعة ومجموعة من العملات المشفرة. تُعرض كل طريقة يحق لحسابك استخدامها في المحفظة بعد تسجيل الدخول، مع حدها الأدنى والأقصى ومدة المعالجة المتوقعة. تُضاف إيداعات العملات المشفرة بعد تأكيدات الشبكة الموضحة في شاشة الإيداع، أما مدفوعات البطاقات والمحافظ فعادةً ما تكون فورية. وتُعاد السحوبات إلى الطريقة التي أودعت بها متى ما اشترط مزود الدفع ذلك.',
    'lobby.faq.q4': 'هل معلوماتي الشخصية والمالية محفوظة بأمان؟',
    'lobby.faq.a4':
      'جميع البيانات المتبادلة بين جهازك وخوادمنا مشفرة أثناء النقل، ويتولى شركاؤنا في الدفع معالجة تفاصيل الدفع بدلًا من تخزينها على أنظمتنا. يمكنك حماية الوصول إلى حسابك بالمصادقة الثنائية من إعدادات الأمان، وكل عملية تسجيل دخول أو سحب تُنشئ إشعارًا لتسهيل اكتشاف أي جلسة غير مألوفة. لا نطلب إلا وثائق الهوية التي يلزمنا ترخيصنا بجمعها، ولا نحتفظ بها لمدة أطول مما يتطلبه الترخيص.',
    'lobby.faq.q5': 'كم تستغرق معالجة طلب السحب؟',
    'lobby.faq.a5':
      'تُراجع معظم السحوبات ويُوافق عليها خلال ساعات قليلة من تقديم الطلب. بعد الموافقة، تعتمد سرعة وصول الأموال إليك على الطريقة: تصل العملات المشفرة عادةً خلال دقائق من بث المعاملة، والمحافظ الإلكترونية في اليوم نفسه، واسترداد البطاقات خلال بضعة أيام عمل حسب الجهة المصدرة. قد يستغرق السحب الأول وقتًا أطول إذا لم يكتمل التحقق من الهوية بعد، وإتمامه مرة واحدة يجعل كل مدفوعاتك اللاحقة سريعة.',
    'lobby.faq.q6': 'هل ألعابكم عادلة بشكل قابل للإثبات وخاضعة لتدقيق مستقل؟',
    'lobby.faq.a6':
      'ألعاب Rolluck Originals عادلة بشكل قابل للإثبات: تُولَّد كل جولة من بذرة الخادم وبذرة العميل الخاصة بك ورقم nonce، ويمكنك تغيير بذرة العميل والتحقق بنفسك من أي جولة سابقة من شاشة اللعبة. أما ألعاب الجهات الخارجية فتستخدم مولدات الأرقام العشوائية المعتمدة الخاصة بالاستوديو، والتي تختبرها مختبرات مستقلة، وتُنشر نسبة العائد للاعب لكل مزود في صفحة تفاصيل اللعبة.',

    // Category rail
    'lobby.rail.welcomeTitle': 'باقة الترحيب — {amount} + {count} دورة مجانية',
    'lobby.rail.welcomePackage': 'باقة الترحيب',
    'lobby.rail.freeSpins': '+ {count} دورة مجانية',
    'lobby.rail.joinTelegram': 'انضم إلى Telegram',
    'lobby.rail.suggestionBox': 'صندوق الاقتراحات',

    // Site footer
    'lobby.footer.contactQuestions': 'الأسئلة',
    'lobby.footer.contactBugBounty': 'تقارير مكافآت الثغرات',
    'lobby.footer.contactPartner': 'كن شريكًا',
    'lobby.footer.contactMarketing': 'التسويق',
    'lobby.footer.providers': 'المزودون',
    'lobby.footer.live': 'مباشر',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'نظام الإحالة',
    'lobby.footer.affiliate': 'نظام التسويق بالعمولة',
    'lobby.footer.swapCrypto': 'تبديل العملات المشفرة',
    'lobby.footer.reportBug': 'الإبلاغ عن خطأ',
    'lobby.footer.privacy': 'سياسة الخصوصية',
    'lobby.footer.terms': 'شروط الخدمة',
    'lobby.footer.sportsTerms': 'شروط وأحكام المراهنات الرياضية',
    'lobby.footer.earn': 'اربح',
    'lobby.footer.help': 'المساعدة',
    'lobby.footer.other': 'أخرى',
    'lobby.footer.playResponsibly': 'العب بمسؤولية',
    'lobby.footer.securePayments': 'مدفوعات آمنة ومحمية',
    'lobby.footer.securityPriority': 'أمانك أولويتنا',
    'lobby.footer.backToTop': 'العودة إلى الأعلى',
    'lobby.footer.copyright': 'حقوق النشر © {year} Rolluck. جميع الحقوق محفوظة.',

    // Sport names
    'lobby.sport.soccer': 'كرة القدم',
    'lobby.sport.tennis': 'التنس',
    'lobby.sport.basketball': 'كرة السلة',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'كرة القدم',
    'lobby.sport.americanFootball': 'كرة القدم الأمريكية',
    'lobby.sport.esports': 'الرياضات الإلكترونية',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'الكريكيت',
    'lobby.sport.tableTennis': 'تنس الطاولة',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'الشطرنج',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'الغولف',
    'lobby.sport.live': 'مباشر',
    'lobby.sport.boxing': 'الملاكمة',
    'lobby.sport.iceHockey': 'هوكي الجليد',
    'lobby.sport.volleyball': 'الكرة الطائرة',
    'lobby.sport.wrestling': 'المصارعة',
    'lobby.sport.sportsbook': 'المراهنات الرياضية',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'سباق الخيل',
    'lobby.sport.baseball': 'البيسبول',
    'lobby.sport.hockey': 'الهوكي',

    // Sportsbook
    'lobby.sports.liveGames': 'المباريات المباشرة',
    'lobby.sports.england': 'إنجلترا',
    'lobby.sports.thirdQuarter': 'الربع الثالث',

    // Crash preview
    'lobby.crash.currentPayout': 'العائد الحالي',
    'lobby.crash.playing': '{count} يلعبون الآن',
    'lobby.crash.autoCashout': 'السحب التلقائي',
    'lobby.crash.autoCashoutHint': 'حد مضاعف اختياري',
    'lobby.crash.autoCashoutMultiplier': 'مضاعف السحب التلقائي',
    'lobby.crash.clearAutoCashout': 'مسح السحب التلقائي',
    'lobby.crash.winOnCashout': 'الربح عند السحب:',
    'lobby.crash.networkFee': 'رسوم الشبكة:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': 'دورات مجانية على {game} بقيمة {amount} للدورة.',
    'lobby.streams.autoSpinBlurb': 'دورات تلقائية على {game} بقيمة {amount} للدورة.',
    'lobby.streams.alt': '{name} يبث {game}',
    'lobby.streams.paused': 'متوقف مؤقتًا',
    'lobby.streams.open': 'فتح البث',
    'lobby.streams.share': 'مشاركة',

    // Header balance menu
    'lobby.balance.label': 'رصيد المحفظة',
    'lobby.balance.displayingIn': 'يتم عرض العملة بـ {currency}',
    'lobby.balance.walletSettings': 'إعدادات المحفظة',

    // Support chat tray
    'lobby.chat.soon': 'الدردشة المباشرة مع فريق الدعم ستتوفر قريبًا.',
    'lobby.chat.placeholder': 'رسالتك…',
    'lobby.chat.message': 'رسالتك',

    // Notification centre
    'lobby.notices.platform': 'المنصة',
    'lobby.notices.personal': 'شخصية',
    'lobby.notices.personalEmpty': 'ليست لديك إشعارات شخصية بعد.',
    'lobby.notices.fifaTitle': "شارك في FIFA Fury World Cup '26",
    'lobby.notices.fifaBody':
      'أكبر حدث كروي في التاريخ انطلق! جائزة ضخمة بقيمة $600 000 بانتظارك على لوحة البطولة.',

    // Casino category chips
    'lobby.chips.blackjack': 'بلاك جاك',
    'lobby.chips.roulette': 'روليت',
    'lobby.chips.baccarat': 'باكارات',
    'lobby.chips.gameShows': 'عروض الألعاب',
    'lobby.chips.boostedRtp': 'RTP معزز',
    'lobby.chips.newArrivals': 'وصل حديثًا',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': 'سباق رهانات {provider}',

    // Recent winners
    'lobby.winners.title': 'أحدث الفائزين',
    'lobby.winners.liveBets': 'رهانات مباشرة',
    'lobby.winners.activeWins': 'أرباح نشطة',
    'lobby.winners.allBets': 'كل الرهانات',
    'lobby.winners.casinoWins': 'أرباح الكازينو',
    'lobby.winners.casinoBets': 'رهانات الكازينو',
    'lobby.winners.sportsBets': 'الرهانات الرياضية',
    'lobby.winners.cardTitle': '{user} ربح {payout} في {game}',

    // Rewards tray raffle card
    'lobby.raffle.title': 'سحب أسبوعي بقيمة {amount}',
    'lobby.raffle.active': 'مشاركتك في السحب فعّالة',

    // Game pages
    'lobby.game.breadcrumb': 'مسار التنقل',
  },
  tr: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'ŞANSINI DENEMEYE HAZIR MISIN',
    'lobby.hero.dialCode': 'Ülke telefon kodu',
    'lobby.hero.continueWith': '{method} ile devam et',
    'lobby.hero.continueWithEmail': 'E-posta ile devam et',
    'lobby.hero.moreOptions': 'Diğer seçenekler',
    'lobby.hero.todaysWinnings': 'Bugünkü kazançlar {amount}',
    'lobby.hero.biggestWin': 'En büyük kazanç {amount}',
    'lobby.hero.trustPrivacy': 'Tam gizlilik',
    'lobby.hero.trustFair': 'Kanıtlanabilir adillik',
    'lobby.hero.trustWithdrawals': 'Anında para çekme',
    'lobby.hero.casinoSubtitle': 'Slotlar, canlı masalar ve 12 Rolluck Originals oyunu',
    'lobby.hero.sportsSubtitle': 'Futbol, tenis, basketbol ve 12 spor dalı daha',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'Sınırlı süreli teklif',
    'lobby.bonus.promoCode': 'Promosyon kodu: {code}',
    'lobby.bonus.copy': '{code} kodunu kopyala',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'Platformunuzda hangi tür casino oyunları var?',
    'lobby.faq.a1':
      'Platformumuz, her oyuncunun tercihine ve beceri düzeyine uygun geniş bir casino oyunu yelpazesi sunar. Göz alıcı grafiklere ve heyecan verici bonus turlarına sahip klasik ve modern slot makinelerinden oluşan geniş bir koleksiyonu keşfedebilirsiniz. Masa oyunu tutkunları blackjack, rulet, bakara ve poker gibi zamansız favorileri birçok farklı varyasyonda oynayabilir. Ayrıca profesyonel krupiyelerle gerçek zamanlı etkileşim kurabileceğiniz heyecan dolu bir canlı krupiye bölümümüz de var. Anında kazancı sevenler için kazı kazanlar, keno ve sanal piyango tarzı oyunlar sunuyoruz. Progresif jackpot oyunları, slotlarda ve masa oyunlarında hayat değiştiren ödül havuzlarıyla mevcuttur. Video poker hayranları ise Jacks or Better ve Deuces Wild dahil onlarca varyant arasından seçim yapabilir.',
    'lobby.faq.q2': 'Kayıt olduktan sonra hoş geldin bonusumu nasıl alırım?',
    'lobby.faq.a2':
      'Hoş geldin paketiniz, kayıt tamamlandığı anda hesabınıza tanımlanır; elle kullanmanız gereken bir şey yoktur. İlk yatırımınızı yaptığınızda eşleşen tutar ve bedava dönüşler otomatik olarak yüklenir; lobi bannerında bir promosyon kodu girdiyseniz o da uygulanır. Çevrim şartındaki ilerlemeniz panonuzda gösterilir ve bu şart karşılandığı anda bonus bakiyeniz çekilebilir bakiyeye dönüşür. Bonus bakiye her zaman gerçek bakiyenizden sonra harcanır; yani nakit bakiyeniz varken asla bonusla bahis yapmazsınız.',
    'lobby.faq.q3': 'Para yatırma ve çekme için hangi ödeme yöntemleri kabul ediliyor?',
    'lobby.faq.a3':
      'Para yatırma ve çekme işlemleri büyük kart markaları, popüler e-cüzdanlar ve çeşitli kripto paralarla yapılabilir. Hesabınızın kullanabileceği tüm yöntemler, giriş yaptıktan sonra cüzdanda alt ve üst limitleri ile tahmini işlem süreleriyle birlikte listelenir. Kripto yatırımları, yatırma ekranında gösterilen ağ onaylarından sonra hesaba geçer; kart ve cüzdan ödemeleri genellikle anında gerçekleşir. Ödeme sağlayıcısının gerektirdiği durumlarda çekimler, yatırım yaptığınız yönteme iade edilir.',
    'lobby.faq.q4': 'Kişisel ve finansal bilgilerim güvende mi?',
    'lobby.faq.a4':
      'Cihazınız ile sunucularımız arasındaki tüm trafik aktarım sırasında şifrelenir ve ödeme bilgileri sistemlerimizde saklanmak yerine ödeme ortaklarımız tarafından işlenir. Hesap erişiminizi güvenlik ayarlarınızdan iki adımlı doğrulamayla koruyabilirsiniz; her giriş ve para çekme işlemi bir bildirim oluşturur, böylece tanımadığınız bir oturumu kolayca fark edersiniz. Yalnızca lisansımızın toplamamızı zorunlu kıldığı kimlik belgelerini isteriz ve bunları lisansın gerektirdiğinden daha uzun süre saklamayız.',
    'lobby.faq.q5': 'Para çekme talebinin işlenmesi ne kadar sürer?',
    'lobby.faq.a5':
      'Çoğu para çekme talebi, yapıldıktan sonraki birkaç saat içinde incelenip onaylanır. Onaydan sonra paranın size ne kadar hızlı ulaşacağı yönteme bağlıdır: kripto genellikle işlem yayınlandıktan birkaç dakika sonra, e-cüzdanlar aynı gün, kart iadeleri ise kartı veren kuruluşa bağlı olarak birkaç iş günü içinde ulaşır. Kimlik doğrulaması henüz tamamlanmadıysa ilk çekim daha uzun sürebilir; bunu bir kez tamamlamak sonraki tüm ödemelerin hızlı ilerlemesini sağlar.',
    'lobby.faq.q6': 'Oyunlarınız kanıtlanabilir şekilde adil ve bağımsız olarak denetleniyor mu?',
    'lobby.faq.a6':
      "Rolluck Originals kanıtlanabilir şekilde adildir: her tur bir sunucu seed'i, size ait bir istemci seed'i ve bir nonce kullanılarak üretilir; istemci seed'inizi değiştirebilir ve geçmiş herhangi bir turu oyun ekranından kendiniz doğrulayabilirsiniz. Üçüncü taraf oyunlar, stüdyonun bağımsız laboratuvarlarca test edilen sertifikalı rastgele sayı üreteçlerini kullanır ve her sağlayıcının oyuncuya geri dönüş (RTP) oranı oyunun ayrıntı sayfasında yayımlanır.",

    // Category rail
    'lobby.rail.welcomeTitle': 'Hoş geldin paketi — {amount} + {count} bedava dönüş',
    'lobby.rail.welcomePackage': 'Hoş geldin paketi',
    'lobby.rail.freeSpins': '+ {count} bedava dönüş',
    'lobby.rail.joinTelegram': "Telegram'a katıl",
    'lobby.rail.suggestionBox': 'Öneri kutusu',

    // Site footer
    'lobby.footer.contactQuestions': 'Sorular',
    'lobby.footer.contactBugBounty': 'Hata ödülü raporları',
    'lobby.footer.contactPartner': 'Ortağımız olun',
    'lobby.footer.contactMarketing': 'Pazarlama',
    'lobby.footer.providers': 'Sağlayıcılar',
    'lobby.footer.live': 'Canlı',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'Referans sistemi',
    'lobby.footer.affiliate': 'Satış ortaklığı sistemi',
    'lobby.footer.swapCrypto': 'Kripto takası',
    'lobby.footer.reportBug': 'Hata bildir',
    'lobby.footer.privacy': 'Gizlilik Politikası',
    'lobby.footer.terms': 'Hizmet Şartları',
    'lobby.footer.sportsTerms': 'Spor bahisleri şartları',
    'lobby.footer.earn': 'Kazan',
    'lobby.footer.help': 'Yardım',
    'lobby.footer.other': 'Diğer',
    'lobby.footer.playResponsibly': 'Sorumlu oynayın',
    'lobby.footer.securePayments': 'Güvenli ödemeler',
    'lobby.footer.securityPriority': 'Güvenliğiniz önceliğimizdir',
    'lobby.footer.backToTop': 'Başa dön',
    'lobby.footer.copyright': 'Telif hakkı © {year} Rolluck. Tüm hakları saklıdır.',

    // Sport names
    'lobby.sport.soccer': 'Futbol',
    'lobby.sport.tennis': 'Tenis',
    'lobby.sport.basketball': 'Basketbol',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'Futbol',
    'lobby.sport.americanFootball': 'Amerikan futbolu',
    'lobby.sport.esports': 'E-spor',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'Kriket',
    'lobby.sport.tableTennis': 'Masa tenisi',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'Satranç',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'Golf',
    'lobby.sport.live': 'Canlı',
    'lobby.sport.boxing': 'Boks',
    'lobby.sport.iceHockey': 'Buz hokeyi',
    'lobby.sport.volleyball': 'Voleybol',
    'lobby.sport.wrestling': 'Güreş',
    'lobby.sport.sportsbook': 'Spor bahisleri',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'At yarışı',
    'lobby.sport.baseball': 'Beyzbol',
    'lobby.sport.hockey': 'Hokey',

    // Sportsbook
    'lobby.sports.liveGames': 'Canlı maçlar',
    'lobby.sports.england': 'İngiltere',
    'lobby.sports.thirdQuarter': '3. çeyrek',

    // Crash preview
    'lobby.crash.currentPayout': 'GÜNCEL ÖDEME',
    'lobby.crash.playing': '{count} kişi oynuyor',
    'lobby.crash.autoCashout': 'Otomatik nakit çekme',
    'lobby.crash.autoCashoutHint': 'İsteğe bağlı çarpan sınırı',
    'lobby.crash.autoCashoutMultiplier': 'Otomatik nakit çekme çarpanı',
    'lobby.crash.clearAutoCashout': 'Otomatik nakit çekmeyi temizle',
    'lobby.crash.winOnCashout': 'Nakit çekmede kazanç:',
    'lobby.crash.networkFee': 'Ağ ücreti:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': '{game} oyununda dönüş başı {amount} bedava dönüşler.',
    'lobby.streams.autoSpinBlurb': '{game} oyununda dönüş başı {amount} ile otomatik dönüş.',
    'lobby.streams.alt': '{name}, {game} yayını yapıyor',
    'lobby.streams.paused': 'Duraklatıldı',
    'lobby.streams.open': 'Yayını aç',
    'lobby.streams.share': 'Paylaş',

    // Header balance menu
    'lobby.balance.label': 'Cüzdan bakiyesi',
    'lobby.balance.displayingIn': 'Para birimi {currency} olarak gösteriliyor',
    'lobby.balance.walletSettings': 'Cüzdan ayarları',

    // Support chat tray
    'lobby.chat.soon': 'Destek ekibimizle canlı sohbet çok yakında.',
    'lobby.chat.placeholder': 'Mesajınız…',
    'lobby.chat.message': 'Mesajınız',

    // Notification centre
    'lobby.notices.platform': 'Platform',
    'lobby.notices.personal': 'Kişisel',
    'lobby.notices.personalEmpty': 'Henüz kişisel bildiriminiz yok.',
    'lobby.notices.fifaTitle': "FIFA Fury World Cup '26'ya katıl",
    'lobby.notices.fifaBody':
      "Tarihin en büyük futbol etkinliği başladı! Turnuva tablosunda dev bir $600 000'lık ödül havuzu sizi bekliyor.",

    // Casino category chips
    'lobby.chips.blackjack': 'Blackjack',
    'lobby.chips.roulette': 'Rulet',
    'lobby.chips.baccarat': 'Bakara',
    'lobby.chips.gameShows': 'Oyun şovları',
    'lobby.chips.boostedRtp': 'Yükseltilmiş RTP',
    'lobby.chips.newArrivals': 'Yeni gelenler',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': '{provider} Bahis Yarışı',

    // Recent winners
    'lobby.winners.title': 'Son kazananlar',
    'lobby.winners.liveBets': 'Canlı bahisler',
    'lobby.winners.activeWins': 'Aktif kazançlar',
    'lobby.winners.allBets': 'Tüm bahisler',
    'lobby.winners.casinoWins': 'Casino kazançları',
    'lobby.winners.casinoBets': 'Casino bahisleri',
    'lobby.winners.sportsBets': 'Spor bahisleri',
    'lobby.winners.cardTitle': '{user}, {game} oyununda {payout} kazandı',

    // Rewards tray raffle card
    'lobby.raffle.title': '{amount} HAFTALIK ÇEKİLİŞ',
    'lobby.raffle.active': 'Çekiliş katılımı aktif',

    // Game pages
    'lobby.game.breadcrumb': 'İçerik haritası',
  },
  hi: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'अपनी किस्मत आज़माने के लिए तैयार',
    'lobby.hero.dialCode': 'देश का कॉलिंग कोड',
    'lobby.hero.continueWith': '{method} के साथ जारी रखें',
    'lobby.hero.continueWithEmail': 'ईमेल के साथ जारी रखें',
    'lobby.hero.moreOptions': 'अन्य विकल्प',
    'lobby.hero.todaysWinnings': 'आज की जीत {amount}',
    'lobby.hero.biggestWin': 'सबसे बड़ी जीत {amount}',
    'lobby.hero.trustPrivacy': 'पूरी गोपनीयता',
    'lobby.hero.trustFair': 'प्रमाणित रूप से निष्पक्ष',
    'lobby.hero.trustWithdrawals': 'तुरंत निकासी',
    'lobby.hero.casinoSubtitle': 'स्लॉट, लाइव टेबल और 12 Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'फ़ुटबॉल, टेनिस, बास्केटबॉल और 12 अन्य खेल',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'सीमित समय का ऑफ़र',
    'lobby.bonus.promoCode': 'प्रोमो कोड: {code}',
    'lobby.bonus.copy': '{code} कॉपी करें',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'आपके प्लेटफ़ॉर्म पर किस तरह के कैसीनो गेम उपलब्ध हैं?',
    'lobby.faq.a1':
      'हमारा प्लेटफ़ॉर्म कैसीनो गेम की एक विस्तृत श्रृंखला पेश करता है, जो हर खिलाड़ी की पसंद और कौशल स्तर के अनुरूप बनाई गई है। आप शानदार ग्राफ़िक्स और रोमांचक बोनस राउंड वाली क्लासिक और आधुनिक स्लॉट मशीनों का बड़ा संग्रह देख सकते हैं। टेबल गेम के शौकीन ब्लैकजैक, रूलेट, बैकारेट और पोकर जैसे सदाबहार खेलों के कई रूपों का आनंद ले सकते हैं। हमारे पास एक रोमांचक लाइव डीलर सेक्शन भी है, जहाँ आप पेशेवर डीलरों से रियल टाइम में बातचीत कर सकते हैं। तुरंत जीत पसंद करने वालों के लिए हमारे संग्रह में स्क्रैच कार्ड, केनो और वर्चुअल लॉटरी जैसे गेम शामिल हैं। प्रोग्रेसिव जैकपॉट गेम स्लॉट और टेबल गेम दोनों में उपलब्ध हैं, जिनमें ज़िंदगी बदल देने वाले इनाम मिलते हैं। वीडियो पोकर के प्रशंसक Jacks or Better और Deuces Wild सहित दर्जनों वेरिएंट में से चुन सकते हैं।',
    'lobby.faq.q2': 'साइन अप करने के बाद मैं अपना वेलकम बोनस कैसे क्लेम करूँ?',
    'lobby.faq.a2':
      'रजिस्ट्रेशन पूरा होते ही आपका वेलकम पैकेज आपके अकाउंट से जुड़ जाता है — कुछ भी हाथ से रिडीम करने की ज़रूरत नहीं। अपना पहला डिपॉज़िट करें और मैच की गई राशि व फ़्री स्पिन अपने आप जमा हो जाएँगे; अगर आपने लॉबी बैनर पर प्रोमो कोड डाला था, तो वह भी लागू हो जाएगा। वेजरिंग शर्त की दिशा में आपकी प्रगति डैशबोर्ड पर दिखाई जाती है, और शर्त पूरी होते ही बोनस बैलेंस निकालने योग्य राशि में बदल जाता है। बोनस राशि हमेशा आपके रियल बैलेंस के बाद खर्च होती है, इसलिए नकद उपलब्ध रहते आप कभी बोनस से दांव नहीं लगाते।',
    'lobby.faq.q3': 'डिपॉज़िट और निकासी के लिए कौन-से भुगतान तरीके स्वीकार किए जाते हैं?',
    'lobby.faq.a3':
      'डिपॉज़िट और निकासी प्रमुख कार्ड, लोकप्रिय ई-वॉलेट और कई क्रिप्टोकरेंसी के ज़रिए उपलब्ध हैं। साइन इन करने के बाद आपके अकाउंट के लिए उपलब्ध हर तरीका वॉलेट में उसकी न्यूनतम, अधिकतम सीमा और अनुमानित प्रोसेसिंग समय के साथ दिखाया जाता है। क्रिप्टो डिपॉज़िट, डिपॉज़िट स्क्रीन पर दिखाए गए नेटवर्क कन्फ़र्मेशन के बाद जमा होते हैं; कार्ड और वॉलेट भुगतान आमतौर पर तुरंत होते हैं। जहाँ भुगतान प्रदाता को ज़रूरत हो, वहाँ निकासी उसी तरीके पर लौटाई जाती है जिससे आपने डिपॉज़िट किया था।',
    'lobby.faq.q4': 'क्या मेरी निजी और वित्तीय जानकारी सुरक्षित रहती है?',
    'lobby.faq.a4':
      'आपके डिवाइस और हमारे सर्वर के बीच का सारा ट्रैफ़िक ट्रांज़िट में एन्क्रिप्टेड रहता है, और भुगतान विवरण हमारे सिस्टम पर स्टोर होने के बजाय हमारे भुगतान पार्टनर संभालते हैं। आप सुरक्षा सेटिंग्स से टू-फ़ैक्टर ऑथेंटिकेशन चालू करके अपने अकाउंट को सुरक्षित कर सकते हैं, और हर साइन-इन व निकासी पर एक सूचना भेजी जाती है, ताकि किसी अनजान सेशन को आसानी से पहचाना जा सके। हम केवल वही पहचान दस्तावेज़ माँगते हैं जिन्हें इकट्ठा करना हमारे लाइसेंस के तहत ज़रूरी है, और उन्हें लाइसेंस की ज़रूरत से ज़्यादा समय तक नहीं रखते।',
    'lobby.faq.q5': 'निकासी अनुरोध को प्रोसेस होने में कितना समय लगता है?',
    'lobby.faq.a5':
      'ज़्यादातर निकासी अनुरोध करने के कुछ ही घंटों में समीक्षा करके मंज़ूर कर दी जाती है। मंज़ूरी के बाद पैसा आप तक कितनी जल्दी पहुँचेगा, यह तरीके पर निर्भर करता है: क्रिप्टो आमतौर पर ट्रांज़ैक्शन ब्रॉडकास्ट होने के कुछ मिनटों में, ई-वॉलेट उसी दिन, और कार्ड रिफ़ंड आपके कार्ड जारीकर्ता के अनुसार कुछ कार्यदिवसों में पहुँचते हैं। अगर पहचान सत्यापन अभी पूरा नहीं हुआ है, तो पहली निकासी में ज़्यादा समय लग सकता है — इसे एक बार पूरा कर लेने से बाद के सभी भुगतान तेज़ी से होते हैं।',
    'lobby.faq.q6':
      'क्या आपके गेम प्रमाणित रूप से निष्पक्ष हैं और स्वतंत्र रूप से ऑडिट किए जाते हैं?',
    'lobby.faq.a6':
      'Rolluck Originals प्रमाणित रूप से निष्पक्ष हैं: हर राउंड एक सर्वर सीड, आपके अपने क्लाइंट सीड और एक नॉन्स से बनता है, और आप गेम स्क्रीन से अपना क्लाइंट सीड बदल सकते हैं और किसी भी पिछले राउंड को खुद सत्यापित कर सकते हैं। थर्ड-पार्टी गेम स्टूडियो के अपने प्रमाणित रैंडम नंबर जनरेटर का उपयोग करते हैं, जिनका परीक्षण स्वतंत्र प्रयोगशालाएँ करती हैं, और हर प्रदाता का रिटर्न-टू-प्लेयर आँकड़ा गेम के विवरण पेज पर प्रकाशित होता है।',

    // Category rail
    'lobby.rail.welcomeTitle': 'वेलकम पैकेज — {amount} + {count} फ़्री स्पिन',
    'lobby.rail.welcomePackage': 'वेलकम पैकेज',
    'lobby.rail.freeSpins': '+ {count} फ़्री स्पिन',
    'lobby.rail.joinTelegram': 'Telegram से जुड़ें',
    'lobby.rail.suggestionBox': 'सुझाव बॉक्स',

    // Site footer
    'lobby.footer.contactQuestions': 'सवाल',
    'lobby.footer.contactBugBounty': 'बग बाउंटी रिपोर्ट',
    'lobby.footer.contactPartner': 'पार्टनर बनें',
    'lobby.footer.contactMarketing': 'मार्केटिंग',
    'lobby.footer.providers': 'प्रदाता',
    'lobby.footer.live': 'लाइव',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'रेफ़रल सिस्टम',
    'lobby.footer.affiliate': 'एफ़िलिएट सिस्टम',
    'lobby.footer.swapCrypto': 'क्रिप्टो स्वैप',
    'lobby.footer.reportBug': 'बग रिपोर्ट करें',
    'lobby.footer.privacy': 'गोपनीयता नीति',
    'lobby.footer.terms': 'सेवा की शर्तें',
    'lobby.footer.sportsTerms': 'स्पोर्ट्स बेटिंग नियम व शर्तें',
    'lobby.footer.earn': 'कमाएँ',
    'lobby.footer.help': 'सहायता',
    'lobby.footer.other': 'अन्य',
    'lobby.footer.playResponsibly': 'ज़िम्मेदारी से खेलें',
    'lobby.footer.securePayments': 'सुरक्षित भुगतान',
    'lobby.footer.securityPriority': 'आपकी सुरक्षा हमारी प्राथमिकता है',
    'lobby.footer.backToTop': 'ऊपर जाएँ',
    'lobby.footer.copyright': 'कॉपीराइट © {year} Rolluck. सर्वाधिकार सुरक्षित।',

    // Sport names
    'lobby.sport.soccer': 'फ़ुटबॉल',
    'lobby.sport.tennis': 'टेनिस',
    'lobby.sport.basketball': 'बास्केटबॉल',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'फ़ुटबॉल',
    'lobby.sport.americanFootball': 'अमेरिकन फ़ुटबॉल',
    'lobby.sport.esports': 'ई-स्पोर्ट्स',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'क्रिकेट',
    'lobby.sport.tableTennis': 'टेबल टेनिस',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'शतरंज',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'गोल्फ़',
    'lobby.sport.live': 'लाइव',
    'lobby.sport.boxing': 'बॉक्सिंग',
    'lobby.sport.iceHockey': 'आइस हॉकी',
    'lobby.sport.volleyball': 'वॉलीबॉल',
    'lobby.sport.wrestling': 'कुश्ती',
    'lobby.sport.sportsbook': 'स्पोर्ट्सबुक',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'घुड़दौड़',
    'lobby.sport.baseball': 'बेसबॉल',
    'lobby.sport.hockey': 'हॉकी',

    // Sportsbook
    'lobby.sports.liveGames': 'लाइव मैच',
    'lobby.sports.england': 'इंग्लैंड',
    'lobby.sports.thirdQuarter': 'तीसरा क्वार्टर',

    // Crash preview
    'lobby.crash.currentPayout': 'मौजूदा भुगतान',
    'lobby.crash.playing': '{count} खेल रहे हैं',
    'lobby.crash.autoCashout': 'ऑटो कैशआउट',
    'lobby.crash.autoCashoutHint': 'वैकल्पिक मल्टीप्लायर सीमा',
    'lobby.crash.autoCashoutMultiplier': 'ऑटो कैशआउट मल्टीप्लायर',
    'lobby.crash.clearAutoCashout': 'ऑटो कैशआउट हटाएँ',
    'lobby.crash.winOnCashout': 'कैशआउट पर जीत:',
    'lobby.crash.networkFee': 'नेटवर्क शुल्क:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': '{game} पर {amount} प्रति स्पिन के फ़्री स्पिन।',
    'lobby.streams.autoSpinBlurb': '{game} पर {amount} प्रति स्पिन से ऑटो-स्पिन।',
    'lobby.streams.alt': '{name} {game} स्ट्रीम कर रहे हैं',
    'lobby.streams.paused': 'रुका हुआ',
    'lobby.streams.open': 'स्ट्रीम खोलें',
    'lobby.streams.share': 'शेयर करें',

    // Header balance menu
    'lobby.balance.label': 'वॉलेट बैलेंस',
    'lobby.balance.displayingIn': 'मुद्रा {currency} में दिखाई जा रही है',
    'lobby.balance.walletSettings': 'वॉलेट सेटिंग्स',

    // Support chat tray
    'lobby.chat.soon': 'हमारी सपोर्ट टीम के साथ लाइव चैट जल्द आ रही है।',
    'lobby.chat.placeholder': 'आपका संदेश…',
    'lobby.chat.message': 'आपका संदेश',

    // Notification centre
    'lobby.notices.platform': 'प्लेटफ़ॉर्म',
    'lobby.notices.personal': 'व्यक्तिगत',
    'lobby.notices.personalEmpty': 'अभी आपके लिए कोई व्यक्तिगत सूचना नहीं है।',
    'lobby.notices.fifaTitle': "FIFA Fury World Cup '26 में हिस्सा लें",
    'lobby.notices.fifaBody':
      'इतिहास का सबसे बड़ा फ़ुटबॉल इवेंट लाइव है! टूर्नामेंट बोर्ड पर $600 000 का विशाल इनाम पूल आपका इंतज़ार कर रहा है।',

    // Casino category chips
    'lobby.chips.blackjack': 'ब्लैकजैक',
    'lobby.chips.roulette': 'रूलेट',
    'lobby.chips.baccarat': 'बैकारेट',
    'lobby.chips.gameShows': 'गेम शो',
    'lobby.chips.boostedRtp': 'बूस्टेड RTP',
    'lobby.chips.newArrivals': 'नए गेम',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': '{provider} वेजर रेस',

    // Recent winners
    'lobby.winners.title': 'हाल के विजेता',
    'lobby.winners.liveBets': 'लाइव दांव',
    'lobby.winners.activeWins': 'सक्रिय जीत',
    'lobby.winners.allBets': 'सभी दांव',
    'lobby.winners.casinoWins': 'कैसीनो जीत',
    'lobby.winners.casinoBets': 'कैसीनो दांव',
    'lobby.winners.sportsBets': 'स्पोर्ट्स दांव',
    'lobby.winners.cardTitle': '{user} ने {game} पर {payout} जीते',

    // Rewards tray raffle card
    'lobby.raffle.title': '{amount} साप्ताहिक रैफ़ल',
    'lobby.raffle.active': 'रैफ़ल एंट्री सक्रिय',

    // Game pages
    'lobby.game.breadcrumb': 'ब्रेडक्रंब',
  },
  fr: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'PRÊT À TENTER TA CHANCE',
    'lobby.hero.dialCode': 'Indicatif téléphonique du pays',
    'lobby.hero.continueWith': 'Continuer avec {method}',
    'lobby.hero.continueWithEmail': "Continuer avec l'e-mail",
    'lobby.hero.moreOptions': "Plus d'options",
    'lobby.hero.todaysWinnings': "{amount} de gains aujourd'hui",
    'lobby.hero.biggestWin': 'Plus gros gain : {amount}',
    'lobby.hero.trustPrivacy': 'Confidentialité totale',
    'lobby.hero.trustFair': 'Équité prouvable',
    'lobby.hero.trustWithdrawals': 'Retraits instantanés',
    'lobby.hero.casinoSubtitle': 'Machines à sous, tables en direct et 12 Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'Football, tennis, basketball et 12 autres sports',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'Offre à durée limitée',
    'lobby.bonus.promoCode': 'Code promo : {code}',
    'lobby.bonus.copy': 'Copier {code}',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'Quels types de jeux de casino sont disponibles sur votre plateforme ?',
    'lobby.faq.a1':
      "Notre plateforme propose une grande variété de jeux de casino conçus pour s'adapter aux préférences et au niveau de chaque joueur. Vous pouvez explorer une vaste collection de machines à sous classiques et modernes, aux graphismes superbes et aux tours bonus palpitants. Les amateurs de jeux de table retrouveront des incontournables comme le blackjack, la roulette, le baccara et le poker, dans de multiples variantes. Nous proposons aussi une section de croupiers en direct où vous pouvez interagir en temps réel avec des croupiers professionnels. Pour ceux qui aiment les gains instantanés, notre sélection comprend des cartes à gratter, du keno et des jeux virtuels de type loterie. Des jeux à jackpot progressif sont disponibles parmi les machines à sous et les jeux de table, avec des cagnottes qui peuvent changer une vie. Les fans de vidéo poker peuvent choisir parmi des dizaines de variantes, dont Jacks or Better et Deuces Wild.",
    'lobby.faq.q2': "Comment obtenir mon bonus de bienvenue après l'inscription ?",
    'lobby.faq.a2':
      "Votre pack de bienvenue est rattaché à votre compte dès la fin de l'inscription : vous n'avez rien à activer vous-même. Effectuez votre premier dépôt et le montant correspondant ainsi que les tours gratuits sont crédités automatiquement, avec le code promo appliqué si vous en avez saisi un sur la bannière du lobby. Votre progression vers l'exigence de mise s'affiche sur votre tableau de bord, et le solde bonus devient retirable dès que cette exigence est remplie. Les fonds bonus sont toujours utilisés après votre solde réel : vous ne misez donc jamais le bonus tant que vous disposez d'argent réel.",
    'lobby.faq.q3': 'Quels moyens de paiement sont acceptés pour les dépôts et les retraits ?',
    'lobby.faq.a3':
      "Les dépôts et retraits sont possibles via les principales cartes bancaires, les portefeuilles électroniques populaires et un large choix de cryptomonnaies. Chaque méthode à laquelle votre compte a droit est listée dans le portefeuille une fois connecté, avec ses montants minimum et maximum et son délai de traitement prévu. Les dépôts en crypto sont crédités après les confirmations réseau indiquées sur l'écran de dépôt ; les paiements par carte et portefeuille sont généralement instantanés. Les retraits sont reversés sur le moyen utilisé pour le dépôt lorsque le prestataire de paiement l'exige.",
    'lobby.faq.q4': 'Mes informations personnelles et financières sont-elles protégées ?',
    'lobby.faq.a4':
      "Toutes les données échangées entre votre appareil et nos serveurs sont chiffrées pendant leur transit, et les informations de paiement sont traitées par nos partenaires de paiement plutôt que stockées sur nos systèmes. L'accès à votre compte peut être protégé par l'authentification à deux facteurs depuis vos paramètres de sécurité, et chaque connexion ou retrait génère une notification pour repérer facilement une session inhabituelle. Nous ne demandons que les pièces d'identité que notre licence nous oblige à collecter, et nous ne les conservons pas plus longtemps que la licence ne l'exige.",
    'lobby.faq.q5': 'Combien de temps faut-il pour traiter une demande de retrait ?',
    'lobby.faq.a5':
      "La plupart des retraits sont examinés et approuvés dans les quelques heures qui suivent la demande. Une fois approuvé, le délai de réception dépend de la méthode : la crypto arrive généralement quelques minutes après la diffusion de la transaction, les portefeuilles électroniques le jour même et les remboursements sur carte en quelques jours ouvrés selon votre banque émettrice. Un premier retrait peut prendre plus de temps si la vérification d'identité n'est pas encore terminée — la compléter une fois pour toutes permet à tous les paiements suivants d'être traités rapidement.",
    'lobby.faq.q6':
      'Vos jeux sont-ils équitables de manière prouvable et audités de façon indépendante ?',
    'lobby.faq.a6':
      "Les Rolluck Originals sont équitables de manière prouvable : chaque partie est générée à partir d'une graine serveur, de votre propre graine client et d'un nonce, et vous pouvez changer votre graine client et vérifier vous-même n'importe quelle partie passée depuis l'écran du jeu. Les titres tiers utilisent les générateurs de nombres aléatoires certifiés de leur studio, testés par des laboratoires indépendants, et le taux de retour au joueur de chaque fournisseur est publié sur la page de détail du jeu.",

    // Category rail
    'lobby.rail.welcomeTitle': 'Pack de bienvenue — {amount} + {count} tours gratuits',
    'lobby.rail.welcomePackage': 'Pack de bienvenue',
    'lobby.rail.freeSpins': '+ {count} tours gratuits',
    'lobby.rail.joinTelegram': 'Rejoindre Telegram',
    'lobby.rail.suggestionBox': 'Boîte à idées',

    // Site footer
    'lobby.footer.contactQuestions': 'Questions',
    'lobby.footer.contactBugBounty': 'Rapports de bug bounty',
    'lobby.footer.contactPartner': 'Devenir partenaire',
    'lobby.footer.contactMarketing': 'Marketing',
    'lobby.footer.providers': 'Fournisseurs',
    'lobby.footer.live': 'En direct',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'Programme de parrainage',
    'lobby.footer.affiliate': "Programme d'affiliation",
    'lobby.footer.swapCrypto': 'Échanger des cryptos',
    'lobby.footer.reportBug': 'Signaler un bug',
    'lobby.footer.privacy': 'Politique de confidentialité',
    'lobby.footer.terms': "Conditions d'utilisation",
    'lobby.footer.sportsTerms': 'CG des paris sportifs',
    'lobby.footer.earn': 'Gagner',
    'lobby.footer.help': 'Aide',
    'lobby.footer.other': 'Autres',
    'lobby.footer.playResponsibly': 'Jouez de manière responsable',
    'lobby.footer.securePayments': 'Paiements sûrs et sécurisés',
    'lobby.footer.securityPriority': 'Votre sécurité est notre priorité',
    'lobby.footer.backToTop': 'Retour en haut',
    'lobby.footer.copyright': 'Copyright © {year} Rolluck. Tous droits réservés.',

    // Sport names
    'lobby.sport.soccer': 'Football',
    'lobby.sport.tennis': 'Tennis',
    'lobby.sport.basketball': 'Basketball',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'Football',
    'lobby.sport.americanFootball': 'Football américain',
    'lobby.sport.esports': 'E-sport',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'Cricket',
    'lobby.sport.tableTennis': 'Tennis de table',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'Échecs',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'Golf',
    'lobby.sport.live': 'En direct',
    'lobby.sport.boxing': 'Boxe',
    'lobby.sport.iceHockey': 'Hockey sur glace',
    'lobby.sport.volleyball': 'Volley-ball',
    'lobby.sport.wrestling': 'Lutte',
    'lobby.sport.sportsbook': 'Paris sportifs',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'Courses hippiques',
    'lobby.sport.baseball': 'Baseball',
    'lobby.sport.hockey': 'Hockey',

    // Sportsbook
    'lobby.sports.liveGames': 'Matchs en direct',
    'lobby.sports.england': 'Angleterre',
    'lobby.sports.thirdQuarter': '3e quart-temps',

    // Crash preview
    'lobby.crash.currentPayout': 'GAIN ACTUEL',
    'lobby.crash.playing': '{count} joueurs en jeu',
    'lobby.crash.autoCashout': 'Encaissement auto',
    'lobby.crash.autoCashoutHint': 'Limite de multiplicateur facultative',
    'lobby.crash.autoCashoutMultiplier': "Multiplicateur d'encaissement auto",
    'lobby.crash.clearAutoCashout': "Effacer l'encaissement auto",
    'lobby.crash.winOnCashout': "Gain à l'encaissement :",
    'lobby.crash.networkFee': 'Frais de réseau :',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': 'Tours gratuits sur {game} à {amount} le tour.',
    'lobby.streams.autoSpinBlurb': 'Tours automatiques sur {game} à {amount} le tour.',
    'lobby.streams.alt': '{name} diffuse {game} en direct',
    'lobby.streams.paused': 'En pause',
    'lobby.streams.open': 'Ouvrir le stream',
    'lobby.streams.share': 'Partager',

    // Header balance menu
    'lobby.balance.label': 'Solde du portefeuille',
    'lobby.balance.displayingIn': 'Devise affichée : {currency}',
    'lobby.balance.walletSettings': 'Paramètres du portefeuille',

    // Support chat tray
    'lobby.chat.soon': 'Le chat en direct avec notre équipe d’assistance arrive bientôt.',
    'lobby.chat.placeholder': 'Votre message…',
    'lobby.chat.message': 'Votre message',

    // Notification centre
    'lobby.notices.platform': 'Plateforme',
    'lobby.notices.personal': 'Personnel',
    'lobby.notices.personalEmpty': "Vous n'avez pas encore de notifications personnelles.",
    'lobby.notices.fifaTitle': "Participez à la FIFA Fury World Cup '26",
    'lobby.notices.fifaBody':
      "Le plus grand événement footballistique de l'histoire est lancé ! Une cagnotte massive de $600 000 vous attend au tableau du tournoi.",

    // Casino category chips
    'lobby.chips.blackjack': 'Blackjack',
    'lobby.chips.roulette': 'Roulette',
    'lobby.chips.baccarat': 'Baccara',
    'lobby.chips.gameShows': 'Jeux télévisés',
    'lobby.chips.boostedRtp': 'RTP boosté',
    'lobby.chips.newArrivals': 'Nouveautés',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': 'Course aux mises {provider}',

    // Recent winners
    'lobby.winners.title': 'Derniers gagnants',
    'lobby.winners.liveBets': 'Paris en direct',
    'lobby.winners.activeWins': 'Gains en cours',
    'lobby.winners.allBets': 'Tous les paris',
    'lobby.winners.casinoWins': 'Gains casino',
    'lobby.winners.casinoBets': 'Paris casino',
    'lobby.winners.sportsBets': 'Paris sportifs',
    'lobby.winners.cardTitle': '{user} a gagné {payout} sur {game}',

    // Rewards tray raffle card
    'lobby.raffle.title': 'TIRAGE HEBDOMADAIRE DE {amount}',
    'lobby.raffle.active': 'Participation au tirage active',

    // Game pages
    'lobby.game.breadcrumb': "Fil d'Ariane",
  },
  ru: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'ГОТОВЫ ИСПЫТАТЬ УДАЧУ',
    'lobby.hero.dialCode': 'Телефонный код страны',
    'lobby.hero.continueWith': 'Продолжить с {method}',
    'lobby.hero.continueWithEmail': 'Продолжить с email',
    'lobby.hero.moreOptions': 'Другие способы',
    'lobby.hero.todaysWinnings': 'Выигрыши за сегодня: {amount}',
    'lobby.hero.biggestWin': 'Крупнейший выигрыш: {amount}',
    'lobby.hero.trustPrivacy': 'Полная конфиденциальность',
    'lobby.hero.trustFair': 'Доказуемая честность',
    'lobby.hero.trustWithdrawals': 'Мгновенный вывод средств',
    'lobby.hero.casinoSubtitle': 'Слоты, live-столы и 12 игр Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'Футбол, теннис, баскетбол и ещё 12 видов спорта',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'Ограниченное предложение',
    'lobby.bonus.promoCode': 'Промокод: {code}',
    'lobby.bonus.copy': 'Скопировать {code}',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'Какие казино-игры доступны на вашей платформе?',
    'lobby.faq.a1':
      'Наша платформа предлагает широкий выбор казино-игр на любой вкус и для любого уровня мастерства. Вас ждёт обширная коллекция классических и современных слотов с потрясающей графикой и захватывающими бонусными раундами. Любители настольных игр могут насладиться вечной классикой — блэкджеком, рулеткой, баккарой и покером — во множестве вариаций. Также у нас есть увлекательный раздел с живыми дилерами, где можно общаться с профессиональными крупье в реальном времени. Для тех, кто любит мгновенные выигрыши, есть скретч-карты, кено и виртуальные лотереи. Игры с прогрессивным джекпотом доступны среди слотов и настольных игр — их призовые фонды способны изменить жизнь. Поклонники видеопокера могут выбирать из десятков вариантов, включая Jacks or Better и Deuces Wild.',
    'lobby.faq.q2': 'Как получить приветственный бонус после регистрации?',
    'lobby.faq.a2':
      'Приветственный пакет привязывается к вашему аккаунту сразу после завершения регистрации — ничего активировать вручную не нужно. Сделайте первый депозит, и сумма бонуса вместе с фриспинами будет начислена автоматически; если вы ввели промокод на баннере в лобби, он тоже применится. Прогресс по отыгрышу отображается на вашей панели, а бонусный баланс становится доступным для вывода, как только условие отыгрыша выполнено. Бонусные средства всегда расходуются после реального баланса, поэтому вы никогда не ставите бонус, пока у вас есть собственные деньги.',
    'lobby.faq.q3': 'Какие способы оплаты доступны для пополнения и вывода?',
    'lobby.faq.a3':
      'Пополнение и вывод доступны через основные банковские карты, популярные электронные кошельки и ряд криптовалют. После входа в аккаунт все доступные вам способы перечислены в кошельке вместе с минимальной и максимальной суммой и ожидаемым временем зачисления. Криптодепозиты зачисляются после подтверждений сети, указанных на экране пополнения; платежи картой и через кошельки обычно проходят мгновенно. Если этого требует платёжный провайдер, средства выводятся тем же способом, которым был сделан депозит.',
    'lobby.faq.q4': 'Защищены ли мои личные и финансовые данные?',
    'lobby.faq.a4':
      'Весь трафик между вашим устройством и нашими серверами шифруется при передаче, а платёжные данные обрабатывают наши платёжные партнёры — мы не храним их в своих системах. Доступ к аккаунту можно защитить двухфакторной аутентификацией в настройках безопасности, а о каждом входе и выводе средств приходит уведомление, так что незнакомую сессию легко заметить. Мы запрашиваем только те документы, удостоверяющие личность, которые обязаны собирать по условиям лицензии, и храним их не дольше, чем она требует.',
    'lobby.faq.q5': 'Сколько времени занимает обработка заявки на вывод?',
    'lobby.faq.a5':
      'Большинство заявок на вывод проверяются и одобряются в течение нескольких часов после подачи. После одобрения скорость получения денег зависит от способа: криптовалюта обычно приходит через несколько минут после отправки транзакции в сеть, электронные кошельки — в тот же день, а возвраты на карту — в течение нескольких рабочих дней в зависимости от банка-эмитента. Первый вывод может занять больше времени, если верификация личности ещё не пройдена — пройдя её один раз, вы ускорите все последующие выплаты.',
    'lobby.faq.q6': 'Честность ваших игр доказуема и проверяется независимыми аудиторами?',
    'lobby.faq.a6':
      'Игры Rolluck Originals доказуемо честные: каждый раунд генерируется из серверного сида, вашего собственного клиентского сида и nonce, а сменить клиентский сид и самостоятельно проверить любой прошлый раунд можно прямо на экране игры. Игры сторонних студий используют их собственные сертифицированные генераторы случайных чисел, которые проверяют независимые лаборатории, а показатель возврата игроку (RTP) каждого провайдера опубликован на странице игры.',

    // Category rail
    'lobby.rail.welcomeTitle': 'Приветственный пакет — {amount} + {count} фриспинов',
    'lobby.rail.welcomePackage': 'Приветственный пакет',
    'lobby.rail.freeSpins': '+ {count} фриспинов',
    'lobby.rail.joinTelegram': 'Вступить в Telegram',
    'lobby.rail.suggestionBox': 'Предложения',

    // Site footer
    'lobby.footer.contactQuestions': 'Вопросы',
    'lobby.footer.contactBugBounty': 'Отчёты по программе Bug Bounty',
    'lobby.footer.contactPartner': 'Стать партнёром',
    'lobby.footer.contactMarketing': 'Маркетинг',
    'lobby.footer.providers': 'Провайдеры',
    'lobby.footer.live': 'Лайв',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'Реферальная программа',
    'lobby.footer.affiliate': 'Партнёрская программа',
    'lobby.footer.swapCrypto': 'Обмен криптовалют',
    'lobby.footer.reportBug': 'Сообщить об ошибке',
    'lobby.footer.privacy': 'Политика конфиденциальности',
    'lobby.footer.terms': 'Условия использования',
    'lobby.footer.sportsTerms': 'Правила ставок на спорт',
    'lobby.footer.earn': 'Заработок',
    'lobby.footer.help': 'Помощь',
    'lobby.footer.other': 'Прочее',
    'lobby.footer.playResponsibly': 'Играйте ответственно',
    'lobby.footer.securePayments': 'Безопасные платежи',
    'lobby.footer.securityPriority': 'Ваша безопасность — наш приоритет',
    'lobby.footer.backToTop': 'Наверх',
    'lobby.footer.copyright': '© {year} Rolluck. Все права защищены.',

    // Sport names
    'lobby.sport.soccer': 'Футбол',
    'lobby.sport.tennis': 'Теннис',
    'lobby.sport.basketball': 'Баскетбол',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'Футбол',
    'lobby.sport.americanFootball': 'Американский футбол',
    'lobby.sport.esports': 'Киберспорт',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'Крикет',
    'lobby.sport.tableTennis': 'Настольный теннис',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'Шахматы',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'Гольф',
    'lobby.sport.live': 'Лайв',
    'lobby.sport.boxing': 'Бокс',
    'lobby.sport.iceHockey': 'Хоккей',
    'lobby.sport.volleyball': 'Волейбол',
    'lobby.sport.wrestling': 'Борьба',
    'lobby.sport.sportsbook': 'Букмекерская линия',
    'lobby.sport.mma': 'ММА',
    'lobby.sport.horseRacing': 'Скачки',
    'lobby.sport.baseball': 'Бейсбол',
    'lobby.sport.hockey': 'Хоккей',

    // Sportsbook
    'lobby.sports.liveGames': 'Матчи в прямом эфире',
    'lobby.sports.england': 'Англия',
    'lobby.sports.thirdQuarter': '3-я четверть',

    // Crash preview
    'lobby.crash.currentPayout': 'ТЕКУЩАЯ ВЫПЛАТА',
    'lobby.crash.playing': 'Играют: {count}',
    'lobby.crash.autoCashout': 'Автовывод',
    'lobby.crash.autoCashoutHint': 'Необязательный лимит множителя',
    'lobby.crash.autoCashoutMultiplier': 'Множитель автовывода',
    'lobby.crash.clearAutoCashout': 'Сбросить автовывод',
    'lobby.crash.winOnCashout': 'Выигрыш при выводе:',
    'lobby.crash.networkFee': 'Комиссия сети:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': 'Фриспины в {game} по {amount} за спин.',
    'lobby.streams.autoSpinBlurb': 'Автоспины в {game} по {amount} за спин.',
    'lobby.streams.alt': '{name} стримит {game}',
    'lobby.streams.paused': 'Пауза',
    'lobby.streams.open': 'Открыть трансляцию',
    'lobby.streams.share': 'Поделиться',

    // Header balance menu
    'lobby.balance.label': 'Баланс кошелька',
    'lobby.balance.displayingIn': 'Валюта отображения: {currency}',
    'lobby.balance.walletSettings': 'Настройки кошелька',

    // Support chat tray
    'lobby.chat.soon': 'Живой чат с нашей службой поддержки скоро появится.',
    'lobby.chat.placeholder': 'Ваше сообщение…',
    'lobby.chat.message': 'Ваше сообщение',

    // Notification centre
    'lobby.notices.platform': 'Платформа',
    'lobby.notices.personal': 'Личные',
    'lobby.notices.personalEmpty': 'У вас пока нет личных уведомлений.',
    'lobby.notices.fifaTitle': "Участвуйте в FIFA Fury World Cup '26",
    'lobby.notices.fifaBody':
      'Крупнейшее футбольное событие в истории уже началось! В таблице турнира вас ждёт огромный призовой фонд $600 000.',

    // Casino category chips
    'lobby.chips.blackjack': 'Блэкджек',
    'lobby.chips.roulette': 'Рулетка',
    'lobby.chips.baccarat': 'Баккара',
    'lobby.chips.gameShows': 'Игровые шоу',
    'lobby.chips.boostedRtp': 'Повышенный RTP',
    'lobby.chips.newArrivals': 'Новинки',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': 'Гонка ставок {provider}',

    // Recent winners
    'lobby.winners.title': 'Последние победители',
    'lobby.winners.liveBets': 'Ставки онлайн',
    'lobby.winners.activeWins': 'Активные выигрыши',
    'lobby.winners.allBets': 'Все ставки',
    'lobby.winners.casinoWins': 'Выигрыши в казино',
    'lobby.winners.casinoBets': 'Ставки в казино',
    'lobby.winners.sportsBets': 'Ставки на спорт',
    'lobby.winners.cardTitle': '{user} выиграл {payout} в {game}',

    // Rewards tray raffle card
    'lobby.raffle.title': 'ЕЖЕНЕДЕЛЬНЫЙ РОЗЫГРЫШ {amount}',
    'lobby.raffle.active': 'Участие в розыгрыше активно',

    // Game pages
    'lobby.game.breadcrumb': 'Навигационная цепочка',
  },
  pt: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'PRONTO PARA TESTAR A SUA SORTE',
    'lobby.hero.dialCode': 'Código de chamada do país',
    'lobby.hero.continueWith': 'Continuar com {method}',
    'lobby.hero.continueWithEmail': 'Continuar com e-mail',
    'lobby.hero.moreOptions': 'Mais opções',
    'lobby.hero.todaysWinnings': '{amount} em ganhos hoje',
    'lobby.hero.biggestWin': 'Maior ganho: {amount}',
    'lobby.hero.trustPrivacy': 'Privacidade total',
    'lobby.hero.trustFair': 'Justiça comprovável',
    'lobby.hero.trustWithdrawals': 'Levantamentos instantâneos',
    'lobby.hero.casinoSubtitle': 'Slots, mesas ao vivo e 12 Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'Futebol, ténis, basquetebol e mais 12 desportos',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'Oferta por tempo limitado',
    'lobby.bonus.promoCode': 'Código promocional: {code}',
    'lobby.bonus.copy': 'Copiar {code}',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'Que tipos de jogos de casino estão disponíveis na vossa plataforma?',
    'lobby.faq.a1':
      'A nossa plataforma oferece uma grande variedade de jogos de casino, pensados para todas as preferências e níveis de experiência. Pode explorar uma vasta coleção de slots clássicas e modernas, com gráficos impressionantes e rondas de bónus emocionantes. Os apreciadores de jogos de mesa podem desfrutar de clássicos intemporais como blackjack, roleta, bacará e póquer, em várias versões. Temos também uma secção de dealers ao vivo, onde pode interagir com dealers profissionais em tempo real. Para quem gosta de ganhos instantâneos, a nossa seleção inclui raspadinhas, keno e jogos virtuais do tipo lotaria. Os jogos com jackpot progressivo estão disponíveis em slots e jogos de mesa, com prémios capazes de mudar uma vida. Os fãs de vídeo póquer podem escolher entre dezenas de variantes, incluindo Jacks or Better e Deuces Wild.',
    'lobby.faq.q2': 'Como recebo o meu bónus de boas-vindas depois de me registar?',
    'lobby.faq.a2':
      'O seu pacote de boas-vindas fica associado à sua conta assim que o registo é concluído — não há nada para resgatar manualmente. Faça o seu primeiro depósito e o valor correspondente, juntamente com as rodadas grátis, é creditado automaticamente, com o código promocional aplicado se tiver introduzido um no banner do lobby. O progresso no requisito de apostas é apresentado no seu painel, e o saldo de bónus converte-se em fundos levantáveis assim que esse requisito é cumprido. Os fundos de bónus são sempre usados depois do seu saldo real, por isso nunca está a apostar o bónus enquanto tiver dinheiro disponível.',
    'lobby.faq.q3': 'Que métodos de pagamento são aceites para depósitos e levantamentos?',
    'lobby.faq.a3':
      'Os depósitos e levantamentos estão disponíveis através dos principais cartões, carteiras eletrónicas populares e várias criptomoedas. Todos os métodos disponíveis para a sua conta são apresentados na carteira depois de iniciar sessão, com o respetivo mínimo, máximo e tempo de processamento previsto. Os depósitos em cripto são creditados após as confirmações de rede indicadas no ecrã de depósito; os pagamentos com cartão e carteira são normalmente instantâneos. Os levantamentos regressam ao método usado no depósito sempre que o prestador de pagamentos o exija.',
    'lobby.faq.q4': 'As minhas informações pessoais e financeiras estão seguras?',
    'lobby.faq.a4':
      'Todo o tráfego entre o seu dispositivo e os nossos servidores é encriptado em trânsito, e os dados de pagamento são tratados pelos nossos parceiros de pagamento em vez de ficarem guardados nos nossos sistemas. O acesso à conta pode ser protegido com autenticação de dois fatores nas definições de segurança, e cada início de sessão e levantamento gera uma notificação, para que uma sessão desconhecida seja fácil de detetar. Só pedimos os documentos de identificação que a nossa licença nos obriga a recolher, e não os guardamos durante mais tempo do que a licença exige.',
    'lobby.faq.q5': 'Quanto tempo demora a processar um pedido de levantamento?',
    'lobby.faq.a5':
      'A maioria dos levantamentos é analisada e aprovada poucas horas depois do pedido. Após a aprovação, a rapidez com que o dinheiro chega depende do método: a cripto chega normalmente poucos minutos depois de a transação ser transmitida, as carteiras eletrónicas no mesmo dia e os reembolsos em cartão em poucos dias úteis, consoante o emissor. O primeiro levantamento pode demorar mais se a verificação de identidade ainda não estiver concluída — concluí-la uma vez mantém todos os pagamentos seguintes no caminho rápido.',
    'lobby.faq.q6': 'Os vossos jogos são comprovadamente justos e auditados de forma independente?',
    'lobby.faq.a6':
      'Os Rolluck Originals são comprovadamente justos: cada ronda é gerada a partir de uma seed do servidor, da sua própria seed de cliente e de um nonce, e pode alterar a sua seed de cliente e verificar qualquer ronda anterior a partir do ecrã do jogo. Os títulos de terceiros usam os geradores de números aleatórios certificados do próprio estúdio, testados por laboratórios independentes, e a taxa de retorno ao jogador de cada fornecedor é publicada na página de detalhes do jogo.',

    // Category rail
    'lobby.rail.welcomeTitle': 'Pacote de boas-vindas — {amount} + {count} rodadas grátis',
    'lobby.rail.welcomePackage': 'Pacote de boas-vindas',
    'lobby.rail.freeSpins': '+ {count} rodadas grátis',
    'lobby.rail.joinTelegram': 'Junte-se ao Telegram',
    'lobby.rail.suggestionBox': 'Caixa de sugestões',

    // Site footer
    'lobby.footer.contactQuestions': 'Perguntas',
    'lobby.footer.contactBugBounty': 'Relatórios de bug bounty',
    'lobby.footer.contactPartner': 'Torne-se parceiro',
    'lobby.footer.contactMarketing': 'Marketing',
    'lobby.footer.providers': 'Fornecedores',
    'lobby.footer.live': 'Ao vivo',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'Sistema de indicações',
    'lobby.footer.affiliate': 'Sistema de afiliados',
    'lobby.footer.swapCrypto': 'Trocar cripto',
    'lobby.footer.reportBug': 'Reportar erro',
    'lobby.footer.privacy': 'Política de Privacidade',
    'lobby.footer.terms': 'Termos de Serviço',
    'lobby.footer.sportsTerms': 'T&C de apostas desportivas',
    'lobby.footer.earn': 'Ganhar',
    'lobby.footer.help': 'Ajuda',
    'lobby.footer.other': 'Outros',
    'lobby.footer.playResponsibly': 'Jogue com responsabilidade',
    'lobby.footer.securePayments': 'Pagamentos seguros e protegidos',
    'lobby.footer.securityPriority': 'A sua segurança é a nossa prioridade',
    'lobby.footer.backToTop': 'Voltar ao topo',
    'lobby.footer.copyright': 'Copyright © {year} Rolluck. Todos os direitos reservados.',

    // Sport names
    'lobby.sport.soccer': 'Futebol',
    'lobby.sport.tennis': 'Ténis',
    'lobby.sport.basketball': 'Basquetebol',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'Futebol',
    'lobby.sport.americanFootball': 'Futebol americano',
    'lobby.sport.esports': 'Esports',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'Críquete',
    'lobby.sport.tableTennis': 'Ténis de mesa',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'Xadrez',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'Golfe',
    'lobby.sport.live': 'Ao vivo',
    'lobby.sport.boxing': 'Boxe',
    'lobby.sport.iceHockey': 'Hóquei no gelo',
    'lobby.sport.volleyball': 'Voleibol',
    'lobby.sport.wrestling': 'Luta livre',
    'lobby.sport.sportsbook': 'Apostas desportivas',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'Corridas de cavalos',
    'lobby.sport.baseball': 'Basebol',
    'lobby.sport.hockey': 'Hóquei',

    // Sportsbook
    'lobby.sports.liveGames': 'Jogos ao vivo',
    'lobby.sports.england': 'Inglaterra',
    'lobby.sports.thirdQuarter': '3.º período',

    // Crash preview
    'lobby.crash.currentPayout': 'PAGAMENTO ATUAL',
    'lobby.crash.playing': '{count} a jogar',
    'lobby.crash.autoCashout': 'Levantamento automático',
    'lobby.crash.autoCashoutHint': 'Limite de multiplicador opcional',
    'lobby.crash.autoCashoutMultiplier': 'Multiplicador de levantamento automático',
    'lobby.crash.clearAutoCashout': 'Limpar levantamento automático',
    'lobby.crash.winOnCashout': 'Ganho ao levantar:',
    'lobby.crash.networkFee': 'Taxa de rede:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': 'Rodadas grátis em {game} a {amount} por rodada.',
    'lobby.streams.autoSpinBlurb': 'Rodadas automáticas em {game} a {amount} por rodada.',
    'lobby.streams.alt': '{name} a transmitir {game}',
    'lobby.streams.paused': 'Em pausa',
    'lobby.streams.open': 'Abrir transmissão',
    'lobby.streams.share': 'Partilhar',

    // Header balance menu
    'lobby.balance.label': 'Saldo da carteira',
    'lobby.balance.displayingIn': 'Moeda apresentada em {currency}',
    'lobby.balance.walletSettings': 'Definições da carteira',

    // Support chat tray
    'lobby.chat.soon': 'O chat ao vivo com a nossa equipa de apoio chega em breve.',
    'lobby.chat.placeholder': 'A sua mensagem…',
    'lobby.chat.message': 'A sua mensagem',

    // Notification centre
    'lobby.notices.platform': 'Plataforma',
    'lobby.notices.personal': 'Pessoal',
    'lobby.notices.personalEmpty': 'Ainda não tem notificações pessoais.',
    'lobby.notices.fifaTitle': "Participe no FIFA Fury World Cup '26",
    'lobby.notices.fifaBody':
      'O maior evento de futebol da história já começou! Um enorme prémio de $600 000 espera por si no quadro do torneio.',

    // Casino category chips
    'lobby.chips.blackjack': 'Blackjack',
    'lobby.chips.roulette': 'Roleta',
    'lobby.chips.baccarat': 'Bacará',
    'lobby.chips.gameShows': 'Game shows',
    'lobby.chips.boostedRtp': 'RTP aumentado',
    'lobby.chips.newArrivals': 'Novidades',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': 'Corrida de apostas {provider}',

    // Recent winners
    'lobby.winners.title': 'Vencedores recentes',
    'lobby.winners.liveBets': 'Apostas ao vivo',
    'lobby.winners.activeWins': 'Ganhos ativos',
    'lobby.winners.allBets': 'Todas as apostas',
    'lobby.winners.casinoWins': 'Ganhos de casino',
    'lobby.winners.casinoBets': 'Apostas de casino',
    'lobby.winners.sportsBets': 'Apostas desportivas',
    'lobby.winners.cardTitle': '{user} ganhou {payout} em {game}',

    // Rewards tray raffle card
    'lobby.raffle.title': 'SORTEIO SEMANAL DE {amount}',
    'lobby.raffle.active': 'Participação no sorteio ativa',

    // Game pages
    'lobby.game.breadcrumb': 'Navegação estrutural',
  },
  es: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'LISTO PARA PROBAR TU SUERTE',
    'lobby.hero.dialCode': 'Prefijo telefónico del país',
    'lobby.hero.continueWith': 'Continuar con {method}',
    'lobby.hero.continueWithEmail': 'Continuar con correo electrónico',
    'lobby.hero.moreOptions': 'Más opciones',
    'lobby.hero.todaysWinnings': '{amount} en ganancias hoy',
    'lobby.hero.biggestWin': 'Mayor ganancia: {amount}',
    'lobby.hero.trustPrivacy': 'Privacidad total',
    'lobby.hero.trustFair': 'Justicia demostrable',
    'lobby.hero.trustWithdrawals': 'Retiros instantáneos',
    'lobby.hero.casinoSubtitle': 'Tragamonedas, mesas en vivo y 12 Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'Fútbol, tenis, baloncesto y otros 12 deportes',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'Oferta por tiempo limitado',
    'lobby.bonus.promoCode': 'Código promocional: {code}',
    'lobby.bonus.copy': 'Copiar {code}',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': '¿Qué tipos de juegos de casino hay disponibles en vuestra plataforma?',
    'lobby.faq.a1':
      'Nuestra plataforma ofrece una amplia variedad de juegos de casino pensados para las preferencias y el nivel de cada jugador. Puedes explorar una extensa colección de tragamonedas clásicas y modernas con gráficos impresionantes y emocionantes rondas de bonificación. Los aficionados a los juegos de mesa pueden disfrutar de clásicos de siempre como el blackjack, la ruleta, el baccarat y el póker en múltiples variantes. También contamos con una emocionante sección de crupieres en vivo donde puedes interactuar con crupieres profesionales en tiempo real. Para quienes prefieren los premios instantáneos, nuestra selección incluye rascas, keno y juegos virtuales de tipo lotería. Los juegos con bote progresivo están disponibles en tragamonedas y juegos de mesa, con premios que pueden cambiarte la vida. Los fans del videopóker pueden elegir entre decenas de variantes, como Jacks or Better y Deuces Wild.',
    'lobby.faq.q2': '¿Cómo reclamo mi bono de bienvenida después de registrarme?',
    'lobby.faq.a2':
      'Tu paquete de bienvenida se asocia a tu cuenta en cuanto se completa el registro: no tienes que canjear nada a mano. Haz tu primer depósito y el importe equivalente y los giros gratis se acreditan automáticamente, con el código promocional aplicado si introdujiste uno en el banner del lobby. Tu progreso hacia el requisito de apuesta se muestra en tu panel, y el saldo de bono se convierte en fondos retirables en cuanto se cumple ese requisito. Los fondos de bono siempre se gastan después de tu saldo real, así que nunca apuestas el bono mientras tengas dinero disponible.',
    'lobby.faq.q3': '¿Qué métodos de pago se aceptan para depósitos y retiros?',
    'lobby.faq.a3':
      'Los depósitos y retiros están disponibles con las principales tarjetas, monederos electrónicos populares y diversas criptomonedas. Todos los métodos disponibles para tu cuenta aparecen en la billetera una vez que inicias sesión, junto con su mínimo, su máximo y el tiempo de procesamiento previsto. Los depósitos en cripto se acreditan tras las confirmaciones de red indicadas en la pantalla de depósito; los pagos con tarjeta y monedero suelen ser instantáneos. Los retiros vuelven al método con el que depositaste siempre que el proveedor de pagos lo exija.',
    'lobby.faq.q4': '¿Mi información personal y financiera está segura?',
    'lobby.faq.a4':
      'Todo el tráfico entre tu dispositivo y nuestros servidores se cifra en tránsito, y los datos de pago los gestionan nuestros socios de pago en lugar de almacenarse en nuestros sistemas. Puedes proteger el acceso a tu cuenta con la autenticación en dos pasos desde tus ajustes de seguridad, y cada inicio de sesión y retiro genera una notificación para que detectes fácilmente cualquier sesión desconocida. Solo pedimos los documentos de identidad que nuestra licencia nos obliga a recopilar, y no los conservamos más tiempo del que exige la licencia.',
    'lobby.faq.q5': '¿Cuánto tarda en procesarse una solicitud de retiro?',
    'lobby.faq.a5':
      'La mayoría de los retiros se revisan y aprueban en pocas horas desde la solicitud. Una vez aprobado, la rapidez con la que recibes el dinero depende del método: las criptomonedas suelen llegar a los pocos minutos de difundirse la transacción, los monederos electrónicos el mismo día y los reembolsos a tarjeta en unos pocos días hábiles, según tu emisor. El primer retiro puede tardar más si aún no has completado la verificación de identidad; completarla una vez mantiene todos los pagos posteriores en la vía rápida.',
    'lobby.faq.q6':
      '¿Vuestros juegos son demostrablemente justos y están auditados de forma independiente?',
    'lobby.faq.a6':
      'Los Rolluck Originals son demostrablemente justos: cada ronda se genera a partir de una semilla del servidor, tu propia semilla de cliente y un nonce, y puedes cambiar tu semilla de cliente y verificar tú mismo cualquier ronda anterior desde la pantalla del juego. Los títulos de terceros usan los generadores de números aleatorios certificados del propio estudio, probados por laboratorios independientes, y el porcentaje de retorno al jugador de cada proveedor se publica en la página de detalles del juego.',

    // Category rail
    'lobby.rail.welcomeTitle': 'Paquete de bienvenida — {amount} + {count} giros gratis',
    'lobby.rail.welcomePackage': 'Paquete de bienvenida',
    'lobby.rail.freeSpins': '+ {count} giros gratis',
    'lobby.rail.joinTelegram': 'Únete a Telegram',
    'lobby.rail.suggestionBox': 'Buzón de sugerencias',

    // Site footer
    'lobby.footer.contactQuestions': 'Preguntas',
    'lobby.footer.contactBugBounty': 'Informes de bug bounty',
    'lobby.footer.contactPartner': 'Hazte socio',
    'lobby.footer.contactMarketing': 'Marketing',
    'lobby.footer.providers': 'Proveedores',
    'lobby.footer.live': 'En vivo',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'Sistema de referidos',
    'lobby.footer.affiliate': 'Sistema de afiliados',
    'lobby.footer.swapCrypto': 'Intercambiar cripto',
    'lobby.footer.reportBug': 'Informar de un error',
    'lobby.footer.privacy': 'Política de privacidad',
    'lobby.footer.terms': 'Términos del servicio',
    'lobby.footer.sportsTerms': 'T. y C. de apuestas deportivas',
    'lobby.footer.earn': 'Gana',
    'lobby.footer.help': 'Ayuda',
    'lobby.footer.other': 'Otros',
    'lobby.footer.playResponsibly': 'Juega con responsabilidad',
    'lobby.footer.securePayments': 'Pagos seguros y protegidos',
    'lobby.footer.securityPriority': 'Tu seguridad es nuestra prioridad',
    'lobby.footer.backToTop': 'Volver arriba',
    'lobby.footer.copyright': 'Copyright © {year} Rolluck. Todos los derechos reservados.',

    // Sport names
    'lobby.sport.soccer': 'Fútbol',
    'lobby.sport.tennis': 'Tenis',
    'lobby.sport.basketball': 'Baloncesto',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'Fútbol',
    'lobby.sport.americanFootball': 'Fútbol americano',
    'lobby.sport.esports': 'Esports',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'Críquet',
    'lobby.sport.tableTennis': 'Tenis de mesa',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'Ajedrez',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'Golf',
    'lobby.sport.live': 'En vivo',
    'lobby.sport.boxing': 'Boxeo',
    'lobby.sport.iceHockey': 'Hockey sobre hielo',
    'lobby.sport.volleyball': 'Voleibol',
    'lobby.sport.wrestling': 'Lucha libre',
    'lobby.sport.sportsbook': 'Apuestas deportivas',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'Carreras de caballos',
    'lobby.sport.baseball': 'Béisbol',
    'lobby.sport.hockey': 'Hockey',

    // Sportsbook
    'lobby.sports.liveGames': 'Partidos en vivo',
    'lobby.sports.england': 'Inglaterra',
    'lobby.sports.thirdQuarter': '3.er cuarto',

    // Crash preview
    'lobby.crash.currentPayout': 'PAGO ACTUAL',
    'lobby.crash.playing': '{count} jugando',
    'lobby.crash.autoCashout': 'Retiro automático',
    'lobby.crash.autoCashoutHint': 'Límite de multiplicador opcional',
    'lobby.crash.autoCashoutMultiplier': 'Multiplicador de retiro automático',
    'lobby.crash.clearAutoCashout': 'Borrar retiro automático',
    'lobby.crash.winOnCashout': 'Ganancia al retirar:',
    'lobby.crash.networkFee': 'Comisión de red:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': 'Giros gratis en {game} a {amount} por giro.',
    'lobby.streams.autoSpinBlurb': 'Giros automáticos en {game} a {amount} por giro.',
    'lobby.streams.alt': '{name} retransmitiendo {game}',
    'lobby.streams.paused': 'En pausa',
    'lobby.streams.open': 'Abrir transmisión',
    'lobby.streams.share': 'Compartir',

    // Header balance menu
    'lobby.balance.label': 'Saldo de la billetera',
    'lobby.balance.displayingIn': 'Moneda mostrada en {currency}',
    'lobby.balance.walletSettings': 'Ajustes de la billetera',

    // Support chat tray
    'lobby.chat.soon': 'El chat en vivo con nuestro equipo de soporte llegará pronto.',
    'lobby.chat.placeholder': 'Tu mensaje…',
    'lobby.chat.message': 'Tu mensaje',

    // Notification centre
    'lobby.notices.platform': 'Plataforma',
    'lobby.notices.personal': 'Personal',
    'lobby.notices.personalEmpty': 'Aún no tienes notificaciones personales.',
    'lobby.notices.fifaTitle': "Participa en la FIFA Fury World Cup '26",
    'lobby.notices.fifaBody':
      '¡El mayor evento de fútbol de la historia ya está en marcha! Un enorme bote de $600 000 te espera en el tablero del torneo.',

    // Casino category chips
    'lobby.chips.blackjack': 'Blackjack',
    'lobby.chips.roulette': 'Ruleta',
    'lobby.chips.baccarat': 'Baccarat',
    'lobby.chips.gameShows': 'Concursos',
    'lobby.chips.boostedRtp': 'RTP aumentado',
    'lobby.chips.newArrivals': 'Novedades',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': 'Carrera de apuestas {provider}',

    // Recent winners
    'lobby.winners.title': 'Ganadores recientes',
    'lobby.winners.liveBets': 'Apuestas en vivo',
    'lobby.winners.activeWins': 'Ganancias activas',
    'lobby.winners.allBets': 'Todas las apuestas',
    'lobby.winners.casinoWins': 'Ganancias de casino',
    'lobby.winners.casinoBets': 'Apuestas de casino',
    'lobby.winners.sportsBets': 'Apuestas deportivas',
    'lobby.winners.cardTitle': '{user} ganó {payout} en {game}',

    // Rewards tray raffle card
    'lobby.raffle.title': 'SORTEO SEMANAL DE {amount}',
    'lobby.raffle.active': 'Participación en el sorteo activa',

    // Game pages
    'lobby.game.breadcrumb': 'Ruta de navegación',
  },
  it: {
    // Lobby hero (signed out)
    'lobby.hero.title': 'PRONTO A TENTARE LA FORTUNA',
    'lobby.hero.dialCode': 'Prefisso telefonico internazionale',
    'lobby.hero.continueWith': 'Continua con {method}',
    'lobby.hero.continueWithEmail': "Continua con l'email",
    'lobby.hero.moreOptions': 'Altre opzioni',
    'lobby.hero.todaysWinnings': '{amount} di vincite oggi',
    'lobby.hero.biggestWin': 'Vincita più alta: {amount}',
    'lobby.hero.trustPrivacy': 'Privacy totale',
    'lobby.hero.trustFair': 'Equità dimostrabile',
    'lobby.hero.trustWithdrawals': 'Prelievi istantanei',
    'lobby.hero.casinoSubtitle': 'Slot, tavoli live e 12 Rolluck Originals',
    'lobby.hero.sportsSubtitle': 'Calcio, tennis, basket e altri 12 sport',

    // Welcome-offer banner
    'lobby.bonus.eyebrow': 'Offerta a tempo limitato',
    'lobby.bonus.promoCode': 'Codice promozionale: {code}',
    'lobby.bonus.copy': 'Copia {code}',

    // Lobby FAQ (sample copy pending compliance sign-off)
    'lobby.faq.q1': 'Quali tipi di giochi da casinò sono disponibili sulla vostra piattaforma?',
    'lobby.faq.a1':
      "La nostra piattaforma offre un'ampia varietà di giochi da casinò pensati per le preferenze e il livello di ogni giocatore. Puoi esplorare una vasta collezione di slot classiche e moderne, con grafica straordinaria e coinvolgenti round bonus. Gli appassionati dei giochi da tavolo possono godersi grandi classici come blackjack, roulette, baccarat e poker in numerose varianti. Abbiamo anche un'emozionante sezione con croupier dal vivo, dove puoi interagire in tempo reale con croupier professionisti. Per chi ama le vincite immediate, la nostra selezione comprende gratta e vinci, keno e giochi virtuali in stile lotteria. I giochi con jackpot progressivo sono disponibili tra slot e giochi da tavolo, con montepremi che possono cambiarti la vita. Gli appassionati di video poker possono scegliere tra decine di varianti, tra cui Jacks or Better e Deuces Wild.",
    'lobby.faq.q2': "Come ottengo il bonus di benvenuto dopo l'iscrizione?",
    'lobby.faq.a2':
      "Il pacchetto di benvenuto viene associato al tuo account non appena la registrazione è completata: non c'è nulla da riscattare manualmente. Effettua il primo deposito e l'importo corrispondente e i giri gratis vengono accreditati automaticamente, con il codice promozionale applicato se ne hai inserito uno nel banner della lobby. I progressi verso il requisito di puntata sono mostrati nella tua dashboard e il saldo bonus diventa prelevabile non appena il requisito è soddisfatto. I fondi bonus vengono sempre utilizzati dopo il saldo reale, quindi non punti mai il bonus finché hai denaro disponibile.",
    'lobby.faq.q3': 'Quali metodi di pagamento sono accettati per depositi e prelievi?',
    'lobby.faq.a3':
      "Depositi e prelievi sono disponibili tramite le principali carte, i portafogli elettronici più diffusi e diverse criptovalute. Ogni metodo disponibile per il tuo account è elencato nel portafoglio dopo l'accesso, con importo minimo, massimo e tempi di accredito previsti. I depositi in cripto vengono accreditati dopo le conferme di rete indicate nella schermata di deposito; i pagamenti con carta e portafoglio sono di solito istantanei. I prelievi vengono restituiti al metodo usato per il deposito quando il fornitore di pagamento lo richiede.",
    'lobby.faq.q4': 'Le mie informazioni personali e finanziarie sono al sicuro?',
    'lobby.faq.a4':
      "Tutto il traffico tra il tuo dispositivo e i nostri server è crittografato durante la trasmissione, e i dati di pagamento sono gestiti dai nostri partner di pagamento anziché conservati nei nostri sistemi. Puoi proteggere l'accesso all'account con l'autenticazione a due fattori dalle impostazioni di sicurezza, e ogni accesso e prelievo genera una notifica, così una sessione sconosciuta è facile da individuare. Chiediamo solo i documenti d'identità che la nostra licenza ci obbliga a raccogliere e non li conserviamo più a lungo di quanto la licenza richieda.",
    'lobby.faq.q5': 'Quanto tempo serve per elaborare una richiesta di prelievo?',
    'lobby.faq.a5':
      "La maggior parte dei prelievi viene esaminata e approvata entro poche ore dalla richiesta. Una volta approvato, la rapidità con cui ricevi il denaro dipende dal metodo: le cripto arrivano in genere pochi minuti dopo la trasmissione della transazione, i portafogli elettronici in giornata e i rimborsi su carta in pochi giorni lavorativi, a seconda dell'emittente. Il primo prelievo può richiedere più tempo se la verifica dell'identità non è ancora completa: completarla una volta mantiene veloci tutti i pagamenti successivi.",
    'lobby.faq.q6':
      'I vostri giochi sono equi in modo dimostrabile e verificati in modo indipendente?',
    'lobby.faq.a6':
      'I Rolluck Originals sono equi in modo dimostrabile: ogni round viene generato da un seed del server, dal tuo seed client e da un nonce, e puoi cambiare il tuo seed client e verificare tu stesso qualsiasi round passato dalla schermata del gioco. I titoli di terze parti usano i generatori di numeri casuali certificati dello studio, testati da laboratori indipendenti, e il ritorno al giocatore di ogni fornitore è pubblicato nella pagina di dettaglio del gioco.',

    // Category rail
    'lobby.rail.welcomeTitle': 'Pacchetto di benvenuto — {amount} + {count} giri gratis',
    'lobby.rail.welcomePackage': 'Pacchetto di benvenuto',
    'lobby.rail.freeSpins': '+ {count} giri gratis',
    'lobby.rail.joinTelegram': 'Unisciti a Telegram',
    'lobby.rail.suggestionBox': 'Cassetta dei suggerimenti',

    // Site footer
    'lobby.footer.contactQuestions': 'Domande',
    'lobby.footer.contactBugBounty': 'Segnalazioni bug bounty',
    'lobby.footer.contactPartner': 'Diventa partner',
    'lobby.footer.contactMarketing': 'Marketing',
    'lobby.footer.providers': 'Fornitori',
    'lobby.footer.live': 'Live',
    'lobby.footer.drops': 'Rolluck Drops',
    'lobby.footer.referral': 'Programma referral',
    'lobby.footer.affiliate': 'Programma di affiliazione',
    'lobby.footer.swapCrypto': 'Scambia cripto',
    'lobby.footer.reportBug': 'Segnala un bug',
    'lobby.footer.privacy': 'Informativa sulla privacy',
    'lobby.footer.terms': 'Termini di servizio',
    'lobby.footer.sportsTerms': 'T&C scommesse sportive',
    'lobby.footer.earn': 'Guadagna',
    'lobby.footer.help': 'Aiuto',
    'lobby.footer.other': 'Altro',
    'lobby.footer.playResponsibly': 'Gioca responsabilmente',
    'lobby.footer.securePayments': 'Pagamenti sicuri e protetti',
    'lobby.footer.securityPriority': 'La tua sicurezza è la nostra priorità',
    'lobby.footer.backToTop': "Torna all'inizio",
    'lobby.footer.copyright': 'Copyright © {year} Rolluck. Tutti i diritti riservati.',

    // Sport names
    'lobby.sport.soccer': 'Calcio',
    'lobby.sport.tennis': 'Tennis',
    'lobby.sport.basketball': 'Basket',
    'lobby.sport.counterStrike': 'Counter-Strike',
    'lobby.sport.football': 'Calcio',
    'lobby.sport.americanFootball': 'Football americano',
    'lobby.sport.esports': 'Esport',
    'lobby.sport.cs2': 'CS2',
    'lobby.sport.fifa': 'FIFA',
    'lobby.sport.cricket': 'Cricket',
    'lobby.sport.tableTennis': 'Tennistavolo',
    'lobby.sport.valorant': 'Valorant',
    'lobby.sport.chess': 'Scacchi',
    'lobby.sport.dota2': 'Dota 2',
    'lobby.sport.lol': 'League of Legends',
    'lobby.sport.golf': 'Golf',
    'lobby.sport.live': 'Live',
    'lobby.sport.boxing': 'Pugilato',
    'lobby.sport.iceHockey': 'Hockey su ghiaccio',
    'lobby.sport.volleyball': 'Pallavolo',
    'lobby.sport.wrestling': 'Wrestling',
    'lobby.sport.sportsbook': 'Scommesse sportive',
    'lobby.sport.mma': 'MMA',
    'lobby.sport.horseRacing': 'Ippica',
    'lobby.sport.baseball': 'Baseball',
    'lobby.sport.hockey': 'Hockey',

    // Sportsbook
    'lobby.sports.liveGames': 'Partite live',
    'lobby.sports.england': 'Inghilterra',
    'lobby.sports.thirdQuarter': '3º quarto',

    // Crash preview
    'lobby.crash.currentPayout': 'VINCITA ATTUALE',
    'lobby.crash.playing': '{count} in gioco',
    'lobby.crash.autoCashout': 'Incasso automatico',
    'lobby.crash.autoCashoutHint': 'Limite moltiplicatore facoltativo',
    'lobby.crash.autoCashoutMultiplier': "Moltiplicatore dell'incasso automatico",
    'lobby.crash.clearAutoCashout': "Cancella l'incasso automatico",
    'lobby.crash.winOnCashout': "Vincita all'incasso:",
    'lobby.crash.networkFee': 'Commissione di rete:',

    // Streamers row
    'lobby.streams.freeSpinsBlurb': 'Giri gratis su {game} a {amount} a giro.',
    'lobby.streams.autoSpinBlurb': 'Giri automatici su {game} a {amount} a giro.',
    'lobby.streams.alt': '{name} in streaming su {game}',
    'lobby.streams.paused': 'In pausa',
    'lobby.streams.open': 'Apri lo stream',
    'lobby.streams.share': 'Condividi',

    // Header balance menu
    'lobby.balance.label': 'Saldo del portafoglio',
    'lobby.balance.displayingIn': 'Valuta visualizzata in {currency}',
    'lobby.balance.walletSettings': 'Impostazioni del portafoglio',

    // Support chat tray
    'lobby.chat.soon': 'La chat dal vivo con il nostro team di assistenza arriverà presto.',
    'lobby.chat.placeholder': 'Il tuo messaggio…',
    'lobby.chat.message': 'Il tuo messaggio',

    // Notification centre
    'lobby.notices.platform': 'Piattaforma',
    'lobby.notices.personal': 'Personali',
    'lobby.notices.personalEmpty': 'Non hai ancora notifiche personali.',
    'lobby.notices.fifaTitle': "Partecipa alla FIFA Fury World Cup '26",
    'lobby.notices.fifaBody':
      'Il più grande evento calcistico della storia è iniziato! Un montepremi enorme di $600 000 ti aspetta nel tabellone del torneo.',

    // Casino category chips
    'lobby.chips.blackjack': 'Blackjack',
    'lobby.chips.roulette': 'Roulette',
    'lobby.chips.baccarat': 'Baccarat',
    'lobby.chips.gameShows': 'Game show',
    'lobby.chips.boostedRtp': 'RTP potenziato',
    'lobby.chips.newArrivals': 'Novità',

    // Tournaments shelf
    'lobby.tournaments.wagerRace': 'Gara di puntate {provider}',

    // Recent winners
    'lobby.winners.title': 'Vincitori recenti',
    'lobby.winners.liveBets': 'Puntate live',
    'lobby.winners.activeWins': 'Vincite attive',
    'lobby.winners.allBets': 'Tutte le puntate',
    'lobby.winners.casinoWins': 'Vincite casinò',
    'lobby.winners.casinoBets': 'Puntate casinò',
    'lobby.winners.sportsBets': 'Scommesse sportive',
    'lobby.winners.cardTitle': '{user} ha vinto {payout} su {game}',

    // Rewards tray raffle card
    'lobby.raffle.title': 'ESTRAZIONE SETTIMANALE DA {amount}',
    'lobby.raffle.active': "Partecipazione all'estrazione attiva",

    // Game pages
    'lobby.game.breadcrumb': 'Percorso di navigazione',
  },
};
