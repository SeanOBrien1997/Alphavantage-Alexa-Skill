export interface CurrencyListProvider {
  isDataAvailable(): boolean;
  getCurrenciesNamePrimaryKey(): Promise<Map<string, string>>;
  getCurrenciesCurrencyCodePrimaryKey(): Promise<Map<string, string>>;
}
