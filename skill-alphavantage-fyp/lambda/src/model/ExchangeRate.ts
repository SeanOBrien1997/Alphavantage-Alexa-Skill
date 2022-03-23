/**
 * Defines the what information is returned when requesting an exhcange rate.
 */
export type ExchangeRate = {
  fromCode: string; // the starting currency symbol.
  fromName: string; // the starting currency name.
  toCode: string; // the ending currency symbol.
  toName: string; // the ending currency name.
  rate: number; // the rate for 1 starting currency to ending currency.
  lastRefreshed: string; // the timestamp for when the data was last updated.
  timeZone: string; // the time zone for the above timestamp.
  bidPrice: number; // the bid price - i.e. the max a buyer is willing to spend
  askPrice: number; // the ask price - i.e. the minimum a seller is willing to take
};
