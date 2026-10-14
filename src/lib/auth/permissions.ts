/**
 * Centralized Role-Based Access Control (RBAC) & Permission Policy Matrix
 *
 * Implements defense-in-depth permission evaluation across:
 * - Role: 'creator' | 'brand' | 'admin'
 * - Resource: 'profile' | 'portfolio_item' | 'brief' | 'proposal' | 'engagement' | 'message' | 'deliverable' | 'verification' | 'audit_log'
 * - Action: 'read' | 'create' | 'update' | 'delete' | 'publish' | 'moderate'
 */

export type UserRole = "creator" | "brand" | "admin";

export type Resource =
  | "profile"
  | "portfolio_item"
  | "brief"
  | "proposal"
  | "engagement"
  | "message"
  | "deliverable"
  | "verification"
  | "audit_log";

export type Action = "read" | "create" | "update" | "delete" | "publish" | "moderate";

export interface AuthUser {
  readonly id: string;
  readonly role: UserRole;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly mfaLevel?: "aal1" | "aal2";
}

export interface PermissionContext {
  readonly ownerId?: string;
  readonly creatorId?: string;
  readonly brandId?: string;
  readonly participants?: readonly string[];
  readonly status?: string;
  readonly isPublished?: boolean;
}

export class AuthorizationError extends Error {
  readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "EMAIL_NOT_VERIFIED" | "MFA_REQUIRED";
  readonly statusCode: number;

  constructor(
    message: string,
    code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "EMAIL_NOT_VERIFIED" | "MFA_REQUIRED" = "FORBIDDEN",
    statusCode: number = 403
  ) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Checks whether an authenticated user is permitted to perform an action on a resource.
 */
export function can(
  user: AuthUser | null,
  action: Action,
  resource: Resource,
  context?: PermissionContext
): boolean {
  // Public read actions
  if (!user) {
    if (action === "read") {
      if (resource === "profile") return true; // Public creator profiles
      if (resource === "portfolio_item") return context?.isPublished !== false;
      if (resource === "brief") return context?.status === "published" || context?.status === undefined;
    }
    return false;
  }

  // Admin has global rights, with strict audit logging
  if (user.role === "admin") {
    // Audit logs are read-only even for admin (immutable system log)
    if (resource === "audit_log" && (action === "update" || action === "delete")) {
      return false;
    }
    return true;
  }

  // 1. Profile Resource
  if (resource === "profile") {
    if (action === "read") return true;
    if (action === "update") return context?.ownerId === user.id;
    if (action === "delete") return context?.ownerId === user.id;
    return false;
  }

  // 2. Portfolio Items
  if (resource === "portfolio_item") {
    if (action === "read") return true;
    if (user.role !== "creator") return false;
    if (action === "create") return user.emailVerified;
    if (action === "update" || action === "delete" || action === "publish") {
      return context?.ownerId === user.id || context?.creatorId === user.id;
    }
    return false;
  }

  // 3. Creative Briefs
  if (resource === "brief") {
    if (action === "read") {
      return context?.status === "published" || context?.ownerId === user.id || context?.brandId === user.id;
    }
    if (user.role !== "brand") return false;
    if (action === "create") return user.emailVerified;
    if (action === "update" || action === "delete" || action === "publish") {
      return context?.ownerId === user.id || context?.brandId === user.id;
    }
    return false;
  }

  // 4. Proposals
  if (resource === "proposal") {
    if (action === "read") {
      // Creator can read own proposal; Brand can read proposal submitted to their brief
      return (
        context?.creatorId === user.id ||
        context?.ownerId === user.id ||
        context?.brandId === user.id
      );
    }
    if (action === "create") {
      return user.role === "creator" && user.emailVerified;
    }
    if (action === "update") {
      // Creator can edit/withdraw; Brand can change review status (accept/decline)
      return (
        (user.role === "creator" && context?.creatorId === user.id) ||
        (user.role === "brand" && context?.brandId === user.id)
      );
    }
    return false;
  }

  // 5. Engagements & Contracts
  if (resource === "engagement") {
    const isParticipant =
      context?.participants?.includes(user.id) ||
      context?.creatorId === user.id ||
      context?.brandId === user.id;

    if (action === "read") return isParticipant;
    if (action === "update") return isParticipant;
    return false;
  }

  // 6. Direct Messages
  if (resource === "message") {
    const isParticipant =
      context?.participants?.includes(user.id) ||
      context?.creatorId === user.id ||
      context?.brandId === user.id;

    if (action === "read") return isParticipant;
    if (action === "create") return isParticipant && user.emailVerified;
    return false;
  }

  // 7. Deliverables (Private Storage)
  if (resource === "deliverable") {
    const isParticipant =
      context?.participants?.includes(user.id) ||
      context?.creatorId === user.id ||
      context?.brandId === user.id;

    if (action === "read") return isParticipant;
    // Only creator participant can upload deliverable
    if (action === "create") return user.role === "creator" && (context?.creatorId === user.id || isParticipant);
    return false;
  }

  // 8. Verification Signals
  if (resource === "verification") {
    if (action === "create") return user.role === "creator"; // Creators can submit verification requests
    // Only admins can approve or modify status
    return false;
  }

  // 9. Audit Log
  if (resource === "audit_log") {
    return false; // Non-admins have zero access to audit logs
  }

  return false;
}

/**
 * Asserts that a user is authenticated. Throws AuthorizationError (401) if not.
 */
export function requireUser(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new AuthorizationError("Authentication required.", "UNAUTHENTICATED", 401);
  }
  return user;
}

