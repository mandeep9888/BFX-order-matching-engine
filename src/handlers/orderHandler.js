"use strict";

import OrderMatchBook from "../utils/orderMatchingLogic";

function handleNewOrder(rid, payload, handler, orderBook) {
  console.log("new order:", { price: payload.price, amount: payload.amount });
  const order = {
    ...payload,
    id: rid,
  };
  const isOrderFulfilled = OrderMatchBook.placeMarketOrder(order);
  console.log(`Is market order fulfilled `, isOrderFulfilled);
  console.log(`Pending Order book length: ${OrderMatchBook.getLength()}`);
  const response = {
    success: true,
    isOrderFulfilled,
    numberOfPendingOrders: OrderMatchBook.getLength(),
  };

  handler.reply(null, response);
}

export { handleNewOrder };
