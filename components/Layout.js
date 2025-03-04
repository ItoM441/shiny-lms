// components/Layout.js
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Layout({ children }) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white py-4 px-6 shadow-sm flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-green-600">
          LMS App
        </Link>
        
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">🔍</span>
          </div>
          <input 
            type="text" 
            className="w-full py-2 pl-10 pr-4 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Search..." 
          />
        </div>
        
        <div className="flex items-center">
          {currentUser && (
            <>
              <span className="mr-4">{currentUser.displayName || 'ユーザー名'}</span>
              <button 
                onClick={handleLogout}
                className="mr-2 text-sm"
              >
                ログアウト
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex">
        <nav className="w-48 bg-white border-r border-gray-200 min-h-screen p-4">
          <ul className="space-y-4">
            <li>
              <Link 
                href="/dashboard" 
                className={`flex items-center px-4 py-2 rounded ${
                  router.pathname === '/dashboard' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'text-gray-700 hover:bg-green-50'
                }`}
              >
                <span className="mr-2">📊</span> Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/courses" 
                className={`flex items-center px-4 py-2 rounded ${
                  router.pathname === '/courses' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'text-gray-700 hover:bg-green-50'
                }`}
              >
                <span className="mr-2">📚</span> Courses
              </Link>
            </li>
            <li>
              <Link 
                href="/journal" 
                className={`flex items-center px-4 py-2 rounded ${
                  router.pathname === '/journal' 
                    ? 'bg-green-100 text-green-800 font-medium' 
                    : 'text-gray-700 hover:bg-green-50'
                }`}
              >
                <span className="mr-2">📝</span> Journal
              </Link>
            </li>
          </ul>
        </nav>

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}