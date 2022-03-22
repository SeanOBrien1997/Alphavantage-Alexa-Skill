import axios from 'axios';
import { DigitalCurrencyListProvider } from '../../model/DigitalCurrencyListProvider';

export class AlphavantageDigitalCurrencyListProvider
  implements DigitalCurrencyListProvider
{
  private dataAvailable: boolean;
  private ENDPOINT: string;
  private csv: string;
  private localNameCurrencyMap: Map<string, string>;

  constructor(endpoint: string) {
    this.ENDPOINT = endpoint;
    this.dataAvailable = false;
  }

  isDataAvailable(): boolean {
    return this.dataAvailable;
  }

  async getCurrenciesNamePrimaryKey(): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>(async (resolve, reject) => {
      if (!this.isDataAvailable()) {
        await this.fetchAndFormatData();
        if (this.isDataAvailable()) {
          resolve(this.localNameCurrencyMap);
        } else {
          reject(`Unable to retrieve digital currencies from ${this.ENDPOINT}`);
        }
      }
    });
  }
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
          reject(`Unable to retrieve digital currencies from ${this.ENDPOINT}`);
        }
      }
    });
  }

  private async fetchAndFormatData() {
    await this.fetchCSV();
    this.formatCSV();
  }

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
              digitalCurrencyCodeNamePair[1],
              digitalCurrencyCodeNamePair[0]
            );
          }
        }
      });
    }
    this.localNameCurrencyMap = localNameCurrencyMap;
  }

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
