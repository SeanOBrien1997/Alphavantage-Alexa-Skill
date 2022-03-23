import { getSlotValue, HandlerInput } from 'ask-sdk-core';
import {
  amountSlotName,
  fromCurrencySlotName,
  symbolSlotName,
  toCurrencySlotName,
} from '../constants';
import { FilteredIPOsResponse } from '../model/alphavantage/api/FilteredIPOsResponse';
import { CurrencyListProvider } from '../model/CurrencyListProvider';
import { StockClient } from '../model/StockClient';

export class SpeechFactory {
  private stockClient: StockClient;
  private digitalCurrencyListProvider: CurrencyListProvider;
  private physicalCurrencyListProvider: CurrencyListProvider;
  constructor(
    stockClient: StockClient,
    digitalCurrencyListProvider: CurrencyListProvider,
    physicalCurrencyListProvider: CurrencyListProvider
  ) {
    this.stockClient = stockClient;
    this.digitalCurrencyListProvider = digitalCurrencyListProvider;
    this.physicalCurrencyListProvider = physicalCurrencyListProvider;
  }

  async SpecificGlobalStockSymbolQuoteIntentHandlerSpeech(
    handlerInput: HandlerInput
  ): Promise<string> {
    return new Promise(async (resolve, _reject) => {
      try {
        const requestEnvelope = handlerInput.requestEnvelope;
        const symbolSlot = getSlotValue(requestEnvelope, symbolSlotName);
        const quote = await this.stockClient.getGlobalQuoteForSymbol(
          symbolSlot
        );
        const speakOutput = `You are looking for ${symbolSlot}. Here is information regarding ${symbolSlot}. The change amount is ${quote.change} and percentage change is ${quote.change_percent} for today with a high of ${quote.high} and low of ${quote.low} for ${quote.symbol}`;
        resolve(speakOutput);
      } catch (error) {
        console.log(JSON.stringify(error));
        resolve(
          'Could not retieve information for the given stock due to an error.'
        );
      }
    });
  }

  async ListNDigitalCurrenciesIntentHandlerSpeech(
    handlerInput: HandlerInput
  ): Promise<string> {
    return new Promise<string>(async (resolve) => {
      try {
        const requestEnvelope = handlerInput.requestEnvelope;
        const amountSlot = Number(
          getSlotValue(requestEnvelope, amountSlotName)
        );
        const digitalCurrenciesMap =
          await this.digitalCurrencyListProvider.getCurrenciesNamePrimaryKey();
        const keys = Array.from(digitalCurrenciesMap.keys());
        const filteredRandomlySelectedCurrencies = new Map<string, string>();
        for (let i = 0; i < amountSlot; i++) {
          const randomIndex = Math.floor(Math.random() * (keys.length + 1));
          const key = keys[randomIndex];
          const value = digitalCurrenciesMap.get(key);
          if (value) {
            filteredRandomlySelectedCurrencies.set(key, value);
          }
        }
        const details: string[] = [];
        let count = 1;
        filteredRandomlySelectedCurrencies.forEach((value, key) => {
          details.push(`Number ${count}. ${key} trading as ${value}`);
          count++;
        });
        const speakOutput: string = `Here are ${
          filteredRandomlySelectedCurrencies.size
        } random digital currencies. ${details.join('. ')}`;
        resolve(speakOutput);
      } catch (error) {
        console.log(JSON.stringify(error));
        resolve(
          'Could not retrieve information about digital currencies due to an error'
        );
      }
    });
  }

  async ListNPhysicalCurrenciesIntentHandlerSpeech(
    handlerInput: HandlerInput
  ): Promise<string> {
    return new Promise<string>(async (resolve) => {
      try {
        const requestEnvelope = handlerInput.requestEnvelope;
        const amountSlot = Number(
          getSlotValue(requestEnvelope, amountSlotName)
        );
        const physicalCurrenciesMap =
          await this.physicalCurrencyListProvider.getCurrenciesNamePrimaryKey();
        const keys = Array.from(physicalCurrenciesMap.keys());
        const filteredRandomlySelectedCurrencies = new Map<string, string>();
        for (let i = 0; i < amountSlot; i++) {
          const randomIndex = Math.floor(Math.random() * (keys.length + 1));
          const key = keys[randomIndex];
          const value = physicalCurrenciesMap.get(key);
          if (value) {
            filteredRandomlySelectedCurrencies.set(key, value);
          }
        }
        const details: string[] = [];
        let count = 1;
        filteredRandomlySelectedCurrencies.forEach((value, key) => {
          details.push(`Number ${count}. ${key} trading as ${value}`);
          count++;
        });
        const speakOutput: string = `Here are ${
          filteredRandomlySelectedCurrencies.size
        } random physical currencies. ${details.join('. ')}`;
        resolve(speakOutput);
      } catch (error) {
        console.log(JSON.stringify(error));
        resolve(
          'Could not retrieve information about physical currencies due to an error'
        );
      }
    });
  }

