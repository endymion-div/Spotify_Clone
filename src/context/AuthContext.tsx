import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  createDefaultProfile,
  createDefaultSettings,
  DEMO_USER_ID,
  musicService,
} from '../services/musicService';
import type { NotificationItem, ThemeMode, UserProfile, UserSettings } from '../types/music';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: UserProfile | null;
  settings: UserSettings;
  isLoading: boolean;
  isDemoMode: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  loginWithDemoAccount: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'bio'>>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'created_at'>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New curated mix ready',
    message: 'Night Drive Essentials was updated with 5 electronic tracks.',
    type: 'playlist',
    read: false,
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
    href: '/playlist/pl-1',
  },
  {
    id: 'notif-2',
    title: 'Fresh recommendation',
    message: 'Because you listened to Nova Lane, explore Tarek Vance.',
    type: 'recommendation',
    read: false,
    created_at: new Date(Date.now() - 7_200_000).toISOString(),
    href: '/artist/art-15',
  },
];

function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => createDefaultSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user && active) {
            const authUser = data.session.user;
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

            const profile: UserProfile = profileData
              ? (profileData as UserProfile)
              : createDefaultProfile(
                  authUser.id,
                  authUser.email ?? '',
                  (authUser.user_metadata?.full_name as string) ?? 'Listener'
                );

            const loadedSettings = await musicService.loadSettings(profile.id);
            if (active) {
              setUser(profile);
              setSettings(loadedSettings);
              applyThemeToDocument(loadedSettings.theme);
            }
            return;
          }
        }

        // Demo session check (or auto-restore persisted demo profile)
        const demoProfile = musicService.loadDemoProfile();
        const loadedSettings = await musicService.loadSettings(demoProfile?.id ?? DEMO_USER_ID);
        if (active) {
          setUser(demoProfile);
          setSettings(loadedSettings);
          applyThemeToDocument(loadedSettings.theme);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    initAuth();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemTheme = () => {
      setSettings((curr) => {
        if (curr.theme === 'system') applyThemeToDocument('system');
        return curr;
      });
    };
    mediaQuery.addEventListener('change', handleSystemTheme);

    return () => {
      active = false;
      mediaQuery.removeEventListener('change', handleSystemTheme);
    };
  }, []);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, 'id' | 'read' | 'created_at'>) => {
      setNotifications((prev) => [
        {
          ...item,
          id: `notif-${Date.now()}`,
          read: false,
          created_at: new Date().toISOString(),
        },
        ...prev.slice(0, 14),
      ]);
    },
    []
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        showToast('Please enter your email and password.', 'error');
        return false;
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error || !data.user) {
          showToast(error?.message ?? 'Invalid email or password.', 'error');
          return false;
        }
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profile = profileData
          ? (profileData as UserProfile)
          : createDefaultProfile(
              data.user.id,
              data.user.email ?? cleanEmail,
              (data.user.user_metadata?.full_name as string) ?? cleanEmail.split('@')[0]
            );
        const loadedSettings = await musicService.loadSettings(profile.id);
        setUser(profile);
        setSettings(loadedSettings);
        applyThemeToDocument(loadedSettings.theme);
        showToast(`Welcome back, ${profile.full_name}.`, 'success');
        return true;
      }

      // Local Demo Mode sign-in (accepts valid credentials without hardcoding a secret)
      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return false;
      }
      const inferredName = cleanEmail.split('@')[0].replace(/[._-]+/g, ' ');
      const displayName =
        inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
      const demoProfile = createDefaultProfile(DEMO_USER_ID, cleanEmail, displayName || 'Sneha');
      musicService.saveDemoProfile(demoProfile);
      setUser(demoProfile);
      addNotification({
        title: 'Account activity',
        message: `Signed in to Soundify as ${demoProfile.full_name}.`,
        type: 'account',
        href: '/profile',
      });
      showToast(`Signed in as ${demoProfile.full_name}.`, 'success');
      return true;
    },
    [addNotification, showToast]
  );

  const signup = useCallback(
    async (fullName: string, email: string, password: string): Promise<boolean> => {
      const cleanName = fullName.trim();
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanName || !cleanEmail || password.length < 6) {
        showToast('Please provide a valid name, email, and 6+ character password.', 'error');
        return false;
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: cleanName } },
        });
        if (error) {
          showToast(error.message, 'error');
          return false;
        }
        if (data.user) {
          const profile = createDefaultProfile(data.user.id, cleanEmail, cleanName);
          setUser(profile);
          showToast('Account created! Welcome to Soundify.', 'success');
          return true;
        }
      }

      const profile = createDefaultProfile(DEMO_USER_ID, cleanEmail, cleanName);
      musicService.saveDemoProfile(profile);
      setUser(profile);
      addNotification({
        title: 'Welcome to Soundify',
        message: 'Your listener profile has been created.',
        type: 'account',
        href: '/profile',
      });
      showToast(`Welcome to Soundify, ${cleanName}.`, 'success');
      return true;
    },
    [addNotification, showToast]
  );

  const loginWithDemoAccount = useCallback(async () => {
    const profile = createDefaultProfile(DEMO_USER_ID, 'sneha@soundify.demo', 'Sneha');
    musicService.saveDemoProfile(profile);
    const loadedSettings = await musicService.loadSettings(profile.id);
    setUser(profile);
    setSettings(loadedSettings);
    applyThemeToDocument(loadedSettings.theme);
    showToast('Signed in with Demo Account (Sneha).', 'success');
  }, [showToast]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        showToast('Please enter a valid email address.', 'error');
        return false;
      }
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          showToast(error.message, 'error');
          return false;
        }
      }
      showToast(`Password reset instructions prepared for ${cleanEmail}.`, 'success');
      return true;
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    musicService.saveDemoProfile(null);
    setUser(null);
    showToast('Signed out of Soundify.', 'info');
  }, [showToast]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'bio'>>) => {
      if (!user) return;
      const next: UserProfile = { ...user, ...updates };
      setUser(next);

      if (isSupabaseConfigured && supabase && user.id !== DEMO_USER_ID) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: next.full_name,
            avatar_url: next.avatar_url,
            bio: next.bio,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        if (error) {
          showToast('Unable to save profile changes to database.', 'error');
          return;
        }
      } else {
        musicService.saveDemoProfile(next);
      }
      showToast('Profile updated.', 'success');
    },
    [showToast, user]
  );

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      const next: UserSettings = { ...settings, ...updates, user_id: user?.id ?? settings.user_id };
      setSettings(next);
      if (updates.theme) {
        applyThemeToDocument(updates.theme);
      }
      await musicService.saveSettings(next);
    },
    [settings, user]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        isLoading,
        isDemoMode: !isSupabaseConfigured || user?.id === DEMO_USER_ID,
        notifications,
        unreadCount,
        login,
        signup,
        loginWithDemoAccount,
        requestPasswordReset,
        logout,
        updateProfile,
        updateSettings,
        addNotification,
        markAllNotificationsRead,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
