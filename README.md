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

- Implementation solution behaves like both client and server.. refer index.js.

- For eliminating race conditions synchronization is important and it is achieved by locking resources.
- Using Resource lock we are locking all the write operations to the order book so that node can be synchronized it may take a few seconds.
- All other nodes are receiving new orders that are being broadcasted.
- Because all nodes use the same order book copy and matching process, they all match the same orders.
- used Quicksort for sorting orders which work well with large volumes of orders.
- since the order book grows if  orders do not match to keep it small random order prices are between 10000 and 10100, and amount between -0.5 and 0.5.

## Issues:

- when stopping a node, Port remains in use may be in cache for around 30-40 seconds, which generates error if trying to start the node again within this timeframe
- code could be modularized I have created the folder and file structure but did not get the time to organize it fully.
- Synchronization takes up few seconds, I don't have an Idea how to handle it as of now.
- solution has issues mantaining more than 100 pending orders in the queue

## Output

Order matching Output

![Orders are being processed ](https://github.com/mandeep9888/BFX-order-matching-engine/blob/be27905e53feac73bff6510870ecd019102794fa/screenshots/output.png).
