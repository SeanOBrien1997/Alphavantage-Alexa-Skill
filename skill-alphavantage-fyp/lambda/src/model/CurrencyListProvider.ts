/**
 * Defines what every currency list provider must have.
 */
export interface CurrencyListProvider {
  isDataAvailable(): boolean; // indicates if currency list data is available.
  getCurrenciesNamePrimaryKey(): Promise<Map<string, string>>; // retrieves a map where the key is the name of the currency i.e. Euro and the value is the symbol i.e. EUR
  getCurrenciesCurrencyCodePrimaryKey(): Promise<Map<string, string>>; // retrieves a map where the key is the symbol of the currency i.e. EUR and the value is the name i.e. Euro
}
