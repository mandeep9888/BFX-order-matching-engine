"use strict";

import ResourceLocker from "../utils/resourceLocker";

function handleResourceLock(payload, handler, resource) {
  ResourceLocker.lock(payload);
  handler.reply(null, { success: true });
}

function handleResourceUnlock(payload, handler, resource) {
  ResourceLocker.unlock(payload);
  handler.reply(null, { success: true });
}

export { handleResourceLock, handleResourceUnlock };
