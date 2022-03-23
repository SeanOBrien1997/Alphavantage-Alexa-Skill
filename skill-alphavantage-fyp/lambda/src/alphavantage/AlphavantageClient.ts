import { GlobalQuote } from '../model/GlobalQuote';
import { StockClient } from '../model/StockClient';
import { IPO } from '../model/IPO';
import { GlobalQuoteResponse } from '../model/alphavantage/api/GlobalQuoteResponse';
import { FilteredIPOsResponse } from '../model/alphavantage/api/FilteredIPOsResponse';
import { CurrencyListProvider } from '../model/CurrencyListProvider';
import { CurrencyVerificationResponse } from '../model/CurrencyVerificationResponse';
import axios from 'axios';
import { ExchangeRate } from '../model/ExchangeRate';
import { RealtimeCurrencyExchangeRateResponse } from '../model/alphavantage/api/RealtimeCurrencyExchangeRateResponse';

export class AlphavantageClient implements StockClient {
  private API_KEY: string; // The API key to be used with Alphavantage API
  private BASE_URL: string; // The base URL to use when calling the API
  private physicalCurrencyListProvider: CurrencyListProvider; // The provider of the list of supported physical currencies
  private digitalCurrencyListProvider: CurrencyListProvider; // The provider of the list of supported digital currencies

