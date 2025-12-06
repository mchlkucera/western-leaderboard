// Seed script to add outlaws from screenshots to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "western-12903",
  appId: "1:913398318400:web:5d3c52e933e644956f66a5",
  storageBucket: "western-12903.firebasestorage.app",
  apiKey: "AIzaSyB-C5NRqC5d_hqup4xyCwzj-8q4ufFPq40",
  authDomain: "western-12903.firebaseapp.com",
  messagingSenderId: "913398318400",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = 'western-leaderboard';

// Outlaws from the screenshots
const OUTLAWS = [
  "Anna Lázníčková",
  "Anna Štefková",
  "Barča Ohnoutková",
  "Bára Morysová",
  "Bára Sadilová",
  "Damian Hanáček",
  "Daniel Karch",
  "Eliška Žatečková",
  "Ema Vojkovská",
  "Honza Bílek",
  "Jakub Pitucha",
  "Jan Selig",
  "Jan Slaběňák",
  "Jan Wojnar",
  "Jirka Lednický",
  "Kateřina Slaběňáková",
  "Katka Michálková",
  "Klára Kutáčová",
  "Kryštof Ulmann",
  "Lukáš Hulenka",
  "Magdaléna Lenartová",
  "Majda Jandová",
  "Mark Sidorenko",
  "Markét Kuchařová",
  "Martin Adámek",
  "Martin Štefek",
  "Matěj Kudela",
  "Michal Kučera",
  "Míša Kaňáková",
  "Ondřej Dlouhý",
  "Patrik Kula",
  "Petr Levý",
  "Radim Horák",
  "Samuel Zuštík",
  "Sisi Levayová",
  "Tereza Vysoudilová"
];

async function seedOutlaws() {
  console.log(`🤠 Seeding ${OUTLAWS.length} outlaws to Firestore...`);
  
  try {
    const batch = writeBatch(db);
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');

    OUTLAWS.forEach(name => {
      const docRef = doc(colRef);
      const imageUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
      
      batch.set(docRef, {
        name: name,
        bounty: Math.floor(Math.random() * 200) + 5, // Random bounty between 5-205
        image: imageUrl,
        createdAt: serverTimestamp(),
        status: "Wanted"
      });
      
      console.log(`  📜 Adding: ${name}`);
    });

    await batch.commit();
    console.log(`\n✅ Successfully added ${OUTLAWS.length} outlaws to the database!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedOutlaws();



