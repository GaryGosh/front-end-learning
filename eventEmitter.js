/* 
    on(eventName, callback) → subscribe
    once(eventName, callback) → subscribeOnce
    onceAsync(eventName) → subscribeOnceAsync (returns a Promise)
    emit(eventName, data) → publish
    emitAll(data) → publishAll
*/

class Events {
  constructor() {
    this.events = {}; // { eventName: [callbacks] }
    this.onceEvents = {}; // { eventName: [callbacks] }
    this.asyncOnceResolvers = {}; // { eventName: [resolve functions] }
  }

  // -------------------------------
  // Subscribe (many times allowed)
  // -------------------------------
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // return an unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(
        (fn) => fn !== callback
      );
    };
  }

  // ---------------------------------
  // Subscribe only once (synchronous)
  // ---------------------------------
  once(eventName, callback) {
    if (!this.onceEvents[eventName]) {
      this.onceEvents[eventName] = [];
    }
    this.onceEvents[eventName].push(callback);
  }

  // -----------------------------------------
  // Subscribe once asynchronously (via Promise)
  // -----------------------------------------
  onceAsync(eventName) {
    return new Promise((resolve, reject) => {
      if (!this.asyncOnceResolvers[eventName]) {
        this.asyncOnceResolvers[eventName] = [];
      }
      this.asyncOnceResolvers[eventName].push(resolve);
    });
  }

  // ---------------------------------
  // Emit a specific event
  // ---------------------------------
  emit(eventName, data) {
    // normal subscribers
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => fn(data));
    }

    // once subscribers
    if (this.onceEvents[eventName]) {
      this.onceEvents[eventName].forEach((fn) => fn(data));
      delete this.onceEvents[eventName]; // ensure they run only once
    }

    // async once subscribers (promise resolvers)
    if (this.asyncOnceResolvers[eventName]) {
      this.asyncOnceResolvers[eventName].forEach((resolve) => resolve(data));
      delete this.asyncOnceResolvers[eventName]; // resolve only once
    }
  }

  // ---------------------------------
  // Emit ALL subscribed events
  // ---------------------------------
  emitAll(data) {
    // normal subscribers
    for (const name in this.events) {
      this.events[name].forEach((fn) => fn(data));
    }

    // once subscribers (sync)
    for (const name in this.onceEvents) {
      this.onceEvents[name].forEach((fn) => fn(data));
    }
    this.onceEvents = {}; // clear all once-subs after execution

    // async once subscribers
    for (const name in this.asyncOnceResolvers) {
      this.asyncOnceResolvers[name].forEach((resolve) => resolve(data));
    }
    this.asyncOnceResolvers = {}; // clear them
  }
}

const events = new Events();
// --- regular subscription ---
const removeUserLogin = events.on("login", (data) => {
  console.log("User logged in : ", data);
});

// --- once subscription ---
events.once("payment", (amount) => {
  console.log("Payment recieved : ", amount);
});

// --- onceAsync subscription ---
events.onceAsync("ready").then((msg) => {
  console.log("Async ready event : ", msg);
});

// Emit specific events
events.emit("login", { user: "Neeraj" });

events.emit("payment", 500);

// payment should NOT fire again
events.emit("payment", 999); // ignored
events.emit("payment", 9000); // ignored

// Async ready resolver gets triggered once
events.emit("ready", "App is ready!");

// Remove subscription
removeUserLogin();

events.emit("login", { user: "Next guy" }); // no output
events.emit("login", { user: "Third guy" }); // no output

// Emit ALL events (remaining ones)
events.emitAll("Broadcast to all!");
