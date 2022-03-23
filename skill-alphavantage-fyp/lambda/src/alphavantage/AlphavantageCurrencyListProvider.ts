import axios from 'axios';
import { CurrencyListProvider } from '../model/CurrencyListProvider';

export class AlphavantageCurrencyListProvider implements CurrencyListProvider {
  private dataAvailable: boolean;
  private ENDPOINT: string;
  private csv: string;
  private localNameCurrencyMap: Map<string, string>;
  private rejectMessage: string;

  constructor(endpoint: string, rejectMessage: string) {
    this.ENDPOINT = endpoint;
    this.rejectMessage = rejectMessage;
    this.dataAvailable = false;
  }

  /**
   * Indicates if list data is available
   * @returns A boolean that is true if the list data is available, false otherwise.
   */
  isDataAvailable(): boolean {
    return this.dataAvailable;
  }

  /**
   * Retreives a list of the supported currencies where the key is the name of the currency i.e Euro and the value is the symbol i.e EUR
   * @returns A promise that resolves to the map containing the currencies and rejects if the data could not be retrieved
   */
  async getCurrenciesNamePrimaryKey(): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>(async (resolve, reject) => {
      if (!this.isDataAvailable()) {
        await this.fetchAndFormatData();
        if (this.isDataAvailable()) {
          resolve(this.localNameCurrencyMap);
        } else {
          reject(`${this.rejectMessage} from ${this.ENDPOINT}`);
        }
      } else {
        resolve(this.localNameCurrencyMap);
      }
    });
  }

  /**
   * Retreives a list of the supported currencies where the key is the name of the currency i.e Euro and the value is the symbol i.e EUR.
   * @returns A promise that resolves to the map containing the currencies and rejects if the data could not be retrieved
   */
  async getCurrenciesCurrencyCodePrimaryKey(): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>(async (resolve, reject) => {
      if (!this.isDataAvailable()) {
        await this.fetchAndFormatData();
        if (this.isDataAvailable()) {
          const result = new Map<string, string>();
          this.localNameCurrencyMap.forEach((value, key) => {
            result.set(value, key);
          });
          resolve(result);
        } else {
          reject(`${this.rejectMessage} from ${this.ENDPOINT}`);
        }
      } else {
        const result = new Map<string, string>();
        this.localNameCurrencyMap.forEach((value, key) => {
          result.set(value, key);
        });
        resolve(result);
      }
    });
  }

  /**
   * Calls the Alphavantage API to retrieve CSV containing currency information and formats that CSV data into a map.
   */
  private async fetchAndFormatData() {
    await this.fetchCSV();
    this.formatCSV();
  }

  /**
   * Utility function that formats the cached CSV data if it is available.
   */
  private formatCSV() {
    let localNameCurrencyMap: Map<string, string> = new Map();
    if (!this.isDataAvailable()) {
      console.log('No data fetched to format.');
    } else {
      const csv = this.csv;
      const lines: string[] = csv.split('\n');
      lines.shift();
      lines.forEach((line) => {
        const digitalCurrencyCodeNamePair: string[] = line.split(',');
        if (
          digitalCurrencyCodeNamePair[0] !== undefined &&
          digitalCurrencyCodeNamePair[1] !== undefined
        ) {
          if (
            digitalCurrencyCodeNamePair[0].length > 0 &&
            digitalCurrencyCodeNamePair[1].length > 0
          ) {
            localNameCurrencyMap.set(
              digitalCurrencyCodeNamePair[1].toUpperCase().trim(),
              digitalCurrencyCodeNamePair[0].toUpperCase().trim()
            );
          }
        }
      });
    }
    this.localNameCurrencyMap = localNameCurrencyMap;
  }

  /**
   * Retrieves the CSV data from the Alphavantage endpoint and caches it. Updates the data availability flag.
   */
  private async fetchCSV() {
    const response = await axios.get(this.ENDPOINT, { responseType: 'blob' });
    if (response.status === 200) {
      const csv = response.data;
      this.csv = csv;
      this.dataAvailable = true;
    } else {
      this.dataAvailable = false;
    }
  }
}
