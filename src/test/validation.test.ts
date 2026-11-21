import { describe, expect, it } from "vitest";

import { validateEmail, validateName, validatePassword } from "@/lib/validation";

describe("sign-in form rules", () => {
  it("rejects an empty email", () => {
    expect(validateEmail("  ")).toBe("Enter an email address");
  });
  it("rejects a malformed email", () => {
    expect(validateEmail("ada@bivo")).toBe("Enter a valid email address");
  });
  it("accepts a normal email", () => {
    expect(validateEmail(" ada@bivo.app ")).toBeNull();
  });
  it("requires passwords of at least 8 characters", () => {
    expect(validatePassword("1234567")).toBe("Password must be at least 8 characters");
    expect(validatePassword("12345678")).toBeNull();
  });
  it("requires a name when signing up", () => {
    expect(validateName("")).toBe("Enter your name");
    expect(validateName("Ada")).toBeNull();
  });
});