  constructor(
    API_KEY: string,
    BASE_URL: string,
    physicalCurrencyListProvider: CurrencyListProvider,
    digitalCurrencyListProvider: CurrencyListProvider
  ) {
    this.API_KEY = API_KEY;
    this.BASE_URL = BASE_URL;
    this.physicalCurrencyListProvider = physicalCurrencyListProvider;
    this.digitalCurrencyListProvider = digitalCurrencyListProvider;
  }
  /**
   * Uses the Alphavantage API to convert two currencies.
   * Currently the API supports conversion between all currency types (Both physical and digital).
   * @param fromCode The code representing the starting currency.
   * @param toCode The code representing the target currency.
   * @returns A promise that resolves with the exchange rate data and rejects if the data cannot be retrieved.
   */
  convertCurrencies(fromCode: string, toCode: string): Promise<ExchangeRate> {
    return new Promise<ExchangeRate>(async (resolve, reject) => {
      const ENDPOINT = `${this.BASE_URL}function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCode}&to_currency=${toCode}&apikey=${this.API_KEY}`;
      try {
        const response = await axios.get(ENDPOINT);
        if (response.status === 200) {
          const data: RealtimeCurrencyExchangeRateResponse = response.data;
          console.log('Logging exchange rate data');
          console.log(data);
          resolve({
            fromCode:
              data['Realtime Currency Exchange Rate']['1. From_Currency Code'],
            fromName:
              data['Realtime Currency Exchange Rate']['2. From_Currency Name'],
            toCode:
              data['Realtime Currency Exchange Rate']['3. To_Currency Code'],
            toName:
              data['Realtime Currency Exchange Rate']['4. To_Currency Name'],
            rate: data['Realtime Currency Exchange Rate']['5. Exchange Rate'],
            lastRefreshed:
              data['Realtime Currency Exchange Rate']['6. Last Refreshed'],
            timeZone: data['Realtime Currency Exchange Rate']['7. Time Zone'],
            bidPrice: data['Realtime Currency Exchange Rate']['8. Bid Price'],
            askPrice: data['Realtime Currency Exchange Rate']['9. Ask Price'],
          });
        } else {
          reject(
            `Invalid response received by Alphavantage API ${response.status}, reason: ${response.statusText}`
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Uses Alphavantage API to retrieve the upcoming IPOs and filters for the desired amount.
   * @param amount The amount of IPOs to attempt to retrieve.
   * @returns A promise that resolves to information regarding the IPOs retrieved and rejects if the IPOs could not be retrieved from the API.
   */
  async getNextNInitialPublicOfferings(
    amount: number
  ): Promise<FilteredIPOsResponse> {
    return new Promise<FilteredIPOsResponse>(async (resolve, reject) => {
      console.log(`Going to filter to first ${amount} IPOs`);
      const ENDPOINT = `${this.BASE_URL}function=IPO_CALENDAR&apikey=${this.API_KEY}`;
      try {
        const response = await axios.get(ENDPOINT, { responseType: 'blob' });
        if (response.status === 200) {
          const csv = response.data;
          console.log(csv);
          const IPOs: IPO[] = this.parseIPOCSVResponse(csv);
          let totalIPOs = IPOs.length;
          console.log('total ipos');
          console.log(totalIPOs);
          const filteredIPOs: IPO[] = [];
          let index = 0;
          while (index < totalIPOs && index < amount) {
            const ipo: IPO | undefined = IPOs.shift();
            if (typeof ipo !== 'undefined') {
              if (ipo.name !== undefined) {
                console.log(`Pushing ${ipo.symbol}`);
                filteredIPOs.push(ipo);
              } else {
                totalIPOs--;
              }
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
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Uses Alphavantage API to retrieve information regarding a stock.
   * @param symbol The symbol/ticker for the stock.
   * @returns A promise that resolves with information regarding the stock and rejects if the stock information could not be retrieved from the API.
   */
  async getGlobalQuoteForSymbol(symbol: string): Promise<GlobalQuote> {
    return new Promise<GlobalQuote>(async (resolve, reject) => {
      const ENDPOINT = `${this.BASE_URL}function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.API_KEY}`;
      try {
        const response = await axios.get(ENDPOINT);
        console.log(response);
        if (response.status === 200) {
          const responseData: GlobalQuoteResponse =
            response.data['Global Quote'];
          console.log(
            `Logging data received by alphavantage: ${JSON.stringify(
              response.data
            )}`
          );
          console.log('Logging converted response data');
          console.log(JSON.stringify(responseData));
          console.log('logging keys');
          console.log(Object.keys(responseData));
          const quote =
            this.parseGlobalQuoteResponseForGlobalQuote(responseData);
          resolve(quote);
        } else {
          console.log(
            `Invalid status code received when trying to fetch global quote: ${response.status}, Reason: ${response.statusText}`
          );
          reject(
            `Invalid status code received Alphavantage API: ${response.status}`
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verifies if a given symbol or stock name is supported.
   * @param data The symbol or stock name to check.
   * @returns A promise that resolves with information containing the validity of the given stock name/symbol.
   */
  async verifyIsCurrency(data: string): Promise<CurrencyVerificationResponse> {
    return new Promise<CurrencyVerificationResponse>(
      async (resolve, _reject) => {
        console.log('Fetching currency lists');
        const physicalCurrencyListByName =
          await this.physicalCurrencyListProvider.getCurrenciesNamePrimaryKey();
        console.log(physicalCurrencyListByName);
        const physicalCurrencyListByCode =
          await this.physicalCurrencyListProvider.getCurrenciesCurrencyCodePrimaryKey();
        console.log(physicalCurrencyListByCode);
        const digitalCurrencyListByName =
          await this.digitalCurrencyListProvider.getCurrenciesNamePrimaryKey();
        console.log(digitalCurrencyListByName);
        const digitalCurrencyListByCode =
          await this.digitalCurrencyListProvider.getCurrenciesCurrencyCodePrimaryKey();
        console.log(digitalCurrencyListByCode);
        console.log('Fetched');
        console.log(`Searching for ${data.toUpperCase()}`);
        const search: string = data.toUpperCase();
        if (
          physicalCurrencyListByCode.has(search) ||
          digitalCurrencyListByCode.has(search)
        ) {
          resolve({
            isCurrency: true,
            currencyCode: search,
          });
        } else if (physicalCurrencyListByName.has(search)) {
          const result = physicalCurrencyListByName.get(search);
          if (result) {
            resolve({
              isCurrency: true,
              currencyCode: result,
            });
          }
        } else if (digitalCurrencyListByName.has(search)) {
          const result = digitalCurrencyListByName.get(search);
          if (result) {
            resolve({
              isCurrency: true,
              currencyCode: result,
            });
          }
        } else {
          resolve({
            isCurrency: false,
            currencyCode: '',
          });
        }
      }
    );
  }

  /**
   * Parses IPOs csv
   * @param csv The IPO csv to parse
   * @returns An array of IPOs
   */
  private parseIPOCSVResponse = (csv: string): IPO[] => {
    const result: IPO[] = [];
    const lines: string[] = csv.split('\n');
    console.log('lines before shift');
    console.log(lines);
    lines.shift(); // remove header line of csv
    console.log('lines after');
    console.log(lines);
    lines.forEach((line) => {
      const values: string[] = line.split(',');
      console.log('splitting current line');
      console.log(line);
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
   * Parses the API response to retrieve relevant stock information.
   * @param globalQuoteResponse The API response to parse.
   * @returns The GlobalQuote containing the stock information.
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
