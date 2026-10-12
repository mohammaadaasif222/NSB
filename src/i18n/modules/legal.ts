import type { ModuleDict } from './types';

/**
 * The Terms & Conditions and Privacy Policy, plus the chrome around them.
 *
 * Paragraph-per-key, in document order, so a translator can read each
 * document top to bottom. The Affiliate page's terms panel quotes the first
 * nine Terms sections verbatim and reuses these same keys.
 */
export const en = {
  /* --- Page chrome ------------------------------------------------------ */
  'legal.updated': 'Last Updated: {date}',
  'legal.page.title': 'Terms and conditions',
  'legal.page.metaDescription':
    'The terms that apply when you use Rolluck, and the Privacy Policy explaining what information we collect and how we protect it.',
  'legal.doc.eyebrow': 'Legal',
  'legal.doc.lastUpdated': 'Last updated {date}',
  'legal.doc.contents': 'Contents',
  'legal.doc.onThisPage': 'On this page',

  /* --- Terms & Conditions ----------------------------------------------- */
  'legal.terms.intro':
    'Welcome to Rolluck. By creating an account or using our website, games, promotions, and services, you agree to these Terms & Conditions.',
  'legal.terms.about.title': '1. About Rolluck',
  'legal.terms.about.p1':
    'Rolluck provides online gaming and entertainment services through its website and related platforms. These Terms explain the rules that apply when you use our services.',
  'legal.terms.eligibility.title': '2. Eligibility',
  'legal.terms.eligibility.p1':
    'You must meet the minimum legal age and all other eligibility requirements applicable in your location to use Rolluck.',
  'legal.terms.eligibility.p2':
    'You are responsible for ensuring that online gaming is legally permitted in your jurisdiction.',
  'legal.terms.eligibility.p3':
    'Rolluck reserves the right to verify your age, identity, and eligibility at any time.',
  'legal.terms.account.title': '3. Your Account',
  'legal.terms.account.p1':
    'You are responsible for providing accurate and up-to-date information when creating your account.',
  'legal.terms.account.p2':
    'You must keep your login details confidential and must not allow another person to use your account.',
  'legal.terms.account.p3': 'One person may only maintain accounts as permitted by Rolluck.',
  'legal.terms.account.p4':
    'If we identify suspicious, fraudulent, or unauthorized activity, we may restrict, suspend, or close an account.',
  'legal.terms.deposits.title': '4. Deposits & Withdrawals',
  'legal.terms.deposits.p1':
    'All deposits must come from a payment method that you are authorized to use.',
  'legal.terms.deposits.p2':
    'You are responsible for checking your balance and transaction information.',
  'legal.terms.deposits.p3':
    'Withdrawals may require identity verification and additional checks before being processed.',
  'legal.terms.deposits.p4':
    'Processing times may vary depending on the payment method and verification requirements.',
  'legal.terms.games.title': '5. Games & Results',
  'legal.terms.games.p1': 'All games are subject to their individual rules and conditions.',
  'legal.terms.games.p2':
    'Game results are determined by the applicable game systems and technologies used by Rolluck.',
  'legal.terms.games.p3':
    'In the event of a technical issue, system error, or malfunction, Rolluck may take appropriate action, including voiding affected transactions or games where permitted by applicable law.',
  'legal.terms.bonuses.title': '6. Bonuses & Promotions',
  'legal.terms.bonuses.p1':
    'Promotions, bonuses, rewards, and campaigns may have their own specific terms.',
  'legal.terms.bonuses.p2':
    'You must read and understand the applicable promotional conditions before participating.',
  'legal.terms.bonuses.p3':
    'Rolluck reserves the right to cancel, modify, or withdraw a promotion where permitted by applicable law.',
  'legal.terms.rg.title': '7. Responsible Gaming',
  'legal.terms.rg.p1': 'We want gaming to remain entertainment.',
  'legal.terms.rg.p2':
    'Set limits, understand your spending, and only play with money you can afford to lose.',
  'legal.terms.rg.p3':
    'If gaming stops feeling like entertainment, take a break and use the responsible gaming tools available through Rolluck.',
  'legal.terms.prohibited.title': '8. Prohibited Activities',
  'legal.terms.prohibited.p1':
    'You must not use Rolluck for fraud, money laundering, unauthorized transactions, cheating, manipulation, or any other unlawful activity.',
  'legal.terms.prohibited.p2':
    'You must not attempt to interfere with our website, games, systems, or security measures.',
  'legal.terms.suspension.title': '9. Account Suspension & Closure',
  'legal.terms.suspension.p1':
    'Rolluck may suspend or close an account where there is a breach of these Terms, suspected fraud, security concerns, legal requirements, or other legitimate reasons.',
  'legal.terms.suspension.p2':
    'Where required by law, applicable balances will be handled according to the relevant procedures.',
  'legal.terms.ip.title': '10. Intellectual Property',
  'legal.terms.ip.p1':
    'All Rolluck branding, designs, graphics, content, software, and other materials belong to Rolluck or its respective licensors.',
  'legal.terms.ip.p2':
    'You may not copy, reproduce, modify, distribute, or commercially use our content without permission.',
  'legal.terms.availability.title': '11. Availability',
  'legal.terms.availability.p1':
    'We aim to keep Rolluck available and reliable, but we cannot guarantee uninterrupted access.',
  'legal.terms.availability.p2':
    'Maintenance, technical issues, third-party services, or circumstances beyond our reasonable control may affect availability.',
  'legal.terms.changes.title': '12. Changes to These Terms',
  'legal.terms.changes.p1': 'We may update these Terms from time to time.',
  'legal.terms.changes.p2':
    'When changes are made, we will update the date shown at the top of this page. Your continued use of Rolluck after the changes take effect means you accept the updated Terms, where permitted by law.',
  'legal.terms.contact.title': '13. Contact Us',
  'legal.terms.contact.p1':
    'If you have questions about these Terms, your account, or our services, please contact Rolluck Support through the available support channels.',
  'legal.terms.signOff': 'Rolluck — Play with confidence. Play responsibly.',

  /* --- Privacy Policy --------------------------------------------------- */
  'legal.privacy.intro':
    'At Rolluck, we understand that your personal information matters. This Privacy Policy explains what information we collect, why we collect it, how we use it, and how we work to protect it.',
  'legal.privacy.collect.title': '1. Information We Collect',
  'legal.privacy.collect.p1':
    'Depending on how you use Rolluck, we may collect information such as:',
  'legal.privacy.collect.i1': 'Name and contact information',
  'legal.privacy.collect.i2': 'Date of birth and age verification information',
  'legal.privacy.collect.i3': 'Account and login information',
  'legal.privacy.collect.i4': 'Identity verification information',
  'legal.privacy.collect.i5': 'Payment and transaction information',
  'legal.privacy.collect.i6': 'Gaming and account activity',
  'legal.privacy.collect.i7': 'Device and technical information',
  'legal.privacy.collect.i8': 'IP address and approximate location information',
  'legal.privacy.collect.i9': 'Communications with our customer support team',
  'legal.privacy.collect.i10': 'Information required to meet legal and regulatory obligations',
  'legal.privacy.use.title': '2. How We Use Your Information',
  'legal.privacy.use.p1': 'We may use your information to:',
  'legal.privacy.use.i1': 'Create and manage your Rolluck account',
  'legal.privacy.use.i2': 'Provide our gaming and related services',
  'legal.privacy.use.i3': 'Process deposits and withdrawals',
  'legal.privacy.use.i4': 'Verify your identity and eligibility',
  'legal.privacy.use.i5': 'Prevent fraud, abuse, and unauthorized activity',
  'legal.privacy.use.i6': 'Protect the security of our platform',
  'legal.privacy.use.i7': 'Provide customer support',
  'legal.privacy.use.i8': 'Improve our games, services, and user experience',
  'legal.privacy.use.i9': 'Meet legal and regulatory requirements',
  'legal.privacy.use.i10': 'Send service-related communications',
  'legal.privacy.use.i11':
    'Send promotional communications where permitted and where you have the appropriate choice or consent',
  'legal.privacy.cookies.title': '3. Cookies & Similar Technologies',
  'legal.privacy.cookies.p1':
    'Rolluck may use cookies and similar technologies to remember preferences, understand how our website is used, improve performance, and support security.',
  'legal.privacy.cookies.p2':
    'You may be able to manage certain cookie preferences through your browser or our available privacy controls.',
  'legal.privacy.share.title': '4. How We Share Information',
  'legal.privacy.share.p1':
    'We do not sell your personal information simply for the purpose of selling it.',
  'legal.privacy.share.p2':
    'We may share information with trusted service providers, payment providers, identity verification providers, technology partners, professional advisers, regulators, law enforcement, or other parties where necessary and permitted by applicable law.',
  'legal.privacy.protect.title': '5. Protecting Your Information',
  'legal.privacy.protect.p1':
    'We use reasonable technical, organizational, and security measures designed to protect your information against unauthorized access, loss, misuse, alteration, or disclosure.',
  'legal.privacy.protect.p2':
    'However, no online system can be guaranteed to be completely secure.',
  'legal.privacy.retention.title': '6. Data Retention',
  'legal.privacy.retention.p1':
    'We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including to provide services, meet legal obligations, resolve disputes, prevent fraud, and enforce our agreements.',
  'legal.privacy.retention.p2':
    'Retention periods may vary depending on the type of information and applicable legal requirements.',
  'legal.privacy.rights.title': '7. Your Privacy Rights',
  'legal.privacy.rights.p1':
    'Depending on where you live, you may have rights relating to your personal information, including the right to:',
  'legal.privacy.rights.i1': 'Request access to your information',
  'legal.privacy.rights.i2': 'Request correction of inaccurate information',
  'legal.privacy.rights.i3': 'Request deletion where legally available',
  'legal.privacy.rights.i4': 'Object to or restrict certain processing',
  'legal.privacy.rights.i5': 'Withdraw consent where processing is based on consent',
  'legal.privacy.rights.i6': 'Request a copy of certain information',
  'legal.privacy.rights.p2': 'Some rights may be subject to legal or regulatory limitations.',
  'legal.privacy.children.title': "8. Children's Privacy",
  'legal.privacy.children.p1':
    'Rolluck is intended only for individuals who meet the applicable minimum legal age for our services.',
  'legal.privacy.children.p2':
    'We do not knowingly allow individuals who are not legally eligible to use our services to create or maintain accounts.',
  'legal.privacy.transfers.title': '9. International Data Transfers',
  'legal.privacy.transfers.p1':
    'Your information may be processed or stored in countries outside your place of residence.',
  'legal.privacy.transfers.p2':
    'Where required, Rolluck will take appropriate steps to ensure that applicable legal requirements for international data transfers are followed.',
  'legal.privacy.thirdParty.title': '10. Third-Party Services',
  'legal.privacy.thirdParty.p1':
    'Rolluck may work with third-party services that help us provide payments, identity verification, security, analytics, communications, and other functionality.',
  'legal.privacy.thirdParty.p2':
    'These providers may process information according to their own privacy policies and applicable agreements.',
  'legal.privacy.changes.title': '11. Changes to This Privacy Policy',
  'legal.privacy.changes.p1':
    'We may update this Privacy Policy from time to time to reflect changes to our services, technology, or legal requirements.',
  'legal.privacy.changes.p2':
    'The latest version will always display the updated date at the top of this page.',
  'legal.privacy.contact.title': '12. Contact Us',
  'legal.privacy.contact.p1':
    'If you have questions about this Privacy Policy or want to exercise an applicable privacy right, please contact Rolluck through our official support channels.',
  'legal.privacy.signOff1': 'Your privacy matters.',
  'legal.privacy.signOff2': 'Your trust matters.',
  'legal.privacy.signOff3': 'At Rolluck, we take both seriously.',
} as const;

