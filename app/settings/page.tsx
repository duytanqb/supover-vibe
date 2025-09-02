"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Settings,
  ArrowLeft,
  Save,
  AlertCircle,
  Cloud,
  ShoppingBag,
  Globe,
  Shield,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"

interface SystemSetting {
  key: string
  value: string
  category: string
  description?: string
  isSecret: boolean
}

const generalSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  support_email: z.string().email("Must be a valid email"),
  system_timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().min(1, "Currency is required"),
  backblaze_key_id: z.string().optional(),
  backblaze_app_key: z.string().optional(),
  backblaze_bucket_id: z.string().optional(),
  backblaze_bucket_name: z.string().optional(),
  tiktok_auth_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  shopify_api_key: z.string().optional(),
  shopify_api_secret: z.string().optional(),
})

type GeneralFormValues = z.infer<typeof generalSchema>

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      company_name: "",
      support_email: "",
      system_timezone: "UTC",
      currency: "USD",
      backblaze_key_id: "",
      backblaze_app_key: "",
      backblaze_bucket_id: "",
      backblaze_bucket_name: "",
      tiktok_auth_url: "",
      shopify_api_key: "",
      shopify_api_secret: "",
    },
  })

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        router.push("/")
        return
      }

      const data = await response.json()
      
      // Check if user has settings.read permission
      const hasSettingsAccess = data.user.permissions?.includes("settings.read")
      if (!hasSettingsAccess) {
        router.push("/dashboard")
        return
      }

    } catch {
      router.push("/")
    }
  }, [router])

  const fetchSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }

      const data = await response.json()

      // Populate form with existing values
      const settingsMap = data.settings.reduce((acc: any, setting: SystemSetting) => {
        acc[setting.key] = setting.value
        return acc
      }, {})

      form.reset({
        company_name: settingsMap.company_name || "",
        support_email: settingsMap.support_email || "",
        system_timezone: settingsMap.system_timezone || "UTC",
        currency: settingsMap.currency || "USD",
        backblaze_key_id: settingsMap.backblaze_key_id || "",
        backblaze_app_key: settingsMap.backblaze_app_key || "",
        backblaze_bucket_id: settingsMap.backblaze_bucket_id || "",
        backblaze_bucket_name: settingsMap.backblaze_bucket_name || "",
        tiktok_auth_url: settingsMap.tiktok_auth_url || "",
        shopify_api_key: settingsMap.shopify_api_key || "",
        shopify_api_secret: settingsMap.shopify_api_secret || "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }, [form])

  const handleSaveSettings = async (data: GeneralFormValues) => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      const settings = Object.entries(data)
        .filter(([_, value]) => value !== "" && value !== undefined)
        .map(([key, value]) => ({
          key,
          value: value as string,
          category: getCategory(key),
          isSecret: isSecretField(key),
        }))

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setSuccess("Settings saved successfully!")
      await fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const getCategory = (key: string): string => {
    if (key.includes('backblaze')) return 'storage'
    if (key.includes('tiktok') || key.includes('shopify') || key.includes('etsy')) return 'platforms'
    return 'general'
  }

  const isSecretField = (key: string): boolean => {
    return key.includes('key') || key.includes('secret') || key.includes('password')
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  useEffect(() => {
    checkAuth()
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="System Settings" 
        description="Configure system-wide settings and integrations"
        badge="SUPER ADMIN ONLY"
        badgeVariant="destructive"
      />

      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure general system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your company or organization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="support_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="support@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address for system notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="system_timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Timezone</FormLabel>
                        <FormControl>
                          <Input placeholder="UTC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Storage Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2" />
                  Storage Configuration
                </CardTitle>
                <CardDescription>
                  Configure Backblaze B2 storage settings for file uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="backblaze_key_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backblaze Key ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showSecrets['backblaze_key_id'] ? "text" : "password"}
                              placeholder="Enter Backblaze Key ID" 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleSecretVisibility('backblaze_key_id')}
                            >
                              {showSecrets['backblaze_key_id'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Application Key ID from Backblaze B2
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backblaze_app_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backblaze Application Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showSecrets['backblaze_app_key'] ? "text" : "password"}
                              placeholder="Enter Backblaze Application Key" 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleSecretVisibility('backblaze_app_key')}
                            >
                              {showSecrets['backblaze_app_key'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Application Key from Backblaze B2
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backblaze_bucket_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bucket ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Bucket ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Backblaze B2 Bucket ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backblaze_bucket_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bucket Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Bucket Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Backblaze B2 Bucket Name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Platform Integrations
                </CardTitle>
                <CardDescription>
                  Configure API keys and authentication URLs for e-commerce platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tiktok_auth_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TikTok Shop Auth URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://auth.tiktok-shops.com/..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          OAuth authentication URL for TikTok Shop
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shopify_api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shopify API Key</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showSecrets['shopify_api_key'] ? "text" : "password"}
                                placeholder="Enter API Key" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => toggleSecretVisibility('shopify_api_key')}
                              >
                                {showSecrets['shopify_api_key'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shopify_api_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shopify API Secret</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showSecrets['shopify_api_secret'] ? "text" : "password"}
                                placeholder="Enter API Secret" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => toggleSecretVisibility('shopify_api_secret')}
                              >
                                {showSecrets['shopify_api_secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  )
}