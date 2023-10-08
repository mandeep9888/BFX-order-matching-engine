# BFX-order-matching-engine

## Table of Contents

- [BFX Challenge submission](#bfx-challenge-submission)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Implementation details](#implementation-details)
  - [Issues:](#issues)
  - [Output:](#output)

## Requirements

[Read the requirements here ](https://github.com/mandeep9888/BFX-order-matching-engine/blob/16f70f30485f6231f60e3b0b68dd9e2411c702b8/node-blockchain.md)

## Getting Started

**Clone projet**

```
git clone https://github.com/mandeep9888/BFX-order-matching-engine.git
```

**Install Project Dependencies**

Install all dependecies.

```
npm install
```

**Setting up the DHT globally**

```
npm install -g grenache-grape
```

```
# boot two grape servers on two different terminals

grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

**Start the different nodes**

run two or more nodes on different tab they will sync and begin processing orders.

```
npm start
npm start
```

## Implementation details

- Implementation solution behave like both client and server.. refer index.js.

- For eleminanting race condition synchronization is importanat and it is acheive by locking resource.
- Using Resource lock we are locking all the write operation to the orderbook so that node can be synchonized it may take few seconds.
- All other nodes are receiving new orders that are being broadcasted.
- Because all nodes use the same order book copy and matching process, they all match the same orders.
- used Quicksort for sorting orders which work well with large volumes of orders.

## Issues:

- when stoping a node, Port remain in use mayebe in cache for around 30-40 seconds, which generate error if trying to start the node again within this timeframe
- code could be modularize I have created the folder and file stucture did not get the time to organized it fully.
- Synchronization taking up few seconds, I dont have Idea how to handle it as of now.
- solution have issues mantaining more than 100 pending orders in the queue

## Output

Order matching Output

![Orders are being processed ](https://github.com/mandeep9888/BFX-order-matching-engine/blob/be27905e53feac73bff6510870ecd019102794fa/screenshots/output.png).
