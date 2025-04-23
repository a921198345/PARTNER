export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">测试页面</h1>
      <p>这是一个简单的测试页面，用于验证Next.js渲染是否正常工作。</p>
      <div className="mt-4">
        <a href="/test-upload" className="text-blue-600 underline">
          转到上传测试页面
        </a>
      </div>
    </div>
  );
} 