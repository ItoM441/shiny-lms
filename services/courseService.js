// services/courseService.js
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion,
  addDoc
} from 'firebase/firestore';

// サンプルコースデータ
const sampleCourses = [
  {
    id: 'html-css',
    title: 'HTML/CSS入門',
    description: 'ウェブの基礎となるHTML/CSSを学びます。',
    lessons: 10
  },
  {
    id: 'javascript',
    title: 'JavaScript基礎',
    description: 'プログラミングの基礎とJavaScriptの文法を学びます。',
    lessons: 15
  },
  {
    id: 'react',
    title: 'React入門',
    description: 'モダンなUIライブラリであるReactの基礎を学びます。',
    lessons: 12
  }
];

// コース一覧を取得
export async function getCourses() {
  try {
    const coursesCollection = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesCollection);
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // コースが取得できなかった場合はサンプルデータを返す
    return courses.length > 0 ? courses : sampleCourses;
  } catch (error) {
    console.error('コース取得エラー:', error);
    return sampleCourses;
  }
}

// ユーザーのコースを取得
export async function getUserCourses(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().courses) {
      return userDoc.data().courses;
    }
    return [];
  } catch (error) {
    console.error('ユーザーコース取得エラー:', error);
    return [];
  }
}

// コースを選択する
export async function enrollCourse(userId, courseId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // ユーザードキュメントが存在する場合は更新
      await updateDoc(userDocRef, {
        courses: arrayUnion(courseId),
        // 進捗を初期化
        [`progress.${courseId}`]: 0
      });
    } else {
      // ユーザードキュメントが存在しない場合は新規作成
      await setDoc(userDocRef, {
        courses: [courseId],
        progress: {
          [courseId]: 0
        }
      });
    }
    
    console.log(`コース ${courseId} をユーザー ${userId} に登録しました`);
    return true;
  } catch (error) {
    console.error('コース登録エラー:', error);
    throw error; // エラーを再スロー
  }
}

// 進捗を更新する
export async function updateProgress(userId, courseId, progress) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      [`progress.${courseId}`]: progress
    });
    return true;
  } catch (error) {
    console.error('進捗更新エラー:', error);
    throw error;
  }
}

// 進捗を取得する
export async function getProgress(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().progress) {
      return userDoc.data().progress;
    }
    return {};
  } catch (error) {
    console.error('進捗取得エラー:', error);
    return {};
  }
}

// ID指定でコースを取得
export async function getCourseById(courseId) {
  try {
    // 実際のアプリではFirestoreから取得
    // この例ではサンプルデータから直接取得
    const course = sampleCourses.find(c => c.id === courseId);
    return course || null;
  } catch (error) {
    console.error('コース取得エラー:', error);
    return null;
  }
}

// services/courseService.js に追加するメソッド

// カリキュラムのTodo完了状態を更新
export async function updateCompletedLessons(userId, courseId, completedLessons) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      [`courseLessons.${courseId}`]: completedLessons
    });
    
    // 進捗率も同時に更新
    const course = await getCourseById(courseId);
    const totalLessons = course.lessons.length;
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    
    await updateDoc(userDocRef, {
      [`progress.${courseId}`]: progress
    });
    
    return progress;
  } catch (error) {
    console.error('レッスン完了状態の更新に失敗しました', error);
    throw error;
  }
}

// 完了したレッスンを取得
export async function getCompletedLessons(userId, courseId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().courseLessons && userDoc.data().courseLessons[courseId]) {
      return userDoc.data().courseLessons[courseId];
    }
    return [];
  } catch (error) {
    console.error('完了レッスン取得エラー:', error);
    return [];
  }
}