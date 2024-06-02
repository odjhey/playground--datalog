// edn identity function
export function ednIdentity(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  // Interleave the strings with the values
  let result = strings[0];
  values.forEach((value, i) => {
    result += value + strings[i + 1];
  });

  return result;
}

export const edn = ednIdentity;
