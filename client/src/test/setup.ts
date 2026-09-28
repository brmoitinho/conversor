import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Mantém cada teste isolado e evita que o histórico de uma execução contamine outra.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
