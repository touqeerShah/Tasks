import TransactionsRoutes from "./Transactions";

import express from "express";
const router = express.Router();

router.use("/transactions", TransactionsRoutes);



export { router };