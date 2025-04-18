"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Check,
  ChevronDown,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

const mockKnowledgeEntries = [
  {
    id: "1",
    title: "行政处罚的种类和设定",
    content: "行政处罚的种类主要包括：（一）警告；（二）罚款；（三）没收违法所得、没收非法财物；（四）责令停产停业；（五）暂扣或者吊销许可证、暂扣或者吊销执照；（六）行政拘留；（七）法律、行政法规规定的其他行政处罚。",
    tags: "行政处罚,行政法",
    subjectId: "1",
    subCategoryId: "101",
    importance: 5,
    viewCount: 24,
    createdAt: "2024-05-01T10:30:00Z",
  },
  {
    id: "2",
    title: "申论写作的基本要求",
    content: "申论写作要求考生全面、准确理解给定资料，恰当选择和运用资料内容，合理构建文章结构，正确发表见解，言之有理有据，表达流畅。",
    tags: "申论,写作",
    subjectId: "1",
    subCategoryId: "102",
    importance: 4,
    viewCount: 36,
    createdAt: "2024-05-02T14:20:00Z",
  },
  {
    id: "3",
    title: "教育心理学概述",
    content: "教育心理学是研究教育过程中人的心理现象及其发展规律的科学，是心理学的一个分支学科，也是教育科学的一个组成部分。",
    tags: "教育心理学,基础概念",
    subjectId: "2",
    subCategoryId: "201",
    importance: 3,
    viewCount: 18,
    createdAt: "2024-05-03T09:15:00Z",
  },
]

