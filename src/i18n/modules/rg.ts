import type { ModuleDict } from './types';

/**
 * Responsible Gambling — the player-protection section (`/responsible-gambling`).
 *
 * Owns the `rgc.` prefix. The core `rg.` block in locales.ts is English-only,
 * so everything this section renders lives here with all eight translations.
 */
export const en = {
  'rgc.title': 'Responsible Gambling',
  'rgc.metaDescription':
    'Set deposit, loss, wager and time limits, take a break with self-exclusion, check your budget, or take a short self-assessment.',
  'rgc.close': 'Close',
  'rgc.cancel': 'Cancel',
  'rgc.saving': 'Saving…',
  'rgc.navFaqs': 'FAQ’s',
  'rgc.navAssessment': 'Self-Assessment',
  'rgc.navLimits': 'Gambling Limits',
  'rgc.navExclusion': 'Self-exclusion',
  'rgc.navBudget': 'Budget Calculator',
  'rgc.supportTitle': 'Independent help',
  'rgc.supportLead':
    'These organisations have nothing to do with us. They are free, confidential, and talking to them does not commit you to anything.',
  'rgc.orgGamblingTherapy':
    'Free online support and live chat, available internationally in many languages.',
  'rgc.orgGamblersAnonymous':
    'A worldwide fellowship of people recovering from a gambling problem.',
  'rgc.orgGamCare': 'Free information, advice and counselling for anyone affected by gambling.',
  'rgc.orgBeGambleAware':
    'Independent advice, a self-assessment and a directory of local treatment.',
  'rgc.faqsTitle': 'FAQ’s',
  'rgc.faqQ1': 'How do I create an account on the Casino platform?',
  'rgc.faqA1':
    'To create an account, click the "Sign Up" button located at the top right corner of the homepage. Fill in the required details, including your email address, username, and a secure password. You will then receive a verification email — click the link to confirm your account. Once verified, you can log in, make your first deposit, and start playing. The entire process takes just a few minutes.',
  'rgc.faqQ2': 'Is my personal and financial information secure?',
  'rgc.faqA2':
    'Traffic between your device and our servers is encrypted, and card and wallet details are handled by our payment partners rather than stored on our systems. You can add two-factor authentication from Security in your account, and the same screen lists the devices currently signed in so an unfamiliar one is easy to spot and end.',
  'rgc.faqQ3': 'What should I do if I forget my account password?',
  'rgc.faqA3':
    'Use the "Forgot password" link on the sign-in screen. We email a reset link to the address on the account; opening it lets you set a new password. The link is single-use, and requesting a new one makes any earlier link invalid. If the email does not arrive, check your spam folder before asking for another.',
  'rgc.faqQ4': 'Which games are available on the Casino platform?',
  'rgc.faqA4':
    'Slots, live casino, table games and our own Rolluck Originals, listed under All Games with a provider filter if you are looking for a particular studio. Originals are provably fair — each round is built from a server seed, your client seed and a nonce, and you can change your seed and check any past round yourself.',
  'rgc.faqQ5': 'What payment methods are accepted for deposits?',
  'rgc.faqA5':
    'The wallet lists every method your account is eligible for, with the minimum, the maximum and what to expect for each. Crypto deposits credit once the network confirmations shown on the deposit screen have been seen. The methods offered can differ by account and by location, so the wallet is the accurate list rather than anything printed here.',
  'rgc.faqQ6': 'What bonuses and promotions are available for new players?',
  'rgc.faqA6':
    'The welcome package is shown on the lobby and in Promotions, and it attaches to your account at registration — there is nothing to redeem by hand. Promotions change, so Promotions is the current list; each one carries its own terms, which are worth reading before you opt in.',
  'rgc.faqQ7': 'Are there any wagering requirements on bonus offers?',
  'rgc.faqA7':
    'Usually yes, and the requirement is stated on the offer itself. Progress against it is shown with your bonus balance. Bonus funds are spent after your real balance, so you are never wagering a bonus while cash is still available, and the bonus converts to withdrawable funds once its requirement is met.',
  'rgc.faqQ8': 'Can I play Casino games on my mobile device?',
  'rgc.faqA8':
    'Yes. The site runs in a mobile browser with the same account, the same wallet and the same games — there is no separate app to install, and nothing needs to be transferred.',
  'rgc.faqQ9': 'How long do withdrawals take to process?',
  'rgc.faqA9':
    'A withdrawal is reviewed before it is sent, and how long the money then takes depends on the method you chose — crypto settles once the network confirms it, card and wallet returns on whatever schedule the provider keeps. A first withdrawal can take longer if identity verification has not been completed yet; clearing that once keeps later payouts on the faster path.',
  'rgc.faqQ10': 'How do I verify my identity to comply with KYC requirements?',
  'rgc.faqA10':
    'Verification lives under Verification in your account. You will be asked for identity details and documents; which ones depends on the checks that apply to you. Some actions — withdrawals in particular — can be held until it is complete, so it is worth doing before you need it rather than at the moment you want to cash out.',
  'rgc.faqQ11': 'How can I set deposit limits or self-exclude for responsible gaming?',
  'rgc.faqA11':
    'Both are on this page. Gambling Limits sets a cap on what you can deposit, and a reduction takes effect immediately while an increase is held for a cooling-off period, so a limit cannot be lifted in the moment you most want to lift it. Self-exclusion closes play for a period you choose and cannot be reversed early.',
  'rgc.faqQ12': 'How do I contact customer support if I have an issue?',
  'rgc.faqA12':
    'Email support@rolluck.com and include your username and what you were doing when the problem happened — it is the fastest route to someone who can look at your account. If what you need is independent of us, the organisations listed under Self-exclusion are free and confidential, and talking to them does not commit you to anything.',
  'rgc.assessmentTitle': 'Self-Assessment',
  'rgc.assessIntro':
    'Gambling can be an enjoyable pastime for many people, providing entertainment and the thrill of taking a risk. However, for some individuals, gambling can become more than just a harmless activity. It can develop into a serious problem that affects various aspects of their lives. Recognizing the signs of problem gambling is the first step towards addressing this issue. This self-assessment tool is designed to help you reflect on your gambling behaviour and determine whether it may be causing problems in your life. It is essential to approach this assessment with honesty and openness to gain a clear understanding of your gambling habits.',
  'rgc.assessPrompt': 'Do you have a gambling problem? Ask yourself the following questions:',
  'rgc.assessScreen1':
    'Have there ever been periods lasting two weeks or longer when you spent a lot of time thinking about your gambling experiences, planning out future gambling ventures or bets, or thinking about ways of getting money to gamble with?',
  'rgc.assessScreen2':
    'Have there ever been periods when you needed to gamble with increasing amounts of money or with larger bets than before in order to get the same feeling of excitement?',
  'rgc.assessScreen3':
    'Have you ever felt restless or irritable when trying to stop, cut down, or control your gambling?',
  'rgc.assessScreen4':
    'Have you tried and not succeeded in stopping, cutting down, or controlling your gambling three or more times in your life?',
  'rgc.assessScreen5':
    'Have you ever gambled to escape from personal problems, or to relieve uncomfortable feelings such as guilt, anxiety, helplessness, or depression?',
  'rgc.assessScreen6':
    'Has there ever been a period when, if you lost money gambling one day, you would often return another day to get even?',
  'rgc.assessScreen7':
    'Have you lied to family members, friends, or others about how much you gamble, and/or about how much money you lost on gambling, on at least three occasions?',
  'rgc.assessScreen8':
    "Have you ever written a bad cheque or taken money that didn't belong to you from family members, friends, or anyone else in order to pay for your gambling?",
  'rgc.assessScreen9':
    'Has your gambling ever caused serious or repeated problems in your relationships with any of your family members or friends? Or, has your gambling ever caused you problems at work or your studies?',
  'rgc.assessScreen10':
    'Have you ever needed to ask family members, friends, a lending institution, or anyone else to loan you money or otherwise bail you out of a desperate money situation that was largely caused by your gambling?',
  'rgc.assessReminder':
    '*REMINDER: this self-assessment will help you figure out if there is, or you are developing a problem. If you answered yes to one or more of the above questions, you should seek help.',
  'rgc.assessmentModalLead':
    'Tick anything that has applied to you in the last 12 months. Leave the rest.',
  'rgc.assessmentDisclaimer':
    'Your answers are counted, not stored against your name for any other purpose, and are never used to decide what marketing you receive.',
  'rgc.assessmentSeeResult': 'See my result',
  'rgc.quizQ1': 'Have you bet more than you could really afford to lose?',
  'rgc.quizQ2': 'Have you needed to bet larger amounts to get the same excitement?',
  'rgc.quizQ3': 'Have you gone back another day to win back money you lost?',
  'rgc.quizQ4': 'Have you borrowed money or sold anything in order to gamble?',
  'rgc.quizQ5': 'Have you felt that you might have a problem with gambling?',
  'rgc.quizQ6': 'Has gambling caused you stress, anxiety or other health problems?',
  'rgc.quizQ7':
    'Have other people criticised your gambling, whether or not you thought they were right?',
  'rgc.quizQ8': 'Has gambling caused money problems for you or the people you live with?',
  'rgc.quizQ9': 'Have you felt guilty about how you gamble, or what happens when you do?',
  'rgc.quizQ10':
    'Have you hidden your gambling, or played down how much you gamble, from people close to you?',
  'rgc.bandLowHeading': 'No warning signs in your answers',
  'rgc.bandLowBody':
    'Nothing you answered points to a problem today. That can change without being obvious, so it is worth coming back to these questions now and then — and setting a deposit limit while you feel in control costs you nothing.',
  'rgc.bandModerateHeading': 'Some signs worth paying attention to',
  'rgc.bandModerateBody':
    'A few of your answers are the ones services ask about for a reason. This is not a diagnosis and it does not mean you have a problem — but it is a good moment to set a limit, and to talk to somebody if any of it felt uncomfortably close.',
  'rgc.bandHighHeading': 'Several signs you should not ignore',
  'rgc.bandHighBody':
    'You answered yes to a number of the questions that matter most. We are not able to tell you what that means for you — but the people below can, they do it free and in confidence, and talking to them is not a commitment to stopping. Please consider setting a limit or taking a break while you think it over.',
  'rgc.limitsTitle': 'Gambling Limits',
  'rgc.limitsSet': 'Set Gambling Limit',
  'rgc.limitsPara1':
    'Take control of your play by setting loss or wagering limits. You can cap the maximum amount you lose or wager over a daily, weekly, monthly, or quarterly period.',
  'rgc.limitsPara2':
    'Removing a limit — takes effect at 00:00 (UTC+0) following a cooling-off period of at least 24 hours.',
  'rgc.limitsPara3':
    'Active limits reset automatically at 00:00 (UTC+0) at the end of each period.',
  'rgc.limitTypeLabel': 'Limit Type',
  'rgc.limitAmount': 'Limit Amount',
  'rgc.limitPeriod': 'Limit Period',
  'rgc.limitAdd': 'Add Limit',
  'rgc.limitMinutes': 'min',
  'rgc.limitDepositLabel': 'Deposit limit',
  'rgc.limitDepositDesc': 'The most you can add to your balance in the period you choose.',
  'rgc.limitLossLabel': 'Loss limit',
  'rgc.limitLossDesc': 'Caps what you can lose net of any wins, so a bad run has a floor.',
  'rgc.limitWagerLabel': 'Wager limit',
  'rgc.limitWagerDesc': 'The total you can stake, counted whether a bet wins or loses.',
  'rgc.limitSessionLabel': 'Time limit',
  'rgc.limitSessionDesc': 'How long you can play in the period, after which you are signed out.',
  'rgc.periodPerDay': 'Per day',
  'rgc.periodPerWeek': 'Per week',
  'rgc.periodPerMonth': 'Per month',
  'rgc.duration24h': '24 Hours',
  'rgc.duration7d': '7 Days',
  'rgc.duration30d': '30 Days',
  'rgc.duration3m': '3 Months',
  'rgc.duration6m': '6 Months',
  'rgc.duration1y': '1 Year',
  'rgc.duration5y': '5 Years',
  'rgc.exclusionTitle': 'Self-exclusion',
  'rgc.exclusionLead':
    'Are you seeking a break from Rolluck? Initiate the automated self-exclusion process by establishing a limit, and you will be temporarily barred from accessing your account for the selected period. Please be aware that during this time, you will not have access to any products on the website, and any remaining balances will also be unavailable.',
  'rgc.exclusionEmailNote': 'You will receive an email to confirm your request.',
  'rgc.exclusionStep1': 'Step 1: Take a 24 Hours Cooldown',
  'rgc.exclusionStep2': 'Step 2: Self-Exclusion',
  'rgc.exclusionConsent':
    'By requesting self-exclusion, I acknowledge the rules of self-exclusion and take full responsibility',
  'rgc.exclusionContinueAction': 'Continue',
  'rgc.signInExclusion':
    'Self-exclusion applies to your account, so you need to be logged in to set it. If you have already excluded yourself and cannot log in, that is working as intended — please contact support rather than opening a new account.',
  'rgc.optCooldown': '24 Hours Cooldown',
  'rgc.opt7d': '7 days',
  'rgc.opt30d': '30 days',
  'rgc.opt3m': '3 months',
  'rgc.opt6m': '6 months',
  'rgc.opt1y': '1 year',
  'rgc.opt5y': '5 years',
  'rgc.optPermanent': 'Permanent',
  'rgc.noteCooldown': 'A short break. Your account reopens automatically.',
  'rgc.note7d': 'A week away. Your account reopens automatically.',
  'rgc.note30d': 'A month away. Your account reopens automatically.',
  'rgc.noteFullPeriod': 'Your account stays closed for the full period.',
  'rgc.note5y': 'A long exclusion. Please be certain before you confirm.',
  'rgc.notePermanent': 'Your account is closed for good and cannot be reopened.',
  'rgc.confirmPhrase': 'EXCLUDE ME',
  'rgc.term1':
    'It cannot be undone. Once confirmed, the exclusion runs for the full period you chose — support cannot shorten or lift it, whatever the reason.',
  'rgc.term2':
    'You will be signed out immediately and will not be able to deposit, bet or open a new account.',
  'rgc.term3': 'Any balance you are holding is returned to you. Open bets are settled as normal.',
  'rgc.term4':
    'All marketing stops. You will not receive promotional email, SMS or push from us for the duration.',
  'rgc.term5':
    'Bonuses, free spins and loyalty progress tied to the account are forfeited and do not return when the period ends.',
  'rgc.term6':
    'When the period ends your account does not reopen on its own unless the period says so above — you have to ask for it back, and there is a waiting period before that takes effect.',
  'rgc.exclusionConfirmTitle': 'Self-exclusion ({period})',
  'rgc.exclusionBreakPeriod': 'Break period',
  'rgc.exclusionToday': 'Today',
  'rgc.exclusionConfirmBody':
    'During the self-exclusion period, you can still log in and withdraw your available balance. However, any amount requiring wagering (e.g., bonus or promotional credits) cannot be withdrawn until the exclusion period ends and the wagering requirements are fulfilled.',
  'rgc.exclusionUnderstand': 'By clicking confirm, I understand that:',
  'rgc.exclusionPoint1': 'I will STRICTLY NOT be able to cancel the {period}.',
  'rgc.exclusionPoint2': 'I will still be able to access my account and make withdrawals.',
  'rgc.exclusionPoint3': 'I will NOT be able to place any bets during {period}.',
  'rgc.exclusionPoint4': 'I will have my host automatically unassigned.',
  'rgc.exclusionTypeToConfirm': 'Type {phrase} to confirm',
  'rgc.exclusionConfirmWith': 'Confirm {period}',
  'rgc.exclusionActiveTitle': 'Self-exclusion',
  'rgc.exclusionActiveHeading': 'Your self-exclusion is active',
  'rgc.exclusionActiveBody':
    'You cannot deposit, bet, or open another account for the duration. This cannot be lifted early — please do not contact support to ask, because they are not able to do it.',
  'rgc.exclusionPeriod': 'Period',
  'rgc.exclusionEnds': 'Ends',
  'rgc.exclusionNever': 'Never',
  'rgc.budgetTitle': 'Budget Calculator',
  'rgc.budgetIncome': 'Income',
  'rgc.budgetExpenses': 'Expenses',
  'rgc.budgetTotalIncome': 'Total income',
  'rgc.budgetTotalExpenses': 'Total expenses',
  'rgc.budgetDisposable': 'Disposable income',
  'rgc.budgetWages': 'Wages after deductions',
  'rgc.budgetPensions': 'Pensions',
  'rgc.budgetBenefits': 'Benefits',
  'rgc.budgetOtherIncome': 'Other income',
  'rgc.budgetRent': 'Rent/mortgage',
  'rgc.budgetUtilities': 'Utility bills',
  'rgc.budgetLoans': 'Loans/credit',
  'rgc.budgetOtherExpenses': 'Other expenses',
  'rgc.budgetFieldIncome': 'Monthly take-home income',
  'rgc.budgetFieldIncomeHint': 'What actually reaches your account after tax.',
  'rgc.budgetFieldHousing': 'Rent or mortgage',
  'rgc.budgetFieldHousingHint': 'Including any service charge.',
  'rgc.budgetFieldUtilities': 'Bills and utilities',
  'rgc.budgetFieldUtilitiesHint': 'Power, water, internet, phone.',
  'rgc.budgetFieldFood': 'Food and household',
  'rgc.budgetFieldFoodHint': 'Groceries and essentials.',
  'rgc.budgetFieldTransport': 'Transport',
  'rgc.budgetFieldTransportHint': 'Fuel, fares, insurance.',
  'rgc.budgetFieldDebts': 'Loan and card repayments',
  'rgc.budgetFieldDebtsHint': 'The minimum you must pay each month.',
  'rgc.budgetFieldSavings': 'Savings and commitments',
  'rgc.budgetFieldSavingsHint': 'Money already promised elsewhere.',
  'rgc.budgetFieldOther': 'Everything else',
  'rgc.budgetFieldOtherHint': 'Childcare, subscriptions, medical.',
} as const;

