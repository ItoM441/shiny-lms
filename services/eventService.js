// services/eventService.js
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

// イベントを取得
export async function getEvents(date) {
  // 実際にはFirestoreからイベントを取得する
  // この例では仮のデータを返す
  return [
    {
      id: '1',
      title: 'Google Analytics data',
      icon: '📊',
      time: 'Module opens at 12:00 AM',
      description: '3 activities',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      title: 'Q&A session with mentors',
      icon: '👨‍🏫',
      time: '03:00 PM - 05:00 PM',
      joinLink: '#',
      date: new Date().toISOString().split('T')[0]
    }
  ];
}

// イベントを追加
export async function addEvent(event) {
  const eventsCollection = collection(db, 'events');
  return addDoc(eventsCollection, {
    ...event,
    createdAt: new Date()
  });
}