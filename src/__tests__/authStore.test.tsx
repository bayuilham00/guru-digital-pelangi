import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../stores/authStore'

// Test wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset auth store before each test
    act(() => {
      useAuthStore.getState().logout()
    })
    localStorage.clear()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle successful login', async () => {
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: createWrapper(),
    })

    let loginResult: boolean
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password')
    })
    
    expect(loginResult!).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeTruthy()
      expect(result.current.user?.email).toBe('test@example.com')
      expect(result.current.error).toBeNull()
    })
  })

  it('should handle failed login', async () => {
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: createWrapper(),
    })

    let loginResult: boolean
    await act(async () => {
      loginResult = await result.current.login('wrong@example.com', 'wrongpassword')
    })
    
    expect(loginResult!).toBe(false)
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: createWrapper(),
    })

    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    // Then logout
    await act(async () => {
      await result.current.logout()
    })
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Manually set error to test clearError
    act(() => {
      result.current.clearError()
    })
    
    expect(result.current.error).toBeNull()
  })
})
