import { MemoryStorageRepository } from "./memory-storage-repository.js";
import { SheetsStorageRepository } from "./sheets-storage-repository.js";
import { storageError } from "./storage-repository.js";

export function createStorageRepository(environment = process.env) {
  const driver = String(environment.STORAGE_DRIVER || "memory").toLowerCase();
  if (driver === "memory") {
    return new MemoryStorageRepository();
  }
  if (driver === "sheets") {
    return new SheetsStorageRepository({
      spreadsheetId: environment.GOOGLE_SHEETS_SPREADSHEET_ID,
      impersonateServiceAccount: environment.GOOGLE_IMPERSONATE_SERVICE_ACCOUNT,
    });
  }
  throw storageError("STORAGE_NOT_CONFIGURED", `Unsupported STORAGE_DRIVER: ${driver}`);
}
