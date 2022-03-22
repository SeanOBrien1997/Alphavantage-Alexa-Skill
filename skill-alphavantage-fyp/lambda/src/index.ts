// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.

import {
  ErrorHandler,
  HandlerInput,
  RequestHandler,
  SkillBuilders,
  getRequestType,
  getIntentName,
  getSlotValue,
} from 'ask-sdk-core';
import { Response, SessionEndedRequest } from 'ask-sdk-model';
import { AlphavantageClient } from './alphavantage/AlphavantageClient';
import {
  ALPHAVANTAGE_BASE_URL,
  ALPHAVANTAGE_API_KEY,
  ALPHAVANTAGE_DIGITAL_CURRENCY_LIST_ENDPOINT,
  ALPHAVANTAGE_PHYSICAL_CURRENCY_LIST_ENDPOINT,
  amountSlotName,
  fromCurrencySlotName,
  symbolSlotName,
  toCurrencySlotName,
} from './constants';
import { FilteredIPOsResponse } from './model/alphavantage/api/FilteredIPOsResponse';
import { CurrencyListProvider } from './model/CurrencyListProvider';
import { StockClient } from './model/StockClient';
import { AlphavantageCurrencyListProvider } from './alphavantage/AlphavantageCurrencyListProvider';

const stockClient: StockClient = new AlphavantageClient(
  ALPHAVANTAGE_API_KEY,
  ALPHAVANTAGE_BASE_URL,
  new AlphavantageCurrencyListProvider(
    ALPHAVANTAGE_PHYSICAL_CURRENCY_LIST_ENDPOINT,
    'Could not retrieve physical currency list'
  ),
  new AlphavantageCurrencyListProvider(
    ALPHAVANTAGE_DIGITAL_CURRENCY_LIST_ENDPOINT,
    'Could not retrieve digital currency list'
  )
);

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    console.log('Logging handler input for launch request handler');
    console.log(JSON.stringify(handlerInput));
    console.log('logging request envelope');
    console.log(JSON.stringify(handlerInput.requestEnvelope));

    return getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput: HandlerInput) {
    const speakOutput =
      'Welcome to the Alphavantage skill, what would you like to do?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const HelloWorldIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent'
    );
  },
  handle(handlerInput: HandlerInput) {
    const speakOutput = 'Hello World!';
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
const SpecificGlobalStockSymbolQuoteIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) ===
        'SpecificGlobalStockSymbolQuoteIntent'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const symbolSlot = getSlotValue(requestEnvelope, symbolSlotName);

    const quote = await stockClient.getGlobalQuoteForSymbol(symbolSlot);
    const speakOutput = `Hello from the stock quote handler! You are looking for ${symbolSlot}. Here is information regarding the change amount ${quote.change} and percentage ${quote.change_percent} for today with a high of ${quote.high} and low of ${quote.low} for ${quote.symbol}`;
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const ListNDigitalCurrenciesIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) ===
        'ListNDigitalCurrenciesIntent'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const amountSlot = Number(getSlotValue(requestEnvelope, amountSlotName));
    const digitalCurrencyListProvider: CurrencyListProvider =
      new AlphavantageCurrencyListProvider(
        ALPHAVANTAGE_DIGITAL_CURRENCY_LIST_ENDPOINT,
        'Unable to retrieve digital currencies'
      );
    const digitalCurrenciesMap =
      await digitalCurrencyListProvider.getCurrenciesNamePrimaryKey();
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
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const ListNPhysicalCurrenciesIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) ===
        'ListNPhysicalCurrenciesIntent'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const amountSlot = Number(getSlotValue(requestEnvelope, amountSlotName));
    const digitalCurrencyListProvider: CurrencyListProvider =
      new AlphavantageCurrencyListProvider(
        ALPHAVANTAGE_PHYSICAL_CURRENCY_LIST_ENDPOINT,
        'Unable to retrieve physical currencies'
      );
    const physicalCurrenciesMap =
      await digitalCurrencyListProvider.getCurrenciesNamePrimaryKey();
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
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const NextNIPOsIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'NextNIPOsIntent'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    const amountSlot = Number(getSlotValue(requestEnvelope, amountSlotName));
    console.log(amountSlot);

    const filteredIPOsResponse: FilteredIPOsResponse =
      await stockClient.getNextNInitialPublicOfferings(amountSlot);
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
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const ConvertCurrenciesIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'ConvertCurrenciesIntent'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const requestEnvelope = handlerInput.requestEnvelope;
    let speakOutput = 'Hello World from conversion handler!';
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

    const isFromCurrency = await stockClient.verifyIsCurrency(fromCurrencySlot);
    const isToCurrency = await stockClient.verifyIsCurrency(toCurrencySlot);
    console.log(
      `Valid from ${isFromCurrency.isCurrency} valid to ${isToCurrency.isCurrency}`
    );
    if (isFromCurrency.isCurrency && isToCurrency.isCurrency) {
      const exchangeRate = await stockClient.convertCurrencies(
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
      )}`;
    }

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput: HandlerInput) {
    const speakOutput = 'You can say hello to me! How can I help?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput: HandlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
    );
  },
  handle(handlerInput: HandlerInput): Response {
    // Any cleanup logic goes here.
    console.log(
      `Session ended with reason: ${
        (handlerInput.requestEnvelope.request as SessionEndedRequest).reason
      }`
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput: HandlerInput) {
    const intentName = getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler: ErrorHandler = {
  canHandle(handlerInput: HandlerInput, error: Error) {
    console.log(JSON.stringify(handlerInput));
    console.error(error);
    return true;
  },
  handle(handlerInput: HandlerInput, error: Error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    SpecificGlobalStockSymbolQuoteIntentHandler,
    NextNIPOsIntentHandler,
    ListNDigitalCurrenciesIntentHandler,
    ListNPhysicalCurrenciesIntentHandler,
    ConvertCurrenciesIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
