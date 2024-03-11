import { ICustomEventReturnValues, IResponse, IFilterParamters } from "../interfaces/ITransactions"
import type { EventLog } from 'web3-types'

export const GetAllFilterTransactions =
    //middlewares will check for admin access level
    ({ transferEvents, addressesOfInterest }
        : IFilterParamters)
        : IResponse => {
        try {
            const filteredEvents = (transferEvents as EventLog[]).filter(event => {
                if (!isCustomEventReturnValues(event.returnValues)) {
                    console.error('Event returnValues do not match expected structure:', event.returnValues);
                    return false;
                }

                const fromAddress = event.returnValues.from ? event.returnValues.from : event.returnValues._from;
                const toAddress = event.returnValues.to ? event.returnValues.to : event.returnValues._to;

                return addressesOfInterest.map(addr => addr.toLowerCase()).includes(fromAddress.toLowerCase()) ||
                    addressesOfInterest.map(addr => addr.toLowerCase()).includes(toAddress.toLowerCase());
            });
            return {
                message: "Success",
                error: false,
                status: 200,
                results: filteredEvents
            }
        } catch (error: any) {
            const errorMessage: string =
                error instanceof Error ? error.message : "An unknown error occurred";
            const errorStatus: number = "status" in error ? error.status : 400;

            const response: IResponse = {
                message: errorMessage,
                error: true,
                status: errorStatus,
                results: undefined,
            };
            throw (response)
        }
    };
function isCustomEventReturnValues(obj: any): obj is ICustomEventReturnValues {
    return typeof obj.from === 'string' && typeof obj.to === 'string' || typeof obj._from === 'string' && typeof obj._to === 'string';
}
