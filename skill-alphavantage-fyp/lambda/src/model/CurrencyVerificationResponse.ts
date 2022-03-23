// Defines the response given when verifying if a currency is supported or not.
export type CurrencyVerificationResponse = {
  isCurrency: boolean; // Indicates true if the currency is supported.
  currencyCode: string; // contains the currency symbol i.e. EUR
};
