"use client"

import { useState, useEffect } from "react"
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  PlusCircle,
  FileText,
  BookOpen,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  FileUp,
  Loader2,
  Upload,
  Tag,
  Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { SUBJECTS, SUBJECT_CATEGORIES } from "@/lib/constants"

// 临时示例数据
const mockDocuments = [
  {
    id: "1",
    title: "行政法基础理论",
    description: "行政法的基本原理与应用",
    subject: "法考",
    subCategory: "行政法",
    uploadedAt: "2023-05-15",
    knowledgePointCount: 24,
  },
  {
    id: "2",
    title: "民法典人格权解析",
    description: "民法典中关于人格权的详细解读",
    subject: "法考",
    subCategory: "民法",
    uploadedAt: "2023-06-02",
    knowledgePointCount: 37,
  },
  {
    id: "3",
    title: "刑法分则详解",
    description: "刑法分则各罪名的构成要件解析",
    subject: "法考",
    subCategory: "刑法",
    uploadedAt: "2023-04-28",
    knowledgePointCount: 52,
  },
]

const mockKnowledgePoints = [
  {
    id: "101",
    title: "行政行为的特征",
    content: "行政行为是行政主体在行政管理过程中行使行政职权，对行政相对人的权利义务产生影响的公法行为。其特征包括：单方性、强制性、推定合法性和公定力。",
    importance: "HIGH",
    documentId: "1",
    documentTitle: "行政法基础理论",
    subject: "法考",
    subCategory: "行政法",
  },
  {
    id: "102",
    title: "行政处罚的种类",
    content: "行政处罚的种类主要包括：警告、罚款、没收违法所得、责令停产停业、暂扣或吊销许可证、行政拘留等。其中，限制人身自由的行政处罚只能由法律设定。",
    importance: "HIGH",
    documentId: "1",
    documentTitle: "行政法基础理论",
    subject: "法考",
    subCategory: "行政法",
  },
  {
    id: "103",
    title: "行政复议的受案范围",
    content: "行政复议的受案范围包括：对具体行政行为不服的；认为行政机关违法或者不当行使职权的；认为行政机关不履行法定职责的；对行政机关收费、罚款、没收财物等强制措施不服的等。",
    importance: "MEDIUM",
    documentId: "1",
    documentTitle: "行政法基础理论",
    subject: "法考",
    subCategory: "行政法",
  },
  {
    id: "201",
    title: "人格权的概念",
    content: "人格权是自然人享有的以人格利益为内容的民事权利，包括生命权、身体权、健康权、姓名权、肖像权、名誉权、隐私权等。人格权具有专属性、不可转让性等特点。",
    importance: "HIGH",
    documentId: "2",
    documentTitle: "民法典人格权解析",
    subject: "法考",
    subCategory: "民法",
  },
  {
    id: "301",
    title: "盗窃罪的构成要件",
    content: "盗窃罪是指以非法占有为目的，秘密窃取公私财物，数额较大或者多次盗窃、入户盗窃、携带凶器盗窃、扒窃公私财物的行为。客观要件包括秘密窃取行为和财物价值，主观要件为直接故意并具有非法占有目的。",
    importance: "HIGH",
    documentId: "3",
    documentTitle: "刑法分则详解",
    subject: "法考",
    subCategory: "刑法",
  },
]

// 知识点重要性标签颜色映射
const importanceColorMap: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800 hover:bg-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  LOW: "bg-green-100 text-green-800 hover:bg-green-200",
}

// 文档类型定义
interface Document {
  id: string;
  title: string;
  description: string;
  subject: string;
  subCategory: string;
  createdAt: string;
  createdBy: {
    name: string;
    image: string;
  };
  _count: {
    knowledgePoints: number;
  };
}

// 知识点类型定义
interface KnowledgePoint {
  id: string;
  title: string;
  content: string;
  tags: string[];
  importance: number;
  documentId: string;
  document: {
    title: string;
  };
}

