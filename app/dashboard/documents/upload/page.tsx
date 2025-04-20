"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DocumentUploader from "@/app/components/DocumentUploader";
import { useToast } from "@/components/ui/use-toast";

// 科目类型定义
interface Subject {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

// 子类别类型定义
interface SubCategory {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // 获取科目列表
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/subjects?includeSubcategories=true");
        if (!response.ok) throw new Error("获取科目失败");
        const data = await response.json();
        setSubjects(data.subjects);
        
        // 如果有科目，默认选择第一个
        if (data.subjects.length > 0) {
          setSelectedSubject(data.subjects[0].id);
          setSubcategories(data.subjects[0].subcategories || []);
        }
      } catch (error) {
        console.error("获取科目失败:", error);
        toast({
          title: "获取科目失败",
          description: "无法加载科目列表，请刷新页面重试。",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [toast]);

  // 当选择的科目变更时，更新子类别列表
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject);
      if (subject) {
        setSubcategories(subject.subcategories || []);
        setSelectedSubCategory("");
      }
    } else {
      setSubcategories([]);
      setSelectedSubCategory("");
    }
  }, [selectedSubject, subjects]);

  // 处理上传成功
  const handleUploadSuccess = (documentId: string) => {
    router.push(`/dashboard/documents/${documentId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.push("/dashboard/documents")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 返回文档列表
      </Button>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>选择科目分类</CardTitle>
          <CardDescription>
            选择文档所属的科目和分类，以便更好地整理和查找
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">科目</label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={loading || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择科目" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">子类别（可选）</label>
              <Select
                value={selectedSubCategory}
                onValueChange={setSelectedSubCategory}
                disabled={loading || subcategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择子类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无子类别</SelectItem>
                  {subcategories.map((subCategory) => (
                    <SelectItem key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedSubject && (
        <DocumentUploader
          subjectId={selectedSubject}
          subCategoryId={selectedSubCategory || undefined}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
} 