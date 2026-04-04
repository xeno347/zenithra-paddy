import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../lib/config/storageKeys";
import { readJson, removeKey, writeJson } from "../lib/storage/jsonStorage";

type LoginCredentials = {
  loginId: string;
  password: string;
};

function generateCredentials(operatorName: string): LoginCredentials {
  const seed = (operatorName || "paddy")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);

  const loginId = `${seed}${Math.floor(1000 + Math.random() * 9000)}`;
  const password = `Paddy@${Math.floor(100 + Math.random() * 900)}`;
  return { loginId, password };
}

export function useCompanySession() {
  const [company, setCompany] = useState(null);
  const [credentials, setCredentials] = useState<LoginCredentials | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCompany(readJson(STORAGE_KEYS.COMPANY, null));
    setCredentials(readJson(STORAGE_KEYS.CREDENTIALS, null));
    setIsAuthenticated(readJson(STORAGE_KEYS.AUTH_SESSION, false));
    setReady(true);
  }, []);

  const completeOnboarding = useCallback((data) => {
    const createdCredentials = generateCredentials(data?.operatorName || "company");
    setCompany(data);
    setCredentials(createdCredentials);
    setIsAuthenticated(true);

    writeJson(STORAGE_KEYS.COMPANY, data);
    writeJson(STORAGE_KEYS.CREDENTIALS, createdCredentials);
    writeJson(STORAGE_KEYS.AUTH_SESSION, true);

    return createdCredentials;
  }, []);

  const activateProjectSession = useCallback((data, projectCredentials) => {
    setCompany(data);
    setCredentials(projectCredentials || null);
    setIsAuthenticated(Boolean(projectCredentials));

    writeJson(STORAGE_KEYS.COMPANY, data);
    writeJson(STORAGE_KEYS.CREDENTIALS, projectCredentials || null);
    writeJson(STORAGE_KEYS.AUTH_SESSION, Boolean(projectCredentials));
  }, []);

  const loginToDashboard = useCallback((loginId: string, password: string) => {
    const ok =
      credentials?.loginId === (loginId || "").trim() &&
      credentials?.password === (password || "").trim();

    if (!ok) return false;

    setIsAuthenticated(true);
    writeJson(STORAGE_KEYS.AUTH_SESSION, true);
    return true;
  }, [credentials]);

  const logoutFromDashboard = useCallback(() => {
    setIsAuthenticated(false);
    writeJson(STORAGE_KEYS.AUTH_SESSION, false);
  }, []);

  const resetCompany = useCallback(() => {
    setCompany(null);
    setCredentials(null);
    setIsAuthenticated(false);

    removeKey(STORAGE_KEYS.COMPANY);
    removeKey(STORAGE_KEYS.CREDENTIALS);
    removeKey(STORAGE_KEYS.AUTH_SESSION);
  }, []);

  return {
    company,
    credentials,
    isAuthenticated,
    ready,
    completeOnboarding,
    activateProjectSession,
    loginToDashboard,
    logoutFromDashboard,
    resetCompany,
  };
}
