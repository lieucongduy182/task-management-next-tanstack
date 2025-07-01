'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './ui/Button'

export function Navigation() {
  const { logout, getCurrentUser } = useAuth()
  const user = getCurrentUser()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
