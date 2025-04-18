"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud, File, X, Check, Loader2 } from "lucide-react";

interface DocumentUploaderProps {
  subjectId: string;
  subCategoryId?: string;
  onSuccess?: (documentId: string) => void;
}

export default function DocumentUploader({
  subjectId,
  subCategoryId,
  onSuccess,
}: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, "waiting" | "uploading" | "success" | "error">>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // 处理文件添加
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = validateFiles(newFiles);
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      
      // 初始化上传状态
      validFiles.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        setUploadStatus(prev => ({ ...prev, [file.name]: "waiting" }));
      });
    }
  };

  // 验证文件
  const validateFiles = (newFiles: File[]): File[] => {
    // 支持的文件类型
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/markdown",
      "application/rtf",
    ];

    // 最大文件大小 (20MB)
    const maxSize = 20 * 1024 * 1024;

    return newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "不支持的文件类型",
          description: `${file.name} 的文件类型不受支持。请上传PDF、Word、TXT或Markdown文件。`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > maxSize) {
        toast({
          title: "文件过大",
          description: `${file.name} 超过20MB限制。请压缩后重试。`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });
  };

  // 处理拖放
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(newFiles);
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      
      // 初始化上传状态
      validFiles.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        setUploadStatus(prev => ({ ...prev, [file.name]: "waiting" }));
      });
    }
  };

  // 移除文件
  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  // 上传文件
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    const documentIds: string[] = [];
    
    for (const file of files) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: "uploading" }));
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subjectId", subjectId);
        if (subCategoryId) {
          formData.append("subCategoryId", subCategoryId);
        }
        
        // 上传文件
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
          // 添加上传进度监控
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            }
          },
        });
        
        if (!response.ok) {
          throw new Error(`上传失败: ${response.statusText}`);
        }
        
        const data = await response.json();
        documentIds.push(data.documentId);
        
        setUploadStatus(prev => ({ ...prev, [file.name]: "success" }));
      } catch (error) {
        console.error(`上传 ${file.name} 失败:`, error);
        setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
        toast({
          title: "上传失败",
          description: `无法上传 ${file.name}。请重试。`,
          variant: "destructive",
        });
      }
    }
    
    if (documentIds.length > 0) {
      // 触发文档处理
      try {
        await fetch("/api/documents/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentIds }),
        });
        
        toast({
          title: "上传成功",
          description: "文档处理已启动，知识点将很快提取完成。",
          variant: "default",
        });
        
        // 调用成功回调
        if (onSuccess && documentIds.length > 0) {
          onSuccess(documentIds[0]);
        }
        
        // 清除文件列表
        setFiles([]);
        setUploadProgress({});
        setUploadStatus({});
      } catch (error) {
        console.error("文档处理启动失败:", error);
        toast({
          title: "处理失败",
          description: "文档已上传，但无法启动处理。请稍后在文档列表中手动处理。",
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
  };

  // 文件类型图标映射
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // 根据扩展名返回不同颜色的图标
    switch (extension) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'docx':
      case 'doc':
        return <File className="h-8 w-8 text-blue-500" />;
      case 'txt':
        return <File className="h-8 w-8 text-gray-500" />;
      case 'md':
        return <File className="h-8 w-8 text-purple-500" />;
      case 'rtf':
        return <File className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return null;
      case "uploading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "success":
        return <Check className="h-5 w-5 text-green-500" />;
      case "error":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>上传学习资料</CardTitle>
        <CardDescription>
          上传PDF、Word、TXT或Markdown文件，我们将自动提取知识点
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 拖放区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="mb-1 font-medium">拖放文件到这里，或点击上传</p>
          <p className="text-sm text-gray-500">
            支持PDF、Word、TXT和Markdown (最大20MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt,.md,.rtf"
            className="hidden"
          />
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium">待上传文件</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(uploadStatus[file.name])}
                    {uploadStatus[file.name] === "uploading" && (
                      <div className="w-20">
                        <Progress value={uploadProgress[file.name]} />
                      </div>
                    )}
                    {uploadStatus[file.name] !== "uploading" && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.name);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={uploading}
        >
          取消
        </Button>
        <Button
          onClick={uploadFiles}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            "上传文件"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}