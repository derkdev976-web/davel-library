/**
 * Utility functions for generating random currency values
 */

/**
 * Generates a random currency amount between min and max values
 * @param min - Minimum amount in dollars
 * @param max - Maximum amount in dollars
 * @param decimals - Number of decimal places (default: 2)
 * @returns Random currency amount as a number
 */
export function getRandomCurrency(min: number, max: number, decimals: number = 2): number {
  const random = Math.random() * (max - min) + min;
  return Math.round(random * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generates a random membership fee between $15 and $85
 * @returns Random membership fee
 */
export function getRandomMembershipFee(): number {
  return getRandomCurrency(15, 85);
}

/**
 * Generates a random class cost between $0 and $50
 * @returns Random class cost
 */
export function getRandomClassCost(): number {
  return getRandomCurrency(0, 50);
}

/**
 * Generates a random restoration cost between $20 and $80
 * @returns Random restoration cost
 */
export function getRandomRestorationCost(): number {
  return getRandomCurrency(20, 80);
}

/**
 * Generates a random printing cost between $0.50 and $5.00
 * @returns Random printing cost
 */
export function getRandomPrintingCost(): number {
  return getRandomCurrency(0.50, 5.00);
}

/**
 * Generates a random late fee between $0.10 and $2.00
 * @returns Random late fee
 */
export function getRandomLateFee(): number {
  return getRandomCurrency(0.10, 2.00);
}

/**
 * Generates a random maximum fine between $5 and $25
 * @returns Random maximum fine
 */
export function getRandomMaxFine(): number {
  return getRandomCurrency(5, 25);
}

/**
 * Generates a random replacement card fee between $1 and $5
 * @returns Random replacement card fee
 */
export function getRandomReplacementCardFee(): number {
  return getRandomCurrency(1, 5);
}

/**
 * Returns the fixed application fee of R80
 * @returns Fixed application fee in Rands
 */
export function getRandomApplicationFee(): number {
  return 80;
}
