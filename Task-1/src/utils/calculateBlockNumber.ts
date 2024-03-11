// Function to estimate block number from a given date

export const EstimateBlockNumberFromDate = (targetDate: Date, currentBlockNumber: number, currentBlockTime: Date, averageBlockTime: number = 13.5): number => {
    const deltaSeconds = (currentBlockTime.getTime() - targetDate.getTime()) / 1000;
    const estimatedBlocks = deltaSeconds / averageBlockTime;
    return Math.floor(currentBlockNumber - estimatedBlocks);
};