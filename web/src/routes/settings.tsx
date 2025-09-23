"use client"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Shield, Info } from "lucide-react"
import { useAuth } from "@/lib/stores/auth"
import { requireAuth } from "@/lib/auth-guard"

export const Route = createFileRoute("/settings")({
    beforeLoad: async () => {
        await requireAuth()
    },
    component: SettingsPage,
})

function SettingsPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const handleLogout = () => {
        logout()
        navigate({ to: "/login" })
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: "/dashboard" })}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Settings</CardTitle>
                        <CardDescription>Manage your DailyQuran preferences</CardDescription>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Username</p>
                                <p className="font-medium">{user?.username}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy & Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Data Storage</p>
                            <p className="text-sm text-muted-foreground">
                                Your recordings are securely stored and only accessible by you.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Account Security</p>
                            <p className="text-sm text-muted-foreground">
                                Your password is encrypted and never stored in plain text.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            About DailyQuran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            DailyQuran helps you maintain a consistent Quran reading habit through streak tracking and daily
                            reminders.
                        </p>
                        <div className="text-sm text-muted-foreground">
                            <p>Version 1.0.0</p>
                            <p>Built with React, Vite, Hono, Bun and love for the community</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <Button onClick={handleLogout} variant="destructive" className="w-full">
                            Sign Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
