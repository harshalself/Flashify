import { FlashcardSet, Flashcard, TestSeries, TestQuestion } from "../types";

// Helper function to generate a random date within the last month
const getRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Flashcard Sets
export const flashcardSets: FlashcardSet[] = [
  {
    id: "1",
    title: "Basic Biology Concepts",
    description: "Key terms and concepts from introductory biology",
    cardCount: 15,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    color: "#00B2D6", // Primary cyan
  },
  {
    id: "2",
    title: "World History: Ancient Civilizations",
    description: "Important events and figures from ancient civilizations",
    cardCount: 20,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    color: "#008EAC", // Dark cyan
  },
  {
    id: "3",
    title: "Introduction to Physics",
    description: "Basic physics laws and principles",
    cardCount: 12,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    color: "#6CDDFF", // Light cyan
  },
  {
    id: "4",
    title: "Spanish Vocabulary",
    description: "Common Spanish words and phrases",
    cardCount: 25,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    color: "#00D6D6", // Accent cyan
  },
];

// Flashcards
export const flashcards: Record<string, Flashcard[]> = {
  "1": [
    {
      id: "101",
      question:
        "What is the process by which plants convert light energy to chemical energy?",
      answer: "Photosynthesis",
      setId: "1",
    },
    {
      id: "102",
      question: "What is the powerhouse of the cell?",
      answer: "Mitochondria",
      setId: "1",
    },
    {
      id: "103",
      question: "What is the basic unit of life?",
      answer: "Cell",
      setId: "1",
    },
    {
      id: "104",
      question: "What is the process of cell division called?",
      answer: "Mitosis (for somatic cells) and Meiosis (for gametes)",
      setId: "1",
    },
    {
      id: "105",
      question: "What molecule carries genetic information in cells?",
      answer: "DNA (Deoxyribonucleic Acid)",
      setId: "1",
    },
  ],
  "2": [
    {
      id: "201",
      question: "Which civilization built the Great Pyramids of Giza?",
      answer: "Ancient Egyptians",
      setId: "2",
    },
    {
      id: "202",
      question: "Who was the first Emperor of unified China?",
      answer: "Qin Shi Huang",
      setId: "2",
    },
    {
      id: "203",
      question:
        "Which city-state is known for its military prowess in ancient Greece?",
      answer: "Sparta",
      setId: "2",
    },
    {
      id: "204",
      question:
        "Which ancient civilization developed a system of writing called cuneiform?",
      answer: "Sumerians",
      setId: "2",
    },
    {
      id: "205",
      question: "What was the main language of the Roman Empire?",
      answer: "Latin",
      setId: "2",
    },
  ],
  "3": [
    {
      id: "301",
      question: "What is Newton's First Law of Motion?",
      answer:
        "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.",
      setId: "3",
    },
    {
      id: "302",
      question: "What is the formula for force?",
      answer: "F = ma (Force = mass × acceleration)",
      setId: "3",
    },
    {
      id: "303",
      question:
        "What is the unit of energy in the International System of Units (SI)?",
      answer: "Joule (J)",
      setId: "3",
    },
    {
      id: "304",
      question: "What is the speed of light in a vacuum?",
      answer:
        "Approximately 299,792,458 meters per second (usually rounded to 3.00 × 10^8 m/s)",
      setId: "3",
    },
    {
      id: "305",
      question: "What is the law of conservation of energy?",
      answer:
        "Energy cannot be created or destroyed, only transformed from one form to another.",
      setId: "3",
    },
  ],
  "4": [
    {
      id: "401",
      question: 'How do you say "hello" in Spanish?',
      answer: "Hola",
      setId: "4",
    },
    {
      id: "402",
      question: 'How do you say "thank you" in Spanish?',
      answer: "Gracias",
      setId: "4",
    },
    {
      id: "403",
      question: 'How do you say "goodbye" in Spanish?',
      answer: "Adiós",
      setId: "4",
    },
    {
      id: "404",
      question: 'How do you say "please" in Spanish?',
      answer: "Por favor",
      setId: "4",
    },
    {
      id: "405",
      question: 'How do you say "How are you?" in Spanish?',
      answer: "¿Cómo estás?",
      setId: "4",
    },
  ],
};

