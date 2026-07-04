// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadChatSession, updateChatSession } from "./chatSession";

afterEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("chatSession", () => {
  it("returns an empty session when nothing is stored", () => {
    expect(loadChatSession()).toEqual({
      messages: [],
      cooldownUntil: null,
      open: false,
    });
  });

  it("round trips a stored session", () => {
    updateChatSession({
      messages: [{ role: "user", content: "hi" }],
      cooldownUntil: 123,
      open: true,
    });

    expect(loadChatSession()).toEqual({
      messages: [{ role: "user", content: "hi" }],
      cooldownUntil: 123,
      open: true,
    });
  });

  it("merges a partial update into the stored session", () => {
    updateChatSession({ messages: [{ role: "user", content: "hi" }] });
    updateChatSession({ open: true });

    expect(loadChatSession()).toEqual({
      messages: [{ role: "user", content: "hi" }],
      cooldownUntil: null,
      open: true,
    });
  });

  it("falls back to an empty session on corrupt JSON", () => {
    window.sessionStorage.setItem("chat-session", "{not json");

    expect(loadChatSession()).toEqual({
      messages: [],
      cooldownUntil: null,
      open: false,
    });
  });

  it("falls back to an empty session on an invalid shape", () => {
    window.sessionStorage.setItem(
      "chat-session",
      JSON.stringify({ messages: [{ role: "system", content: "x" }] }),
    );

    expect(loadChatSession()).toEqual({
      messages: [],
      cooldownUntil: null,
      open: false,
    });
  });

  it("swallows storage errors", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(loadChatSession()).toEqual({
      messages: [],
      cooldownUntil: null,
      open: false,
    });
    expect(() => updateChatSession({ open: true })).not.toThrow();
  });
});
