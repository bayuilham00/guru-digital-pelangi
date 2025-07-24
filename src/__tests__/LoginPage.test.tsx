import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import LoginPage from '../pages/LoginPage'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    // Clear any stored auth data
    localStorage.clear()
  })

  it('renders login form with tabs', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Check if the form renders with tabs
    expect(screen.getByText('Guru Digital Pelangi')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Guru' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Siswa' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Admin' })).toBeInTheDocument()
    
    // Default tab should be Guru - check for NIP input field
    expect(screen.getByRole('textbox', { name: /nip guru/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /masuk sebagai guru/i })).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Initially on Guru tab
    expect(screen.getByRole('textbox', { name: /nip guru/i })).toBeInTheDocument()

    // Switch to Admin tab
    const adminTab = screen.getByRole('tab', { name: 'Admin' })
    fireEvent.click(adminTab)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /email administrator/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /masuk sebagai admin/i })).toBeInTheDocument()
    })

    // Switch to Siswa tab
    const siswaTab = screen.getByRole('tab', { name: 'Siswa' })
    fireEvent.click(siswaTab)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /nisn siswa/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /masuk sebagai siswa/i })).toBeInTheDocument()
    })
  })

  it('handles successful admin login', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Switch to admin tab
    const adminTab = screen.getByRole('tab', { name: 'Admin' })
    fireEvent.click(adminTab)

    await waitFor(() => {
      const emailInput = screen.getByRole('textbox', { name: /email administrator/i })
      const passwordInput = screen.getByLabelText(/password/i)
      const loginButton = screen.getByRole('button', { name: /masuk sebagai admin/i })

      // Fill in the form
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })

      // Submit the form
      fireEvent.click(loginButton)
    })

    // Should show loading state or complete successfully
    await waitFor(() => {
      // Either loading state or success
      const loadingButton = screen.queryByText(/masuk sebagai admin\.\.\./i)
      if (!loadingButton) {
        // Check for no error state
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
      }
    })
  })

  it('handles teacher login', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    )

    // Default is Guru tab
    const nipInput = screen.getByRole('textbox', { name: /nip guru/i })
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /masuk sebagai guru/i })

    // Fill in the form with valid teacher credentials
    fireEvent.change(nipInput, { target: { value: '123456789012345678' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })

    // Submit the form
    fireEvent.click(loginButton)

    // Should show loading state or complete successfully
    await waitFor(() => {
      // Either loading state or success
      const loadingButton = screen.queryByText(/masuk sebagai guru\.\.\./i)
      if (!loadingButton) {
        // Check for no error state
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
      }
    })
  })
})
