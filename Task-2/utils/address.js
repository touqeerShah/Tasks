const path = require('path');
const fs = require("fs")
const ADDRESS_PATH = path.join(__dirname, '..', 'constants', 'addresses.json');
async function updateAddress(contractName,address) {
    let fileContent;
    try {
        const data = fs.readFileSync(ADDRESS_PATH, 'utf8');
        fileContent = JSON.parse(data);
        fileContent[contractName]=address
        fs.writeFileSync(ADDRESS_PATH, JSON.stringify(fileContent, null, 4), "utf8")

    } catch (err) {
        console.error("Error reading the file:", err);
        process.exit(1);
    }

}
async function getAddress(contractName) {
    let fileContent;
    try {
        const data = fs.readFileSync(ADDRESS_PATH, 'utf8');
        fileContent = JSON.parse(data);
        return fileContent[contractName]

    } catch (err) {
        console.error("contractName address not exist :" ,contractName , err);
        process.exit(1);
    }

}

module.exports={updateAddress,getAddress}