import "reflect-metadata";

import { Request, Response, NextFunction } from "express";
import { validationResult } from 'express-validator';

import {
    ITransactionsParameters,
    IResponse,
    IErrorResponse,
} from "../../interfaces/ITransactions";

import { GetTransactions } from "../../services/transaction.service";
const JSONbig = require('json-bigint')({ storeAsString: true });

import * as _ from "lodash";

export async function TransactionsAPIRequest(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // console.log("NotificationsAPIRequest");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If there are errors, return a 400 response with the errors
        return res.status(400).json({ errors: errors.array() });
    }
    const contractAddress = _.get(req.body, "contractAddress", "");
    const addresses = _.get(req.body, "addresses", []);
    const noYears = _.get(req.body, "noYears", "");
    const functionName = _.get(req.body, "functionName", "");

    // console.log("functionName", functionName);


    try {
        let response: Partial<IResponse> = {};
        if (functionName)
            switch (functionName) {
                case "GetTransactions":
                    response = await GetTransactions({
                        addresses,
                        contractAddress,
                        noYears,
                    } as ITransactionsParameters);
                    break;

                default:
                    res
                        .status(400)
                        .send({
                            message: "Invalid Function Name",
                            error: true,
                            company: undefined,
                        });
            }
        else {
            res
                .status(400)
                .send({
                    message: "Invalid Function Name",
                    error: true,
                    company: undefined,
                });
        }

        if (response  && response.error) {
            res.status(400).send(response);
        } else {
            if (response.results) {
                response.results = response.results.map(item => ({
                    ...item,
                    blockNumber: item.blockNumber ? item.blockNumber.toString() : '0',
                    logIndex: item.logIndex ? item.logIndex.toString() : '0',
                    transactionIndex: item.transactionIndex ? item.transactionIndex.toString() : '0',
                }));
            }
            res.type('json').send(JSONbig.stringify(response)); // Ensure correct content type
        }
    } catch (error: any) {
        // console.log("error",error)
        const errorMessage: string =
            error instanceof Error ? error.message : "An unknown error occurred";
        const errorStatus: number = "status" in error ? error.status : 400;

        const response: IErrorResponse = {
            message: errorMessage,
            error: true,
            status: errorStatus,
            results: undefined,
        };

        res.status(errorStatus).send(response);
    }
}
