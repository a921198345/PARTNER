"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  File,
  FileText,
  FileImage,
  AlertTriangle,
  Check,
  Clock,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// 示例数据
const mockSubjects = [
  { id: "1", name: "考公" },
  { id: "2", name: "教资" },
  { id: "3", name: "法考" },
]

const mockSubCategories = {
  "1": [
    { id: "101", name: "行政职业能力测验" },
    { id: "102", name: "申论" },
    { id: "103", name: "公共基础知识" },
  ],
  "2": [
    { id: "201", name: "教育知识与能力" },
    { id: "202", name: "综合素质" },
    { id: "203", name: "学科知识" },
  ],
  "3": [
    { id: "301", name: "民法" },
    { id: "302", name: "刑法" },
    { id: "303", name: "行政法" },
  ],
}

export default function UploadDocumentPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([])
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // 当选择学科变化时更新子类别
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value)
    if (value) {
      setSubCategories(mockSubCategories[value as keyof typeof mockSubCategories] || [])
    } else {
      setSubCategories([])
    }
    setSelectedSubCategory("")
  }

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setSelectedFile(null)
      return
    }
    
    const file = files[0]
    
    // 验证文件类型
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!validTypes.includes(file.type)) {
      setErrorMessage("不支持的文件类型，请选择PDF、DOCX或TXT文件")
      setUploadStatus("error")
      setSelectedFile(null)
      return
    }
    
    // 验证文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("文件过大，请选择小于10MB的文件")
      setUploadStatus("error")
      setSelectedFile(null)
      return
    }
    
    setSelectedFile(file)
    setErrorMessage("")
    setUploadStatus("idle")
  }

  // 模拟文件上传进度
  const simulateUploadProgress = () => {
    setUploadProgress(0)
    setUploadStatus("uploading")
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setUploadStatus("success")
          return 100
        }
        return newProgress
      })
    }, 300)
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证表单
    if (!title || !selectedSubject || !selectedFile) {
      setErrorMessage("请填写必填字段")
      setUploadStatus("error")
      return
    }
    
    // 模拟上传
    simulateUploadProgress()
    
    // 真实项目中这里应该调用API上传文件
    // const formData = new FormData()
    // formData.append('file', selectedFile)
    // formData.append('title', title)
    // formData.append('description', description)
    // formData.append('subjectId', selectedSubject)
    // if (selectedSubCategory) {
    //   formData.append('subCategoryId', selectedSubCategory)
    // }
    
    // 真实项目中应该上传完成后重定向
    setTimeout(() => {
      router.push('/admin/documents')
    }, 5000)
  }

  // 获取文件图标
  const getFileIcon = () => {
    if (!selectedFile) return <File className="h-12 w-12 text-muted-foreground" />
    
    const fileType = selectedFile.type
    
    if (fileType === 'application/pdf') {
      return <FileText className="h-12 w-12 text-red-500" />
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return <FileText className="h-12 w-12 text-blue-500" />
    } else if (fileType === 'text/plain') {
      return <FileText className="h-12 w-12 text-gray-500" />
    } else {
      return <FileImage className="h-12 w-12 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">上传文档</h1>
        <p className="text-sm text-muted-foreground">
          上传学科知识文档，系统将自动提取知识点
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>文档信息</CardTitle>
            <CardDescription>
              请填写文档信息并选择要上传的文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">文档标题 *</Label>
              <Input
                id="title"
                placeholder="输入文档标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">文档描述</Label>
              <Textarea
                id="description"
                placeholder="输入文档描述"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">学科 *</Label>
                <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="选择学科" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">子类别</Label>
                <Select 
                  value={selectedSubCategory} 
                  onValueChange={setSelectedSubCategory}
                  disabled={!selectedSubject}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder={selectedSubject ? "选择子类别" : "请先选择学科"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>文档文件 *</Label>
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {getFileIcon()}
                  
                  <div className="text-center">
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium">拖放文件或点击选择</p>
                        <p className="text-sm text-muted-foreground">
                          支持PDF、DOCX、TXT格式，文件大小限制10MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadStatus === "uploading"}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {selectedFile ? "更换文件" : "选择文件"}
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>上传错误</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {uploadStatus === "uploading" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>上传进度</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle>上传成功</AlertTitle>
                <AlertDescription className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>文档已上传，系统正在处理中，请稍后查看结果</span>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={uploadStatus === "uploading"}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={uploadStatus === "uploading" || uploadStatus === "success"}
            >
              {uploadStatus === "uploading" ? "上传中..." : "上传文档"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 