export default function KnowledgeManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [knowledgeEntries, setKnowledgeEntries] = useState(mockKnowledgeEntries)

  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  
  // 删除对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  // 当选择学科变化时更新子类别
  useEffect(() => {
    if (selectedSubject) {
      setSubCategories(mockSubCategories[selectedSubject as keyof typeof mockSubCategories] || [])
    } else {
      setSubCategories([])
    }
    setSelectedSubCategory("")
  }, [selectedSubject])

  // 过滤知识条目
  const filteredEntries = knowledgeEntries.filter((entry) => {
    const matchesSubject = selectedSubject ? entry.subjectId === selectedSubject : true
    const matchesSubCategory = selectedSubCategory ? entry.subCategoryId === selectedSubCategory : true
    const matchesSearch = searchQuery
      ? entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return matchesSubject && matchesSubCategory && matchesSearch
  })

  const handleEditEntry = (entry: any) => {
    setCurrentEntry(entry)
    setIsEditing(true)
    setActiveTab("add")
  }

  const handleDeleteClick = (entryId: string) => {
    setEntryToDelete(entryId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      // 真实项目中这里应该调用API删除
      setKnowledgeEntries(knowledgeEntries.filter(entry => entry.id !== entryToDelete))
      setIsDeleteDialogOpen(false)
      setEntryToDelete(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 真实项目中这里应该调用API保存
    
    if (isEditing && currentEntry) {
      // 更新条目
      setKnowledgeEntries(knowledgeEntries.map(entry => 
        entry.id === currentEntry.id ? currentEntry : entry
      ))
    } else {
      // 添加新条目
      const newEntry = {
        ...currentEntry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        viewCount: 0
      }
      setKnowledgeEntries([...knowledgeEntries, newEntry])
    }
    
    // 重置表单
    setCurrentEntry(null)
    setIsEditing(false)
    setActiveTab("browse")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识库管理</h1>
          <p className="text-sm text-muted-foreground">
            管理各学科的知识条目，支持添加、编辑和删除操作
          </p>
        </div>
        <Button onClick={() => {
          setActiveTab("add")
          setCurrentEntry({
            title: "",
            content: "",
            tags: "",
            subjectId: "",
            subCategoryId: "",
            importance: 3
          })
          setIsEditing(false)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          添加知识条目
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">浏览知识库</TabsTrigger>
          <TabsTrigger value="add">
            {isEditing ? "编辑知识条目" : "添加知识条目"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>筛选条件</CardTitle>
              <CardDescription>
                选择学科和子类别，或使用关键词搜索知识条目
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="subject">学科</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="选择学科" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部学科</SelectItem>
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
                      <SelectItem value="">全部子类别</SelectItem>
                      {subCategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search">搜索</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="搜索标题、内容或标签"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>知识条目列表</CardTitle>
              <CardDescription>
                显示 {filteredEntries.length} 条知识条目
                {selectedSubject && mockSubjects.find(s => s.id === selectedSubject) 
                  ? ` - ${mockSubjects.find(s => s.id === selectedSubject)?.name}` 
                  : ''}
                {selectedSubCategory && subCategories.find(s => s.id === selectedSubCategory)
                  ? ` - ${subCategories.find(s => s.id === selectedSubCategory)?.name}`
                  : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>学科 / 子类别</TableHead>
                    <TableHead>标签</TableHead>
                    <TableHead className="text-center">重要性</TableHead>
                    <TableHead className="text-center">查看次数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        没有找到相关知识条目
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.title}</TableCell>
                        <TableCell>
                          {mockSubjects.find(s => s.id === entry.subjectId)?.name || '-'} / 
                          {mockSubCategories[entry.subjectId as keyof typeof mockSubCategories]?.find(
                            s => s.id === entry.subCategoryId
                          )?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {entry.tags.split(',').map((tag: string) => (
                            <Badge key={tag} className="mr-1 mb-1">
                              {tag}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell className="text-center">
                          {Array.from({ length: entry.importance }).map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                        </TableCell>
                        <TableCell className="text-center">{entry.viewCount}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(entry.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "编辑知识条目" : "添加知识条目"}</CardTitle>
              <CardDescription>
                {isEditing 
                  ? "修改知识条目的内容和属性" 
                  : "创建新的知识条目，填写标题、内容和相关属性"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    placeholder="输入知识条目标题"
                    value={currentEntry?.title || ""}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">学科</Label>
                    <Select 
                      value={currentEntry?.subjectId || ""} 
                      onValueChange={(value) => setCurrentEntry({ ...currentEntry, subjectId: value })}
                      required
                    >
                      <SelectTrigger id="edit-subject">
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
                    <Label htmlFor="edit-subcategory">子类别</Label>
                    <Select 
                      value={currentEntry?.subCategoryId || ""} 
                      onValueChange={(value) => setCurrentEntry({ ...currentEntry, subCategoryId: value })}
                      disabled={!currentEntry?.subjectId}
                      required
                    >
                      <SelectTrigger id="edit-subcategory">
                        <SelectValue placeholder={currentEntry?.subjectId ? "选择子类别" : "请先选择学科"} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentEntry?.subjectId && 
                          mockSubCategories[currentEntry.subjectId as keyof typeof mockSubCategories]?.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="importance">重要性</Label>
                    <Select 
                      value={currentEntry?.importance?.toString() || "3"} 
                      onValueChange={(value) => setCurrentEntry({ ...currentEntry, importance: parseInt(value) })}
                      required
                    >
                      <SelectTrigger id="importance">
                        <SelectValue placeholder="选择重要性级别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">★ - 一般</SelectItem>
                        <SelectItem value="2">★★ - 较低</SelectItem>
                        <SelectItem value="3">★★★ - 中等</SelectItem>
                        <SelectItem value="4">★★★★ - 重要</SelectItem>
                        <SelectItem value="5">★★★★★ - 核心</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">标签</Label>
                  <Input
                    id="tags"
                    placeholder="输入标签，使用逗号分隔，如: 行政法,处罚,法条"
                    value={currentEntry?.tags || ""}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, tags: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">内容</Label>
                  <Textarea
                    id="content"
                    placeholder="输入知识条目内容"
                    className="min-h-[200px]"
                    value={currentEntry?.content || ""}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setActiveTab("browse")
                    setCurrentEntry(null)
                    setIsEditing(false)
                  }}
                >
                  取消
                </Button>
                <Button type="submit">
                  {isEditing ? "保存修改" : "创建知识条目"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这个知识条目吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 