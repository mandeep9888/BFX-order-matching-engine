"use strict";

import * as resourceHandler from "./resourceHandler";
import * as bookHandler from "./bookHandler";
import * as orderHandler from "./orderHandler";
import * as unknownHandler from "./unknownHandler";
import ResourceLocker from "../utils/resourceLocker";
import OrderMatchBook from "../utils/orderMatchingLogic";

function handleRequest(rid, key, payload, handler, resource, orderBook) {
  switch (key) {
    case "resource:lock":
      resourceHandler.handleResourceLock(payload, handler, resource);
      break;
    case "resource:unlock":
      resourceHandler.handleResourceUnlock(payload, handler, resource);
      break;
    case "book:sync":
      bookHandler.handleBookSync(handler, orderBook);
      break;
    case "order:new":
      orderHandler.handleNewOrder(rid, payload, handler, orderBook);
      break;
    default:
      unknownHandler.handleUnknownRequest(key);
  }
}

export { handleRequest };
