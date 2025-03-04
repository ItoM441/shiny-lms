// pages/courses.js
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { getCourses, enrollCourse, getUserCourses } from '../services/courseService';
import { useRouter } from 'next/router';

export default function Courses() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // コースデータの取得
          const allCourses = await getCourses();
          setCourses(allCourses);

          // ユーザーコースの取得
          const userCourseIds = await getUserCourses(currentUser.uid);
          setUserCourses(userCourseIds);
        } catch (error) {
          console.error('データの取得に失敗しました', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [currentUser]);

  const handleEnroll = async (courseId) => {
    try {
      setLoading(true);
      await enrollCourse(currentUser.uid, courseId);
      setUserCourses([...userCourses, courseId]);
      alert('コースを登録しました。ダッシュボードで進捗を管理できます。');
      router.push('/dashboard');
    } catch (error) {
      console.error('コースの登録に失敗しました', error);
      alert('コースの登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const viewCourseDetails = (courseId) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-3xl font-bold mb-6">コース一覧</h1>
        
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="mt-2 text-gray-600 min-h-[60px]">{course.description}</p>
                
                {userCourses.includes(course.id) ? (
                  <div className="mt-4">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-md">
                      ✓ 登録済み
                    </div>
                    <button
                      onClick={() => viewCourseDetails(course.id)}
                      className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      コース内容を見る
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={loading}
                    className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                  >
                    {loading ? '登録中...' : 'コースを登録する'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}