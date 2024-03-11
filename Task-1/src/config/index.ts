import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path  from 'path';

import { IConfig } from '../interfaces/IConfig';
const abiPath = path.join(__dirname, '.', 'abi.json');

// Load environment variables from .env file
dotenv.config();



// Define configurations for different environments
const config: IConfig = {
    ABI:fs.readFileSync(abiPath, 'utf-8'),
    NODE_ENDPOINT:process.env.NODE_URL || "http://localhost:8545",
};

// Get the configuration based on the current environment

export { config }