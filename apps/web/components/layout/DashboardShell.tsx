'use client'

import { ToastProvider } from '@/components/ui'
import { Sidebar } from './Sidebar'

interface DashboardShellProps {
  children: React.ReactNode
  userEmail: string
}

export function DashboardShell({ children, userEmail }: DashboardShellProps) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-surface-bg overflow-hidden">
        <Sidebar userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
