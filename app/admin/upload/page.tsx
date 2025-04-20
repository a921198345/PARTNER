"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileUp,
  Upload,
  File,
  AlertCircle,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processingMessage, setProcessingMessage] = useState("")
  const [knowledgePointCount, setKnowledgePointCount] = useState(0)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null)

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    
    // 验证文件类型
    if (selectedFile) {
      const validTypes = ['.pdf', '.docx', '.doc', '.txt', '.md', '.rtf']
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()
      
      if (!validTypes.includes(fileExtension)) {
        setError(`不支持的文件类型。请上传以下格式：${validTypes.join(', ')}`)
        setFile(null)
        event.target.value = ''
      } else if (selectedFile.size > 10 * 1024 * 1024) { // 10MB限制
        setError('文件大小不能超过10MB')
        setFile(null)
        event.target.value = ''
      }
    }
  }
  
  // 处理文件删除
  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('请选择要上传的文件')
      return
    }
    
    if (!title.trim()) {
      setError('请输入文档标题')
      return
    }
    
    if (!subject) {
      setError('请选择学科')
      return
    }
    
    try {
      setIsUploading(true)
      setProgress(0)
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('subject', subject)
      if (subCategory) {
        formData.append('subCategory', subCategory)
      }
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)
      
      // 上传文件并提取知识点
      const response = await fetch('/api/admin/knowledge', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '上传失败')
      }
      
      setProgress(100)
      setIsUploading(false)
      setIsProcessing(true)
      setProcessingMessage('正在提取知识点...')
      
      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应')
      
      const decoder = new TextDecoder()
      let processedText = ''
      let documentId = null
      let knowledgeCount = 0
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }
          
          // 解码并处理流式数据
          processedText += decoder.decode(value, { stream: true })
          
          // 寻找并解析JSON对象
          const lines = processedText.split('\n')
          let remainingText = ''
          
          for (const line of lines) {
            if (!line.trim()) continue
            
            try {
              const data = JSON.parse(line)
              
              if (data.type === 'processing') {
                setProcessingMessage(data.message)
              } else if (data.type === 'progress') {
                setKnowledgePointCount(data.count)
              } else if (data.type === 'complete') {
                documentId = data.documentId
                knowledgeCount = data.totalCount
              }
              
            } catch (e) {
              // 如果不是完整的JSON，保留剩余文本
              remainingText += line + '\n'
            }
          }
          
          processedText = remainingText
        }
      } catch (error) {
        console.error('处理流式响应失败', error)
      }
      
      setUploadedDocumentId(documentId)
      setKnowledgePointCount(knowledgeCount)
      setIsProcessing(false)
      
      toast.success(`成功提取了 ${knowledgeCount} 个知识点`)
      
    } catch (error) {
      setIsUploading(false)
      setIsProcessing(false)
      console.error('上传失败:', error)
      setError(error instanceof Error ? error.message : '上传失败，请稍后重试')
      toast.error('上传失败，请稍后重试')
    }
  }
  
  // 前往管理页面
  const goToManagePage = () => {
    router.push(uploadedDocumentId 
      ? `/admin/knowledge?document=${uploadedDocumentId}` 
      : '/admin/knowledge'
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">上传文档</h1>
          <p className="text-sm text-muted-foreground">
            上传学科知识文档并提取知识点
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/knowledge')}>
          返回管理页面
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>上传学科文档</CardTitle>
          <CardDescription>
            上传文档后，系统将自动提取其中的知识点。支持PDF、Word、TXT等格式。
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* 文档基本信息 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">文档标题 *</Label>
                  <Input 
                    id="title" 
                    placeholder="输入文档标题" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading || isProcessing}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">学科类别 *</Label>
                  <Select 
                    value={subject} 
                    onValueChange={setSubject}
                    disabled={isUploading || isProcessing}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="选择学科" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="考公">考公</SelectItem>
                      <SelectItem value="教资">教资</SelectItem>
                      <SelectItem value="法考">法考</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subCategory">子分类</Label>
                  <Select 
                    value={subCategory} 
                    onValueChange={setSubCategory}
                    disabled={isUploading || isProcessing}
                  >
                    <SelectTrigger id="subCategory">
                      <SelectValue placeholder="选择子分类（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="行政法">行政法</SelectItem>
                      <SelectItem value="民法">民法</SelectItem>
                      <SelectItem value="刑法">刑法</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">文档描述</Label>
                  <Textarea 
                    id="description" 
                    placeholder="输入文档简短描述（可选）" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading || isProcessing}
                  />
                </div>
              </div>
            </div>
            
            {/* 文件上传区域 */}
            <div className="space-y-2">
              <Label>上传文件 *</Label>
              {!file ? (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
                  <div className="space-y-2 text-center">
                    <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">拖放文件或点击上传</p>
                      <p className="text-xs text-muted-foreground">
                        支持 PDF、Word、TXT 等格式，最大 10MB
                      </p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isProcessing}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      选择文件
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading || isProcessing}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center space-x-4">
                    <File className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isUploading || isProcessing}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* 处理状态 */}
            {(isUploading || isProcessing || uploadedDocumentId) && (
              <div className="space-y-4 rounded-md bg-muted p-4">
                {(isUploading || isProcessing) && (
                  <>
                    <div className="flex items-center space-x-2">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm font-medium">正在上传文件...</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm font-medium">{processingMessage}</span>
                        </>
                      )}
                    </div>
                    <Progress value={isUploading ? progress : 100} className="h-2 w-full" />
                  </>
                )}
                
                {!isUploading && !isProcessing && uploadedDocumentId && (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">处理完成！</span>
                    </div>
                    <p className="text-sm">
                      成功从文档中提取了 {knowledgePointCount} 个知识点。
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/knowledge')}
              disabled={isUploading || isProcessing}
            >
              取消
            </Button>
            
            {!uploadedDocumentId ? (
              <Button 
                type="submit" 
                disabled={!file || !title || !subject || isUploading || isProcessing}
              >
                {isUploading || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? '上传中...' : '处理中...'}
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    上传并提取知识点
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={goToManagePage}>
                查看提取的知识点
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 