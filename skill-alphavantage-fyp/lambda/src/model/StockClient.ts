import { FilteredIPOsResponse } from './alphavantage/api/FilteredIPOsResponse';
import { CurrencyVerificationResponse } from './CurrencyVerificationResponse';
import { ExchangeRate } from './ExchangeRate';
import { GlobalQuote } from './GlobalQuote';
/**
 * Defines the functionality that must be supported by all stock clients.
 */
export interface StockClient {
  getGlobalQuoteForSymbol(symbol: string): Promise<GlobalQuote>; // Retrieves stock information about the given symbol
  getNextNInitialPublicOfferings(amount: number): Promise<FilteredIPOsResponse>; // Retrieves the next n IPOs.
  verifyIsCurrency(data: string): Promise<CurrencyVerificationResponse>; // verifies if a currency is valid for this client.
  convertCurrencies(from: string, to: string): Promise<ExchangeRate>; // converts two currencies
}
