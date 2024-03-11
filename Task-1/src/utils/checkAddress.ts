import Web3 from 'web3';

export async function isContractAddress(web3:Web3,address:string):Promise<boolean> {
    const code = await web3.eth.getCode(address);
    return code !== '0x' && code !== '0x0';
}