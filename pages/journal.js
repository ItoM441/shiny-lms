// pages/journal.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { saveJournalEntry, getJournalEntries } from '../services/journalService';

export default function Journal() {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [health, setHealth] = useState('良好');
  const [reaction, setReaction] = useState('😊');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      if (currentUser) {
        try {
          const journalEntries = await getJournalEntries(
            currentUser.uid,
            startDate,
            endDate
          );
          setEntries(journalEntries);
        } catch (error) {
          console.error('日記の取得に失敗しました', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEntries();
  }, [currentUser, startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      await saveJournalEntry(currentUser.uid, {
        content,
        health,
        reaction,
        date: new Date().toISOString().split('T')[0]
      });
      
      setContent('');
      
      // 日記を再取得
      const journalEntries = await getJournalEntries(
        currentUser.uid,
        startDate,
        endDate
      );
      setEntries(journalEntries);
    } catch (error) {
      console.error('日記の保存に失敗しました', error);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    // フィルターは useEffect 内で処理される
  };
  
  const reactions = ['😊', '😞', '😀', '😃', '😍'];


  return (
    <ProtectedRoute>
      <Layout>
        <h1 className="text-2xl font-bold mb-6">学習日記</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">新しいエントリー</h2>
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  今日の学習内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  体調
                </label>
                <select
                  value={health}
                  onChange={(e) => setHealth(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none"
                >
                  <option value="良好">良好</option>
                  <option value="普通">普通</option>
                  <option value="不調">不調</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  リアクション
                </label>
                <div className="flex space-x-4">
                  {reactions.map(emoji => (
                    <div 
                      key={emoji} 
                      onClick={() => setReaction(emoji)}
                      className={`cursor-pointer text-2xl p-2 ${reaction === emoji ? 'bg-blue-100 rounded-full' : ''}`}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存する
              </button>
            </form>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">過去のエントリー</h2>
              
              <form onSubmit={handleFilter} className="flex items-center space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                />
                <span>〜</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-gray-200 rounded text-sm"
                >
                  検索
                </button>
              </form>
            </div>
            
            {loading ? (
              <p>読み込み中...</p>
            ) : entries.length === 0 ? (
              <p>エントリーがありません。</p>
            ) : (
              <div className="space-y-4">
                {entries.map(entry => (
                  <div key={entry.id} className={`bg-white p-4 rounded shadow ${entry.isSystem ? 'border-l-4 border-blue-400' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center">
                        {!entry.isSystem && (
                          <>
                            <span className={`text-xs px-2 py-1 rounded ${
                              entry.health === '良好' ? 'bg-green-100 text-green-800' :
                              entry.health === '普通' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {entry.health}
                            </span>
                            {entry.reaction && (
                              <span className="text-xl ml-2">{entry.reaction}</span>
                            )}
                          </>
                        )}
                        {entry.isSystem && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            システム記録
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`${entry.isSystem ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                      {entry.content}
                    </p>
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