export function formatCurrencyCents(cents: number | bigint): string {
  const value = typeof cents === "bigint" ? cents : BigInt(cents);
  const isNegative = value < 0n;
  const absolute = isNegative ? -value : value;
  const whole = absolute / 100n;
  const fraction = absolute % 100n;
  const wholeText = groupThousands(whole.toString());
  const fractionText = fraction.toString().padStart(2, "0");

  return `R$ ${isNegative ? "-" : ""}${wholeText},${fractionText}`;
}

function groupThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
