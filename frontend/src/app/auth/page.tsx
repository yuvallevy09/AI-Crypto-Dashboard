"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { TrendingUp } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Crypto Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Auth form */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  )
}
