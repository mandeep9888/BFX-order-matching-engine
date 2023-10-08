"use strict";

import PeerRPCClient from "grenache-nodejs-http";
const ResourceLocker = require("./utils/resourceLocker");
const resource = new ResourceLocker();

const grapeUrl = `http://${networkIp}:30001`;
const link = new Link({ grape: grapeUrl });
link.start();

const peerClient = new PeerRPCClient(link, {});
peerClient.init();

async function lockResource(clientId) {
  return new Promise((resolve, reject) => {
    console.log("Ask resource lock to all connected nodes");
    peerClient.map(
      "resource:lock",
      clientId,
      { timeout: 10000 },
      (err, data) => {
        if (err) {
          if (err.message === "ERR_GRAPE_LOOKUP_EMPTY") {
            //first client to join
            resolve();
            return;
          } else {
            console.error("resource:lock error:", err.message);
            reject(err);
            return;
          }
        }
        console.log("resource:lock response:", data);
        resolve();
      }
    );
  });
}

async function releaseLockedResource(clientId) {
  return new Promise((resolve, reject) => {
    console.log("Release resource lock for all connected nodes");
    peerClient.map(
      "resource:unlock",
      clientId,
      { timeout: 10000 },
      (err, data) => {
        if (err) {
          if (err.message === "ERR_GRAPE_LOOKUP_EMPTY") {
            //first client to join
            resolve();
            return;
          } else {
            console.error("resource:unlock error:", err.message);
            reject(err);
            return;
          }
        }
        console.log("resource:unlock response:", data);
        resolve();
      }
    );
  });
}

async function syncOrders(orderBook) {
  return new Promise((resolve, reject) => {
    console.log("Sync order book");
    peerClient.request("book:sync", {}, { timeout: 10000 }, (err, data) => {
      if (err) {
        if (err.message === "ERR_GRAPE_LOOKUP_EMPTY") {
          //We are the first node of the grape
          //No orders to sync
          resolve();
          return;
        } else {
          console.error("book:sync error:", err.message);
          reject(err);
          return;
        }
      }
      //console.log("book:sync response:", data);
      orderBook.init(data.orderBook);
      resolve();
    });
  });
}

async function addNewOrder(price, amount) {
  await waitForResourceLock();
  const response = await broadcastNewOrder(price, amount);
  return response;
}

async function waitForResourceLock() {
  while (resource.isLocked()) {
    console.log("Waiting for clients lock to be released...");
    await setTimeout(100);
  }
}

async function broadcastNewOrder(price, amount) {
  return new Promise((resolve, reject) => {
    console.log("Submit new order:", { price: price, amount: amount });
    peerClient.map(
      "order:new",
      { price, amount },
      { timeout: 10000 },
      (err, data) => {
        if (err) {
          console.error("order:new error:", err.message);
          reject(err);
        } else {
          console.log("order:new response:", data);
          resolve();
        }
      }
    );
  });
}

async function waitForClientToBeRegistered(clientId) {
  let isClientRegistered = false;
  let numberOfTry = 0;
  do {
    try {
      await new Promise((resolve, reject) => {
        console.log(`lookup for current client #${numberOfTry}`);
        link.lookup("order:new", { timeout: 10000 }, (err, data) => {
          if (err) {
            console.error("lookup error:", err.message);
            reject(err);
            return;
          }
          console.log("lookup response:", data);
          isClientRegistered = data.includes(clientId);
          resolve();
        });
      });
    } catch (e) {
      console.log("error in lookup", e.message);
    }
    numberOfTry++;
    await setTimeout(10000); //Can take long time for a new node to be discoverable by the network
  } while (!isClientRegistered && numberOfTry < 100);

  if (!isClientRegistered)
    throw new Error("Unable to find client registered on the Grape");
}

export {
  lockResource,
  releaseLockedResource,
  syncOrders,
  addNewOrder,
  waitForResourceLock,
  broadcastNewOrder,
  waitForClientToBeRegistered,
};
