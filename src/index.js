"use strict";

const { setTimeout } = require("timers/promises");
const { PeerRPCServer, PeerRPCClient } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const OrderMatchBook = require("./utils/orderMatchingLogic");
const ResourceLocker = require("./utils/resourceLocker");

const networkIp = "127.0.0.1";
const port = 1024 + Math.floor(Math.random() * 1000);
const clientId = `${networkIp}:${port}`; // use address/port as clientId

const grapeUrl = `http://${networkIp}:30001`;
const link = new Link({ grape: grapeUrl });
link.start();

const peerServer = new PeerRPCServer(link, { timeout: 300000 });
peerServer.init();

const peerClient = new PeerRPCClient(link, {});
peerClient.init();

const service = peerServer.transport("server");
service.listen(port);
console.log(`Client listening on port ${port}`);

const orderBook = new OrderMatchBook();
const resource = new ResourceLocker();

service.on("request", (rid, key, payload, handler) => {
  if (key === "resource:lock") {
    handleResourceLock(payload, handler);
  } else if (key === "resource:unlock") {
    handleResourceUnlock(payload, handler);
  } else if (key === "book:sync") {
    handleBookSync(handler);
  } else if (key === "order:new") {
    handleNewOrder(rid, payload, handler);
  } else {
    handleUnknownRequest(key);
  }
});

function handleResourceLock(payload, handler) {
  resource.lock(payload);
  // Assuming it's successful for now
  handler.reply(null, { success: true });
}

function handleResourceUnlock(payload, handler) {
  resource.unlock(payload);
  // Assuming it's successful for now
  handler.reply(null, { success: true });
}

function handleBookSync(handler) {
  // Retrieve the order book and send it as a response
  const orderBookData = { orderBook: orderBook.getAllOrders() };
  handler.reply(null, orderBookData);
}

function handleNewOrder(rid, payload, handler) {
  console.log("new order:", { price: payload.price, amount: payload.amount });
  const order = {
    ...payload,
    id: rid,
  };
  const isOrderFulfilled = orderBook.placeMarketOrder(order);
  console.log(`Is market order fulfiled `, isOrderFulfilled);
  console.log(`Pending Order book length: ${orderBook.getLength()}`);
  const response = {
    success: true,
    OrderProcessed: isOrderFulfilled,
    numberOfPendingOrders: orderBook.getLength(),
  };

  handler.reply(null, response);
}

function handleUnknownRequest(key) {
  console.log(`Unknown request type: ${key}`);
}

const lockResource = async (clientId) => {
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
};

const releasedLockedresource = async (clientId) => {
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
};

const syncOrders = async () => {
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
};

const addNewOrder = async (price, amount) => {
  await waitForResourceLock();
  const response = await broadcastNewOrder(price, amount);
  return response;
};

const waitForResourceLock = async () => {
  while (resource.isLocked()) {
    console.log("Waiting for clients lock to be released...");
    await setTimeout(100);
  }
};

const broadcastNewOrder = async (price, amount) => {
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
};

/**
 * Randomly submit a new order:
 * - every 1 to 10 second,
 * - with a price between 10000 and 10100,
 * - and amount between -0.5 and 0.5,
 *
 * Price and amount are rounded to 4 decimals.
 */

const submitRandomOrder = async () => {
  const random = Math.random();
  const delay = 1000 + Math.floor(random * 9000);
  const price = parseFloat((10000 + random * 100).toFixed(4));
  const amount = parseFloat((random < 0.5 ? -random : random / 2).toFixed(4));

  console.log("Submit new order:", { price: price, amount: amount });

  try {
    await setTimeout(delay);
    await addNewOrder(price, amount);
  } catch (err) {
    console.error("addNewOrder error:", err.message);
  }

  //   setTimeout(submitRandomOrder, delay);
  submitRandomOrder();
};

// // Start submitting random orders
//

const waitForClientToBeRegistered = async (clientId) => {
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
};

//Start Client
(async () => {
  try {
    //Ask all nodes to lock order submission while our clients is synchronizing on the network
    await lockResource(clientId);

    //Announce client on all services
    link.startAnnouncing("order:new", service.port, {});
    link.startAnnouncing("resource:lock", service.port, {});
    link.startAnnouncing("resource:unlock", service.port, {});
    //And ensure our client is accessible to others
    await waitForClientToBeRegistered(clientId);

    //Sync order book from another node on startup
    await syncOrders();
    console.log(`Initial order book length: ${orderBook.getLength()}`);

    //Release lock as our client is fully connected and sync now
    await releasedLockedresource(clientId);

    //Client can now be requested by other for synchronizing order book
    link.startAnnouncing("book:sync", service.port, {});

    //Then we can start trading by randomly submitting new orders
    submitRandomOrder();
  } catch (e) {
    console.error("Error while starting trading client", e);
    process.exit(1);
  }
})();

//Handler to stop announcing on the grape when exiting
process.on("SIGINT", async () => {
  console.log("Stopping client...");
  link.stopAnnouncing("order:new", service.port);
  link.stopAnnouncing("book:sync", service.port);
  link.stop();
  //Did not find a way to get stop confirmation before exiting so waiting 2 seconds instead
  await setTimeout(2000);
  process.exit(0);
});
