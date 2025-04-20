import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-6">AI考试伙伴</h1>
        <p className="text-xl text-gray-700 mb-8 max-w-md mx-auto">
          你的智能学习助手，让备考更高效，学习更轻松
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/onboarding" 
            className="block w-64 mx-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-lg transition-colors"
          >
            开始体验 →
          </Link>
          
          <Link 
            href="/dashboard" 
            className="block w-64 mx-auto py-3 px-6 bg-white hover:bg-gray-100 text-indigo-600 font-medium rounded-lg text-lg border border-indigo-200 transition-colors"
          >
            直接进入系统
          </Link>
        </div>
      </div>
      
      <div className="mt-16 text-sm text-gray-500">
        演示版本 - 无需登录即可体验所有功能
      </div>
    </div>
  )
}
