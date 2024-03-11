# Ethereum Node Setup and Transaction Tracking

## Challenge: Tracking BAR Token (ERC20) Transfers

### Objective

Company’s stakeholders want to get a list of all BAR token (ERC20) transfers where the from OR
the to is part of a given list and have happened over the last X years.

Write a code snippet in your preferred language without using a 3rd party provider (like Alchemy, Moralis, ...).
Then describe how you could improve your code by using a modern approach and keeping in mind security,
scalability, maintainability, speed, use of 3rd party tools, etc.

### Solution Overview

1. **Setup an Ethereum Node**: Choose between Full Node or Archive Node based on the requirement to access historical transaction data or events.

2. **Integrate with a NodeJS App**: Develop an application to interact with the Ethereum node.

3. **Environment Configuration**: Update necessary environment variables.

4. **API Implementation**:
   - Calculate the block number based on time.
   - Verify the contract address.
   - Retrieve and index all contract transfer events.
   - Filter transactions based on given addresses and return the results.

### Detailed Steps

#### Setting Up an Ethereum Node

- **Options**:
  - Docker: Utilize pre-built images for `Geth` and `Prysm`.
  - Local Installation: Direct installation on the machine.

- **Tools Required**:
  - Docker and Docker Compose (for Docker setup).
  - Geth and Prysm (for local setup).

##### Docker Setup

- **Preparation**: Install Docker and Docker Compose based on your operating system.
- **Execution**: Run the following command to start the node using Docker Compose.

```bash
  docker-compose -f compose/docker-compose.yaml up -d

```
### Local Installation Guide

To install locally, follow the steps provided below for both Geth and Prysm.

#### Install Geth

1. Navigate to the Geth installation guide: [Installing Geth](https://geth.ethereum.org/docs/getting-started/installing-geth).

#### Install Prysm

1. Follow the Prysm installation instructions provided here: [Install Prysm with Script](https://docs.prylabs.network/docs/install/install-with-script).

### Running the Setup

After installation, you can run or set up Geth and Prysm using the commands provided below.

#### Geth Setup

To run Geth, use the following command:

```bash
geth --mainnet \
     --datadir "/data/ethereum" \
     --http --authrpc.addr localhost \
     --authrpc.vhosts="localhost" \
     --authrpc.port 8551 \
     --authrpc.jwtsecret=/path/to/jwtsecret

```
This command configures Geth to run on the mainnet, specifies the data directory, enables HTTP RPC server, sets the listening address and vhosts for the RPC server, defines the port, and specifies the path to the jwtsecret file.

#### Prysm Setup
To run the Prysm beacon-chain, use the command below:
``` bash
./prysm.sh beacon-chain --execution-endpoint=http://localhost:8551 \
                        --goerli \
                        --jwt-secret=<PATH-FROM-LOCAL-MACHINE>/jwtsecret \
                        --checkpoint-sync-url=https://goerli.beaconstate.info \
                        --genesis-beacon-api-url=https://goerli.beaconstate.info

```
This command runs the Prysm beacon-chain connected to the Geth node at localhost:8551, specifies the jwt-secret file, and sets URLs for checkpoint sync and genesis beacon API for the Goerli testnet.

> Please make sure to replace `<PATH-FROM-LOCAL-MACHINE>` with the actual path to your jwtsecret file on your local machine.





### Run Node Server

It is simple application with `REST API` which later connect with blockchain node get data and process it.To Run it you just need `NodeJS` install local.

Run Following command will start server
##### ENV
befor start update the endpoint of NODE in .env file

```
NODE_URL="http://localhost:8551"
```
```
npm install
npx tsc
# Start the application
node ./dist/app.js
```

##### Parameters

- Addresses: It is `array` of string you can pass address of `from` or `to` both in it  
- Contract Address : In our case it will be `BAR Token` Address.
- noYears : It's it type number of year you want to see back in blockchain

##### Call API Request

``` javascript
curl --location 'http://localhost:8081/api/transactions/transactionAPIRequest' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'addresses%5B0%5D=0x7A3033472D5304cB108c6094A08f55946fC12851' \
--data-urlencode 'addresses%5B1%5D=0x73139d114937c5821D9e3bbDee3a68312c7Be5d1' \
--data-urlencode 'contractAddress=0x4855eF04b4eefC2EA79eD5b40275A2900CD5aA58' \
--data-urlencode 'noYears=3' \
--data-urlencode 'functionName=GetTransactions'
```

### Improvement Local Node

To improve the performance, security, and maintainability of your own node, perform the following steps.

- Kubernetes: Used to ensure the availability of nodes and manage load balancing across the available nodes at any given time, to maximize output from the available nodes and resources
- security : Setup SSH keys for authentication, Disable password authentication ,Configure UFW firewall
- Kubernetes :Make maintainability very easy and face , even upgrade with less down-time.

### Improvement 3rd Party  Node

There many benefit 3rd Party.

- Very low maintainability cost.
- Low risk of attack
- Already Developed big library which make development more fast.

### Pros/Cons

**Local Node**

| Pros                          | Cons                            |
|-------------------------------|---------------------------------|
| More trusted                  | Costly                          |
| No risk of downtime or unavailability of node | High maintenance             |
| Full control and security     | Risk of hacking                 |
| Increased privacy             | Security issues                 |
| Fast development and testing  |                                 |
| Earn rewards                  |                                 |

**3rd Party Node**

| Pros                                 | Cons                          |
|--------------------------------------|-------------------------------|
| No maintenance cost                  | Less trust in data            |
| No need to manage memory and resources | Centralized                   |
| Less risk of getting hacked          | Availability issues           |
| Rich library                         | Dependence on others          |
