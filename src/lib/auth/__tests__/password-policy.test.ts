import { describe, it, expect } from "vitest";
import { validatePassword, COMMON_WEAK_PASSWORDS } from "../password-policy";
import { isDisposableEmail } from "../disposable-emails";

describe("Password Policy & Entropy Analyzer", () => {
  it("rejects passwords shorter than 10 characters", () => {
    const result = validatePassword("Short1!");
    expect(result.isValid).toBe(false);
    expect(result.requirements.minLength).toBe(false);
    expect(result.errors).toContain("Password must be at least 10 characters long.");
  });

  it("rejects common leaked passwords even if 10+ characters", () => {
    const result = validatePassword("password123");
    expect(result.isValid).toBe(false);
    expect(result.requirements.notCommon).toBe(false);
    expect(result.errors.some((e) => e.includes("too common"))).toBe(true);
  });

  it("rejects passwords containing the user's email address", () => {
    const result = validatePassword("AlexRivera2026!", {
      email: "alexrivera@studio.com",
    });
    expect(result.isValid).toBe(false);
    expect(result.requirements.noPersonalData).toBe(false);
    expect(result.errors).toContain("Password must not contain your email address.");
  });

  it("rejects passwords containing the user's personal name", () => {
    const result = validatePassword("ElenaSuperSecure2026!", {
      name: "Elena Richter",
    });
    expect(result.isValid).toBe(false);
    expect(result.requirements.noPersonalData).toBe(false);
    expect(result.errors).toContain("Password must not contain your name.");
  });

  it("rejects passwords containing the user's handle", () => {
    const result = validatePassword("cyber_amara_flow_99", {
      handle: "@amara_flow",
    });
    expect(result.isValid).toBe(false);
    expect(result.requirements.noPersonalData).toBe(false);
    expect(result.errors).toContain("Password must not contain your username/handle.");
  });

  it("accepts a strong, compliant password with high entropy", () => {
    const result = validatePassword("Xy9#mK2$pL0@vWq", {
      email: "creator@studio.com",
      name: "John Doe",
      handle: "johndoe",
    });
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.label === "Good" || result.label === "Strong").toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("Disposable Email Blocker", () => {
  it("detects and blocks known disposable email domains", () => {
    expect(isDisposableEmail("attacker@mailinator.com")).toBe(true);
    expect(isDisposableEmail("bot@tempmail.com")).toBe(true);
    expect(isDisposableEmail("user@guerrillamail.com")).toBe(true);
    expect(isDisposableEmail("test@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("throwaway@yopmail.com")).toBe(true);
  });

  it("allows legitimate business and personal email domains", () => {
    expect(isDisposableEmail("director@nike.com")).toBe(false);
    expect(isDisposableEmail("creative@gmail.com")).toBe(false);
    expect(isDisposableEmail("amara@cacheflow.test")).toBe(false);
    expect(isDisposableEmail("studio@proton.me")).toBe(false);
  });
});
