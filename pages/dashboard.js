// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import { getUserCourses, getProgress, getCourses, getCompletedLessons } from '../services/courseService';
import { getJournalEntries } from '../services/journalService';
import Link from 'next/link';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [userCourses, setUserCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [recentJournals, setRecentJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studyTime, setStudyTime] = useState(0); // 勉強時間（分）
  const [courseCompletionStats, setCourseCompletionStats] = useState({});
  const [loginDays, setLoginDays] = useState([]);

  // 現在の日付
  const today = new Date();
  const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()} (${['日', '月', '火', '水', '木', '金', '土'][today.getDay()]})`;

  // カレンダー用の日付生成
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  // カレンダーデータの作成
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // 月の最初の日の前の空白
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // 月を変更する
  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // コースデータの取得
          const courses = await getCourses();
          setAllCourses(courses);

          const userCourseIds = await getUserCourses(currentUser.uid);
          const userCourseDetails = courses.filter(course => 
            userCourseIds.includes(course.id)
          );
          setUserCourses(userCourseDetails);

          // 進捗データの取得
          const progressData = await getProgress(currentUser.uid);
          setProgress(progressData);

          // コース別の完了状況取得
          const stats = {};
          for (const courseId of userCourseIds) {
            const completedLessons = await getCompletedLessons(currentUser.uid, courseId);
            const course = courses.find(c => c.id === courseId);
            if (course && course.lessons) {
              stats[courseId] = {
                completed: completedLessons?.length || 0,
                total: course.lessons?.length || 1
              };
            }
          }
          setCourseCompletionStats(stats);

          // 最新の日記エントリー取得
          const journals = await getJournalEntries(currentUser.uid);
          setRecentJournals(journals.slice(0, 3)); // 最新3件のみ

          // 勉強時間の計算（仮の値）
          const totalMinutes = userCourseDetails.length * 45; // コース数 × 45分（サンプル）
          setStudyTime(totalMinutes);

          // ログイン日の取得（仮のデータ - 実際はFirestoreから取得）
          // 現在月のランダムな日付をログイン日として生成
          const loginDaysData = [1, 4, 7, 14, 18, 21, 28]; // サンプルログイン日
          // 今日の日付を追加
          if (!loginDaysData.includes(today.getDate())) {
            loginDaysData.push(today.getDate());
          }
          setLoginDays(loginDaysData.sort((a, b) => a - b));

        } catch (error) {
          console.error('データの取得に失敗しました', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [currentUser]);

  // 全体の進捗率を計算
  const calculateOverallProgress = () => {
    if (userCourses.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    userCourses.forEach(course => {
      if (progress[course.id] !== undefined) {
        total += progress[course.id];
        count++;
      }
    });
    
    return count > 0 ? Math.round(total / count) : 0;
  };

  // 日付が今日かどうかをチェック
  const isToday = (day) => {
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  // 日付がログイン日かどうかをチェック
  const isLoginDay = (day) => {
    return loginDays.includes(day);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6 text-center">ダッシュボード</h1>
          
          {/* 上部カード：統計情報とカレンダー */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* 左側：統計情報 */}
            <div className="bg-white p-4 rounded shadow md:w-1/2">
              {/* 総合進捗 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">総合進捗</h2>
                <div className="text-3xl font-bold">{calculateOverallProgress()}%</div>
              </div>
              
              {/* 登録コース */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">登録コース</h2>
                <div className="text-3xl font-bold">{userCourses.length}</div>
                <p className="text-sm text-gray-600">{userCourses.length}件のコースを学習中</p>
              </div>
              
              {/* 今週の学習時間 */}
              <div>
                <h2 className="text-lg font-semibold mb-2">今週の学習時間</h2>
                <div className="text-3xl font-bold">{Math.floor(studyTime / 60)}時間 {studyTime % 60}分</div>
                <p className="text-sm text-gray-600">目標: 週10時間</p>
              </div>
            </div>
            
            {/* 右側：カレンダー */}
            <div className="bg-white p-4 rounded shadow md:w-1/2">
              <div className="flex justify-center items-center mb-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  &lt;
                </button>
                <h2 className="text-lg font-medium mx-4">
                  {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                </h2>
                <button 
                  onClick={() => changeMonth(1)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  &gt;
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* 曜日 */}
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="text-center text-sm py-1">
                    {day}
                  </div>
                ))}
                
                {/* 日付 */}
                {/* 日付 */}
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className="text-center py-2 text-sm relative"
                >
                  {day !== null && (
                    <div 
                      className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                        isLoginDay(day) ? 'bg-green-100' : ''
                      } ${isToday(day) ? 'font-bold' : ''}`}
                    >
                      {day}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
          
          {/* 登録コース */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">登録コース</h2>
            
            {userCourses.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                コースが登録されていません
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">コース名</th>
                      <th className="text-left py-2">進捗状況</th>
                      <th className="text-left py-2">完了レッスン</th>
                      <th className="text-right py-2">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCourses.map(course => {
                      const stats = courseCompletionStats[course.id] || { completed: 0, total: 1 };
                      const completionPercent = Math.round((stats.completed / stats.total) * 100);
                      
                      return (
                        <tr key={course.id} className="border-b">
                          <td className="py-2">
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-gray-500">{course.description}</div>
                          </td>
                          <td className="py-2">
                            <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${completionPercent}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">{completionPercent}% 完了</div>
                          </td>
                          <td className="py-2">
                            {stats.completed} / {stats.total}
                          </td>
                          <td className="py-2 text-right">
                            <Link href={`/courses/${course.id}`} className="text-green-600 hover:underline">
                              コースを見る
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* 最近の学習記録 */}
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">最近の学習記録</h2>
              <Link href="/journal" className="text-green-600 hover:underline text-sm">
                すべて見る
              </Link>
            </div>
            
            {recentJournals.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                学習記録がありません
              </p>
            ) : (
              <div className="space-y-4">
                {recentJournals.map(entry => (
                  <div key={entry.id} className="border-b pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {entry.reaction && (
                        <span className="text-xl">{entry.reaction}</span>
                      )}
                    </div>
                    <p className="my-2">
                      {entry.content.length > 100 
                        ? `${entry.content.substring(0, 100)}...` 
                        : entry.content}
                    </p>
                    <div className="flex">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        entry.health === '良好' ? 'bg-green-100 text-green-800' :
                        entry.health === '普通' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.health}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}