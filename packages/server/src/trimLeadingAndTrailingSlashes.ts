export const trimLeadingAndTrailingSlashes = (str: string) =>
  str.replace(/^\/|\/$/g, '');
