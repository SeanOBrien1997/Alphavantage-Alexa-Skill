import { AlphavantageClient } from '../../alphavantage/AlphavantageClient';
import { ALPHAVANTAGE_API_KEY } from '../../constants';
import { RealtimeCurrencyExchangeRateResponse } from '../../model/alphavantage/api/RealtimeCurrencyExchangeRateResponse';
import { MockCurrencyListProvider } from '../mocks/MockCurrencyListProvider';
import { ExchangeRate } from '../../model/ExchangeRate';
import nock from 'nock';

/**
 * Due to poor blob creation support in Nodejs 12 this class lacks HTTP mocking coverage for fetching CSV data from alphavantage.
 */
describe('Alphavantage Client Tests', () => {
  const MOCK_BASE_URL: string = 'http://www.mocktestingurlforalphavantage.com';
  const HTTP_OK: number = 200;
  const HTTP_NOT_FOUND: number = 404;
  const MOCK_PHYSICAL_CURRENCY_NAME: string = 'Euro';
  const MOCK_PHYSICAL_CURRENCY_SYMBOL: string = 'EUR';
  const MOCK_DIGITAL_CURRENCY_NAME: string = 'Bitcoin';
  const MOCK_DIGITAL_CURRENCY_SYMBOL: string = 'BTC';
  const MOCK_PHYSICAL_CURRENCY_NAME_PRIMARYKEY_MAP = new Map<string, string>([
    [MOCK_PHYSICAL_CURRENCY_NAME, MOCK_PHYSICAL_CURRENCY_SYMBOL],
  ]);
  const MOCK_PHYSICAL_CURRENCY_CODE_PRIMARYKEY_MAP = new Map<string, string>([
    [MOCK_PHYSICAL_CURRENCY_SYMBOL, MOCK_PHYSICAL_CURRENCY_NAME],
  ]);
  const MOCK_DIGITAL_CURRENCY_NAME_PRIMARYKEY_MAP = new Map<string, string>([
    [MOCK_DIGITAL_CURRENCY_NAME, MOCK_DIGITAL_CURRENCY_SYMBOL],
  ]);
  const MOCK_DIGITAL_CURRENCY_CODE_PRIMARYKEY_MAP = new Map<string, string>([
    [MOCK_DIGITAL_CURRENCY_SYMBOL, MOCK_DIGITAL_CURRENCY_NAME],
  ]);
  const MOCK_EXCHANGE_RATE: number = 100;
  const MOCK_DATE: string = '22-03-2022';
  const MOCK_TIME: string = '13:00:00';
  const MOCK_LAST_REFRESH = `${MOCK_DATE} ${MOCK_TIME}`;
  const MOCK_TIME_ZONE: string = 'UTC';
  const MOCK_BID_PRICE: number = 100;
  const MOCK_ASK_PRICE: number = 100;

  const MOCK_REALTIME_CURRENCY_EXCHANGERATE_RESPONSE: RealtimeCurrencyExchangeRateResponse =
    {
      'Realtime Currency Exchange Rate': {
        '1. From_Currency Code': MOCK_PHYSICAL_CURRENCY_SYMBOL,
        '2. From_Currency Name': MOCK_PHYSICAL_CURRENCY_NAME,
        '3. To_Currency Code': MOCK_DIGITAL_CURRENCY_SYMBOL,
        '4. To_Currency Name': MOCK_DIGITAL_CURRENCY_NAME,
        '5. Exchange Rate': MOCK_EXCHANGE_RATE,
        '6. Last Refreshed': MOCK_LAST_REFRESH,
        '7. Time Zone': MOCK_TIME_ZONE,
        '8. Bid Price': MOCK_BID_PRICE,
        '9. Ask Price': MOCK_ASK_PRICE,
      },
    };

  const MOCK_STOCK_SYMBOL: string = 'AMZN';
  const MOCK_OPENQUOTE: number = 100;
  const MOCK_HIGHQUOTE: number = 100;
  const MOCK_LOWQUOTE: number = 100;
  const MOCK_PRICEQUOTE: number = 100;
  const MOCK_VOLUMEQUOTE: number = 100;
  const MOCK_LATEST_TRADING_DAY: string = '2022-03-22';
  const MOCK_PREVIOUS_CLOSE: number = 100;
  const MOCK_CHANGE: number = 100;
  const MOCK_CHANGE_PERCENT: string = '23';

  const MOCK_GLOBALQUOTE_RESPONSE = {
    'Global Quote': {
      '01. symbol': MOCK_STOCK_SYMBOL,
      '02. open': MOCK_OPENQUOTE,
      '03. high': MOCK_HIGHQUOTE,
      '04. low': MOCK_LOWQUOTE,
      '05. price': MOCK_PRICEQUOTE,
      '06. volume': MOCK_VOLUMEQUOTE,
      '07. latest trading day': MOCK_LATEST_TRADING_DAY,
      '08. previous close': MOCK_PREVIOUS_CLOSE,
      '09. change': MOCK_CHANGE,
      '10. change percent': MOCK_CHANGE_PERCENT,
    },
  };

  const MOCK_EXCHANGE_RATE_RESPONSE: ExchangeRate = {
    askPrice: MOCK_ASK_PRICE,
    bidPrice: MOCK_BID_PRICE,
    fromCode: MOCK_PHYSICAL_CURRENCY_SYMBOL,
    fromName: MOCK_PHYSICAL_CURRENCY_NAME,
    lastRefreshed: MOCK_LAST_REFRESH,
    rate: MOCK_EXCHANGE_RATE,
    timeZone: MOCK_TIME_ZONE,
    toCode: MOCK_DIGITAL_CURRENCY_SYMBOL,
    toName: MOCK_DIGITAL_CURRENCY_NAME,
  };

  const MOCK_API_KEY: string = ALPHAVANTAGE_API_KEY;
  const MOCK_VALID_DIGITAL_CURRENCY_PROVIDER: MockCurrencyListProvider =
    new MockCurrencyListProvider(
      MOCK_DIGITAL_CURRENCY_NAME_PRIMARYKEY_MAP,
      MOCK_DIGITAL_CURRENCY_CODE_PRIMARYKEY_MAP,
      true
    );
  const MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER: MockCurrencyListProvider =
    new MockCurrencyListProvider(
      MOCK_PHYSICAL_CURRENCY_NAME_PRIMARYKEY_MAP,
      MOCK_PHYSICAL_CURRENCY_CODE_PRIMARYKEY_MAP,
      true
    );
  const MOCK_INVALID_DIGITAL_CURRENCY_PROVIDER: MockCurrencyListProvider =
    new MockCurrencyListProvider(
      MOCK_DIGITAL_CURRENCY_NAME_PRIMARYKEY_MAP,
      MOCK_DIGITAL_CURRENCY_CODE_PRIMARYKEY_MAP,
      false
    );
  const MOCK_INVALID_PHYSICAL_CURRENCY_PROVIDER: MockCurrencyListProvider =
    new MockCurrencyListProvider(
      MOCK_PHYSICAL_CURRENCY_NAME_PRIMARYKEY_MAP,
      MOCK_PHYSICAL_CURRENCY_CODE_PRIMARYKEY_MAP,
      false
    );

  afterEach(() => {
    nock.cleanAll();
  });

  it('Should convert currencies', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const scope = nock(`${MOCK_BASE_URL}`)
      .get(
        `/function=CURRENCY_EXCHANGE_RATE&from_currency=${MOCK_PHYSICAL_CURRENCY_SYMBOL}&to_currency=${MOCK_DIGITAL_CURRENCY_SYMBOL}&apikey=${MOCK_API_KEY}`
      )
      .reply(HTTP_OK, MOCK_REALTIME_CURRENCY_EXCHANGERATE_RESPONSE);
    const result = await MOCK_CLIENT.convertCurrencies(
      MOCK_PHYSICAL_CURRENCY_SYMBOL,
      MOCK_DIGITAL_CURRENCY_SYMBOL
    );
    expect(result).toStrictEqual(MOCK_EXCHANGE_RATE_RESPONSE);
    expect(scope.isDone());
  });

  it('Should not convert currencies', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_INVALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_INVALID_DIGITAL_CURRENCY_PROVIDER
    );
    const scope = nock(`${MOCK_BASE_URL}`)
      .get(
        `/function=CURRENCY_EXCHANGE_RATE&from_currency=${MOCK_PHYSICAL_CURRENCY_SYMBOL}&to_currency=${MOCK_DIGITAL_CURRENCY_SYMBOL}&apikey=${MOCK_API_KEY}`
      )
      .reply(HTTP_NOT_FOUND, 'Not found');
    try {
      await MOCK_CLIENT.convertCurrencies(
        MOCK_PHYSICAL_CURRENCY_SYMBOL,
        MOCK_DIGITAL_CURRENCY_SYMBOL
      );
    } catch (error) {
      const result = error as Error;
      expect(result.message).toBe('Request failed with status code 404');
      expect(scope.isDone());
    }
  });

  it('Should not get next N Initial IPOs', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const scope = nock(`${MOCK_BASE_URL}`)
      .get(`/function=IPO_CALENDAR&apikey=${MOCK_API_KEY}`)
      .reply(HTTP_NOT_FOUND);
    try {
      await MOCK_CLIENT.getNextNInitialPublicOfferings(2);
    } catch (error) {
      const result = error as Error;
      expect(result.message).toBe('Request failed with status code 404');
    }
    expect(scope.isDone());
  });

  it('Should get global quote for symbol', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const scope = nock(`${MOCK_BASE_URL}`)
      .get(
        `/function=GLOBAL_QUOTE&symbol=${MOCK_STOCK_SYMBOL}&apikey=${MOCK_API_KEY}`
      )
      .reply(HTTP_OK, MOCK_GLOBALQUOTE_RESPONSE);
    const result = await MOCK_CLIENT.getGlobalQuoteForSymbol(MOCK_STOCK_SYMBOL);
    expect(result.change).toBe(MOCK_CHANGE);
    expect(result.change_percent).toBe(MOCK_CHANGE_PERCENT);
    expect(result.high).toBe(MOCK_HIGHQUOTE);
    expect(result.latest_trading_day).toBe(MOCK_LATEST_TRADING_DAY);
    expect(result.low).toBe(MOCK_LOWQUOTE);
    expect(result.open).toBe(MOCK_OPENQUOTE);
    expect(result.previous_close).toBe(MOCK_PREVIOUS_CLOSE);
    expect(result.price).toBe(MOCK_PRICEQUOTE);
    expect(result.symbol).toBe(MOCK_STOCK_SYMBOL);
    expect(result.volume).toBe(MOCK_VOLUMEQUOTE);
    expect(scope.isDone());
  });

  it('Should not get global quote for symbol', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const scope = nock(`${MOCK_BASE_URL}`)
      .get(
        `/function=GLOBAL_QUOTE&symbol=${MOCK_STOCK_SYMBOL}&apikey=${MOCK_API_KEY}`
      )
      .reply(HTTP_NOT_FOUND);
    try {
      await MOCK_CLIENT.getGlobalQuoteForSymbol(MOCK_STOCK_SYMBOL);
    } catch (error) {
      const result = error as Error;
      expect(result.message).toBe('Request failed with status code 404');
      expect(scope.isDone());
    }
  });

  it('Should verify valid physical currency by name', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const result = await MOCK_CLIENT.verifyIsCurrency(
      MOCK_PHYSICAL_CURRENCY_NAME
    );
    expect(result.isCurrency);
  });

  it('Should verify valid physical currency by code', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const result = await MOCK_CLIENT.verifyIsCurrency(
      MOCK_PHYSICAL_CURRENCY_SYMBOL
    );
    expect(result.isCurrency);
  });

  it('Should verify valid digital currency by name', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const result = await MOCK_CLIENT.verifyIsCurrency(
      MOCK_DIGITAL_CURRENCY_NAME
    );
    expect(result.isCurrency);
  });

  it('Should verify valid digital currency by code', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const result = await MOCK_CLIENT.verifyIsCurrency(
      MOCK_DIGITAL_CURRENCY_SYMBOL
    );
    expect(result.isCurrency);
  });

  it('Should not verify invalid currency', async () => {
    const MOCK_CLIENT: AlphavantageClient = new AlphavantageClient(
      MOCK_API_KEY,
      MOCK_BASE_URL + '/',
      MOCK_VALID_PHYSICAL_CURRENCY_PROVIDER,
      MOCK_VALID_DIGITAL_CURRENCY_PROVIDER
    );
    const result = await MOCK_CLIENT.verifyIsCurrency(
      'INVALIDSYMBOLFORTESTINGPURPOSES'
    );
    expect(!result.isCurrency);
    expect(result.currencyCode).toBe('');
  });
});
