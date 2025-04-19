import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">AI考试助手</h1>
        <p className="text-xl mb-8">
          你的个人学习伙伴，帮助你备考提高效率
        </p>
        <div className="mt-8 grid gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
          >
            登录系统
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center"
          >
            注册账号
          </Link>
        </div>
      </div>
    </main>
  )
}
