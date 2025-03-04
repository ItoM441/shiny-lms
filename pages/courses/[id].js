// pages/courses/[id].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { getCourseById, updateProgress } from '../../services/courseService';

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (id && currentUser) {
        try {
          const courseData = await getCourseById(id);
          if (courseData) {
            setCourse(courseData);
            
            // サンプルレッスンデータ（実際はFirestoreから取得）
            if (!courseData.lessons) {
              const sampleLessons = [
                {
                  id: `${id}-lesson-1`,
                  title: '入門編',
                  type: 'document',
                  content: `# ${courseData.title} 入門編
                  
こちらは${courseData.title}の入門編です。基本的な概念について学びます。

## 主な内容

1. 基本概念の理解
2. 環境構築
3. 簡単な例題

## 実践例

\`\`\`javascript
// サンプルコード
console.log("Hello World!");
\`\`\`
                  `
                },
                {
                  id: `${id}-lesson-2`,
                  title: '基本文法',
                  type: 'document',
                  content: `# ${courseData.title} 基本文法
                  
${courseData.title}の基本文法について学びます。

## 主な内容

1. データ型
2. 制御構造
3. 関数

## 実践例

\`\`\`javascript
// サンプル関数
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`
                  `
                },
                {
                  id: `${id}-lesson-3`,
                  title: '実践編',
                  type: 'video',
                  videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
                  content: `# ${courseData.title} 実践編
                  
実際のプロジェクト例を通して${courseData.title}を学びます。

## 主な内容

1. プロジェクト構成
2. ベストプラクティス
3. デバッグ方法
                  `
                }
              ];
              
              courseData.lessons = sampleLessons;
            }
            
            // ユーザーの進捗を取得（実際はFirestoreから）
            const userProgress = await getCourseProgress(currentUser.uid, id);
            setProgress(userProgress.progress || 0);
            setCompletedLessons(userProgress.completedLessons || []);
          } else {
            router.push('/courses');
          }
        } catch (error) {
          console.error('コース情報の取得に失敗しました', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id, currentUser, router]);

  // 仮のプログレス取得関数（実際はFirestoreと連携）
  const getCourseProgress = async (userId, courseId) => {
    try {
      // ここでFirestoreから実際のデータを取得する
      return { progress: 0, completedLessons: [] };
    } catch (error) {
      console.error('進捗取得エラー:', error);
      return { progress: 0, completedLessons: [] };
    }
  };

  const markLessonComplete = async (lessonId) => {
    // すでに完了している場合は処理しない
    if (completedLessons.includes(lessonId)) return;
    
    const newCompletedLessons = [...completedLessons, lessonId];
    setCompletedLessons(newCompletedLessons);
    
    // 進捗率を更新（単純に完了レッスン数 / 全レッスン数）
    const newProgress = Math.round((newCompletedLessons.length / course.lessons.length) * 100);
    setProgress(newProgress);
    
    // Firestoreに進捗を更新
    try {
      await updateProgress(currentUser.uid, id, newProgress);
      
      // レッスン完了状態も保存（実装例）
      // await updateCompletedLessons(currentUser.uid, id, newCompletedLessons);
    } catch (error) {
      console.error('進捗の更新に失敗しました', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex justify-center items-center min-h-screen">
            <p>読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">進捗状況</div>
              <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-2" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm mt-1">{progress}% 完了</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('overview')}
              >
                概要
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'content' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('content')}
              >
                コンテンツ
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">コース概要</h2>
                  <p className="mb-4">{course.description}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">このコースについて</h3>
                  <p className="mb-4">
                    このコースでは{course.title}の基本から応用まで、ステップバイステップで学ぶことができます。
                    実践的な例を通じて実務で役立つスキルを身につけましょう。
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-2">学べること</h3>
                  <ul className="list-disc pl-5 mb-4">
                    <li>基本概念と用語</li>
                    <li>実践的なプログラミング手法</li>
                    <li>効率的な開発のためのベストプラクティス</li>
                    <li>実際のプロジェクトへの応用</li>
                  </ul>
                  
                  <button
                    onClick={() => setActiveTab('content')}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    コンテンツを見る
                  </button>
                </div>
              ) : (
                <div className="flex">
                  {/* 目次 */}
                  <div className="w-64 pr-6 border-r">
                    <h3 className="text-lg font-semibold mb-4">レッスン一覧</h3>
                    <ul className="space-y-3">
                      {course.lessons.map((lesson, index) => (
                        <li key={lesson.id}>
                          <button
                            onClick={() => setSelectedLesson(lesson)}
                            className={`flex items-center w-full text-left p-2 rounded ${
                              selectedLesson && selectedLesson.id === lesson.id 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                              completedLessons.includes(lesson.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200'
                            }`}>
                              {completedLessons.includes(lesson.id) ? '✓' : index + 1}
                            </div>
                            <span>{lesson.title}</span>
                            {lesson.type === 'video' && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">動画</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* レッスンコンテンツ */}
                  <div className="flex-1 pl-6">
                    {selectedLesson ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold">{selectedLesson.title}</h3>
                          <button
                            onClick={() => markLessonComplete(selectedLesson.id)}
                            className={`px-4 py-2 rounded ${
                              completedLessons.includes(selectedLesson.id)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            disabled={completedLessons.includes(selectedLesson.id)}
                          >
                            {completedLessons.includes(selectedLesson.id) ? '完了済み' : 'レッスン完了'}
                          </button>
                        </div>
                        
                        {selectedLesson.type === 'video' ? (
                          <div className="mb-6">
                            <div className="aspect-w-16 aspect-h-9 mb-4">
                              <iframe
                                src={selectedLesson.videoUrl}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-96"
                              ></iframe>
                            </div>
                            <div className="prose max-w-none">
                              {selectedLesson.content.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="prose max-w-none">
                            {selectedLesson.content.split('\n').map((paragraph, i) => {
                              // コードブロックの処理
                              if (paragraph.includes('```')) {
                                const parts = paragraph.split('```');
                                return (
                                  <div key={i}>
                                    {parts[0] && <p>{parts[0]}</p>}
                                    {parts[1] && (
                                      <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
                                        {parts[1].replace('javascript\n', '')}
                                      </pre>
                                    )}
                                    {parts[2] && <p>{parts[2]}</p>}
                                  </div>
                                );
                              }
                              
                              // 見出しの処理
                              if (paragraph.startsWith('# ')) {
                                return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{paragraph.substring(2)}</h1>;
                              } else if (paragraph.startsWith('## ')) {
                                return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{paragraph.substring(3)}</h2>;
                              } else if (paragraph.startsWith('### ')) {
                                return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(4)}</h3>;
                              }
                              
                              // リストの処理
                              if (paragraph.includes('1. ')) {
                                return (
                                  <ol key={i} className="list-decimal pl-6 mt-2 mb-4">
                                    {paragraph.split('\n')
                                      .filter(line => line.match(/\d\. /))
                                      .map((line, idx) => (
                                        <li key={idx} className="mb-1">{line.replace(/\d\. /, '')}</li>
                                      ))
                                    }
                                  </ol>
                                );
                              }
                              
                              // 通常の段落
                              return paragraph ? <p key={i} className="my-2">{paragraph}</p> : <br key={i} />;
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <p className="text-gray-500">左側のメニューからレッスンを選択してください</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}