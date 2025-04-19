"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  AlertCircle,
  Loader2,
  FileText,
  Filter,
  XCircle
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

interface KnowledgePoint {
  id: string;
  title: string;
  content: string;
  importance: string;
  tags: string[] | string;
  documentId: string;
  document: {
    title: string;
  };
  createdAt: string;
  viewCount: number;
}

interface KnowledgePointListProps {
  documentId?: string;
  subjectId?: string;
  subCategoryId?: string;
}

export default function KnowledgePointList({
  documentId,
  subjectId,
  subCategoryId,
}: KnowledgePointListProps) {
  const router = useRouter()
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [importanceFilter, setImportanceFilter] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  
  // 加载知识点列表
  useEffect(() => {
    async function fetchKnowledgePoints() {
      try {
        setLoading(true)
        setError(null)
        
        let url = "/api/admin/knowledge/points"
        const params = new URLSearchParams()
        
        if (documentId) {
          params.append("documentId", documentId)
        }
        
        if (subjectId) {
          params.append("subjectId", subjectId)
        }
        
        if (subCategoryId) {
          params.append("subCategoryId", subCategoryId)
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "获取知识点列表失败")
        }
        
        const data = await response.json()
        setKnowledgePoints(data.knowledgePoints)
      } catch (error) {
        console.error("获取知识点列表失败:", error)
        setError(error instanceof Error ? error.message : "获取知识点列表失败")
        toast.error("获取知识点列表失败")
      } finally {
        setLoading(false)
      }
    }
    
    fetchKnowledgePoints()
  }, [documentId, subjectId, subCategoryId])
  
  // 处理删除知识点
  const handleDeletePoint = async () => {
    if (!selectedPointId) return
    
    try {
      const response = await fetch(`/api/admin/knowledge/points/${selectedPointId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "删除知识点失败")
      }
      
      // 更新列表
      setKnowledgePoints(points => 
        points.filter(point => point.id !== selectedPointId)
      )
      
      toast.success("知识点已删除")
    } catch (error) {
      console.error("删除知识点失败:", error)
      toast.error(error instanceof Error ? error.message : "删除知识点失败")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedPointId(null)
    }
  }
  
  // 确认删除
  const confirmDelete = (id: string) => {
    setSelectedPointId(id)
    setDeleteDialogOpen(true)
  }
  
  // 编辑知识点
  const editKnowledgePoint = (id: string) => {
    router.push(`/admin/knowledge/points/${id}`)
  }
  
  // 处理知识点筛选
  const filteredPoints = knowledgePoints.filter(point => {
    const matchesSearch = 
      searchTerm === "" || 
      point.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      point.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesImportance = 
      importanceFilter === "" || 
      point.importance === importanceFilter
      
    return matchesSearch && matchesImportance
  })
  
  // 处理标签显示
  const parseTags = (tags: string[] | string): string[] => {
    if (Array.isArray(tags)) {
      return tags
    }
    
    try {
      return typeof tags === "string" && tags ? JSON.parse(tags) : []
    } catch {
      return []
    }
  }
  
  // 重要性显示
  const renderImportance = (importance: string) => {
    switch (importance) {
      case "HIGH":
        return <Badge className="bg-red-500">重要</Badge>
      case "MEDIUM":
        return <Badge className="bg-yellow-500">中等</Badge>
      case "LOW":
        return <Badge className="bg-green-500">基础</Badge>
      default:
        return <Badge className="bg-gray-500">{importance}</Badge>
    }
  }
  
  // 清除筛选
  const clearFilters = () => {
    setSearchTerm("")
    setImportanceFilter("")
  }
  
  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>错误</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>知识点列表</CardTitle>
          <span className="text-sm text-muted-foreground">
            共 {knowledgePoints.length} 条知识点
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* 筛选栏 */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索知识点..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={importanceFilter} onValueChange={setImportanceFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {importanceFilter ? "重要性: " + importanceFilter : "重要性筛选"}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部</SelectItem>
              <SelectItem value="HIGH">高 (HIGH)</SelectItem>
              <SelectItem value="MEDIUM">中 (MEDIUM)</SelectItem>
              <SelectItem value="LOW">低 (LOW)</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || importanceFilter) && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <XCircle className="h-4 w-4" />
              清除筛选
            </Button>
          )}
        </div>
        
        {filteredPoints.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-center">
            <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">暂无知识点</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || importanceFilter 
                ? "没有符合筛选条件的知识点" 
                : "该文档下没有知识点"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>重要性</TableHead>
                  <TableHead>标签</TableHead>
                  <TableHead>文档</TableHead>
                  <TableHead className="w-[80px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPoints.map(point => (
                  <TableRow key={point.id}>
                    <TableCell>
                      <div className="font-medium">{point.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {point.content.substring(0, 100)}
                        {point.content.length > 100 ? "..." : ""}
                      </div>
                    </TableCell>
                    <TableCell>{renderImportance(point.importance)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {parseTags(point.tags).slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {parseTags(point.tags).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{parseTags(point.tags).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm line-clamp-1">{point.document.title}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">打开菜单</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => editKnowledgePoint(point.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(point.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除这个知识点吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePoint}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
} 