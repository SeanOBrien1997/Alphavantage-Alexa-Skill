import { FilteredIPOsResponse } from './alphavantage/api/FilteredIPOsResponse';
import { GlobalQuote } from './GlobalQuote';
export interface StockClient {
  getGlobalQuoteForSymbol(symbol: string): Promise<GlobalQuote>;
  getNextNInitialPublicOfferings(amount: number): Promise<FilteredIPOsResponse>;
}
