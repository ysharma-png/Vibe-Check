/**
 * Production Password Policy & Strength Analyzer
 * Enforces:
 * 1. Minimum 10 characters
 * 2. Blocklist check against common/leaked passwords
 * 3. Prohibits inclusion of user's email prefix, name, or handle
 * 4. Comprehensive entropy & strength scoring
 */

export const COMMON_WEAK_PASSWORDS = new Set<string>([
  "password",
  "password123",
  "password1234",
  "1234567890",
  "123456789",
  "qwertyuiop",
  "welcome123",
  "admin12345",
  "administrator",
  "letmein123",
  "changeme123",
  "iloveyou123",
  "trustno1123",
  "sunshine123",
  "monkey1234",
  "dragon1234",
  "football123",
  "master1234",
  "secret1234",
  "cacheflow123",
  "creative123",
  "comfyui123",
  "runway1234",
]);

export interface PasswordValidationResult {
  readonly isValid: boolean;
  readonly score: number; // 0 (very weak) to 4 (very strong)
  readonly label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";
  readonly errors: readonly string[];
  readonly requirements: {
    readonly minLength: boolean;
    readonly hasUppercase: boolean;
    readonly hasLowercase: boolean;
    readonly hasNumber: boolean;
    readonly hasSymbol: boolean;
    readonly notCommon: boolean;
    readonly noPersonalData: boolean;
  };
}

export function validatePassword(
  password: string,
  context?: {
    email?: string;
    name?: string;
    handle?: string;
  }
): PasswordValidationResult {
  const errors: string[] = [];
  const normalizedPass = password.toLowerCase().trim();

  // 1. Minimum length
  const minLength = password.length >= 10;
  if (!minLength) {
    errors.push("Password must be at least 10 characters long.");
  }

  // 2. Character diversity
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // 3. Common password check
  const notCommon = !COMMON_WEAK_PASSWORDS.has(normalizedPass);
  if (!notCommon) {
    errors.push("Password is too common and easily guessed. Choose a more unique phrase.");
  }

  // 4. Personal data containment check
  let noPersonalData = true;
  if (context?.email) {
    const emailPrefix = context.email.split("@")[0]?.toLowerCase();
    if (emailPrefix && emailPrefix.length >= 3 && normalizedPass.includes(emailPrefix)) {
      noPersonalData = false;
      errors.push("Password must not contain your email address.");
    }
  }

  if (context?.name && noPersonalData) {
    const nameParts = context.name.toLowerCase().split(/\s+/).filter((p) => p.length >= 3);
    for (const part of nameParts) {
      if (normalizedPass.includes(part)) {
        noPersonalData = false;
        errors.push("Password must not contain your name.");
        break;
      }
    }
  }

  if (context?.handle && noPersonalData) {
    const cleanHandle = context.handle.replace(/^@/, "").toLowerCase();
    if (cleanHandle.length >= 3 && normalizedPass.includes(cleanHandle)) {
      noPersonalData = false;
      errors.push("Password must not contain your username/handle.");
    }
  }

  // 5. Score calculation (0 - 4)
  let score = 0;
  if (minLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol && password.length >= 12) score += 1;

  if (!notCommon || !noPersonalData) {
    score = Math.min(score, 1);
  }

  let label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong" = "Very Weak";
  if (score === 1) label = "Weak";
  else if (score === 2) label = "Fair";
  else if (score === 3) label = "Good";
  else if (score >= 4) label = "Strong";

  const isValid = minLength && notCommon && noPersonalData && (hasUppercase || hasNumber || hasSymbol);

  return {
    isValid,
    score,
    label,
    errors,
    requirements: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSymbol,
      notCommon,
      noPersonalData,
    },
  };
}
