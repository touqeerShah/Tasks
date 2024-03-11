import { check } from 'express-validator';

export const validateTransactionsParameters = [
    // Validate 'addresses' as an array and ensure it is not empty
    check('addresses')
        .not()
        .isEmpty()
        .withMessage('addresses is required')
        .isArray()
        .withMessage('addresses must be an array')
        .custom((value) => value.length > 0)
        .withMessage('addresses array cannot be empty')
        .bail() // Stop running validations if any of the previous ones have failed
        .custom((addresses) => 
            addresses.every((address:string) => /^0x[a-fA-F0-9]{40}$/.test(address))
        )
        .withMessage('All addresses must be valid Ethereum addresses'),

    // Validate 'contractAddress' ensuring it is not empty and is a valid Ethereum address
    check('contractAddress')
        .not()
        .isEmpty()
        .withMessage('contractAddress is required')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('contractAddress must be a valid Ethereum address'),

    // Validate 'noYears' ensuring it is a number and optionally enforcing a range if needed
    check('noYears')
        .not()
        .isEmpty()
        .withMessage('noYears is required')
        .isInt({ min: 1 })
        .withMessage('noYears must be an integer greater than 0'),
];
