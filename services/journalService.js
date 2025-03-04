// services/journalService.js
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// 日記を保存
export async function saveJournalEntry(userId, entry) {
  const journalCollection = collection(db, 'journals');
  
  return addDoc(journalCollection, {
    userId,
    content: entry.content,
    health: entry.health,
    createdAt: Timestamp.now(),
    date: entry.date || new Date().toISOString().split('T')[0],
    reaction: entry.reaction || null
  });
}

// 日記を取得
export async function getJournalEntries(userId, startDate, endDate) {
  const journalCollection = collection(db, 'journals');
  
  // 基本のクエリ（インデックス不要）
  let q = query(
    journalCollection, 
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  
  // クライアント側でフィルタリングとソートを行う
  let results = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // 日付でフィルタリング
  if (startDate && endDate) {
    results = results.filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
  }
  
  // 日付で降順ソート
  results.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });
  
  return results;
}

// 最新のフィードバックを取得
export async function getLatestFeedback(limit = 1) {
  // 実際にはFirestoreから最新のフィードバックを取得する
  // この例では仮のデータを返す
  return [
    {
      id: '1',
      name: 'Andrii Zarytov',
      avatar: 'https://via.placeholder.com/40',
      content: 'I have a few comments about the content part - it might be improved with real cases - just add more content about planning',
      courseName: 'What\'s new with Google Analytics',
      reaction: '😊',
      createdAt: new Date().toISOString(),
      timeAgo: 'a minute ago'
    }
  ];
}

// レビュー待ちのアイテムを取得
export async function getWaitingReviews(limit = 2) {
  // 実際にはFirestoreからレビュー待ちのアイテムを取得する
  // この例では仮のデータを返す
  return [
    {
      id: '1',
      name: 'Roman Shauk',
      avatar: 'https://via.placeholder.com/40',
      status: 'In review',
      courseName: 'What\'s new with Google Analytics',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: 'a month ago'
    },
    {
      id: '2',
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/40',
      status: 'In review',
      courseName: 'What\'s new with Google Analytics',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      timeAgo: '5 days ago'
    }
  ];
}