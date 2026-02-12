/**
 * Jest setup file for test environment configuration
 * 
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "whatwg-fetch";
import crypto from "crypto";

// Load environment variables for testing
require("dotenv").config({ path: ".env.local" });

// Polyfill for crypto.randomUUID in Jest environment
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => crypto.randomUUID(),
  },
});
