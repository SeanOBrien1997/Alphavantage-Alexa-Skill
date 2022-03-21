import { GlobalQuote } from '../model/GlobalQuote';
import { StockClient } from '../model/StockClient';
import { IPO } from '../model/IPO';
import { GlobalQuoteResponse } from '../model/alphavantage/api/GlobalQuoteResponse';
import axios from 'axios';
import { FilteredIPOsResponse } from '../model/alphavantage/api/FilteredIPOsResponse';

export class AlphavantageClient implements StockClient {
  private API_KEY: string;
  private BASE_URL: string;

  constructor(API_KEY: string, BASE_URL: string) {
    this.API_KEY = API_KEY;
    this.BASE_URL = BASE_URL;
  }
  async getNextNInitialPublicOfferings(
    amount: number
  ): Promise<FilteredIPOsResponse> {
    return new Promise<FilteredIPOsResponse>(async (resolve, reject) => {
      console.log(`Going to filter to first ${amount} IPOs`);
      const ENDPOINT = `${this.BASE_URL}function=IPO_CALENDAR&apikey=${this.API_KEY}`;
      const response = await axios.get(ENDPOINT, { responseType: 'blob' });
      if (response.status === 200) {
        const csv = response.data;
        console.log(csv);
        const IPOs: IPO[] = this.parseIPOCSVResponse(csv);
        const totalIPOs = IPOs.length;
        const filteredIPOs: IPO[] = [];
        let index = 0;
        while (index < totalIPOs && index < amount) {
          const ipo: IPO | undefined = IPOs.shift();
          if (ipo) {
            filteredIPOs.push(ipo);
          } else {
            break;
          }
          index++;
        }
        resolve({
          total: totalIPOs,
          filteredIPOs: filteredIPOs,
        });
      } else {
        console.log(`Rejected for reason: ${response.statusText}`);
        reject(
          `Invalid status code received when contacting Alphavantage API ${response.status}`
        );
      }
    });
  }

  async getGlobalQuoteForSymbol(symbol: string): Promise<GlobalQuote> {
    return new Promise<GlobalQuote>(async (resolve, reject) => {
      const ENDPOINT = `${this.BASE_URL}function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.API_KEY}`;
      const response = await axios.get(ENDPOINT);
      console.log(response);
      if (response.status === 200) {
        const responseData: GlobalQuoteResponse = response.data['Global Quote'];
        console.log(
          `Logging data received by alphavantage: ${JSON.stringify(
            response.data
          )}`
        );
        console.log('Logging converted response data');
        console.log(JSON.stringify(responseData));
        console.log('logging keys');
        console.log(Object.keys(responseData));
        const quote = this.parseGlobalQuoteResponseForGlobalQuote(responseData);
        resolve(quote);
      } else {
        console.log(
          `Invalid status code received when trying to fetch global quote: ${response.status}, Reason: ${response.statusText}`
        );
        reject(
          `Invalid status code received Alphavantage API: ${response.status}`
        );
      }
    });
  }

  private parseIPOCSVResponse = (csv: string): IPO[] => {
    const result: IPO[] = [];
    const lines: string[] = csv.split('\n');
    lines.shift(); // remove header line of csv
    lines.forEach((line) => {
      const values: string[] = line.split(',');
      result.push({
        symbol: values[0],
        name: values[1],
        ipoDate: values[2],
        priceRangeLow: Number(values[3]),
        priceRangeHigh: Number(values[4]),
        currency: values[5],
        exchange: values[6],
      });
    });
    return result;
  };

  /**
   *
   * @param globalQuoteResponse
   * @returns
   */
  private parseGlobalQuoteResponseForGlobalQuote = (
    globalQuoteResponse: GlobalQuoteResponse
  ): GlobalQuote => {
    const quote: GlobalQuote = {
      symbol: globalQuoteResponse['01. symbol'],
      open: globalQuoteResponse['02. open'],
      high: globalQuoteResponse['03. high'],
      low: globalQuoteResponse['04. low'],
      price: globalQuoteResponse['05. price'],
      volume: globalQuoteResponse['06. volume'],
      latest_trading_day: globalQuoteResponse['07. latest trading day'],
      previous_close: globalQuoteResponse['08. previous close'],
      change: globalQuoteResponse['09. change'],
      change_percent: globalQuoteResponse['10. change percent'],
    };
    return quote;
  };
}