export default function KnowledgeManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'document' | 'knowledge' } | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [knowledgeToEdit, setKnowledgeToEdit] = useState<any | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editImportance, setEditImportance] = useState<string>("")
  const [isEditLoading, setIsEditLoading] = useState(false)

  // 过滤文档列表
  const filteredDocuments = documents.filter(doc => 
    (searchQuery === "" || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (selectedSubject === null || doc.subject === selectedSubject) &&
    (selectedCategory === null || doc.subCategory === selectedCategory)
  )
  
  // 过滤知识点列表
  const filteredKnowledgePoints = knowledgePoints.filter(point => 
    (searchQuery === "" || 
      point.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedDocument === null || point.documentId === selectedDocument) &&
    (selectedSubject === null || point.subject === selectedSubject) &&
    (selectedCategory === null || point.subCategory === selectedCategory)
  )

  // 加载数据
  useEffect(() => {
    fetchData()
  }, [])
  
  // 当标签切换或文档筛选条件变化时刷新数据
  useEffect(() => {
    fetchData()
  }, [activeTab, selectedDocument])

  // 获取数据
  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "documents") {
        const response = await fetch('/api/admin/knowledge?type=documents')
        if (!response.ok) throw new Error('获取文档列表失败')
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        const params = new URLSearchParams()
        params.append('type', 'knowledge')
        if (selectedDocument) {
          params.append('documentId', selectedDocument)
        }
        
        const response = await fetch(`/api/admin/knowledge?${params.toString()}`)
        if (!response.ok) throw new Error('获取知识点列表失败')
        const data = await response.json()
        setKnowledgePoints(data.knowledgePoints || [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理删除
  const handleDelete = async () => {
    if (!itemToDelete) return
    
    setIsDeleteLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('id', itemToDelete.id)
      params.append('type', itemToDelete.type)
      
      const response = await fetch(`/api/admin/knowledge?${params.toString()}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('删除失败')
      
      // 更新本地状态
      if (itemToDelete.type === 'document') {
        setDocuments(docs => docs.filter(doc => doc.id !== itemToDelete.id))
        setKnowledgePoints(points => points.filter(point => point.documentId !== itemToDelete.id))
        toast.success('文档已删除')
      } else {
        setKnowledgePoints(points => points.filter(point => point.id !== itemToDelete.id))
        toast.success('知识点已删除')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败，请稍后重试')
    } finally {
      setIsDeleteLoading(false)
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }
  
  // 处理编辑
  const handleEdit = async () => {
    if (!knowledgeToEdit) return
    
    setIsEditLoading(true)
    try {
      const response = await fetch('/api/admin/knowledge', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: knowledgeToEdit.id,
          title: editTitle,
          content: editContent,
          importance: editImportance,
        }),
      })
      
      if (!response.ok) throw new Error('更新失败')
      
      // 更新本地状态
      setKnowledgePoints(points => 
        points.map(point => 
          point.id === knowledgeToEdit.id 
            ? { 
                ...point, 
                title: editTitle, 
                content: editContent,
                importance: editImportance,
              } 
            : point
        )
      )
      
      toast.success('知识点已更新')
    } catch (error) {
      console.error('更新失败:', error)
      toast.error('更新失败，请稍后重试')
    } finally {
      setIsEditLoading(false)
      setIsEditDialogOpen(false)
      setKnowledgeToEdit(null)
    }
  }
  
  // 打开编辑对话框
  const openEditDialog = (knowledge: any) => {
    setKnowledgeToEdit(knowledge)
    setEditTitle(knowledge.title)
    setEditContent(knowledge.content)
    setEditImportance(knowledge.importance)
    setIsEditDialogOpen(true)
  }

  // 渲染重要性星级
  const renderImportance = (importance: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < importance ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
        />
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识点管理</h1>
          <p className="text-sm text-muted-foreground">
            管理学科知识文档和提取的知识点
          </p>
        </div>
        <Button onClick={() => router.push('/admin/upload')}>
          <FileUp className="mr-2 h-4 w-4" />
          上传文档
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="md:w-2/3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档或知识点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>
        <div className="flex space-x-2 md:w-1/3">
          <Select value={selectedSubject || ""} onValueChange={(value) => setSelectedSubject(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="选择学科" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">所有学科</SelectItem>
              <SelectItem value="考公">考公</SelectItem>
              <SelectItem value="教资">教资</SelectItem>
              <SelectItem value="法考">法考</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">所有分类</SelectItem>
              <SelectItem value="行政法">行政法</SelectItem>
              <SelectItem value="民法">民法</SelectItem>
              <SelectItem value="刑法">刑法</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1">
            <FileUp className="mr-2 h-4 w-4" />
            上传文档
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            文档 ({filteredDocuments.length})
          </TabsTrigger>
          <TabsTrigger value="points" className="flex-1">
            <BookOpen className="mr-2 h-4 w-4" />
            知识点 ({filteredKnowledgePoints.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>上传文档</CardTitle>
              <CardDescription>
                上传学科文档，系统将自动提取知识点
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="subject">学科 *</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger>
                      <SelectValue placeholder="选择学科" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subj) => (
                        <SelectItem key={subj.value} value={subj.value}>
                          {subj.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subCategory">子类别</Label>
                  <Select value={subCategory} onValueChange={setSubCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择子类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {subject && SUBJECT_CATEGORIES[subject]?.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">文档文件 *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                    className="cursor-pointer"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    支持的格式: PDF, Word, TXT, Markdown, RTF
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="输入文档描述"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在上传并提取知识点...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    上传文档
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>文档列表</CardTitle>
              <CardDescription>已上传的知识文档列表</CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">暂无文档</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    尚未上传文档或没有符合筛选条件的文档
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/admin/upload')}
                    className="mt-4"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    上传文档
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>学科/分类</TableHead>
                      <TableHead className="text-center">知识点数</TableHead>
                      <TableHead>上传日期</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{doc.title}</span>
                            {doc.description && (
                              <span className="text-sm text-muted-foreground">
                                {doc.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant="outline">{doc.subject}</Badge>
                            {doc.subCategory && (
                              <Badge variant="secondary">{doc.subCategory}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{doc._count.knowledgePoints}</span>
                        </TableCell>
                        <TableCell>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setActiveTab("points")
                                setSelectedDocument(doc.id)
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ id: doc.id, type: 'document' })
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="points" className="mt-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>知识点列表</CardTitle>
              <CardDescription>
                从文档中提取的知识点列表
                {selectedDocument && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-500" 
                    onClick={() => setSelectedDocument(null)}
                  >
                    清除文档筛选
                  </Button>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredKnowledgePoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">暂无知识点</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    尚未提取知识点或没有符合筛选条件的知识点
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标题</TableHead>
                      <TableHead>来源文档</TableHead>
                      <TableHead>学科/分类</TableHead>
                      <TableHead>重要性</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKnowledgePoints.map((point) => (
                      <TableRow key={point.id}>
                        <TableCell className="font-medium">
                          {point.title}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            onClick={() => {
                              setSelectedDocument(point.documentId)
                            }}
                          >
                            {point.document.title}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant="outline">{point.subject}</Badge>
                            {point.subCategory && (
                              <Badge variant="secondary">{point.subCategory}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={importanceColorMap[point.importance]}
                          >
                            {point.importance === "HIGH" && "高"}
                            {point.importance === "MEDIUM" && "中"}
                            {point.importance === "LOW" && "低"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openEditDialog(point)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ id: point.id, type: 'knowledge' })
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这{itemToDelete?.type === 'document' ? '个文档及其所有关联的知识点' : '个知识点'}吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleteLoading}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 编辑知识点对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑知识点</DialogTitle>
            <DialogDescription>
              修改知识点的标题、内容和重要性。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">标题</Label>
              <Input 
                id="title" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">内容</Label>
              <Textarea 
                id="content" 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                className="min-h-[150px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="importance">重要性</Label>
              <Select value={editImportance} onValueChange={setEditImportance}>
                <SelectTrigger id="importance">
                  <SelectValue placeholder="选择重要性" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isEditLoading}
            >
              取消
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={isEditLoading}
            >
              {isEditLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : '保存修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 