"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Key, Plus, Trash2, Copy, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  createdAt: string
}

// Encryption functions
const generateKey = async (pin: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(pin), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("password-manager-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )
}

const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data))
  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  })
}

const decryptData = async (encryptedData: string, key: CryptoKey): Promise<string> => {
  const { iv, data } = JSON.parse(encryptedData)
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, new Uint8Array(data))
  return new TextDecoder().decode(decrypted)
}

export default function PasswordManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [showAddPassword, setShowAddPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const [newPassword, setNewPassword] = useState({
    title: "",
    username: "",
    password: "",
  })

  useEffect(() => {
    if (encryptionKey) {
      loadPasswords()
    }
  }, [encryptionKey])

  const authenticate = async () => {
    if (pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 4 digits",
        variant: "destructive",
      })
      return
    }

    try {
      const key = await generateKey(pin)
      setEncryptionKey(key)
      setIsAuthenticated(true)
      toast({
        title: "Authenticated",
        description: "Welcome to Password Manager",
      })
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const loadPasswords = async () => {
    if (!encryptionKey) return

    const encrypted = localStorage.getItem("encrypted_passwords")
    if (encrypted) {
      try {
        const decrypted = await decryptData(encrypted, encryptionKey)
        setPasswords(JSON.parse(decrypted))
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load passwords",
          variant: "destructive",
        })
      }
    }
  }

  const savePasswords = async (updatedPasswords: PasswordEntry[]) => {
    if (!encryptionKey) return

    try {
      const encrypted = await encryptData(JSON.stringify(updatedPasswords), encryptionKey)
      localStorage.setItem("encrypted_passwords", encrypted)
      setPasswords(updatedPasswords)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save passwords",
        variant: "destructive",
      })
    }
  }

  const addPassword = async () => {
    if (!newPassword.title || !newPassword.username || !newPassword.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const entry: PasswordEntry = {
      id: Date.now().toString(),
      ...newPassword,
      createdAt: new Date().toISOString(),
    }

    await savePasswords([...passwords, entry])
    setNewPassword({ title: "", username: "", password: "" })
    setShowAddPassword(false)
    toast({
      title: "Success",
      description: "Password saved successfully",
    })
  }

  const deletePassword = async (id: string) => {
    const updatedPasswords = passwords.filter((p) => p.id !== id)
    await savePasswords(updatedPasswords)
    toast({
      title: "Success",
      description: "Password deleted successfully",
    })
  }

  const generateRandomPassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setNewPassword({ ...newPassword, password })
  }

  const filteredPasswords = passwords.filter(
    (password) =>
      password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Password Manager</CardTitle>
            <CardDescription>Enter your PIN to unlock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  maxLength={8}
                />
              </div>
              <Button onClick={authenticate} className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Password Manager</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Dialog open={showAddPassword} onOpenChange={setShowAddPassword}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Password</DialogTitle>
                <DialogDescription>Enter the details for the new password entry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPassword.title}
                    onChange={(e) => setNewPassword({ ...newPassword, title: e.target.value })}
                    placeholder="e.g., Gmail"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newPassword.username}
                    onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                    placeholder="username@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      value={newPassword.password}
                      onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                      placeholder="Enter password"
                    />
                    <Button variant="outline" size="icon" onClick={generateRandomPassword}>
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={addPassword} className="w-full">
                  Save Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            <Lock className="mr-2 h-4 w-4" />
            Lock
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPasswords.map((entry) => (
          <PasswordCard key={entry.id} entry={entry} onDelete={() => deletePassword(entry.id)} />
        ))}
      </div>
    </div>
  )
}

function PasswordCard({
  entry,
  onDelete,
}: {
  entry: PasswordEntry
  onDelete: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied",
        description: "Password copied to clipboard",
      })

      // Clear clipboard after 30 seconds
      setTimeout(() => {
        navigator.clipboard.writeText("")
      }, 30000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{entry.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>{entry.username}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Input type={showPassword ? "text" : "password"} value={entry.password} readOnly className="font-mono" />
          <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(entry.password)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
