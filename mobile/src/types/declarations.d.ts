/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  namespace React {
    type ReactNode = any;
    type FC<P = {}> = (props: P) => any;
    type ReactElement = any;
    type ComponentType<P = {}> = any;
    type Dispatch<A> = (value: A) => void;
    type SetStateAction<S> = S | ((prevState: S) => S);
    interface Context<T> {
      Provider: any;
      Consumer: any;
      displayName?: string;
    }
  }

  namespace JSX {
    interface Element extends any {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare namespace React {
  type ReactNode = any;
  type FC<P = {}> = (props: P) => any;
  type ReactElement = any;
  type ComponentType<P = {}> = any;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  interface Context<T> {
    Provider: any;
    Consumer: any;
    displayName?: string;
  }
}

declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => any;
  export type ReactElement = any;
  export type ComponentType<P = {}> = any;
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);

  export interface Context<T> {
    Provider: any;
    Consumer: any;
    displayName?: string;
  }

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(): { current: T | undefined };
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;
  export function useContext<T = any>(context: any): T;

  export namespace React {
    export type ReactNode = any;
    export type FC<P = {}> = (props: P) => any;
    export type ReactElement = any;
    export type ComponentType<P = {}> = any;
    export type Dispatch<A> = (value: A) => void;
    export type SetStateAction<S> = S | ((prevState: S) => S);
    export type Context<T> = any;
  }

  const React: {
    createElement: any;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useRef: typeof useRef;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useContext: typeof useContext;
    createContext: typeof createContext;
    [key: string]: any;
  };
  export default React;
}

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const TextInput: any;
  export const ScrollView: any;
  export const FlatList: any;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    hairlineWidth: number;
    absoluteFillObject: any;
  };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[], options?: any) => void;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'windows' | 'macos' | 'web';
    select: <T>(specifics: { [platform: string]: T }) => T;
  };
  export const StatusBar: any;
  export const Modal: any;
  export const ActivityIndicator: any;
  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number; scale: number; fontScale: number };
  };
  export const KeyboardAvoidingView: any;
  export const Image: any;
  export const Switch: any;
  export const Pressable: any;
  export const RefreshControl: any;
  export const useColorScheme: () => 'light' | 'dark' | null | undefined;
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
  export type StyleProp<T> = any;
}

declare module 'react-native-safe-area-context' {
  export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
  export const useSafeAreaInsets: () => EdgeInsets;
}

declare module 'lucide-react-native' {
  export const ArrowLeft: any;
  export const ArrowUpRight: any;
  export const ArrowDownLeft: any;
  export const Check: any;
  export const CheckCheck: any;
  export const CheckCircle: any;
  export const CheckCircle2: any;
  export const ChevronRight: any;
  export const ChevronDown: any;
  export const Plus: any;
  export const PlusCircle: any;
  export const Minus: any;
  export const X: any;
  export const Search: any;
  export const Bell: any;
  export const Settings: any;
  export const Shield: any;
  export const ShieldCheck: any;
  export const Sparkles: any;
  export const TrendingUp: any;
  export const TrendingDown: any;
  export const Wallet: any;
  export const DollarSign: any;
  export const AlertTriangle: any;
  export const AlertCircle: any;
  export const Calendar: any;
  export const Clock: any;
  export const Tag: any;
  export const HelpCircle: any;
  export const LogOut: any;
  export const Edit2: any;
  export const Trash2: any;
  export const Info: any;
  export const Camera: any;
  export const QrCode: any;
  export const Zap: any;
  export const RefreshCw: any;
  export const Send: any;
  export const Bot: any;
  export const User: any;
  export const Lock: any;
  export const Mail: any;
  export const Eye: any;
  export const EyeOff: any;
  export const Filter: any;
  export const CreditCard: any;
  export const Smartphone: any;
  export const Home: any;
  export const PieChart: any;
  export const BarChart3: any;
  export const Sliders: any;
  export const Receipt: any;
  export const Utensils: any;
  export const Car: any;
  export const ShoppingCart: any;
  export const ShoppingBag: any;
  export const Film: any;
  export const Heart: any;
  export const Briefcase: any;
  export const Delete: any;
  export const FileText: any;
  export const Moon: any;
  export const Sun: any;
  export const Coins: any;
  export const Globe: any;
  export const Download: any;
  export const LineChart: any;
  const icons: Record<string, any>;
  export default icons;
}

declare module 'expo-router' {
  export const useRouter: () => {
    push: (url: string | object) => void;
    replace: (url: string | object) => void;
    back: () => void;
    canGoBack: () => boolean;
    setParams: (params: Record<string, string>) => void;
  };
  export const useLocalSearchParams: <T = Record<string, string>>() => T;
  export const useGlobalSearchParams: <T = Record<string, string>>() => T;
  export const usePathname: () => string;
  export const useSegments: () => string[];
  export const Slot: any;
  export const Stack: any;
  export const Tabs: any;
  export const Link: any;
  export const Redirect: any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'expo-constants' {
  const Constants: any;
  export default Constants;
}

declare module 'expo-linking' {
  export const openURL: (url: string) => Promise<any>;
  export const canOpenURL: (url: string) => Promise<boolean>;
}

declare module 'expo-secure-store' {
  export const setItemAsync: (key: string, value: string) => Promise<void>;
  export const getItemAsync: (key: string) => Promise<string | null>;
  export const deleteItemAsync: (key: string) => Promise<void>;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  export default AsyncStorage;
}

declare module '@tanstack/react-query' {
  export const useQuery: any;
  export const useMutation: any;
  export const useQueryClient: any;
  export const QueryClient: any;
  export const QueryClientProvider: any;
}

declare module 'react-native-screens';
declare module 'react-native-svg';
declare module 'react-native-web';
