import Web3 from 'web3';
import type { EventLog } from 'web3-types'
import { GetAllFilterTransactions } from "./../utils/filterTransactions"
import { EstimateBlockNumberFromDate } from "./../utils/calculateBlockNumber"
import { IResponse, IErrorResponse, ITransactionsParameters } from "./../interfaces/ITransactions"
import { isContractAddress } from "./../utils/checkAddress"
import { config } from "./../config"
// Connect to your Ethereum node


// Initialize the BAR token contract

export const GetTransactions = (async ({ addresses, contractAddress, noYears }
    : ITransactionsParameters): Promise<IResponse | IErrorResponse> => {
    try {
        // console.log("GetTransactions", contractAddress)
        const web3 = new Web3(config.NODE_ENDPOINT);

        // Addresses of interest
        const isContract: boolean = await isContractAddress(web3, contractAddress)
        // console.log("isContract", isContract)

        if (isContract) {
            const BAR_TOKEN_ADDRESS = contractAddress;
            const BAR_TOKEN_ABI = config.ABI;
            const barToken = new web3.eth.Contract(JSON.parse(BAR_TOKEN_ABI), BAR_TOKEN_ADDRESS);

            const addressesOfInterest = addresses.map(addr => web3.utils.toChecksumAddress(addr));
            const startDate = new Date(Date.now() - 365 * noYears * 24 * 60 * 60 * 1000);

            // Fetch current block details for time and number
            const currentBlock: any = await web3.eth.getBlock('latest');
            const currentBlockNumber = currentBlock.number;
            // Convert BigInt to Number explicitly for timestamp calculation
            // Make sure the value is within the safe range for JavaScript numbers
            const currentBlockTime = new Date(Number(currentBlock.timestamp) * 1000);

            // Estimate the start block from startDate
            const startBlock = EstimateBlockNumberFromDate(startDate, Number(currentBlockNumber), currentBlockTime);

            // Fetch Transfer events from startBlock to the latest block
            // console.log("14790683: ",currentBlockNumber)
            
            const transferEvents = await barToken.getPastEvents('Transfer', {
                fromBlock: startBlock,
                toBlock: 'latest'
            });



            // Filter events for the specified addresses

            let response: Partial<IResponse> = {}
            const eventLogsOnly: EventLog[] = transferEvents.filter((event): event is EventLog => typeof event !== 'string');
            if (eventLogsOnly.length > 0) {
                // console.log(transferEvents)

                response = GetAllFilterTransactions({ addressesOfInterest, transferEvents: eventLogsOnly });
            }
            // Print filtered events
            if (!response.message) {
                response.message = "Default message or some error message"; // Provide a default or error message
            }
            return response as IResponse;
        } else {
            return {
                message: "Invalid Contract Address",
                error: true,
                status: 404,
                results: undefined,
            };
        }
    } catch (error: any) {
        const errorMessage: string = error instanceof Error ? error.message : 'An unknown error occurred';
        const errorStatus: number | undefined = 'status' in error ? error.status : undefined;

        const response: IErrorResponse = {
            message: errorMessage,
            error: true,
            status: errorStatus,
            results: undefined,
        };

        return response;
    }
});


