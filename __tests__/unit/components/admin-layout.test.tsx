import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}))

describe('AdminLayout Component', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('should render navigation menu', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )

    // Check main menu items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('Catalog')).toBeInTheDocument()
    expect(screen.getByText('Production')).toBeInTheDocument()
    expect(screen.getByText('Finance')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Users & Teams')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should expand submenu on click', async () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )

    const salesMenu = screen.getByText('Sales')
    fireEvent.click(salesMenu)

    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument()
      expect(screen.getByText('Fulfillment')).toBeInTheDocument()
      expect(screen.getByText('Stores')).toBeInTheDocument()
    })
  })

  it('should highlight active menu item', () => {
    (usePathname as jest.Mock).mockReturnValue('/orders')
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )

    const ordersMenuItem = screen.getByText('Orders')
    const parentElement = ordersMenuItem.closest('a') || ordersMenuItem.closest('button')
    
    expect(parentElement).toHaveClass('bg-gray-800', 'text-white')
  })

  it('should auto-expand menu containing active page', () => {
    (usePathname as jest.Mock).mockReturnValue('/advances')
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )

    // Finance menu should be auto-expanded
    expect(screen.getByText('Cash Advances')).toBeInTheDocument()
    expect(screen.getByText('Admin Advances')).toBeInTheDocument()
  })

  it('should display breadcrumbs correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin/advances')
    
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Finance')).toBeInTheDocument()
    expect(screen.getByText('Admin Advances')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">Test Child Content</div>
      </AdminLayout>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('should toggle mobile menu', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    )

    const menuButton = screen.getByRole('button', { name: /menu/i })
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Fulfillment Hub')).toBeInTheDocument()
    })
  })
})