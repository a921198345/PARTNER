'use client';

import { useState } from 'react';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('法条');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setError('请选择文件');
      return;
    }
    
    setUploading(true);
    setError(null);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传过程中发生错误');
    } finally {
      setUploading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setError(null);
      setResult(null);
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '连接测试失败');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接测试过程中发生错误');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Supabase 连接测试</h1>
      
      <div className="mb-8">
        <button 
          onClick={handleTestConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          测试 Supabase 连接
        </button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">文件上传测试</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            文件分类
          </label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="法条">法条</option>
            <option value="案例">案例</option>
            <option value="教材">教材</option>
            <option value="其他">其他</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            选择文件
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            支持PDF、Word和文本文件，最大10MB
          </p>
        </div>
        
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-green-300"
        >
          {uploading ? '上传中...' : '上传文件'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          错误: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">结果:</h2>
          <pre className="p-3 bg-gray-100 rounded-md overflow-auto max-h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 