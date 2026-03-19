// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLocalizedField<T = string>(
  item: any,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function localizeItems<T extends Record<string, any>>(
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
