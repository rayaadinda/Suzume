"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
	Home,
	ChevronRight,
	User,
	Bell,
	Shield,
	Palette,
	Database,
} from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/hooks/use-user"

export default function SettingsPage() {
	const { user, isLoading } = useUser()

	const userInitials =
		user?.name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase() || "?"

	return (
		<div className="flex flex-col h-full overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
			<div className="border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
				<div className="flex items-center justify-between px-6 py-4">
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<SidebarTrigger />
							<Link
								href="/dashboard"
								className="flex items-center gap-1.5 hover:text-foreground transition-colors"
							>
								<Home className="size-3.5" />
								<span>Dashboard</span>
							</Link>
							<ChevronRight className="size-3.5" />
							<span className="text-foreground font-medium">Settings</span>
						</div>

						<div className="flex items-center justify-between gap-4">
							<h1 className="text-2xl font-semibold tracking-tight">
								Settings
							</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-6">
				<Tabs defaultValue="profile" className="w-full max-w-4xl">
					<TabsList className="grid w-full grid-cols-5 mb-6">
						<TabsTrigger value="profile" className="gap-2">
							<User className="size-4" />
							<span className="hidden sm:inline">Profile</span>
						</TabsTrigger>
						<TabsTrigger value="notifications" className="gap-2">
							<Bell className="size-4" />
							<span className="hidden sm:inline">Notifications</span>
						</TabsTrigger>
						<TabsTrigger value="security" className="gap-2">
							<Shield className="size-4" />
							<span className="hidden sm:inline">Security</span>
						</TabsTrigger>
						<TabsTrigger value="appearance" className="gap-2">
							<Palette className="size-4" />
							<span className="hidden sm:inline">Appearance</span>
						</TabsTrigger>
						<TabsTrigger value="data" className="gap-2">
							<Database className="size-4" />
							<span className="hidden sm:inline">Data</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									Update your profile information and email address
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{isLoading ? (
									<div className="space-y-4">
										<div className="flex items-center gap-4">
											<div className="size-20 rounded-full bg-muted animate-pulse" />
											<div className="space-y-2">
												<div className="h-8 w-32 bg-muted rounded animate-pulse" />
												<div className="h-4 w-48 bg-muted rounded animate-pulse" />
											</div>
										</div>
									</div>
								) : user ? (
									<>
										<div className="flex items-center gap-4">
											<Avatar className="size-20">
												<AvatarImage src={user.image || undefined} />
												<AvatarFallback>{userInitials}</AvatarFallback>
											</Avatar>
											<div>
												<Button variant="outline" size="sm">
													Change Avatar
												</Button>
												<p className="text-xs text-muted-foreground mt-2">
													JPG, GIF or PNG. Max size 2MB
												</p>
											</div>
										</div>

										<Separator />

										<div className="space-y-2">
											<Label htmlFor="name">Full Name</Label>
											<Input id="name" defaultValue={user.name} />
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												defaultValue={user.email}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="bio">Bio</Label>
											<textarea
												id="bio"
												className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder="Tell us about yourself..."
											/>
										</div>

										<Button>Save Changes</Button>
									</>
								) : (
									<p className="text-sm text-muted-foreground">
										Unable to load user data
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="notifications" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Notification Preferences</CardTitle>
								<CardDescription>
									Manage how you receive notifications
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Notification settings coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="security" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Security Settings</CardTitle>
								<CardDescription>
									Manage your password and security preferences
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Security settings coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="appearance" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Appearance Settings</CardTitle>
								<CardDescription>
									Customize the appearance of your workspace
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Appearance settings coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="data" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Data Management</CardTitle>
								<CardDescription>Export or delete your data</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Data management settings coming soon...
								</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
