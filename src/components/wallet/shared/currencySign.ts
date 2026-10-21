/** A currency's own sign — "$" for USD, "€" for EUR; the code when it has none. */
export const currencySign = (code: string, locale: string): string => {
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency: code })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? code
    );
  } catch {
    return code;
  }
};
