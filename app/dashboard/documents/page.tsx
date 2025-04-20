"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowUpRightFromSquare, 
  FileText, 
  Plus, 
  Search,
  Filter,
  Eye,
  FileCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// 文档类型定义
interface Document {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  processed: boolean;
  processingStatus: string | null;
  createdAt: string;
  updatedAt: string;
  subjectId: string;
  subCategoryId: string | null;
  knowledgeEntryCount: number;
}

// 科目类型定义
interface Subject {
  id: string;
  name: string;
}

// 子类别类型定义
interface SubCategory {
  id: string;
  name: string;
  subjectId: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // 获取科目列表
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects");
        if (!response.ok) throw new Error("获取科目失败");
        const data = await response.json();
        setSubjects(data.subjects);
      } catch (error) {
        console.error("获取科目失败:", error);
        toast({
          title: "获取科目失败",
          description: "无法加载科目列表，请刷新页面重试。",
          variant: "destructive",
        });
      }
    };
    fetchSubjects();
  }, [toast]);

  // 获取文档列表
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // 构建查询参数
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (filterSubject) params.append("subjectId", filterSubject);
        if (filterStatus) params.append("status", filterStatus);
        
        const response = await fetch(`/api/documents?${params.toString()}`);
        if (!response.ok) throw new Error("获取文档失败");
        const data = await response.json();
        setDocuments(data.documents);
      } catch (error) {
        console.error("获取文档失败:", error);
        toast({
          title: "获取文档失败",
          description: "无法加载文档列表，请刷新页面重试。",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [searchQuery, filterSubject, filterStatus, toast]);

  // 处理文档
  const handleProcess = async (documentId: string) => {
    try {
      const response = await fetch("/api/documents/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentIds: [documentId] }),
      });
      
      if (!response.ok) throw new Error("处理文档失败");
      
      const data = await response.json();
      
      toast({
        title: "处理请求已提交",
        description: "文档处理已开始，请等待处理完成。",
      });
      
      // 刷新文档列表
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("处理文档失败:", error);
      toast({
        title: "处理失败",
        description: "无法处理文档，请稍后重试。",
        variant: "destructive",
      });
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 获取状态标签
  const getStatusBadge = (document: Document) => {
    if (document.processed) {
      return <Badge className="bg-green-500"><FileCheck className="h-3 w-3 mr-1" /> 已处理</Badge>;
    }
    
    switch (document.processingStatus) {
      case "pending":
        return <Badge variant="outline" className="text-gray-500"><Clock className="h-3 w-3 mr-1" /> 待处理</Badge>;
      case "processing":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> 处理中</Badge>;
      case "text_extracted":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> 文本已提取</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> 处理失败</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> 未知状态</Badge>;
    }
  };

  // 获取文件类型图标和颜色
  const getFileTypeIcon = (fileType: string) => {
    const iconClass = "h-5 w-5 mr-2";
    
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className={`${iconClass} text-red-500`} />;
      case "docx":
      case "doc":
        return <FileText className={`${iconClass} text-blue-500`} />;
      case "txt":
        return <FileText className={`${iconClass} text-gray-500`} />;
      case "md":
        return <FileText className={`${iconClass} text-purple-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">学习资料管理</h1>
        <Button onClick={() => router.push("/dashboard/documents/upload")}>
          <Plus className="mr-2 h-4 w-4" /> 上传文档
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>文档筛选</CardTitle>
          <CardDescription>搜索和筛选您的文档</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder="选择科目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部科目</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="处理状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="processed">已处理</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="failed">处理失败</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>文档列表</CardTitle>
          <CardDescription>
            管理您上传的文档和提取的知识点
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">没有文档</h3>
              <p className="text-muted-foreground">
                点击"上传文档"按钮添加您的学习资料
              </p>
              <Button 
                className="mt-4"
                onClick={() => router.push("/dashboard/documents/upload")}
              >
                <Plus className="mr-2 h-4 w-4" /> 上传文档
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件名</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>知识点</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getFileTypeIcon(document.fileType)}
                        <div>
                          <div className="font-medium">{document.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {document.fileName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                    <TableCell>
                      {new Date(document.createdAt).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(document)}</TableCell>
                    <TableCell>
                      {document.knowledgeEntryCount > 0 ? (
                        <Badge className="bg-blue-500">
                          {document.knowledgeEntryCount} 个
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/documents/${document.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> 查看
                          </Link>
                        </Button>
                        {!document.processed && document.processingStatus !== "processing" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleProcess(document.id)}
                          >
                            <ArrowUpRightFromSquare className="h-4 w-4 mr-1" /> 处理
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 