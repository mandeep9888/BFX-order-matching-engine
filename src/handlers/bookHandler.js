"use strict";

import OrderMatchBook from "../utils/orderMatchingLogic";

function handleBookSync(handler, orderBook) {
  const orderBookData = { orderBook: OrderMatchBook.getAllOrders() };
  handler.reply(null, orderBookData);
}

export { handleBookSync };
