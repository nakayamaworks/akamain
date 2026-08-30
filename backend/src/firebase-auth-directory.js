import { GoogleAuth } from "google-auth-library";

const IDENTITY_TOOLKIT_API = "https://identitytoolkit.googleapis.com/v1/projects";
const LOOKUP_BATCH_SIZE = 100;

export class FirebaseAuthDirectory {
  constructor(options = {}) {
    if (!options.projectId) {
      throw Object.assign(new Error("FIREBASE_PROJECT_ID is required"), {
        code: "FIREBASE_DIRECTORY_NOT_CONFIGURED",
      });
    }
    this.projectId = options.projectId;
    this.auth = options.auth || new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    this.clientPromise = null;
  }

  async lookupExistingUserIds(localIds) {
    const requested = [...new Set(
      (localIds || []).map((value) => String(value || "").trim()).filter(Boolean)
    )];
    if (!requested.length) {
      return new Set();
    }

    try {
      const client = await this.getClient();
      const existing = new Set();
      for (let index = 0; index < requested.length; index += LOOKUP_BATCH_SIZE) {
        const batch = requested.slice(index, index + LOOKUP_BATCH_SIZE);
        const response = await client.request({
          url: `${IDENTITY_TOOLKIT_API}/${encodeURIComponent(this.projectId)}/accounts:lookup`,
          method: "POST",
          data: { localId: batch },
        });
        for (const user of response.data.users || []) {
          if (user.localId) {
            existing.add(user.localId);
          }
        }
      }
      return existing;
    } catch (error) {
      if (error?.code === "FIREBASE_DIRECTORY_NOT_CONFIGURED") {
        throw error;
      }
      throw Object.assign(new Error("Firebase Authenticationの利用者を確認できませんでした。", {
        cause: error,
      }), { code: "FIREBASE_DIRECTORY_UNAVAILABLE" });
    }
  }

  async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = this.auth.getClient();
    }
    return this.clientPromise;
  }
}
