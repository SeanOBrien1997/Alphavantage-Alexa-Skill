/**
 * Represents the information returned when requesting information about a stock
 */
export type GlobalQuote = {
  symbol: string; // the symbol/ticker for the stock
  open: number; // the opening price for the stock
  high: number; // the highest price the stock has reached today
  low: number; // the lowest price the stock has reached today
  price: number; // the stocks current price
  volume: number; // the number of shares traded today
  latest_trading_day: string; // the last day the stock was traded
  previous_close: number; // the last closing price for the stock
  change: number; // the change in value of the stock
  change_percent: string; // the change in value of the stock represented as a percentage
};
