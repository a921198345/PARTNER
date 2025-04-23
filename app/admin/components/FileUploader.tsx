"use client"

import React, { useState, useRef } from 'react'
import { Upload, File, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploaderProps {
  onFileUpload: (url: string, fileName: string) => void
  acceptedTypes?: string // 如 "application/pdf,image/jpeg,image/png"
  maxSizeMB?: number
}

export function FileUploader({ 
  onFileUpload, 
  acceptedTypes = "application/pdf,image/jpeg,image/png", 
  maxSizeMB = 10 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  // 验证文件
  const validateAndSetFile = (file: File) => {
    // 重置状态
    setErrorMessage("")
    setUploadSuccess(false)
    
    // 验证文件类型
    const fileType = file.type
    if (acceptedTypes && !acceptedTypes.split(',').includes(fileType)) {
      setErrorMessage(`不支持的文件类型: ${fileType}`)
      return
    }
    
    // 验证文件大小
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setErrorMessage(`文件过大，最大支持 ${maxSizeMB}MB`)
      return
    }
    
    setSelectedFile(file)
  }

  // 上传文件
  const uploadFile = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    setErrorMessage("")
    
    try {
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // 发送请求
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '上传失败')
      }
      
      const data = await response.json()
      
      // 上传成功
      setUploadSuccess(true)
      onFileUpload(data.url, selectedFile.name)
      
      // 2秒后重置状态，以便用户上传新文件
      setTimeout(() => {
        setSelectedFile(null)
        setUploadSuccess(false)
      }, 2000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  // 取消选择
  const cancelSelection = () => {
    setSelectedFile(null)
    setErrorMessage("")
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            上传文件
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            点击或拖放文件到此处上传
          </p>
          <p className="mt-1 text-xs text-gray-500">
            支持{acceptedTypes.split(',').map(t => t.replace('application/', '').replace('image/', '')).join(', ')}
            ，最大{maxSizeMB}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="h-6 w-6 text-gray-500" />
              <div className="text-sm">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : uploadSuccess ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={cancelSelection}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={uploadFile}>
                    上传
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  )
} 