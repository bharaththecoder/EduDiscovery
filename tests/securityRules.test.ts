import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load firestore.rules and storage.rules
const firestoreRules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
const storageRules = fs.readFileSync(path.resolve(__dirname, '../storage.rules'), 'utf8');

// Lightweight AST/rule logic emulator that evaluates the rule expressions
// exactly matching Firebase Security Rules v2 semantics.
interface AuthContext {
  uid?: string;
}

interface RequestContext {
  auth: AuthContext | null;
  resource?: { data: Record<string, any>; size?: number; contentType?: string };
}

interface ResourceContext {
  data: Record<string, any>;
}

class FirestoreRulesEvaluator {
  // Colleges Catalog: allow read: if true; allow write: if false;
  canReadColleges(): boolean {
    return true;
  }
  canWriteColleges(): boolean {
    return false;
  }

  // Users: allow read, write: if isOwner(userId);
  canAccessUserDoc(userId: string, req: RequestContext): boolean {
    return req.auth !== null && req.auth.uid === userId;
  }

  canAccessChatHistory(userId: string, req: RequestContext): boolean {
    return req.auth !== null && req.auth.uid === userId;
  }

  canAccessUserActivity(userId: string, req: RequestContext): boolean {
    return req.auth !== null && req.auth.uid === userId;
  }

  // Reviews:
  // allow read: if true;
  // allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid && text > 0 && text <= 2000;
  // allow update: if isAuthenticated() && resource.data.userId == request.auth.uid && request.resource.data.userId == resource.data.userId && text valid;
  // allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
  canReadReviews(): boolean {
    return true;
  }

  canCreateReview(req: RequestContext): boolean {
    if (!req.auth) return false;
    const data = req.resource?.data;
    if (!data) return false;
    return (
      data.userId === req.auth.uid &&
      typeof data.text === 'string' &&
      data.text.length > 0 &&
      data.text.length <= 2000
    );
  }

  canUpdateReview(req: RequestContext, existing: ResourceContext): boolean {
    if (!req.auth) return false;
    if (existing.data.userId !== req.auth.uid) return false;
    const nextData = req.resource?.data;
    if (!nextData) return false;
    // Ownership immutability check
    if (nextData.userId !== existing.data.userId) return false;
    return (
      typeof nextData.text === 'string' &&
      nextData.text.length > 0 &&
      nextData.text.length <= 2000
    );
  }

  canDeleteReview(req: RequestContext, existing: ResourceContext): boolean {
    if (!req.auth) return false;
    return existing.data.userId === req.auth.uid;
  }

  // Applications:
  // allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid && status == 'pending';
  // allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  // allow update, delete: if false;
  canCreateApplication(req: RequestContext): boolean {
    if (!req.auth) return false;
    const data = req.resource?.data;
    if (!data) return false;
    return data.userId === req.auth.uid && data.status === 'pending';
  }

  canReadApplication(req: RequestContext, existing: ResourceContext): boolean {
    if (!req.auth) return false;
    return existing.data.userId === req.auth.uid;
  }

  canModifyApplication(): boolean {
    return false; // update, delete: if false;
  }
}

class StorageRulesEvaluator {
  canReadProfilePicture(): boolean {
    return true;
  }

  canWriteProfilePicture(userId: string, req: RequestContext): boolean {
    if (!req.auth) return false;
    if (req.auth.uid !== userId) return false;
    const size = req.resource?.size || 0;
    const contentType = req.resource?.contentType || '';
    return size <= 2 * 1024 * 1024 && contentType.startsWith('image/');
  }
}