/**
 * Asserts that the authenticated user possesses an allowed role. Throws 403 if not.
 */
export function requireRole(
  user: AuthUser | null,
  allowedRoles: UserRole | readonly UserRole[]
): AuthUser {
  const verifiedUser = requireUser(user);
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(verifiedUser.role)) {
    throw new AuthorizationError(
      `Access denied. Required role: ${roles.join(" or ")}. Current role: ${verifiedUser.role}.`,
      "FORBIDDEN",
      403
    );
  }
  return verifiedUser;
}

/**
 * Asserts that the authenticated user is the owner of the resource or an admin.
 * Uses 404 (Insecure Direct Object Reference prevention) to avoid resource existence leaks.
 */
export function requireOwnership(
  user: AuthUser | null,
  resourceOwnerId: string,
  resourceName: string = "Resource"
): AuthUser {
  const verifiedUser = requireUser(user);
  if (verifiedUser.role === "admin") return verifiedUser;

  if (verifiedUser.id !== resourceOwnerId) {
    // Return 404 to avoid leaking resource existence to potential attackers
    throw new AuthorizationError(`${resourceName} not found.`, "NOT_FOUND", 404);
  }
  return verifiedUser;
}

/**
 * Asserts that the user's email is verified prior to taking sensitive publishing actions.
 */
export function requireVerifiedEmail(user: AuthUser | null): AuthUser {
  const verifiedUser = requireUser(user);
  if (!verifiedUser.emailVerified && verifiedUser.role !== "admin") {
    throw new AuthorizationError(
      "Email verification is required before performing this action.",
      "EMAIL_NOT_VERIFIED",
      403
    );
  }
  return verifiedUser;
}

/**
 * Asserts Authenticator Assurance Level 2 (AAL2) MFA for admin and sensitive financial operations.
 */
export function requireAal2(user: AuthUser | null): AuthUser {
  const verifiedUser = requireUser(user);
  if (verifiedUser.role === "admin" && verifiedUser.mfaLevel !== "aal2") {
    throw new AuthorizationError(
      "Multi-Factor Authentication (AAL2) verification required for administrative actions.",
      "MFA_REQUIRED",
      403
    );
  }
  return verifiedUser;
}