  async NextNIPOsIntentHandlerSpeech(
    handlerInput: HandlerInput
  ): Promise<string> {
    return new Promise<string>(async (resolve) => {
      try {
        const requestEnvelope = handlerInput.requestEnvelope;
        const amountSlot = Number(
          getSlotValue(requestEnvelope, amountSlotName)
        );
        console.log(amountSlot);

        const filteredIPOsResponse: FilteredIPOsResponse =
          await this.stockClient.getNextNInitialPublicOfferings(amountSlot);
        const details: string[] = [];
        let count = 1;
        filteredIPOsResponse.filteredIPOs.forEach((filteredIPO) => {
          details.push(
            `Number ${count}, ${filteredIPO.name} will be offered on ${filteredIPO.ipoDate}. Offered on the following exchange: ${filteredIPO.exchange}, under trading symbol ${filteredIPO.symbol}, trading currency is ${filteredIPO.currency}`
          );
          count++;
        });
        const speakOutput = `Here are ${
          filteredIPOsResponse.filteredIPOs.length
        } of the ${
          filteredIPOsResponse.total
        } IPOs expected in the next three months. You requested ${amountSlot}. ${details.join(
          '.'
        )}`;
        resolve(speakOutput);
      } catch (error) {
        console.log(JSON.stringify(error));
        resolve(
          'Could not retrieve information about upcoming IPOs due to an error'
        );
      }
    });
  }

  async ConvertCurrenciesIntentHandlerSpeech(
    handlerInput: HandlerInput
  ): Promise<string> {
    return new Promise<string>(async (resolve) => {
      try {
        const requestEnvelope = handlerInput.requestEnvelope;
        let speakOutput = '';
        console.log(requestEnvelope);

        const fromCurrencySlot: string = getSlotValue(
          requestEnvelope,
          fromCurrencySlotName
        );
        const toCurrencySlot: string = getSlotValue(
          requestEnvelope,
          toCurrencySlotName
        );

        console.log(`Converting ${fromCurrencySlot} to ${toCurrencySlot}`);

        const isFromCurrency = await this.stockClient.verifyIsCurrency(
          fromCurrencySlot
        );
        const isToCurrency = await this.stockClient.verifyIsCurrency(
          toCurrencySlot
        );
        console.log(
          `Valid from ${isFromCurrency.isCurrency} valid to ${isToCurrency.isCurrency}`
        );
        if (isFromCurrency.isCurrency && isToCurrency.isCurrency) {
          const exchangeRate = await this.stockClient.convertCurrencies(
            isFromCurrency.currencyCode,
            isToCurrency.currencyCode
          );
          console.log(exchangeRate);
          speakOutput = `The current exchange rate for ${exchangeRate.fromName} to ${exchangeRate.toName} is ${exchangeRate.rate}. The current ask price is ${exchangeRate.askPrice} and the current bid price is ${exchangeRate.bidPrice}. This information was last updated on ${exchangeRate.lastRefreshed} ${exchangeRate.timeZone}`;
        } else {
          const invalidCurrencies: string[] = [];
          if (!isFromCurrency.isCurrency) {
            invalidCurrencies.push(fromCurrencySlot);
          }
          if (!isToCurrency.isCurrency) {
            invalidCurrencies.push(toCurrencySlot);
          }
          speakOutput = `The following requested currencies could not be used ${invalidCurrencies.join(
            ' and '
          )}. Perhaps try one of the random currencies from the list commands. For more information reopen the skill and ask for help.`;
        }
        resolve(speakOutput);
      } catch (error) {
        console.log(JSON.stringify(error));
        resolve('Could not convert currencies due to an error');
      }
    });
  }
}
