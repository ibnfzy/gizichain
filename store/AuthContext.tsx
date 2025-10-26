import {
  ApiUser,
  AuthPayload,
  LoginPayload,
  loginRequest,
  RegisterPayload,
  registerRequest,
  setAuthToken,
} from "@/services/api";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { deleteItemAsync, getItemAsync, setItemAsync } from "./secureStorage";

type ApiUserWithLegacyMotherId = ApiUser & {
  mother_id?: string | number | null;
};

interface AuthContextState {
  user: ApiUser | null;
  motherId: string | number | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthPayload>;
  register: (payload: RegisterPayload) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  setUser: (user: ApiUser | null) => void;
}

const TOKEN_KEY = "gizichain_token";
const USER_KEY = "gizichain_user";

export const AuthContext = createContext<AuthContextState | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

const extractMotherId = (
  user: ApiUserWithLegacyMotherId | null
): string | number | null => {
  if (!user) {
    return null;
  }

  if (user.motherId !== undefined && user.motherId !== null) {
    return user.motherId;
  }

  if (user.mother_id !== undefined && user.mother_id !== null) {
    return user.mother_id;
  }

  return null;
};

const normalizeUser = (nextUser: ApiUser): ApiUserWithLegacyMotherId => {
  const candidate = nextUser as ApiUserWithLegacyMotherId;
  const motherId = extractMotherId(candidate);

  return motherId === null
    ? { ...candidate, motherId: undefined }
    : { ...candidate, motherId };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUserState] = useState<ApiUserWithLegacyMotherId | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const motherId = extractMotherId(user);

  const setUser = useCallback((nextUser: ApiUser | null) => {
    if (!nextUser) {
      setUserState(null);
      return;
    }

    setUserState(normalizeUser(nextUser));
  }, []);

  const persistAuth = useCallback(
    async (nextToken: string, nextUser: ApiUser) => {
      const normalizedUser = normalizeUser(nextUser);

      await Promise.all([
        setItemAsync(TOKEN_KEY, String(nextToken)),
        setItemAsync(USER_KEY, JSON.stringify(normalizedUser)),
      ]);
      setAuthToken(nextToken);
      setToken(nextToken);
      setUserState(normalizedUser);
    },
    []
  );

  const restoreAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        getItemAsync(TOKEN_KEY),
        getItemAsync(USER_KEY),
      ]);

      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);
      }

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as ApiUserWithLegacyMotherId;
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn("Failed to restore authentication state", error);
      await Promise.all([
        deleteItemAsync(TOKEN_KEY),
        deleteItemAsync(USER_KEY),
      ]);
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      await persistAuth(response.token, response.user);
      return response;
    },
    [persistAuth]
  );

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerRequest(payload);
      console.log(response);
      await persistAuth(response.token, response.user);
      return response;
    },
    [persistAuth]
  );

  const handleLogout = useCallback(async () => {
    await Promise.all([deleteItemAsync(TOKEN_KEY), deleteItemAsync(USER_KEY)]);
    setAuthToken(null);
    setUser(null);
    setToken(null);
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      motherId,
      token,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      setUser,
    }),
    [
      handleLogin,
      handleLogout,
      handleRegister,
      isLoading,
      motherId,
      setUser,
      token,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
