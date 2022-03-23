import { CurrencyListProvider } from 'lambda/src/model/CurrencyListProvider';

export class MockCurrencyListProvider implements CurrencyListProvider {
  private currencyMapNamePrimaryKey: Map<string, string>;
  private currencyMapCodePrimaryKey: Map<string, string>;
  private dataAvailable: boolean;

  constructor(
    currencyMapNamePrimaryKey: Map<string, string>,
    currencyMapCodePrimaryKey: Map<string, string>,
    dataAvailable: boolean
  ) {
    this.currencyMapNamePrimaryKey = currencyMapNamePrimaryKey;
    this.currencyMapCodePrimaryKey = currencyMapCodePrimaryKey;
    this.dataAvailable = dataAvailable;
  }

  isDataAvailable(): boolean {
    return this.dataAvailable;
  }
  getCurrenciesNamePrimaryKey(): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>((resolve, reject) => {
      if (this.isDataAvailable()) {
        resolve(this.currencyMapNamePrimaryKey);
      } else {
        reject('Mock rejection');
      }
    });
  }
  getCurrenciesCurrencyCodePrimaryKey(): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>((resolve, reject) => {
      if (this.isDataAvailable()) {
        resolve(this.currencyMapCodePrimaryKey);
      } else {
        reject('Mock rejection');
      }
    });
  }
}
