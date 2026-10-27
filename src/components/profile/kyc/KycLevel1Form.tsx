import { useState, useEffect, useMemo, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import {
  CheckIcon,
  RefreshCwIcon,
  EditIcon,
  UserIcon,
  CalendarIcon,
  GlobeIcon,
  MapPinIcon,
} from '@/components/icons';
import kycApi from '@/services/kyc.api';
import { useTranslation } from '@/context/I18nContext';
import DobSelect from '@/components/inputs/DobSelect';
import FormField, {
  FIELD_INPUT,
  FIELD_OPTION,
  FIELD_PLACEHOLDER,
} from '@/components/profile/kyc/FormField';
import { composeDob, splitDob } from '@/utils/dob';
import {
  countryName as lookupCountryName,
  isKnownCountry,
  localizedCountries,
} from '@/constants/countries';
import type { PlayerKycProfile } from '@/types/kyc';

interface Props {
  profile: PlayerKycProfile | null;
  onSuccess: (updated: PlayerKycProfile) => void;
}

function parseAddressFromProfile(profile: PlayerKycProfile | null) {
  let st = profile?.street || '';
  let ct = profile?.city || '';
  let ste = profile?.state || '';
  let pc = profile?.postalCode || '';
  // No default: a pre-selected country gets submitted unnoticed, and the
  // Level 2 document check then disagrees with it.
  let ctry = profile?.country || profile?.nationality || '';

  if ((!st || !ct) && profile?.addressFormatted) {
    const parts = profile.addressFormatted.split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      st = st || parts[0];
      ct = ct || parts[1];
      if (parts.length === 3) {
        ctry = ctry || parts[2];
      } else if (parts.length === 4) {
        ste = ste || parts[2];
        ctry = ctry || parts[3];
      } else if (parts.length >= 5) {
        ste = ste || parts[2];
        pc = pc || parts[3];
        ctry = ctry || parts[parts.length - 1];
      }
    }
  }

  // The backend only accepts an ISO alpha-3 code, so never seed the select with a
  // value that has no matching option (e.g. an address fragment or a country name).
  const country = isKnownCountry(ctry) ? ctry.trim().toUpperCase() : '';

  return { street: st, city: ct, state: ste, postalCode: pc, country };
}

/** A stored `YYYY-MM-DD` as a date in the player's language; the raw value if it does not parse. */
function formatDob(dob: string | null | undefined, locale: string): string | undefined {
  if (!dob) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return dob;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  try {
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dob;
  }
}