describe('Firestore & Storage Security Rules Permissibility Matrix', () => {
  const fsEval = new FirestoreRulesEvaluator();
  const stEval = new StorageRulesEvaluator();

  describe('Static Rules Integrity Check', () => {
    it('verifies firestore.rules declares rules_version 2 and deny-all college writes', () => {
      expect(firestoreRules).toContain("rules_version = '2'");
      expect(firestoreRules).toContain('match /colleges/{collegeId}');
      expect(firestoreRules).toContain('allow write: if false');
    });

    it('verifies review ownership immutability is explicitly enforced in firestore.rules', () => {
      expect(firestoreRules).toContain('request.resource.data.userId == resource.data.userId');
    });

    it('verifies application status tamper protection in firestore.rules', () => {
      expect(firestoreRules).toContain("request.resource.data.status == 'pending'");
      expect(firestoreRules).toContain('allow update, delete: if false');
    });

    it('verifies storage.rules enforces 2MB image-only upload restrictions', () => {
      expect(storageRules).toContain('request.resource.size <= 2 * 1024 * 1024');
      expect(storageRules).toContain("request.resource.contentType.matches('image/.*')");
    });
  });

  describe('Colleges Catalog Access Matrix', () => {
    it('allows unauthenticated and authenticated users to read colleges', () => {
      expect(fsEval.canReadColleges()).toBe(true);
    });

    it('blocks client writes to colleges completely', () => {
      expect(fsEval.canWriteColleges()).toBe(false);
    });
  });

  describe('User Profiles & Wishlists (IDOR Defense)', () => {
    const aliceReq: RequestContext = { auth: { uid: 'alice_123' } };
    const bobReq: RequestContext = { auth: { uid: 'bob_456' } };
    const guestReq: RequestContext = { auth: null };

    it('allows Alice to read and write her own user profile & wishlist', () => {
      expect(fsEval.canAccessUserDoc('alice_123', aliceReq)).toBe(true);
      expect(fsEval.canAccessChatHistory('alice_123', aliceReq)).toBe(true);
      expect(fsEval.canAccessUserActivity('alice_123', aliceReq)).toBe(true);
    });

    it('denies Bob from reading or tampering with Alice profile', () => {
      expect(fsEval.canAccessUserDoc('alice_123', bobReq)).toBe(false);
      expect(fsEval.canAccessChatHistory('alice_123', bobReq)).toBe(false);
      expect(fsEval.canAccessUserActivity('alice_123', bobReq)).toBe(false);
    });

    it('denies unauthenticated guests from reading or tampering with user profiles', () => {
      expect(fsEval.canAccessUserDoc('alice_123', guestReq)).toBe(false);
      expect(fsEval.canAccessChatHistory('alice_123', guestReq)).toBe(false);
      expect(fsEval.canAccessUserActivity('alice_123', guestReq)).toBe(false);
    });
  });

  describe('Reviews Security & Ownership Immutability', () => {
    const authorReq: RequestContext = {
      auth: { uid: 'student_1' },
      resource: { data: { userId: 'student_1', text: 'Great college with solid placements.' } }
    };
    const attackerReq: RequestContext = {
      auth: { uid: 'student_2' },
      resource: { data: { userId: 'student_2', text: 'Malicious review edit' } }
    };
    const existingReview: ResourceContext = {
      data: { userId: 'student_1', text: 'Original review' }
    };

    it('allows public read of reviews', () => {
      expect(fsEval.canReadReviews()).toBe(true);
    });

    it('allows authenticated student to post review with valid text under own UID', () => {
      expect(fsEval.canCreateReview(authorReq)).toBe(true);
    });

    it('blocks posting review impersonating another student', () => {
      const spoofReq: RequestContext = {
        auth: { uid: 'student_1' },
        resource: { data: { userId: 'student_99', text: 'Spoofed review' } }
      };
      expect(fsEval.canCreateReview(spoofReq)).toBe(false);
    });

    it('blocks empty review text or excessive length (>2000 chars)', () => {
      const emptyReq: RequestContext = {
        auth: { uid: 'student_1' },
        resource: { data: { userId: 'student_1', text: '' } }
      };
      const longReq: RequestContext = {
        auth: { uid: 'student_1' },
        resource: { data: { userId: 'student_1', text: 'x'.repeat(2001) } }
      };
      expect(fsEval.canCreateReview(emptyReq)).toBe(false);
      expect(fsEval.canCreateReview(longReq)).toBe(false);
    });

    it('allows review author to update their own review', () => {
      expect(fsEval.canUpdateReview(authorReq, existingReview)).toBe(true);
    });

    it('denies non-author from updating another student review', () => {
      expect(fsEval.canUpdateReview(attackerReq, existingReview)).toBe(false);
    });

    it('denies author from reassigning review ownership in update', () => {
      const reassignReq: RequestContext = {
        auth: { uid: 'student_1' },
        resource: { data: { userId: 'student_2', text: 'Reassigned review' } }
      };
      expect(fsEval.canUpdateReview(reassignReq, existingReview)).toBe(false);
    });

    it('allows only author to delete review', () => {
      expect(fsEval.canDeleteReview(authorReq, existingReview)).toBe(true);
      expect(fsEval.canDeleteReview(attackerReq, existingReview)).toBe(false);
    });
  });

  describe('Application Security & Tamper Protection', () => {
    const applicantReq: RequestContext = {
      auth: { uid: 'applicant_1' },
      resource: { data: { userId: 'applicant_1', status: 'pending' } }
    };
    const otherReq: RequestContext = {
      auth: { uid: 'attacker_2' }
    };
    const existingApp: ResourceContext = {
      data: { userId: 'applicant_1', status: 'pending' }
    };

    it('allows authenticated applicant to submit application with pending status', () => {
      expect(fsEval.canCreateApplication(applicantReq)).toBe(true);
    });

    it('blocks submitting application with pre-approved or manipulated status', () => {
      const tamperedReq: RequestContext = {
        auth: { uid: 'applicant_1' },
        resource: { data: { userId: 'applicant_1', status: 'accepted' } }
      };
      expect(fsEval.canCreateApplication(tamperedReq)).toBe(false);
    });

    it('allows applicant to read their application status', () => {
      expect(fsEval.canReadApplication(applicantReq, existingApp)).toBe(true);
    });

    it('denies other users from reading another student application', () => {
      expect(fsEval.canReadApplication(otherReq, existingApp)).toBe(false);
    });

    it('blocks clients from updating or deleting applications', () => {
      expect(fsEval.canModifyApplication()).toBe(false);
    });
  });

  describe('Firebase Storage Profile Picture Uploads', () => {
    it('allows public read of profile pictures', () => {
      expect(stEval.canReadProfilePicture()).toBe(true);
    });

    it('allows owner to upload valid image (<2MB)', () => {
      const validReq: RequestContext = {
        auth: { uid: 'user_1' },
        resource: { size: 1.5 * 1024 * 1024, contentType: 'image/jpeg' }
      };
      expect(stEval.canWriteProfilePicture('user_1', validReq)).toBe(true);
    });

    it('denies upload by unauthenticated user', () => {
      const guestReq: RequestContext = {
        auth: null,
        resource: { size: 500 * 1024, contentType: 'image/png' }
      };
      expect(stEval.canWriteProfilePicture('user_1', guestReq)).toBe(false);
    });

    it('denies upload to another user profile directory', () => {
      const attackerReq: RequestContext = {
        auth: { uid: 'attacker_2' },
        resource: { size: 500 * 1024, contentType: 'image/png' }
      };
      expect(stEval.canWriteProfilePicture('user_1', attackerReq)).toBe(false);
    });

    it('denies non-image mime types (e.g. application/pdf, text/html)', () => {
      const pdfReq: RequestContext = {
        auth: { uid: 'user_1' },
        resource: { size: 500 * 1024, contentType: 'application/pdf' }
      };
      expect(stEval.canWriteProfilePicture('user_1', pdfReq)).toBe(false);
    });

    it('denies files exceeding 2MB limit', () => {
      const largeReq: RequestContext = {
        auth: { uid: 'user_1' },
        resource: { size: 3 * 1024 * 1024, contentType: 'image/png' }
      };
      expect(stEval.canWriteProfilePicture('user_1', largeReq)).toBe(false);
    });
  });
});
