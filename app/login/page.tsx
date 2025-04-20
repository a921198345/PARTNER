"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // 登录功能仅用于展示，不会实际登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 模拟登录延迟
    setTimeout(() => {
      setIsLoading(false)
      // 仅用于演示，实际不会跳转
      alert("登录功能仅用于展示，不会实际登录")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-black overflow-hidden">
      {/* 动态背景 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/80 via-indigo-950/80 to-black"></div>
        
        {/* 动态渐变光晕 */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-pink-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container relative z-10 flex items-center justify-center min-h-screen py-10">
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/5 backdrop-blur-md text-white">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 p-0.5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-spin-slow opacity-70"></div>
                <div className="relative h-full w-full rounded-full bg-black flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">欢迎回来</CardTitle>
            <CardDescription className="text-white/70">登录您的账户继续学习</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="输入您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码</Label>
                  <Link href="/" className="text-xs text-white/70 hover:text-white">
                    忘记密码?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{isLoading ? "登录中..." : "登录"}</span>
              </Button>
            </form>
            <div className="text-center text-sm text-white/70">
              <p>
                还没有账户?{" "}
                <Link href="/register" className="text-white hover:text-purple-300 font-medium">
                  立即注册
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 