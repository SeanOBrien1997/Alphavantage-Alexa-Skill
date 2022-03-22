export type ExchangeRate = {
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  rate: number;
  lastRefreshed: string;
  timeZone: string;
  bidPrice: number;
  askPrice: number;
};
