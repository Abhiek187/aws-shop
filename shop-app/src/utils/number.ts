/**
 * Convert a number to a dollar string
 */
export const dollarFormat = (amount: number): string => {
  if (Number.isInteger(amount)) {
    // Show 0 fraction digits if the amount is whole
    return `$${amount.toLocaleString()}`; // add commas to large numbers
  } else if (Number.isInteger(amount * 10)) {
    // Show 2 fraction digits if the amount contains 1 decimal
    return `$${amount.toFixed(2)}`;
  } else {
    // Show all fraction digits otherwise
    const numberStr = amount.toString();
    if (numberStr.toLowerCase().includes("e")) {
      const [, exponent] = numberStr.split("e");
      const decimalCount = Math.max(0, -parseInt(exponent));
      return `$${amount.toFixed(decimalCount)}`;
    } else {
      return `$${amount}`;
    }
  }
};

/**
 * Add commas to a number for readability
 */
export const commaFormat = (num: number): string => num.toLocaleString();
