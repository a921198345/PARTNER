export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-12 h-12 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
      <p className="mt-4 text-gray-600">加载中...</p>
    </div>
  );
} 