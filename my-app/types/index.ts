
export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  setId: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  createdAt: string;
  lastModified: string;
  color: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  setId: string;
}

export interface TestSeries {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  createdAt: string;
  lastModified: string;
  flashcardSetId: string;
}
