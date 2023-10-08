// simplified order matching engine
class OrderMatchBook {
  constructor() {
    this.buys = [];
    this.sells = [];
  }

  init(book) {
    book.forEach((order) => this.addOrderToBook(order));
  }

  // Helper function to insert an order while maintaining sorting order
  insertOrder(order, array, comparator) {
    let index = array.findIndex((existingOrder) =>
      comparator(existingOrder, order)
    );
    if (index === -1) {
      index = array.length;
    }
    array.splice(index, 0, order);
  }

  addOrderToBook(order) {
    const targetArray = order.amount > 0 ? this.buys : this.sells;
    const comparator =
      order.amount > 0
        ? (a, b) => b.price - a.price
        : (a, b) => a.price - b.price;

    // call the helper function to insert in right order
    this.insertOrder(order, targetArray, comparator);
    console.log(`${order.amount > 0 ? "Buy" : "Sell"} order added:`, order);
  }

  fulfillOrder(order) {
    const fulfilledOrders = [];
    const amountToFind = order.amount;

    // check whether the order is a buy or sell order
    const targetArray = amountToFind > 0 ? this.sells : this.buys;
    const comparator =
      amountToFind > 0
        ? (a, b) => a.price - b.price
        : (a, b) => b.price - a.price;

    while (
      amountToFind !== 0 &&
      targetArray.length > 0 &&
      comparator(targetArray[0], order) <= 0
    ) {
      const matchingOrder = targetArray.shift();

      // check weather order is matched fully or partially
      const matchedQuantity = Math.min(
        Math.abs(amountToFind),
        Math.abs(matchingOrder.amount)
      );

      if (matchedQuantity === Math.abs(amountToFind)) {
        fulfilledOrders.push(matchingOrder);
        amountToFind = 0;
      } else {
        // if matched partially
        matchingOrder.amount += amountToFind;
        targetArray.unshift(matchingOrder);
        amountToFind = 0;
      }
    }

    if (amountToFind === 0) {
      fulfilledOrders.push(order);
    }

    return { fulfilledOrders, amountToFind };
  }

  placeMarketOrder(order) {
    const { fulfilledOrders, amountToFind } = this.fulfillOrder(order);
    console.log("Fulfilled orders:", fulfilledOrders);

    if (amountToFind !== 0) {
      // Add the remaining unfulfilled order back into the book
      order.amount = amountToFind;
      this.addOrderToBook(order);
    }

    return fulfilledOrders.length > 0;
  }

  getLength() {
    return this.buys.length + this.sells.length;
  }

  getAllOrders() {
    return [...this.buys, ...this.sells];
  }
}

module.exports = OrderMatchBook;
