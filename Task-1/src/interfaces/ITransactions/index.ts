import type { EventLog } from 'web3-types'
export interface ICustomEventReturnValues {
  from: string;
  to: string;
  _from: string;
  _to: string;
}


export interface ITransactionsParameters { addresses: string[], contractAddress: string, noYears: number }

export interface IResponse {
  message: string,
  error: boolean,
  status: number,
  results: EventLog[] | undefined
}
export interface IErrorResponse {
  message: string;
  error: boolean;
  status?: number; // Assuming status is optional and numeric
  results: undefined;
}


export interface IFilterParamters {
  addressesOfInterest: string[]
  transferEvents: EventLog[]
}