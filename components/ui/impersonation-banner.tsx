'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogOut, Clock, User, Shield } from 'lucide-react'

interface ImpersonationBannerProps {
  adminUser: {
    id: string
    name: string
    email: string
  }
  targetUser: {
    id: string
    name: string
    email: string
  }
  impersonationSession: {
    id: string
    reason: string
    expiresAt: Date
    startedAt: Date
  }
  onEndImpersonation: () => void
}

export function ImpersonationBanner({
  adminUser,
  targetUser,
  impersonationSession,
  onEndImpersonation
}: ImpersonationBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isEnding, setIsEnding] = useState(false)

  useState(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const expiresAt = new Date(impersonationSession.expiresAt)
      const diff = expiresAt.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }
      
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}m ${seconds}s`)
    }
    
    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    
    return () => clearInterval(interval)
  })

  const handleEndImpersonation = async () => {
    setIsEnding(true)
    try {
      await onEndImpersonation()
    } finally {
      setIsEnding(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <Alert className="bg-orange-50 border-orange-200 mb-4">
      <Shield className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              <User className="w-3 h-3 mr-1" />
              IMPERSONATING
            </Badge>
            <span className="font-medium">
              Viewing as: {targetUser.name} ({targetUser.email})
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Admin: {adminUser.name} | Reason: {impersonationSession.reason}
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <Clock className="w-3 h-3" />
            <span className={timeLeft === 'Expired' ? 'text-red-600' : 'text-orange-600'}>
              {timeLeft}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-muted-foreground">
            Started: {formatDate(impersonationSession.startedAt)}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndImpersonation}
            disabled={isEnding}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <LogOut className="w-3 h-3 mr-1" />
            {isEnding ? 'Ending...' : 'End Impersonation'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}