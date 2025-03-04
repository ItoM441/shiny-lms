// services/authLogService.js
import { db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  query, 
  collection, 
  where, 
  getDocs 
} from 'firebase/firestore';

// ユーザーのログイン日を記録
export async function recordLoginDay(userId) {
  try {
    // 今日の日付をYYYY-MM-DD形式で取得
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // 日付だけを取り出す（DD）
    const dayOfMonth = today.getDate();
    
    // 年と月の情報
    const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    // ユーザーのログイン履歴ドキュメントの参照
    const loginHistoryRef = doc(db, 'login_history', userId);
    
    // ドキュメントが存在するか確認
    const docSnap = await getDoc(loginHistoryRef);
    
    if (docSnap.exists()) {
      // ドキュメントが存在する場合は更新
      const data = docSnap.data();
      
      // この月のログイン日配列がまだ存在しない場合は作成
      if (!data[yearMonth]) {
        await updateDoc(loginHistoryRef, {
          [yearMonth]: [dayOfMonth],
          lastLogin: dateStr
        });
      } else if (!data[yearMonth].includes(dayOfMonth)) {
        // この月の配列が存在するが、今日の日付がまだ含まれていない場合
        await updateDoc(loginHistoryRef, {
          [yearMonth]: arrayUnion(dayOfMonth),
          lastLogin: dateStr
        });
      } else {
        // 今日の日付がすでに記録されている場合は最終ログイン日のみ更新
        await updateDoc(loginHistoryRef, {
          lastLogin: dateStr
        });
      }
    } else {
      // ドキュメントが存在しない場合は新規作成
      await setDoc(loginHistoryRef, {
        [yearMonth]: [dayOfMonth],
        lastLogin: dateStr
      });
    }
    
    return true;
  } catch (error) {
    console.error('ログイン日の記録に失敗しました:', error);
    return false;
  }
}

// 特定の月のログイン日を取得
export async function getLoginDaysForMonth(userId, year, month) {
  try {
    // 年月の形式（YYYY-MM）
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    
    // ユーザーのログイン履歴ドキュメントを取得
    const loginHistoryRef = doc(db, 'login_history', userId);
    const docSnap = await getDoc(loginHistoryRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // 指定された月のログイン日配列を返す（存在しない場合は空配列）
      return data[yearMonth] || [];
    }
    
    return [];
  } catch (error) {
    console.error('ログイン日の取得に失敗しました:', error);
    return [];
  }
}