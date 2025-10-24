import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  ApiUser,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  loginRequest,
  registerRequest,
  setAuthToken,
} from '@/services/api';

interface AuthContextState {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setUser: (user: ApiUser | null) => void;
}

const TOKEN_KEY = 'gizichain_token';
const USER_KEY = 'gizichain_user';

export const AuthContext = createContext<AuthContextState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback(async (nextToken: string, nextUser: ApiUser) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, nextToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser)),
    ]);
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const restoreAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);
      }

      if (storedUser) {
        const parsedUser: ApiUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn('Failed to restore authentication state', error);
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      await persistAuth(response.token, response.user);
      return response;
    },
    [persistAuth],
  );

  const handleRegister = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerRequest(payload);
      await persistAuth(response.token, response.user);
      return response;
    },
    [persistAuth],
  );

  const handleLogout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setAuthToken(null);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      setUser,
    }),
    [handleLogin, handleLogout, handleRegister, isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
