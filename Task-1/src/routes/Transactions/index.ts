import express, { Request, Response } from "express";
import { TransactionsAPIRequest } from '../../controllers/Transactions/';
const { oneOf, check } = require('express-validator');


import {
    validateTransactionsParameters,    
} from "../../middlewares/validators/transactions.validators";




const router = express.Router();



router.post("/transactionAPIRequest", validateTransactionsParameters, TransactionsAPIRequest)


export default router;