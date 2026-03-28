import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../shared/config/storageKeys";
import { readJson, removeKey, writeJson } from "../shared/storage/jsonStorage";

export function useCompanySession() {
  const [company, setCompany] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompany(readJson(STORAGE_KEYS.COMPANY, null));
    setReady(true);
  }, []);

  const completeOnboarding = useCallback((data) => {
    setCompany(data);
    writeJson(STORAGE_KEYS.COMPANY, data);
  }, []);

  const resetCompany = useCallback(() => {
    setCompany(null);
    removeKey(STORAGE_KEYS.COMPANY);
  }, []);

  return { company, ready, completeOnboarding, resetCompany };
}
