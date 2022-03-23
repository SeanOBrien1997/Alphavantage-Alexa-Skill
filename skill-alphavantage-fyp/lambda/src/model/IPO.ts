/**
 * Defines information returned when requesting IPOs
 */
export type IPO = {
  symbol: string; // the IPO symbol/ticker
  name: string; // the IPO name
  ipoDate: string; // the date that the offering is expected to take place
  priceRangeLow: number; // the expected low range for the IPO
  priceRangeHigh: number; // the expected high range for the IPO
  currency: string; // the currency that the IPO will trade in
  exchange: string; // the exchange that the IPO will trade on
};
