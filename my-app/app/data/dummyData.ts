import { FlashcardSet, Flashcard } from "../../types";

export const flashcardSets: FlashcardSet[] = [
  {
    id: "1",
    title: "JavaScript Basics",
    description: "Basic JavaScript concepts and syntax",
    cardCount: 5,
    createdAt: "2024-04-14T10:00:00Z",
    lastModified: "2024-04-14T10:00:00Z",
    color: "#06b6d4",
  },
  {
    id: "2",
    title: "React Native",
    description: "React Native components and hooks",
    cardCount: 3,
    createdAt: "2024-04-14T11:00:00Z",
    lastModified: "2024-04-14T11:00:00Z",
    color: "#3b82f6",
  },
  {
    id: "3",
    title: "TypeScript",
    description: "TypeScript types and interfaces",
    cardCount: 4,
    createdAt: "2024-04-14T12:00:00Z",
    lastModified: "2024-04-14T12:00:00Z",
    color: "#8b5cf6",
  },
];

export const flashcards: Record<string, Flashcard[]> = {
  "1": [
    {
      id: "1-1",
      question: "What is JavaScript?",
      answer:
        "JavaScript is a programming language used to make web pages interactive.",
      setId: "1",
    },
    {
      id: "1-2",
      question: "What is a variable?",
      answer: "A variable is a container for storing data values.",
      setId: "1",
    },
    {
      id: "1-3",
      question: "What is a function?",
      answer:
        "A function is a block of code designed to perform a particular task.",
      setId: "1",
    },
    {
      id: "1-4",
      question: "What is an array?",
      answer:
        "An array is a special variable that can hold more than one value at a time.",
      setId: "1",
    },
    {
      id: "1-5",
      question: "What is an object?",
      answer:
        "An object is a collection of properties, where a property is an association between a name and a value.",
      setId: "1",
    },
  ],
  "2": [
    {
      id: "2-1",
      question: "What is React Native?",
      answer:
        "React Native is a framework for building native mobile applications using React.",
      setId: "2",
    },
    {
      id: "2-2",
      question: "What is a component?",
      answer:
        "A component is a self-contained piece of code that renders some UI.",
      setId: "2",
    },
    {
      id: "2-3",
      question: "What is a hook?",
      answer:
        "A hook is a special function that lets you use state and other React features in functional components.",
      setId: "2",
    },
  ],
  "3": [
    {
      id: "3-1",
      question: "What is TypeScript?",
      answer:
        "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
      setId: "3",
    },
    {
      id: "3-2",
      question: "What is an interface?",
      answer: "An interface is a way to define a contract in your code.",
      setId: "3",
    },
    {
      id: "3-3",
      question: "What is a type?",
      answer: "A type is a way to define the shape of an object.",
      setId: "3",
    },
    {
      id: "3-4",
      question: "What is a generic?",
      answer:
        "A generic is a way to create reusable components that work with a variety of types.",
      setId: "3",
    },
  ],
};
