"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  AlertCircle,
  MapPin,
  Calendar,
  Shield,
  User,
  UserPlus,
  UserMinus,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface Team {
  id: string
  name: string
  code: string
  description?: string
  region?: string
  isActive: boolean
  createdAt: string
  members: Array<{
    id: string
    user: {
      id: string
      name: string
      email: string
    }
    isLeader: boolean
  }>
}

interface User {
  id: string
  name: string
  email: string
  teamMember?: {
    team: {
      id: string
      name: string
    }
  }
}

const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  code: z.string().min(2, "Team code must be at least 2 characters").regex(/^[A-Z_]+$/, "Code must be uppercase letters and underscores only"),
  description: z.string().optional(),
  region: z.string().optional(),
})

type TeamFormValues = z.infer<typeof teamSchema>

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isMembersViewOpen, setIsMembersViewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      region: "",
    },
  })

  useEffect(() => {
    fetchTeams()
    fetchAvailableUsers()
  }, [])

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch("/api/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }

      const data = await response.json()
      setTeams(data.teams)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.users)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }

  const handleCreateTeam = async (data: TeamFormValues) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create team")
      }

      await fetchTeams()
      setIsCreateOpen(false)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTeam = async (data: TeamFormValues) => {
    if (!selectedTeam) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update team")
      }

      await fetchTeams()
      setIsEditOpen(false)
      setSelectedTeam(null)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddUserToTeam = async (userId: string, isLeader: boolean = false) => {
    if (!selectedTeam) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, isLeader }),
      })

      if (!response.ok) {
        throw new Error("Failed to add user to team")
      }

      await fetchTeams()
      await fetchAvailableUsers()
      setIsAddUserOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user to team")
    }
  }

  const handleRemoveUserFromTeam = async (userId: string) => {
    if (!selectedTeam) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/teams/${selectedTeam.id}/members/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove user from team")
      }

      await fetchTeams()
      await fetchAvailableUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user from team")
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete team")
      }

      await fetchTeams()
      await fetchAvailableUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team")
    }
  }

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team)
    form.setValue("name", team.name)
    form.setValue("code", team.code)
    form.setValue("description", team.description || "")
    form.setValue("region", team.region || "")
    setIsEditOpen(true)
  }

  const openAddUserDialog = (team: Team) => {
    setSelectedTeam(team)
    setIsAddUserOpen(true)
  }

  const openMembersView = (team: Team) => {
    setSelectedTeam(team)
    setIsMembersViewOpen(true)
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.region && team.region.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const unassignedUsers = availableUsers.filter(user => !user.teamMember)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Team Management</h1>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team and assign members to it.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateTeam)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="North America Team" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="NA_TEAM" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Team description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="North America" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Team"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teams ({filteredTeams.length})</CardTitle>
            <CardDescription>
              Manage teams and their members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Leaders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => {
                  const leaders = team.members.filter(m => m.isLeader)
                  const totalMembers = team.members.length
                  
                  return (
                    <TableRow key={team.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.code}
                          </div>
                          {team.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {team.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {team.region && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{team.region}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{totalMembers} members</span>
                          </div>
                          {totalMembers > 0 && (
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {team.members.slice(0, 3).map((member) => (
                                <div key={member.id} className="text-xs text-muted-foreground">
                                  {member.user.name}
                                  {member.isLeader && <Shield className="inline h-3 w-3 ml-1 text-yellow-600" />}
                                </div>
                              ))}
                              {totalMembers > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{totalMembers - 3} more...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {leaders.map((leader) => (
                            <div key={leader.id} className="flex items-center space-x-1">
                              <Shield className="h-3 w-3 text-yellow-600" />
                              <span className="text-sm">{leader.user.name}</span>
                            </div>
                          ))}
                          {leaders.length === 0 && (
                            <span className="text-sm text-muted-foreground">No leaders</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={team.isActive ? "default" : "secondary"}
                          className={team.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {team.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(team.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMembersView(team)}
                            title="View Members"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAddUserDialog(team)}
                            title="Add User"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(team)}
                            title="Edit Team"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTeam(team.id)}
                            title="Delete Team"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Team Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>
                Update team information and settings.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditTeam)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="North America Team" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="NA_TEAM" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Team description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="North America" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Team"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add User to Team Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to {selectedTeam?.name}</DialogTitle>
              <DialogDescription>
                Select a user to add to this team and choose their role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {unassignedUsers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No unassigned users available
                  </div>
                ) : (
                  unassignedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddUserToTeam(user.id, false)}
                        >
                          Add as Member
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddUserToTeam(user.id, true)}
                        >
                          Add as Leader
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Members View Dialog */}
        <Dialog open={isMembersViewOpen} onOpenChange={setIsMembersViewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Team Members - {selectedTeam?.name}</DialogTitle>
              <DialogDescription>
                View and manage team members and their roles
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedTeam?.members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members in this team yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTeam?.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {member.user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="font-medium">{member.user.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{member.user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={member.isLeader ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}
                          >
                            {member.isLeader ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Leader
                              </>
                            ) : (
                              <>
                                <User className="h-3 w-3 mr-1" />
                                Member
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleRemoveUserFromTeam(member.user.id)
                              setIsMembersViewOpen(false)
                            }}
                            title="Remove from team"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (selectedTeam) {
                    openAddUserDialog(selectedTeam)
                    setIsMembersViewOpen(false)
                  }
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
              <Button onClick={() => setIsMembersViewOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}