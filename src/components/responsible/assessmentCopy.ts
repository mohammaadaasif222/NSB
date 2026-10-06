/**
 * The Self-Assessment copy, exactly as the design writes it.
 *
 * These eleven questions are the Lie/Bet-style screen used by treatment
 * services, and they are reproduced here word for word rather than paraphrased:
 * the wording is what makes a screening question a screening question, and
 * rewriting it to read more nicely would change what it measures.
 *
 * Nothing on this page scores the answers. The design asks the reader to put
 * the questions to themselves and says what to do if any of them land — see
 * the reminder at the foot. There was an interactive version with a modal and
 * a banded result; it is not what the design draws, and it is gone.
 */

export const ASSESSMENT_INTRO =
  'Gambling can be an enjoyable pastime for many people, providing entertainment and the thrill of taking a risk. However, for some individuals, gambling can become more than just a harmless activity. It can develop into a serious problem that affects various aspects of their lives. Recognizing the signs of problem gambling is the first step towards addressing this issue. This self-assessment tool is designed to help you reflect on your gambling behaviour and determine whether it may be causing problems in your life. It is essential to approach this assessment with honesty and openness to gain a clear understanding of your gambling habits.';

export const ASSESSMENT_PROMPT =
  'Do you have a gambling problem? Ask yourself the following questions:';

export const ASSESSMENT_SCREEN: readonly string[] = [
  'Have there ever been periods lasting two weeks or longer when you spent a lot of time thinking about your gambling experiences, planning out future gambling ventures or bets, or thinking about ways of getting money to gamble with?',
  'Have there ever been periods when you needed to gamble with increasing amounts of money or with larger bets than before in order to get the same feeling of excitement?',
  'Have you ever felt restless or irritable when trying to stop, cut down, or control your gambling?',
  'Have you tried and not succeeded in stopping, cutting down, or controlling your gambling three or more times in your life?',
  'Have you ever gambled to escape from personal problems, or to relieve uncomfortable feelings such as guilt, anxiety, helplessness, or depression?',
  'Has there ever been a period when, if you lost money gambling one day, you would often return another day to get even?',
  'Have you lied to family members, friends, or others about how much you gamble, and/or about how much money you lost on gambling, on at least three occasions?',
  "Have you ever written a bad cheque or taken money that didn't belong to you from family members, friends, or anyone else in order to pay for your gambling?",
  'Has your gambling ever caused serious or repeated problems in your relationships with any of your family members or friends? Or, has your gambling ever caused you problems at work or your studies?',
  'Have you ever needed to ask family members, friends, a lending institution, or anyone else to loan you money or otherwise bail you out of a desperate money situation that was largely caused by your gambling?',
];

export const ASSESSMENT_REMINDER =
  '*REMINDER: this self-assessment will help you figure out if there is, or you are developing a problem. If you answered yes to one or more of the above questions, you should seek help.';
