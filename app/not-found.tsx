export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
      <p className="mb-4">抱歉，您访问的页面不存在。</p>
      <a 
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        返回首页
      </a>
    </div>
  );
} 