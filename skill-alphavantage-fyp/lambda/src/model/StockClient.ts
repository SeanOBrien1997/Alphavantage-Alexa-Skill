import { FilteredIPOsResponse } from './alphavantage/api/FilteredIPOsResponse';
import { CurrencyVerificationResponse } from './CurrencyVerificationResponse';
import { ExchangeRate } from './ExchangeRate';
import { GlobalQuote } from './GlobalQuote';
export interface StockClient {
  getGlobalQuoteForSymbol(symbol: string): Promise<GlobalQuote>;
  getNextNInitialPublicOfferings(amount: number): Promise<FilteredIPOsResponse>;
  verifyIsCurrency(data: string): Promise<CurrencyVerificationResponse>;
  convertCurrencies(from: string, to: string): Promise<ExchangeRate>;
}
