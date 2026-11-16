import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined" && !window.ResizeObserver) {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}
