"use strict";

import { setTimeout } from "../utils/timers";
import PeerRPCClient from "grenache-nodejs-http";

async function submitRandomOrder() {
  const random = Math.random();
  const delay = 1000 + Math.floor(random * 9000);
  const price = parseFloat((1000 + random * 10).toFixed(2));
  const amount = parseFloat((random < 1 ? -random : random / 2).toFixed(2));

  console.log("Submit new order:", { price: price, amount: amount });

  try {
    await setTimeout(delay);
    await addNewOrder(price, amount);
  } catch (err) {
    console.error("addNewOrder error:", err.message);
  }

  //   setTimeout(submitRandomOrder, delay);
  submitRandomOrder();
}

export { submitRandomOrder };
