export function getLocalizedField<T = string>(
  item: Record<string, unknown>,
  field: string,
  locale: string,
  fallbackLocale: string = 'en'
): T {
  const localizedValue = item[`${field}_${locale}`];
  if (localizedValue !== null && localizedValue !== undefined && localizedValue !== '') {
    return localizedValue as T;
  }
  return item[`${field}_${fallbackLocale}`] as T;
}

export function localizeItems<T extends Record<string, unknown>>(
  items: T[],
  fields: string[],
  locale: string
): (T & { localized: Record<string, unknown> })[] {
  return items.map((item) => ({
    ...item,
    localized: fields.reduce(
      (acc, field) => ({
        ...acc,
        [field]: getLocalizedField(item, field, locale),
      }),
      {}
    ),
  }));
}
