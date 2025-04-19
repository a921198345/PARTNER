"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, Trash2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
  tags: string[];
  importance: string;
  document: {
    id: string;
    title: string;
    subject: string;
    subCategory: string;
  };
}

export default function KnowledgePointPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [knowledgePoint, setKnowledgePoint] = useState<KnowledgePoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // 表单状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [importance, setImportance] = useState<string>("MEDIUM");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  // 初始加载知识点数据
  useEffect(() => {
    async function fetchKnowledgePoint() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/knowledge/points/${params.id}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "获取知识点失败");
        }
        
        const data = await response.json();
        setKnowledgePoint(data.knowledgePoint);
        
        // 设置表单初始值
        setTitle(data.knowledgePoint.title);
        setContent(data.knowledgePoint.content);
        setImportance(data.knowledgePoint.importance);
        setTags(Array.isArray(data.knowledgePoint.tags) 
          ? data.knowledgePoint.tags 
          : (typeof data.knowledgePoint.tags === 'string' 
              ? JSON.parse(data.knowledgePoint.tags) 
              : []));
      } catch (error) {
        console.error("获取知识点失败:", error);
        setError(error instanceof Error ? error.message : "获取知识点失败");
        toast.error("获取知识点失败");
      } finally {
        setLoading(false);
      }
    }
    
    fetchKnowledgePoint();
  }, [params.id]);
  
  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  // 删除标签
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // 保存更改
  const saveChanges = async () => {
    try {
      setSaving(true);
      
      if (!title.trim()) {
        toast.error("标题不能为空");
        return;
      }
      
      const response = await fetch(`/api/admin/knowledge/points/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          tags,
          importance,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "更新知识点失败");
      }
      
      toast.success("知识点已更新");
    } catch (error) {
      console.error("更新知识点失败:", error);
      toast.error(error instanceof Error ? error.message : "更新知识点失败");
    } finally {
      setSaving(false);
    }
  };
  
  // 删除知识点
  const deleteKnowledgePoint = async () => {
    try {
      const response = await fetch(`/api/admin/knowledge/points/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除知识点失败");
      }
      
      toast.success("知识点已删除");
      router.push(`/admin/knowledge?document=${knowledgePoint?.document.id}`);
    } catch (error) {
      console.error("删除知识点失败:", error);
      toast.error(error instanceof Error ? error.message : "删除知识点失败");
    }
  };
  
  // 返回文档页面
  const navigateBack = () => {
    if (knowledgePoint?.document.id) {
      router.push(`/admin/knowledge?document=${knowledgePoint.document.id}`);
    } else {
      router.push("/admin/knowledge");
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={() => router.push("/admin/knowledge")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回知识库
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!knowledgePoint) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={() => router.push("/admin/knowledge")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回知识库
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>知识点不存在或已被删除</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigateBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">编辑知识点</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="text-red-500" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
          
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存更改
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* 文档信息 */}
      <div className="rounded-lg bg-muted p-4">
        <div className="mb-2 text-sm text-muted-foreground">所属文档</div>
        <div className="text-lg font-semibold">{knowledgePoint.document.title}</div>
        <div className="mt-2 flex gap-2">
          <Badge variant="outline">{knowledgePoint.document.subject}</Badge>
          {knowledgePoint.document.subCategory && (
            <Badge variant="outline">{knowledgePoint.document.subCategory}</Badge>
          )}
        </div>
      </div>
      
      {/* 编辑表单 */}
      <Card>
        <CardHeader>
          <CardTitle>知识点详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="知识点标题"
            />
          </div>
          
          {/* 内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="知识点详细内容"
              className="min-h-[200px]"
            />
          </div>
          
          {/* 重要程度 */}
          <div className="space-y-2">
            <Label htmlFor="importance">重要程度</Label>
            <Select value={importance} onValueChange={setImportance}>
              <SelectTrigger id="importance">
                <SelectValue placeholder="选择重要程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">高 (HIGH)</SelectItem>
                <SelectItem value="MEDIUM">中 (MEDIUM)</SelectItem>
                <SelectItem value="LOW">低 (LOW)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 标签 */}
          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="添加标签"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="secondary">
                添加
              </Button>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
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
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={deleteKnowledgePoint}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 