export const translations: ModuleDict<typeof en> = {
  ar: {
    'legal.updated': 'آخر تحديث: {date}',
    'legal.page.title': 'الشروط والأحكام',
    'legal.page.metaDescription':
      'الشروط التي تنطبق عند استخدامك لـ Rolluck، وسياسة الخصوصية التي توضّح المعلومات التي نجمعها وكيف نحميها.',
    'legal.doc.eyebrow': 'قانوني',
    'legal.doc.lastUpdated': 'آخر تحديث {date}',
    'legal.doc.contents': 'المحتويات',
    'legal.doc.onThisPage': 'في هذه الصفحة',

    'legal.terms.intro':
      'مرحباً بك في Rolluck. بإنشائك حساباً أو باستخدامك موقعنا الإلكتروني وألعابنا وعروضنا الترويجية وخدماتنا، فإنك توافق على هذه الشروط والأحكام.',
    'legal.terms.about.title': '1. نبذة عن Rolluck',
    'legal.terms.about.p1':
      'تقدّم Rolluck خدمات الألعاب والترفيه عبر الإنترنت من خلال موقعها الإلكتروني والمنصات المرتبطة به. توضّح هذه الشروط القواعد التي تنطبق عند استخدامك لخدماتنا.',
    'legal.terms.eligibility.title': '2. الأهلية',
    'legal.terms.eligibility.p1':
      'يجب أن تستوفي الحد الأدنى للسن القانونية وجميع متطلبات الأهلية الأخرى المعمول بها في مكان وجودك لاستخدام Rolluck.',
    'legal.terms.eligibility.p2':
      'أنت مسؤول عن التأكد من أن الألعاب عبر الإنترنت مسموح بها قانونياً في نطاق ولايتك القضائية.',
    'legal.terms.eligibility.p3': 'تحتفظ Rolluck بالحق في التحقق من سنّك وهويتك وأهليتك في أي وقت.',
    'legal.terms.account.title': '3. حسابك',
    'legal.terms.account.p1': 'أنت مسؤول عن تقديم معلومات دقيقة ومحدّثة عند إنشاء حسابك.',
    'legal.terms.account.p2':
      'يجب عليك الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك، ويجب ألا تسمح لأي شخص آخر باستخدام حسابك.',
    'legal.terms.account.p3':
      'لا يجوز للشخص الواحد الاحتفاظ بحسابات إلا وفقاً لما تسمح به Rolluck.',
    'legal.terms.account.p4':
      'إذا رصدنا نشاطاً مريباً أو احتيالياً أو غير مصرّح به، فيجوز لنا تقييد الحساب أو تعليقه أو إغلاقه.',
    'legal.terms.deposits.title': '4. الإيداعات والسحوبات',
    'legal.terms.deposits.p1': 'يجب أن تتم جميع الإيداعات من وسيلة دفع مصرّح لك باستخدامها.',
    'legal.terms.deposits.p2': 'أنت مسؤول عن التحقق من رصيدك ومعلومات معاملاتك.',
    'legal.terms.deposits.p3':
      'قد تتطلب عمليات السحب التحقق من الهوية وإجراء فحوصات إضافية قبل معالجتها.',
    'legal.terms.deposits.p4': 'قد تختلف مدة المعالجة بحسب وسيلة الدفع ومتطلبات التحقق.',
    'legal.terms.games.title': '5. الألعاب والنتائج',
    'legal.terms.games.p1': 'تخضع جميع الألعاب لقواعدها وشروطها الخاصة.',
    'legal.terms.games.p2':
      'تُحدَّد نتائج الألعاب بواسطة أنظمة الألعاب والتقنيات المعمول بها التي تستخدمها Rolluck.',
    'legal.terms.games.p3':
      'في حال حدوث مشكلة تقنية أو خطأ في النظام أو عطل، يجوز لـ Rolluck اتخاذ الإجراء المناسب، بما في ذلك إلغاء المعاملات أو الألعاب المتأثرة حيثما يسمح القانون المعمول به بذلك.',
    'legal.terms.bonuses.title': '6. المكافآت والعروض الترويجية',
    'legal.terms.bonuses.p1': 'قد تكون للعروض الترويجية والمكافآت والجوائز والحملات شروط خاصة بها.',
    'legal.terms.bonuses.p2': 'يجب عليك قراءة شروط العرض الترويجي المعمول بها وفهمها قبل المشاركة.',
    'legal.terms.bonuses.p3':
      'تحتفظ Rolluck بالحق في إلغاء أي عرض ترويجي أو تعديله أو سحبه حيثما يسمح القانون المعمول به بذلك.',
    'legal.terms.rg.title': '7. اللعب المسؤول',
    'legal.terms.rg.p1': 'نريد أن تبقى الألعاب وسيلة للترفيه.',
    'legal.terms.rg.p2':
      'ضع حدوداً لنفسك، وكن على دراية بإنفاقك، ولا تلعب إلا بأموال يمكنك تحمّل خسارتها.',
    'legal.terms.rg.p3':
      'إذا لم تعد الألعاب تشعرك بالمتعة، فخذ استراحة واستخدم أدوات اللعب المسؤول المتاحة عبر Rolluck.',
    'legal.terms.prohibited.title': '8. الأنشطة المحظورة',
    'legal.terms.prohibited.p1':
      'يجب ألا تستخدم Rolluck للاحتيال أو غسل الأموال أو إجراء معاملات غير مصرّح بها أو الغش أو التلاعب أو أي نشاط آخر مخالف للقانون.',
    'legal.terms.prohibited.p2':
      'يجب ألا تحاول التدخل في موقعنا الإلكتروني أو ألعابنا أو أنظمتنا أو إجراءاتنا الأمنية.',
    'legal.terms.suspension.title': '9. تعليق الحساب وإغلاقه',
    'legal.terms.suspension.p1':
      'يجوز لـ Rolluck تعليق الحساب أو إغلاقه في حال مخالفة هذه الشروط، أو الاشتباه في الاحتيال، أو وجود مخاوف أمنية، أو متطلبات قانونية، أو لأسباب مشروعة أخرى.',
    'legal.terms.suspension.p2':
      'حيثما يقتضي القانون ذلك، ستُعالَج الأرصدة المعنية وفقاً للإجراءات ذات الصلة.',
    'legal.terms.ip.title': '10. الملكية الفكرية',
    'legal.terms.ip.p1':
      'جميع العلامات التجارية والتصاميم والرسومات والمحتوى والبرمجيات وغيرها من المواد الخاصة بـ Rolluck مملوكة لـ Rolluck أو للجهات المرخِّصة المعنية.',
    'legal.terms.ip.p2':
      'لا يجوز لك نسخ محتوانا أو إعادة إنتاجه أو تعديله أو توزيعه أو استخدامه تجارياً دون إذن.',
    'legal.terms.availability.title': '11. التوفّر',
    'legal.terms.availability.p1':
      'نسعى إلى إبقاء Rolluck متاحاً وموثوقاً، لكن لا يمكننا ضمان الوصول دون انقطاع.',
    'legal.terms.availability.p2':
      'قد تؤثر أعمال الصيانة أو المشكلات التقنية أو خدمات الأطراف الثالثة أو الظروف الخارجة عن سيطرتنا المعقولة في توفّر الخدمة.',
    'legal.terms.changes.title': '12. التغييرات على هذه الشروط',
    'legal.terms.changes.p1': 'يجوز لنا تحديث هذه الشروط من وقت لآخر.',
    'legal.terms.changes.p2':
      'عند إجراء أي تغييرات، سنحدّث التاريخ الظاهر أعلى هذه الصفحة. ويعني استمرارك في استخدام Rolluck بعد سريان التغييرات قبولك للشروط المحدّثة، حيثما يسمح القانون بذلك.',
    'legal.terms.contact.title': '13. اتصل بنا',
    'legal.terms.contact.p1':
      'إذا كانت لديك أسئلة حول هذه الشروط أو حسابك أو خدماتنا، فيُرجى التواصل مع فريق دعم Rolluck عبر قنوات الدعم المتاحة.',
    'legal.terms.signOff': 'Rolluck — العب بثقة. العب بمسؤولية.',

    'legal.privacy.intro':
      'في Rolluck، ندرك أن معلوماتك الشخصية مهمة. توضّح سياسة الخصوصية هذه المعلومات التي نجمعها، وسبب جمعها، وكيفية استخدامها، وكيف نعمل على حمايتها.',
    'legal.privacy.collect.title': '1. المعلومات التي نجمعها',
    'legal.privacy.collect.p1': 'بحسب طريقة استخدامك لـ Rolluck، قد نجمع معلومات مثل:',
    'legal.privacy.collect.i1': 'الاسم ومعلومات الاتصال',
    'legal.privacy.collect.i2': 'تاريخ الميلاد ومعلومات التحقق من السن',
    'legal.privacy.collect.i3': 'معلومات الحساب وتسجيل الدخول',
    'legal.privacy.collect.i4': 'معلومات التحقق من الهوية',
    'legal.privacy.collect.i5': 'معلومات الدفع والمعاملات',
    'legal.privacy.collect.i6': 'نشاط اللعب ونشاط الحساب',
    'legal.privacy.collect.i7': 'معلومات الجهاز والمعلومات التقنية',
    'legal.privacy.collect.i8': 'عنوان IP ومعلومات الموقع التقريبي',
    'legal.privacy.collect.i9': 'المراسلات مع فريق دعم العملاء لدينا',
    'legal.privacy.collect.i10': 'المعلومات المطلوبة للوفاء بالالتزامات القانونية والتنظيمية',
    'legal.privacy.use.title': '2. كيف نستخدم معلوماتك',
    'legal.privacy.use.p1': 'قد نستخدم معلوماتك من أجل:',
    'legal.privacy.use.i1': 'إنشاء حسابك في Rolluck وإدارته',
    'legal.privacy.use.i2': 'تقديم خدمات الألعاب والخدمات ذات الصلة',
    'legal.privacy.use.i3': 'معالجة الإيداعات والسحوبات',
    'legal.privacy.use.i4': 'التحقق من هويتك وأهليتك',
    'legal.privacy.use.i5': 'منع الاحتيال وإساءة الاستخدام والنشاط غير المصرّح به',
    'legal.privacy.use.i6': 'حماية أمن منصتنا',
    'legal.privacy.use.i7': 'تقديم دعم العملاء',
    'legal.privacy.use.i8': 'تحسين ألعابنا وخدماتنا وتجربة المستخدم',
    'legal.privacy.use.i9': 'الوفاء بالمتطلبات القانونية والتنظيمية',
    'legal.privacy.use.i10': 'إرسال المراسلات المتعلقة بالخدمة',
    'legal.privacy.use.i11':
      'إرسال المراسلات الترويجية حيثما يُسمح بذلك وحيثما يكون لديك الخيار المناسب أو تكون قد منحت موافقتك',
    'legal.privacy.cookies.title': '3. ملفات تعريف الارتباط والتقنيات المشابهة',
    'legal.privacy.cookies.p1':
      'قد تستخدم Rolluck ملفات تعريف الارتباط والتقنيات المشابهة لتذكّر التفضيلات، وفهم كيفية استخدام موقعنا الإلكتروني، وتحسين الأداء، ودعم الأمان.',
    'legal.privacy.cookies.p2':
      'قد تتمكن من إدارة بعض تفضيلات ملفات تعريف الارتباط من خلال متصفحك أو من خلال أدوات التحكم في الخصوصية المتاحة لدينا.',
    'legal.privacy.share.title': '4. كيف نشارك المعلومات',
    'legal.privacy.share.p1': 'لا نبيع معلوماتك الشخصية لمجرد غرض البيع.',
    'legal.privacy.share.p2':
      'قد نشارك المعلومات مع مزوّدي خدمات موثوقين، ومزوّدي خدمات الدفع، ومزوّدي خدمات التحقق من الهوية، والشركاء التقنيين، والمستشارين المهنيين، والجهات التنظيمية، وجهات إنفاذ القانون، أو أطراف أخرى حيثما كان ذلك ضرورياً ومسموحاً به بموجب القانون المعمول به.',
    'legal.privacy.protect.title': '5. حماية معلوماتك',
    'legal.privacy.protect.p1':
      'نستخدم تدابير تقنية وتنظيمية وأمنية معقولة مصمّمة لحماية معلوماتك من الوصول غير المصرّح به أو الفقدان أو سوء الاستخدام أو التغيير أو الإفصاح.',
    'legal.privacy.protect.p2': 'ومع ذلك، لا يمكن ضمان أن يكون أي نظام عبر الإنترنت آمناً تماماً.',
    'legal.privacy.retention.title': '6. الاحتفاظ بالبيانات',
    'legal.privacy.retention.p1':
      'نحتفظ بالمعلومات الشخصية فقط للمدة اللازمة بشكل معقول للأغراض الموضّحة في سياسة الخصوصية هذه، بما في ذلك تقديم الخدمات، والوفاء بالالتزامات القانونية، وحل النزاعات، ومنع الاحتيال، وإنفاذ اتفاقياتنا.',
    'legal.privacy.retention.p2':
      'قد تختلف فترات الاحتفاظ بحسب نوع المعلومات والمتطلبات القانونية المعمول بها.',
    'legal.privacy.rights.title': '7. حقوقك المتعلقة بالخصوصية',
    'legal.privacy.rights.p1':
      'بحسب مكان إقامتك، قد تكون لديك حقوق تتعلق بمعلوماتك الشخصية، بما في ذلك الحق في:',
    'legal.privacy.rights.i1': 'طلب الوصول إلى معلوماتك',
    'legal.privacy.rights.i2': 'طلب تصحيح المعلومات غير الدقيقة',
    'legal.privacy.rights.i3': 'طلب الحذف حيثما كان ذلك متاحاً قانونياً',
    'legal.privacy.rights.i4': 'الاعتراض على بعض عمليات المعالجة أو تقييدها',
    'legal.privacy.rights.i5': 'سحب الموافقة حيثما تستند المعالجة إلى الموافقة',
    'legal.privacy.rights.i6': 'طلب نسخة من بعض المعلومات',
    'legal.privacy.rights.p2': 'قد تخضع بعض الحقوق لقيود قانونية أو تنظيمية.',
    'legal.privacy.children.title': '8. خصوصية الأطفال',
    'legal.privacy.children.p1':
      'Rolluck مخصّص فقط للأفراد الذين بلغوا الحد الأدنى للسن القانونية المعمول به لاستخدام خدماتنا.',
    'legal.privacy.children.p2':
      'لا نسمح عن علم للأفراد غير المؤهلين قانونياً لاستخدام خدماتنا بإنشاء حسابات أو الاحتفاظ بها.',
    'legal.privacy.transfers.title': '9. نقل البيانات دولياً',
    'legal.privacy.transfers.p1': 'قد تُعالَج معلوماتك أو تُخزَّن في دول خارج مكان إقامتك.',
    'legal.privacy.transfers.p2':
      'حيثما يلزم، ستتخذ Rolluck الخطوات المناسبة لضمان الالتزام بالمتطلبات القانونية المعمول بها لنقل البيانات دولياً.',
    'legal.privacy.thirdParty.title': '10. خدمات الأطراف الثالثة',
    'legal.privacy.thirdParty.p1':
      'قد تتعاون Rolluck مع خدمات أطراف ثالثة تساعدنا في توفير المدفوعات، والتحقق من الهوية، والأمان، والتحليلات، والاتصالات، ووظائف أخرى.',
    'legal.privacy.thirdParty.p2':
      'قد يعالج هؤلاء المزوّدون المعلومات وفقاً لسياسات الخصوصية الخاصة بهم والاتفاقيات المعمول بها.',
    'legal.privacy.changes.title': '11. التغييرات على سياسة الخصوصية هذه',
    'legal.privacy.changes.p1':
      'يجوز لنا تحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في خدماتنا أو تقنياتنا أو المتطلبات القانونية.',
    'legal.privacy.changes.p2': 'ستعرض أحدث نسخة دائماً تاريخ التحديث أعلى هذه الصفحة.',
    'legal.privacy.contact.title': '12. اتصل بنا',
    'legal.privacy.contact.p1':
      'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه أو كنت ترغب في ممارسة أحد حقوق الخصوصية المعمول بها، فيُرجى التواصل مع Rolluck عبر قنوات الدعم الرسمية لدينا.',
    'legal.privacy.signOff1': 'خصوصيتك مهمة.',
    'legal.privacy.signOff2': 'ثقتك مهمة.',
    'legal.privacy.signOff3': 'في Rolluck، نأخذ كليهما على محمل الجد.',
  },
  tr: {
    'legal.updated': 'Son Güncelleme: {date}',
    'legal.page.title': 'Şartlar ve koşullar',
    'legal.page.metaDescription':
      "Rolluck'u kullandığınızda geçerli olan şartlar ve hangi bilgileri topladığımızı ve bunları nasıl koruduğumuzu açıklayan Gizlilik Politikası.",
    'legal.doc.eyebrow': 'Yasal',
    'legal.doc.lastUpdated': 'Son güncelleme {date}',
    'legal.doc.contents': 'İçindekiler',
    'legal.doc.onThisPage': 'Bu sayfada',

    'legal.terms.intro':
      "Rolluck'a hoş geldiniz. Bir hesap oluşturarak veya web sitemizi, oyunlarımızı, promosyonlarımızı ve hizmetlerimizi kullanarak bu Şartlar ve Koşulları kabul etmiş olursunuz.",
    'legal.terms.about.title': '1. Rolluck Hakkında',
    'legal.terms.about.p1':
      'Rolluck, web sitesi ve ilgili platformlar aracılığıyla çevrim içi oyun ve eğlence hizmetleri sunar. Bu Şartlar, hizmetlerimizi kullandığınızda geçerli olan kuralları açıklar.',
    'legal.terms.eligibility.title': '2. Uygunluk',
    'legal.terms.eligibility.p1':
      "Rolluck'u kullanabilmek için bulunduğunuz yerde geçerli olan asgari yasal yaşı ve diğer tüm uygunluk koşullarını karşılamanız gerekir.",
    'legal.terms.eligibility.p2':
      'Çevrim içi oyunların bulunduğunuz yargı bölgesinde yasal olarak izinli olduğundan emin olmak sizin sorumluluğunuzdadır.',
    'legal.terms.eligibility.p3':
      'Rolluck, yaşınızı, kimliğinizi ve uygunluğunuzu herhangi bir zamanda doğrulama hakkını saklı tutar.',
    'legal.terms.account.title': '3. Hesabınız',
    'legal.terms.account.p1':
      'Hesabınızı oluştururken doğru ve güncel bilgi vermekten siz sorumlusunuz.',
    'legal.terms.account.p2':
      'Giriş bilgilerinizi gizli tutmalı ve hesabınızı başka bir kişinin kullanmasına izin vermemelisiniz.',
    'legal.terms.account.p3':
      "Bir kişi yalnızca Rolluck'un izin verdiği şekilde hesap sahibi olabilir.",
    'legal.terms.account.p4':
      'Şüpheli, hileli veya yetkisiz bir etkinlik tespit edersek bir hesabı kısıtlayabilir, askıya alabilir veya kapatabiliriz.',
    'legal.terms.deposits.title': '4. Para Yatırma ve Çekme',
    'legal.terms.deposits.p1':
      'Tüm para yatırma işlemleri, kullanma yetkiniz olan bir ödeme yönteminden yapılmalıdır.',
    'legal.terms.deposits.p2':
      'Bakiyenizi ve işlem bilgilerinizi kontrol etmek sizin sorumluluğunuzdadır.',
    'legal.terms.deposits.p3':
      'Para çekme işlemleri, işleme alınmadan önce kimlik doğrulaması ve ek kontroller gerektirebilir.',
    'legal.terms.deposits.p4':
      'İşlem süreleri, ödeme yöntemine ve doğrulama gerekliliklerine bağlı olarak değişebilir.',
    'legal.terms.games.title': '5. Oyunlar ve Sonuçlar',
    'legal.terms.games.p1': 'Tüm oyunlar kendi kurallarına ve koşullarına tabidir.',
    'legal.terms.games.p2':
      'Oyun sonuçları, Rolluck tarafından kullanılan ilgili oyun sistemleri ve teknolojileri tarafından belirlenir.',
    'legal.terms.games.p3':
      'Teknik bir sorun, sistem hatası veya arıza durumunda Rolluck, yürürlükteki yasaların izin verdiği ölçüde etkilenen işlemleri veya oyunları geçersiz saymak da dahil olmak üzere uygun önlemleri alabilir.',
    'legal.terms.bonuses.title': '6. Bonuslar ve Promosyonlar',
    'legal.terms.bonuses.p1':
      'Promosyonlar, bonuslar, ödüller ve kampanyaların kendilerine özgü şartları olabilir.',
    'legal.terms.bonuses.p2':
      'Katılmadan önce ilgili promosyon koşullarını okumalı ve anlamalısınız.',
    'legal.terms.bonuses.p3':
      'Rolluck, yürürlükteki yasaların izin verdiği ölçüde bir promosyonu iptal etme, değiştirme veya geri çekme hakkını saklı tutar.',
    'legal.terms.rg.title': '7. Sorumlu Oyun',
    'legal.terms.rg.p1': 'Oyunların bir eğlence olarak kalmasını istiyoruz.',
    'legal.terms.rg.p2':
      'Limitler belirleyin, harcamalarınızın farkında olun ve yalnızca kaybetmeyi göze alabileceğiniz parayla oynayın.',
    'legal.terms.rg.p3':
      'Oyun artık eğlenceli gelmiyorsa ara verin ve Rolluck üzerinden sunulan sorumlu oyun araçlarını kullanın.',
    'legal.terms.prohibited.title': '8. Yasaklanmış Faaliyetler',
    'legal.terms.prohibited.p1':
      "Rolluck'u dolandırıcılık, kara para aklama, yetkisiz işlemler, hile, manipülasyon veya diğer herhangi bir yasa dışı faaliyet için kullanmamalısınız.",
    'legal.terms.prohibited.p2':
      'Web sitemize, oyunlarımıza, sistemlerimize veya güvenlik önlemlerimize müdahale etmeye çalışmamalısınız.',
    'legal.terms.suspension.title': '9. Hesabın Askıya Alınması ve Kapatılması',
    'legal.terms.suspension.p1':
      'Rolluck, bu Şartların ihlali, dolandırıcılık şüphesi, güvenlik endişeleri, yasal gereklilikler veya diğer meşru nedenlerin bulunması halinde bir hesabı askıya alabilir veya kapatabilir.',
    'legal.terms.suspension.p2':
      'Yasaların gerektirdiği durumlarda ilgili bakiyeler, ilgili prosedürlere uygun olarak işleme alınır.',
    'legal.terms.ip.title': '10. Fikri Mülkiyet',
    'legal.terms.ip.p1':
      "Tüm Rolluck markaları, tasarımları, grafikleri, içerikleri, yazılımları ve diğer materyaller Rolluck'a veya ilgili lisans verenlerine aittir.",
    'legal.terms.ip.p2':
      'İçeriğimizi izin almadan kopyalayamaz, çoğaltamaz, değiştiremez, dağıtamaz veya ticari amaçla kullanamazsınız.',
    'legal.terms.availability.title': '11. Erişilebilirlik',
    'legal.terms.availability.p1':
      "Rolluck'u erişilebilir ve güvenilir tutmayı amaçlıyoruz, ancak kesintisiz erişimi garanti edemeyiz.",
    'legal.terms.availability.p2':
      'Bakım çalışmaları, teknik sorunlar, üçüncü taraf hizmetleri veya makul kontrolümüz dışındaki durumlar erişilebilirliği etkileyebilir.',
    'legal.terms.changes.title': '12. Bu Şartlarda Yapılacak Değişiklikler',
    'legal.terms.changes.p1': 'Bu Şartları zaman zaman güncelleyebiliriz.',
    'legal.terms.changes.p2':
      "Değişiklik yapıldığında bu sayfanın üst kısmında gösterilen tarihi güncelleyeceğiz. Değişiklikler yürürlüğe girdikten sonra Rolluck'u kullanmaya devam etmeniz, yasaların izin verdiği ölçüde güncellenmiş Şartları kabul ettiğiniz anlamına gelir.",
    'legal.terms.contact.title': '13. Bize Ulaşın',
    'legal.terms.contact.p1':
      'Bu Şartlar, hesabınız veya hizmetlerimiz hakkında sorularınız varsa lütfen mevcut destek kanalları aracılığıyla Rolluck Destek ekibiyle iletişime geçin.',
    'legal.terms.signOff': 'Rolluck — Güvenle oynayın. Sorumlu oynayın.',

    'legal.privacy.intro':
      'Rolluck olarak kişisel bilgilerinizin önemli olduğunun farkındayız. Bu Gizlilik Politikası, hangi bilgileri topladığımızı, neden topladığımızı, nasıl kullandığımızı ve onları korumak için nasıl çalıştığımızı açıklar.',
    'legal.privacy.collect.title': '1. Topladığımız Bilgiler',
    'legal.privacy.collect.p1':
      "Rolluck'u nasıl kullandığınıza bağlı olarak aşağıdaki gibi bilgiler toplayabiliriz:",
    'legal.privacy.collect.i1': 'Ad ve iletişim bilgileri',
    'legal.privacy.collect.i2': 'Doğum tarihi ve yaş doğrulama bilgileri',
    'legal.privacy.collect.i3': 'Hesap ve giriş bilgileri',
    'legal.privacy.collect.i4': 'Kimlik doğrulama bilgileri',
    'legal.privacy.collect.i5': 'Ödeme ve işlem bilgileri',
    'legal.privacy.collect.i6': 'Oyun ve hesap etkinliği',
    'legal.privacy.collect.i7': 'Cihaz ve teknik bilgiler',
    'legal.privacy.collect.i8': 'IP adresi ve yaklaşık konum bilgileri',
    'legal.privacy.collect.i9': 'Müşteri destek ekibimizle yapılan yazışmalar',
    'legal.privacy.collect.i10':
      'Yasal ve düzenleyici yükümlülükleri yerine getirmek için gereken bilgiler',
    'legal.privacy.use.title': '2. Bilgilerinizi Nasıl Kullanıyoruz',
    'legal.privacy.use.p1': 'Bilgilerinizi şu amaçlarla kullanabiliriz:',
    'legal.privacy.use.i1': 'Rolluck hesabınızı oluşturmak ve yönetmek',
    'legal.privacy.use.i2': 'Oyun hizmetlerimizi ve ilgili hizmetleri sunmak',
    'legal.privacy.use.i3': 'Para yatırma ve çekme işlemlerini gerçekleştirmek',
    'legal.privacy.use.i4': 'Kimliğinizi ve uygunluğunuzu doğrulamak',
    'legal.privacy.use.i5': 'Dolandırıcılığı, kötüye kullanımı ve yetkisiz etkinlikleri önlemek',
    'legal.privacy.use.i6': 'Platformumuzun güvenliğini korumak',
    'legal.privacy.use.i7': 'Müşteri desteği sağlamak',
    'legal.privacy.use.i8': 'Oyunlarımızı, hizmetlerimizi ve kullanıcı deneyimini geliştirmek',
    'legal.privacy.use.i9': 'Yasal ve düzenleyici gereklilikleri karşılamak',
    'legal.privacy.use.i10': 'Hizmetle ilgili bildirimler göndermek',
    'legal.privacy.use.i11':
      'İzin verilen durumlarda ve uygun tercih hakkına sahip olduğunuz ya da onay verdiğiniz hallerde tanıtım amaçlı iletiler göndermek',
    'legal.privacy.cookies.title': '3. Çerezler ve Benzeri Teknolojiler',
    'legal.privacy.cookies.p1':
      'Rolluck; tercihleri hatırlamak, web sitemizin nasıl kullanıldığını anlamak, performansı iyileştirmek ve güvenliği desteklemek için çerezler ve benzeri teknolojiler kullanabilir.',
    'legal.privacy.cookies.p2':
      'Bazı çerez tercihlerinizi tarayıcınız veya sunduğumuz gizlilik kontrolleri aracılığıyla yönetebilirsiniz.',
    'legal.privacy.share.title': '4. Bilgileri Nasıl Paylaşıyoruz',
    'legal.privacy.share.p1': 'Kişisel bilgilerinizi yalnızca satmak amacıyla satmayız.',
    'legal.privacy.share.p2':
      'Gerekli olduğu ve yürürlükteki yasaların izin verdiği durumlarda bilgileri güvenilir hizmet sağlayıcılar, ödeme sağlayıcıları, kimlik doğrulama sağlayıcıları, teknoloji ortakları, profesyonel danışmanlar, düzenleyici kurumlar, kolluk kuvvetleri veya diğer taraflarla paylaşabiliriz.',
    'legal.privacy.protect.title': '5. Bilgilerinizin Korunması',
    'legal.privacy.protect.p1':
      'Bilgilerinizi yetkisiz erişime, kayba, kötüye kullanıma, değiştirilmeye veya ifşa edilmeye karşı korumak için tasarlanmış makul teknik, organizasyonel ve güvenlik önlemleri kullanıyoruz.',
    'legal.privacy.protect.p2':
      'Ancak hiçbir çevrim içi sistemin tamamen güvenli olduğu garanti edilemez.',
    'legal.privacy.retention.title': '6. Verilerin Saklanması',
    'legal.privacy.retention.p1':
      "Kişisel bilgileri yalnızca bu Gizlilik Politikası'nda açıklanan amaçlar için makul ölçüde gerekli olduğu süre boyunca saklarız; bu amaçlar arasında hizmet sunmak, yasal yükümlülükleri yerine getirmek, anlaşmazlıkları çözmek, dolandırıcılığı önlemek ve sözleşmelerimizi uygulamak yer alır.",
    'legal.privacy.retention.p2':
      'Saklama süreleri, bilginin türüne ve yürürlükteki yasal gerekliliklere bağlı olarak değişebilir.',
    'legal.privacy.rights.title': '7. Gizlilik Haklarınız',
    'legal.privacy.rights.p1':
      'Yaşadığınız yere bağlı olarak kişisel bilgilerinizle ilgili, aşağıdakiler dahil çeşitli haklara sahip olabilirsiniz:',
    'legal.privacy.rights.i1': 'Bilgilerinize erişim talep etme',
    'legal.privacy.rights.i2': 'Yanlış bilgilerin düzeltilmesini talep etme',
    'legal.privacy.rights.i3': 'Yasal olarak mümkün olduğu durumlarda silinmesini talep etme',
    'legal.privacy.rights.i4': 'Belirli işlemlere itiraz etme veya bunları kısıtlama',
    'legal.privacy.rights.i5': 'İşlemenin onaya dayandığı durumlarda onayı geri çekme',
    'legal.privacy.rights.i6': 'Belirli bilgilerin bir kopyasını talep etme',
    'legal.privacy.rights.p2': 'Bazı haklar yasal veya düzenleyici sınırlamalara tabi olabilir.',
    'legal.privacy.children.title': '8. Çocukların Gizliliği',
    'legal.privacy.children.p1':
      'Rolluck yalnızca hizmetlerimiz için geçerli asgari yasal yaşı karşılayan kişilere yöneliktir.',
    'legal.privacy.children.p2':
      'Hizmetlerimizi kullanmaya yasal olarak uygun olmayan kişilerin bilerek hesap oluşturmasına veya hesap sahibi olmasına izin vermeyiz.',
    'legal.privacy.transfers.title': '9. Uluslararası Veri Aktarımları',
    'legal.privacy.transfers.p1':
      'Bilgileriniz, ikamet ettiğiniz yerin dışındaki ülkelerde işlenebilir veya saklanabilir.',
    'legal.privacy.transfers.p2':
      'Gerekli durumlarda Rolluck, uluslararası veri aktarımlarına ilişkin geçerli yasal gerekliliklere uyulmasını sağlamak için uygun adımları atacaktır.',
    'legal.privacy.thirdParty.title': '10. Üçüncü Taraf Hizmetleri',
    'legal.privacy.thirdParty.p1':
      'Rolluck; ödemeler, kimlik doğrulama, güvenlik, analiz, iletişim ve diğer işlevleri sağlamamıza yardımcı olan üçüncü taraf hizmetleriyle çalışabilir.',
    'legal.privacy.thirdParty.p2':
      'Bu sağlayıcılar bilgileri kendi gizlilik politikalarına ve geçerli sözleşmelere uygun olarak işleyebilir.',
    'legal.privacy.changes.title': '11. Bu Gizlilik Politikasında Yapılacak Değişiklikler',
    'legal.privacy.changes.p1':
      "Bu Gizlilik Politikası'nı hizmetlerimizdeki, teknolojimizdeki veya yasal gerekliliklerdeki değişiklikleri yansıtmak için zaman zaman güncelleyebiliriz.",
    'legal.privacy.changes.p2':
      'En son sürüm, güncelleme tarihini her zaman bu sayfanın üst kısmında gösterecektir.',
    'legal.privacy.contact.title': '12. Bize Ulaşın',
    'legal.privacy.contact.p1':
      'Bu Gizlilik Politikası hakkında sorularınız varsa veya geçerli bir gizlilik hakkınızı kullanmak istiyorsanız lütfen resmi destek kanallarımız aracılığıyla Rolluck ile iletişime geçin.',
    'legal.privacy.signOff1': 'Gizliliğiniz önemlidir.',
    'legal.privacy.signOff2': 'Güveniniz önemlidir.',
    'legal.privacy.signOff3': 'Rolluck olarak ikisini de ciddiye alıyoruz.',
  },
  hi: {
    'legal.updated': 'अंतिम अपडेट: {date}',
    'legal.page.title': 'नियम और शर्तें',
    'legal.page.metaDescription':
      'Rolluck का उपयोग करते समय लागू होने वाली शर्तें, और गोपनीयता नीति जो बताती है कि हम कौन-सी जानकारी एकत्र करते हैं और उसे कैसे सुरक्षित रखते हैं।',
    'legal.doc.eyebrow': 'कानूनी',
    'legal.doc.lastUpdated': 'अंतिम अपडेट {date}',
    'legal.doc.contents': 'विषय-सूची',
    'legal.doc.onThisPage': 'इस पेज पर',

    'legal.terms.intro':
      'Rolluck में आपका स्वागत है। खाता बनाकर या हमारी वेबसाइट, गेम, प्रमोशन और सेवाओं का उपयोग करके, आप इन नियमों और शर्तों से सहमत होते हैं।',
    'legal.terms.about.title': '1. Rolluck के बारे में',
    'legal.terms.about.p1':
      'Rolluck अपनी वेबसाइट और संबंधित प्लेटफ़ॉर्म के माध्यम से ऑनलाइन गेमिंग और मनोरंजन सेवाएँ प्रदान करता है। ये शर्तें उन नियमों को समझाती हैं जो हमारी सेवाओं का उपयोग करते समय लागू होते हैं।',
    'legal.terms.eligibility.title': '2. पात्रता',
    'legal.terms.eligibility.p1':
      'Rolluck का उपयोग करने के लिए आपको अपने स्थान पर लागू न्यूनतम कानूनी आयु और अन्य सभी पात्रता आवश्यकताओं को पूरा करना होगा।',
    'legal.terms.eligibility.p2':
      'यह सुनिश्चित करना आपकी ज़िम्मेदारी है कि आपके क्षेत्राधिकार में ऑनलाइन गेमिंग कानूनी रूप से अनुमत है।',
    'legal.terms.eligibility.p3':
      'Rolluck किसी भी समय आपकी आयु, पहचान और पात्रता को सत्यापित करने का अधिकार सुरक्षित रखता है।',
    'legal.terms.account.title': '3. आपका खाता',
    'legal.terms.account.p1':
      'खाता बनाते समय सटीक और अद्यतन जानकारी प्रदान करना आपकी ज़िम्मेदारी है।',
    'legal.terms.account.p2':
      'आपको अपने लॉगिन विवरण गोपनीय रखने होंगे और किसी अन्य व्यक्ति को अपने खाते का उपयोग करने की अनुमति नहीं देनी होगी।',
    'legal.terms.account.p3':
      'एक व्यक्ति केवल उतने ही खाते रख सकता है जितनी Rolluck अनुमति देता है।',
    'legal.terms.account.p4':
      'यदि हमें संदिग्ध, धोखाधड़ीपूर्ण या अनधिकृत गतिविधि का पता चलता है, तो हम किसी खाते को प्रतिबंधित, निलंबित या बंद कर सकते हैं।',
    'legal.terms.deposits.title': '4. जमा और निकासी',
    'legal.terms.deposits.p1':
      'सभी जमा ऐसी भुगतान विधि से होने चाहिए जिसका उपयोग करने के लिए आप अधिकृत हैं।',
    'legal.terms.deposits.p2':
      'अपने बैलेंस और लेन-देन की जानकारी की जाँच करना आपकी ज़िम्मेदारी है।',
    'legal.terms.deposits.p3':
      'निकासी को प्रोसेस करने से पहले पहचान सत्यापन और अतिरिक्त जाँच की आवश्यकता हो सकती है।',
    'legal.terms.deposits.p4':
      'प्रोसेसिंग का समय भुगतान विधि और सत्यापन आवश्यकताओं के आधार पर अलग-अलग हो सकता है।',
    'legal.terms.games.title': '5. गेम और परिणाम',
    'legal.terms.games.p1': 'सभी गेम अपने-अपने नियमों और शर्तों के अधीन हैं।',
    'legal.terms.games.p2':
      'गेम के परिणाम Rolluck द्वारा उपयोग की जाने वाली संबंधित गेम प्रणालियों और तकनीकों द्वारा निर्धारित किए जाते हैं।',
    'legal.terms.games.p3':
      'किसी तकनीकी समस्या, सिस्टम त्रुटि या खराबी की स्थिति में, Rolluck उचित कार्रवाई कर सकता है, जिसमें लागू कानून द्वारा अनुमत होने पर प्रभावित लेन-देन या गेम को रद्द करना शामिल है।',
    'legal.terms.bonuses.title': '6. बोनस और प्रमोशन',
    'legal.terms.bonuses.p1':
      'प्रमोशन, बोनस, रिवॉर्ड और अभियानों की अपनी विशिष्ट शर्तें हो सकती हैं।',
    'legal.terms.bonuses.p2': 'भाग लेने से पहले आपको लागू प्रमोशनल शर्तों को पढ़ना और समझना होगा।',
    'legal.terms.bonuses.p3':
      'Rolluck लागू कानून द्वारा अनुमत होने पर किसी प्रमोशन को रद्द करने, संशोधित करने या वापस लेने का अधिकार सुरक्षित रखता है।',
    'legal.terms.rg.title': '7. ज़िम्मेदार गेमिंग',
    'legal.terms.rg.p1': 'हम चाहते हैं कि गेमिंग मनोरंजन ही बना रहे।',
    'legal.terms.rg.p2':
      'सीमाएँ तय करें, अपने खर्च को समझें, और केवल उतने पैसे से खेलें जितना खोना आप वहन कर सकते हैं।',
    'legal.terms.rg.p3':
      'यदि गेमिंग मनोरंजन जैसा महसूस होना बंद हो जाए, तो ब्रेक लें और Rolluck पर उपलब्ध ज़िम्मेदार गेमिंग टूल का उपयोग करें।',
    'legal.terms.prohibited.title': '8. निषिद्ध गतिविधियाँ',
    'legal.terms.prohibited.p1':
      'आपको Rolluck का उपयोग धोखाधड़ी, मनी लॉन्ड्रिंग, अनधिकृत लेन-देन, बेईमानी, हेरफेर या किसी अन्य गैरकानूनी गतिविधि के लिए नहीं करना चाहिए।',
    'legal.terms.prohibited.p2':
      'आपको हमारी वेबसाइट, गेम, सिस्टम या सुरक्षा उपायों में हस्तक्षेप करने का प्रयास नहीं करना चाहिए।',
    'legal.terms.suspension.title': '9. खाता निलंबन और बंद करना',
    'legal.terms.suspension.p1':
      'इन शर्तों के उल्लंघन, संदिग्ध धोखाधड़ी, सुरक्षा संबंधी चिंताओं, कानूनी आवश्यकताओं या अन्य वैध कारणों की स्थिति में Rolluck किसी खाते को निलंबित या बंद कर सकता है।',
    'legal.terms.suspension.p2':
      'जहाँ कानून द्वारा आवश्यक हो, वहाँ संबंधित बैलेंस को प्रासंगिक प्रक्रियाओं के अनुसार संभाला जाएगा।',
    'legal.terms.ip.title': '10. बौद्धिक संपदा',
    'legal.terms.ip.p1':
      'Rolluck की सभी ब्रांडिंग, डिज़ाइन, ग्राफ़िक्स, सामग्री, सॉफ़्टवेयर और अन्य सामग्रियाँ Rolluck या उसके संबंधित लाइसेंसदाताओं की हैं।',
    'legal.terms.ip.p2':
      'आप अनुमति के बिना हमारी सामग्री की प्रतिलिपि, पुनरुत्पादन, संशोधन, वितरण या व्यावसायिक उपयोग नहीं कर सकते।',
    'legal.terms.availability.title': '11. उपलब्धता',
    'legal.terms.availability.p1':
      'हम Rolluck को उपलब्ध और विश्वसनीय बनाए रखने का प्रयास करते हैं, लेकिन हम निर्बाध पहुँच की गारंटी नहीं दे सकते।',
    'legal.terms.availability.p2':
      'रखरखाव, तकनीकी समस्याएँ, तृतीय-पक्ष सेवाएँ, या हमारे उचित नियंत्रण से बाहर की परिस्थितियाँ उपलब्धता को प्रभावित कर सकती हैं।',
    'legal.terms.changes.title': '12. इन शर्तों में बदलाव',
    'legal.terms.changes.p1': 'हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं।',
    'legal.terms.changes.p2':
      'बदलाव किए जाने पर, हम इस पेज के शीर्ष पर दिखाई गई तारीख को अपडेट करेंगे। बदलाव प्रभावी होने के बाद Rolluck का उपयोग जारी रखने का अर्थ है कि आप अपडेट की गई शर्तों को स्वीकार करते हैं, जहाँ कानून द्वारा अनुमत हो।',
    'legal.terms.contact.title': '13. हमसे संपर्क करें',
    'legal.terms.contact.p1':
      'यदि इन शर्तों, आपके खाते या हमारी सेवाओं के बारे में आपके कोई प्रश्न हैं, तो कृपया उपलब्ध सहायता चैनलों के माध्यम से Rolluck सहायता से संपर्क करें।',
    'legal.terms.signOff': 'Rolluck — आत्मविश्वास से खेलें। ज़िम्मेदारी से खेलें।',

    'legal.privacy.intro':
      'Rolluck में, हम समझते हैं कि आपकी व्यक्तिगत जानकारी महत्वपूर्ण है। यह गोपनीयता नीति बताती है कि हम कौन-सी जानकारी एकत्र करते हैं, क्यों एकत्र करते हैं, उसका उपयोग कैसे करते हैं, और उसे सुरक्षित रखने के लिए हम कैसे काम करते हैं।',
    'legal.privacy.collect.title': '1. हम कौन-सी जानकारी एकत्र करते हैं',
    'legal.privacy.collect.p1':
      'आप Rolluck का उपयोग कैसे करते हैं, इसके आधार पर हम निम्न प्रकार की जानकारी एकत्र कर सकते हैं:',
    'legal.privacy.collect.i1': 'नाम और संपर्क जानकारी',
    'legal.privacy.collect.i2': 'जन्मतिथि और आयु सत्यापन जानकारी',
    'legal.privacy.collect.i3': 'खाता और लॉगिन जानकारी',
    'legal.privacy.collect.i4': 'पहचान सत्यापन जानकारी',
    'legal.privacy.collect.i5': 'भुगतान और लेन-देन की जानकारी',
    'legal.privacy.collect.i6': 'गेमिंग और खाता गतिविधि',
    'legal.privacy.collect.i7': 'डिवाइस और तकनीकी जानकारी',
    'legal.privacy.collect.i8': 'IP पता और अनुमानित स्थान की जानकारी',
    'legal.privacy.collect.i9': 'हमारी ग्राहक सहायता टीम के साथ हुआ संवाद',
    'legal.privacy.collect.i10': 'कानूनी और नियामक दायित्वों को पूरा करने के लिए आवश्यक जानकारी',
    'legal.privacy.use.title': '2. हम आपकी जानकारी का उपयोग कैसे करते हैं',
    'legal.privacy.use.p1': 'हम आपकी जानकारी का उपयोग निम्न के लिए कर सकते हैं:',
    'legal.privacy.use.i1': 'आपका Rolluck खाता बनाना और प्रबंधित करना',
    'legal.privacy.use.i2': 'हमारी गेमिंग और संबंधित सेवाएँ प्रदान करना',
    'legal.privacy.use.i3': 'जमा और निकासी को प्रोसेस करना',
    'legal.privacy.use.i4': 'आपकी पहचान और पात्रता सत्यापित करना',
    'legal.privacy.use.i5': 'धोखाधड़ी, दुरुपयोग और अनधिकृत गतिविधि को रोकना',
    'legal.privacy.use.i6': 'हमारे प्लेटफ़ॉर्म की सुरक्षा बनाए रखना',
    'legal.privacy.use.i7': 'ग्राहक सहायता प्रदान करना',
    'legal.privacy.use.i8': 'हमारे गेम, सेवाओं और उपयोगकर्ता अनुभव को बेहतर बनाना',
    'legal.privacy.use.i9': 'कानूनी और नियामक आवश्यकताओं को पूरा करना',
    'legal.privacy.use.i10': 'सेवा से संबंधित संदेश भेजना',
    'legal.privacy.use.i11':
      'जहाँ अनुमत हो और जहाँ आपके पास उपयुक्त विकल्प हो या आपने सहमति दी हो, वहाँ प्रचार संबंधी संदेश भेजना',
    'legal.privacy.cookies.title': '3. कुकीज़ और समान तकनीकें',
    'legal.privacy.cookies.p1':
      'Rolluck प्राथमिकताओं को याद रखने, यह समझने के लिए कि हमारी वेबसाइट का उपयोग कैसे किया जाता है, प्रदर्शन बेहतर बनाने और सुरक्षा में सहायता के लिए कुकीज़ और समान तकनीकों का उपयोग कर सकता है।',
    'legal.privacy.cookies.p2':
      'आप अपने ब्राउज़र या हमारे उपलब्ध गोपनीयता नियंत्रणों के माध्यम से कुछ कुकी प्राथमिकताओं को प्रबंधित कर सकते हैं।',
    'legal.privacy.share.title': '4. हम जानकारी कैसे साझा करते हैं',
    'legal.privacy.share.p1': 'हम आपकी व्यक्तिगत जानकारी केवल बेचने के उद्देश्य से नहीं बेचते।',
    'legal.privacy.share.p2':
      'जहाँ आवश्यक हो और लागू कानून द्वारा अनुमत हो, हम विश्वसनीय सेवा प्रदाताओं, भुगतान प्रदाताओं, पहचान सत्यापन प्रदाताओं, तकनीकी भागीदारों, पेशेवर सलाहकारों, नियामकों, कानून प्रवर्तन एजेंसियों या अन्य पक्षों के साथ जानकारी साझा कर सकते हैं।',
    'legal.privacy.protect.title': '5. आपकी जानकारी की सुरक्षा',
    'legal.privacy.protect.p1':
      'हम आपकी जानकारी को अनधिकृत पहुँच, हानि, दुरुपयोग, परिवर्तन या प्रकटीकरण से बचाने के लिए बनाए गए उचित तकनीकी, संगठनात्मक और सुरक्षा उपायों का उपयोग करते हैं।',
    'legal.privacy.protect.p2':
      'हालाँकि, किसी भी ऑनलाइन सिस्टम के पूरी तरह सुरक्षित होने की गारंटी नहीं दी जा सकती।',
    'legal.privacy.retention.title': '6. डेटा प्रतिधारण',
    'legal.privacy.retention.p1':
      'हम व्यक्तिगत जानकारी केवल तब तक रखते हैं जब तक इस गोपनीयता नीति में बताए गए उद्देश्यों के लिए उचित रूप से आवश्यक हो, जिसमें सेवाएँ प्रदान करना, कानूनी दायित्वों को पूरा करना, विवादों का समाधान करना, धोखाधड़ी रोकना और हमारे समझौतों को लागू करना शामिल है।',
    'legal.privacy.retention.p2':
      'प्रतिधारण अवधि जानकारी के प्रकार और लागू कानूनी आवश्यकताओं के आधार पर अलग-अलग हो सकती है।',
    'legal.privacy.rights.title': '7. आपके गोपनीयता अधिकार',
    'legal.privacy.rights.p1':
      'आप कहाँ रहते हैं, इसके आधार पर आपकी व्यक्तिगत जानकारी से जुड़े आपके कुछ अधिकार हो सकते हैं, जिनमें निम्न अधिकार शामिल हैं:',
    'legal.privacy.rights.i1': 'अपनी जानकारी तक पहुँच का अनुरोध करना',
    'legal.privacy.rights.i2': 'गलत जानकारी में सुधार का अनुरोध करना',
    'legal.privacy.rights.i3': 'जहाँ कानूनी रूप से उपलब्ध हो, वहाँ हटाने का अनुरोध करना',
    'legal.privacy.rights.i4': 'कुछ प्रोसेसिंग पर आपत्ति करना या उसे प्रतिबंधित करना',
    'legal.privacy.rights.i5': 'जहाँ प्रोसेसिंग सहमति पर आधारित हो, वहाँ सहमति वापस लेना',
    'legal.privacy.rights.i6': 'कुछ जानकारी की प्रति का अनुरोध करना',
    'legal.privacy.rights.p2': 'कुछ अधिकार कानूनी या नियामक सीमाओं के अधीन हो सकते हैं।',
    'legal.privacy.children.title': '8. बच्चों की गोपनीयता',
    'legal.privacy.children.p1':
      'Rolluck केवल उन व्यक्तियों के लिए है जो हमारी सेवाओं के लिए लागू न्यूनतम कानूनी आयु को पूरा करते हैं।',
    'legal.privacy.children.p2':
      'हम जानबूझकर ऐसे व्यक्तियों को खाते बनाने या रखने की अनुमति नहीं देते जो हमारी सेवाओं का उपयोग करने के लिए कानूनी रूप से पात्र नहीं हैं।',
    'legal.privacy.transfers.title': '9. अंतर्राष्ट्रीय डेटा स्थानांतरण',
    'legal.privacy.transfers.p1':
      'आपकी जानकारी को आपके निवास स्थान के बाहर के देशों में प्रोसेस या संग्रहीत किया जा सकता है।',
    'legal.privacy.transfers.p2':
      'जहाँ आवश्यक हो, Rolluck यह सुनिश्चित करने के लिए उचित कदम उठाएगा कि अंतर्राष्ट्रीय डेटा स्थानांतरण के लिए लागू कानूनी आवश्यकताओं का पालन किया जाए।',
    'legal.privacy.thirdParty.title': '10. तृतीय-पक्ष सेवाएँ',
    'legal.privacy.thirdParty.p1':
      'Rolluck ऐसी तृतीय-पक्ष सेवाओं के साथ काम कर सकता है जो भुगतान, पहचान सत्यापन, सुरक्षा, एनालिटिक्स, संचार और अन्य कार्यक्षमता प्रदान करने में हमारी मदद करती हैं।',
    'legal.privacy.thirdParty.p2':
      'ये प्रदाता अपनी गोपनीयता नीतियों और लागू समझौतों के अनुसार जानकारी को प्रोसेस कर सकते हैं।',
    'legal.privacy.changes.title': '11. इस गोपनीयता नीति में बदलाव',
    'legal.privacy.changes.p1':
      'हम अपनी सेवाओं, तकनीक या कानूनी आवश्यकताओं में बदलाव को दर्शाने के लिए समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं।',
    'legal.privacy.changes.p2':
      'नवीनतम संस्करण में अपडेट की गई तारीख हमेशा इस पेज के शीर्ष पर दिखाई देगी।',
    'legal.privacy.contact.title': '12. हमसे संपर्क करें',
    'legal.privacy.contact.p1':
      'यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं या आप किसी लागू गोपनीयता अधिकार का उपयोग करना चाहते हैं, तो कृपया हमारे आधिकारिक सहायता चैनलों के माध्यम से Rolluck से संपर्क करें।',
    'legal.privacy.signOff1': 'आपकी गोपनीयता मायने रखती है।',
    'legal.privacy.signOff2': 'आपका भरोसा मायने रखता है।',
    'legal.privacy.signOff3': 'Rolluck में, हम दोनों को गंभीरता से लेते हैं।',
  },
  fr: {
    'legal.updated': 'Dernière mise à jour : {date}',
    'legal.page.title': 'Conditions générales',
    'legal.page.metaDescription':
      'Les conditions qui s’appliquent lorsque vous utilisez Rolluck, et la Politique de confidentialité qui explique quelles informations nous collectons et comment nous les protégeons.',
    'legal.doc.eyebrow': 'Mentions légales',
    'legal.doc.lastUpdated': 'Dernière mise à jour le {date}',
    'legal.doc.contents': 'Sommaire',
    'legal.doc.onThisPage': 'Sur cette page',

    'legal.terms.intro':
      'Bienvenue sur Rolluck. En créant un compte ou en utilisant notre site, nos jeux, nos promotions et nos services, vous acceptez les présentes Conditions générales.',
    'legal.terms.about.title': '1. À propos de Rolluck',
    'legal.terms.about.p1':
      'Rolluck propose des services de jeux et de divertissement en ligne via son site web et ses plateformes associées. Les présentes Conditions expliquent les règles qui s’appliquent lorsque vous utilisez nos services.',
    'legal.terms.eligibility.title': '2. Conditions d’admissibilité',
    'legal.terms.eligibility.p1':
      'Pour utiliser Rolluck, vous devez avoir atteint l’âge légal minimum et remplir toutes les autres conditions d’admissibilité applicables là où vous vous trouvez.',
    'legal.terms.eligibility.p2':
      'Il vous incombe de vous assurer que les jeux en ligne sont légalement autorisés dans votre juridiction.',
    'legal.terms.eligibility.p3':
      'Rolluck se réserve le droit de vérifier votre âge, votre identité et votre admissibilité à tout moment.',
    'legal.terms.account.title': '3. Votre compte',
    'legal.terms.account.p1':
      'Il vous incombe de fournir des informations exactes et à jour lors de la création de votre compte.',
    'legal.terms.account.p2':
      'Vous devez garder vos identifiants de connexion confidentiels et ne devez pas permettre à une autre personne d’utiliser votre compte.',
    'legal.terms.account.p3':
      'Une même personne ne peut détenir des comptes que dans la mesure autorisée par Rolluck.',
    'legal.terms.account.p4':
      'Si nous détectons une activité suspecte, frauduleuse ou non autorisée, nous pouvons restreindre, suspendre ou fermer un compte.',
    'legal.terms.deposits.title': '4. Dépôts et retraits',
    'legal.terms.deposits.p1':
      'Tous les dépôts doivent provenir d’un moyen de paiement que vous êtes autorisé à utiliser.',
    'legal.terms.deposits.p2':
      'Il vous incombe de vérifier votre solde et les informations relatives à vos transactions.',
    'legal.terms.deposits.p3':
      'Les retraits peuvent nécessiter une vérification d’identité et des contrôles supplémentaires avant d’être traités.',
    'legal.terms.deposits.p4':
      'Les délais de traitement peuvent varier selon le moyen de paiement et les exigences de vérification.',
    'legal.terms.games.title': '5. Jeux et résultats',
    'legal.terms.games.p1': 'Tous les jeux sont soumis à leurs propres règles et conditions.',
    'legal.terms.games.p2':
      'Les résultats des jeux sont déterminés par les systèmes de jeu et les technologies applicables utilisés par Rolluck.',
    'legal.terms.games.p3':
      'En cas de problème technique, d’erreur système ou de dysfonctionnement, Rolluck peut prendre les mesures appropriées, y compris l’annulation des transactions ou des parties concernées lorsque la loi applicable le permet.',
    'legal.terms.bonuses.title': '6. Bonus et promotions',
    'legal.terms.bonuses.p1':
      'Les promotions, bonus, récompenses et campagnes peuvent être soumis à leurs propres conditions spécifiques.',
    'legal.terms.bonuses.p2':
      'Vous devez lire et comprendre les conditions promotionnelles applicables avant de participer.',
    'legal.terms.bonuses.p3':
      'Rolluck se réserve le droit d’annuler, de modifier ou de retirer une promotion lorsque la loi applicable le permet.',
    'legal.terms.rg.title': '7. Jeu responsable',
    'legal.terms.rg.p1': 'Nous voulons que le jeu reste un divertissement.',
    'legal.terms.rg.p2':
      'Fixez-vous des limites, gardez un œil sur vos dépenses et ne jouez qu’avec de l’argent que vous pouvez vous permettre de perdre.',
    'legal.terms.rg.p3':
      'Si le jeu cesse d’être un divertissement, faites une pause et utilisez les outils de jeu responsable disponibles sur Rolluck.',
    'legal.terms.prohibited.title': '8. Activités interdites',
    'legal.terms.prohibited.p1':
      'Vous ne devez pas utiliser Rolluck à des fins de fraude, de blanchiment d’argent, de transactions non autorisées, de triche, de manipulation ou de toute autre activité illégale.',
    'legal.terms.prohibited.p2':
      'Vous ne devez pas tenter de perturber notre site, nos jeux, nos systèmes ou nos mesures de sécurité.',
    'legal.terms.suspension.title': '9. Suspension et fermeture du compte',
    'legal.terms.suspension.p1':
      'Rolluck peut suspendre ou fermer un compte en cas de manquement aux présentes Conditions, de soupçon de fraude, de problèmes de sécurité, d’obligations légales ou pour d’autres motifs légitimes.',
    'legal.terms.suspension.p2':
      'Lorsque la loi l’exige, les soldes concernés seront traités conformément aux procédures applicables.',
    'legal.terms.ip.title': '10. Propriété intellectuelle',
    'legal.terms.ip.p1':
      'L’ensemble des marques, designs, graphismes, contenus, logiciels et autres éléments de Rolluck appartiennent à Rolluck ou à ses concédants de licence respectifs.',
    'legal.terms.ip.p2':
      'Vous ne pouvez pas copier, reproduire, modifier, distribuer ou exploiter commercialement notre contenu sans autorisation.',
    'legal.terms.availability.title': '11. Disponibilité',
    'legal.terms.availability.p1':
      'Nous nous efforçons de maintenir Rolluck disponible et fiable, mais nous ne pouvons pas garantir un accès ininterrompu.',
    'legal.terms.availability.p2':
      'La maintenance, des problèmes techniques, des services tiers ou des circonstances échappant à notre contrôle raisonnable peuvent affecter la disponibilité.',
    'legal.terms.changes.title': '12. Modifications des présentes Conditions',
    'legal.terms.changes.p1':
      'Nous pouvons mettre à jour les présentes Conditions de temps à autre.',
    'legal.terms.changes.p2':
      'En cas de modification, nous mettrons à jour la date indiquée en haut de cette page. Si vous continuez à utiliser Rolluck après l’entrée en vigueur des modifications, vous acceptez les Conditions mises à jour, dans la mesure permise par la loi.',
    'legal.terms.contact.title': '13. Nous contacter',
    'legal.terms.contact.p1':
      'Si vous avez des questions concernant les présentes Conditions, votre compte ou nos services, veuillez contacter le Support Rolluck via les canaux d’assistance disponibles.',
    'legal.terms.signOff': 'Rolluck — Jouez en toute confiance. Jouez de manière responsable.',

    'legal.privacy.intro':
      'Chez Rolluck, nous savons que vos informations personnelles comptent. La présente Politique de confidentialité explique quelles informations nous collectons, pourquoi nous les collectons, comment nous les utilisons et comment nous veillons à les protéger.',
    'legal.privacy.collect.title': '1. Informations que nous collectons',
    'legal.privacy.collect.p1':
      'Selon la manière dont vous utilisez Rolluck, nous pouvons collecter des informations telles que :',
    'legal.privacy.collect.i1': 'Nom et coordonnées',
    'legal.privacy.collect.i2': 'Date de naissance et informations de vérification de l’âge',
    'legal.privacy.collect.i3': 'Informations de compte et de connexion',
    'legal.privacy.collect.i4': 'Informations de vérification d’identité',
    'legal.privacy.collect.i5': 'Informations de paiement et de transaction',
    'legal.privacy.collect.i6': 'Activité de jeu et activité du compte',
    'legal.privacy.collect.i7': 'Informations techniques et relatives à l’appareil',
    'legal.privacy.collect.i8': 'Adresse IP et informations de localisation approximative',
    'legal.privacy.collect.i9': 'Échanges avec notre équipe d’assistance client',
    'legal.privacy.collect.i10':
      'Informations nécessaires au respect de nos obligations légales et réglementaires',
    'legal.privacy.use.title': '2. Comment nous utilisons vos informations',
    'legal.privacy.use.p1': 'Nous pouvons utiliser vos informations pour :',
    'legal.privacy.use.i1': 'Créer et gérer votre compte Rolluck',
    'legal.privacy.use.i2': 'Fournir nos services de jeu et services associés',
    'legal.privacy.use.i3': 'Traiter les dépôts et les retraits',
    'legal.privacy.use.i4': 'Vérifier votre identité et votre admissibilité',
    'legal.privacy.use.i5': 'Prévenir la fraude, les abus et les activités non autorisées',
    'legal.privacy.use.i6': 'Protéger la sécurité de notre plateforme',
    'legal.privacy.use.i7': 'Fournir une assistance client',
    'legal.privacy.use.i8': 'Améliorer nos jeux, nos services et l’expérience utilisateur',
    'legal.privacy.use.i9': 'Respecter les exigences légales et réglementaires',
    'legal.privacy.use.i10': 'Envoyer des communications liées au service',
    'legal.privacy.use.i11':
      'Envoyer des communications promotionnelles lorsque cela est autorisé et lorsque vous disposez du choix approprié ou avez donné votre consentement',
    'legal.privacy.cookies.title': '3. Cookies et technologies similaires',
    'legal.privacy.cookies.p1':
      'Rolluck peut utiliser des cookies et des technologies similaires pour mémoriser vos préférences, comprendre comment notre site est utilisé, améliorer ses performances et renforcer la sécurité.',
    'legal.privacy.cookies.p2':
      'Vous pouvez gérer certaines préférences en matière de cookies via votre navigateur ou nos paramètres de confidentialité disponibles.',
    'legal.privacy.share.title': '4. Comment nous partageons les informations',
    'legal.privacy.share.p1':
      'Nous ne vendons pas vos informations personnelles dans le simple but de les vendre.',
    'legal.privacy.share.p2':
      'Nous pouvons partager des informations avec des prestataires de services de confiance, des prestataires de paiement, des prestataires de vérification d’identité, des partenaires technologiques, des conseillers professionnels, des autorités de régulation, les forces de l’ordre ou d’autres parties lorsque cela est nécessaire et autorisé par la loi applicable.',
    'legal.privacy.protect.title': '5. Protection de vos informations',
    'legal.privacy.protect.p1':
      'Nous mettons en œuvre des mesures techniques, organisationnelles et de sécurité raisonnables, conçues pour protéger vos informations contre tout accès non autorisé, perte, utilisation abusive, altération ou divulgation.',
    'legal.privacy.protect.p2':
      'Toutefois, aucun système en ligne ne peut être garanti comme totalement sécurisé.',
    'legal.privacy.retention.title': '6. Conservation des données',
    'legal.privacy.retention.p1':
      'Nous conservons les informations personnelles uniquement pendant la durée raisonnablement nécessaire aux finalités décrites dans la présente Politique de confidentialité, notamment pour fournir nos services, respecter nos obligations légales, résoudre les litiges, prévenir la fraude et faire appliquer nos accords.',
    'legal.privacy.retention.p2':
      'Les durées de conservation peuvent varier selon le type d’information et les exigences légales applicables.',
    'legal.privacy.rights.title': '7. Vos droits en matière de confidentialité',
    'legal.privacy.rights.p1':
      'Selon votre lieu de résidence, vous pouvez disposer de droits relatifs à vos informations personnelles, notamment le droit de :',
    'legal.privacy.rights.i1': 'Demander l’accès à vos informations',
    'legal.privacy.rights.i2': 'Demander la rectification d’informations inexactes',
    'legal.privacy.rights.i3': 'Demander la suppression lorsque la loi le permet',
    'legal.privacy.rights.i4': 'Vous opposer à certains traitements ou les limiter',
    'legal.privacy.rights.i5':
      'Retirer votre consentement lorsque le traitement repose sur le consentement',
    'legal.privacy.rights.i6': 'Demander une copie de certaines informations',
    'legal.privacy.rights.p2':
      'Certains droits peuvent être soumis à des limitations légales ou réglementaires.',
    'legal.privacy.children.title': '8. Protection de la vie privée des mineurs',
    'legal.privacy.children.p1':
      'Rolluck est destiné uniquement aux personnes ayant atteint l’âge légal minimum applicable à nos services.',
    'legal.privacy.children.p2':
      'Nous ne permettons pas sciemment aux personnes qui ne sont pas légalement autorisées à utiliser nos services de créer ou de conserver un compte.',
    'legal.privacy.transfers.title': '9. Transferts internationaux de données',
    'legal.privacy.transfers.p1':
      'Vos informations peuvent être traitées ou stockées dans des pays situés en dehors de votre lieu de résidence.',
    'legal.privacy.transfers.p2':
      'Lorsque cela est requis, Rolluck prendra les mesures appropriées pour garantir le respect des exigences légales applicables aux transferts internationaux de données.',
    'legal.privacy.thirdParty.title': '10. Services tiers',
    'legal.privacy.thirdParty.p1':
      'Rolluck peut faire appel à des services tiers qui nous aident à assurer les paiements, la vérification d’identité, la sécurité, l’analyse, les communications et d’autres fonctionnalités.',
    'legal.privacy.thirdParty.p2':
      'Ces prestataires peuvent traiter les informations conformément à leurs propres politiques de confidentialité et aux accords applicables.',
    'legal.privacy.changes.title': '11. Modifications de la présente Politique de confidentialité',
    'legal.privacy.changes.p1':
      'Nous pouvons mettre à jour la présente Politique de confidentialité de temps à autre afin de refléter les évolutions de nos services, de notre technologie ou des exigences légales.',
    'legal.privacy.changes.p2':
      'La dernière version affichera toujours la date de mise à jour en haut de cette page.',
    'legal.privacy.contact.title': '12. Nous contacter',
    'legal.privacy.contact.p1':
      'Si vous avez des questions concernant la présente Politique de confidentialité ou souhaitez exercer un droit applicable en matière de confidentialité, veuillez contacter Rolluck via nos canaux d’assistance officiels.',
    'legal.privacy.signOff1': 'Votre vie privée compte.',
    'legal.privacy.signOff2': 'Votre confiance compte.',
    'legal.privacy.signOff3': 'Chez Rolluck, nous prenons les deux très au sérieux.',
  },
  ru: {
    'legal.updated': 'Последнее обновление: {date}',
    'legal.page.title': 'Правила и условия',
    'legal.page.metaDescription':
      'Условия, действующие при использовании Rolluck, и Политика конфиденциальности, в которой объясняется, какую информацию мы собираем и как её защищаем.',
    'legal.doc.eyebrow': 'Правовая информация',
    'legal.doc.lastUpdated': 'Последнее обновление: {date}',
    'legal.doc.contents': 'Содержание',
    'legal.doc.onThisPage': 'На этой странице',

    'legal.terms.intro':
      'Добро пожаловать в Rolluck. Создавая учётную запись или пользуясь нашим сайтом, играми, акциями и услугами, вы соглашаетесь с настоящими Правилами и условиями.',
    'legal.terms.about.title': '1. О Rolluck',
    'legal.terms.about.p1':
      'Rolluck предоставляет услуги онлайн-игр и развлечений через свой сайт и связанные с ним платформы. Настоящие Условия описывают правила, которые действуют при использовании наших услуг.',
    'legal.terms.eligibility.title': '2. Право на участие',
    'legal.terms.eligibility.p1':
      'Чтобы пользоваться Rolluck, вы должны достичь минимального установленного законом возраста и соответствовать всем прочим требованиям, действующим в месте вашего нахождения.',
    'legal.terms.eligibility.p2':
      'Вы несёте ответственность за то, чтобы онлайн-игры были законно разрешены в вашей юрисдикции.',
    'legal.terms.eligibility.p3':
      'Rolluck оставляет за собой право в любое время проверить ваш возраст, личность и право на участие.',
    'legal.terms.account.title': '3. Ваша учётная запись',
    'legal.terms.account.p1':
      'Вы несёте ответственность за предоставление точной и актуальной информации при создании учётной записи.',
    'legal.terms.account.p2':
      'Вы обязаны сохранять данные для входа в тайне и не должны позволять другим лицам пользоваться вашей учётной записью.',
    'legal.terms.account.p3':
      'Одно лицо может иметь учётные записи только в пределах, разрешённых Rolluck.',
    'legal.terms.account.p4':
      'Если мы обнаружим подозрительную, мошенническую или несанкционированную активность, мы можем ограничить, приостановить или закрыть учётную запись.',
    'legal.terms.deposits.title': '4. Пополнения и выводы',
    'legal.terms.deposits.p1':
      'Все пополнения должны производиться с помощью платёжного средства, которым вы вправе пользоваться.',
    'legal.terms.deposits.p2':
      'Вы несёте ответственность за проверку своего баланса и информации о транзакциях.',
    'legal.terms.deposits.p3':
      'Перед обработкой вывода средств может потребоваться подтверждение личности и дополнительные проверки.',
    'legal.terms.deposits.p4':
      'Сроки обработки могут различаться в зависимости от платёжного метода и требований к проверке.',
    'legal.terms.games.title': '5. Игры и результаты',
    'legal.terms.games.p1': 'На каждую игру распространяются её собственные правила и условия.',
    'legal.terms.games.p2':
      'Результаты игр определяются соответствующими игровыми системами и технологиями, которые использует Rolluck.',
    'legal.terms.games.p3':
      'В случае технической неполадки, системной ошибки или сбоя Rolluck может принять надлежащие меры, включая аннулирование затронутых транзакций или игр, если это допускается применимым законодательством.',
    'legal.terms.bonuses.title': '6. Бонусы и акции',
    'legal.terms.bonuses.p1':
      'Акции, бонусы, награды и кампании могут иметь собственные особые условия.',
    'legal.terms.bonuses.p2':
      'Перед участием вы должны ознакомиться с применимыми условиями акции и понять их.',
    'legal.terms.bonuses.p3':
      'Rolluck оставляет за собой право отменить, изменить или отозвать акцию, если это допускается применимым законодательством.',
    'legal.terms.rg.title': '7. Ответственная игра',
    'legal.terms.rg.p1': 'Мы хотим, чтобы игра оставалась развлечением.',
    'legal.terms.rg.p2':
      'Устанавливайте лимиты, следите за своими расходами и играйте только на те деньги, потерю которых можете себе позволить.',
    'legal.terms.rg.p3':
      'Если игра перестала приносить удовольствие, сделайте перерыв и воспользуйтесь инструментами ответственной игры, доступными в Rolluck.',
    'legal.terms.prohibited.title': '8. Запрещённые действия',
    'legal.terms.prohibited.p1':
      'Запрещается использовать Rolluck для мошенничества, отмывания денег, несанкционированных транзакций, жульничества, манипуляций или любой другой незаконной деятельности.',
    'legal.terms.prohibited.p2':
      'Запрещается пытаться вмешиваться в работу нашего сайта, игр, систем или средств защиты.',
    'legal.terms.suspension.title': '9. Приостановка и закрытие учётной записи',
    'legal.terms.suspension.p1':
      'Rolluck может приостановить или закрыть учётную запись в случае нарушения настоящих Условий, подозрения в мошенничестве, угроз безопасности, требований законодательства или по иным законным основаниям.',
    'legal.terms.suspension.p2':
      'Если этого требует закон, соответствующие остатки средств будут обработаны в соответствии с установленными процедурами.',
    'legal.terms.ip.title': '10. Интеллектуальная собственность',
    'legal.terms.ip.p1':
      'Все товарные знаки, дизайн, графика, контент, программное обеспечение и иные материалы Rolluck принадлежат Rolluck или соответствующим лицензиарам.',
    'legal.terms.ip.p2':
      'Вы не вправе копировать, воспроизводить, изменять, распространять или использовать наш контент в коммерческих целях без разрешения.',
    'legal.terms.availability.title': '11. Доступность',
    'legal.terms.availability.p1':
      'Мы стремимся обеспечивать доступность и надёжность Rolluck, но не можем гарантировать бесперебойный доступ.',
    'legal.terms.availability.p2':
      'На доступность могут повлиять техническое обслуживание, технические неполадки, сторонние сервисы или обстоятельства, находящиеся вне нашего разумного контроля.',
    'legal.terms.changes.title': '12. Изменения настоящих Условий',
    'legal.terms.changes.p1': 'Мы можем время от времени обновлять настоящие Условия.',
    'legal.terms.changes.p2':
      'При внесении изменений мы обновим дату, указанную в верхней части этой страницы. Продолжение использования Rolluck после вступления изменений в силу означает, что вы принимаете обновлённые Условия, если это допускается законом.',
    'legal.terms.contact.title': '13. Связаться с нами',
    'legal.terms.contact.p1':
      'Если у вас есть вопросы о настоящих Условиях, вашей учётной записи или наших услугах, обратитесь в службу поддержки Rolluck по доступным каналам связи.',
    'legal.terms.signOff': 'Rolluck — играйте уверенно. Играйте ответственно.',

    'legal.privacy.intro':
      'В Rolluck мы понимаем, насколько важна ваша личная информация. Настоящая Политика конфиденциальности объясняет, какую информацию мы собираем, зачем, как её используем и как обеспечиваем её защиту.',
    'legal.privacy.collect.title': '1. Какую информацию мы собираем',
    'legal.privacy.collect.p1':
      'В зависимости от того, как вы пользуетесь Rolluck, мы можем собирать такую информацию, как:',
    'legal.privacy.collect.i1': 'Имя и контактные данные',
    'legal.privacy.collect.i2': 'Дата рождения и данные для подтверждения возраста',
    'legal.privacy.collect.i3': 'Данные учётной записи и входа',
    'legal.privacy.collect.i4': 'Данные для подтверждения личности',
    'legal.privacy.collect.i5': 'Платёжные данные и сведения о транзакциях',
    'legal.privacy.collect.i6': 'Игровая активность и активность учётной записи',
    'legal.privacy.collect.i7': 'Сведения об устройстве и технические данные',
    'legal.privacy.collect.i8': 'IP-адрес и сведения о приблизительном местоположении',
    'legal.privacy.collect.i9': 'Переписка с нашей службой поддержки клиентов',
    'legal.privacy.collect.i10':
      'Информация, необходимая для выполнения правовых и регуляторных обязательств',
    'legal.privacy.use.title': '2. Как мы используем вашу информацию',
    'legal.privacy.use.p1': 'Мы можем использовать вашу информацию, чтобы:',
    'legal.privacy.use.i1': 'Создавать вашу учётную запись Rolluck и управлять ею',
    'legal.privacy.use.i2': 'Предоставлять наши игровые и связанные с ними услуги',
    'legal.privacy.use.i3': 'Обрабатывать пополнения и выводы средств',
    'legal.privacy.use.i4': 'Подтверждать вашу личность и право на участие',
    'legal.privacy.use.i5':
      'Предотвращать мошенничество, злоупотребления и несанкционированную активность',
    'legal.privacy.use.i6': 'Обеспечивать безопасность нашей платформы',
    'legal.privacy.use.i7': 'Оказывать поддержку клиентам',
    'legal.privacy.use.i8': 'Улучшать наши игры, услуги и пользовательский опыт',
    'legal.privacy.use.i9': 'Соблюдать правовые и регуляторные требования',
    'legal.privacy.use.i10': 'Отправлять сообщения, связанные с обслуживанием',
    'legal.privacy.use.i11':
      'Отправлять рекламные сообщения, если это разрешено и если у вас есть соответствующий выбор или вы дали согласие',
    'legal.privacy.cookies.title': '3. Файлы cookie и аналогичные технологии',
    'legal.privacy.cookies.p1':
      'Rolluck может использовать файлы cookie и аналогичные технологии, чтобы запоминать настройки, понимать, как используется наш сайт, повышать производительность и поддерживать безопасность.',
    'legal.privacy.cookies.p2':
      'Некоторыми настройками файлов cookie можно управлять через браузер или доступные у нас настройки конфиденциальности.',
    'legal.privacy.share.title': '4. Как мы передаём информацию',
    'legal.privacy.share.p1': 'Мы не продаём вашу личную информацию исключительно ради её продажи.',
    'legal.privacy.share.p2':
      'Мы можем передавать информацию доверенным поставщикам услуг, платёжным провайдерам, провайдерам проверки личности, технологическим партнёрам, профессиональным консультантам, регулирующим органам, правоохранительным органам или иным сторонам, если это необходимо и допускается применимым законодательством.',
    'legal.privacy.protect.title': '5. Защита вашей информации',
    'legal.privacy.protect.p1':
      'Мы применяем разумные технические, организационные меры и меры безопасности, предназначенные для защиты вашей информации от несанкционированного доступа, утраты, неправомерного использования, изменения или раскрытия.',
    'legal.privacy.protect.p2':
      'Тем не менее ни одна онлайн-система не может гарантировать полную безопасность.',
    'legal.privacy.retention.title': '6. Хранение данных',
    'legal.privacy.retention.p1':
      'Мы храним личную информацию только в течение срока, разумно необходимого для целей, описанных в настоящей Политике конфиденциальности, включая предоставление услуг, выполнение правовых обязательств, разрешение споров, предотвращение мошенничества и обеспечение соблюдения наших соглашений.',
    'legal.privacy.retention.p2':
      'Сроки хранения могут различаться в зависимости от типа информации и применимых правовых требований.',
    'legal.privacy.rights.title': '7. Ваши права в отношении конфиденциальности',
    'legal.privacy.rights.p1':
      'В зависимости от места вашего проживания у вас могут быть права в отношении вашей личной информации, включая право:',
    'legal.privacy.rights.i1': 'Запросить доступ к своей информации',
    'legal.privacy.rights.i2': 'Запросить исправление неточной информации',
    'legal.privacy.rights.i3': 'Запросить удаление, если это допускается законом',
    'legal.privacy.rights.i4': 'Возразить против определённой обработки или ограничить её',
    'legal.privacy.rights.i5': 'Отозвать согласие, если обработка основана на согласии',
    'legal.privacy.rights.i6': 'Запросить копию определённой информации',
    'legal.privacy.rights.p2':
      'Некоторые права могут быть ограничены правовыми или регуляторными нормами.',
    'legal.privacy.children.title': '8. Конфиденциальность детей',
    'legal.privacy.children.p1':
      'Rolluck предназначен только для лиц, достигших минимального установленного законом возраста для пользования нашими услугами.',
    'legal.privacy.children.p2':
      'Мы сознательно не позволяем лицам, которые по закону не имеют права пользоваться нашими услугами, создавать или сохранять учётные записи.',
    'legal.privacy.transfers.title': '9. Международная передача данных',
    'legal.privacy.transfers.p1':
      'Ваша информация может обрабатываться или храниться в странах за пределами страны вашего проживания.',
    'legal.privacy.transfers.p2':
      'При необходимости Rolluck примет надлежащие меры для соблюдения применимых правовых требований к международной передаче данных.',
    'legal.privacy.thirdParty.title': '10. Сторонние сервисы',
    'legal.privacy.thirdParty.p1':
      'Rolluck может сотрудничать со сторонними сервисами, которые помогают нам обеспечивать платежи, проверку личности, безопасность, аналитику, коммуникации и другие функции.',
    'legal.privacy.thirdParty.p2':
      'Эти поставщики могут обрабатывать информацию в соответствии со своими политиками конфиденциальности и применимыми соглашениями.',
    'legal.privacy.changes.title': '11. Изменения настоящей Политики конфиденциальности',
    'legal.privacy.changes.p1':
      'Мы можем время от времени обновлять настоящую Политику конфиденциальности, чтобы отразить изменения в наших услугах, технологиях или правовых требованиях.',
    'legal.privacy.changes.p2':
      'В актуальной версии дата обновления всегда будет указана в верхней части этой страницы.',
    'legal.privacy.contact.title': '12. Связаться с нами',
    'legal.privacy.contact.p1':
      'Если у вас есть вопросы о настоящей Политике конфиденциальности или вы хотите воспользоваться применимым правом в отношении конфиденциальности, свяжитесь с Rolluck по нашим официальным каналам поддержки.',
    'legal.privacy.signOff1': 'Ваша конфиденциальность важна.',
    'legal.privacy.signOff2': 'Ваше доверие важно.',
    'legal.privacy.signOff3': 'В Rolluck мы серьёзно относимся и к тому, и к другому.',
  },
  pt: {
    'legal.updated': 'Última atualização: {date}',
    'legal.page.title': 'Termos e condições',
    'legal.page.metaDescription':
      'Os termos que se aplicam quando você usa a Rolluck e a Política de Privacidade que explica quais informações coletamos e como as protegemos.',
    'legal.doc.eyebrow': 'Jurídico',
    'legal.doc.lastUpdated': 'Última atualização em {date}',
    'legal.doc.contents': 'Índice',
    'legal.doc.onThisPage': 'Nesta página',

    'legal.terms.intro':
      'Bem-vindo à Rolluck. Ao criar uma conta ou usar nosso site, jogos, promoções e serviços, você concorda com estes Termos e Condições.',
    'legal.terms.about.title': '1. Sobre a Rolluck',
    'legal.terms.about.p1':
      'A Rolluck oferece serviços de jogos e entretenimento online por meio do seu site e de plataformas relacionadas. Estes Termos explicam as regras que se aplicam quando você usa nossos serviços.',
    'legal.terms.eligibility.title': '2. Elegibilidade',
    'legal.terms.eligibility.p1':
      'Para usar a Rolluck, você deve ter a idade legal mínima e cumprir todos os demais requisitos de elegibilidade aplicáveis no local onde se encontra.',
    'legal.terms.eligibility.p2':
      'É sua responsabilidade garantir que os jogos online sejam legalmente permitidos na sua jurisdição.',
    'legal.terms.eligibility.p3':
      'A Rolluck reserva-se o direito de verificar sua idade, identidade e elegibilidade a qualquer momento.',
    'legal.terms.account.title': '3. Sua conta',
    'legal.terms.account.p1':
      'Você é responsável por fornecer informações precisas e atualizadas ao criar sua conta.',
    'legal.terms.account.p2':
      'Você deve manter seus dados de acesso em sigilo e não pode permitir que outra pessoa use sua conta.',
    'legal.terms.account.p3': 'Cada pessoa só pode manter contas na forma permitida pela Rolluck.',
    'legal.terms.account.p4':
      'Se identificarmos atividade suspeita, fraudulenta ou não autorizada, poderemos restringir, suspender ou encerrar uma conta.',
    'legal.terms.deposits.title': '4. Depósitos e saques',
    'legal.terms.deposits.p1':
      'Todos os depósitos devem ser feitos a partir de um método de pagamento que você esteja autorizado a usar.',
    'legal.terms.deposits.p2':
      'Você é responsável por verificar seu saldo e as informações das suas transações.',
    'legal.terms.deposits.p3':
      'Os saques podem exigir verificação de identidade e verificações adicionais antes de serem processados.',
    'legal.terms.deposits.p4':
      'Os prazos de processamento podem variar de acordo com o método de pagamento e os requisitos de verificação.',
    'legal.terms.games.title': '5. Jogos e resultados',
    'legal.terms.games.p1': 'Todos os jogos estão sujeitos às suas próprias regras e condições.',
    'legal.terms.games.p2':
      'Os resultados dos jogos são determinados pelos sistemas de jogo e tecnologias aplicáveis utilizados pela Rolluck.',
    'legal.terms.games.p3':
      'Em caso de problema técnico, erro de sistema ou mau funcionamento, a Rolluck poderá tomar as medidas adequadas, incluindo a anulação das transações ou jogos afetados, quando permitido pela legislação aplicável.',
    'legal.terms.bonuses.title': '6. Bônus e promoções',
    'legal.terms.bonuses.p1':
      'Promoções, bônus, recompensas e campanhas podem ter seus próprios termos específicos.',
    'legal.terms.bonuses.p2':
      'Você deve ler e compreender as condições promocionais aplicáveis antes de participar.',
    'legal.terms.bonuses.p3':
      'A Rolluck reserva-se o direito de cancelar, modificar ou retirar uma promoção quando permitido pela legislação aplicável.',
    'legal.terms.rg.title': '7. Jogo responsável',
    'legal.terms.rg.p1': 'Queremos que o jogo continue sendo entretenimento.',
    'legal.terms.rg.p2':
      'Defina limites, tenha consciência dos seus gastos e jogue apenas com dinheiro que você pode se dar ao luxo de perder.',
    'legal.terms.rg.p3':
      'Se o jogo deixar de parecer entretenimento, faça uma pausa e use as ferramentas de jogo responsável disponíveis na Rolluck.',
    'legal.terms.prohibited.title': '8. Atividades proibidas',
    'legal.terms.prohibited.p1':
      'Você não deve usar a Rolluck para fraude, lavagem de dinheiro, transações não autorizadas, trapaça, manipulação ou qualquer outra atividade ilegal.',
    'legal.terms.prohibited.p2':
      'Você não deve tentar interferir em nosso site, jogos, sistemas ou medidas de segurança.',
    'legal.terms.suspension.title': '9. Suspensão e encerramento de conta',
    'legal.terms.suspension.p1':
      'A Rolluck pode suspender ou encerrar uma conta em caso de violação destes Termos, suspeita de fraude, preocupações de segurança, exigências legais ou outros motivos legítimos.',
    'legal.terms.suspension.p2':
      'Quando exigido por lei, os saldos aplicáveis serão tratados de acordo com os procedimentos pertinentes.',
    'legal.terms.ip.title': '10. Propriedade intelectual',
    'legal.terms.ip.p1':
      'Todas as marcas, designs, gráficos, conteúdos, softwares e demais materiais da Rolluck pertencem à Rolluck ou aos seus respectivos licenciadores.',
    'legal.terms.ip.p2':
      'Você não pode copiar, reproduzir, modificar, distribuir ou usar comercialmente nosso conteúdo sem permissão.',
    'legal.terms.availability.title': '11. Disponibilidade',
    'legal.terms.availability.p1':
      'Procuramos manter a Rolluck disponível e confiável, mas não podemos garantir acesso ininterrupto.',
    'legal.terms.availability.p2':
      'Manutenções, problemas técnicos, serviços de terceiros ou circunstâncias fora do nosso controle razoável podem afetar a disponibilidade.',
    'legal.terms.changes.title': '12. Alterações a estes Termos',
    'legal.terms.changes.p1': 'Podemos atualizar estes Termos periodicamente.',
    'legal.terms.changes.p2':
      'Quando houver alterações, atualizaremos a data exibida no topo desta página. O uso continuado da Rolluck após a entrada em vigor das alterações significa que você aceita os Termos atualizados, quando permitido por lei.',
    'legal.terms.contact.title': '13. Fale conosco',
    'legal.terms.contact.p1':
      'Se você tiver dúvidas sobre estes Termos, sua conta ou nossos serviços, entre em contato com o Suporte da Rolluck pelos canais de atendimento disponíveis.',
    'legal.terms.signOff': 'Rolluck — Jogue com confiança. Jogue com responsabilidade.',

    'legal.privacy.intro':
      'Na Rolluck, entendemos que suas informações pessoais são importantes. Esta Política de Privacidade explica quais informações coletamos, por que as coletamos, como as usamos e como trabalhamos para protegê-las.',
    'legal.privacy.collect.title': '1. Informações que coletamos',
    'legal.privacy.collect.p1':
      'Dependendo de como você usa a Rolluck, podemos coletar informações como:',
    'legal.privacy.collect.i1': 'Nome e informações de contato',
    'legal.privacy.collect.i2': 'Data de nascimento e informações de verificação de idade',
    'legal.privacy.collect.i3': 'Informações de conta e de login',
    'legal.privacy.collect.i4': 'Informações de verificação de identidade',
    'legal.privacy.collect.i5': 'Informações de pagamento e transações',
    'legal.privacy.collect.i6': 'Atividade de jogo e da conta',
    'legal.privacy.collect.i7': 'Informações técnicas e do dispositivo',
    'legal.privacy.collect.i8': 'Endereço IP e informações de localização aproximada',
    'legal.privacy.collect.i9': 'Comunicações com nossa equipe de suporte ao cliente',
    'legal.privacy.collect.i10':
      'Informações necessárias para cumprir obrigações legais e regulatórias',
    'legal.privacy.use.title': '2. Como usamos suas informações',
    'legal.privacy.use.p1': 'Podemos usar suas informações para:',
    'legal.privacy.use.i1': 'Criar e gerenciar sua conta Rolluck',
    'legal.privacy.use.i2': 'Fornecer nossos serviços de jogos e serviços relacionados',
    'legal.privacy.use.i3': 'Processar depósitos e saques',
    'legal.privacy.use.i4': 'Verificar sua identidade e elegibilidade',
    'legal.privacy.use.i5': 'Prevenir fraudes, abusos e atividades não autorizadas',
    'legal.privacy.use.i6': 'Proteger a segurança da nossa plataforma',
    'legal.privacy.use.i7': 'Prestar suporte ao cliente',
    'legal.privacy.use.i8': 'Melhorar nossos jogos, serviços e a experiência do usuário',
    'legal.privacy.use.i9': 'Cumprir requisitos legais e regulatórios',
    'legal.privacy.use.i10': 'Enviar comunicações relacionadas ao serviço',
    'legal.privacy.use.i11':
      'Enviar comunicações promocionais quando permitido e quando você tiver a opção adequada ou tiver dado seu consentimento',
    'legal.privacy.cookies.title': '3. Cookies e tecnologias semelhantes',
    'legal.privacy.cookies.p1':
      'A Rolluck pode usar cookies e tecnologias semelhantes para lembrar preferências, entender como nosso site é usado, melhorar o desempenho e reforçar a segurança.',
    'legal.privacy.cookies.p2':
      'Você pode gerenciar determinadas preferências de cookies pelo seu navegador ou pelos controles de privacidade que disponibilizamos.',
    'legal.privacy.share.title': '4. Como compartilhamos informações',
    'legal.privacy.share.p1':
      'Não vendemos suas informações pessoais simplesmente com o propósito de vendê-las.',
    'legal.privacy.share.p2':
      'Podemos compartilhar informações com prestadores de serviços de confiança, provedores de pagamento, provedores de verificação de identidade, parceiros de tecnologia, consultores profissionais, órgãos reguladores, autoridades policiais ou outras partes, quando necessário e permitido pela legislação aplicável.',
    'legal.privacy.protect.title': '5. Proteção das suas informações',
    'legal.privacy.protect.p1':
      'Adotamos medidas técnicas, organizacionais e de segurança razoáveis, concebidas para proteger suas informações contra acesso não autorizado, perda, uso indevido, alteração ou divulgação.',
    'legal.privacy.protect.p2':
      'No entanto, nenhum sistema online pode ter sua segurança total garantida.',
    'legal.privacy.retention.title': '6. Retenção de dados',
    'legal.privacy.retention.p1':
      'Mantemos as informações pessoais apenas pelo tempo razoavelmente necessário para as finalidades descritas nesta Política de Privacidade, incluindo prestar serviços, cumprir obrigações legais, resolver disputas, prevenir fraudes e fazer cumprir nossos acordos.',
    'legal.privacy.retention.p2':
      'Os períodos de retenção podem variar de acordo com o tipo de informação e os requisitos legais aplicáveis.',
    'legal.privacy.rights.title': '7. Seus direitos de privacidade',
    'legal.privacy.rights.p1':
      'Dependendo de onde você mora, você pode ter direitos relacionados às suas informações pessoais, incluindo o direito de:',
    'legal.privacy.rights.i1': 'Solicitar acesso às suas informações',
    'legal.privacy.rights.i2': 'Solicitar a correção de informações imprecisas',
    'legal.privacy.rights.i3': 'Solicitar a exclusão quando legalmente possível',
    'legal.privacy.rights.i4': 'Opor-se a determinados tratamentos ou restringi-los',
    'legal.privacy.rights.i5':
      'Retirar o consentimento quando o tratamento se basear em consentimento',
    'legal.privacy.rights.i6': 'Solicitar uma cópia de determinadas informações',
    'legal.privacy.rights.p2':
      'Alguns direitos podem estar sujeitos a limitações legais ou regulatórias.',
    'legal.privacy.children.title': '8. Privacidade de menores',
    'legal.privacy.children.p1':
      'A Rolluck destina-se apenas a pessoas que atendam à idade legal mínima aplicável aos nossos serviços.',
    'legal.privacy.children.p2':
      'Não permitimos conscientemente que pessoas que não sejam legalmente elegíveis para usar nossos serviços criem ou mantenham contas.',
    'legal.privacy.transfers.title': '9. Transferências internacionais de dados',
    'legal.privacy.transfers.p1':
      'Suas informações podem ser processadas ou armazenadas em países fora do seu local de residência.',
    'legal.privacy.transfers.p2':
      'Quando necessário, a Rolluck adotará as medidas adequadas para garantir o cumprimento dos requisitos legais aplicáveis às transferências internacionais de dados.',
    'legal.privacy.thirdParty.title': '10. Serviços de terceiros',
    'legal.privacy.thirdParty.p1':
      'A Rolluck pode trabalhar com serviços de terceiros que nos ajudam a oferecer pagamentos, verificação de identidade, segurança, análises, comunicações e outras funcionalidades.',
    'legal.privacy.thirdParty.p2':
      'Esses provedores podem tratar as informações de acordo com suas próprias políticas de privacidade e os acordos aplicáveis.',
    'legal.privacy.changes.title': '11. Alterações a esta Política de Privacidade',
    'legal.privacy.changes.p1':
      'Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossos serviços, tecnologia ou requisitos legais.',
    'legal.privacy.changes.p2':
      'A versão mais recente sempre exibirá a data de atualização no topo desta página.',
    'legal.privacy.contact.title': '12. Fale conosco',
    'legal.privacy.contact.p1':
      'Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer um direito de privacidade aplicável, entre em contato com a Rolluck pelos nossos canais oficiais de suporte.',
    'legal.privacy.signOff1': 'Sua privacidade importa.',
    'legal.privacy.signOff2': 'Sua confiança importa.',
    'legal.privacy.signOff3': 'Na Rolluck, levamos as duas a sério.',
  },
  es: {
    'legal.updated': 'Última actualización: {date}',
    'legal.page.title': 'Términos y condiciones',
    'legal.page.metaDescription':
      'Los términos que se aplican cuando usas Rolluck y la Política de privacidad, que explica qué información recopilamos y cómo la protegemos.',
    'legal.doc.eyebrow': 'Legal',
    'legal.doc.lastUpdated': 'Última actualización: {date}',
    'legal.doc.contents': 'Índice',
    'legal.doc.onThisPage': 'En esta página',

    'legal.terms.intro':
      'Bienvenido a Rolluck. Al crear una cuenta o usar nuestro sitio web, juegos, promociones y servicios, aceptas estos Términos y Condiciones.',
    'legal.terms.about.title': '1. Acerca de Rolluck',
    'legal.terms.about.p1':
      'Rolluck ofrece servicios de juego y entretenimiento en línea a través de su sitio web y plataformas relacionadas. Estos Términos explican las normas que se aplican cuando usas nuestros servicios.',
    'legal.terms.eligibility.title': '2. Requisitos de participación',
    'legal.terms.eligibility.p1':
      'Para usar Rolluck debes tener la edad legal mínima y cumplir todos los demás requisitos de participación aplicables en el lugar donde te encuentres.',
    'legal.terms.eligibility.p2':
      'Es tu responsabilidad asegurarte de que el juego en línea esté legalmente permitido en tu jurisdicción.',
    'legal.terms.eligibility.p3':
      'Rolluck se reserva el derecho de verificar tu edad, identidad y elegibilidad en cualquier momento.',
    'legal.terms.account.title': '3. Tu cuenta',
    'legal.terms.account.p1':
      'Eres responsable de proporcionar información precisa y actualizada al crear tu cuenta.',
    'legal.terms.account.p2':
      'Debes mantener la confidencialidad de tus datos de acceso y no debes permitir que otra persona use tu cuenta.',
    'legal.terms.account.p3':
      'Cada persona solo puede mantener cuentas en la medida en que lo permita Rolluck.',
    'legal.terms.account.p4':
      'Si detectamos actividad sospechosa, fraudulenta o no autorizada, podemos restringir, suspender o cerrar una cuenta.',
    'legal.terms.deposits.title': '4. Depósitos y retiros',
    'legal.terms.deposits.p1':
      'Todos los depósitos deben proceder de un método de pago que estés autorizado a usar.',
    'legal.terms.deposits.p2':
      'Eres responsable de revisar tu saldo y la información de tus transacciones.',
    'legal.terms.deposits.p3':
      'Los retiros pueden requerir verificación de identidad y comprobaciones adicionales antes de procesarse.',
    'legal.terms.deposits.p4':
      'Los plazos de procesamiento pueden variar según el método de pago y los requisitos de verificación.',
    'legal.terms.games.title': '5. Juegos y resultados',
    'legal.terms.games.p1': 'Todos los juegos están sujetos a sus propias reglas y condiciones.',
    'legal.terms.games.p2':
      'Los resultados de los juegos se determinan mediante los sistemas de juego y las tecnologías aplicables que utiliza Rolluck.',
    'legal.terms.games.p3':
      'En caso de un problema técnico, error del sistema o fallo, Rolluck podrá tomar las medidas oportunas, incluida la anulación de las transacciones o partidas afectadas cuando lo permita la legislación aplicable.',
    'legal.terms.bonuses.title': '6. Bonos y promociones',
    'legal.terms.bonuses.p1':
      'Las promociones, bonos, recompensas y campañas pueden tener sus propios términos específicos.',
    'legal.terms.bonuses.p2':
      'Debes leer y comprender las condiciones promocionales aplicables antes de participar.',
    'legal.terms.bonuses.p3':
      'Rolluck se reserva el derecho de cancelar, modificar o retirar una promoción cuando lo permita la legislación aplicable.',
    'legal.terms.rg.title': '7. Juego responsable',
    'legal.terms.rg.p1': 'Queremos que el juego siga siendo entretenimiento.',
    'legal.terms.rg.p2':
      'Establece límites, controla tus gastos y juega solo con dinero que puedas permitirte perder.',
    'legal.terms.rg.p3':
      'Si el juego deja de ser entretenido, tómate un descanso y utiliza las herramientas de juego responsable disponibles en Rolluck.',
    'legal.terms.prohibited.title': '8. Actividades prohibidas',
    'legal.terms.prohibited.p1':
      'No debes usar Rolluck para fraude, blanqueo de capitales, transacciones no autorizadas, trampas, manipulación ni ninguna otra actividad ilícita.',
    'legal.terms.prohibited.p2':
      'No debes intentar interferir con nuestro sitio web, juegos, sistemas o medidas de seguridad.',
    'legal.terms.suspension.title': '9. Suspensión y cierre de la cuenta',
    'legal.terms.suspension.p1':
      'Rolluck puede suspender o cerrar una cuenta cuando exista un incumplimiento de estos Términos, sospecha de fraude, problemas de seguridad, requisitos legales u otros motivos legítimos.',
    'legal.terms.suspension.p2':
      'Cuando la ley lo exija, los saldos correspondientes se gestionarán de acuerdo con los procedimientos pertinentes.',
    'legal.terms.ip.title': '10. Propiedad intelectual',
    'legal.terms.ip.p1':
      'Todas las marcas, diseños, gráficos, contenidos, software y demás materiales de Rolluck pertenecen a Rolluck o a sus respectivos licenciantes.',
    'legal.terms.ip.p2':
      'No puedes copiar, reproducir, modificar, distribuir ni usar comercialmente nuestro contenido sin permiso.',
    'legal.terms.availability.title': '11. Disponibilidad',
    'legal.terms.availability.p1':
      'Nos esforzamos por mantener Rolluck disponible y fiable, pero no podemos garantizar un acceso ininterrumpido.',
    'legal.terms.availability.p2':
      'El mantenimiento, los problemas técnicos, los servicios de terceros o las circunstancias ajenas a nuestro control razonable pueden afectar a la disponibilidad.',
    'legal.terms.changes.title': '12. Cambios en estos Términos',
    'legal.terms.changes.p1': 'Podemos actualizar estos Términos periódicamente.',
    'legal.terms.changes.p2':
      'Cuando se realicen cambios, actualizaremos la fecha que aparece en la parte superior de esta página. Si sigues usando Rolluck después de que los cambios entren en vigor, aceptas los Términos actualizados, en la medida en que lo permita la ley.',
    'legal.terms.contact.title': '13. Contacto',
    'legal.terms.contact.p1':
      'Si tienes preguntas sobre estos Términos, tu cuenta o nuestros servicios, ponte en contacto con el Soporte de Rolluck a través de los canales de atención disponibles.',
    'legal.terms.signOff': 'Rolluck: juega con confianza. Juega con responsabilidad.',

    'legal.privacy.intro':
      'En Rolluck entendemos que tu información personal es importante. Esta Política de privacidad explica qué información recopilamos, por qué la recopilamos, cómo la usamos y cómo trabajamos para protegerla.',
    'legal.privacy.collect.title': '1. Información que recopilamos',
    'legal.privacy.collect.p1': 'Según cómo uses Rolluck, podemos recopilar información como:',
    'legal.privacy.collect.i1': 'Nombre e información de contacto',
    'legal.privacy.collect.i2': 'Fecha de nacimiento e información de verificación de edad',
    'legal.privacy.collect.i3': 'Información de la cuenta y de inicio de sesión',
    'legal.privacy.collect.i4': 'Información de verificación de identidad',
    'legal.privacy.collect.i5': 'Información de pagos y transacciones',
    'legal.privacy.collect.i6': 'Actividad de juego y de la cuenta',
    'legal.privacy.collect.i7': 'Información técnica y del dispositivo',
    'legal.privacy.collect.i8': 'Dirección IP e información de ubicación aproximada',
    'legal.privacy.collect.i9': 'Comunicaciones con nuestro equipo de atención al cliente',
    'legal.privacy.collect.i10':
      'Información necesaria para cumplir obligaciones legales y regulatorias',
    'legal.privacy.use.title': '2. Cómo usamos tu información',
    'legal.privacy.use.p1': 'Podemos usar tu información para:',
    'legal.privacy.use.i1': 'Crear y gestionar tu cuenta de Rolluck',
    'legal.privacy.use.i2': 'Prestar nuestros servicios de juego y servicios relacionados',
    'legal.privacy.use.i3': 'Procesar depósitos y retiros',
    'legal.privacy.use.i4': 'Verificar tu identidad y elegibilidad',
    'legal.privacy.use.i5': 'Prevenir el fraude, el abuso y la actividad no autorizada',
    'legal.privacy.use.i6': 'Proteger la seguridad de nuestra plataforma',
    'legal.privacy.use.i7': 'Ofrecer atención al cliente',
    'legal.privacy.use.i8': 'Mejorar nuestros juegos, servicios y la experiencia de usuario',
    'legal.privacy.use.i9': 'Cumplir los requisitos legales y regulatorios',
    'legal.privacy.use.i10': 'Enviar comunicaciones relacionadas con el servicio',
    'legal.privacy.use.i11':
      'Enviar comunicaciones promocionales cuando esté permitido y cuando dispongas de la opción adecuada o hayas dado tu consentimiento',
    'legal.privacy.cookies.title': '3. Cookies y tecnologías similares',
    'legal.privacy.cookies.p1':
      'Rolluck puede usar cookies y tecnologías similares para recordar preferencias, entender cómo se usa nuestro sitio web, mejorar el rendimiento y reforzar la seguridad.',
    'legal.privacy.cookies.p2':
      'Puedes gestionar determinadas preferencias de cookies a través de tu navegador o de los controles de privacidad que ponemos a tu disposición.',
    'legal.privacy.share.title': '4. Cómo compartimos la información',
    'legal.privacy.share.p1':
      'No vendemos tu información personal con el simple propósito de venderla.',
    'legal.privacy.share.p2':
      'Podemos compartir información con proveedores de servicios de confianza, proveedores de pago, proveedores de verificación de identidad, socios tecnológicos, asesores profesionales, organismos reguladores, fuerzas del orden u otras partes cuando sea necesario y lo permita la legislación aplicable.',
    'legal.privacy.protect.title': '5. Protección de tu información',
    'legal.privacy.protect.p1':
      'Aplicamos medidas técnicas, organizativas y de seguridad razonables diseñadas para proteger tu información frente al acceso no autorizado, la pérdida, el uso indebido, la alteración o la divulgación.',
    'legal.privacy.protect.p2':
      'Sin embargo, no se puede garantizar que ningún sistema en línea sea completamente seguro.',
    'legal.privacy.retention.title': '6. Conservación de datos',
    'legal.privacy.retention.p1':
      'Conservamos la información personal solo durante el tiempo razonablemente necesario para los fines descritos en esta Política de privacidad, incluidos la prestación de servicios, el cumplimiento de obligaciones legales, la resolución de disputas, la prevención del fraude y la aplicación de nuestros acuerdos.',
    'legal.privacy.retention.p2':
      'Los plazos de conservación pueden variar según el tipo de información y los requisitos legales aplicables.',
    'legal.privacy.rights.title': '7. Tus derechos de privacidad',
    'legal.privacy.rights.p1':
      'Según el lugar donde vivas, puedes tener derechos relacionados con tu información personal, incluido el derecho a:',
    'legal.privacy.rights.i1': 'Solicitar acceso a tu información',
    'legal.privacy.rights.i2': 'Solicitar la rectificación de información inexacta',
    'legal.privacy.rights.i3': 'Solicitar la supresión cuando la ley lo permita',
    'legal.privacy.rights.i4': 'Oponerte a determinados tratamientos o limitarlos',
    'legal.privacy.rights.i5':
      'Retirar tu consentimiento cuando el tratamiento se base en el consentimiento',
    'legal.privacy.rights.i6': 'Solicitar una copia de determinada información',
    'legal.privacy.rights.p2':
      'Algunos derechos pueden estar sujetos a limitaciones legales o regulatorias.',
    'legal.privacy.children.title': '8. Privacidad de los menores',
    'legal.privacy.children.p1':
      'Rolluck está destinado únicamente a personas que cumplan la edad legal mínima aplicable a nuestros servicios.',
    'legal.privacy.children.p2':
      'No permitimos a sabiendas que personas que no estén legalmente habilitadas para usar nuestros servicios creen o mantengan cuentas.',
    'legal.privacy.transfers.title': '9. Transferencias internacionales de datos',
    'legal.privacy.transfers.p1':
      'Tu información puede tratarse o almacenarse en países fuera de tu lugar de residencia.',
    'legal.privacy.transfers.p2':
      'Cuando sea necesario, Rolluck tomará las medidas adecuadas para garantizar el cumplimiento de los requisitos legales aplicables a las transferencias internacionales de datos.',
    'legal.privacy.thirdParty.title': '10. Servicios de terceros',
    'legal.privacy.thirdParty.p1':
      'Rolluck puede trabajar con servicios de terceros que nos ayudan a ofrecer pagos, verificación de identidad, seguridad, analítica, comunicaciones y otras funcionalidades.',
    'legal.privacy.thirdParty.p2':
      'Estos proveedores pueden tratar la información de acuerdo con sus propias políticas de privacidad y los acuerdos aplicables.',
    'legal.privacy.changes.title': '11. Cambios en esta Política de privacidad',
    'legal.privacy.changes.p1':
      'Podemos actualizar esta Política de privacidad periódicamente para reflejar cambios en nuestros servicios, tecnología o requisitos legales.',
    'legal.privacy.changes.p2':
      'La versión más reciente siempre mostrará la fecha de actualización en la parte superior de esta página.',
    'legal.privacy.contact.title': '12. Contacto',
    'legal.privacy.contact.p1':
      'Si tienes preguntas sobre esta Política de privacidad o quieres ejercer un derecho de privacidad aplicable, ponte en contacto con Rolluck a través de nuestros canales oficiales de soporte.',
    'legal.privacy.signOff1': 'Tu privacidad importa.',
    'legal.privacy.signOff2': 'Tu confianza importa.',
    'legal.privacy.signOff3': 'En Rolluck nos tomamos ambas muy en serio.',
  },
  it: {
    'legal.updated': 'Ultimo aggiornamento: {date}',
    'legal.page.title': 'Termini e condizioni',
    'legal.page.metaDescription':
      'I termini che si applicano quando utilizzi Rolluck e l’Informativa sulla privacy, che spiega quali informazioni raccogliamo e come le proteggiamo.',
    'legal.doc.eyebrow': 'Note legali',
    'legal.doc.lastUpdated': 'Ultimo aggiornamento: {date}',
    'legal.doc.contents': 'Indice',
    'legal.doc.onThisPage': 'In questa pagina',

    'legal.terms.intro':
      'Benvenuto su Rolluck. Creando un account o utilizzando il nostro sito web, i nostri giochi, le promozioni e i servizi, accetti i presenti Termini e Condizioni.',
    'legal.terms.about.title': '1. Chi è Rolluck',
    'legal.terms.about.p1':
      'Rolluck offre servizi di gioco e intrattenimento online tramite il proprio sito web e le piattaforme collegate. I presenti Termini illustrano le regole che si applicano quando utilizzi i nostri servizi.',
    'legal.terms.eligibility.title': '2. Requisiti di idoneità',
    'legal.terms.eligibility.p1':
      'Per utilizzare Rolluck devi aver raggiunto l’età minima legale e soddisfare tutti gli altri requisiti di idoneità applicabili nel luogo in cui ti trovi.',
    'legal.terms.eligibility.p2':
      'È tua responsabilità assicurarti che il gioco online sia legalmente consentito nella tua giurisdizione.',
    'legal.terms.eligibility.p3':
      'Rolluck si riserva il diritto di verificare in qualsiasi momento la tua età, la tua identità e la tua idoneità.',
    'legal.terms.account.title': '3. Il tuo account',
    'legal.terms.account.p1':
      'Sei responsabile di fornire informazioni accurate e aggiornate al momento della creazione del tuo account.',
    'legal.terms.account.p2':
      'Devi mantenere riservate le tue credenziali di accesso e non devi consentire ad altre persone di utilizzare il tuo account.',
    'legal.terms.account.p3':
      'Ogni persona può mantenere account solo nei limiti consentiti da Rolluck.',
    'legal.terms.account.p4':
      'Se individuiamo attività sospette, fraudolente o non autorizzate, possiamo limitare, sospendere o chiudere un account.',
    'legal.terms.deposits.title': '4. Depositi e prelievi',
    'legal.terms.deposits.p1':
      'Tutti i depositi devono provenire da un metodo di pagamento che sei autorizzato a utilizzare.',
    'legal.terms.deposits.p2':
      'Sei responsabile di controllare il tuo saldo e le informazioni sulle tue transazioni.',
    'legal.terms.deposits.p3':
      'I prelievi possono richiedere la verifica dell’identità e controlli aggiuntivi prima di essere elaborati.',
    'legal.terms.deposits.p4':
      'I tempi di elaborazione possono variare in base al metodo di pagamento e ai requisiti di verifica.',
    'legal.terms.games.title': '5. Giochi e risultati',
    'legal.terms.games.p1': 'Tutti i giochi sono soggetti alle proprie regole e condizioni.',
    'legal.terms.games.p2':
      'I risultati dei giochi sono determinati dai sistemi di gioco e dalle tecnologie applicabili utilizzati da Rolluck.',
    'legal.terms.games.p3':
      'In caso di problemi tecnici, errori di sistema o malfunzionamenti, Rolluck può adottare le misure opportune, incluso l’annullamento delle transazioni o delle partite interessate, ove consentito dalla legge applicabile.',
    'legal.terms.bonuses.title': '6. Bonus e promozioni',
    'legal.terms.bonuses.p1':
      'Promozioni, bonus, premi e campagne possono avere termini specifici propri.',
    'legal.terms.bonuses.p2':
      'Prima di partecipare devi leggere e comprendere le condizioni promozionali applicabili.',
    'legal.terms.bonuses.p3':
      'Rolluck si riserva il diritto di annullare, modificare o ritirare una promozione ove consentito dalla legge applicabile.',
    'legal.terms.rg.title': '7. Gioco responsabile',
    'legal.terms.rg.p1': 'Vogliamo che il gioco resti un divertimento.',
    'legal.terms.rg.p2':
      'Stabilisci dei limiti, tieni sotto controllo la tua spesa e gioca solo con denaro che puoi permetterti di perdere.',
    'legal.terms.rg.p3':
      'Se il gioco smette di essere un divertimento, fai una pausa e utilizza gli strumenti di gioco responsabile disponibili su Rolluck.',
    'legal.terms.prohibited.title': '8. Attività vietate',
    'legal.terms.prohibited.p1':
      'Non devi utilizzare Rolluck per frodi, riciclaggio di denaro, transazioni non autorizzate, imbrogli, manipolazioni o qualsiasi altra attività illecita.',
    'legal.terms.prohibited.p2':
      'Non devi tentare di interferire con il nostro sito web, i nostri giochi, i nostri sistemi o le nostre misure di sicurezza.',
    'legal.terms.suspension.title': '9. Sospensione e chiusura dell’account',
    'legal.terms.suspension.p1':
      'Rolluck può sospendere o chiudere un account in caso di violazione dei presenti Termini, sospetta frode, problemi di sicurezza, obblighi di legge o altri motivi legittimi.',
    'legal.terms.suspension.p2':
      'Ove richiesto dalla legge, i saldi interessati saranno gestiti secondo le procedure pertinenti.',
    'legal.terms.ip.title': '10. Proprietà intellettuale',
    'legal.terms.ip.p1':
      'Tutti i marchi, design, grafiche, contenuti, software e altri materiali di Rolluck appartengono a Rolluck o ai rispettivi licenzianti.',
    'legal.terms.ip.p2':
      'Non puoi copiare, riprodurre, modificare, distribuire o utilizzare a fini commerciali i nostri contenuti senza autorizzazione.',
    'legal.terms.availability.title': '11. Disponibilità',
    'legal.terms.availability.p1':
      'Ci impegniamo a mantenere Rolluck disponibile e affidabile, ma non possiamo garantire un accesso ininterrotto.',
    'legal.terms.availability.p2':
      'Manutenzione, problemi tecnici, servizi di terze parti o circostanze al di fuori del nostro ragionevole controllo possono influire sulla disponibilità.',
    'legal.terms.changes.title': '12. Modifiche ai presenti Termini',
    'legal.terms.changes.p1': 'Possiamo aggiornare periodicamente i presenti Termini.',
    'legal.terms.changes.p2':
      'In caso di modifiche, aggiorneremo la data indicata in cima a questa pagina. Continuando a utilizzare Rolluck dopo l’entrata in vigore delle modifiche, accetti i Termini aggiornati, ove consentito dalla legge.',
    'legal.terms.contact.title': '13. Contattaci',
    'legal.terms.contact.p1':
      'Se hai domande sui presenti Termini, sul tuo account o sui nostri servizi, contatta l’Assistenza Rolluck tramite i canali di supporto disponibili.',
    'legal.terms.signOff': 'Rolluck — Gioca con fiducia. Gioca responsabilmente.',

    'legal.privacy.intro':
      'In Rolluck sappiamo quanto siano importanti le tue informazioni personali. La presente Informativa sulla privacy spiega quali informazioni raccogliamo, perché le raccogliamo, come le utilizziamo e come ci impegniamo a proteggerle.',
    'legal.privacy.collect.title': '1. Informazioni che raccogliamo',
    'legal.privacy.collect.p1':
      'A seconda di come utilizzi Rolluck, potremmo raccogliere informazioni quali:',
    'legal.privacy.collect.i1': 'Nome e recapiti',
    'legal.privacy.collect.i2': 'Data di nascita e informazioni per la verifica dell’età',
    'legal.privacy.collect.i3': 'Informazioni sull’account e sull’accesso',
    'legal.privacy.collect.i4': 'Informazioni per la verifica dell’identità',
    'legal.privacy.collect.i5': 'Informazioni su pagamenti e transazioni',
    'legal.privacy.collect.i6': 'Attività di gioco e dell’account',
    'legal.privacy.collect.i7': 'Informazioni tecniche e sul dispositivo',
    'legal.privacy.collect.i8': 'Indirizzo IP e informazioni sulla posizione approssimativa',
    'legal.privacy.collect.i9': 'Comunicazioni con il nostro team di assistenza clienti',
    'legal.privacy.collect.i10':
      'Informazioni necessarie per adempiere agli obblighi legali e normativi',
    'legal.privacy.use.title': '2. Come utilizziamo le tue informazioni',
    'legal.privacy.use.p1': 'Potremmo utilizzare le tue informazioni per:',
    'legal.privacy.use.i1': 'Creare e gestire il tuo account Rolluck',
    'legal.privacy.use.i2': 'Fornire i nostri servizi di gioco e i servizi correlati',
    'legal.privacy.use.i3': 'Elaborare depositi e prelievi',
    'legal.privacy.use.i4': 'Verificare la tua identità e la tua idoneità',
    'legal.privacy.use.i5': 'Prevenire frodi, abusi e attività non autorizzate',
    'legal.privacy.use.i6': 'Proteggere la sicurezza della nostra piattaforma',
    'legal.privacy.use.i7': 'Fornire assistenza clienti',
    'legal.privacy.use.i8': 'Migliorare i nostri giochi, i servizi e l’esperienza utente',
    'legal.privacy.use.i9': 'Rispettare i requisiti legali e normativi',
    'legal.privacy.use.i10': 'Inviare comunicazioni relative al servizio',
    'legal.privacy.use.i11':
      'Inviare comunicazioni promozionali ove consentito e laddove tu disponga della scelta appropriata o abbia prestato il tuo consenso',
    'legal.privacy.cookies.title': '3. Cookie e tecnologie simili',
    'legal.privacy.cookies.p1':
      'Rolluck può utilizzare cookie e tecnologie simili per ricordare le preferenze, capire come viene utilizzato il nostro sito web, migliorarne le prestazioni e supportarne la sicurezza.',
    'legal.privacy.cookies.p2':
      'Puoi gestire alcune preferenze sui cookie tramite il tuo browser o i controlli della privacy che mettiamo a disposizione.',
    'legal.privacy.share.title': '4. Come condividiamo le informazioni',
    'legal.privacy.share.p1':
      'Non vendiamo le tue informazioni personali al solo scopo di venderle.',
    'legal.privacy.share.p2':
      'Potremmo condividere informazioni con fornitori di servizi affidabili, fornitori di servizi di pagamento, fornitori di servizi di verifica dell’identità, partner tecnologici, consulenti professionali, autorità di regolamentazione, forze dell’ordine o altri soggetti, ove necessario e consentito dalla legge applicabile.',
    'legal.privacy.protect.title': '5. Protezione delle tue informazioni',
    'legal.privacy.protect.p1':
      'Adottiamo misure tecniche, organizzative e di sicurezza ragionevoli, progettate per proteggere le tue informazioni da accessi non autorizzati, perdita, uso improprio, alterazione o divulgazione.',
    'legal.privacy.protect.p2':
      'Tuttavia, nessun sistema online può garantire una sicurezza assoluta.',
    'legal.privacy.retention.title': '6. Conservazione dei dati',
    'legal.privacy.retention.p1':
      'Conserviamo le informazioni personali solo per il tempo ragionevolmente necessario alle finalità descritte nella presente Informativa sulla privacy, tra cui fornire i servizi, adempiere agli obblighi di legge, risolvere controversie, prevenire frodi e far rispettare i nostri accordi.',
    'legal.privacy.retention.p2':
      'I periodi di conservazione possono variare in base al tipo di informazione e ai requisiti di legge applicabili.',
    'legal.privacy.rights.title': '7. I tuoi diritti in materia di privacy',
    'legal.privacy.rights.p1':
      'A seconda del luogo in cui vivi, potresti avere dei diritti relativi alle tue informazioni personali, tra cui il diritto di:',
    'legal.privacy.rights.i1': 'Richiedere l’accesso alle tue informazioni',
    'legal.privacy.rights.i2': 'Richiedere la rettifica di informazioni inesatte',
    'legal.privacy.rights.i3': 'Richiedere la cancellazione ove previsto dalla legge',
    'legal.privacy.rights.i4': 'Opporti a determinati trattamenti o limitarli',
    'legal.privacy.rights.i5': 'Revocare il consenso quando il trattamento si basa sul consenso',
    'legal.privacy.rights.i6': 'Richiedere una copia di determinate informazioni',
    'legal.privacy.rights.p2':
      'Alcuni diritti possono essere soggetti a limitazioni legali o normative.',
    'legal.privacy.children.title': '8. Privacy dei minori',
    'legal.privacy.children.p1':
      'Rolluck è destinato esclusivamente alle persone che hanno raggiunto l’età minima legale applicabile ai nostri servizi.',
    'legal.privacy.children.p2':
      'Non consentiamo consapevolmente a persone che non sono legalmente idonee a utilizzare i nostri servizi di creare o mantenere account.',
    'legal.privacy.transfers.title': '9. Trasferimenti internazionali di dati',
    'legal.privacy.transfers.p1':
      'Le tue informazioni possono essere trattate o conservate in paesi diversi da quello in cui risiedi.',
    'legal.privacy.transfers.p2':
      'Ove richiesto, Rolluck adotterà le misure appropriate per garantire il rispetto dei requisiti di legge applicabili ai trasferimenti internazionali di dati.',
    'legal.privacy.thirdParty.title': '10. Servizi di terze parti',
    'legal.privacy.thirdParty.p1':
      'Rolluck può avvalersi di servizi di terze parti che ci aiutano a fornire pagamenti, verifica dell’identità, sicurezza, analisi, comunicazioni e altre funzionalità.',
    'legal.privacy.thirdParty.p2':
      'Tali fornitori possono trattare le informazioni secondo le proprie informative sulla privacy e gli accordi applicabili.',
    'legal.privacy.changes.title': '11. Modifiche alla presente Informativa sulla privacy',
    'legal.privacy.changes.p1':
      'Possiamo aggiornare periodicamente la presente Informativa sulla privacy per riflettere modifiche ai nostri servizi, alla tecnologia o ai requisiti di legge.',
    'legal.privacy.changes.p2':
      'La versione più recente riporterà sempre la data di aggiornamento in cima a questa pagina.',
    'legal.privacy.contact.title': '12. Contattaci',
    'legal.privacy.contact.p1':
      'Se hai domande sulla presente Informativa sulla privacy o desideri esercitare un diritto applicabile in materia di privacy, contatta Rolluck tramite i nostri canali di assistenza ufficiali.',
    'legal.privacy.signOff1': 'La tua privacy è importante.',
    'legal.privacy.signOff2': 'La tua fiducia è importante.',
    'legal.privacy.signOff3': 'In Rolluck le prendiamo entrambe sul serio.',
  },
};
