/**
 * Shape shared by the per-area dictionary modules in this folder.
 *
 * Each module owns a key prefix, declares its English strings as `en`, and
 * must translate every one of them into every other locale — `ModuleDict`
 * is a full `Record`, so a missing translation is a compile error.
 */

export type NonEnLocale = 'ar' | 'tr' | 'hi' | 'fr' | 'ru' | 'pt' | 'es' | 'it';

export type ModuleDict<E> = Record<NonEnLocale, Record<keyof E, string>>;
