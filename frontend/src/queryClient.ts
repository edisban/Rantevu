import { QueryClient } from '@tanstack/react-query'

// One cache for the whole app. Cached data shows at once and is refreshed in the background
// when a page mounts or the tab regains focus; live events mark it stale (see chat.tsx).
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
})
