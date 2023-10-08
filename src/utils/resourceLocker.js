"use strict";

/**
 * ResourceLocker class for managing locked clients or resources.
 */
class ResourceLocker {
  /**
   * Create a new ResourceLocker.
   */
  constructor() {
    this.lockedClients = new Set();
  }

  /**
   * Lock a client or resource.
   * @param {string} clientId - The ID of the client or resource to lock.
   */
  lock(clientId) {
    this.lockedClients.add(clientId);
    console.log("Locked clients:", this.lockedClients);
  }

  /**
   * Unlock a client or resource.
   * @param {string} clientId - The ID of the client or resource to unlock.
   */
  unlock(clientId) {
    this.lockedClients.delete(clientId);
    console.log("Unlocked clients:", this.lockedClients);
  }

  /**
   * Check if any clients or resources are currently locked.
   * @returns {boolean} - `true` if locked, `false` otherwise.
   */
  isLocked() {
    console.log("Locked clients:", this.lockedClients);
    return this.lockedClients.size > 0;
  }
}

module.exports = ResourceLocker;
