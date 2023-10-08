"use strict";

// simplified order matching engine

class OrderMatchBook {
  constructor() {
    this.buys = [];
    this.sells = [];
  }

  init(book) {
    book.forEach((order) => this.addOrderToBook(order));
  }

  //   // Helper function to insert an order while maintaining sorting order
  //   insertOrder(order, array, comparator) {
  //     let index = array.findIndex((existingOrder) =>
  //       comparator(existingOrder, order)
  //     );
  //     if (index === -1) {
  //       index = array.length;
  //     }
  //     array.splice(index, 0, order);
  //   }

  // more optimize insertOrder using quicksort
  // Helper function to insert an order while maintaining sorting order
  insertOrder(order, array, comparator) {
    array.push(order);
    this.quickSort(array, comparator, 0, array.length - 1);
  }

  // Quicksort implementation for scaling for large volume of orders
  quickSort(array, comparator, left, right) {
    if (left < right) {
      const pivotIndex = this.partition(array, comparator, left, right);
      this.quickSort(array, comparator, left, pivotIndex - 1);
      this.quickSort(array, comparator, pivotIndex + 1, right);
    }
  }

  // Partitioning step of Quicksort
  partition(array, comparator, left, right) {
    const pivot = array[right];
    let i = left - 1;

    for (let j = left; j < right; j++) {
      if (comparator(array[j], pivot) <= 0) {
        i++;
        this.swap(array, i, j);
      }
    }

    this.swap(array, i + 1, right);
    return i + 1;
  }

  // Helper function to swap two elements in an array
  swap(array, i, j) {
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  //  Check the order is a buy or sell based on its amount property and inserts it into the appropriate array.
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

  /**
   * Matches a buy order against sell order
   * @param {order}
   * @returns It returns an array of fulfilled orders and the remaining unfulfilled amount
   */
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

  // Places a market order in the order book. uses fullfillOrder function
  // If there's any unfulfilled amount, it adds the remaining part of the order to the order book.
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

  //  Returns the total number of orders in the order book
  getLength() {
    return this.buys.length + this.sells.length;
  }

  // Returns an array containing all orders in the order book
  getAllOrders() {
    return [...this.buys, ...this.sells];
  }
}

module.exports = OrderMatchBook;
