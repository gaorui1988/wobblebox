export const brandName = 'Wobblebox';

export const brandSlug = brandName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const emailDomain = `${brandSlug.replace(/-/g, '')}.com`;
export const emailAddress = `hello@${emailDomain}`;
