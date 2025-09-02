'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  action?: ReactNode
  children?: ReactNode
}

export function PageHeader({ 
  title, 
  description, 
  badge, 
  badgeVariant = 'secondary',
  action, 
  children 
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {badge && (
              <Badge variant={badgeVariant} className="px-2 py-0.5 text-xs">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}