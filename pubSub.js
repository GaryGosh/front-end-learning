// ---------------------------
// PUBLISHER (Subject)
// ---------------------------
class Publisher {
  constructor() {
    this.subscribers = []; // list of observer functions
  }

  // Add a subscriber (observer)
  subscribe(observerFn) {
    this.subscribers.push(observerFn);
  }

  // Remove a subscriber (observer)
  unsubscribe(observerFn) {
    this.subscribers = this.subscribers.filter((fn) => fn !== observerFn);
  }

  // Notify all subscribers
  notify(data) {
    console.log("data in notitfy : ", data);
    this.subscribers.forEach((fn) => fn(data));
  }
}

// ---------------------------
// SUBSCRIBERS (Observers)
// ---------------------------

// 1st subscriber (observer)
function observerOne(event) {
  console.log("Observer 1 received:", event);
}

// 2nd subscriber (observer)
function observerTwo(event) {
  console.log("Observer 2 received:", event);
}

// ---------------------------
// USAGE
// ---------------------------

const publisher = new Publisher();

// Subscribe observerOne
publisher.subscribe(observerOne);
publisher.notify("event #1");

// Unsubscribe observerOne
publisher.unsubscribe(observerOne);
publisher.notify("event #2");

// Subscribe both observers
publisher.subscribe(observerOne);
publisher.subscribe(observerTwo);
publisher.notify("event #3");
