/**
 * Promotions, tournaments, blogs, bonuses, rewards and roles — the sample copy
 * the placeholder constants carry plus the few labels core does not already
 * have (core owns the promo., tournament., blogs., bonus., rewards. and role.
 * labels).
 */
export const en = {
  /* Shared by the promotion detail page and every tournament card. */
  'content.sample.wagerRace': 'Endorphina Wager Race',

  'content.promo.starsOutOf5': '{value} out of 5',

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

  /* --- Reward detail dialogs -------------------------------------------
   *
   * What each reward is, how often it settles, what it is worked out from and
   * what a VIP gets extra — the standing copy behind a reward card's info
   * button (RewardDetailModal). The payout split is NOT here: the API already
   * reports the live percentages per tier, so those lines are built from
   * `rewards.detail.payout*` instead and cannot drift from what actually pays.
   */
  'content.reward.rakeback.subtitle': 'Rakeback + Boost',
  'content.reward.rakeback.desc': 'Get a bonus for your bets regardless of the result.',
  'content.reward.rakeback.frequency': 'Every 20 minutes',
  'content.reward.rakeback.for1': 'Casino bets (all games)',
  'content.reward.rakeback.for2': 'Live Casino bets (all providers)',
  'content.reward.rakeback.boostTitle': 'Rakeback Boost',
  'content.reward.rakeback.boostDuration': '20 minutes after activation',
  'content.reward.rakeback.boostDesc': 'Get a Rakeback bonus.',
  'content.reward.rakeback.step1': 'Claim Rakeback bonus',
  'content.reward.rakeback.step2': 'Claim Daily bonus',
  'content.reward.rakeback.step3': 'Claim Weekly bonus',
  'content.reward.rakeback.step4': 'Claim Monthly bonus',

  'content.reward.cashback.subtitle': 'Cashback',
  'content.reward.cashback.desc': 'Receive up to 15% of your losses based on your rank.',
  'content.reward.cashback.frequency': 'Weekly, Friday at midnight UTC',
  'content.reward.cashback.vip1': 'Higher cashback percentage for VIP users',
  'content.reward.cashback.vip2': 'Faster crediting and higher limits',
  'content.reward.cashback.for1': 'Casino bets (all games)',

  'content.reward.daily.subtitle': 'Free daily reward',
  'content.reward.daily.desc':
    'The Daily Bonus is an accumulation of the instant rakeback you missed over the past 24 hours.',
  'content.reward.daily.frequency': 'Once every 24 hours',
  'content.reward.daily.vip1': 'Higher daily bonus amount for VIP users',
  'content.reward.daily.vip2': 'Additional rewards on consecutive daily claims',
  'content.reward.daily.for1': 'Claiming the Daily Bonus',
  'content.reward.daily.for2': 'Active gameplay after bonus activation',
  'content.reward.daily.step1': 'Open the Rewards section',
  'content.reward.daily.step2': 'Claim your Daily Bonus',
  'content.reward.daily.step3': 'Use the bonus within the validity period',

  'content.reward.weekly.subtitle': 'Weekly reward',
  'content.reward.weekly.desc':
    'The Weekly Bonus is an accumulation of 25% of your instant rakeback and daily bonus claims.',
  'content.reward.weekly.frequency': 'Calculated once per week',
  'content.reward.weekly.vip1': 'Higher weekly bonus for VIP users',
  'content.reward.weekly.vip2': 'Improved bonus conditions and higher limits',
  'content.reward.weekly.for1': 'Weekly gameplay activity',
  'content.reward.weekly.for2': 'Eligible only for casino bets',
  'content.reward.weekly.step1': 'Open the Rewards section',
  'content.reward.weekly.step2': 'Claim your Weekly Bonus',
  'content.reward.weekly.step3': 'Use the bonus within the validity period',

  'content.reward.monthly.subtitle': 'Monthly reward',
  'content.reward.monthly.desc':
    'The Monthly Bonus is an accumulation of 25% of your instant rakeback, instant cashback and daily bonus claims.',
  'content.reward.monthly.frequency': 'Calculated once per month',
  'content.reward.monthly.vip1': 'Higher monthly bonus for VIP users',
  'content.reward.monthly.vip2': 'Better wagering conditions and higher bonus caps',
  'content.reward.monthly.for1': 'Monthly gameplay activity',
  'content.reward.monthly.for2': 'Eligible only for casino bets',
  'content.reward.monthly.step1': 'Open the Rewards section',
  'content.reward.monthly.step2': 'Claim your Monthly Bonus',
  'content.reward.monthly.step3': 'Use the bonus within the validity period',

  'content.role.superMaster': 'Super Master',
  'content.role.master': 'Master',
  'content.role.riskManagement': 'Risk Management',
  'content.role.accountant': 'Accountant',
  'content.role.customerSupport': 'Customer Support',
  'content.role.marketing': 'Marketing',
  'content.role.partner': 'Partner',
  'content.role.riskManagementTrainee': 'Risk Management Trainee',
  'oath.eyebrow': 'Our oath. Our commitment.',
  'oath.title': 'The Rolluck Oath',
  'oath.subtitle':
    'And we believe gaming should be more than just a game. It should be exciting, fair, transparent, and built on trust.',
  'oath.fair.title': 'We promise to play fair.',
  'oath.fair.body':
    'Every game, every result, and every experience will be handled with fairness and integrity. No hidden tricks. No false promises. Just a gaming experience you can trust.',
  'oath.players.title': 'We promise to put our players first.',
  'oath.players.body':
    'We will listen to our community, respect every player, and continuously improve the experience we create for you.',
  'oath.transparent.title': 'We promise to be transparent.',
  'oath.transparent.body':
    'What you see is what you get. We believe in clear rules, honest information, and an experience where you always know what you are playing.',
  'oath.protect.title': 'We promise to protect what matters.',
  'oath.protect.body':
    'Your privacy, security, and trust are never something we take lightly. We will work to keep your experience safe and secure.',
  'oath.excitement.title': 'We promise to keep the excitement alive.',
  'oath.excitement.body':
    'From every spin to every game, we want Rolluck to feel exciting, fresh, and memorable.',
  'oath.enough.title': 'And we promise to know when enough is enough.',
  'oath.enough.body':
    'Gaming should always be enjoyed responsibly. We believe in giving players the tools and freedom to stay in control of their experience.',
} as const;
