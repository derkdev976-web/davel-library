/**
 * Utility functions for generating random currency values
 */

/**
 * Generates a random currency amount between min and max values
 * @param min - Minimum amount in South African Rands (ZAR)
 * @param max - Maximum amount in South African Rands (ZAR)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Random currency amount as a number
 */
export function getRandomCurrency(min: number, max: number, decimals: number = 2): number {
  const random = Math.random() * (max - min) + min;
  return Math.round(random * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generates a random membership fee between R15 and R85
 * @returns Random membership fee in South African Rands (ZAR)
 */
export function getRandomMembershipFee(): number {
  return getRandomCurrency(15, 85);
}

/**
 * Generates a random class cost between R0 and R50
 * @returns Random class cost in South African Rands (ZAR)
 */
export function getRandomClassCost(): number {
  return getRandomCurrency(0, 50);
}

/**
 * Generates a random restoration cost between R20 and R80
 * @returns Random restoration cost in South African Rands (ZAR)
 */
export function getRandomRestorationCost(): number {
  return getRandomCurrency(20, 80);
}

/**
 * Generates a random printing cost between R0.50 and R5.00
 * @returns Random printing cost in South African Rands (ZAR)
 */
export function getRandomPrintingCost(): number {
  return getRandomCurrency(0.50, 5.00);
}

/**
 * Generates a random late fee between R0.10 and R2.00
 * @returns Random late fee in South African Rands (ZAR)
 */
export function getRandomLateFee(): number {
  return getRandomCurrency(0.10, 2.00);
}

/**
 * Generates a random maximum fine between R5 and R25
 * @returns Random maximum fine in South African Rands (ZAR)
 */
export function getRandomMaxFine(): number {
  return getRandomCurrency(5, 25);
}

/**
 * Generates a random replacement card fee between R1 and R5
 * @returns Random replacement card fee in South African Rands (ZAR)
 */
export function getRandomReplacementCardFee(): number {
  return getRandomCurrency(1, 5);
}

/**
 * Returns the fixed application fee of R20
 * @returns Fixed application fee in South African Rands (ZAR)
 */
export function getRandomApplicationFee(): number {
  return 20;
}
