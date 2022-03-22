export interface DigitalCurrencyListProvider {
  isDataAvailable(): boolean;
  getCurrenciesNamePrimaryKey(): Promise<Map<string, string>>;
  getCurrenciesCurrencyCodePrimaryKey(): Promise<Map<string, string>>;
}