// Test Series
export const testSeries: TestSeries[] = [
  {
    id: "1",
    title: "Biology Quiz",
    description: "Test your knowledge of basic biology concepts",
    questionCount: 10,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    flashcardSetId: "1",
  },
  {
    id: "2",
    title: "Ancient History Test",
    description: "Test your knowledge of ancient civilizations",
    questionCount: 10,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    flashcardSetId: "2",
  },
  {
    id: "3",
    title: "Physics Fundamentals",
    description: "Test your knowledge of basic physics",
    questionCount: 10,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    flashcardSetId: "3",
  },
  {
    id: "4",
    title: "Spanish Basics Quiz",
    description: "Test your knowledge of basic Spanish vocabulary",
    questionCount: 10,
    createdAt: getRandomDate(),
    lastModified: getRandomDate(),
    flashcardSetId: "4",
  },
];

// Test Questions
export const testQuestions: Record<string, TestQuestion[]> = {
  "1": [
    {
      id: "1001",
      question:
        "Which organelle is responsible for photosynthesis in plant cells?",
      options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
      correctAnswer: 1,
      setId: "1",
    },
    {
      id: "1002",
      question:
        "Which of the following is NOT a function of the cell membrane?",
      options: [
        "Transport of materials",
        "Cell protection",
        "Photosynthesis",
        "Cell recognition",
      ],
      correctAnswer: 2,
      setId: "1",
    },
    {
      id: "1003",
      question:
        "Which of the following is the site of protein synthesis in the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
      correctAnswer: 2,
      setId: "1",
    },
    {
      id: "1004",
      question: "What is the main function of DNA in a cell?",
      options: [
        "Energy production",
        "Protein digestion",
        "Genetic information storage",
        "Cell movement",
      ],
      correctAnswer: 2,
      setId: "1",
    },
    {
      id: "1005",
      question:
        "Which of the following processes produces genetically identical cells?",
      options: ["Meiosis", "Mitosis", "Fertilization", "Mutation"],
      correctAnswer: 1,
      setId: "1",
    },
    {
      id: "1006",
      question: "What is the primary role of red blood cells?",
      options: [
        "Fighting infections",
        "Blood clotting",
        "Oxygen transport",
        "Antibody production",
      ],
      correctAnswer: 2,
      setId: "1",
    },
    {
      id: "1007",
      question:
        "Which of the following is a correct sequence in the levels of biological organization?",
      options: [
        "Cell → Tissue → Organ → Organism",
        "Tissue → Cell → Organ → Organism",
        "Cell → Organ → Tissue → Organism",
        "Organism → Organ → Tissue → Cell",
      ],
      correctAnswer: 0,
      setId: "1",
    },
    {
      id: "1008",
      question: "Which of the following is NOT a component of the cell theory?",
      options: [
        "All living things are composed of cells",
        "Cells are the basic unit of structure and function in living things",
        "All cells come from pre-existing cells",
        "All cells contain chloroplasts",
      ],
      correctAnswer: 3,
      setId: "1",
    },
    {
      id: "1009",
      question:
        "The process of breaking down glucose to release energy is called:",
      options: [
        "Photosynthesis",
        "Cellular respiration",
        "Fermentation",
        "Digestion",
      ],
      correctAnswer: 1,
      setId: "1",
    },
    {
      id: "1010",
      question:
        "Which of the following is responsible for water balance in a cell?",
      options: [
        "Cell wall",
        "Plasma membrane",
        "Nucleus",
        "Endoplasmic reticulum",
      ],
      correctAnswer: 1,
      setId: "1",
    },
  ],
  "2": [
    {
      id: "2001",
      question: "Which ancient civilization developed along the Nile River?",
      options: ["Mesopotamia", "Indus Valley", "Egypt", "China"],
      correctAnswer: 2,
      setId: "2",
    },
    {
      id: "2002",
      question: "The Great Wall of China was primarily built to:",
      options: [
        "Demonstrate engineering prowess",
        "Create jobs for citizens",
        "Protect against northern invasions",
        "Establish trade routes",
      ],
      correctAnswer: 2,
      setId: "2",
    },
    {
      id: "2003",
      question:
        "Which ancient civilization is credited with creating the first written legal code?",
      options: ["Babylonian", "Egyptian", "Greek", "Roman"],
      correctAnswer: 0,
      setId: "2",
    },
    {
      id: "2004",
      question:
        "Which ancient civilization was located in modern-day Mexico and Central America?",
      options: ["Inca", "Maya", "Aztec", "Olmec"],
      correctAnswer: 1,
      setId: "2",
    },
    {
      id: "2005",
      question: "The Acropolis is an ancient citadel located in which city?",
      options: ["Rome", "Athens", "Alexandria", "Sparta"],
      correctAnswer: 1,
      setId: "2",
    },
    {
      id: "2006",
      question: "Which empire was founded by Cyrus the Great?",
      options: [
        "Roman Empire",
        "Persian Empire",
        "Macedonian Empire",
        "Byzantine Empire",
      ],
      correctAnswer: 1,
      setId: "2",
    },
    {
      id: "2007",
      question:
        "Which ancient wonder was a large lighthouse located in Alexandria?",
      options: [
        "Colossus of Rhodes",
        "Pharos",
        "Hanging Gardens of Babylon",
        "Temple of Artemis",
      ],
      correctAnswer: 1,
      setId: "2",
    },
    {
      id: "2008",
      question:
        "Which ancient civilization developed a base-60 numerical system still used for measuring time?",
      options: ["Egyptians", "Greeks", "Romans", "Sumerians"],
      correctAnswer: 3,
      setId: "2",
    },
    {
      id: "2009",
      question: "Who was the first Roman Emperor?",
      options: ["Julius Caesar", "Augustus", "Nero", "Constantine"],
      correctAnswer: 1,
      setId: "2",
    },
    {
      id: "2010",
      question:
        "The ancient Indus Valley Civilization was located in what is now:",
      options: [
        "Egypt and Sudan",
        "Greece and Turkey",
        "India and Pakistan",
        "Iran and Iraq",
      ],
      correctAnswer: 2,
      setId: "2",
    },
  ],
  "3": [
    {
      id: "3001",
      question:
        "According to Newton's Second Law of Motion, force is equal to:",
      options: [
        "mass × velocity",
        "mass × acceleration",
        "mass / acceleration",
        "mass + velocity",
      ],
      correctAnswer: 1,
      setId: "3",
    },
    {
      id: "3002",
      question: "Which of the following is the SI unit of electric current?",
      options: ["Volt", "Watt", "Ampere", "Ohm"],
      correctAnswer: 2,
      setId: "3",
    },
    {
      id: "3003",
      question: "What is the formula for kinetic energy?",
      options: [
        "KE = mgh",
        "KE = 1/2 × m × v²",
        "KE = m × v",
        "KE = m × g × v",
      ],
      correctAnswer: 1,
      setId: "3",
    },
    {
      id: "3004",
      question: "Which of these is NOT a type of electromagnetic radiation?",
      options: ["X-rays", "Microwaves", "Radio waves", "Sound waves"],
      correctAnswer: 3,
      setId: "3",
    },
    {
      id: "3005",
      question: "According to Newton's Third Law of Motion:",
      options: [
        "Objects remain at rest unless acted upon by a force",
        "Force equals mass times acceleration",
        "For every action, there is an equal and opposite reaction",
        "Energy cannot be created or destroyed",
      ],
      correctAnswer: 2,
      setId: "3",
    },
    {
      id: "3006",
      question: "What is the formula for density?",
      options: [
        "Density = mass × volume",
        "Density = mass / volume",
        "Density = mass + volume",
        "Density = volume / mass",
      ],
      correctAnswer: 1,
      setId: "3",
    },
    {
      id: "3007",
      question:
        "Which law states that pressure and volume are inversely proportional at constant temperature?",
      options: [
        "Charles' Law",
        "Boyle's Law",
        "Gay-Lussac's Law",
        "Avogadro's Law",
      ],
      correctAnswer: 1,
      setId: "3",
    },
    {
      id: "3008",
      question: "What is the formula for work done?",
      options: [
        "Work = force × time",
        "Work = force × distance",
        "Work = force / distance",
        "Work = mass × acceleration × time",
      ],
      correctAnswer: 1,
      setId: "3",
    },
    {
      id: "3009",
      question: "Which of these is a vector quantity?",
      options: ["Mass", "Time", "Velocity", "Energy"],
      correctAnswer: 2,
      setId: "3",
    },
    {
      id: "3010",
      question:
        "Which of the following is the correct formula for acceleration?",
      options: ["a = v / t", "a = (v - u) / t", "a = (u - v) / t", "a = v × t"],
      correctAnswer: 1,
      setId: "3",
    },
  ],
  "4": [
    {
      id: "4001",
      question: 'How do you say "good morning" in Spanish?',
      options: ["Buenas noches", "Buenos días", "Buenas tardes", "Hola"],
      correctAnswer: 1,
      setId: "4",
    },
    {
      id: "4002",
      question: 'What is the Spanish word for "water"?',
      options: ["Pan", "Agua", "Vino", "Café"],
      correctAnswer: 1,
      setId: "4",
    },
    {
      id: "4003",
      question: 'Which of the following means "friend" in Spanish?',
      options: ["Amigo", "Hermano", "Primo", "Padre"],
      correctAnswer: 0,
      setId: "4",
    },
    {
      id: "4004",
      question: 'How do you say "yes" in Spanish?',
      options: ["No", "Si", "Sí", "Se"],
      correctAnswer: 2,
      setId: "4",
    },
    {
      id: "4005",
      question: 'What is the Spanish word for "book"?',
      options: ["Libro", "Papel", "Lápiz", "Cuaderno"],
      correctAnswer: 0,
      setId: "4",
    },
    {
      id: "4006",
      question: 'Which phrase means "How much does it cost?" in Spanish?',
      options: [
        "¿Qué hora es?",
        "¿Cómo estás?",
        "¿Cuánto cuesta?",
        "¿Dónde está?",
      ],
      correctAnswer: 2,
      setId: "4",
    },
    {
      id: "4007",
      question: 'What is the Spanish word for "dog"?',
      options: ["Gato", "Perro", "Pájaro", "Pez"],
      correctAnswer: 1,
      setId: "4",
    },
    {
      id: "4008",
      question: 'How do you say "excuse me" in Spanish?',
      options: ["Por favor", "Gracias", "Perdón", "De nada"],
      correctAnswer: 2,
      setId: "4",
    },
    {
      id: "4009",
      question: 'Which of the following means "I love you" in Spanish?',
      options: ["Te quiero", "Te amo", "Te extraño", "Both A and B"],
      correctAnswer: 3,
      setId: "4",
    },
    {
      id: "4010",
      question: 'What is the correct way to say "my name is..." in Spanish?',
      options: ["Me llamo...", "Mi nombre...", "Yo soy...", "Me nombre..."],
      correctAnswer: 0,
      setId: "4",
    },
  ],
};

// Default export
export const dummyData = {
  flashcardSets,
  flashcards,
  testSeries,
  testQuestions,
};

export default dummyData;
