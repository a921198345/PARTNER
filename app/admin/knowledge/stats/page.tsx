"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import {
  FileText,
  Database,
  BookOpen,
  AlertCircle,
  Loader2,
  ChevronLeft,
  BookMarked,
  Tag,
  Clock,
  ArrowUpDown,
  ListFilter
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Stats {
  totalDocuments: number;
  totalKnowledgePoints: number;
  pointsByImportance: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  documentsBySubject: Record<string, number>;
  topViewedPoints: Array<{
    id: string;
    title: string;
    viewCount: number;
  }>;
  pointsBySubject: Record<string, number>;
  recentDocuments: Array<{
    id: string;
    title: string;
    createdAt: string;
    knowledgePointCount: number;
  }>;
}

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 加载统计数据
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        
        const response = await fetch('/api/admin/knowledge/stats')
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '获取统计数据失败')
        }
        
        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        console.error('获取统计数据失败:', error)
        setError(error instanceof Error ? error.message : '获取统计数据失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  // 重要性统计数据
  const importanceData = stats ? [
    { name: '高', value: stats.pointsByImportance.HIGH, color: '#ef4444' },
    { name: '中', value: stats.pointsByImportance.MEDIUM, color: '#f59e0b' },
    { name: '低', value: stats.pointsByImportance.LOW, color: '#10b981' }
  ] : []
  
  // 学科统计数据
  const subjectData = stats ? Object.entries(stats.documentsBySubject).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  })) : []
  
  // 学科知识点统计数据
  const pointsBySubjectData = stats ? Object.entries(stats.pointsBySubject).map(([name, value]) => ({
    name,
    value
  })) : []
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }
  
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={() => router.push('/admin/knowledge')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回知识库
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  if (!stats) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="outline" onClick={() => router.push('/admin/knowledge')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回知识库
        </Button>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>暂无统计数据</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">知识库统计</h1>
          <p className="text-sm text-muted-foreground">
            查看知识库概览和统计数据
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/knowledge')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回知识库
        </Button>
      </div>
      
      {/* 概览卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">文档总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              已上传的文档数量
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">知识点总数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKnowledgePoints}</div>
            <p className="text-xs text-muted-foreground">
              已提取的知识点数量
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">重要知识点</CardTitle>
            <BookMarked className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsByImportance.HIGH}</div>
            <p className="text-xs text-muted-foreground">
              标记为高重要性的知识点
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均每文档知识点</CardTitle>
            <ListFilter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDocuments > 0 
                ? Math.round(stats.totalKnowledgePoints / stats.totalDocuments * 10) / 10 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              每个文档的平均知识点数
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* 详细统计 */}
      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">知识点分布</TabsTrigger>
          <TabsTrigger value="trending">热门知识点</TabsTrigger>
          <TabsTrigger value="recent">最近添加</TabsTrigger>
        </TabsList>
        
        {/* 知识点分布 */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 重要性分布 */}
            <Card>
              <CardHeader>
                <CardTitle>重要性分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={importanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {importanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* 学科分布 */}
            <Card>
              <CardHeader>
                <CardTitle>学科分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* 学科知识点数量 */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>各学科知识点数量</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pointsBySubjectData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4f46e5" name="知识点数量" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* 热门知识点 */}
        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>最多查看的知识点</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topViewedPoints.length > 0 ? (
                <div className="space-y-4">
                  {stats.topViewedPoints.map((point, index) => (
                    <div
                      key={point.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{point.title}</div>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-sm text-muted-foreground"
                            onClick={() => router.push(`/admin/knowledge/points/${point.id}`)}
                          >
                            查看详情
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm text-muted-foreground">
                          {point.viewCount} 次查看
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div className="max-w-md space-y-2">
                    <Database className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">暂无查看数据</h3>
                    <p className="text-sm text-muted-foreground">
                      知识点尚未被用户查看，数据将在用户使用后更新
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 最近添加 */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>最近添加的文档</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentDocuments.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center space-x-4 rounded-md border p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{doc.title}</div>
                        <div className="flex text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDate(doc.createdAt)}
                          <Tag className="ml-3 mr-1 h-4 w-4" />
                          {doc.knowledgePointCount} 个知识点
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => router.push(`/admin/knowledge?document=${doc.id}`)}
                      >
                        查看
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div className="max-w-md space-y-2">
                    <Database className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">暂无文档</h3>
                    <p className="text-sm text-muted-foreground">
                      尚未添加任何文档，请先上传文档
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 