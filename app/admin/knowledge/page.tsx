"use client"

import { useState, useEffect } from "react"
import { FileUploader } from "../components/FileUploader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { FileText, Trash2, Edit, Eye, Plus, RefreshCcw, Search } from "lucide-react"
import Link from 'next/link'

// 知识库文件类型定义
interface KnowledgeFile {
  id: string
  file_name: string
  file_size: number
  file_type: string
  category: string
  public_url: string
  created_at: string
}

export default function AdminKnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showUploadMessage, setShowUploadMessage] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")

  // 加载文件列表
  useEffect(() => {
    fetchFiles()
  }, [selectedCategory])

  // 获取文件列表
  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 构建URL
      let url = '/api/admin/knowledge'
      if (selectedCategory) {
        url += `?category=${encodeURIComponent(selectedCategory)}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '获取文件列表失败')
      }
      
      setFiles(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文件列表过程中发生错误')
    } finally {
      setLoading(false)
    }
  }

  // 处理文件上传成功
  const handleFileUpload = async (url: string, fileName: string) => {
    // 用户点击"上传"按钮后已经调用了API上传文件
    // 这里只需要更新UI状态
    
    setUploadedFileName(fileName)
    setShowUploadMessage(true)
    
    // 重新获取文件列表以包含新上传的文件
    const response = await fetch('/api/admin/knowledge')
    
    if (response.ok) {
      const data = await response.json()
      
      // 转换日期格式
      const formattedFiles = data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        category: file.category,
        type: file.type.split('/').pop() || 'unknown',
        size: file.size / (1024 * 1024), // 转换为MB
        uploadDate: new Date(file.created_at || file.uploadDate),
        status: file.status
      }))
      
      setFiles(formattedFiles)
    }
    
    // 3秒后隐藏成功消息
    setTimeout(() => {
      setShowUploadMessage(false)
    }, 3000)
  }

  // 删除文件
  const handleDeleteFile = async (id: string) => {
    if (!confirm('确定要删除此文件吗？')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/knowledge?id=${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '删除文件失败')
      }
      
      // 从列表中移除该文件
      setFiles(files.filter(file => file.id !== id))
      
      alert('文件已成功删除')
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除文件时发生错误')
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // 文件类型图标
  const getFileIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf':
      case 'docx':
      case 'doc':
      case 'txt':
      case 'markdown':
      case 'md':
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // 根据状态获取颜色
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'processing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  // 根据状态获取标签文字
  const getStatusText = (status: string) => {
    switch(status) {
      case 'active':
        return '已索引'
      case 'processing':
        return '处理中'
      case 'error':
        return '错误'
      default:
        return '未知'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">知识库文件管理</h1>
        <Link 
          href="/test-upload" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          上传新文件
        </Link>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">按分类筛选</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md min-w-[200px]"
        >
          <option value="">全部分类</option>
          <option value="法条">法条</option>
          <option value="案例">案例</option>
          <option value="教材">教材</option>
          <option value="其他">其他</option>
        </select>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          错误: {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p>加载中...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">暂无文件</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文件名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  大小
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  上传时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={file.public_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.file_name}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {file.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatFileSize(file.file_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(file.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 