export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Polyfill localStorage for server-side
    if (typeof window === 'undefined') {
      // @ts-ignore
      global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };
    }
  }
}
