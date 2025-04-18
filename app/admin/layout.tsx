"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FileText,
  BookOpen,
  Upload,
  BarChart,
  Settings,
  User,
  Database,
  LogOut,
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // 在真实项目中，这里应该检查用户是否为管理员
    // 如果不是则重定向
    // 为演示目的，我们假设用户是管理员
    setIsAdmin(true)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-4">
        <h1 className="text-2xl font-bold">无权访问</h1>
        <p className="text-muted-foreground">您没有权限访问管理后台</p>
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-md dark:bg-gray-800">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">学习搭子管理</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link href="/admin/knowledge">
            <div
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                pathname.includes("/admin/knowledge")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>知识库管理</span>
            </div>
          </Link>
          <Link href="/admin/documents">
            <div
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                pathname.includes("/admin/documents")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>文档管理</span>
            </div>
          </Link>
          <Link href="/admin/upload">
            <div
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                pathname.includes("/admin/upload")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>上传文档</span>
            </div>
          </Link>
          <Link href="/admin/analytics">
            <div
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                pathname.includes("/admin/analytics")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <BarChart className="h-5 w-5" />
              <span>使用分析</span>
            </div>
          </Link>
          <Link href="/admin/settings">
            <div
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
                pathname.includes("/admin/settings")
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>系统设置</span>
            </div>
          </Link>
        </nav>
        <div className="absolute bottom-0 w-full border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">管理员</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  )
} 