"use client";

import { useEffect } from "react";

/*
 * Browsers skip a view transition when the tab is hidden (for example, a route
 * change that lands while the visitor is in another tab). React recovers on its
 * own, but its `transition.finished.finally()` chain re-throws the skip as an
 * unhandled rejection. Swallow exactly that case and nothing else.
 */
const isSkippedTransition = (reason: unknown) =>
  reason instanceof DOMException &&
  (reason.name === "InvalidStateError" || reason.name === "AbortError") &&
  /transition/i.test(reason.message);

export function ViewTransitionGuard() {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isSkippedTransition(event.reason)) event.preventDefault();
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);
  return null;
}
