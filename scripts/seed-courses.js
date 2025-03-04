// scripts/seed-courses.js
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const courses = [
  {
    title: 'HTML/CSS入門',
    description: 'ウェブの基礎となるHTML/CSSを学びます。',
    lessons: 10
  },
  {
    title: 'JavaScript基礎',
    description: 'プログラミングの基礎とJavaScriptの文法を学びます。',
    lessons: 15
  },
  {
    title: 'React入門',
    description: 'モダンなUIライブラリであるReactの基礎を学びます。',
    lessons: 12
  }
];

async function seedCourses() {
  try {
    const coursesCollection = collection(db, 'courses');
    
    for (const course of courses) {
      await addDoc(coursesCollection, course);
      console.log(`Added course: ${course.title}`);
    }
    
    console.log('All courses added successfully');
  } catch (error) {
    console.error('Error adding courses:', error);
  }
}

seedCourses();