const abbreviation = ["K", "M", "B", "T"];

export default function abbreviate(
  number: number,
  decimalPlaces: number
): string {
  decimalPlaces = Math.pow(10, decimalPlaces);
  let result = number.toString();
  for (let i = abbreviation.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3);
    if (size <= number) {
      number = Math.round((number * decimalPlaces) / size) / decimalPlaces;
      if (number === 1000 && i < abbreviation.length - 1) {
        number = 1;
        i++;
      }
      result = `${number}${abbreviation[i]}`;
      break;
    }
  }
  return result;
}
