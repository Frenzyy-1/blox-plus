export function getHashUrl(n: string) {
  let i = 31;
  for (let t = 0; t < 32; t++) i ^= n[t].charCodeAt(0);
  return `https://t${(i % 8).toString()}.rbxcdn.com/${n}`;
}
