import {
  ErrorHandler,
  HandlerInput,
  RequestHandler,
  SkillBuilders,
  getRequestType,
  getIntentName,
} from 'ask-sdk-core';
import { Response, SessionEndedRequest } from 'ask-sdk-model';
import { AlphavantageClient } from './alphavantage/AlphavantageClient';
import {
  ALPHAVANTAGE_BASE_URL,
  ALPHAVANTAGE_API_KEY,
  ALPHAVANTAGE_DIGITAL_CURRENCY_LIST_ENDPOINT,
  ALPHAVANTAGE_PHYSICAL_CURRENCY_LIST_ENDPOINT,
  HELP_SpecificGlobalStockSymbolQuoteIntent,
  HELP_ConvertCurrenciesIntent,
  HELP_NextNIPOsIntent,
  HELP_ListNDigitalCurrenciesIntent,
  HELP_ListNPhysicalCurrenciesIntent,
} from './constants';
import { StockClient } from './model/StockClient';
import { AlphavantageCurrencyListProvider } from './alphavantage/AlphavantageCurrencyListProvider';
import { SpeechFactory } from './util/SpeechFactory';

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

const speechFactory: SpeechFactory = new SpeechFactory(
  stockClient,
  new AlphavantageCurrencyListProvider(
    ALPHAVANTAGE_DIGITAL_CURRENCY_LIST_ENDPOINT,
    'Could not retrieve digital currencies. '
  ),
  new AlphavantageCurrencyListProvider(
    ALPHAVANTAGE_PHYSICAL_CURRENCY_LIST_ENDPOINT,
    'Could not retrieve physical currencies. '
  )
);

/**
 * Handles the initial launching of the skill.
 */
const LaunchRequestHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    console.log('Logging handler input for launch request handler');
    console.log(JSON.stringify(handlerInput));
    console.log('logging request envelope');
    console.log(JSON.stringify(handlerInput.requestEnvelope));

    return getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },

  /**
   * Informs the user that the skill has launched and prompts them for a command.
   * @param handlerInput The request metadata.
   * @returns The alexa powered response.
   */
  handle(handlerInput: HandlerInput) {
    const speakOutput =
      'Welcome to my Alphavantage powered skill, what would you like to do? For more information on what I can do say "Help" ';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * Handles the intent where a user wants to find information out about a specific stock ticker/symbol.
 */
const SpecificGlobalStockSymbolQuoteIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) ===
        'SpecificGlobalStockSymbolQuoteIntent'
    );
  },

  /**
   * Retrieves information regarding the given stock symbol slot.
   * @param handlerInput The request metadata.
   * @returns The alexa powered response.
   */
  async handle(handlerInput: HandlerInput) {
    const speakOutput =
      await speechFactory.SpecificGlobalStockSymbolQuoteIntentHandlerSpeech(
        handlerInput
      );
    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

/**
 * Handles the intent where a user wants to find information about a number of randomly selected digital currencies.
 */
const ListNDigitalCurrenciesIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) ===
        'ListNDigitalCurrenciesIntent'
    );
  },

  /**
   * Retrieves a list of digital currencies from a provider, in this case Alphavantage, and selects the amount the user
   * requested at random from this list.
   * @param handlerInput The request metadata.
   * @returns The alexa powered response.
   */
  async handle(handlerInput: HandlerInput) {
    const speakOutput =
      await speechFactory.ListNDigitalCurrenciesIntentHandlerSpeech(
        handlerInput
      );
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

/**
 * Handles the intent where a user wants to find information about a number of randomly selected physical currencies.
 */
const ListNPhysicalCurrenciesIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) ===
        'ListNPhysicalCurrenciesIntent'
    );
  },
  /**
   * Retrieves a list of physical currencies from a provider, in this case Alphavantage, and selects the amount the user
   * requested at random from this list.
   * @param handlerInput The request metadata.
   * @returns The alexa powered response.
   */
  async handle(handlerInput: HandlerInput) {
    const speakOutput =
      await speechFactory.ListNPhysicalCurrenciesIntentHandlerSpeech(
        handlerInput
      );
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

/**
 * Handles the intent where a user wants to find information regarding a number of initial public offerings (IPOs) expected in the next three months.
 */
const NextNIPOsIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'NextNIPOsIntent'
    );
  },

  /**
   * Retrieves the a list of upcoming IPOs for the next 3 months and retrieves the amount specified by the user.
   * IPOs are ordered by date on which they are being offered. i.e. An IPO tomorrow will be delivered to the user
   * before an IPO expected next month.
   * @param handlerInput The request metadata.
   * @returns The alexa powered response.
   */
  async handle(handlerInput: HandlerInput) {
    const speakOutput = await speechFactory.NextNIPOsIntentHandlerSpeech(
      handlerInput
    );
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

/**
 * Handles the intent where a user wants to convert one currency (digital/physical) to another.
 */
const ConvertCurrenciesIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'ConvertCurrenciesIntent'
    );
  },

  /**
   * Verifies that the requested slots are valid digital/physical currencies.
   * If they are informs the user about their exchange rates.
   * If not informs the user which currencies were invalid and indicates where they can find information about valid currencies.
   * @param handlerInput
   * @returns
   */
  async handle(handlerInput: HandlerInput) {
    const speakOutput =
      await speechFactory.ConvertCurrenciesIntentHandlerSpeech(handlerInput);
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

/**
 * Handles the intent where a user asks for help and then reprompts the user for input.
 */
const HelpIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },

  /**
   * Presents information about the intents offered to a user and some examples on how to use them.
   * @param handlerInput The request metadata.
   * @returns The alexa powered response.
   */
  handle(handlerInput: HandlerInput) {
    const helpMessages: string[] = [
      HELP_SpecificGlobalStockSymbolQuoteIntent,
      HELP_ConvertCurrenciesIntent,
      HELP_NextNIPOsIntent,
      HELP_ListNDigitalCurrenciesIntent,
      HELP_ListNPhysicalCurrenciesIntent,
    ];
    const speakOutput = `You can do the following, ${helpMessages.join(
      '.\n'
    )}.\n To hear this message again just say "Help".`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * Handles when a user interupts an intent and shuts down the skill.
 */
const CancelAndStopIntentHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    );
  },
  /**
   * Informs the user that the skill is shutting down.
   * @param handlerInput
   * @returns The alexa powered response.
   */
  handle(handlerInput: HandlerInput) {
    const speakOutput =
      'Goodbye and thanks for using my Alphavantage powered skill!';
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

/**
 * Handles the shutting down of the skill.
 */
const SessionEndedRequestHandler: RequestHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return (
      getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest'
    );
  },
  /**
   * Logs some information to Lambda regarding the shutdown reason.
   * @param handlerInput
   * @returns No speech returned with this alexa response.
   */
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
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
  canHandle(handlerInput: HandlerInput) {
    return getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput: HandlerInput) {
    const intentName = getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler: ErrorHandler = {
  /**
   * Checks if this handler can serve the incoming request.
   * @param handlerInput The request metadata.
   * @returns A boolean that is true if the handler can serve the request.
   */
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