export const translations: ModuleDict<typeof en> = {
  ar: {
    'rgc.title': 'اللعب المسؤول',
    'rgc.metaDescription':
      'حدِّد حدودًا للإيداع والخسارة والرهان والوقت، أو خذ استراحة عبر الاستبعاد الذاتي، أو راجع ميزانيتك، أو أجرِ تقييمًا ذاتيًا قصيرًا.',
    'rgc.close': 'إغلاق',
    'rgc.cancel': 'إلغاء',
    'rgc.saving': 'جارٍ الحفظ…',
    'rgc.navFaqs': 'الأسئلة الشائعة',
    'rgc.navAssessment': 'التقييم الذاتي',
    'rgc.navLimits': 'حدود اللعب',
    'rgc.navExclusion': 'الاستبعاد الذاتي',
    'rgc.navBudget': 'حاسبة الميزانية',
    'rgc.supportTitle': 'مساعدة مستقلة',
    'rgc.supportLead':
      'لا تربط هذه المنظمات بنا أي صلة. خدماتها مجانية وسرية، والتحدث إليها لا يُلزمك بأي شيء.',
    'rgc.orgGamblingTherapy': 'دعم مجاني عبر الإنترنت ودردشة مباشرة، متاحة دوليًا وبلغات عديدة.',
    'rgc.orgGamblersAnonymous': 'زمالة عالمية تضم أشخاصًا يتعافون من مشكلة القمار.',
    'rgc.orgGamCare': 'معلومات ونصائح واستشارات مجانية لكل من تأثّر بالقمار.',
    'rgc.orgBeGambleAware': 'نصائح مستقلة، وتقييم ذاتي، ودليل لجهات العلاج المحلية.',
    'rgc.faqsTitle': 'الأسئلة الشائعة',
    'rgc.faqQ1': 'كيف أُنشئ حسابًا على منصة الكازينو؟',
    'rgc.faqA1':
      'لإنشاء حساب، انقر على زر «إنشاء حساب» في أعلى الصفحة الرئيسية. املأ البيانات المطلوبة، بما فيها بريدك الإلكتروني واسم المستخدم وكلمة مرور آمنة. ستصلك بعد ذلك رسالة تحقق عبر البريد الإلكتروني — انقر على الرابط لتأكيد حسابك. بعد التحقق، يمكنك تسجيل الدخول وإجراء أول إيداع والبدء في اللعب. لا تستغرق العملية كلها سوى بضع دقائق.',
    'rgc.faqQ2': 'هل معلوماتي الشخصية والمالية آمنة؟',
    'rgc.faqA2':
      'البيانات المتبادلة بين جهازك وخوادمنا مشفّرة، وتتولى شركاؤنا في الدفع معالجة بيانات البطاقات والمحافظ بدلًا من تخزينها على أنظمتنا. يمكنك تفعيل المصادقة الثنائية من قسم «الأمان» في حسابك، وتعرض الشاشة نفسها الأجهزة المسجّل دخولها حاليًا، فيسهل عليك ملاحظة أي جهاز غير مألوف وإنهاء جلسته.',
    'rgc.faqQ3': 'ماذا أفعل إذا نسيت كلمة مرور حسابي؟',
    'rgc.faqA3':
      'استخدم رابط «نسيت كلمة المرور؟» في شاشة تسجيل الدخول. سنرسل رابط إعادة تعيين إلى البريد الإلكتروني المسجّل في الحساب؛ وبفتحه يمكنك تعيين كلمة مرور جديدة. الرابط صالح للاستخدام مرة واحدة فقط، وطلب رابط جديد يُبطل أي رابط سابق. إذا لم تصلك الرسالة، فتحقق من مجلد الرسائل غير المرغوب فيها قبل طلب رابط آخر.',
    'rgc.faqQ4': 'ما الألعاب المتاحة على منصة الكازينو؟',
    'rgc.faqA4':
      'السلوتس والكازينو المباشر وألعاب الطاولة وألعابنا الخاصة «ألعاب ROLLUCK الأصلية»، وكلها مدرجة ضمن «كل الألعاب» مع فلتر للمزوّد إن كنت تبحث عن استوديو معيّن. الألعاب الأصلية عادلة بشكل قابل للإثبات — تُبنى كل جولة من بذرة الخادم وبذرة العميل الخاصة بك ورقم nonce، ويمكنك تغيير بذرتك والتحقق بنفسك من أي جولة سابقة.',
    'rgc.faqQ5': 'ما طرق الدفع المقبولة للإيداع؟',
    'rgc.faqA5':
      'تعرض «المحفظة» كل طريقة يحق لحسابك استخدامها، مع الحد الأدنى والحد الأقصى وما يمكن توقعه لكل منها. تُضاف إيداعات العملات المشفرة إلى رصيدك بعد اكتمال تأكيدات الشبكة الموضحة في شاشة الإيداع. قد تختلف الطرق المتاحة حسب الحساب والموقع، لذا فإن المحفظة هي القائمة الدقيقة وليس ما هو مكتوب هنا.',
    'rgc.faqQ6': 'ما المكافآت والعروض المتاحة للاعبين الجدد؟',
    'rgc.faqA6':
      'تظهر باقة الترحيب في «الردهة» وفي «العروض»، وتُضاف إلى حسابك عند التسجيل — فلا حاجة إلى استردادها يدويًا. تتغير العروض باستمرار، لذا فإن صفحة «العروض» هي القائمة الحالية؛ ولكل عرض شروطه الخاصة التي تستحق القراءة قبل الاشتراك فيه.',
    'rgc.faqQ7': 'هل توجد متطلبات رهان على عروض المكافآت؟',
    'rgc.faqA7':
      'نعم في الغالب، ويُذكر المتطلب في العرض نفسه. ويظهر تقدّمك نحو استيفائه بجانب رصيد المكافآت. تُستخدم أموال المكافأة بعد رصيدك الحقيقي، فلا تراهن أبدًا بالمكافأة ما دام لديك رصيد نقدي متاح، وتتحول المكافأة إلى أموال قابلة للسحب بمجرد استيفاء متطلبها.',
    'rgc.faqQ8': 'هل يمكنني لعب ألعاب الكازينو على جهازي المحمول؟',
    'rgc.faqA8':
      'نعم. يعمل الموقع في متصفح الجوال بالحساب نفسه والمحفظة نفسها والألعاب نفسها — لا يوجد تطبيق منفصل لتثبيته، ولا حاجة إلى نقل أي شيء.',
    'rgc.faqQ9': 'كم تستغرق معالجة عمليات السحب؟',
    'rgc.faqA9':
      'تُراجَع عملية السحب قبل إرسالها، ثم تعتمد المدة التي تستغرقها الأموال للوصول على الطريقة التي اخترتها — تُسوّى العملات المشفرة بمجرد تأكيد الشبكة لها، أما البطاقات والمحافظ فتعود وفق الجدول الزمني الذي يعتمده المزوّد. قد يستغرق السحب الأول وقتًا أطول إذا لم يكتمل التحقق من الهوية بعد؛ وإتمامه مرة واحدة يُبقي عمليات الصرف اللاحقة على المسار الأسرع.',
    'rgc.faqQ10': 'كيف أتحقق من هويتي للامتثال لمتطلبات KYC؟',
    'rgc.faqA10':
      'يوجد التحقق ضمن قسم «التحقق» في حسابك. سيُطلب منك تقديم بيانات هوية ومستندات تعتمد على عمليات التدقيق التي تنطبق عليك. قد تُعلَّق بعض الإجراءات — ولا سيما عمليات السحب — حتى يكتمل التحقق، لذا يُستحسن إتمامه قبل أن تحتاج إليه بدلًا من اللحظة التي تريد فيها سحب أموالك.',
    'rgc.faqQ11': 'كيف يمكنني تحديد حدود للإيداع أو استبعاد نفسي ذاتيًا من أجل اللعب المسؤول؟',
    'rgc.faqA11':
      'كلاهما متاح في هذه الصفحة. يتيح لك قسم «حدود اللعب» وضع سقف لما يمكنك إيداعه، ويسري تخفيض الحد فورًا، بينما تُعلَّق زيادته لفترة تهدئة، حتى لا يمكن رفع الحد في اللحظة التي تكون فيها أكثر رغبة في رفعه. أما الاستبعاد الذاتي فيوقف اللعب لفترة تختارها، ولا يمكن إلغاؤه قبل انتهائها.',
    'rgc.faqQ12': 'كيف أتواصل مع خدمة العملاء إذا واجهتني مشكلة؟',
    'rgc.faqA12':
      'راسلنا على support@rolluck.com واذكر اسم المستخدم الخاص بك وما كنت تفعله عند حدوث المشكلة — فهذا أسرع طريق للوصول إلى شخص يمكنه الاطلاع على حسابك. وإذا كنت تحتاج إلى جهة مستقلة عنا، فالمنظمات المدرجة ضمن «الاستبعاد الذاتي» مجانية وسرية، والتحدث إليها لا يُلزمك بأي شيء.',
    'rgc.assessmentTitle': 'التقييم الذاتي',
    'rgc.assessIntro':
      'قد يكون القمار هواية ممتعة لكثير من الناس، إذ يوفر الترفيه وإثارة المخاطرة. لكنه لدى بعض الأفراد قد يتجاوز كونه نشاطًا غير ضار، فيتحول إلى مشكلة خطيرة تؤثر في جوانب مختلفة من حياتهم. والتعرف على علامات مشكلة القمار هو الخطوة الأولى نحو معالجتها. صُممت أداة التقييم الذاتي هذه لمساعدتك على التأمل في سلوكك في القمار وتحديد ما إذا كان يسبب مشكلات في حياتك. ومن الضروري أن تتعامل مع هذا التقييم بصدق وانفتاح لتكوين فهم واضح لعاداتك في القمار.',
    'rgc.assessPrompt': 'هل تعاني من مشكلة مع القمار؟ اسأل نفسك الأسئلة التالية:',
    'rgc.assessScreen1':
      'هل مرّت عليك فترات استمرت أسبوعين أو أكثر قضيت فيها وقتًا طويلًا في التفكير في تجاربك مع القمار، أو في التخطيط لمغامرات قمار أو رهانات مستقبلية، أو في التفكير في طرق للحصول على المال من أجل المقامرة؟',
    'rgc.assessScreen2':
      'هل مرّت عليك فترات احتجت فيها إلى المقامرة بمبالغ متزايدة أو برهانات أكبر من ذي قبل كي تشعر بالقدر نفسه من الإثارة؟',
    'rgc.assessScreen3':
      'هل شعرت يومًا بالتململ أو العصبية عند محاولتك التوقف عن القمار أو التقليل منه أو التحكم فيه؟',
    'rgc.assessScreen4':
      'هل حاولت التوقف عن القمار أو التقليل منه أو التحكم فيه ولم تنجح، ثلاث مرات أو أكثر في حياتك؟',
    'rgc.assessScreen5':
      'هل قامرت يومًا هروبًا من مشكلات شخصية، أو للتخفيف من مشاعر مزعجة مثل الذنب أو القلق أو العجز أو الاكتئاب؟',
    'rgc.assessScreen6':
      'هل مرّت عليك فترة كنت فيها، إذا خسرت مالًا في القمار في يوم ما، تعود غالبًا في يوم آخر لتعويض خسارتك؟',
    'rgc.assessScreen7':
      'هل كذبت على أفراد عائلتك أو أصدقائك أو غيرهم بشأن مقدار مقامرتك، و/أو بشأن مقدار المال الذي خسرته في القمار، في ثلاث مناسبات على الأقل؟',
    'rgc.assessScreen8':
      'هل حررت يومًا شيكًا بدون رصيد، أو أخذت مالًا لا يخصك من أفراد عائلتك أو أصدقائك أو أي شخص آخر من أجل تمويل مقامرتك؟',
    'rgc.assessScreen9':
      'هل تسبب القمار يومًا في مشكلات خطيرة أو متكررة في علاقاتك مع أي من أفراد عائلتك أو أصدقائك؟ أو هل تسبب لك القمار يومًا في مشكلات في عملك أو دراستك؟',
    'rgc.assessScreen10':
      'هل احتجت يومًا إلى أن تطلب من أفراد عائلتك أو أصدقائك أو مؤسسة إقراض أو أي شخص آخر أن يقرضك مالًا أو أن ينقذك بطريقة أخرى من وضع مالي يائس كان القمار سببه الرئيسي؟',
    'rgc.assessReminder':
      '*تذكير: سيساعدك هذا التقييم الذاتي على معرفة ما إذا كانت لديك مشكلة أو أنها في طور النشوء. إذا أجبت بنعم عن سؤال واحد أو أكثر من الأسئلة السابقة، فعليك طلب المساعدة.',
    'rgc.assessmentModalLead':
      'ضع علامة على كل ما انطبق عليك خلال الأشهر الـ 12 الماضية، واترك الباقي.',
    'rgc.assessmentDisclaimer':
      'تُحتسب إجاباتك فقط، ولا تُخزَّن مقترنة باسمك لأي غرض آخر، ولا تُستخدم أبدًا لتحديد المحتوى التسويقي الذي يصلك.',
    'rgc.assessmentSeeResult': 'عرض نتيجتي',
    'rgc.quizQ1': 'هل راهنت بأكثر مما تستطيع فعلًا تحمّل خسارته؟',
    'rgc.quizQ2': 'هل احتجت إلى المراهنة بمبالغ أكبر للشعور بالقدر نفسه من الإثارة؟',
    'rgc.quizQ3': 'هل عدت في يوم آخر لاسترداد المال الذي خسرته؟',
    'rgc.quizQ4': 'هل اقترضت مالًا أو بعت شيئًا من أجل المقامرة؟',
    'rgc.quizQ5': 'هل شعرت بأنك قد تعاني من مشكلة مع القمار؟',
    'rgc.quizQ6': 'هل سبّب لك القمار توترًا أو قلقًا أو مشكلات صحية أخرى؟',
    'rgc.quizQ7': 'هل انتقد الآخرون مقامرتك، سواء رأيت أنهم محقون أم لا؟',
    'rgc.quizQ8': 'هل سبّب القمار مشكلات مالية لك أو لمن يعيشون معك؟',
    'rgc.quizQ9': 'هل شعرت بالذنب حيال طريقة مقامرتك، أو حيال ما يحدث عندما تقامر؟',
    'rgc.quizQ10': 'هل أخفيت مقامرتك عن المقربين منك، أو قلّلت أمامهم من حجم مقامرتك؟',
    'rgc.bandLowHeading': 'لا توجد علامات تحذيرية في إجاباتك',
    'rgc.bandLowBody':
      'لا شيء في إجاباتك يشير إلى وجود مشكلة اليوم. لكن ذلك قد يتغير دون أن يكون واضحًا، لذا يستحق الأمر أن تعود إلى هذه الأسئلة من حين لآخر — كما أن تحديد حدٍّ للإيداع وأنت تشعر بالسيطرة لا يكلفك شيئًا.',
    'rgc.bandModerateHeading': 'بعض العلامات التي تستحق الانتباه',
    'rgc.bandModerateBody':
      'بعض إجاباتك تتعلق بأسئلة تطرحها جهات الدعم لسبب وجيه. هذا ليس تشخيصًا، ولا يعني أنك تعاني من مشكلة — لكنها لحظة مناسبة لتحديد حدٍّ، وللتحدث إلى أحد إذا شعرت بأن أيًّا من ذلك قريب منك على نحو مقلق.',
    'rgc.bandHighHeading': 'عدة علامات لا ينبغي تجاهلها',
    'rgc.bandHighBody':
      'أجبت بنعم عن عدد من أهم الأسئلة. لا يمكننا أن نخبرك بما يعنيه ذلك بالنسبة لك — لكن الجهات المذكورة أدناه تستطيع ذلك، وهي تقدّم هذه الخدمة مجانًا وبسرية تامة، والتحدث إليها لا يعني الالتزام بالتوقف. نرجو أن تفكر في تحديد حدٍّ أو أخذ استراحة ريثما تتأمل في الأمر.',
    'rgc.limitsTitle': 'حدود اللعب',
    'rgc.limitsSet': 'تحديد حد اللعب',
    'rgc.limitsPara1':
      'تحكّم في لعبك من خلال تحديد حدود للخسارة أو الرهان. يمكنك وضع سقف لأقصى مبلغ تخسره أو تراهن به خلال فترة يومية أو أسبوعية أو شهرية أو ربع سنوية.',
    'rgc.limitsPara2':
      'إزالة الحد — تسري عند الساعة 00:00 (UTC+0) بعد فترة تهدئة لا تقل عن 24 ساعة.',
    'rgc.limitsPara3':
      'يُعاد تعيين الحدود النشطة تلقائيًا عند الساعة 00:00 (UTC+0) في نهاية كل فترة.',
    'rgc.limitTypeLabel': 'نوع الحد',
    'rgc.limitAmount': 'قيمة الحد',
    'rgc.limitPeriod': 'فترة الحد',
    'rgc.limitAdd': 'إضافة حد',
    'rgc.limitMinutes': 'د',
    'rgc.limitDepositLabel': 'حد الإيداع',
    'rgc.limitDepositDesc': 'أقصى مبلغ يمكنك إضافته إلى رصيدك خلال الفترة التي تختارها.',
    'rgc.limitLossLabel': 'حد الخسارة',
    'rgc.limitLossDesc':
      'يضع سقفًا لصافي ما يمكنك خسارته بعد احتساب أي أرباح، فيكون لسلسلة الخسائر حدٌّ لا تتجاوزه.',
    'rgc.limitWagerLabel': 'حد الرهان',
    'rgc.limitWagerDesc': 'إجمالي ما يمكنك المراهنة به، ويُحتسب سواء ربح الرهان أم خسر.',
    'rgc.limitSessionLabel': 'حد الوقت',
    'rgc.limitSessionDesc': 'المدة التي يمكنك اللعب فيها خلال الفترة، وبعدها يُسجَّل خروجك.',
    'rgc.periodPerDay': 'يوميًا',
    'rgc.periodPerWeek': 'أسبوعيًا',
    'rgc.periodPerMonth': 'شهريًا',
    'rgc.duration24h': '24 ساعة',
    'rgc.duration7d': '7 أيام',
    'rgc.duration30d': '30 يومًا',
    'rgc.duration3m': '3 أشهر',
    'rgc.duration6m': '6 أشهر',
    'rgc.duration1y': 'سنة واحدة',
    'rgc.duration5y': '5 سنوات',
    'rgc.exclusionTitle': 'الاستبعاد الذاتي',
    'rgc.exclusionLead':
      'هل تبحث عن استراحة من Rolluck؟ ابدأ عملية الاستبعاد الذاتي التلقائية بتحديد مدة، وسيُمنع وصولك إلى حسابك مؤقتًا طوال الفترة المختارة. يُرجى العلم أنك خلال هذه الفترة لن تتمكن من الوصول إلى أي منتجات على الموقع، كما ستكون أي أرصدة متبقية غير متاحة أيضًا.',
    'rgc.exclusionEmailNote': 'ستصلك رسالة بريد إلكتروني لتأكيد طلبك.',
    'rgc.exclusionStep1': 'الخطوة 1: خذ فترة تهدئة لمدة 24 ساعة',
    'rgc.exclusionStep2': 'الخطوة 2: الاستبعاد الذاتي',
    'rgc.exclusionConsent':
      'بطلبي الاستبعاد الذاتي، أُقرّ بقواعد الاستبعاد الذاتي وأتحمّل المسؤولية كاملة',
    'rgc.exclusionContinueAction': 'متابعة',
    'rgc.signInExclusion':
      'ينطبق الاستبعاد الذاتي على حسابك، لذا يجب أن تكون مسجّل الدخول لتفعيله. إذا كنت قد استبعدت نفسك بالفعل ولا تستطيع تسجيل الدخول، فهذا هو المقصود تمامًا — يُرجى التواصل مع الدعم بدلًا من فتح حساب جديد.',
    'rgc.optCooldown': 'تهدئة لمدة 24 ساعة',
    'rgc.opt7d': '7 أيام',
    'rgc.opt30d': '30 يومًا',
    'rgc.opt3m': '3 أشهر',
    'rgc.opt6m': '6 أشهر',
    'rgc.opt1y': 'سنة واحدة',
    'rgc.opt5y': '5 سنوات',
    'rgc.optPermanent': 'دائم',
    'rgc.noteCooldown': 'استراحة قصيرة. يُعاد فتح حسابك تلقائيًا.',
    'rgc.note7d': 'أسبوع بعيدًا. يُعاد فتح حسابك تلقائيًا.',
    'rgc.note30d': 'شهر بعيدًا. يُعاد فتح حسابك تلقائيًا.',
    'rgc.noteFullPeriod': 'يبقى حسابك مغلقًا طوال الفترة كاملة.',
    'rgc.note5y': 'استبعاد طويل. يُرجى التأكد تمامًا قبل التأكيد.',
    'rgc.notePermanent': 'يُغلق حسابك نهائيًا ولا يمكن إعادة فتحه.',
    'rgc.confirmPhrase': 'استبعد حسابي',
    'rgc.term1':
      'لا يمكن التراجع عنه. بمجرد التأكيد، يستمر الاستبعاد طوال الفترة التي اخترتها كاملة — ولا يستطيع الدعم تقصيرها أو رفعها، مهما كان السبب.',
    'rgc.term2': 'سيُسجَّل خروجك فورًا، ولن تتمكن من الإيداع أو المراهنة أو فتح حساب جديد.',
    'rgc.term3': 'يُعاد إليك أي رصيد تحتفظ به. وتُسوّى الرهانات المفتوحة كالمعتاد.',
    'rgc.term4':
      'يتوقف كل التسويق. لن تصلك منا رسائل ترويجية عبر البريد الإلكتروني أو الرسائل النصية أو الإشعارات طوال هذه المدة.',
    'rgc.term5':
      'تسقط المكافآت واللفات المجانية وتقدّم برنامج الولاء المرتبطة بالحساب، ولا تعود عند انتهاء الفترة.',
    'rgc.term6':
      'عند انتهاء الفترة لا يُعاد فتح حسابك تلقائيًا ما لم تنص الفترة على ذلك أعلاه — بل عليك أن تطلب استعادته، وهناك فترة انتظار قبل أن يسري ذلك.',
    'rgc.exclusionConfirmTitle': 'الاستبعاد الذاتي ({period})',
    'rgc.exclusionBreakPeriod': 'فترة الاستراحة',
    'rgc.exclusionToday': 'اليوم',
    'rgc.exclusionConfirmBody':
      'خلال فترة الاستبعاد الذاتي، يظل بإمكانك تسجيل الدخول وسحب رصيدك المتاح. غير أن أي مبلغ يتطلب رهانًا (مثل المكافآت أو الأرصدة الترويجية) لا يمكن سحبه حتى تنتهي فترة الاستبعاد وتُستوفى متطلبات الرهان.',
    'rgc.exclusionUnderstand': 'بالنقر على «تأكيد»، أُدرك ما يلي:',
    'rgc.exclusionPoint1': 'لن أتمكن إطلاقًا من إلغاء فترة الاستبعاد ({period}).',
    'rgc.exclusionPoint2': 'سأظل قادرًا على الوصول إلى حسابي وإجراء عمليات السحب.',
    'rgc.exclusionPoint3': 'لن أتمكن من وضع أي رهانات خلال فترة الاستبعاد ({period}).',
    'rgc.exclusionPoint4': 'سيُلغى تعيين مدير حسابي المخصص تلقائيًا.',
    'rgc.exclusionTypeToConfirm': 'اكتب {phrase} للتأكيد',
    'rgc.exclusionConfirmWith': 'تأكيد الاستبعاد ({period})',
    'rgc.exclusionActiveTitle': 'الاستبعاد الذاتي',
    'rgc.exclusionActiveHeading': 'الاستبعاد الذاتي الخاص بك مُفعّل',
    'rgc.exclusionActiveBody':
      'لا يمكنك الإيداع أو المراهنة أو فتح حساب آخر طوال هذه المدة. لا يمكن رفع الاستبعاد قبل موعده — يُرجى عدم التواصل مع الدعم لطلب ذلك، لأنهم لا يستطيعون القيام به.',
    'rgc.exclusionPeriod': 'الفترة',
    'rgc.exclusionEnds': 'ينتهي في',
    'rgc.exclusionNever': 'أبدًا',
    'rgc.budgetTitle': 'حاسبة الميزانية',
    'rgc.budgetIncome': 'الدخل',
    'rgc.budgetExpenses': 'المصروفات',
    'rgc.budgetTotalIncome': 'إجمالي الدخل',
    'rgc.budgetTotalExpenses': 'إجمالي المصروفات',
    'rgc.budgetDisposable': 'الدخل المتاح للإنفاق',
    'rgc.budgetWages': 'الأجور بعد الاستقطاعات',
    'rgc.budgetPensions': 'المعاشات التقاعدية',
    'rgc.budgetBenefits': 'الإعانات',
    'rgc.budgetOtherIncome': 'دخل آخر',
    'rgc.budgetRent': 'الإيجار/الرهن العقاري',
    'rgc.budgetUtilities': 'فواتير الخدمات',
    'rgc.budgetLoans': 'القروض/الائتمان',
    'rgc.budgetOtherExpenses': 'مصروفات أخرى',
    'rgc.budgetFieldIncome': 'صافي الدخل الشهري',
    'rgc.budgetFieldIncomeHint': 'ما يصل فعليًا إلى حسابك بعد الضرائب.',
    'rgc.budgetFieldHousing': 'الإيجار أو الرهن العقاري',
    'rgc.budgetFieldHousingHint': 'بما في ذلك أي رسوم خدمات.',
    'rgc.budgetFieldUtilities': 'الفواتير والخدمات',
    'rgc.budgetFieldUtilitiesHint': 'الكهرباء والمياه والإنترنت والهاتف.',
    'rgc.budgetFieldFood': 'الطعام والمستلزمات المنزلية',
    'rgc.budgetFieldFoodHint': 'البقالة والضروريات.',
    'rgc.budgetFieldTransport': 'المواصلات',
    'rgc.budgetFieldTransportHint': 'الوقود وأجور التنقل والتأمين.',
    'rgc.budgetFieldDebts': 'أقساط القروض والبطاقات',
    'rgc.budgetFieldDebtsHint': 'الحد الأدنى الذي يجب سداده كل شهر.',
    'rgc.budgetFieldSavings': 'المدخرات والالتزامات',
    'rgc.budgetFieldSavingsHint': 'أموال مخصصة مسبقًا لأغراض أخرى.',
    'rgc.budgetFieldOther': 'كل ما عدا ذلك',
    'rgc.budgetFieldOtherHint': 'رعاية الأطفال والاشتراكات والنفقات الطبية.',
  },
  tr: {
    'rgc.title': 'Sorumlu Oyun',
    'rgc.metaDescription':
      'Para yatırma, kayıp, bahis ve süre limitleri belirleyin, kendini dışlama ile ara verin, bütçenizi kontrol edin veya kısa bir öz değerlendirme yapın.',
    'rgc.close': 'Kapat',
    'rgc.cancel': 'İptal',
    'rgc.saving': 'Kaydediliyor…',
    'rgc.navFaqs': 'SSS',
    'rgc.navAssessment': 'Öz Değerlendirme',
    'rgc.navLimits': 'Oyun Limitleri',
    'rgc.navExclusion': 'Kendini dışlama',
    'rgc.navBudget': 'Bütçe Hesaplayıcı',
    'rgc.supportTitle': 'Bağımsız yardım',
    'rgc.supportLead':
      'Bu kuruluşların bizimle hiçbir bağlantısı yoktur. Ücretsiz ve gizlidirler; onlarla konuşmak sizi hiçbir şeye bağlamaz.',
    'rgc.orgGamblingTherapy':
      'Uluslararası düzeyde, birçok dilde ücretsiz çevrimiçi destek ve canlı sohbet.',
    'rgc.orgGamblersAnonymous':
      'Kumar sorunundan kurtulmakta olan kişilerden oluşan dünya çapında bir dayanışma topluluğu.',
    'rgc.orgGamCare': 'Kumardan etkilenen herkes için ücretsiz bilgi, tavsiye ve danışmanlık.',
    'rgc.orgBeGambleAware':
      'Bağımsız tavsiye, bir öz değerlendirme aracı ve yerel tedavi hizmetleri rehberi.',
    'rgc.faqsTitle': 'SSS',
    'rgc.faqQ1': 'Casino platformunda nasıl hesap oluştururum?',
    'rgc.faqA1':
      'Hesap oluşturmak için ana sayfanın sağ üst köşesindeki "Kayıt ol" düğmesine tıklayın. E-posta adresiniz, kullanıcı adınız ve güvenli bir şifre dahil olmak üzere gerekli bilgileri doldurun. Ardından bir doğrulama e-postası alacaksınız — hesabınızı onaylamak için bağlantıya tıklayın. Doğrulandıktan sonra giriş yapabilir, ilk para yatırma işleminizi yapabilir ve oynamaya başlayabilirsiniz. Tüm süreç yalnızca birkaç dakika sürer.',
    'rgc.faqQ2': 'Kişisel ve finansal bilgilerim güvende mi?',
    'rgc.faqA2':
      'Cihazınız ile sunucularımız arasındaki trafik şifrelenir; kart ve cüzdan bilgileriniz sistemlerimizde saklanmaz, ödeme ortaklarımız tarafından işlenir. Hesabınızdaki Güvenlik bölümünden iki faktörlü kimlik doğrulamayı ekleyebilirsiniz; aynı ekranda o anda oturum açık olan cihazlar listelenir, böylece tanımadığınız bir cihazı kolayca fark edip oturumunu sonlandırabilirsiniz.',
    'rgc.faqQ3': 'Hesap şifremi unutursam ne yapmalıyım?',
    'rgc.faqA3':
      'Giriş ekranındaki "Şifrenizi mi unuttunuz?" bağlantısını kullanın. Hesapta kayıtlı adrese bir sıfırlama bağlantısı gönderiyoruz; bu bağlantıyı açarak yeni bir şifre belirleyebilirsiniz. Bağlantı yalnızca bir kez kullanılabilir ve yeni bir bağlantı istediğinizde önceki bağlantılar geçersiz olur. E-posta gelmezse, yenisini istemeden önce spam klasörünüzü kontrol edin.',
    'rgc.faqQ4': 'Casino platformunda hangi oyunlar mevcut?',
    'rgc.faqA4':
      'Slotlar, canlı casino, masa oyunları ve kendi ROLLUCK Originals oyunlarımız; hepsi Tüm oyunlar altında listelenir ve belirli bir stüdyoyu arıyorsanız sağlayıcı filtresi kullanabilirsiniz. Originals oyunları kanıtlanabilir şekilde adildir — her tur bir sunucu tohumu, sizin istemci tohumunuz ve bir nonce değerinden oluşturulur; tohumunuzu değiştirebilir ve geçmiş herhangi bir turu kendiniz doğrulayabilirsiniz.',
    'rgc.faqQ5': 'Para yatırma için hangi ödeme yöntemleri kabul ediliyor?',
    'rgc.faqA5':
      'Cüzdan, hesabınızın kullanabileceği tüm yöntemleri her biri için minimum ve maksimum tutarlarla ve neler beklemeniz gerektiğiyle birlikte listeler. Kripto para yatırma işlemleri, para yatırma ekranında gösterilen ağ onayları alındığında hesabınıza geçer. Sunulan yöntemler hesaba ve konuma göre farklılık gösterebilir; bu nedenle burada yazanlar değil, cüzdandaki liste doğru listedir.',
    'rgc.faqQ6': 'Yeni oyuncular için hangi bonuslar ve promosyonlar var?',
    'rgc.faqA6':
      'Hoş geldin paketi lobide ve Promosyonlar bölümünde gösterilir ve kayıt sırasında hesabınıza otomatik olarak tanımlanır — elle kullanmanız gereken bir şey yoktur. Promosyonlar değişir; güncel liste Promosyonlar bölümündedir. Her birinin kendi şartları vardır ve katılmadan önce bunları okumanızda fayda vardır.',
    'rgc.faqQ7': 'Bonus tekliflerinde çevrim şartı var mı?',
    'rgc.faqA7':
      'Genellikle evet ve şart teklifin üzerinde belirtilir. Bu şarta karşı ilerlemeniz bonus bakiyenizle birlikte gösterilir. Bonus fonları gerçek bakiyenizden sonra harcanır, yani nakit bakiyeniz varken asla bonusla bahis yapmış olmazsınız; bonus, çevrim şartı karşılandığında çekilebilir bakiyeye dönüşür.',
    'rgc.faqQ8': 'Casino oyunlarını mobil cihazımda oynayabilir miyim?',
    'rgc.faqA8':
      'Evet. Site, aynı hesap, aynı cüzdan ve aynı oyunlarla mobil tarayıcıda çalışır — yüklemeniz gereken ayrı bir uygulama yoktur ve hiçbir şeyi aktarmanız gerekmez.',
    'rgc.faqQ9': 'Para çekme işlemlerinin tamamlanması ne kadar sürer?',
    'rgc.faqA9':
      'Para çekme talebi gönderilmeden önce incelenir; paranın size ulaşma süresi ise seçtiğiniz yönteme bağlıdır — kripto, ağ onayladığında tamamlanır; kart ve cüzdan ödemeleri ise sağlayıcının işlem takvimine göre gerçekleşir. Kimlik doğrulaması henüz tamamlanmadıysa ilk para çekme işlemi daha uzun sürebilir; bunu bir kez tamamlamak sonraki ödemelerin daha hızlı yoldan ilerlemesini sağlar.',
    'rgc.faqQ10': 'KYC gerekliliklerine uymak için kimliğimi nasıl doğrularım?',
    'rgc.faqA10':
      'Doğrulama işlemleri hesabınızdaki Doğrulama bölümündedir. Sizden kimlik bilgileri ve belgeler istenecektir; hangilerinin isteneceği size uygulanan kontrollere bağlıdır. Bazı işlemler — özellikle para çekme — doğrulama tamamlanana kadar bekletilebilir; bu yüzden bunu para çekmek istediğiniz anda değil, ihtiyaç duymadan önce yapmanızda fayda vardır.',
    'rgc.faqQ11':
      'Sorumlu oyun için nasıl para yatırma limiti belirleyebilir veya kendimi dışlayabilirim?',
    'rgc.faqA11':
      'Her ikisi de bu sayfadadır. Oyun Limitleri, yatırabileceğiniz tutara bir üst sınır koyar; limiti düşürmek hemen geçerli olurken artırma talebi bir bekleme süresi boyunca bekletilir, böylece bir limit en çok kaldırmak istediğiniz anda kaldırılamaz. Kendini dışlama, seçtiğiniz süre boyunca oyunu kapatır ve süresinden önce geri alınamaz.',
    'rgc.faqQ12': 'Bir sorun yaşarsam müşteri desteğiyle nasıl iletişime geçerim?',
    'rgc.faqA12':
      'support@rolluck.com adresine e-posta gönderin ve kullanıcı adınızı ve sorun oluştuğunda ne yaptığınızı belirtin — bu, hesabınızı inceleyebilecek birine ulaşmanın en hızlı yoludur. Bizden bağımsız bir desteğe ihtiyacınız varsa, Kendini dışlama bölümünde listelenen kuruluşlar ücretsiz ve gizlidir; onlarla konuşmak sizi hiçbir şeye bağlamaz.',
    'rgc.assessmentTitle': 'Öz Değerlendirme',
    'rgc.assessIntro':
      'Kumar, birçok kişi için eğlence ve risk almanın heyecanını sunan keyifli bir uğraş olabilir. Ancak bazı kişiler için kumar, zararsız bir etkinlikten daha fazlasına dönüşebilir. Hayatlarının çeşitli yönlerini etkileyen ciddi bir soruna dönüşebilir. Sorunlu kumarın belirtilerini fark etmek, bu sorunu ele almanın ilk adımıdır. Bu öz değerlendirme aracı, kumar davranışınız üzerine düşünmenize ve bunun hayatınızda sorunlara yol açıp açmadığını belirlemenize yardımcı olmak için tasarlanmıştır. Kumar alışkanlıklarınızı net bir şekilde anlayabilmek için bu değerlendirmeye dürüst ve açık bir tutumla yaklaşmanız çok önemlidir.',
    'rgc.assessPrompt': 'Kumar sorununuz var mı? Kendinize aşağıdaki soruları sorun:',
    'rgc.assessScreen1':
      'Hiç iki hafta veya daha uzun süren, kumar deneyimlerinizi düşünerek, gelecekteki kumar girişimlerinizi veya bahislerinizi planlayarak ya da kumar oynamak için para bulmanın yollarını düşünerek çok zaman geçirdiğiniz dönemler oldu mu?',
    'rgc.assessScreen2':
      'Hiç aynı heyecanı yaşayabilmek için giderek artan miktarlarda parayla veya eskisinden daha büyük bahislerle kumar oynamanız gereken dönemler oldu mu?',
    'rgc.assessScreen3':
      'Kumarı bırakmaya, azaltmaya veya kontrol etmeye çalışırken hiç huzursuz ya da sinirli hissettiniz mi?',
    'rgc.assessScreen4':
      'Hayatınızda üç veya daha fazla kez kumarı bırakmayı, azaltmayı veya kontrol etmeyi deneyip başaramadınız mı?',
    'rgc.assessScreen5':
      'Hiç kişisel sorunlarınızdan kaçmak ya da suçluluk, kaygı, çaresizlik veya depresyon gibi rahatsız edici duyguları hafifletmek için kumar oynadınız mı?',
    'rgc.assessScreen6':
      'Hiç, bir gün kumarda para kaybettiğinizde kaybınızı telafi etmek için sık sık başka bir gün yeniden oynadığınız bir dönem oldu mu?',
    'rgc.assessScreen7':
      'Ne kadar kumar oynadığınız ve/veya kumarda ne kadar para kaybettiğiniz konusunda aile üyelerinize, arkadaşlarınıza veya başkalarına en az üç kez yalan söylediniz mi?',
    'rgc.assessScreen8':
      'Kumar masraflarınızı karşılamak için hiç karşılıksız çek yazdınız mı ya da aile üyelerinizden, arkadaşlarınızdan veya başka birinden size ait olmayan parayı aldınız mı?',
    'rgc.assessScreen9':
      'Kumar oynamanız hiç aile üyelerinizden veya arkadaşlarınızdan herhangi biriyle olan ilişkilerinizde ciddi ya da tekrarlayan sorunlara yol açtı mı? Ya da kumar oynamanız hiç işinizde veya eğitiminizde sorun yaşamanıza neden oldu mu?',
    'rgc.assessScreen10':
      'Büyük ölçüde kumar oynamanızdan kaynaklanan çaresiz bir maddi durumdan kurtulmak için hiç aile üyelerinizden, arkadaşlarınızdan, bir kredi kuruluşundan veya başka birinden borç para istemeniz ya da başka bir şekilde sizi kurtarmalarını istemeniz gerekti mi?',
    'rgc.assessReminder':
      '*HATIRLATMA: Bu öz değerlendirme, bir sorununuz olup olmadığını veya bir sorunun gelişmekte olup olmadığını anlamanıza yardımcı olacaktır. Yukarıdaki sorulardan bir veya daha fazlasına evet yanıtı verdiyseniz yardım almalısınız.',
    'rgc.assessmentModalLead':
      'Son 12 ay içinde sizin için geçerli olan her şeyi işaretleyin. Diğerlerini boş bırakın.',
    'rgc.assessmentDisclaimer':
      'Yanıtlarınız yalnızca sayılır; başka herhangi bir amaçla adınıza kayıtlı olarak saklanmaz ve size hangi pazarlama içeriklerinin gönderileceğine karar vermek için asla kullanılmaz.',
    'rgc.assessmentSeeResult': 'Sonucumu gör',
    'rgc.quizQ1': 'Gerçekten kaybetmeyi göze alabileceğinizden daha fazlasıyla bahis oynadınız mı?',
    'rgc.quizQ2': 'Aynı heyecanı yaşamak için daha yüksek tutarlarla bahis oynamanız gerekti mi?',
    'rgc.quizQ3': 'Kaybettiğiniz parayı geri kazanmak için başka bir gün yeniden oynadınız mı?',
    'rgc.quizQ4': 'Kumar oynamak için borç para aldınız veya bir şey sattınız mı?',
    'rgc.quizQ5': 'Kumarla ilgili bir sorununuz olabileceğini hissettiniz mi?',
    'rgc.quizQ6': 'Kumar size stres, kaygı veya başka sağlık sorunları yaşattı mı?',
    'rgc.quizQ7':
      'Haklı olduklarını düşünseniz de düşünmeseniz de, başkaları kumar oynamanızı eleştirdi mi?',
    'rgc.quizQ8':
      'Kumar sizin veya birlikte yaşadığınız kişilerin maddi sorunlar yaşamasına neden oldu mu?',
    'rgc.quizQ9':
      'Nasıl kumar oynadığınız veya oynadığınızda yaşananlar konusunda suçluluk duydunuz mu?',
    'rgc.quizQ10':
      'Kumar oynadığınızı yakınlarınızdan sakladınız mı veya ne kadar oynadığınızı onlara olduğundan az gösterdiniz mi?',
    'rgc.bandLowHeading': 'Yanıtlarınızda uyarı işareti yok',
    'rgc.bandLowBody':
      'Verdiğiniz yanıtların hiçbiri bugün bir soruna işaret etmiyor. Bu durum fark edilmeden değişebilir; bu yüzden zaman zaman bu sorulara geri dönmenizde fayda var — ve kendinizi kontrol altında hissederken bir para yatırma limiti belirlemek size hiçbir şey kaybettirmez.',
    'rgc.bandModerateHeading': 'Dikkat etmeye değer bazı işaretler',
    'rgc.bandModerateBody':
      'Yanıtlarınızdan bazıları, destek hizmetlerinin boşuna sormadığı türden yanıtlar. Bu bir teşhis değildir ve bir sorununuz olduğu anlamına gelmez — ancak bir limit belirlemek ve bunlardan herhangi biri size rahatsız edici derecede tanıdık geldiyse biriyle konuşmak için iyi bir an.',
    'rgc.bandHighHeading': 'Göz ardı etmemeniz gereken birkaç işaret',
    'rgc.bandHighBody':
      'En önemli sorulardan birçoğuna evet yanıtı verdiniz. Bunun sizin için ne anlama geldiğini söyleyemeyiz — ancak aşağıdaki kişiler söyleyebilir; bunu ücretsiz ve gizlilik içinde yaparlar ve onlarla konuşmak bırakmayı taahhüt etmek anlamına gelmez. Lütfen bunu düşünürken bir limit belirlemeyi veya ara vermeyi değerlendirin.',
    'rgc.limitsTitle': 'Oyun Limitleri',
    'rgc.limitsSet': 'Oyun Limiti Belirle',
    'rgc.limitsPara1':
      'Kayıp veya bahis limitleri belirleyerek oyununuzun kontrolünü elinize alın. Günlük, haftalık, aylık veya üç aylık bir dönem içinde kaybedebileceğiniz ya da bahis yapabileceğiniz maksimum tutarı sınırlayabilirsiniz.',
    'rgc.limitsPara2':
      "Bir limitin kaldırılması — en az 24 saatlik bir bekleme süresinin ardından 00:00'da (UTC+0) geçerli olur.",
    'rgc.limitsPara3':
      "Aktif limitler her dönemin sonunda 00:00'da (UTC+0) otomatik olarak sıfırlanır.",
    'rgc.limitTypeLabel': 'Limit Türü',
    'rgc.limitAmount': 'Limit Tutarı',
    'rgc.limitPeriod': 'Limit Dönemi',
    'rgc.limitAdd': 'Limit Ekle',
    'rgc.limitMinutes': 'dk',
    'rgc.limitDepositLabel': 'Para yatırma limiti',
    'rgc.limitDepositDesc': 'Seçtiğiniz dönemde bakiyenize ekleyebileceğiniz en yüksek tutar.',
    'rgc.limitLossLabel': 'Kayıp limiti',
    'rgc.limitLossDesc':
      'Kazançlar düşüldükten sonra kaybedebileceğiniz tutarı sınırlar; böylece kötü giden bir serinin bir alt sınırı olur.',
    'rgc.limitWagerLabel': 'Bahis limiti',
    'rgc.limitWagerDesc':
      'Bahis kazansa da kaybetse de hesaba katılan, yatırabileceğiniz toplam bahis tutarı.',
    'rgc.limitSessionLabel': 'Süre limiti',
    'rgc.limitSessionDesc':
      'Dönem içinde ne kadar süre oynayabileceğiniz; bu süre dolduğunda oturumunuz kapatılır.',
    'rgc.periodPerDay': 'Günlük',
    'rgc.periodPerWeek': 'Haftalık',
    'rgc.periodPerMonth': 'Aylık',
    'rgc.duration24h': '24 Saat',
    'rgc.duration7d': '7 Gün',
    'rgc.duration30d': '30 Gün',
    'rgc.duration3m': '3 Ay',
    'rgc.duration6m': '6 Ay',
    'rgc.duration1y': '1 Yıl',
    'rgc.duration5y': '5 Yıl',
    'rgc.exclusionTitle': 'Kendini dışlama',
    'rgc.exclusionLead':
      "Rolluck'a ara vermek mi istiyorsunuz? Bir süre belirleyerek otomatik kendini dışlama sürecini başlatın; seçilen süre boyunca hesabınıza erişiminiz geçici olarak engellenecektir. Lütfen bu süre zarfında web sitesindeki hiçbir ürüne erişemeyeceğinizi ve kalan bakiyelerinizin de kullanılamayacağını unutmayın.",
    'rgc.exclusionEmailNote': 'Talebinizi onaylamanız için bir e-posta alacaksınız.',
    'rgc.exclusionStep1': 'Adım 1: 24 Saatlik Mola Verin',
    'rgc.exclusionStep2': 'Adım 2: Kendini Dışlama',
    'rgc.exclusionConsent':
      'Kendini dışlama talebinde bulunarak kendini dışlama kurallarını kabul ediyor ve tüm sorumluluğu üstleniyorum',
    'rgc.exclusionContinueAction': 'Devam et',
    'rgc.signInExclusion':
      'Kendini dışlama hesabınıza uygulanır, bu nedenle ayarlamak için giriş yapmış olmanız gerekir. Kendinizi zaten dışladıysanız ve giriş yapamıyorsanız, sistem amaçlandığı gibi çalışıyor demektir — lütfen yeni bir hesap açmak yerine destek ekibiyle iletişime geçin.',
    'rgc.optCooldown': '24 Saatlik Mola',
    'rgc.opt7d': '7 gün',
    'rgc.opt30d': '30 gün',
    'rgc.opt3m': '3 ay',
    'rgc.opt6m': '6 ay',
    'rgc.opt1y': '1 yıl',
    'rgc.opt5y': '5 yıl',
    'rgc.optPermanent': 'Kalıcı',
    'rgc.noteCooldown': 'Kısa bir ara. Hesabınız otomatik olarak yeniden açılır.',
    'rgc.note7d': 'Bir haftalık ara. Hesabınız otomatik olarak yeniden açılır.',
    'rgc.note30d': 'Bir aylık ara. Hesabınız otomatik olarak yeniden açılır.',
    'rgc.noteFullPeriod': 'Hesabınız sürenin tamamı boyunca kapalı kalır.',
    'rgc.note5y': 'Uzun bir dışlama. Lütfen onaylamadan önce emin olun.',
    'rgc.notePermanent': 'Hesabınız kalıcı olarak kapatılır ve yeniden açılamaz.',
    'rgc.confirmPhrase': 'DIŞLAMAYI ONAYLA',
    'rgc.term1':
      'Geri alınamaz. Onaylandıktan sonra dışlama, seçtiğiniz sürenin tamamı boyunca devam eder — sebep ne olursa olsun destek ekibi bu süreyi kısaltamaz veya kaldıramaz.',
    'rgc.term2':
      'Oturumunuz hemen kapatılır; para yatıramaz, bahis yapamaz veya yeni bir hesap açamazsınız.',
    'rgc.term3':
      'Elinizde bulunan bakiye size iade edilir. Açık bahisler normal şekilde sonuçlandırılır.',
    'rgc.term4':
      'Tüm pazarlama iletişimleri durur. Bu süre boyunca bizden tanıtım amaçlı e-posta, SMS veya anlık bildirim almazsınız.',
    'rgc.term5':
      'Hesaba bağlı bonuslar, bedava dönüşler ve sadakat ilerlemesi geçersiz olur ve süre sona erdiğinde geri gelmez.',
    'rgc.term6':
      'Süre sona erdiğinde, yukarıda aksi belirtilmedikçe hesabınız kendiliğinden yeniden açılmaz — yeniden açılmasını talep etmeniz gerekir ve bunun geçerli olmasından önce bir bekleme süresi vardır.',
    'rgc.exclusionConfirmTitle': 'Kendini dışlama ({period})',
    'rgc.exclusionBreakPeriod': 'Ara süresi',
    'rgc.exclusionToday': 'Bugün',
    'rgc.exclusionConfirmBody':
      'Kendini dışlama süresi boyunca yine de giriş yapabilir ve kullanılabilir bakiyenizi çekebilirsiniz. Ancak çevrim şartı gerektiren tutarlar (ör. bonus veya promosyon kredileri), dışlama süresi sona erene ve çevrim şartları karşılanana kadar çekilemez.',
    'rgc.exclusionUnderstand': "Onayla'ya tıklayarak şunları anladığımı kabul ediyorum:",
    'rgc.exclusionPoint1': 'Seçtiğim süreyi ({period}) KESİNLİKLE iptal EDEMEYECEĞİM.',
    'rgc.exclusionPoint2': 'Hesabıma yine de erişebilecek ve para çekebileceğim.',
    'rgc.exclusionPoint3': 'Bu süre ({period}) boyunca HİÇBİR bahis YAPAMAYACAĞIM.',
    'rgc.exclusionPoint4': 'Bana atanmış hesap yöneticisi (host) otomatik olarak kaldırılacak.',
    'rgc.exclusionTypeToConfirm': 'Onaylamak için {phrase} yazın',
    'rgc.exclusionConfirmWith': 'Onayla: {period}',
    'rgc.exclusionActiveTitle': 'Kendini dışlama',
    'rgc.exclusionActiveHeading': 'Kendini dışlamanız etkin',
    'rgc.exclusionActiveBody':
      'Bu süre boyunca para yatıramaz, bahis yapamaz veya başka bir hesap açamazsınız. Bu durum süresinden önce kaldırılamaz — lütfen bunu istemek için destek ekibiyle iletişime geçmeyin, çünkü bunu yapma yetkileri yoktur.',
    'rgc.exclusionPeriod': 'Süre',
    'rgc.exclusionEnds': 'Bitiş',
    'rgc.exclusionNever': 'Hiçbir zaman',
    'rgc.budgetTitle': 'Bütçe Hesaplayıcı',
    'rgc.budgetIncome': 'Gelir',
    'rgc.budgetExpenses': 'Giderler',
    'rgc.budgetTotalIncome': 'Toplam gelir',
    'rgc.budgetTotalExpenses': 'Toplam gider',
    'rgc.budgetDisposable': 'Harcanabilir gelir',
    'rgc.budgetWages': 'Kesintiler sonrası maaş',
    'rgc.budgetPensions': 'Emekli maaşları',
    'rgc.budgetBenefits': 'Sosyal yardımlar',
    'rgc.budgetOtherIncome': 'Diğer gelirler',
    'rgc.budgetRent': 'Kira/konut kredisi',
    'rgc.budgetUtilities': 'Faturalar',
    'rgc.budgetLoans': 'Krediler/borçlar',
    'rgc.budgetOtherExpenses': 'Diğer giderler',
    'rgc.budgetFieldIncome': 'Aylık net gelir',
    'rgc.budgetFieldIncomeHint': 'Vergiden sonra hesabınıza gerçekten yatan tutar.',
    'rgc.budgetFieldHousing': 'Kira veya konut kredisi',
    'rgc.budgetFieldHousingHint': 'Aidat dahil.',
    'rgc.budgetFieldUtilities': 'Faturalar ve hizmetler',
    'rgc.budgetFieldUtilitiesHint': 'Elektrik, su, internet, telefon.',
    'rgc.budgetFieldFood': 'Gıda ve ev giderleri',
    'rgc.budgetFieldFoodHint': 'Market alışverişi ve temel ihtiyaçlar.',
    'rgc.budgetFieldTransport': 'Ulaşım',
    'rgc.budgetFieldTransportHint': 'Yakıt, bilet ücretleri, sigorta.',
    'rgc.budgetFieldDebts': 'Kredi ve kart ödemeleri',
    'rgc.budgetFieldDebtsHint': 'Her ay ödemeniz gereken asgari tutar.',
    'rgc.budgetFieldSavings': 'Birikimler ve taahhütler',
    'rgc.budgetFieldSavingsHint': 'Başka bir yere ayrılmış olan para.',
    'rgc.budgetFieldOther': 'Diğer her şey',
    'rgc.budgetFieldOtherHint': 'Çocuk bakımı, abonelikler, sağlık giderleri.',
  },
  hi: {
    'rgc.title': 'जिम्मेदार जुआ',
    'rgc.metaDescription':
      'डिपॉज़िट, नुकसान, दांव और समय की सीमाएँ तय करें, स्व-बहिष्करण से ब्रेक लें, अपना बजट जाँचें, या एक छोटा स्व-मूल्यांकन करें।',
    'rgc.close': 'बंद करें',
    'rgc.cancel': 'रद्द करें',
    'rgc.saving': 'सहेजा जा रहा है…',
    'rgc.navFaqs': 'अक्सर पूछे जाने वाले प्रश्न',
    'rgc.navAssessment': 'स्व-मूल्यांकन',
    'rgc.navLimits': 'जुए की सीमाएँ',
    'rgc.navExclusion': 'स्व-बहिष्करण',
    'rgc.navBudget': 'बजट कैलकुलेटर',
    'rgc.supportTitle': 'स्वतंत्र सहायता',
    'rgc.supportLead':
      'इन संगठनों का हमसे कोई संबंध नहीं है। ये मुफ़्त और गोपनीय हैं, और इनसे बात करने से आप किसी भी चीज़ के लिए बाध्य नहीं होते।',
    'rgc.orgGamblingTherapy':
      'मुफ़्त ऑनलाइन सहायता और लाइव चैट, दुनिया भर में कई भाषाओं में उपलब्ध।',
    'rgc.orgGamblersAnonymous': 'जुए की समस्या से उबर रहे लोगों का एक विश्वव्यापी समूह।',
    'rgc.orgGamCare': 'जुए से प्रभावित किसी भी व्यक्ति के लिए मुफ़्त जानकारी, सलाह और काउंसलिंग।',
    'rgc.orgBeGambleAware': 'स्वतंत्र सलाह, एक स्व-मूल्यांकन और स्थानीय उपचार केंद्रों की सूची।',
    'rgc.faqsTitle': 'अक्सर पूछे जाने वाले प्रश्न',
    'rgc.faqQ1': 'मैं कैसीनो प्लेटफ़ॉर्म पर अकाउंट कैसे बनाऊँ?',
    'rgc.faqA1':
      'अकाउंट बनाने के लिए होमपेज के ऊपर दाएँ कोने में मौजूद "रजिस्टर करें" बटन पर क्लिक करें। ज़रूरी विवरण भरें, जिनमें आपका ईमेल पता, यूज़रनेम और एक सुरक्षित पासवर्ड शामिल हैं। इसके बाद आपको एक सत्यापन ईमेल मिलेगा — अपना अकाउंट कन्फ़र्म करने के लिए उसमें दिए गए लिंक पर क्लिक करें। सत्यापन हो जाने के बाद आप लॉग इन कर सकते हैं, अपना पहला डिपॉज़िट कर सकते हैं और खेलना शुरू कर सकते हैं। पूरी प्रक्रिया में बस कुछ ही मिनट लगते हैं।',
    'rgc.faqQ2': 'क्या मेरी व्यक्तिगत और वित्तीय जानकारी सुरक्षित है?',
    'rgc.faqA2':
      'आपके डिवाइस और हमारे सर्वर के बीच का ट्रैफ़िक एन्क्रिप्टेड होता है, और कार्ड व वॉलेट विवरण हमारे सिस्टम पर स्टोर होने के बजाय हमारे भुगतान पार्टनर संभालते हैं। आप अपने अकाउंट में सुरक्षा से टू-फ़ैक्टर ऑथेंटिकेशन जोड़ सकते हैं, और उसी स्क्रीन पर उन डिवाइस की सूची होती है जिन पर अभी साइन इन है, ताकि कोई अनजान डिवाइस आसानी से पहचाना और उसका सेशन खत्म किया जा सके।',
    'rgc.faqQ3': 'अगर मैं अपने अकाउंट का पासवर्ड भूल जाऊँ तो क्या करूँ?',
    'rgc.faqA3':
      'साइन-इन स्क्रीन पर "पासवर्ड भूल गए?" लिंक का इस्तेमाल करें। हम अकाउंट से जुड़े पते पर एक रीसेट लिंक ईमेल करते हैं; उसे खोलकर आप नया पासवर्ड सेट कर सकते हैं। यह लिंक सिर्फ़ एक बार इस्तेमाल हो सकता है, और नया लिंक माँगने पर पहले वाला कोई भी लिंक अमान्य हो जाता है। अगर ईमेल न आए, तो दोबारा माँगने से पहले अपना स्पैम फ़ोल्डर देख लें।',
    'rgc.faqQ4': 'कैसीनो प्लेटफ़ॉर्म पर कौन-कौन से गेम उपलब्ध हैं?',
    'rgc.faqA4':
      'स्लॉट, लाइव कैसीनो, टेबल गेम और हमारे अपने ROLLUCK ओरिजिनल्स, जो सभी गेम में सूचीबद्ध हैं; किसी खास स्टूडियो को ढूँढ़ने के लिए वहाँ प्रोवाइडर फ़िल्टर भी है। ओरिजिनल्स प्रोवेबली फ़ेयर हैं — हर राउंड एक सर्वर सीड, आपके क्लाइंट सीड और एक नॉन्स से बनता है, और आप अपना सीड बदल सकते हैं और किसी भी पिछले राउंड को खुद जाँच सकते हैं।',
    'rgc.faqQ5': 'डिपॉज़िट के लिए कौन-से भुगतान तरीके स्वीकार किए जाते हैं?',
    'rgc.faqA5':
      'वॉलेट में वे सभी तरीके दिखते हैं जिनके लिए आपका अकाउंट योग्य है, साथ ही हर एक की न्यूनतम और अधिकतम राशि और उससे क्या उम्मीद करें। क्रिप्टो डिपॉज़िट तब जमा होते हैं जब डिपॉज़िट स्क्रीन पर दिखाए गए नेटवर्क कन्फ़र्मेशन पूरे हो जाते हैं। उपलब्ध तरीके अकाउंट और लोकेशन के अनुसार अलग हो सकते हैं, इसलिए सही सूची वॉलेट में ही है, यहाँ लिखी किसी बात में नहीं।',
    'rgc.faqQ6': 'नए खिलाड़ियों के लिए कौन-से बोनस और प्रोमोशन उपलब्ध हैं?',
    'rgc.faqA6':
      'वेलकम पैकेज लॉबी और प्रोमोशन में दिखाया जाता है, और रजिस्ट्रेशन के समय ही आपके अकाउंट से जुड़ जाता है — खुद से कुछ भी रिडीम नहीं करना पड़ता। प्रोमोशन बदलते रहते हैं, इसलिए मौजूदा सूची प्रोमोशन में ही है; हर एक की अपनी शर्तें होती हैं, जिन्हें ऑप्ट इन करने से पहले पढ़ लेना अच्छा है।',
    'rgc.faqQ7': 'क्या बोनस ऑफ़र पर कोई वेजरिंग शर्तें होती हैं?',
    'rgc.faqA7':
      'आमतौर पर हाँ, और यह शर्त ऑफ़र पर ही लिखी होती है। इसकी प्रगति आपके बोनस बैलेंस के साथ दिखाई जाती है। बोनस राशि आपके रियल बैलेंस के बाद खर्च होती है, इसलिए जब तक नकद उपलब्ध है तब तक आप कभी बोनस से दांव नहीं लगा रहे होते, और शर्त पूरी होते ही बोनस निकासी योग्य राशि में बदल जाता है।',
    'rgc.faqQ8': 'क्या मैं अपने मोबाइल डिवाइस पर कैसीनो गेम खेल सकता/सकती हूँ?',
    'rgc.faqA8':
      'हाँ। साइट मोबाइल ब्राउज़र में उसी अकाउंट, उसी वॉलेट और उन्हीं गेम के साथ चलती है — कोई अलग ऐप इंस्टॉल नहीं करना पड़ता, और कुछ भी ट्रांसफ़र करने की ज़रूरत नहीं होती।',
    'rgc.faqQ9': 'निकासी प्रोसेस होने में कितना समय लगता है?',
    'rgc.faqA9':
      'निकासी भेजे जाने से पहले उसकी समीक्षा की जाती है, और उसके बाद पैसा पहुँचने में कितना समय लगेगा यह आपके चुने हुए तरीके पर निर्भर करता है — क्रिप्टो नेटवर्क के कन्फ़र्म करते ही सेटल हो जाता है, जबकि कार्ड और वॉलेट प्रोवाइडर के अपने शेड्यूल के अनुसार लौटते हैं। अगर पहचान सत्यापन अभी पूरा नहीं हुआ है तो पहली निकासी में ज़्यादा समय लग सकता है; इसे एक बार पूरा कर लेने से आगे के भुगतान तेज़ रास्ते से होते हैं।',
    'rgc.faqQ10': 'KYC शर्तों को पूरा करने के लिए मैं अपनी पहचान का सत्यापन कैसे करूँ?',
    'rgc.faqA10':
      'सत्यापन आपके अकाउंट में सत्यापन के अंतर्गत होता है। आपसे पहचान से जुड़े विवरण और दस्तावेज़ माँगे जाएँगे; कौन-से, यह आप पर लागू होने वाली जाँचों पर निर्भर करता है। कुछ काम — खासकर निकासी — इसके पूरा होने तक रोके जा सकते हैं, इसलिए इसे पैसा निकालने के समय के बजाय ज़रूरत पड़ने से पहले ही कर लेना बेहतर है।',
    'rgc.faqQ11':
      'जिम्मेदार गेमिंग के लिए मैं डिपॉज़िट सीमा कैसे तय करूँ या स्व-बहिष्करण कैसे करूँ?',
    'rgc.faqA11':
      'दोनों इसी पेज पर हैं। जुए की सीमाएँ से आप यह तय कर सकते हैं कि अधिकतम कितना डिपॉज़िट कर सकते हैं; सीमा घटाना तुरंत लागू होता है, जबकि बढ़ाने पर एक कूलिंग-ऑफ़ अवधि तक रोक रहती है, ताकि जिस पल आप सीमा हटाना सबसे ज़्यादा चाहें, उस पल उसे हटाया न जा सके। स्व-बहिष्करण आपकी चुनी हुई अवधि के लिए खेलना बंद कर देता है और इसे समय से पहले वापस नहीं लिया जा सकता।',
    'rgc.faqQ12': 'अगर मुझे कोई समस्या हो तो मैं ग्राहक सहायता से कैसे संपर्क करूँ?',
    'rgc.faqA12':
      'support@rolluck.com पर ईमेल करें और उसमें अपना यूज़रनेम और समस्या होते समय आप क्या कर रहे थे, यह लिखें — आपके अकाउंट को देख सकने वाले व्यक्ति तक पहुँचने का यही सबसे तेज़ तरीका है। अगर आपको हमसे स्वतंत्र मदद चाहिए, तो स्व-बहिष्करण में सूचीबद्ध संगठन मुफ़्त और गोपनीय हैं, और उनसे बात करने से आप किसी भी चीज़ के लिए बाध्य नहीं होते।',
    'rgc.assessmentTitle': 'स्व-मूल्यांकन',
    'rgc.assessIntro':
      'बहुत से लोगों के लिए जुआ मनोरंजन का एक आनंददायक साधन हो सकता है, जो मनोरंजन और जोखिम उठाने का रोमांच देता है। लेकिन कुछ लोगों के लिए जुआ एक हानिरहित गतिविधि से कहीं बढ़कर बन सकता है। यह एक गंभीर समस्या का रूप ले सकता है जो उनके जीवन के कई पहलुओं को प्रभावित करती है। समस्यात्मक जुए के संकेतों को पहचानना इस समस्या से निपटने की दिशा में पहला कदम है। यह स्व-मूल्यांकन टूल इसलिए बनाया गया है ताकि आप अपने जुआ खेलने के व्यवहार पर विचार कर सकें और तय कर सकें कि क्या यह आपके जीवन में समस्याएँ पैदा कर रहा है। अपनी जुए की आदतों को साफ़ तौर पर समझने के लिए इस मूल्यांकन को ईमानदारी और खुलेपन के साथ करना बहुत ज़रूरी है।',
    'rgc.assessPrompt': 'क्या आपको जुए की समस्या है? खुद से ये सवाल पूछें:',
    'rgc.assessScreen1':
      'क्या कभी दो हफ़्ते या उससे ज़्यादा समय तक ऐसे दौर रहे हैं जब आपने अपने जुए के अनुभवों के बारे में सोचने, भविष्य में जुआ खेलने या दांव लगाने की योजना बनाने, या जुआ खेलने के लिए पैसे जुटाने के तरीकों के बारे में सोचने में बहुत समय बिताया हो?',
    'rgc.assessScreen2':
      'क्या कभी ऐसे दौर रहे हैं जब वही रोमांच महसूस करने के लिए आपको पहले से ज़्यादा पैसों से या बड़े दांव लगाकर जुआ खेलने की ज़रूरत पड़ी हो?',
    'rgc.assessScreen3':
      'क्या जुआ रोकने, कम करने या उस पर नियंत्रण रखने की कोशिश करते समय आपको कभी बेचैनी या चिड़चिड़ापन महसूस हुआ है?',
    'rgc.assessScreen4':
      'क्या आपने अपने जीवन में तीन या उससे ज़्यादा बार जुआ रोकने, कम करने या उस पर नियंत्रण रखने की कोशिश की है और उसमें सफलता नहीं मिली?',
    'rgc.assessScreen5':
      'क्या आपने कभी निजी समस्याओं से बचने के लिए, या अपराधबोध, चिंता, बेबसी या अवसाद जैसी असहज भावनाओं से राहत पाने के लिए जुआ खेला है?',
    'rgc.assessScreen6':
      'क्या कभी ऐसा दौर रहा है जब किसी दिन जुए में पैसे हारने पर आप अक्सर किसी और दिन वह नुकसान बराबर करने के लिए वापस आते थे?',
    'rgc.assessScreen7':
      'क्या आपने कम से कम तीन बार परिवार के सदस्यों, दोस्तों या दूसरों से इस बारे में झूठ बोला है कि आप कितना जुआ खेलते हैं, और/या आपने जुए में कितने पैसे हारे हैं?',
    'rgc.assessScreen8':
      'क्या आपने कभी अपने जुए का खर्च उठाने के लिए कोई बाउंस होने वाला चेक लिखा है, या परिवार के सदस्यों, दोस्तों या किसी और से ऐसा पैसा लिया है जो आपका नहीं था?',
    'rgc.assessScreen9':
      'क्या आपके जुए की वजह से कभी आपके परिवार के किसी सदस्य या दोस्तों के साथ आपके रिश्तों में गंभीर या बार-बार समस्याएँ हुई हैं? या, क्या आपके जुए की वजह से कभी आपको काम पर या पढ़ाई में समस्याएँ हुई हैं?',
    'rgc.assessScreen10':
      'क्या आपको कभी परिवार के सदस्यों, दोस्तों, किसी ऋण देने वाली संस्था या किसी और से पैसे उधार माँगने पड़े हैं, या किसी और तरह से ऐसी गंभीर आर्थिक मुश्किल से निकालने के लिए कहना पड़ा है जो काफ़ी हद तक आपके जुए की वजह से पैदा हुई थी?',
    'rgc.assessReminder':
      '*याद रखें: यह स्व-मूल्यांकन आपको यह समझने में मदद करेगा कि क्या कोई समस्या है, या कोई समस्या पनप रही है। अगर आपने ऊपर दिए गए एक या उससे ज़्यादा सवालों का जवाब हाँ में दिया है, तो आपको मदद लेनी चाहिए।',
    'rgc.assessmentModalLead':
      'पिछले 12 महीनों में जो भी बात आप पर लागू हुई हो, उस पर निशान लगाएँ। बाकी को छोड़ दें।',
    'rgc.assessmentDisclaimer':
      'आपके जवाबों की सिर्फ़ गिनती की जाती है, उन्हें किसी और उद्देश्य से आपके नाम के साथ स्टोर नहीं किया जाता, और यह तय करने के लिए कभी इस्तेमाल नहीं किया जाता कि आपको कौन-सी मार्केटिंग भेजी जाए।',
    'rgc.assessmentSeeResult': 'मेरा परिणाम देखें',
    'rgc.quizQ1': 'क्या आपने उससे ज़्यादा दांव लगाया है जितना हारना आप सच में सह सकते थे?',
    'rgc.quizQ2': 'क्या वही रोमांच पाने के लिए आपको बड़ी रकम के दांव लगाने की ज़रूरत पड़ी है?',
    'rgc.quizQ3': 'क्या आप हारा हुआ पैसा वापस जीतने के लिए किसी और दिन फिर से खेलने गए हैं?',
    'rgc.quizQ4': 'क्या आपने जुआ खेलने के लिए पैसे उधार लिए हैं या कुछ बेचा है?',
    'rgc.quizQ5': 'क्या आपको कभी लगा है कि आपको जुए की समस्या हो सकती है?',
    'rgc.quizQ6': 'क्या जुए की वजह से आपको तनाव, चिंता या कोई और स्वास्थ्य समस्या हुई है?',
    'rgc.quizQ7':
      'क्या दूसरे लोगों ने आपके जुआ खेलने की आलोचना की है, चाहे आपको लगा हो कि वे सही थे या नहीं?',
    'rgc.quizQ8':
      'क्या जुए की वजह से आपको या आपके साथ रहने वाले लोगों को पैसों की समस्याएँ हुई हैं?',
    'rgc.quizQ9':
      'क्या आपको अपने जुआ खेलने के तरीके को लेकर, या जुआ खेलने पर जो होता है उसे लेकर अपराधबोध महसूस हुआ है?',
    'rgc.quizQ10':
      'क्या आपने अपने करीबी लोगों से अपना जुआ छिपाया है, या उन्हें बताया है कि आप असल से कम जुआ खेलते हैं?',
    'rgc.bandLowHeading': 'आपके जवाबों में कोई चेतावनी संकेत नहीं',
    'rgc.bandLowBody':
      'आपके किसी भी जवाब से आज कोई समस्या नहीं दिखती। यह स्थिति बिना साफ़ दिखे बदल सकती है, इसलिए समय-समय पर इन सवालों पर लौटना अच्छा है — और जब आप नियंत्रण में महसूस करें, तब डिपॉज़िट सीमा तय करने में आपका कुछ नहीं जाता।',
    'rgc.bandModerateHeading': 'कुछ संकेत जिन पर ध्यान देना चाहिए',
    'rgc.bandModerateBody':
      'आपके कुछ जवाब ठीक वही हैं जिनके बारे में सहायता सेवाएँ किसी वजह से पूछती हैं। यह कोई निदान नहीं है और इसका मतलब यह नहीं कि आपको समस्या है — लेकिन यह सीमा तय करने का अच्छा मौका है, और अगर इनमें से कोई बात असहज रूप से आपसे मेल खाती लगी हो तो किसी से बात करने का भी।',
    'rgc.bandHighHeading': 'कई संकेत जिन्हें आपको नज़रअंदाज़ नहीं करना चाहिए',
    'rgc.bandHighBody':
      'आपने सबसे अहम सवालों में से कई का जवाब हाँ में दिया है। हम आपको यह नहीं बता सकते कि आपके लिए इसका क्या मतलब है — लेकिन नीचे दिए गए लोग बता सकते हैं, वे यह मुफ़्त और गोपनीय रूप से करते हैं, और उनसे बात करने का मतलब जुआ छोड़ने का वादा करना नहीं है। इस पर सोचते समय कृपया सीमा तय करने या ब्रेक लेने पर विचार करें।',
    'rgc.limitsTitle': 'जुए की सीमाएँ',
    'rgc.limitsSet': 'जुए की सीमा तय करें',
    'rgc.limitsPara1':
      'नुकसान या दांव की सीमाएँ तय करके अपने खेल पर नियंत्रण रखें। आप दैनिक, साप्ताहिक, मासिक या तिमाही अवधि में हारने या दांव लगाने की अधिकतम राशि सीमित कर सकते हैं।',
    'rgc.limitsPara2':
      'सीमा हटाना — कम से कम 24 घंटे की कूलिंग-ऑफ़ अवधि के बाद 00:00 (UTC+0) पर लागू होता है।',
    'rgc.limitsPara3':
      'सक्रिय सीमाएँ हर अवधि के अंत में 00:00 (UTC+0) पर अपने-आप रीसेट हो जाती हैं।',
    'rgc.limitTypeLabel': 'सीमा का प्रकार',
    'rgc.limitAmount': 'सीमा राशि',
    'rgc.limitPeriod': 'सीमा अवधि',
    'rgc.limitAdd': 'सीमा जोड़ें',
    'rgc.limitMinutes': 'मिनट',
    'rgc.limitDepositLabel': 'डिपॉज़िट सीमा',
    'rgc.limitDepositDesc': 'आपकी चुनी हुई अवधि में आप अपने बैलेंस में अधिकतम कितना जोड़ सकते हैं।',
    'rgc.limitLossLabel': 'नुकसान सीमा',
    'rgc.limitLossDesc':
      'जीत घटाकर आप कुल कितना हार सकते हैं, इसकी सीमा तय करती है, ताकि बुरे दौर में भी नुकसान की एक हद रहे।',
    'rgc.limitWagerLabel': 'दांव सीमा',
    'rgc.limitWagerDesc':
      'आप कुल कितना दांव पर लगा सकते हैं, चाहे दांव जीते या हारे, सब गिना जाता है।',
    'rgc.limitSessionLabel': 'समय सीमा',
    'rgc.limitSessionDesc':
      'अवधि में आप कितनी देर खेल सकते हैं; इसके बाद आपको साइन आउट कर दिया जाता है।',
    'rgc.periodPerDay': 'प्रति दिन',
    'rgc.periodPerWeek': 'प्रति सप्ताह',
    'rgc.periodPerMonth': 'प्रति माह',
    'rgc.duration24h': '24 घंटे',
    'rgc.duration7d': '7 दिन',
    'rgc.duration30d': '30 दिन',
    'rgc.duration3m': '3 महीने',
    'rgc.duration6m': '6 महीने',
    'rgc.duration1y': '1 साल',
    'rgc.duration5y': '5 साल',
    'rgc.exclusionTitle': 'स्व-बहिष्करण',
    'rgc.exclusionLead':
      'क्या आप Rolluck से ब्रेक लेना चाहते हैं? एक सीमा तय करके स्वचालित स्व-बहिष्करण प्रक्रिया शुरू करें, और चुनी गई अवधि के लिए आपके अकाउंट तक पहुँच अस्थायी रूप से रोक दी जाएगी। कृपया ध्यान दें कि इस दौरान आप वेबसाइट के किसी भी प्रोडक्ट का इस्तेमाल नहीं कर पाएँगे, और कोई भी बचा हुआ बैलेंस भी उपलब्ध नहीं होगा।',
    'rgc.exclusionEmailNote': 'अपने अनुरोध की पुष्टि करने के लिए आपको एक ईमेल मिलेगा।',
    'rgc.exclusionStep1': 'चरण 1: 24 घंटे का कूलडाउन लें',
    'rgc.exclusionStep2': 'चरण 2: स्व-बहिष्करण',
    'rgc.exclusionConsent':
      'स्व-बहिष्करण का अनुरोध करने के साथ, स्व-बहिष्करण के नियम मुझे स्वीकार हैं और इसकी पूरी ज़िम्मेदारी मेरी है',
    'rgc.exclusionContinueAction': 'जारी रखें',
    'rgc.signInExclusion':
      'स्व-बहिष्करण आपके अकाउंट पर लागू होता है, इसलिए इसे सेट करने के लिए आपको लॉग इन करना होगा। अगर आप पहले ही स्व-बहिष्करण कर चुके हैं और लॉग इन नहीं कर पा रहे हैं, तो यह ठीक वैसे ही काम कर रहा है जैसा इसे करना चाहिए — कृपया नया अकाउंट खोलने के बजाय सहायता टीम से संपर्क करें।',
    'rgc.optCooldown': '24 घंटे का कूलडाउन',
    'rgc.opt7d': '7 दिन',
    'rgc.opt30d': '30 दिन',
    'rgc.opt3m': '3 महीने',
    'rgc.opt6m': '6 महीने',
    'rgc.opt1y': '1 साल',
    'rgc.opt5y': '5 साल',
    'rgc.optPermanent': 'स्थायी',
    'rgc.noteCooldown': 'एक छोटा ब्रेक। आपका अकाउंट अपने-आप फिर से खुल जाएगा।',
    'rgc.note7d': 'एक हफ़्ते का ब्रेक। आपका अकाउंट अपने-आप फिर से खुल जाएगा।',
    'rgc.note30d': 'एक महीने का ब्रेक। आपका अकाउंट अपने-आप फिर से खुल जाएगा।',
    'rgc.noteFullPeriod': 'आपका अकाउंट पूरी अवधि तक बंद रहेगा।',
    'rgc.note5y': 'एक लंबा बहिष्करण। पुष्टि करने से पहले कृपया पूरी तरह निश्चित हो लें।',
    'rgc.notePermanent': 'आपका अकाउंट हमेशा के लिए बंद हो जाएगा और फिर से नहीं खोला जा सकेगा।',
    'rgc.confirmPhrase': 'मुझे बाहर करें',
    'rgc.term1':
      'इसे वापस नहीं लिया जा सकता। पुष्टि होने के बाद बहिष्करण आपकी चुनी हुई पूरी अवधि तक चलेगा — कारण चाहे जो हो, सहायता टीम इसे न छोटा कर सकती है, न हटा सकती है।',
    'rgc.term2':
      'आपको तुरंत साइन आउट कर दिया जाएगा और आप डिपॉज़िट नहीं कर पाएँगे, दांव नहीं लगा पाएँगे और नया अकाउंट नहीं खोल पाएँगे।',
    'rgc.term3':
      'आपके पास मौजूद कोई भी बैलेंस आपको लौटा दिया जाएगा। खुले दांव सामान्य रूप से सेटल किए जाएँगे।',
    'rgc.term4':
      'सारी मार्केटिंग बंद हो जाएगी। इस अवधि में आपको हमारी ओर से कोई प्रचार ईमेल, SMS या पुश नोटिफ़िकेशन नहीं मिलेगा।',
    'rgc.term5':
      'अकाउंट से जुड़े बोनस, फ्री स्पिन और लॉयल्टी प्रगति ज़ब्त हो जाएँगे और अवधि खत्म होने पर वापस नहीं मिलेंगे।',
    'rgc.term6':
      'अवधि खत्म होने पर आपका अकाउंट अपने-आप नहीं खुलता, जब तक कि ऊपर अवधि के विवरण में ऐसा न लिखा हो — आपको इसे वापस खोलने का अनुरोध करना होगा, और इसके लागू होने से पहले एक प्रतीक्षा अवधि होती है।',
    'rgc.exclusionConfirmTitle': 'स्व-बहिष्करण ({period})',
    'rgc.exclusionBreakPeriod': 'ब्रेक की अवधि',
    'rgc.exclusionToday': 'आज',
    'rgc.exclusionConfirmBody':
      'स्व-बहिष्करण की अवधि के दौरान भी आप लॉग इन कर सकते हैं और अपना उपलब्ध बैलेंस निकाल सकते हैं। हालाँकि, जिस राशि पर वेजरिंग बाकी है (जैसे बोनस या प्रोमोशनल क्रेडिट), उसे तब तक नहीं निकाला जा सकता जब तक बहिष्करण अवधि खत्म न हो जाए और वेजरिंग शर्तें पूरी न हो जाएँ।',
    'rgc.exclusionUnderstand': 'पुष्टि करें पर क्लिक करके, मुझे यह समझ है कि:',
    'rgc.exclusionPoint1':
      'मेरे लिए यह स्व-बहिष्करण ({period}) रद्द करना किसी भी हालत में संभव नहीं होगा।',
    'rgc.exclusionPoint2': 'मेरे लिए अपने अकाउंट तक पहुँचना और निकासी करना तब भी संभव रहेगा।',
    'rgc.exclusionPoint3': 'इस अवधि ({period}) के दौरान मेरे लिए कोई भी दांव लगाना संभव नहीं होगा।',
    'rgc.exclusionPoint4': 'मुझे सौंपा गया होस्ट अपने-आप हटा दिया जाएगा।',
    'rgc.exclusionTypeToConfirm': 'पुष्टि करने के लिए {phrase} टाइप करें',
    'rgc.exclusionConfirmWith': 'पुष्टि करें: {period}',
    'rgc.exclusionActiveTitle': 'स्व-बहिष्करण',
    'rgc.exclusionActiveHeading': 'आपका स्व-बहिष्करण सक्रिय है',
    'rgc.exclusionActiveBody':
      'इस अवधि के दौरान आप डिपॉज़िट नहीं कर सकते, दांव नहीं लगा सकते और दूसरा अकाउंट नहीं खोल सकते। इसे समय से पहले हटाया नहीं जा सकता — कृपया इसके लिए सहायता टीम से संपर्क न करें, क्योंकि वे ऐसा नहीं कर सकते।',
    'rgc.exclusionPeriod': 'अवधि',
    'rgc.exclusionEnds': 'समाप्ति',
    'rgc.exclusionNever': 'कभी नहीं',
    'rgc.budgetTitle': 'बजट कैलकुलेटर',
    'rgc.budgetIncome': 'आय',
    'rgc.budgetExpenses': 'खर्च',
    'rgc.budgetTotalIncome': 'कुल आय',
    'rgc.budgetTotalExpenses': 'कुल खर्च',
    'rgc.budgetDisposable': 'खर्च करने योग्य आय',
    'rgc.budgetWages': 'कटौतियों के बाद वेतन',
    'rgc.budgetPensions': 'पेंशन',
    'rgc.budgetBenefits': 'सरकारी लाभ',
    'rgc.budgetOtherIncome': 'अन्य आय',
    'rgc.budgetRent': 'किराया/होम लोन',
    'rgc.budgetUtilities': 'बिजली-पानी के बिल',
    'rgc.budgetLoans': 'लोन/क्रेडिट',
    'rgc.budgetOtherExpenses': 'अन्य खर्च',
    'rgc.budgetFieldIncome': 'हर महीने हाथ में आने वाली आय',
    'rgc.budgetFieldIncomeHint': 'टैक्स कटने के बाद असल में आपके खाते में आने वाली राशि।',
    'rgc.budgetFieldHousing': 'किराया या होम लोन',
    'rgc.budgetFieldHousingHint': 'किसी भी मेंटेनेंस शुल्क सहित।',
    'rgc.budgetFieldUtilities': 'बिल और यूटिलिटी',
    'rgc.budgetFieldUtilitiesHint': 'बिजली, पानी, इंटरनेट, फ़ोन।',
    'rgc.budgetFieldFood': 'खाना और घरेलू सामान',
    'rgc.budgetFieldFoodHint': 'राशन और ज़रूरी चीज़ें।',
    'rgc.budgetFieldTransport': 'यातायात',
    'rgc.budgetFieldTransportHint': 'ईंधन, किराया-भाड़ा, बीमा।',
    'rgc.budgetFieldDebts': 'लोन और कार्ड की किस्तें',
    'rgc.budgetFieldDebtsHint': 'हर महीने आपको कम से कम जितना चुकाना ही है।',
    'rgc.budgetFieldSavings': 'बचत और प्रतिबद्धताएँ',
    'rgc.budgetFieldSavingsHint': 'वह पैसा जो पहले से कहीं और के लिए तय है।',
    'rgc.budgetFieldOther': 'बाकी सब कुछ',
    'rgc.budgetFieldOtherHint': 'बच्चों की देखभाल, सब्सक्रिप्शन, इलाज।',
  },
  fr: {
    'rgc.title': 'Jeu responsable',
    'rgc.metaDescription':
      'Fixez des limites de dépôt, de perte, de mise et de temps, faites une pause grâce à l’auto-exclusion, vérifiez votre budget ou répondez à une courte auto-évaluation.',
    'rgc.close': 'Fermer',
    'rgc.cancel': 'Annuler',
    'rgc.saving': 'Enregistrement…',
    'rgc.navFaqs': 'FAQ',
    'rgc.navAssessment': 'Auto-évaluation',
    'rgc.navLimits': 'Limites de jeu',
    'rgc.navExclusion': 'Auto-exclusion',
    'rgc.navBudget': 'Calculateur de budget',
    'rgc.supportTitle': 'Aide indépendante',
    'rgc.supportLead':
      'Ces organismes n’ont aucun lien avec nous. Ils sont gratuits et confidentiels, et leur parler ne vous engage à rien.',
    'rgc.orgGamblingTherapy':
      'Soutien en ligne gratuit et chat en direct, disponibles à l’international dans de nombreuses langues.',
    'rgc.orgGamblersAnonymous':
      'Une association mondiale de personnes qui se rétablissent d’un problème de jeu.',
    'rgc.orgGamCare':
      'Informations, conseils et accompagnement gratuits pour toute personne touchée par le jeu.',
    'rgc.orgBeGambleAware':
      'Des conseils indépendants, une auto-évaluation et un annuaire des structures de soins locales.',
    'rgc.faqsTitle': 'FAQ',
    'rgc.faqQ1': 'Comment créer un compte sur la plateforme du casino ?',
    'rgc.faqA1':
      "Pour créer un compte, cliquez sur le bouton « S'inscrire » situé en haut à droite de la page d’accueil. Renseignez les informations demandées, notamment votre adresse e-mail, votre nom d’utilisateur et un mot de passe sécurisé. Vous recevrez ensuite un e-mail de vérification : cliquez sur le lien pour confirmer votre compte. Une fois votre compte vérifié, vous pouvez vous connecter, effectuer votre premier dépôt et commencer à jouer. L’ensemble de la procédure ne prend que quelques minutes.",
    'rgc.faqQ2': 'Mes informations personnelles et financières sont-elles sécurisées ?',
    'rgc.faqA2':
      'Les échanges entre votre appareil et nos serveurs sont chiffrés, et les données de carte et de portefeuille sont traitées par nos partenaires de paiement au lieu d’être stockées sur nos systèmes. Vous pouvez activer l’authentification à deux facteurs depuis la rubrique Sécurité de votre compte ; ce même écran liste les appareils actuellement connectés, ce qui permet de repérer facilement un appareil inconnu et de mettre fin à sa session.',
    'rgc.faqQ3': 'Que faire si j’oublie le mot de passe de mon compte ?',
    'rgc.faqA3':
      'Utilisez le lien « Mot de passe oublié ? » sur l’écran de connexion. Nous envoyons un lien de réinitialisation à l’adresse e-mail associée au compte ; en l’ouvrant, vous pourrez définir un nouveau mot de passe. Le lien ne peut être utilisé qu’une seule fois, et en demander un nouveau rend tout lien précédent invalide. Si l’e-mail n’arrive pas, vérifiez votre dossier de courrier indésirable avant d’en demander un autre.',
    'rgc.faqQ4': 'Quels jeux sont disponibles sur la plateforme du casino ?',
    'rgc.faqA4':
      'Machines à sous, casino en direct, jeux de table et nos propres Rolluck Originals, répertoriés dans Tous les jeux, avec un filtre par fournisseur si vous recherchez un studio en particulier. Les Originals sont prouvablement équitables : chaque partie est générée à partir d’une seed serveur, de votre seed client et d’un nonce, et vous pouvez changer votre seed et vérifier vous-même n’importe quelle partie passée.',
    'rgc.faqQ5': 'Quels moyens de paiement sont acceptés pour les dépôts ?',
    'rgc.faqA5':
      'Le portefeuille liste tous les moyens de paiement auxquels votre compte a droit, avec pour chacun le minimum, le maximum et ce à quoi vous attendre. Les dépôts en crypto sont crédités une fois atteint le nombre de confirmations réseau indiqué sur l’écran de dépôt. Les moyens proposés peuvent varier selon le compte et le pays : c’est donc le portefeuille qui fait foi, et non ce qui est écrit ici.',
    'rgc.faqQ6': 'Quels bonus et promotions sont proposés aux nouveaux joueurs ?',
    'rgc.faqA6':
      'L’offre de bienvenue est affichée dans le lobby et dans Promotions, et elle est associée à votre compte dès l’inscription : vous n’avez rien à activer manuellement. Les promotions évoluent, c’est donc la rubrique Promotions qui présente la liste à jour ; chacune a ses propres conditions, qu’il vaut la peine de lire avant d’y participer.',
    'rgc.faqQ7': 'Les offres de bonus sont-elles soumises à des conditions de mise ?',
    'rgc.faqA7':
      'En général oui, et la condition est indiquée sur l’offre elle-même. Votre progression est affichée avec votre solde bonus. Les fonds bonus sont utilisés après votre solde réel, vous ne misez donc jamais un bonus tant que de l’argent réel reste disponible, et le bonus est converti en fonds retirables une fois sa condition remplie.',
    'rgc.faqQ8': 'Puis-je jouer aux jeux du casino sur mon appareil mobile ?',
    'rgc.faqA8':
      'Oui. Le site fonctionne dans un navigateur mobile avec le même compte, le même portefeuille et les mêmes jeux : il n’y a aucune application distincte à installer, et rien n’a besoin d’être transféré.',
    'rgc.faqQ9': 'Combien de temps faut-il pour traiter un retrait ?',
    'rgc.faqA9':
      'Chaque retrait est examiné avant d’être envoyé, et le délai de réception dépend ensuite du moyen choisi : la crypto est réglée dès que le réseau l’a confirmée, tandis que les retraits sur carte et portefeuille suivent le calendrier propre au prestataire. Un premier retrait peut prendre plus de temps si la vérification d’identité n’a pas encore été effectuée ; une fois celle-ci validée, vos retraits suivants bénéficient du circuit le plus rapide.',
    'rgc.faqQ10': 'Comment vérifier mon identité pour satisfaire aux exigences KYC ?',
    'rgc.faqA10':
      'La vérification se trouve dans la rubrique Vérification de votre compte. Des informations et des documents d’identité vous seront demandés ; lesquels dépendent des contrôles qui s’appliquent à vous. Certaines opérations, en particulier les retraits, peuvent être suspendues jusqu’à ce qu’elle soit terminée : mieux vaut donc l’effectuer avant d’en avoir besoin plutôt qu’au moment où vous souhaitez retirer vos gains.',
    'rgc.faqQ11':
      'Comment fixer des limites de dépôt ou m’auto-exclure dans le cadre du jeu responsable ?',
    'rgc.faqA11':
      'Les deux se font sur cette page. Limites de jeu vous permet de plafonner ce que vous pouvez déposer ; une baisse prend effet immédiatement, tandis qu’une hausse est soumise à un délai de réflexion, de sorte qu’une limite ne peut pas être levée au moment précis où vous en avez le plus envie. L’auto-exclusion bloque le jeu pendant la durée de votre choix et ne peut pas être annulée avant son terme.',
    'rgc.faqQ12': 'Comment contacter le service client en cas de problème ?',
    'rgc.faqA12':
      'Écrivez à support@rolluck.com en indiquant votre nom d’utilisateur et ce que vous faisiez au moment où le problème est survenu : c’est le moyen le plus rapide de joindre quelqu’un qui peut examiner votre compte. Si vous avez besoin d’une aide indépendante de nous, les organismes listés dans la rubrique Auto-exclusion sont gratuits et confidentiels, et leur parler ne vous engage à rien.',
    'rgc.assessmentTitle': 'Auto-évaluation',
    'rgc.assessIntro':
      'Pour beaucoup de personnes, le jeu d’argent peut être un passe-temps agréable, source de divertissement et du frisson de la prise de risque. Cependant, chez certaines personnes, le jeu peut devenir bien plus qu’une activité inoffensive. Il peut se transformer en un problème grave qui touche différents aspects de leur vie. Reconnaître les signes du jeu problématique est la première étape pour y faire face. Cet outil d’auto-évaluation a pour but de vous aider à réfléchir à votre comportement de jeu et à déterminer s’il est susceptible de causer des problèmes dans votre vie. Il est essentiel d’aborder cette évaluation avec honnêteté et ouverture afin de bien comprendre vos habitudes de jeu.',
    'rgc.assessPrompt': 'Avez-vous un problème de jeu ? Posez-vous les questions suivantes :',
    'rgc.assessScreen1':
      'Vous est-il déjà arrivé, pendant des périodes de deux semaines ou plus, de passer beaucoup de temps à penser à vos expériences de jeu, à planifier vos prochaines sessions de jeu ou vos prochains paris, ou à chercher des moyens de vous procurer de l’argent pour jouer ?',
    'rgc.assessScreen2':
      'Vous est-il déjà arrivé, à certaines périodes, d’avoir besoin de jouer des sommes de plus en plus importantes ou de faire des paris plus élevés qu’auparavant pour ressentir la même excitation ?',
    'rgc.assessScreen3':
      'Vous êtes-vous déjà senti agité ou irritable en essayant d’arrêter, de réduire ou de contrôler votre pratique du jeu ?',
    'rgc.assessScreen4':
      'Avez-vous essayé, sans y parvenir, d’arrêter, de réduire ou de contrôler votre pratique du jeu trois fois ou plus au cours de votre vie ?',
    'rgc.assessScreen5':
      'Vous est-il déjà arrivé de jouer pour échapper à des problèmes personnels ou pour soulager des sentiments pénibles comme la culpabilité, l’anxiété, l’impuissance ou la dépression ?',
    'rgc.assessScreen6':
      'Y a-t-il déjà eu une période pendant laquelle, après avoir perdu de l’argent au jeu un jour, vous reveniez souvent jouer un autre jour pour vous refaire ?',
    'rgc.assessScreen7':
      'Avez-vous menti à des membres de votre famille, à des amis ou à d’autres personnes sur l’ampleur de votre pratique du jeu et/ou sur les sommes que vous avez perdues au jeu, à au moins trois reprises ?',
    'rgc.assessScreen8':
      'Vous est-il déjà arrivé de faire un chèque sans provision ou de prendre de l’argent qui ne vous appartenait pas à des membres de votre famille, à des amis ou à quiconque afin de financer votre pratique du jeu ?',
    'rgc.assessScreen9':
      'Votre pratique du jeu a-t-elle déjà causé des problèmes graves ou répétés dans vos relations avec des membres de votre famille ou des amis ? Ou votre pratique du jeu vous a-t-elle déjà causé des problèmes au travail ou dans vos études ?',
    'rgc.assessScreen10':
      'Avez-vous déjà eu besoin de demander à des membres de votre famille, à des amis, à un organisme de crédit ou à quelqu’un d’autre de vous prêter de l’argent ou de vous tirer d’une situation financière désespérée causée en grande partie par votre pratique du jeu ?',
    'rgc.assessReminder':
      '*RAPPEL : cette auto-évaluation vous aidera à déterminer si vous avez un problème ou si vous êtes en train d’en développer un. Si vous avez répondu oui à une ou plusieurs des questions ci-dessus, nous vous conseillons de demander de l’aide.',
    'rgc.assessmentModalLead':
      'Cochez tout ce qui s’est appliqué à vous au cours des 12 derniers mois. Laissez le reste.',
    'rgc.assessmentDisclaimer':
      'Vos réponses sont comptabilisées, mais ne sont pas enregistrées sous votre nom à d’autres fins, et ne servent jamais à décider des communications marketing que vous recevez.',
    'rgc.assessmentSeeResult': 'Voir mon résultat',
    'rgc.quizQ1': 'Avez-vous misé plus que ce que vous pouviez vraiment vous permettre de perdre ?',
    'rgc.quizQ2':
      'Avez-vous eu besoin de miser des sommes plus importantes pour ressentir la même excitation ?',
    'rgc.quizQ3':
      'Êtes-vous revenu jouer un autre jour pour récupérer l’argent que vous aviez perdu ?',
    'rgc.quizQ4': 'Avez-vous emprunté de l’argent ou vendu quelque chose pour pouvoir jouer ?',
    'rgc.quizQ5': 'Avez-vous eu le sentiment d’avoir peut-être un problème avec le jeu ?',
    'rgc.quizQ6':
      'Le jeu vous a-t-il causé du stress, de l’anxiété ou d’autres problèmes de santé ?',
    'rgc.quizQ7':
      'D’autres personnes ont-elles critiqué votre pratique du jeu, que vous ayez pensé ou non qu’elles avaient raison ?',
    'rgc.quizQ8':
      'Le jeu a-t-il causé des problèmes d’argent pour vous ou pour les personnes avec qui vous vivez ?',
    'rgc.quizQ9':
      'Vous êtes-vous senti coupable de votre façon de jouer, ou de ce qui se passe quand vous jouez ?',
    'rgc.quizQ10':
      'Avez-vous caché votre pratique du jeu à vos proches, ou minimisé devant eux la place qu’elle prend ?',
    'rgc.bandLowHeading': 'Aucun signal d’alerte dans vos réponses',
    'rgc.bandLowBody':
      'Rien dans vos réponses n’indique un problème aujourd’hui. Cela peut changer sans que ce soit évident ; il est donc utile de revenir de temps en temps à ces questions. Et fixer une limite de dépôt pendant que vous vous sentez maître de la situation ne vous coûte rien.',
    'rgc.bandModerateHeading': 'Quelques signes qui méritent votre attention',
    'rgc.bandModerateBody':
      'Certaines de vos réponses portent sur des points que les services d’aide examinent pour une bonne raison. Ce n’est pas un diagnostic et cela ne signifie pas que vous avez un problème, mais c’est le bon moment pour fixer une limite et pour en parler à quelqu’un si certains points vous ont semblé un peu trop familiers.',
    'rgc.bandHighHeading': 'Plusieurs signes à ne pas ignorer',
    'rgc.bandHighBody':
      'Vous avez répondu oui à plusieurs des questions les plus importantes. Nous ne sommes pas en mesure de vous dire ce que cela signifie pour vous, mais les personnes ci-dessous le peuvent : elles le font gratuitement et en toute confidentialité, et leur parler ne vous engage pas à arrêter. Nous vous invitons à fixer une limite ou à faire une pause le temps d’y réfléchir.',
    'rgc.limitsTitle': 'Limites de jeu',
    'rgc.limitsSet': 'Fixer une limite de jeu',
    'rgc.limitsPara1':
      'Gardez le contrôle de votre jeu en fixant des limites de perte ou de mise. Vous pouvez plafonner le montant maximal que vous perdez ou misez sur une période quotidienne, hebdomadaire, mensuelle ou trimestrielle.',
    'rgc.limitsPara2':
      'Suppression d’une limite : elle prend effet à 00:00 (UTC+0) à l’issue d’un délai de réflexion d’au moins 24 heures.',
    'rgc.limitsPara3':
      'Les limites actives sont réinitialisées automatiquement à 00:00 (UTC+0) à la fin de chaque période.',
    'rgc.limitTypeLabel': 'Type de limite',
    'rgc.limitAmount': 'Montant de la limite',
    'rgc.limitPeriod': 'Période de la limite',
    'rgc.limitAdd': 'Ajouter une limite',
    'rgc.limitMinutes': 'min',
    'rgc.limitDepositLabel': 'Limite de dépôt',
    'rgc.limitDepositDesc':
      'Le montant maximal que vous pouvez ajouter à votre solde sur la période choisie.',
    'rgc.limitLossLabel': 'Limite de perte',
    'rgc.limitLossDesc':
      'Plafonne ce que vous pouvez perdre, gains déduits, pour qu’une mauvaise série ait un plancher.',
    'rgc.limitWagerLabel': 'Limite de mise',
    'rgc.limitWagerDesc':
      'Le total que vous pouvez miser, compté que le pari soit gagnant ou perdant.',
    'rgc.limitSessionLabel': 'Limite de temps',
    'rgc.limitSessionDesc':
      'La durée pendant laquelle vous pouvez jouer sur la période, après quoi vous êtes déconnecté.',
    'rgc.periodPerDay': 'Par jour',
    'rgc.periodPerWeek': 'Par semaine',
    'rgc.periodPerMonth': 'Par mois',
    'rgc.duration24h': '24 heures',
    'rgc.duration7d': '7 jours',
    'rgc.duration30d': '30 jours',
    'rgc.duration3m': '3 mois',
    'rgc.duration6m': '6 mois',
    'rgc.duration1y': '1 an',
    'rgc.duration5y': '5 ans',
    'rgc.exclusionTitle': 'Auto-exclusion',
    'rgc.exclusionLead':
      'Vous souhaitez faire une pause avec Rolluck ? Lancez la procédure automatisée d’auto-exclusion en fixant une durée : l’accès à votre compte sera temporairement bloqué pendant la période choisie. Sachez que pendant ce temps, vous n’aurez accès à aucun produit du site et que les soldes restants seront également indisponibles.',
    'rgc.exclusionEmailNote': 'Vous recevrez un e-mail pour confirmer votre demande.',
    'rgc.exclusionStep1': 'Étape 1 : faire une pause de 24 heures',
    'rgc.exclusionStep2': 'Étape 2 : auto-exclusion',
    'rgc.exclusionConsent':
      'En demandant l’auto-exclusion, je reconnais avoir pris connaissance des règles de l’auto-exclusion et j’en assume l’entière responsabilité',
    'rgc.exclusionContinueAction': 'Continuer',
    'rgc.signInExclusion':
      'L’auto-exclusion s’applique à votre compte : vous devez donc être connecté pour l’activer. Si vous vous êtes déjà auto-exclu et ne pouvez pas vous connecter, c’est normal : merci de contacter le support plutôt que d’ouvrir un nouveau compte.',
    'rgc.optCooldown': 'Pause de 24 heures',
    'rgc.opt7d': '7 jours',
    'rgc.opt30d': '30 jours',
    'rgc.opt3m': '3 mois',
    'rgc.opt6m': '6 mois',
    'rgc.opt1y': '1 an',
    'rgc.opt5y': '5 ans',
    'rgc.optPermanent': 'Définitive',
    'rgc.noteCooldown': 'Une courte pause. Votre compte rouvre automatiquement.',
    'rgc.note7d': 'Une semaine de pause. Votre compte rouvre automatiquement.',
    'rgc.note30d': 'Un mois de pause. Votre compte rouvre automatiquement.',
    'rgc.noteFullPeriod': 'Votre compte reste fermé pendant toute la durée choisie.',
    'rgc.note5y': 'Une exclusion longue. Assurez-vous d’en être certain avant de confirmer.',
    'rgc.notePermanent': 'Votre compte est fermé définitivement et ne pourra pas être rouvert.',
    'rgc.confirmPhrase': 'EXCLUEZ-MOI',
    'rgc.term1':
      'C’est irréversible. Une fois confirmée, l’exclusion s’applique pendant toute la durée choisie : le support ne peut ni la raccourcir ni la lever, quelle qu’en soit la raison.',
    'rgc.term2':
      'Vous serez immédiatement déconnecté et ne pourrez plus déposer, parier ni ouvrir de nouveau compte.',
    'rgc.term3':
      'Tout solde que vous détenez vous est restitué. Les paris en cours sont réglés normalement.',
    'rgc.term4':
      'Toutes les communications marketing s’arrêtent. Vous ne recevrez de notre part aucun e-mail, SMS ni notification push promotionnel pendant toute la durée.',
    'rgc.term5':
      'Les bonus, tours gratuits et progrès de fidélité liés au compte sont perdus et ne sont pas rétablis à la fin de la période.',
    'rgc.term6':
      'À la fin de la période, votre compte ne rouvre pas de lui-même, sauf si c’est indiqué ci-dessus pour la durée choisie : vous devez en demander la réouverture, et un délai d’attente s’applique avant qu’elle prenne effet.',
    'rgc.exclusionConfirmTitle': 'Auto-exclusion ({period})',
    'rgc.exclusionBreakPeriod': 'Période de pause',
    'rgc.exclusionToday': 'Aujourd’hui',
    'rgc.exclusionConfirmBody':
      'Pendant la période d’auto-exclusion, vous pouvez toujours vous connecter et retirer votre solde disponible. En revanche, tout montant soumis à des conditions de mise (par exemple, des bonus ou crédits promotionnels) ne pourra pas être retiré avant la fin de la période d’exclusion et tant que les conditions de mise ne sont pas remplies.',
    'rgc.exclusionUnderstand': 'En cliquant sur Confirmer, je comprends que :',
    'rgc.exclusionPoint1': 'Je ne pourrai EN AUCUN CAS annuler la période choisie ({period}).',
    'rgc.exclusionPoint2': 'Je pourrai toujours accéder à mon compte et effectuer des retraits.',
    'rgc.exclusionPoint3': 'Je ne pourrai placer AUCUN pari pendant la période choisie ({period}).',
    'rgc.exclusionPoint4': 'Mon hôte me sera automatiquement retiré.',
    'rgc.exclusionTypeToConfirm': 'Saisissez {phrase} pour confirmer',
    'rgc.exclusionConfirmWith': 'Confirmer : {period}',
    'rgc.exclusionActiveTitle': 'Auto-exclusion',
    'rgc.exclusionActiveHeading': 'Votre auto-exclusion est active',
    'rgc.exclusionActiveBody':
      'Vous ne pouvez ni déposer, ni parier, ni ouvrir un autre compte pendant toute la durée. Elle ne peut pas être levée avant son terme : merci de ne pas contacter le support pour le demander, car il n’est pas en mesure de le faire.',
    'rgc.exclusionPeriod': 'Période',
    'rgc.exclusionEnds': 'Fin',
    'rgc.exclusionNever': 'Jamais',
    'rgc.budgetTitle': 'Calculateur de budget',
    'rgc.budgetIncome': 'Revenus',
    'rgc.budgetExpenses': 'Dépenses',
    'rgc.budgetTotalIncome': 'Total des revenus',
    'rgc.budgetTotalExpenses': 'Total des dépenses',
    'rgc.budgetDisposable': 'Revenu disponible',
    'rgc.budgetWages': 'Salaire net',
    'rgc.budgetPensions': 'Pensions de retraite',
    'rgc.budgetBenefits': 'Prestations sociales',
    'rgc.budgetOtherIncome': 'Autres revenus',
    'rgc.budgetRent': 'Loyer/crédit immobilier',
    'rgc.budgetUtilities': 'Factures (énergie, eau…)',
    'rgc.budgetLoans': 'Prêts/crédits',
    'rgc.budgetOtherExpenses': 'Autres dépenses',
    'rgc.budgetFieldIncome': 'Revenu mensuel net',
    'rgc.budgetFieldIncomeHint': 'Ce qui arrive réellement sur votre compte après impôts.',
    'rgc.budgetFieldHousing': 'Loyer ou crédit immobilier',
    'rgc.budgetFieldHousingHint': 'Charges comprises.',
    'rgc.budgetFieldUtilities': 'Factures et charges courantes',
    'rgc.budgetFieldUtilitiesHint': 'Énergie, eau, internet, téléphone.',
    'rgc.budgetFieldFood': 'Alimentation et foyer',
    'rgc.budgetFieldFoodHint': 'Courses et produits de première nécessité.',
    'rgc.budgetFieldTransport': 'Transports',
    'rgc.budgetFieldTransportHint': 'Carburant, titres de transport, assurance.',
    'rgc.budgetFieldDebts': 'Remboursements de prêts et de cartes',
    'rgc.budgetFieldDebtsHint': 'Le minimum que vous devez payer chaque mois.',
    'rgc.budgetFieldSavings': 'Épargne et engagements',
    'rgc.budgetFieldSavingsHint': 'L’argent déjà réservé à autre chose.',
    'rgc.budgetFieldOther': 'Tout le reste',
    'rgc.budgetFieldOtherHint': 'Garde d’enfants, abonnements, frais médicaux.',
  },
  ru: {
    'rgc.title': 'Ответственная игра',
    'rgc.metaDescription':
      'Установите лимиты на депозиты, проигрыши, ставки и время, возьмите перерыв с помощью самоисключения, проверьте свой бюджет или пройдите короткий тест для самооценки.',
    'rgc.close': 'Закрыть',
    'rgc.cancel': 'Отмена',
    'rgc.saving': 'Сохранение…',
    'rgc.navFaqs': 'Частые вопросы',
    'rgc.navAssessment': 'Самооценка',
    'rgc.navLimits': 'Игровые лимиты',
    'rgc.navExclusion': 'Самоисключение',
    'rgc.navBudget': 'Калькулятор бюджета',
    'rgc.supportTitle': 'Независимая помощь',
    'rgc.supportLead':
      'Эти организации никак не связаны с нами. Их помощь бесплатна и конфиденциальна, а обращение к ним ни к чему вас не обязывает.',
    'rgc.orgGamblingTherapy':
      'Бесплатная онлайн-поддержка и чат в реальном времени, доступные по всему миру на многих языках.',
    'rgc.orgGamblersAnonymous':
      'Всемирное сообщество людей, которые восстанавливаются после игровой зависимости.',
    'rgc.orgGamCare':
      'Бесплатная информация, советы и консультации для всех, кого затронули азартные игры.',
    'rgc.orgBeGambleAware':
      'Независимые советы, тест для самооценки и справочник местных центров помощи.',
    'rgc.faqsTitle': 'Частые вопросы',
    'rgc.faqQ1': 'Как создать аккаунт на платформе казино?',
    'rgc.faqA1':
      'Чтобы создать аккаунт, нажмите кнопку «Регистрация» в правом верхнем углу главной страницы. Заполните обязательные поля: адрес электронной почты, имя пользователя и надёжный пароль. Затем вы получите письмо для подтверждения — перейдите по ссылке в нём, чтобы подтвердить аккаунт. После подтверждения вы сможете войти, внести первый депозит и начать играть. Весь процесс занимает всего несколько минут.',
    'rgc.faqQ2': 'Защищены ли мои личные и финансовые данные?',
    'rgc.faqA2':
      'Трафик между вашим устройством и нашими серверами шифруется, а данные карт и кошельков обрабатывают наши платёжные партнёры — мы не храним их в своих системах. В разделе «Безопасность» вашего аккаунта можно включить двухфакторную аутентификацию; там же показаны устройства, на которых сейчас выполнен вход, так что незнакомое устройство легко заметить и завершить его сеанс.',
    'rgc.faqQ3': 'Что делать, если я забыл пароль от аккаунта?',
    'rgc.faqA3':
      'Воспользуйтесь ссылкой «Забыли пароль?» на экране входа. Мы отправим ссылку для сброса на адрес, указанный в аккаунте; перейдя по ней, вы сможете задать новый пароль. Ссылка одноразовая, а запрос новой ссылки делает все предыдущие недействительными. Если письмо не пришло, проверьте папку «Спам», прежде чем запрашивать новое.',
    'rgc.faqQ4': 'Какие игры доступны на платформе казино?',
    'rgc.faqA4':
      'Слоты, лайв-казино, настольные игры и наши собственные ROLLUCK Originals — всё это собрано в разделе «Все игры», где есть фильтр по провайдерам, если вы ищете конкретную студию. Игры Originals доказуемо честны: каждый раунд формируется из серверного сида, вашего клиентского сида и nonce, а вы можете сменить свой сид и самостоятельно проверить любой прошедший раунд.',
    'rgc.faqQ5': 'Какие способы оплаты принимаются для депозитов?',
    'rgc.faqA5':
      'В кошельке перечислены все способы, доступные для вашего аккаунта, с минимальной и максимальной суммой и сроками зачисления для каждого. Криптодепозиты зачисляются после того, как будет получено количество подтверждений сети, указанное на экране депозита. Доступные способы могут различаться в зависимости от аккаунта и местоположения, поэтому точный список — в кошельке, а не здесь.',
    'rgc.faqQ6': 'Какие бонусы и акции доступны новым игрокам?',
    'rgc.faqA6':
      'Приветственный пакет показан в лобби и в разделе «Акции» и привязывается к вашему аккаунту при регистрации — ничего активировать вручную не нужно. Акции меняются, поэтому актуальный список всегда в разделе «Акции»; у каждой из них свои условия, с которыми стоит ознакомиться, прежде чем принимать участие.',
    'rgc.faqQ7': 'Есть ли требования по отыгрышу для бонусных предложений?',
    'rgc.faqA7':
      'Как правило, да, и требование указано в самом предложении. Прогресс отыгрыша отображается рядом с вашим бонусным балансом. Бонусные средства расходуются после реального баланса, поэтому вы никогда не отыгрываете бонус, пока у вас есть реальные деньги, а после выполнения требования бонус превращается в средства, доступные для вывода.',
    'rgc.faqQ8': 'Можно ли играть в игры казино на мобильном устройстве?',
    'rgc.faqA8':
      'Да. Сайт работает в мобильном браузере с тем же аккаунтом, тем же кошельком и теми же играми — отдельное приложение устанавливать не нужно, и ничего не придётся переносить.',
    'rgc.faqQ9': 'Сколько времени занимает обработка вывода средств?',
    'rgc.faqA9':
      'Каждый запрос на вывод проверяется перед отправкой, а дальнейший срок поступления денег зависит от выбранного способа: криптовалюта зачисляется после подтверждения сетью, выплаты на карту или кошелёк — в сроки, установленные провайдером. Первый вывод может занять больше времени, если верификация личности ещё не пройдена; пройдя её один раз, вы обеспечите более быстрые последующие выплаты.',
    'rgc.faqQ10': 'Как подтвердить личность в соответствии с требованиями KYC?',
    'rgc.faqA10':
      'Верификация находится в разделе «Верификация» вашего аккаунта. У вас запросят личные данные и документы; какие именно — зависит от применимых к вам проверок. Некоторые действия, в частности вывод средств, могут быть приостановлены до её завершения, поэтому лучше пройти её заранее, а не в тот момент, когда вы захотите вывести деньги.',
    'rgc.faqQ11':
      'Как установить лимиты на депозит или исключить себя из игры ради ответственной игры?',
    'rgc.faqA11':
      'Обе функции доступны на этой странице. В разделе «Игровые лимиты» можно ограничить сумму депозитов: снижение лимита вступает в силу сразу, а повышение — только после периода охлаждения, поэтому лимит нельзя снять именно в тот момент, когда этого больше всего хочется. Самоисключение закрывает доступ к игре на выбранный вами срок, и досрочно его отменить нельзя.',
    'rgc.faqQ12': 'Как связаться со службой поддержки, если у меня возникла проблема?',
    'rgc.faqA12':
      'Напишите на support@rolluck.com, указав имя пользователя и то, что вы делали, когда возникла проблема, — это самый быстрый способ связаться с тем, кто сможет проверить ваш аккаунт. Если вам нужна помощь, независимая от нас, организации, перечисленные в разделе «Самоисключение», работают бесплатно и конфиденциально, а обращение к ним ни к чему вас не обязывает.',
    'rgc.assessmentTitle': 'Самооценка',
    'rgc.assessIntro':
      'Для многих людей азартные игры могут быть приятным времяпрепровождением, которое приносит развлечение и азарт от риска. Однако для некоторых азартные игры могут стать чем-то большим, чем безобидное занятие. Они могут перерасти в серьёзную проблему, затрагивающую разные стороны жизни. Распознать признаки проблемной игры — первый шаг к её решению. Этот инструмент самооценки поможет вам проанализировать своё игровое поведение и понять, не создаёт ли оно проблем в вашей жизни. Чтобы получить ясное представление о своих игровых привычках, важно отвечать на вопросы честно и открыто.',
    'rgc.assessPrompt':
      'Есть ли у вас проблема с азартными играми? Задайте себе следующие вопросы:',
    'rgc.assessScreen1':
      'Были ли у вас периоды продолжительностью две недели или дольше, когда вы много времени думали о своём игровом опыте, планировали будущие игры или ставки или размышляли о том, где достать деньги на игру?',
    'rgc.assessScreen2':
      'Бывали ли у вас периоды, когда вам требовалось играть на всё бо́льшие суммы или делать более крупные ставки, чем раньше, чтобы испытать то же возбуждение?',
    'rgc.assessScreen3':
      'Испытывали ли вы когда-либо беспокойство или раздражительность, пытаясь прекратить играть, играть меньше или контролировать свою игру?',
    'rgc.assessScreen4':
      'Пытались ли вы безуспешно прекратить играть, играть меньше или контролировать свою игру три или более раз в жизни?',
    'rgc.assessScreen5':
      'Играли ли вы когда-либо, чтобы уйти от личных проблем или облегчить неприятные чувства, такие как вина, тревога, беспомощность или депрессия?',
    'rgc.assessScreen6':
      'Был ли у вас период, когда, проиграв деньги в один день, вы часто возвращались в другой день, чтобы отыграться?',
    'rgc.assessScreen7':
      'Лгали ли вы членам семьи, друзьям или другим людям о том, как много вы играете и/или сколько денег проиграли, хотя бы три раза?',
    'rgc.assessScreen8':
      'Выписывали ли вы когда-либо необеспеченный чек или брали чужие деньги у членов семьи, друзей или кого-либо ещё, чтобы оплатить свою игру?',
    'rgc.assessScreen9':
      'Вызывала ли ваша игра когда-либо серьёзные или повторяющиеся проблемы в отношениях с кем-либо из членов семьи или друзей? Или создавала ли ваша игра проблемы на работе или в учёбе?',
    'rgc.assessScreen10':
      'Приходилось ли вам когда-либо просить членов семьи, друзей, кредитную организацию или кого-либо ещё дать вам денег в долг или иным образом выручить вас из отчаянного финансового положения, вызванного в основном вашей игрой?',
    'rgc.assessReminder':
      '*НАПОМИНАНИЕ: этот тест для самооценки поможет вам понять, есть ли у вас проблема или не формируется ли она. Если вы ответили «да» хотя бы на один из вопросов выше, вам следует обратиться за помощью.',
    'rgc.assessmentModalLead':
      'Отметьте всё, что относилось к вам за последние 12 месяцев. Остальное оставьте без отметки.',
    'rgc.assessmentDisclaimer':
      'Ваши ответы лишь подсчитываются, не сохраняются в привязке к вашему имени для каких-либо других целей и никогда не используются для выбора маркетинговых материалов, которые вы получаете.',
    'rgc.assessmentSeeResult': 'Посмотреть результат',
    'rgc.quizQ1': 'Ставили ли вы больше, чем на самом деле могли позволить себе проиграть?',
    'rgc.quizQ2':
      'Требовалось ли вам ставить более крупные суммы, чтобы испытать то же возбуждение?',
    'rgc.quizQ3': 'Возвращались ли вы в другой день, чтобы отыграть проигранные деньги?',
    'rgc.quizQ4': 'Занимали ли вы деньги или продавали что-либо, чтобы играть?',
    'rgc.quizQ5': 'Чувствовали ли вы, что у вас может быть проблема с азартными играми?',
    'rgc.quizQ6':
      'Вызывали ли азартные игры у вас стресс, тревогу или другие проблемы со здоровьем?',
    'rgc.quizQ7':
      'Критиковали ли другие люди вашу игру, независимо от того, считали ли вы их правыми?',
    'rgc.quizQ8':
      'Создавали ли азартные игры финансовые проблемы для вас или людей, с которыми вы живёте?',
    'rgc.quizQ9':
      'Испытывали ли вы чувство вины из-за того, как вы играете, или из-за того, что происходит, когда вы играете?',
    'rgc.quizQ10': 'Скрывали ли вы свою игру или преуменьшали, сколько играете, от близких людей?',
    'rgc.bandLowHeading': 'В ваших ответах нет тревожных признаков',
    'rgc.bandLowBody':
      'Ничто в ваших ответах не указывает на проблему на сегодняшний день. Это может измениться незаметно, поэтому стоит время от времени возвращаться к этим вопросам — а установить лимит на депозит, пока вы чувствуете, что всё под контролем, вам ничего не стоит.',
    'rgc.bandModerateHeading': 'Есть признаки, на которые стоит обратить внимание',
    'rgc.bandModerateBody':
      'Некоторые ваши ответы касаются вопросов, которые специалисты задают не просто так. Это не диагноз и не означает, что у вас есть проблема, — но сейчас хороший момент, чтобы установить лимит и поговорить с кем-нибудь, если что-то из этого показалось вам неприятно знакомым.',
    'rgc.bandHighHeading': 'Несколько признаков, которые нельзя игнорировать',
    'rgc.bandHighBody':
      'Вы ответили «да» на ряд самых важных вопросов. Мы не можем сказать, что это значит именно для вас, — но это могут сделать специалисты, указанные ниже: они помогают бесплатно и конфиденциально, а разговор с ними не обязывает вас бросить играть. Пожалуйста, подумайте о том, чтобы установить лимит или сделать перерыв, пока вы всё обдумываете.',
    'rgc.limitsTitle': 'Игровые лимиты',
    'rgc.limitsSet': 'Установить игровой лимит',
    'rgc.limitsPara1':
      'Контролируйте свою игру, устанавливая лимиты на проигрыши или ставки. Вы можете ограничить максимальную сумму проигрыша или ставок за день, неделю, месяц или квартал.',
    'rgc.limitsPara2':
      'Снятие лимита вступает в силу в 00:00 (UTC+0) после периода охлаждения продолжительностью не менее 24 часов.',
    'rgc.limitsPara3':
      'Действующие лимиты автоматически обнуляются в 00:00 (UTC+0) в конце каждого периода.',
    'rgc.limitTypeLabel': 'Тип лимита',
    'rgc.limitAmount': 'Сумма лимита',
    'rgc.limitPeriod': 'Период лимита',
    'rgc.limitAdd': 'Добавить лимит',
    'rgc.limitMinutes': 'мин',
    'rgc.limitDepositLabel': 'Лимит депозита',
    'rgc.limitDepositDesc':
      'Максимальная сумма, которую вы можете внести на баланс за выбранный период.',
    'rgc.limitLossLabel': 'Лимит проигрыша',
    'rgc.limitLossDesc':
      'Ограничивает сумму, которую вы можете проиграть за вычетом выигрышей, чтобы у неудачной серии был предел.',
    'rgc.limitWagerLabel': 'Лимит ставок',
    'rgc.limitWagerDesc':
      'Общая сумма, которую вы можете поставить, — учитываются как выигравшие, так и проигравшие ставки.',
    'rgc.limitSessionLabel': 'Лимит времени',
    'rgc.limitSessionDesc':
      'Сколько времени вы можете играть за период; по его истечении выполняется выход из аккаунта.',
    'rgc.periodPerDay': 'В день',
    'rgc.periodPerWeek': 'В неделю',
    'rgc.periodPerMonth': 'В месяц',
    'rgc.duration24h': '24 часа',
    'rgc.duration7d': '7 дней',
    'rgc.duration30d': '30 дней',
    'rgc.duration3m': '3 месяца',
    'rgc.duration6m': '6 месяцев',
    'rgc.duration1y': '1 год',
    'rgc.duration5y': '5 лет',
    'rgc.exclusionTitle': 'Самоисключение',
    'rgc.exclusionLead':
      'Хотите сделать перерыв в Rolluck? Запустите автоматический процесс самоисключения, выбрав срок, и доступ к вашему аккаунту будет временно закрыт на выбранный период. Обратите внимание: в течение этого времени вам будут недоступны все продукты сайта, а также оставшиеся на балансе средства.',
    'rgc.exclusionEmailNote': 'Вы получите письмо для подтверждения запроса.',
    'rgc.exclusionStep1': 'Шаг 1: перерыв на 24 часа',
    'rgc.exclusionStep2': 'Шаг 2: самоисключение',
    'rgc.exclusionConsent':
      'Запрашивая самоисключение, я подтверждаю, что ознакомлен с правилами самоисключения, и принимаю на себя полную ответственность',
    'rgc.exclusionContinueAction': 'Продолжить',
    'rgc.signInExclusion':
      'Самоисключение применяется к вашему аккаунту, поэтому для его установки необходимо войти в систему. Если вы уже исключили себя и не можете войти, значит, всё работает как задумано, — пожалуйста, обратитесь в поддержку, а не создавайте новый аккаунт.',
    'rgc.optCooldown': 'Перерыв на 24 часа',
    'rgc.opt7d': '7 дней',
    'rgc.opt30d': '30 дней',
    'rgc.opt3m': '3 месяца',
    'rgc.opt6m': '6 месяцев',
    'rgc.opt1y': '1 год',
    'rgc.opt5y': '5 лет',
    'rgc.optPermanent': 'Навсегда',
    'rgc.noteCooldown': 'Короткий перерыв. Ваш аккаунт откроется автоматически.',
    'rgc.note7d': 'Неделя перерыва. Ваш аккаунт откроется автоматически.',
    'rgc.note30d': 'Месяц перерыва. Ваш аккаунт откроется автоматически.',
    'rgc.noteFullPeriod': 'Ваш аккаунт остаётся закрытым на весь срок.',
    'rgc.note5y':
      'Длительное исключение. Пожалуйста, убедитесь в своём решении, прежде чем подтверждать.',
    'rgc.notePermanent': 'Ваш аккаунт будет закрыт навсегда без возможности восстановления.',
    'rgc.confirmPhrase': 'ИСКЛЮЧИТЕ МЕНЯ',
    'rgc.term1':
      'Это действие нельзя отменить. После подтверждения исключение действует весь выбранный вами срок — поддержка не может сократить или снять его ни по какой причине.',
    'rgc.term2':
      'Вы будете немедленно выведены из аккаунта и не сможете вносить депозиты, делать ставки или открыть новый аккаунт.',
    'rgc.term3':
      'Все средства на вашем балансе будут возвращены вам. Открытые ставки рассчитываются в обычном порядке.',
    'rgc.term4':
      'Все маркетинговые рассылки прекращаются. На весь срок вы не будете получать от нас рекламные письма, SMS или push-уведомления.',
    'rgc.term5':
      'Бонусы, фриспины и прогресс программы лояльности, привязанные к аккаунту, аннулируются и не возвращаются по окончании срока.',
    'rgc.term6':
      'По окончании срока ваш аккаунт не откроется сам, если выше не указано иное, — вам нужно будет запросить его восстановление, и это вступит в силу только после периода ожидания.',
    'rgc.exclusionConfirmTitle': 'Самоисключение ({period})',
    'rgc.exclusionBreakPeriod': 'Период перерыва',
    'rgc.exclusionToday': 'Сегодня',
    'rgc.exclusionConfirmBody':
      'В период самоисключения вы по-прежнему можете войти в аккаунт и вывести доступный баланс. Однако суммы, требующие отыгрыша (например, бонусные или промо-средства), нельзя вывести, пока не закончится период исключения и не будут выполнены требования по отыгрышу.',
    'rgc.exclusionUnderstand': 'Нажимая «Подтвердить», я понимаю, что:',
    'rgc.exclusionPoint1': 'Я НИ ПРИ КАКИХ УСЛОВИЯХ не смогу отменить выбранный срок ({period}).',
    'rgc.exclusionPoint2': 'У меня сохранится доступ к аккаунту и возможность выводить средства.',
    'rgc.exclusionPoint3': 'Я НЕ смогу делать ставки в течение выбранного срока ({period}).',
    'rgc.exclusionPoint4':
      'Закреплённый за мной персональный менеджер будет автоматически откреплён.',
    'rgc.exclusionTypeToConfirm': 'Введите {phrase} для подтверждения',
    'rgc.exclusionConfirmWith': 'Подтвердить: {period}',
    'rgc.exclusionActiveTitle': 'Самоисключение',
    'rgc.exclusionActiveHeading': 'Ваше самоисключение действует',
    'rgc.exclusionActiveBody':
      'На весь срок вы не можете вносить депозиты, делать ставки или открыть другой аккаунт. Снять ограничение досрочно нельзя — пожалуйста, не обращайтесь с такой просьбой в поддержку: у неё нет такой возможности.',
    'rgc.exclusionPeriod': 'Срок',
    'rgc.exclusionEnds': 'Окончание',
    'rgc.exclusionNever': 'Никогда',
    'rgc.budgetTitle': 'Калькулятор бюджета',
    'rgc.budgetIncome': 'Доходы',
    'rgc.budgetExpenses': 'Расходы',
    'rgc.budgetTotalIncome': 'Общий доход',
    'rgc.budgetTotalExpenses': 'Общие расходы',
    'rgc.budgetDisposable': 'Свободные средства',
    'rgc.budgetWages': 'Зарплата после вычетов',
    'rgc.budgetPensions': 'Пенсии',
    'rgc.budgetBenefits': 'Пособия',
    'rgc.budgetOtherIncome': 'Прочие доходы',
    'rgc.budgetRent': 'Аренда/ипотека',
    'rgc.budgetUtilities': 'Коммунальные платежи',
    'rgc.budgetLoans': 'Кредиты/займы',
    'rgc.budgetOtherExpenses': 'Прочие расходы',
    'rgc.budgetFieldIncome': 'Ежемесячный доход на руки',
    'rgc.budgetFieldIncomeHint':
      'Сумма, которая фактически поступает на ваш счёт после уплаты налогов.',
    'rgc.budgetFieldHousing': 'Аренда или ипотека',
    'rgc.budgetFieldHousingHint': 'Включая плату за обслуживание.',
    'rgc.budgetFieldUtilities': 'Счета и коммунальные услуги',
    'rgc.budgetFieldUtilitiesHint': 'Электричество, вода, интернет, телефон.',
    'rgc.budgetFieldFood': 'Продукты и хозяйство',
    'rgc.budgetFieldFoodHint': 'Продукты и предметы первой необходимости.',
    'rgc.budgetFieldTransport': 'Транспорт',
    'rgc.budgetFieldTransportHint': 'Топливо, проезд, страховка.',
    'rgc.budgetFieldDebts': 'Платежи по кредитам и картам',
    'rgc.budgetFieldDebtsHint': 'Минимальная сумма, которую вы обязаны платить каждый месяц.',
    'rgc.budgetFieldSavings': 'Сбережения и обязательства',
    'rgc.budgetFieldSavingsHint': 'Деньги, которые уже на что-то запланированы.',
    'rgc.budgetFieldOther': 'Всё остальное',
    'rgc.budgetFieldOtherHint': 'Уход за детьми, подписки, медицина.',
  },
  pt: {
    'rgc.title': 'Jogo responsável',
    'rgc.metaDescription':
      'Defina limites de depósito, perdas, apostas e tempo, faça uma pausa com a autoexclusão, verifique o seu orçamento ou faça uma breve autoavaliação.',
    'rgc.close': 'Fechar',
    'rgc.cancel': 'Cancelar',
    'rgc.saving': 'A guardar…',
    'rgc.navFaqs': 'Perguntas frequentes',
    'rgc.navAssessment': 'Autoavaliação',
    'rgc.navLimits': 'Limites de jogo',
    'rgc.navExclusion': 'Autoexclusão',
    'rgc.navBudget': 'Calculadora de orçamento',
    'rgc.supportTitle': 'Ajuda independente',
    'rgc.supportLead':
      'Estas organizações não têm qualquer ligação connosco. São gratuitas e confidenciais, e falar com elas não o compromete a nada.',
    'rgc.orgGamblingTherapy':
      'Apoio online gratuito e chat ao vivo, disponível internacionalmente em várias línguas.',
    'rgc.orgGamblersAnonymous':
      'Uma irmandade mundial de pessoas em recuperação de um problema de jogo.',
    'rgc.orgGamCare':
      'Informação, aconselhamento e apoio psicológico gratuitos para qualquer pessoa afetada pelo jogo.',
    'rgc.orgBeGambleAware':
      'Aconselhamento independente, uma autoavaliação e uma lista de serviços de tratamento locais.',
    'rgc.faqsTitle': 'Perguntas frequentes',
    'rgc.faqQ1': 'Como crio uma conta na plataforma do Casino?',
    'rgc.faqA1':
      'Para criar uma conta, clique no botão "Registar", no canto superior direito da página inicial. Preencha os dados obrigatórios, incluindo o seu endereço de e-mail, nome de utilizador e uma senha segura. Em seguida, receberá um e-mail de verificação — clique na ligação para confirmar a sua conta. Depois de verificada, pode iniciar sessão, fazer o seu primeiro depósito e começar a jogar. Todo o processo demora apenas alguns minutos.',
    'rgc.faqQ2': 'As minhas informações pessoais e financeiras estão seguras?',
    'rgc.faqA2':
      'O tráfego entre o seu dispositivo e os nossos servidores é encriptado, e os dados de cartões e carteiras são tratados pelos nossos parceiros de pagamento, em vez de serem armazenados nos nossos sistemas. Pode ativar a autenticação de dois fatores em Segurança, na sua conta, e esse mesmo ecrã mostra os dispositivos com sessão iniciada, para que seja fácil identificar e terminar a sessão de um dispositivo desconhecido.',
    'rgc.faqQ3': 'O que devo fazer se me esquecer da senha da conta?',
    'rgc.faqA3':
      'Use a ligação "Esqueceu a senha?" no ecrã de início de sessão. Enviamos uma ligação de redefinição para o endereço de e-mail associado à conta; ao abri-la, pode definir uma nova senha. A ligação só pode ser usada uma vez, e pedir uma nova invalida qualquer ligação anterior. Se o e-mail não chegar, verifique a pasta de spam antes de pedir outro.',
    'rgc.faqQ4': 'Que jogos estão disponíveis na plataforma do Casino?',
    'rgc.faqA4':
      'Slots, casino ao vivo, jogos de mesa e os nossos próprios Rolluck Originals, listados em Todos os jogos, com um filtro por fornecedor caso procure um estúdio em particular. Os Originals são comprovadamente justos — cada ronda é gerada a partir de uma seed do servidor, da sua seed de cliente e de um nonce, e pode alterar a sua seed e verificar qualquer ronda anterior por si mesmo.',
    'rgc.faqQ5': 'Que métodos de pagamento são aceites para depósitos?',
    'rgc.faqA5':
      'A carteira lista todos os métodos disponíveis para a sua conta, com o mínimo, o máximo e o que esperar de cada um. Os depósitos em cripto são creditados assim que forem registadas as confirmações de rede indicadas no ecrã de depósito. Os métodos disponíveis podem variar consoante a conta e a localização, por isso a lista fiável é a da carteira e não o que estiver escrito aqui.',
    'rgc.faqQ6': 'Que bónus e promoções estão disponíveis para novos jogadores?',
    'rgc.faqA6':
      'O pacote de boas-vindas é apresentado no lobby e em Promoções, e é associado à sua conta no momento do registo — não há nada a resgatar manualmente. As promoções mudam, por isso a lista atual é a que está em Promoções; cada uma tem os seus próprios termos, que vale a pena ler antes de aderir.',
    'rgc.faqQ7': 'As ofertas de bónus têm requisitos de aposta?',
    'rgc.faqA7':
      'Normalmente sim, e o requisito é indicado na própria oferta. O progresso em relação a ele é mostrado junto ao seu saldo de bónus. Os fundos de bónus só são usados depois do seu saldo real, pelo que nunca está a apostar um bónus enquanto ainda tem dinheiro disponível, e o bónus converte-se em fundos levantáveis assim que o respetivo requisito for cumprido.',
    'rgc.faqQ8': 'Posso jogar os jogos do Casino no meu dispositivo móvel?',
    'rgc.faqA8':
      'Sim. O site funciona num navegador móvel com a mesma conta, a mesma carteira e os mesmos jogos — não há nenhuma aplicação separada para instalar, e não é preciso transferir nada.',
    'rgc.faqQ9': 'Quanto tempo demora o processamento dos levantamentos?',
    'rgc.faqA9':
      'Cada levantamento é analisado antes de ser enviado, e o tempo que o dinheiro demora a chegar depende do método escolhido — as criptomoedas são liquidadas assim que a rede confirma a transação; os cartões e as carteiras seguem os prazos do respetivo fornecedor. O primeiro levantamento pode demorar mais se a verificação de identidade ainda não tiver sido concluída; tratar disso uma vez mantém os pagamentos seguintes no circuito mais rápido.',
    'rgc.faqQ10': 'Como verifico a minha identidade para cumprir os requisitos de KYC?',
    'rgc.faqA10':
      'A verificação encontra-se em Verificação, na sua conta. Ser-lhe-ão pedidos dados e documentos de identificação; quais exatamente depende das verificações que se aplicam ao seu caso. Algumas ações — em particular os levantamentos — podem ficar retidas até que esteja concluída, por isso vale a pena tratar disso antes de precisar, e não no momento em que quer levantar o dinheiro.',
    'rgc.faqQ11':
      'Como posso definir limites de depósito ou autoexcluir-me para jogar de forma responsável?',
    'rgc.faqA11':
      'Ambas as opções estão nesta página. Em Limites de jogo define um teto para o que pode depositar; uma redução entra em vigor de imediato, enquanto um aumento fica retido durante um período de reflexão, para que um limite não possa ser levantado precisamente no momento em que mais o quer levantar. A autoexclusão bloqueia o jogo durante o período que escolher e não pode ser revertida antecipadamente.',
    'rgc.faqQ12': 'Como contacto o apoio ao cliente se tiver um problema?',
    'rgc.faqA12':
      'Envie um e-mail para support@rolluck.com com o seu nome de utilizador e o que estava a fazer quando o problema ocorreu — é a forma mais rápida de chegar a alguém que possa analisar a sua conta. Se precisar de ajuda independente de nós, as organizações indicadas em Autoexclusão são gratuitas e confidenciais, e falar com elas não o compromete a nada.',
    'rgc.assessmentTitle': 'Autoavaliação',
    'rgc.assessIntro':
      'O jogo pode ser um passatempo agradável para muitas pessoas, proporcionando entretenimento e a emoção de correr um risco. No entanto, para algumas pessoas, o jogo pode tornar-se mais do que uma atividade inofensiva. Pode transformar-se num problema grave que afeta vários aspetos da sua vida. Reconhecer os sinais de jogo problemático é o primeiro passo para enfrentar esta questão. Esta ferramenta de autoavaliação foi concebida para o ajudar a refletir sobre o seu comportamento de jogo e a perceber se este pode estar a causar problemas na sua vida. É essencial abordar esta avaliação com honestidade e abertura, para obter uma compreensão clara dos seus hábitos de jogo.',
    'rgc.assessPrompt': 'Tem um problema de jogo? Faça a si mesmo as seguintes perguntas:',
    'rgc.assessScreen1':
      'Já houve períodos de duas semanas ou mais em que passou muito tempo a pensar nas suas experiências de jogo, a planear futuras sessões de jogo ou apostas, ou a pensar em formas de arranjar dinheiro para jogar?',
    'rgc.assessScreen2':
      'Já houve períodos em que precisou de jogar com quantias de dinheiro cada vez maiores, ou com apostas mais altas do que antes, para sentir a mesma excitação?',
    'rgc.assessScreen3':
      'Já se sentiu inquieto ou irritável ao tentar parar, reduzir ou controlar o seu jogo?',
    'rgc.assessScreen4':
      'Já tentou, sem sucesso, parar, reduzir ou controlar o seu jogo três ou mais vezes na sua vida?',
    'rgc.assessScreen5':
      'Já jogou para fugir a problemas pessoais ou para aliviar sentimentos desconfortáveis, como culpa, ansiedade, impotência ou depressão?',
    'rgc.assessScreen6':
      'Já houve algum período em que, se perdesse dinheiro a jogar num dia, voltava muitas vezes noutro dia para recuperar o que tinha perdido?',
    'rgc.assessScreen7':
      'Já mentiu a familiares, amigos ou outras pessoas sobre o quanto joga e/ou sobre quanto dinheiro perdeu no jogo, pelo menos em três ocasiões?',
    'rgc.assessScreen8':
      'Já passou um cheque sem cobertura ou tirou dinheiro que não lhe pertencia a familiares, amigos ou qualquer outra pessoa para pagar o seu jogo?',
    'rgc.assessScreen9':
      'O seu jogo já causou problemas graves ou repetidos nas suas relações com algum familiar ou amigo? Ou o seu jogo já lhe causou problemas no trabalho ou nos estudos?',
    'rgc.assessScreen10':
      'Já precisou de pedir a familiares, amigos, a uma instituição de crédito ou a qualquer outra pessoa que lhe emprestasse dinheiro ou que o tirasse de outra forma de uma situação financeira desesperada causada em grande parte pelo seu jogo?',
    'rgc.assessReminder':
      '*LEMBRETE: esta autoavaliação vai ajudá-lo a perceber se existe um problema ou se está a desenvolver um. Se respondeu sim a uma ou mais das perguntas acima, deve procurar ajuda.',
    'rgc.assessmentModalLead':
      'Assinale tudo o que se aplicou a si nos últimos 12 meses. Deixe o resto em branco.',
    'rgc.assessmentDisclaimer':
      'As suas respostas são contabilizadas, não são guardadas associadas ao seu nome para qualquer outro fim e nunca são usadas para decidir que marketing recebe.',
    'rgc.assessmentSeeResult': 'Ver o meu resultado',
    'rgc.quizQ1': 'Já apostou mais do que realmente podia perder?',
    'rgc.quizQ2': 'Já precisou de apostar quantias maiores para sentir a mesma excitação?',
    'rgc.quizQ3': 'Já voltou noutro dia para recuperar dinheiro que tinha perdido?',
    'rgc.quizQ4': 'Já pediu dinheiro emprestado ou vendeu alguma coisa para poder jogar?',
    'rgc.quizQ5': 'Já sentiu que pode ter um problema com o jogo?',
    'rgc.quizQ6': 'O jogo já lhe causou stress, ansiedade ou outros problemas de saúde?',
    'rgc.quizQ7': 'Outras pessoas já criticaram o seu jogo, quer achasse ou não que tinham razão?',
    'rgc.quizQ8': 'O jogo já causou problemas financeiros a si ou às pessoas com quem vive?',
    'rgc.quizQ9': 'Já se sentiu culpado pela forma como joga ou pelo que acontece quando joga?',
    'rgc.quizQ10': 'Já escondeu o seu jogo, ou minimizou o quanto joga, perante pessoas próximas?',
    'rgc.bandLowHeading': 'Nenhum sinal de alerta nas suas respostas',
    'rgc.bandLowBody':
      'Nada do que respondeu indica um problema neste momento. Isso pode mudar sem que se note, por isso vale a pena voltar a estas perguntas de vez em quando — e definir um limite de depósito enquanto se sente no controlo não lhe custa nada.',
    'rgc.bandModerateHeading': 'Alguns sinais a que vale a pena prestar atenção',
    'rgc.bandModerateBody':
      'Algumas das suas respostas correspondem a perguntas que os serviços de apoio fazem por uma razão. Isto não é um diagnóstico e não significa que tenha um problema — mas é um bom momento para definir um limite e para falar com alguém se alguma destas situações lhe pareceu desconfortavelmente próxima.',
    'rgc.bandHighHeading': 'Vários sinais que não deve ignorar',
    'rgc.bandHighBody':
      'Respondeu sim a várias das perguntas mais importantes. Não podemos dizer-lhe o que isso significa no seu caso — mas as pessoas indicadas abaixo podem, fazem-no gratuitamente e com total confidencialidade, e falar com elas não o obriga a deixar de jogar. Considere definir um limite ou fazer uma pausa enquanto pensa no assunto.',
    'rgc.limitsTitle': 'Limites de jogo',
    'rgc.limitsSet': 'Definir limite de jogo',
    'rgc.limitsPara1':
      'Assuma o controlo do seu jogo definindo limites de perdas ou de apostas. Pode fixar o montante máximo que perde ou aposta num período diário, semanal, mensal ou trimestral.',
    'rgc.limitsPara2':
      'Remover um limite — entra em vigor às 00:00 (UTC+0), após um período de reflexão de pelo menos 24 horas.',
    'rgc.limitsPara3':
      'Os limites ativos são repostos automaticamente às 00:00 (UTC+0) no final de cada período.',
    'rgc.limitTypeLabel': 'Tipo de limite',
    'rgc.limitAmount': 'Montante do limite',
    'rgc.limitPeriod': 'Período do limite',
    'rgc.limitAdd': 'Adicionar limite',
    'rgc.limitMinutes': 'min',
    'rgc.limitDepositLabel': 'Limite de depósito',
    'rgc.limitDepositDesc': 'O máximo que pode adicionar ao seu saldo no período que escolher.',
    'rgc.limitLossLabel': 'Limite de perdas',
    'rgc.limitLossDesc':
      'Limita o que pode perder, descontados os ganhos, para que uma má fase tenha um limite.',
    'rgc.limitWagerLabel': 'Limite de apostas',
    'rgc.limitWagerDesc': 'O total que pode apostar, contabilizado quer a aposta ganhe quer perca.',
    'rgc.limitSessionLabel': 'Limite de tempo',
    'rgc.limitSessionDesc':
      'Durante quanto tempo pode jogar no período; depois disso, a sua sessão é terminada.',
    'rgc.periodPerDay': 'Por dia',
    'rgc.periodPerWeek': 'Por semana',
    'rgc.periodPerMonth': 'Por mês',
    'rgc.duration24h': '24 horas',
    'rgc.duration7d': '7 dias',
    'rgc.duration30d': '30 dias',
    'rgc.duration3m': '3 meses',
    'rgc.duration6m': '6 meses',
    'rgc.duration1y': '1 ano',
    'rgc.duration5y': '5 anos',
    'rgc.exclusionTitle': 'Autoexclusão',
    'rgc.exclusionLead':
      'Precisa de uma pausa da Rolluck? Inicie o processo automático de autoexclusão definindo um limite, e o acesso à sua conta ficará temporariamente bloqueado durante o período selecionado. Tenha em atenção que, durante este período, não terá acesso a nenhum produto do site e quaisquer saldos restantes também ficarão indisponíveis.',
    'rgc.exclusionEmailNote': 'Receberá um e-mail para confirmar o seu pedido.',
    'rgc.exclusionStep1': 'Passo 1: Faça uma pausa de 24 horas',
    'rgc.exclusionStep2': 'Passo 2: Autoexclusão',
    'rgc.exclusionConsent':
      'Ao pedir a autoexclusão, declaro que conheço as regras da autoexclusão e assumo total responsabilidade',
    'rgc.exclusionContinueAction': 'Continuar',
    'rgc.signInExclusion':
      'A autoexclusão aplica-se à sua conta, por isso tem de ter sessão iniciada para a definir. Se já se autoexcluiu e não consegue iniciar sessão, é assim que deve funcionar — contacte o apoio ao cliente em vez de abrir uma nova conta.',
    'rgc.optCooldown': 'Pausa de 24 horas',
    'rgc.opt7d': '7 dias',
    'rgc.opt30d': '30 dias',
    'rgc.opt3m': '3 meses',
    'rgc.opt6m': '6 meses',
    'rgc.opt1y': '1 ano',
    'rgc.opt5y': '5 anos',
    'rgc.optPermanent': 'Permanente',
    'rgc.noteCooldown': 'Uma pausa curta. A sua conta é reaberta automaticamente.',
    'rgc.note7d': 'Uma semana de pausa. A sua conta é reaberta automaticamente.',
    'rgc.note30d': 'Um mês de pausa. A sua conta é reaberta automaticamente.',
    'rgc.noteFullPeriod': 'A sua conta permanece fechada durante todo o período.',
    'rgc.note5y': 'Uma exclusão longa. Tenha a certeza antes de confirmar.',
    'rgc.notePermanent': 'A sua conta é fechada definitivamente e não pode ser reaberta.',
    'rgc.confirmPhrase': 'ME EXCLUA',
    'rgc.term1':
      'Não pode ser anulada. Depois de confirmada, a exclusão dura todo o período que escolheu — o apoio ao cliente não a pode encurtar nem levantar, seja qual for o motivo.',
    'rgc.term2':
      'A sua sessão será terminada de imediato e não poderá depositar, apostar nem abrir uma nova conta.',
    'rgc.term3':
      'Qualquer saldo que tenha é-lhe devolvido. As apostas em aberto são liquidadas normalmente.',
    'rgc.term4':
      'Todo o marketing é interrompido. Não receberá e-mails, SMS nem notificações push promocionais da nossa parte durante esse período.',
    'rgc.term5':
      'Os bónus, rodadas grátis e progresso de fidelidade associados à conta são perdidos e não são repostos quando o período terminar.',
    'rgc.term6':
      'Quando o período terminar, a sua conta não é reaberta por si só, a menos que a indicação acima o diga — terá de pedir a reativação, e existe um período de espera até que esta produza efeito.',
    'rgc.exclusionConfirmTitle': 'Autoexclusão ({period})',
    'rgc.exclusionBreakPeriod': 'Período de pausa',
    'rgc.exclusionToday': 'Hoje',
    'rgc.exclusionConfirmBody':
      'Durante o período de autoexclusão, continua a poder iniciar sessão e levantar o seu saldo disponível. No entanto, qualquer montante sujeito a requisitos de aposta (por exemplo, créditos de bónus ou promocionais) não pode ser levantado até ao fim do período de exclusão e até que os requisitos de aposta sejam cumpridos.',
    'rgc.exclusionUnderstand': 'Ao clicar em confirmar, compreendo que:',
    'rgc.exclusionPoint1': 'NÃO poderei, EM CASO ALGUM, cancelar o período escolhido ({period}).',
    'rgc.exclusionPoint2': 'Continuarei a poder aceder à minha conta e a fazer levantamentos.',
    'rgc.exclusionPoint3':
      'NÃO poderei fazer quaisquer apostas durante o período escolhido ({period}).',
    'rgc.exclusionPoint4': 'O meu gestor de conta deixará automaticamente de me estar atribuído.',
    'rgc.exclusionTypeToConfirm': 'Escreva {phrase} para confirmar',
    'rgc.exclusionConfirmWith': 'Confirmar: {period}',
    'rgc.exclusionActiveTitle': 'Autoexclusão',
    'rgc.exclusionActiveHeading': 'A sua autoexclusão está ativa',
    'rgc.exclusionActiveBody':
      'Durante este período, não pode depositar, apostar nem abrir outra conta. Esta exclusão não pode ser levantada antecipadamente — não contacte o apoio ao cliente para o pedir, porque não o podem fazer.',
    'rgc.exclusionPeriod': 'Período',
    'rgc.exclusionEnds': 'Termina',
    'rgc.exclusionNever': 'Nunca',
    'rgc.budgetTitle': 'Calculadora de orçamento',
    'rgc.budgetIncome': 'Rendimentos',
    'rgc.budgetExpenses': 'Despesas',
    'rgc.budgetTotalIncome': 'Total de rendimentos',
    'rgc.budgetTotalExpenses': 'Total de despesas',
    'rgc.budgetDisposable': 'Rendimento disponível',
    'rgc.budgetWages': 'Salário líquido',
    'rgc.budgetPensions': 'Pensões',
    'rgc.budgetBenefits': 'Prestações sociais',
    'rgc.budgetOtherIncome': 'Outros rendimentos',
    'rgc.budgetRent': 'Renda/prestação da casa',
    'rgc.budgetUtilities': 'Contas da casa',
    'rgc.budgetLoans': 'Empréstimos/crédito',
    'rgc.budgetOtherExpenses': 'Outras despesas',
    'rgc.budgetFieldIncome': 'Rendimento líquido mensal',
    'rgc.budgetFieldIncomeHint': 'O que realmente chega à sua conta depois de impostos.',
    'rgc.budgetFieldHousing': 'Renda ou prestação da casa',
    'rgc.budgetFieldHousingHint': 'Incluindo eventuais despesas de condomínio.',
    'rgc.budgetFieldUtilities': 'Contas e serviços',
    'rgc.budgetFieldUtilitiesHint': 'Eletricidade, água, internet, telefone.',
    'rgc.budgetFieldFood': 'Alimentação e casa',
    'rgc.budgetFieldFoodHint': 'Supermercado e bens essenciais.',
    'rgc.budgetFieldTransport': 'Transportes',
    'rgc.budgetFieldTransportHint': 'Combustível, bilhetes, seguro.',
    'rgc.budgetFieldDebts': 'Prestações de empréstimos e cartões',
    'rgc.budgetFieldDebtsHint': 'O mínimo que tem de pagar todos os meses.',
    'rgc.budgetFieldSavings': 'Poupanças e compromissos',
    'rgc.budgetFieldSavingsHint': 'Dinheiro já comprometido noutros fins.',
    'rgc.budgetFieldOther': 'Tudo o resto',
    'rgc.budgetFieldOtherHint': 'Cuidados infantis, subscrições, despesas médicas.',
  },
  es: {
    'rgc.title': 'Juego responsable',
    'rgc.metaDescription':
      'Establece límites de depósito, pérdidas, apuestas y tiempo, tómate un descanso con la autoexclusión, revisa tu presupuesto o haz una breve autoevaluación.',
    'rgc.close': 'Cerrar',
    'rgc.cancel': 'Cancelar',
    'rgc.saving': 'Guardando…',
    'rgc.navFaqs': 'Preguntas frecuentes',
    'rgc.navAssessment': 'Autoevaluación',
    'rgc.navLimits': 'Límites de juego',
    'rgc.navExclusion': 'Autoexclusión',
    'rgc.navBudget': 'Calculadora de presupuesto',
    'rgc.supportTitle': 'Ayuda independiente',
    'rgc.supportLead':
      'Estas organizaciones no tienen ninguna relación con nosotros. Son gratuitas y confidenciales, y hablar con ellas no te compromete a nada.',
    'rgc.orgGamblingTherapy':
      'Apoyo en línea gratuito y chat en directo, disponible a nivel internacional en muchos idiomas.',
    'rgc.orgGamblersAnonymous':
      'Una comunidad mundial de personas que se están recuperando de un problema con el juego.',
    'rgc.orgGamCare':
      'Información, asesoramiento y orientación psicológica gratuitos para cualquier persona afectada por el juego.',
    'rgc.orgBeGambleAware':
      'Asesoramiento independiente, una autoevaluación y un directorio de centros de tratamiento locales.',
    'rgc.faqsTitle': 'Preguntas frecuentes',
    'rgc.faqQ1': '¿Cómo creo una cuenta en la plataforma del casino?',
    'rgc.faqA1':
      'Para crear una cuenta, haz clic en el botón "Registrarse" situado en la esquina superior derecha de la página de inicio. Rellena los datos obligatorios, como tu dirección de correo electrónico, un nombre de usuario y una contraseña segura. Después recibirás un correo de verificación: haz clic en el enlace para confirmar tu cuenta. Una vez verificada, podrás iniciar sesión, hacer tu primer depósito y empezar a jugar. Todo el proceso dura solo unos minutos.',
    'rgc.faqQ2': '¿Está segura mi información personal y financiera?',
    'rgc.faqA2':
      'El tráfico entre tu dispositivo y nuestros servidores está cifrado, y los datos de tarjetas y billeteras los gestionan nuestros socios de pago en lugar de almacenarse en nuestros sistemas. Puedes activar la autenticación en dos pasos desde Seguridad en tu cuenta, y esa misma pantalla muestra los dispositivos con la sesión iniciada, para que sea fácil detectar uno desconocido y cerrar su sesión.',
    'rgc.faqQ3': '¿Qué debo hacer si olvido la contraseña de mi cuenta?',
    'rgc.faqA3':
      'Usa el enlace "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión. Te enviaremos un enlace de restablecimiento a la dirección de correo de la cuenta; al abrirlo podrás establecer una nueva contraseña. El enlace es de un solo uso, y si solicitas uno nuevo, cualquier enlace anterior dejará de ser válido. Si el correo no llega, revisa tu carpeta de spam antes de pedir otro.',
    'rgc.faqQ4': '¿Qué juegos hay disponibles en la plataforma del casino?',
    'rgc.faqA4':
      'Slots, casino en vivo, juegos de mesa y nuestros propios Rolluck Originals, que encontrarás en Todos los juegos, con un filtro por proveedor si buscas un estudio concreto. Los Originals son demostrablemente justos (provably fair): cada ronda se genera a partir de una semilla del servidor, tu semilla de cliente y un nonce, y puedes cambiar tu semilla y comprobar tú mismo cualquier ronda anterior.',
    'rgc.faqQ5': '¿Qué métodos de pago se aceptan para los depósitos?',
    'rgc.faqA5':
      'La Cartera muestra todos los métodos disponibles para tu cuenta, con el mínimo, el máximo y lo que puedes esperar de cada uno. Los depósitos en criptomonedas se acreditan en cuanto se registran las confirmaciones de red indicadas en la pantalla de depósito. Los métodos ofrecidos pueden variar según la cuenta y la ubicación, así que la lista fiable es la de la Cartera, no lo que se indique aquí.',
    'rgc.faqQ6': '¿Qué bonos y promociones hay disponibles para los nuevos jugadores?',
    'rgc.faqA6':
      'El paquete de bienvenida se muestra en el lobby y en Promociones, y se asocia a tu cuenta al registrarte: no tienes que canjear nada manualmente. Las promociones cambian, así que Promociones es la lista actualizada; cada una tiene sus propios términos, que conviene leer antes de participar.',
    'rgc.faqQ7': '¿Las ofertas de bonos tienen requisitos de apuesta?',
    'rgc.faqA7':
      'Normalmente sí, y el requisito se indica en la propia oferta. Tu progreso se muestra junto a tu saldo de bono. Los fondos de bono se usan después de tu saldo real, de modo que nunca apuestas un bono mientras aún tienes dinero disponible, y el bono se convierte en fondos retirables una vez cumplido su requisito.',
    'rgc.faqQ8': '¿Puedo jugar a los juegos del casino en mi dispositivo móvil?',
    'rgc.faqA8':
      'Sí. El sitio funciona en el navegador del móvil con la misma cuenta, la misma cartera y los mismos juegos: no hay que instalar ninguna aplicación aparte ni transferir nada.',
    'rgc.faqQ9': '¿Cuánto tardan en procesarse los retiros?',
    'rgc.faqA9':
      'Cada retiro se revisa antes de enviarse, y el tiempo que tarda después el dinero depende del método que hayas elegido: las criptomonedas se liquidan en cuanto la red lo confirma, y las tarjetas y billeteras según los plazos de cada proveedor. Un primer retiro puede tardar más si aún no has completado la verificación de identidad; hacerlo una vez permite que los siguientes pagos sigan la vía más rápida.',
    'rgc.faqQ10': '¿Cómo verifico mi identidad para cumplir con los requisitos KYC?',
    'rgc.faqA10':
      'La verificación se encuentra en Verificación, dentro de tu cuenta. Se te pedirán datos y documentos de identidad; cuáles dependerá de los controles que se te apliquen. Algunas acciones, en particular los retiros, pueden quedar retenidas hasta que se complete, así que conviene hacerla antes de necesitarla y no en el momento en que quieras retirar tu dinero.',
    'rgc.faqQ11':
      '¿Cómo puedo establecer límites de depósito o autoexcluirme para jugar de forma responsable?',
    'rgc.faqA11':
      'Ambas opciones están en esta página. Límites de juego establece un tope a lo que puedes depositar; una reducción se aplica de inmediato, mientras que un aumento queda en espera durante un periodo de reflexión, de modo que no puedes levantar un límite justo en el momento en que más deseas hacerlo. La autoexclusión bloquea el juego durante el periodo que elijas y no puede revertirse antes de tiempo.',
    'rgc.faqQ12': '¿Cómo contacto con atención al cliente si tengo un problema?',
    'rgc.faqA12':
      'Escribe a support@rolluck.com e incluye tu nombre de usuario y lo que estabas haciendo cuando ocurrió el problema: es la forma más rápida de llegar a alguien que pueda revisar tu cuenta. Si lo que necesitas es ayuda independiente de nosotros, las organizaciones que aparecen en Autoexclusión son gratuitas y confidenciales, y hablar con ellas no te compromete a nada.',
    'rgc.assessmentTitle': 'Autoevaluación',
    'rgc.assessIntro':
      'Para muchas personas, el juego puede ser un pasatiempo agradable que ofrece entretenimiento y la emoción de asumir un riesgo. Sin embargo, para algunas personas, el juego puede convertirse en algo más que una actividad inofensiva. Puede transformarse en un problema grave que afecta a distintos aspectos de su vida. Reconocer las señales del juego problemático es el primer paso para afrontarlo. Esta herramienta de autoevaluación está diseñada para ayudarte a reflexionar sobre tu comportamiento de juego y determinar si podría estar causándote problemas en tu vida. Es fundamental que respondas con honestidad y franqueza para comprender con claridad tus hábitos de juego.',
    'rgc.assessPrompt': '¿Tienes un problema con el juego? Hazte las siguientes preguntas:',
    'rgc.assessScreen1':
      '¿Ha habido alguna vez periodos de dos semanas o más en los que pasaras mucho tiempo pensando en tus experiencias de juego, planeando futuras sesiones de juego o apuestas, o pensando en formas de conseguir dinero para jugar?',
    'rgc.assessScreen2':
      '¿Ha habido alguna vez periodos en los que necesitaras jugar cantidades de dinero cada vez mayores o hacer apuestas más altas que antes para sentir la misma emoción?',
    'rgc.assessScreen3':
      '¿Te has sentido alguna vez inquieto o irritable al intentar dejar de jugar, reducir o controlar tu juego?',
    'rgc.assessScreen4':
      '¿Has intentado sin éxito dejar de jugar, reducir o controlar tu juego tres o más veces en tu vida?',
    'rgc.assessScreen5':
      '¿Has jugado alguna vez para escapar de problemas personales o para aliviar sentimientos incómodos como la culpa, la ansiedad, la impotencia o la depresión?',
    'rgc.assessScreen6':
      '¿Ha habido alguna vez un periodo en el que, si perdías dinero jugando un día, volvieras a menudo otro día para recuperarlo?',
    'rgc.assessScreen7':
      '¿Has mentido a familiares, amigos u otras personas sobre cuánto juegas y/o cuánto dinero has perdido en el juego, al menos en tres ocasiones?',
    'rgc.assessScreen8':
      '¿Has extendido alguna vez un cheque sin fondos o has tomado dinero que no te pertenecía de familiares, amigos o cualquier otra persona para pagar tu juego?',
    'rgc.assessScreen9':
      '¿Te ha causado alguna vez el juego problemas graves o repetidos en tu relación con algún familiar o amigo? ¿O te ha causado alguna vez el juego problemas en el trabajo o en los estudios?',
    'rgc.assessScreen10':
      '¿Has necesitado alguna vez pedir a familiares, amigos, una entidad de crédito o cualquier otra persona que te prestaran dinero o te sacaran de otro modo de una situación económica desesperada causada en gran parte por el juego?',
    'rgc.assessReminder':
      '*RECORDATORIO: esta autoevaluación te ayudará a averiguar si tienes un problema o si estás desarrollándolo. Si has respondido que sí a una o más de las preguntas anteriores, deberías buscar ayuda.',
    'rgc.assessmentModalLead':
      'Marca todo lo que te haya pasado en los últimos 12 meses. Deja el resto sin marcar.',
    'rgc.assessmentDisclaimer':
      'Tus respuestas solo se cuentan; no se guardan asociadas a tu nombre con ningún otro fin y nunca se usan para decidir qué publicidad recibes.',
    'rgc.assessmentSeeResult': 'Ver mi resultado',
    'rgc.quizQ1': '¿Has apostado más de lo que realmente podías permitirte perder?',
    'rgc.quizQ2': '¿Has necesitado apostar cantidades mayores para sentir la misma emoción?',
    'rgc.quizQ3': '¿Has vuelto otro día para recuperar el dinero que habías perdido?',
    'rgc.quizQ4': '¿Has pedido dinero prestado o vendido algo para poder jugar?',
    'rgc.quizQ5': '¿Has sentido que podrías tener un problema con el juego?',
    'rgc.quizQ6': '¿El juego te ha causado estrés, ansiedad u otros problemas de salud?',
    'rgc.quizQ7':
      '¿Otras personas han criticado tu forma de jugar, tanto si creías que tenían razón como si no?',
    'rgc.quizQ8':
      '¿El juego te ha causado problemas económicos a ti o a las personas con las que vives?',
    'rgc.quizQ9': '¿Te has sentido culpable por cómo juegas o por lo que ocurre cuando lo haces?',
    'rgc.quizQ10':
      '¿Has ocultado que juegas, o has restado importancia a cuánto juegas, ante las personas cercanas a ti?',
    'rgc.bandLowHeading': 'Tus respuestas no muestran señales de alerta',
    'rgc.bandLowBody':
      'Nada de lo que has respondido apunta a un problema hoy. Eso puede cambiar sin que resulte evidente, así que vale la pena volver a estas preguntas de vez en cuando; además, establecer un límite de depósito mientras te sientes en control no te cuesta nada.',
    'rgc.bandModerateHeading': 'Algunas señales a las que conviene prestar atención',
    'rgc.bandModerateBody':
      'Algunas de tus respuestas coinciden con las que los servicios de ayuda preguntan por una razón. Esto no es un diagnóstico ni significa que tengas un problema, pero es un buen momento para establecer un límite y para hablar con alguien si algo de esto te ha resultado incómodamente cercano.',
    'rgc.bandHighHeading': 'Varias señales que no deberías ignorar',
    'rgc.bandHighBody':
      'Has respondido que sí a varias de las preguntas más importantes. Nosotros no podemos decirte qué significa eso en tu caso, pero las personas que aparecen a continuación sí pueden: lo hacen de forma gratuita y confidencial, y hablar con ellas no te compromete a dejar de jugar. Te pedimos que consideres establecer un límite o tomarte un descanso mientras lo piensas.',
    'rgc.limitsTitle': 'Límites de juego',
    'rgc.limitsSet': 'Establecer límite de juego',
    'rgc.limitsPara1':
      'Toma el control de tu juego estableciendo límites de pérdidas o de apuestas. Puedes fijar un tope a la cantidad máxima que pierdes o apuestas en un periodo diario, semanal, mensual o trimestral.',
    'rgc.limitsPara2':
      'Eliminar un límite: se hace efectivo a las 00:00 (UTC+0) tras un periodo de reflexión de al menos 24 horas.',
    'rgc.limitsPara3':
      'Los límites activos se restablecen automáticamente a las 00:00 (UTC+0) al final de cada periodo.',
    'rgc.limitTypeLabel': 'Tipo de límite',
    'rgc.limitAmount': 'Importe del límite',
    'rgc.limitPeriod': 'Periodo del límite',
    'rgc.limitAdd': 'Añadir límite',
    'rgc.limitMinutes': 'min',
    'rgc.limitDepositLabel': 'Límite de depósito',
    'rgc.limitDepositDesc': 'Lo máximo que puedes añadir a tu saldo en el periodo que elijas.',
    'rgc.limitLossLabel': 'Límite de pérdidas',
    'rgc.limitLossDesc':
      'Limita lo que puedes perder descontando las ganancias, para que una mala racha tenga un tope.',
    'rgc.limitWagerLabel': 'Límite de apuestas',
    'rgc.limitWagerDesc':
      'El total que puedes apostar, contabilizado tanto si la apuesta gana como si pierde.',
    'rgc.limitSessionLabel': 'Límite de tiempo',
    'rgc.limitSessionDesc':
      'Cuánto tiempo puedes jugar en el periodo; al alcanzarlo, se cerrará tu sesión.',
    'rgc.periodPerDay': 'Por día',
    'rgc.periodPerWeek': 'Por semana',
    'rgc.periodPerMonth': 'Por mes',
    'rgc.duration24h': '24 horas',
    'rgc.duration7d': '7 días',
    'rgc.duration30d': '30 días',
    'rgc.duration3m': '3 meses',
    'rgc.duration6m': '6 meses',
    'rgc.duration1y': '1 año',
    'rgc.duration5y': '5 años',
    'rgc.exclusionTitle': 'Autoexclusión',
    'rgc.exclusionLead':
      '¿Quieres tomarte un descanso de Rolluck? Inicia el proceso automático de autoexclusión estableciendo un límite, y se te bloqueará temporalmente el acceso a tu cuenta durante el periodo seleccionado. Ten en cuenta que, durante ese tiempo, no tendrás acceso a ningún producto del sitio web y cualquier saldo restante tampoco estará disponible.',
    'rgc.exclusionEmailNote': 'Recibirás un correo electrónico para confirmar tu solicitud.',
    'rgc.exclusionStep1': 'Paso 1: Tómate una pausa de 24 horas',
    'rgc.exclusionStep2': 'Paso 2: Autoexclusión',
    'rgc.exclusionConsent':
      'Al solicitar la autoexclusión, reconozco las normas de la autoexclusión y asumo toda la responsabilidad',
    'rgc.exclusionContinueAction': 'Continuar',
    'rgc.signInExclusion':
      'La autoexclusión se aplica a tu cuenta, así que necesitas haber iniciado sesión para activarla. Si ya te has autoexcluido y no puedes iniciar sesión, es lo esperado: contacta con soporte en lugar de abrir una cuenta nueva.',
    'rgc.optCooldown': 'Pausa de 24 horas',
    'rgc.opt7d': '7 días',
    'rgc.opt30d': '30 días',
    'rgc.opt3m': '3 meses',
    'rgc.opt6m': '6 meses',
    'rgc.opt1y': '1 año',
    'rgc.opt5y': '5 años',
    'rgc.optPermanent': 'Permanente',
    'rgc.noteCooldown': 'Un descanso breve. Tu cuenta se reabre automáticamente.',
    'rgc.note7d': 'Una semana de descanso. Tu cuenta se reabre automáticamente.',
    'rgc.note30d': 'Un mes de descanso. Tu cuenta se reabre automáticamente.',
    'rgc.noteFullPeriod': 'Tu cuenta permanece cerrada durante todo el periodo.',
    'rgc.note5y': 'Una exclusión larga. Asegúrate bien antes de confirmar.',
    'rgc.notePermanent': 'Tu cuenta se cierra para siempre y no podrá reabrirse.',
    'rgc.confirmPhrase': 'QUIERO EXCLUIRME',
    'rgc.term1':
      'No se puede deshacer. Una vez confirmada, la exclusión dura todo el periodo que hayas elegido: soporte no puede acortarla ni levantarla, sea cual sea el motivo.',
    'rgc.term2':
      'Se cerrará tu sesión de inmediato y no podrás depositar, apostar ni abrir una cuenta nueva.',
    'rgc.term3':
      'Se te devolverá cualquier saldo que tengas. Las apuestas abiertas se liquidan con normalidad.',
    'rgc.term4':
      'Se detiene toda la publicidad. No recibirás correos, SMS ni notificaciones push promocionales nuestras mientras dure.',
    'rgc.term5':
      'Los bonos, giros gratis y el progreso de fidelidad vinculados a la cuenta se pierden y no se recuperan cuando termina el periodo.',
    'rgc.term6':
      'Cuando termine el periodo, tu cuenta no se reabrirá sola a menos que así se indique arriba para ese periodo: tendrás que solicitar recuperarla, y hay un periodo de espera antes de que se haga efectivo.',
    'rgc.exclusionConfirmTitle': 'Autoexclusión ({period})',
    'rgc.exclusionBreakPeriod': 'Periodo de descanso',
    'rgc.exclusionToday': 'Hoy',
    'rgc.exclusionConfirmBody':
      'Durante el periodo de autoexclusión, podrás seguir iniciando sesión y retirar tu saldo disponible. Sin embargo, cualquier importe sujeto a requisitos de apuesta (por ejemplo, bonos o créditos promocionales) no podrá retirarse hasta que termine el periodo de exclusión y se cumplan los requisitos de apuesta.',
    'rgc.exclusionUnderstand': 'Al hacer clic en confirmar, entiendo que:',
    'rgc.exclusionPoint1': 'BAJO NINGUNA CIRCUNSTANCIA podré cancelar la autoexclusión ({period}).',
    'rgc.exclusionPoint2': 'Podré seguir accediendo a mi cuenta y realizando retiros.',
    'rgc.exclusionPoint3':
      'NO podré realizar ninguna apuesta durante el periodo seleccionado ({period}).',
    'rgc.exclusionPoint4': 'Se me desasignará automáticamente mi anfitrión.',
    'rgc.exclusionTypeToConfirm': 'Escribe {phrase} para confirmar',
    'rgc.exclusionConfirmWith': 'Confirmar ({period})',
    'rgc.exclusionActiveTitle': 'Autoexclusión',
    'rgc.exclusionActiveHeading': 'Tu autoexclusión está activa',
    'rgc.exclusionActiveBody':
      'No puedes depositar, apostar ni abrir otra cuenta mientras dure. No se puede levantar antes de tiempo: por favor, no contactes con soporte para pedirlo, porque no pueden hacerlo.',
    'rgc.exclusionPeriod': 'Periodo',
    'rgc.exclusionEnds': 'Finaliza',
    'rgc.exclusionNever': 'Nunca',
    'rgc.budgetTitle': 'Calculadora de presupuesto',
    'rgc.budgetIncome': 'Ingresos',
    'rgc.budgetExpenses': 'Gastos',
    'rgc.budgetTotalIncome': 'Ingresos totales',
    'rgc.budgetTotalExpenses': 'Gastos totales',
    'rgc.budgetDisposable': 'Ingresos disponibles',
    'rgc.budgetWages': 'Salario neto',
    'rgc.budgetPensions': 'Pensiones',
    'rgc.budgetBenefits': 'Prestaciones',
    'rgc.budgetOtherIncome': 'Otros ingresos',
    'rgc.budgetRent': 'Alquiler/hipoteca',
    'rgc.budgetUtilities': 'Facturas de suministros',
    'rgc.budgetLoans': 'Préstamos/créditos',
    'rgc.budgetOtherExpenses': 'Otros gastos',
    'rgc.budgetFieldIncome': 'Ingresos netos mensuales',
    'rgc.budgetFieldIncomeHint': 'Lo que realmente llega a tu cuenta después de impuestos.',
    'rgc.budgetFieldHousing': 'Alquiler o hipoteca',
    'rgc.budgetFieldHousingHint': 'Incluidos los gastos de comunidad.',
    'rgc.budgetFieldUtilities': 'Facturas y suministros',
    'rgc.budgetFieldUtilitiesHint': 'Luz, agua, internet, teléfono.',
    'rgc.budgetFieldFood': 'Alimentación y hogar',
    'rgc.budgetFieldFoodHint': 'Compra y productos básicos.',
    'rgc.budgetFieldTransport': 'Transporte',
    'rgc.budgetFieldTransportHint': 'Combustible, billetes, seguros.',
    'rgc.budgetFieldDebts': 'Pagos de préstamos y tarjetas',
    'rgc.budgetFieldDebtsHint': 'El mínimo que debes pagar cada mes.',
    'rgc.budgetFieldSavings': 'Ahorros y compromisos',
    'rgc.budgetFieldSavingsHint': 'Dinero ya comprometido para otras cosas.',
    'rgc.budgetFieldOther': 'Todo lo demás',
    'rgc.budgetFieldOtherHint': 'Cuidado infantil, suscripciones, gastos médicos.',
  },
  it: {
    'rgc.title': 'Gioco responsabile',
    'rgc.metaDescription':
      "Imposta limiti di deposito, di perdita, di puntata e di tempo, prenditi una pausa con l'autoesclusione, controlla il tuo budget o fai una breve autovalutazione.",
    'rgc.close': 'Chiudi',
    'rgc.cancel': 'Annulla',
    'rgc.saving': 'Salvataggio…',
    'rgc.navFaqs': 'Domande frequenti',
    'rgc.navAssessment': 'Autovalutazione',
    'rgc.navLimits': 'Limiti di gioco',
    'rgc.navExclusion': 'Autoesclusione',
    'rgc.navBudget': 'Calcolatore del budget',
    'rgc.supportTitle': 'Aiuto indipendente',
    'rgc.supportLead':
      'Queste organizzazioni non hanno alcun legame con noi. Sono gratuite e riservate, e parlare con loro non ti impegna a nulla.',
    'rgc.orgGamblingTherapy':
      'Supporto online gratuito e chat dal vivo, disponibili a livello internazionale in molte lingue.',
    'rgc.orgGamblersAnonymous':
      "Un'associazione mondiale di persone che si stanno riprendendo da un problema di gioco d'azzardo.",
    'rgc.orgGamCare':
      "Informazioni, consigli e consulenza gratuiti per chiunque sia colpito dal gioco d'azzardo.",
    'rgc.orgBeGambleAware':
      "Consigli indipendenti, un'autovalutazione e un elenco dei servizi di trattamento locali.",
    'rgc.faqsTitle': 'Domande frequenti',
    'rgc.faqQ1': 'Come creo un account sulla piattaforma del casinò?',
    'rgc.faqA1':
      "Per creare un account, clicca sul pulsante \"Registrati\" nell'angolo in alto a destra della homepage. Compila i dati richiesti, tra cui il tuo indirizzo email, il nome utente e una password sicura. Riceverai quindi un'email di verifica: clicca sul link per confermare il tuo account. Una volta verificato, potrai accedere, effettuare il tuo primo deposito e iniziare a giocare. L'intera procedura richiede solo pochi minuti.",
    'rgc.faqQ2': 'Le mie informazioni personali e finanziarie sono al sicuro?',
    'rgc.faqA2':
      "Il traffico tra il tuo dispositivo e i nostri server è crittografato, e i dati di carte e portafogli sono gestiti dai nostri partner di pagamento anziché essere conservati sui nostri sistemi. Puoi attivare l'autenticazione a due fattori dalla sezione Sicurezza del tuo account; la stessa schermata elenca i dispositivi attualmente connessi, così è facile individuarne uno sconosciuto e disconnetterlo.",
    'rgc.faqQ3': 'Cosa devo fare se dimentico la password del mio account?',
    'rgc.faqA3':
      "Usa il link \"Password dimenticata?\" nella schermata di accesso. Invieremo un link di reimpostazione all'indirizzo email associato all'account; aprendolo potrai impostare una nuova password. Il link è monouso e, se ne richiedi uno nuovo, quelli precedenti non saranno più validi. Se l'email non arriva, controlla la cartella spam prima di richiederne un'altra.",
    'rgc.faqQ4': 'Quali giochi sono disponibili sulla piattaforma del casinò?',
    'rgc.faqA4':
      'Slot, casinò live, giochi da tavolo e i nostri Rolluck Originals, elencati in Tutti i giochi con un filtro per provider se cerchi uno studio in particolare. Gli Originals sono dimostrabilmente equi (provably fair): ogni round viene generato a partire da un seed del server, dal tuo seed client e da un nonce, e puoi cambiare il tuo seed e verificare tu stesso qualsiasi round passato.',
    'rgc.faqQ5': 'Quali metodi di pagamento sono accettati per i depositi?',
    'rgc.faqA5':
      "Il Portafoglio elenca tutti i metodi disponibili per il tuo account, con l'importo minimo, l'importo massimo e cosa aspettarti per ciascuno. I depositi in criptovaluta vengono accreditati quando sono state raggiunte le conferme di rete indicate nella schermata di deposito. I metodi offerti possono variare in base all'account e alla località, quindi l'elenco affidabile è quello del Portafoglio, non quanto riportato qui.",
    'rgc.faqQ6': 'Quali bonus e promozioni sono disponibili per i nuovi giocatori?',
    'rgc.faqA6':
      "Il pacchetto di benvenuto è indicato nella lobby e in Promozioni, e viene associato al tuo account al momento della registrazione: non devi riscattare nulla manualmente. Le promozioni cambiano, quindi l'elenco aggiornato è in Promozioni; ognuna ha i propri termini, che vale la pena leggere prima di aderire.",
    'rgc.faqQ7': 'Ci sono requisiti di puntata sulle offerte bonus?',
    'rgc.faqA7':
      "Di solito sì, e il requisito è indicato nell'offerta stessa. I progressi verso il suo completamento sono mostrati insieme al tuo saldo bonus. I fondi bonus vengono utilizzati dopo il saldo reale, quindi non punti mai un bonus finché hai ancora denaro reale disponibile, e il bonus si converte in fondi prelevabili una volta soddisfatto il relativo requisito.",
    'rgc.faqQ8': 'Posso giocare ai giochi del casinò dal mio dispositivo mobile?',
    'rgc.faqA8':
      "Sì. Il sito funziona nel browser del tuo dispositivo mobile con lo stesso account, lo stesso portafoglio e gli stessi giochi: non c'è un'app separata da installare e non occorre trasferire nulla.",
    'rgc.faqQ9': "Quanto tempo richiede l'elaborazione dei prelievi?",
    'rgc.faqA9':
      "Ogni prelievo viene verificato prima di essere inviato, e il tempo necessario perché il denaro arrivi dipende dal metodo scelto: le criptovalute vengono accreditate quando la rete conferma la transazione, mentre i rimborsi su carta e portafoglio seguono le tempistiche del fornitore. Il primo prelievo può richiedere più tempo se la verifica dell'identità non è ancora stata completata; completarla una volta permette ai pagamenti successivi di seguire la via più rapida.",
    'rgc.faqQ10': 'Come verifico la mia identità per rispettare i requisiti KYC?',
    'rgc.faqA10':
      'La verifica si trova nella sezione Verifica del tuo account. Ti verranno richiesti dati e documenti di identità; quali, dipende dai controlli che si applicano al tuo caso. Alcune operazioni, in particolare i prelievi, possono essere sospese finché la verifica non è completata, quindi conviene farla prima che ti serva, anziché nel momento in cui vuoi incassare.',
    'rgc.faqQ11':
      'Come posso impostare limiti di deposito o autoescludermi per giocare in modo responsabile?',
    'rgc.faqA11':
      "Entrambe le opzioni si trovano in questa pagina. Limiti di gioco imposta un tetto a quanto puoi depositare: una riduzione ha effetto immediato, mentre un aumento viene applicato solo dopo un periodo di riflessione, così un limite non può essere tolto proprio nel momento in cui vorresti di più farlo. L'autoesclusione blocca il gioco per un periodo a tua scelta e non può essere revocata prima della scadenza.",
    'rgc.faqQ12': "Come contatto l'assistenza clienti se ho un problema?",
    'rgc.faqA12':
      'Scrivi a support@rolluck.com indicando il tuo nome utente e cosa stavi facendo quando si è verificato il problema: è il modo più rapido per raggiungere qualcuno che possa controllare il tuo account. Se hai bisogno di un aiuto indipendente da noi, le organizzazioni elencate nella sezione Autoesclusione sono gratuite e riservate, e parlare con loro non ti impegna a nulla.',
    'rgc.assessmentTitle': 'Autovalutazione',
    'rgc.assessIntro':
      "Per molte persone il gioco d'azzardo può essere un passatempo piacevole, che offre divertimento e il brivido di correre un rischio. Tuttavia, per alcuni può diventare qualcosa di più di un'attività innocua. Può trasformarsi in un problema serio che incide su vari aspetti della loro vita. Riconoscere i segnali del gioco problematico è il primo passo per affrontare la questione. Questo strumento di autovalutazione è pensato per aiutarti a riflettere sul tuo comportamento di gioco e a capire se potrebbe causarti problemi nella vita. È fondamentale affrontare questa valutazione con onestà e apertura, per avere un quadro chiaro delle tue abitudini di gioco.",
    'rgc.assessPrompt': "Hai un problema con il gioco d'azzardo? Poniti le seguenti domande:",
    'rgc.assessScreen1':
      'Ci sono mai stati periodi di due settimane o più in cui hai passato molto tempo a pensare alle tue esperienze di gioco, a pianificare future giocate o scommesse, o a pensare a come procurarti denaro per giocare?',
    'rgc.assessScreen2':
      'Ci sono mai stati periodi in cui hai avuto bisogno di giocare somme di denaro sempre più alte o di fare scommesse più grandi di prima per provare la stessa sensazione di eccitazione?',
    'rgc.assessScreen3':
      'Ti sei mai sentito irrequieto o irritabile mentre cercavi di smettere, ridurre o controllare il gioco?',
    'rgc.assessScreen4':
      'Nella tua vita hai provato tre o più volte, senza riuscirci, a smettere, ridurre o controllare il gioco?',
    'rgc.assessScreen5':
      'Hai mai giocato per sfuggire a problemi personali o per alleviare sensazioni spiacevoli come senso di colpa, ansia, impotenza o depressione?',
    'rgc.assessScreen6':
      "C'è mai stato un periodo in cui, se un giorno perdevi denaro al gioco, spesso tornavi a giocare un altro giorno per rifarti?",
    'rgc.assessScreen7':
      'Hai mentito a familiari, amici o altre persone su quanto giochi e/o su quanto denaro hai perso al gioco, in almeno tre occasioni?',
    'rgc.assessScreen8':
      'Hai mai emesso un assegno scoperto o preso denaro che non ti apparteneva da familiari, amici o chiunque altro per finanziare il tuo gioco?',
    'rgc.assessScreen9':
      'Il gioco ti ha mai causato problemi gravi o ripetuti nei rapporti con qualcuno dei tuoi familiari o amici? Oppure, il gioco ti ha mai causato problemi sul lavoro o negli studi?',
    'rgc.assessScreen10':
      'Hai mai avuto bisogno di chiedere a familiari, amici, a un istituto di credito o a chiunque altro di prestarti denaro o di tirarti fuori in altro modo da una situazione finanziaria disperata causata in gran parte dal gioco?',
    'rgc.assessReminder':
      '*PROMEMORIA: questa autovalutazione ti aiuterà a capire se hai un problema o se lo stai sviluppando. Se hai risposto sì a una o più delle domande precedenti, dovresti cercare aiuto.',
    'rgc.assessmentModalLead':
      'Spunta ciò che ti è successo negli ultimi 12 mesi. Lascia vuoto il resto.',
    'rgc.assessmentDisclaimer':
      'Le tue risposte vengono conteggiate, non vengono associate al tuo nome per nessun altro scopo e non vengono mai usate per decidere quali comunicazioni di marketing ricevi.',
    'rgc.assessmentSeeResult': 'Vedi il mio risultato',
    'rgc.quizQ1': 'Hai scommesso più di quanto potessi davvero permetterti di perdere?',
    'rgc.quizQ2':
      'Hai avuto bisogno di scommettere somme più alte per provare la stessa eccitazione?',
    'rgc.quizQ3': 'Sei tornato a giocare un altro giorno per recuperare il denaro perso?',
    'rgc.quizQ4': 'Hai preso in prestito denaro o venduto qualcosa per poter giocare?',
    'rgc.quizQ5': "Hai avuto la sensazione di poter avere un problema con il gioco d'azzardo?",
    'rgc.quizQ6': 'Il gioco ti ha causato stress, ansia o altri problemi di salute?',
    'rgc.quizQ7':
      'Altre persone hanno criticato il tuo modo di giocare, indipendentemente dal fatto che tu pensassi avessero ragione o no?',
    'rgc.quizQ8': 'Il gioco ha causato problemi economici a te o alle persone con cui vivi?',
    'rgc.quizQ9':
      'Ti sei sentito in colpa per il modo in cui giochi o per ciò che succede quando giochi?',
    'rgc.quizQ10':
      'Hai nascosto il tuo gioco, o minimizzato quanto giochi, alle persone a te vicine?',
    'rgc.bandLowHeading': 'Nessun segnale di allarme nelle tue risposte',
    'rgc.bandLowBody':
      'Nulla di ciò che hai risposto indica un problema oggi. Questo può cambiare senza che sia evidente, quindi vale la pena tornare su queste domande ogni tanto; inoltre, impostare un limite di deposito mentre ti senti in controllo non ti costa nulla.',
    'rgc.bandModerateHeading': 'Alcuni segnali a cui prestare attenzione',
    'rgc.bandModerateBody':
      'Alcune delle tue risposte riguardano proprio gli aspetti su cui i servizi di supporto pongono domande, e non a caso. Non è una diagnosi e non significa che tu abbia un problema, ma è un buon momento per impostare un limite e per parlare con qualcuno se qualcosa ti è sembrato spiacevolmente familiare.',
    'rgc.bandHighHeading': 'Diversi segnali da non ignorare',
    'rgc.bandHighBody':
      'Hai risposto sì a diverse delle domande più importanti. Non siamo in grado di dirti cosa significhi per te, ma le persone indicate qui sotto possono farlo, gratuitamente e in modo riservato, e parlare con loro non ti obbliga a smettere. Ti invitiamo a valutare di impostare un limite o di prenderti una pausa mentre ci rifletti.',
    'rgc.limitsTitle': 'Limiti di gioco',
    'rgc.limitsSet': 'Imposta limite di gioco',
    'rgc.limitsPara1':
      "Prendi il controllo del tuo gioco impostando limiti di perdita o di puntata. Puoi fissare l'importo massimo che perdi o punti in un periodo giornaliero, settimanale, mensile o trimestrale.",
    'rgc.limitsPara2':
      'Rimozione di un limite: ha effetto alle 00:00 (UTC+0) dopo un periodo di riflessione di almeno 24 ore.',
    'rgc.limitsPara3':
      'I limiti attivi si azzerano automaticamente alle 00:00 (UTC+0) alla fine di ogni periodo.',
    'rgc.limitTypeLabel': 'Tipo di limite',
    'rgc.limitAmount': 'Importo del limite',
    'rgc.limitPeriod': 'Periodo del limite',
    'rgc.limitAdd': 'Aggiungi limite',
    'rgc.limitMinutes': 'min',
    'rgc.limitDepositLabel': 'Limite di deposito',
    'rgc.limitDepositDesc':
      "L'importo massimo che puoi aggiungere al tuo saldo nel periodo scelto.",
    'rgc.limitLossLabel': 'Limite di perdita',
    'rgc.limitLossDesc':
      'Fissa un tetto a quanto puoi perdere al netto delle vincite, così una serie negativa ha un limite.',
    'rgc.limitWagerLabel': 'Limite di puntata',
    'rgc.limitWagerDesc':
      "L'importo totale che puoi puntare, conteggiato sia che la scommessa vinca sia che perda.",
    'rgc.limitSessionLabel': 'Limite di tempo',
    'rgc.limitSessionDesc':
      'Per quanto tempo puoi giocare nel periodo; trascorso questo tempo, verrai disconnesso.',
    'rgc.periodPerDay': 'Al giorno',
    'rgc.periodPerWeek': 'A settimana',
    'rgc.periodPerMonth': 'Al mese',
    'rgc.duration24h': '24 ore',
    'rgc.duration7d': '7 giorni',
    'rgc.duration30d': '30 giorni',
    'rgc.duration3m': '3 mesi',
    'rgc.duration6m': '6 mesi',
    'rgc.duration1y': '1 anno',
    'rgc.duration5y': '5 anni',
    'rgc.exclusionTitle': 'Autoesclusione',
    'rgc.exclusionLead':
      "Vuoi prenderti una pausa da Rolluck? Avvia la procedura automatica di autoesclusione impostando un limite: l'accesso al tuo account sarà temporaneamente bloccato per il periodo selezionato. Tieni presente che durante questo periodo non avrai accesso a nessun prodotto del sito, e anche gli eventuali saldi residui non saranno disponibili.",
    'rgc.exclusionEmailNote': "Riceverai un'email per confermare la tua richiesta.",
    'rgc.exclusionStep1': 'Passo 1: prenditi una pausa di 24 ore',
    'rgc.exclusionStep2': 'Passo 2: autoesclusione',
    'rgc.exclusionConsent':
      "Richiedendo l'autoesclusione, dichiaro di conoscere le regole dell'autoesclusione e me ne assumo la piena responsabilità",
    'rgc.exclusionContinueAction': 'Continua',
    'rgc.signInExclusion':
      "L'autoesclusione si applica al tuo account, quindi devi aver effettuato l'accesso per impostarla. Se ti sei già autoescluso e non riesci ad accedere, è normale: contatta l'assistenza invece di aprire un nuovo account.",
    'rgc.optCooldown': 'Pausa di 24 ore',
    'rgc.opt7d': '7 giorni',
    'rgc.opt30d': '30 giorni',
    'rgc.opt3m': '3 mesi',
    'rgc.opt6m': '6 mesi',
    'rgc.opt1y': '1 anno',
    'rgc.opt5y': '5 anni',
    'rgc.optPermanent': 'Permanente',
    'rgc.noteCooldown': 'Una breve pausa. Il tuo account si riattiva automaticamente.',
    'rgc.note7d': 'Una settimana di pausa. Il tuo account si riattiva automaticamente.',
    'rgc.note30d': 'Un mese di pausa. Il tuo account si riattiva automaticamente.',
    'rgc.noteFullPeriod': "Il tuo account resta chiuso per l'intero periodo.",
    'rgc.note5y': "Un'esclusione lunga. Assicurati della tua scelta prima di confermare.",
    'rgc.notePermanent': 'Il tuo account viene chiuso definitivamente e non potrà essere riaperto.',
    'rgc.confirmPhrase': 'ESCLUDIMI',
    'rgc.term1':
      "Non può essere annullata. Una volta confermata, l'esclusione dura per l'intero periodo scelto: l'assistenza non può accorciarla né revocarla, qualunque sia il motivo.",
    'rgc.term2':
      'Verrai disconnesso immediatamente e non potrai effettuare depositi, scommettere o aprire un nuovo account.',
    'rgc.term3':
      "L'eventuale saldo che possiedi ti viene restituito. Le scommesse aperte vengono regolate normalmente.",
    'rgc.term4':
      'Tutte le comunicazioni di marketing si interrompono. Per tutta la durata non riceverai da noi email, SMS o notifiche push promozionali.',
    'rgc.term5':
      "Bonus, giri gratuiti e progressi fedeltà legati all'account vengono persi e non vengono ripristinati alla fine del periodo.",
    'rgc.term6':
      'Alla fine del periodo il tuo account non si riattiva da solo, a meno che non sia indicato sopra per il periodo scelto: devi richiederne la riattivazione, e prima che abbia effetto è previsto un periodo di attesa.',
    'rgc.exclusionConfirmTitle': 'Autoesclusione ({period})',
    'rgc.exclusionBreakPeriod': 'Periodo di pausa',
    'rgc.exclusionToday': 'Oggi',
    'rgc.exclusionConfirmBody':
      'Durante il periodo di autoesclusione puoi comunque accedere e prelevare il saldo disponibile. Tuttavia, gli importi soggetti a requisiti di puntata (ad es. crediti bonus o promozionali) non possono essere prelevati finché il periodo di esclusione non è terminato e i requisiti di puntata non sono stati soddisfatti.',
    'rgc.exclusionUnderstand': 'Cliccando su conferma, sono consapevole che:',
    'rgc.exclusionPoint1': 'NON potrò in ALCUN MODO annullare il periodo scelto ({period}).',
    'rgc.exclusionPoint2': 'Potrò comunque accedere al mio account ed effettuare prelievi.',
    'rgc.exclusionPoint3':
      'NON potrò piazzare alcuna scommessa durante il periodo scelto ({period}).',
    'rgc.exclusionPoint4': "L'host che mi è stato assegnato verrà rimosso automaticamente.",
    'rgc.exclusionTypeToConfirm': 'Digita {phrase} per confermare',
    'rgc.exclusionConfirmWith': 'Conferma: {period}',
    'rgc.exclusionActiveTitle': 'Autoesclusione',
    'rgc.exclusionActiveHeading': 'La tua autoesclusione è attiva',
    'rgc.exclusionActiveBody':
      "Per tutta la durata non puoi effettuare depositi, scommettere o aprire un altro account. L'autoesclusione non può essere revocata prima della scadenza: ti chiediamo di non contattare l'assistenza per richiederlo, perché non è in grado di farlo.",
    'rgc.exclusionPeriod': 'Periodo',
    'rgc.exclusionEnds': 'Termina',
    'rgc.exclusionNever': 'Mai',
    'rgc.budgetTitle': 'Calcolatore del budget',
    'rgc.budgetIncome': 'Entrate',
    'rgc.budgetExpenses': 'Uscite',
    'rgc.budgetTotalIncome': 'Entrate totali',
    'rgc.budgetTotalExpenses': 'Uscite totali',
    'rgc.budgetDisposable': 'Reddito disponibile',
    'rgc.budgetWages': 'Stipendio netto',
    'rgc.budgetPensions': 'Pensioni',
    'rgc.budgetBenefits': 'Sussidi',
    'rgc.budgetOtherIncome': 'Altre entrate',
    'rgc.budgetRent': 'Affitto/mutuo',
    'rgc.budgetUtilities': 'Bollette',
    'rgc.budgetLoans': 'Prestiti/credito',
    'rgc.budgetOtherExpenses': 'Altre uscite',
    'rgc.budgetFieldIncome': 'Reddito netto mensile',
    'rgc.budgetFieldIncomeHint': 'Quanto arriva effettivamente sul tuo conto dopo le tasse.',
    'rgc.budgetFieldHousing': 'Affitto o mutuo',
    'rgc.budgetFieldHousingHint': 'Incluse eventuali spese condominiali.',
    'rgc.budgetFieldUtilities': 'Bollette e utenze',
    'rgc.budgetFieldUtilitiesHint': 'Luce e gas, acqua, internet, telefono.',
    'rgc.budgetFieldFood': 'Alimentari e casa',
    'rgc.budgetFieldFoodHint': 'Spesa e beni essenziali.',
    'rgc.budgetFieldTransport': 'Trasporti',
    'rgc.budgetFieldTransportHint': 'Carburante, biglietti, assicurazione.',
    'rgc.budgetFieldDebts': 'Rate di prestiti e carte',
    'rgc.budgetFieldDebtsHint': "L'importo minimo che devi pagare ogni mese.",
    'rgc.budgetFieldSavings': 'Risparmi e impegni',
    'rgc.budgetFieldSavingsHint': 'Denaro già destinato ad altro.',
    'rgc.budgetFieldOther': 'Tutto il resto',
    'rgc.budgetFieldOtherHint': "Assistenza all'infanzia, abbonamenti, spese mediche.",
  },
};