const KycLevel1Form: FC<Props> = ({ profile, onSuccess }) => {
  const { t, locale } = useTranslation();

  // Names come from Intl in the player's language, sorted the way that
  // language sorts; the code each one submits is unchanged.
  const countryOptions = useMemo(() => localizedCountries(locale), [locale]);
  // `isLevel1Complete` is the backend's verdict and the only thing that unlocks
  // Level 2 there. Deriving it again from a few columns let the UI disagree with
  // the gate — showing "Complete" for a profile the API would still reject.
  const isAlreadyDone = Boolean(profile?.isLevel1Complete);

  /**
   * Once documents are submitted the name and date of birth are what the
   * document check was judged against, so they freeze. The address stays open —
   * players move, and Level 3 verifies proof of address against this value.
   */
  // Locked once documents are in — a player must not be able to change the
  // name their ID was checked against. The exception is a profile with no
  // declared identity on file at all: there the lock would be a trap, since
  // the profile is held for review precisely because that data is missing
  // and this form is the only way to provide it.
  // Once Level 2 has been approved it stays locked through any redo or reset.
  const identityLocked =
    Boolean(profile?.identityLocked || profile?.isSubmitted || profile?.status === 'APPROVED') &&
    profile?.hasIdentityBaseline !== false;
  const [isEditing, setIsEditing] = useState(!isAlreadyDone);

  // Empty until the player actually picks a date. Pre-filling these was silently
  // submitting a birthday nobody entered, which then failed the Level 2 document
  // comparison and landed the profile in the admin review queue.
  const initialDob = splitDob(profile?.dob);

  const initialAddr = parseAddressFromProfile(profile);

  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [birthDay, setBirthDay] = useState(initialDob.day);
  const [birthMonth, setBirthMonth] = useState(initialDob.month);
  const [birthYear, setBirthYear] = useState(initialDob.year);
  const [street, setStreet] = useState(initialAddr.street);
  const [city, setCity] = useState(initialAddr.city);
  const [state, setState] = useState(initialAddr.state);
  const [country, setCountry] = useState(initialAddr.country);
  const [postalCode, setPostalCode] = useState(initialAddr.postalCode);
  const [loading, setLoading] = useState(false);

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      const dobParts = splitDob(profile.dob);
      if (dobParts.year) {
        setBirthYear(dobParts.year);
        setBirthMonth(dobParts.month);
        setBirthDay(dobParts.day);
      }
      const addr = parseAddressFromProfile(profile);
      setStreet(addr.street);
      setCity(addr.city);
      setState(addr.state);
      setCountry(addr.country);
      setPostalCode(addr.postalCode);
    }
  }, [profile]);

  const handleCancelEdit = () => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      const dobParts = splitDob(profile.dob);
      if (dobParts.year) {
        setBirthYear(dobParts.year);
        setBirthMonth(dobParts.month);
        setBirthDay(dobParts.day);
      }
      const addr = parseAddressFromProfile(profile);
      setStreet(addr.street);
      setCity(addr.city);
      setState(addr.state);
      setCountry(addr.country);
      setPostalCode(addr.postalCode);
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t('acct.kyc1.nameRequired'));
      return;
    }

    if (!birthDay || !birthMonth || !birthYear) {
      toast.error(t('acct.kyc1.dobRequired'));
      return;
    }

    if (!country) {
      toast.error(t('acct.kyc1.countryRequired'));
      return;
    }

    if (!street.trim() || !city.trim() || !postalCode.trim()) {
      toast.error(t('acct.kyc1.addressRequired'));
      return;
    }

    const dob = composeDob(birthDay, birthMonth, birthYear) as string;
    setLoading(true);

    try {
      const updated = await kycApi.submitLevel1({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        dob,
        country,
        street: street.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        postal_code: postalCode.trim(),
      });

      toast.success(t('acct.kyc1.saved'));
      setIsEditing(false);
      onSuccess(updated);
    } catch (err: any) {
      toast.error(err?.message || t('acct.kyc1.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // If already completed and not editing, show summary card
  if (isAlreadyDone && !isEditing) {
    const countryName =
      lookupCountryName(profile?.country, locale) ||
      lookupCountryName(profile?.nationality, locale) ||
      profile?.country ||
      profile?.nationality;

    const summary = [
      {
        key: 'name',
        icon: <UserIcon size={15} />,
        label: t('acct.kyc1.fullName'),
        value: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || '—',
      },
      {
        key: 'dob',
        icon: <CalendarIcon size={15} />,
        label: t('auth.dateOfBirth'),
        value: formatDob(profile?.dob, locale),
      },
      {
        key: 'country',
        icon: <GlobeIcon size={15} />,
        label: t('acct.kyc1.country'),
        value: countryName,
      },
      {
        key: 'address',
        icon: <MapPinIcon size={15} />,
        label: t('acct.kyc1.address'),
        value: profile?.addressFormatted || '—',
      },
    ];

    return (
      <div className="space-y-[calc(var(--u)*14)]">
        <div className="flex flex-wrap items-center justify-between gap-[calc(var(--u)*8)]">
          <div className="flex items-center gap-[calc(var(--u)*10)]">
            <span className="flex h-[calc(var(--u)*38)] w-[calc(var(--u)*38)] shrink-0 items-center justify-center rounded-full bg-[#35d07f]/15 text-[#35d07f]">
              <CheckIcon size={16} />
            </span>
            <div>
              <span className="block text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#35d07f]">
                {t('acct.kyc1.confirmed')}
              </span>
              <p className="text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
                {t('acct.kyc1.readyForLevel2')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rl-chip inline-flex h-[calc(var(--u)*32)] items-center gap-[calc(var(--u)*6)] px-[calc(var(--u)*15)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] font-medium text-[#f0f1f5]"
          >
            <EditIcon size={12} />
            <span>
              {identityLocked ? t('acct.kyc1.updateAddress') : t('acct.kyc1.editDetails')}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-[calc(var(--u)*12)]">
          {summary.map((item) => (
            <div
              key={item.key}
              className="rl-field-card flex items-start gap-[calc(var(--u)*10)] rounded-[calc(var(--u)*24)] p-[calc(var(--u)*16)]"
            >
              <span className="mt-[calc(var(--u)*2)] shrink-0 text-[#35d07f]">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="block text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
                  {item.label}
                </span>
                <span
                  className="block truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]"
                  title={item.value ?? undefined}
                >
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-[calc(var(--u)*20)] pt-[calc(var(--u)*8)]">
      {/* Form header if editing */}
      {isAlreadyDone && (
        <div className="flex items-center justify-between gap-[calc(var(--u)*8)]">
          <div>
            <h4 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
              {t('acct.kyc1.editTitle')}
            </h4>
            <p className="text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
              {t('acct.kyc1.editHint')}
            </p>
          </div>
          <span className="inline-flex h-[calc(var(--u)*24)] shrink-0 items-center rounded-full bg-[#35d07f]/15 px-[calc(var(--u)*10)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] font-medium text-[#35d07f]">
            {t('acct.kyc1.editingMode')}
          </span>
        </div>
      )}

      {/* 1. Identity Section */}
      <div className="space-y-[calc(var(--u)*12)]">
        <div className="flex flex-wrap items-center justify-between gap-[calc(var(--u)*8)] px-[calc(var(--u)*4)]">
          <span className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
            {t('acct.kyc1.legalIdentity')}
          </span>
          {identityLocked && (
            <span className="text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
              {t('acct.kyc1.locked')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-[calc(var(--u)*12)]">
          <FormField label={t('auth.firstName')} htmlFor="kyc-first-name" required>
            <input
              type="text"
              required
              placeholder={t('acct.kyc1.firstNamePh')}
              id="kyc-first-name"
              value={firstName}
              disabled={identityLocked}
              onChange={(e) => setFirstName(e.target.value)}
              className={FIELD_INPUT}
            />
          </FormField>

          <FormField label={t('auth.lastName')} htmlFor="kyc-last-name" required>
            <input
              type="text"
              required
              placeholder={t('acct.kyc1.lastNamePh')}
              id="kyc-last-name"
              value={lastName}
              disabled={identityLocked}
              onChange={(e) => setLastName(e.target.value)}
              className={FIELD_INPUT}
            />
          </FormField>

          <FormField
            label={t('auth.dateOfBirth')}
            htmlFor="kyc-dob-day"
            required
            hint={
              <span id="kyc-dob-hint" className="text-[10.5px] font-medium text-[#35d07f]">
                {t('acct.kyc1.ageRequirement', { min: 18 })}
              </span>
            }
          >
            <DobSelect
              idPrefix="kyc-dob"
              describedBy="kyc-dob-hint"
              day={birthDay}
              month={birthMonth}
              year={birthYear}
              disabled={identityLocked}
              onChange={({ day, month, year }) => {
                setBirthDay(day);
                setBirthMonth(month);
                setBirthYear(year);
              }}
              selectClassName={`${FIELD_INPUT} cursor-pointer`}
              optionClassName={FIELD_OPTION}
              placeholderClassName={FIELD_PLACEHOLDER}
            />
          </FormField>

          <FormField label={t('acct.kyc1.country')} htmlFor="kyc-country" required>
            <select
              id="kyc-country"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`${FIELD_INPUT} cursor-pointer`}
            >
              {/* No default. The list previously fell back to India for
                  anyone whose country was not among the 25 on offer, which
                  quietly submitted a country the player never chose. */}
              <option value="" className={FIELD_PLACEHOLDER}>
                {t('acct.kyc1.selectCountry')}
              </option>
              {countryOptions.map((c) => (
                <option key={c.code} value={c.code} className={FIELD_OPTION}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* 2. Residential Address Section */}
      <div className="space-y-[calc(var(--u)*12)] border-t border-white/8 pt-[calc(var(--u)*16)]">
        <span className="block px-[calc(var(--u)*4)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
          {t('acct.kyc1.residentialAddress')}
        </span>

        <FormField label={t('acct.kyc1.street')} htmlFor="kyc-street" required>
          <input
            type="text"
            required
            placeholder={t('acct.kyc1.streetPh')}
            id="kyc-street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className={FIELD_INPUT}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-[calc(var(--u)*12)]">
          <FormField label={t('acct.kyc1.city')} htmlFor="kyc-city" required>
            <input
              type="text"
              required
              placeholder={t('acct.kyc1.cityPh')}
              id="kyc-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={FIELD_INPUT}
            />
          </FormField>

          <FormField label={t('acct.kyc1.state')} htmlFor="kyc-state">
            <input
              type="text"
              placeholder={t('acct.kyc1.statePh')}
              id="kyc-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={FIELD_INPUT}
            />
          </FormField>

          <FormField label={t('acct.kyc1.postal')} htmlFor="kyc-postal-code" required>
            <input
              type="text"
              required
              placeholder={t('acct.kyc1.postalPh')}
              id="kyc-postal-code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className={FIELD_INPUT}
            />
          </FormField>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-[calc(var(--u)*10)] border-t border-white/8 pt-[calc(var(--u)*16)]">
        {isAlreadyDone && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="rl-chip inline-flex h-[calc(var(--u)*48)] items-center rounded-full px-[calc(var(--u)*22)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]"
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rl-chip-active inline-flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*8)] rounded-full px-[calc(var(--u)*22)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#ffe779] disabled:opacity-55"
        >
          {loading && <RefreshCwIcon size={16} className="animate-spin" />}
          <span>{isAlreadyDone ? t('acct.kyc1.updateSave') : t('acct.kyc1.saveUnlock')}</span>
        </button>
      </div>
    </form>
  );
};

export default KycLevel1Form;
