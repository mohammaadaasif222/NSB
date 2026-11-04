export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'DOWN' | 'UP' | 'FLOOR' | 'CEILING';

export interface PrecisionRule {
  precision: number;
  rounding_mode: RoundingMode;
}

export const ROUNDING_MODES: readonly RoundingMode[] = [
  'HALF_UP',
  'HALF_EVEN',
  'DOWN',
  'UP',
  'FLOOR',
  'CEILING',
];

type NumericInput = string | number | null | undefined;

const PLAIN = /^([+-])?(\d*)(?:\.(\d*))?$/;

const toPlain = (value: string | number): string | null => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    const text = String(value);
    if (!/e/i.test(text)) return text;
    const fixed = value.toFixed(20);
    return /e/i.test(fixed) ? null : fixed;
  }
  const text = value.trim().replace(/,/g, '');
  if (text === '') return null;
  if (/e/i.test(text)) {
    const n = Number(text);
    return Number.isFinite(n) ? toPlain(n) : null;
  }
  return text;
};

const roundsAway = (
  mode: RoundingMode,
  negative: boolean,
  lastKept: number,
  dropped: string
): boolean => {
  if (!/[1-9]/.test(dropped)) return false;
  const first = Number(dropped[0]);
  switch (mode) {
    case 'UP':
      return true;
    case 'DOWN':
      return false;
    case 'CEILING':
      return !negative;
    case 'FLOOR':
      return negative;
    case 'HALF_EVEN':
      if (first !== 5) return first > 5;
      return /[1-9]/.test(dropped.slice(1)) || lastKept % 2 === 1;
    case 'HALF_UP':
    default:
      return first >= 5;
  }
};

export const roundDecimal = (
  value: NumericInput,
  precision: number,
  mode: RoundingMode
): string | null => {
  if (value === null || value === undefined) return null;
  const plain = toPlain(value);
  if (plain === null) return null;
  const match = PLAIN.exec(plain);
  if (!match || (match[2] === '' && (match[3] ?? '') === '')) return null;

  const places = Math.max(0, Math.min(20, Math.trunc(precision)));
  const negative = match[1] === '-';
  const intPart = match[2] === '' ? '0' : match[2];
  const fracPart = match[3] ?? '';
  const digits = `${intPart}${fracPart.slice(0, places).padEnd(places, '0')}`;

  let scaled = BigInt(digits);
  if (roundsAway(mode, negative, Number(digits[digits.length - 1]), fracPart.slice(places))) {
    scaled += BigInt(1);
  }

  const body = scaled.toString().padStart(places + 1, '0');
  const whole = body.slice(0, body.length - places);
  const text = places > 0 ? `${whole}.${body.slice(body.length - places)}` : whole;
  return negative && scaled !== BigInt(0) ? `-${text}` : text;
};

const separatorCache = new Map<string, { group: string; decimal: string }>();

const separatorsFor = (locale?: string): { group: string; decimal: string } => {
  const key = locale ?? '';
  const cached = separatorCache.get(key);
  if (cached) return cached;
  let found = { group: ',', decimal: '.' };
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(11111.1);
    found = {
      group: parts.find((p) => p.type === 'group')?.value ?? ',',
      decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    };
  } catch {
    found = { group: ',', decimal: '.' };
  }
  separatorCache.set(key, found);
  return found;
};

export const groupDecimal = (plain: string, locale?: string): string => {
  const { group, decimal } = separatorsFor(locale);
  const negative = plain.startsWith('-');
  const [whole, fraction] = (negative ? plain.slice(1) : plain).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${negative ? '-' : ''}${grouped}${fraction !== undefined ? `${decimal}${fraction}` : ''}`;
};

export const formatDecimal = (
  value: NumericInput,
  rule: PrecisionRule,
  locale?: string
): string | null => {
  const rounded = roundDecimal(value, rule.precision, rule.rounding_mode);
  return rounded === null ? null : groupDecimal(rounded, locale);
};

let rules: Record<string, PrecisionRule> = {};
let version = 0;
const listeners = new Set<() => void>();

export const setPrecisionRules = (next: Record<string, PrecisionRule>): void => {
  if (JSON.stringify(next) === JSON.stringify(rules)) return;
  rules = { ...next };
  version += 1;
  listeners.forEach((listener) => listener());
};

export const updatePrecisionRule = (feature: string, rule: PrecisionRule | null): void => {
  const next = { ...rules };
  if (rule) next[feature] = rule;
  else delete next[feature];
  setPrecisionRules(next);
};

export const subscribePrecisionRules = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPrecisionRulesVersion = (): number => version;

export const precisionRule = (feature: string): PrecisionRule | null => rules[feature] ?? null;

export const displayDecimal = (
  value: NumericInput,
  feature: string,
  locale?: string
): string | null => {
  const rule = precisionRule(feature);
  return rule ? formatDecimal(value, rule, locale) : null;
};

export const exportDecimal = <T>(value: T, feature: string): T | string => {
  const rule = precisionRule(feature);
  if (!rule || (typeof value !== 'string' && typeof value !== 'number')) return value;
  return roundDecimal(value, rule.precision, rule.rounding_mode) ?? value;
};
