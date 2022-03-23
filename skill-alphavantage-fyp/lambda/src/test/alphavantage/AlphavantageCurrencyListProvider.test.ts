import { AlphavantageCurrencyListProvider } from '../../alphavantage/AlphavantageCurrencyListProvider';
import { CurrencyListProvider } from '../../model/CurrencyListProvider';

/**
 * Due to poor blob creation support in Nodejs 12 this class lacks HTTP mocking coverage for fetching CSV data from alphavantage.
 */
describe('Alphavantage currency list provider tests', () => {
  const MOCK_ENDPOINT: string = 'http://www.alphavantagemockurl.com';
  const MOCK_REJECTION_MESSAGE: string = 'Mock rejection message';

  it('Should not have data available', () => {
    const provider: CurrencyListProvider = new AlphavantageCurrencyListProvider(
      MOCK_ENDPOINT,
      MOCK_REJECTION_MESSAGE
    );
    expect(!provider.isDataAvailable);
  });
});
