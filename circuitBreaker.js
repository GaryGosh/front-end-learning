function circuitBreaker(fn, frequencyThreshold = 3, coolOffTime = 5000) {
  let failureCount = 0;
  let lastFailureTime = 0;
  let isOpen = false;

  return async function (...args) {
    const now = Date.now();
    // if open AND cool off time not passed - reject immeditely
    if (isOpen && now - lastFailureTime < coolOffTime) {
      throw new Error("Circuit breaker: currently open. Please try later.");
    }

    // if open but cool off time passed - close it and retry fresh
    if (isOpen && now - lastFailureTime >= coolOffTime) {
      isOpen = false;
      failureCount = 0;
    }

    try {
      const result = await fn(...args); // call actual function
      failureCount = 0; // success reset failures
      return result;
    } catch (error) {
      failureCount++;
      lastFailureTime = Date.now();

      // if failure threshold reached - open the circuit
      if (failureCount >= frequencyThreshold) {
        isOpen = true;
        console.log("Circuit breaker opened due to repeated failures.");
      }
      throw error;
    }
  };
}

// usage
const unstableApi = async () => {
  if (Math.random() < 0.7) {
    throw new Error("Random failure!");
  }
  return "Success!";
};

// Wrap it inside circuit breaker
const safeApi = circuitBreaker(unstableApi, 3, 5000);

// call repeatedly
(async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await safeApi();
      console.log("call : ", res);
    } catch (err) {
      console.log("call failed : ", err.message);
    }
  }
})();
