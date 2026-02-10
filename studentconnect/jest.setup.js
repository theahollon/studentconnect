// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "whatwg-fetch";
import crypto from "crypto";

// Last inn miljøvariabler for testing
require("dotenv").config({ path: ".env.local" });

// Polyfill for crypto.randomUUID i Jest environment
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => crypto.randomUUID(),
  },
});
