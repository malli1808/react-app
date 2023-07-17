import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"
function startFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyAtR8vBtoOs33H3_jyVpxzMl1646-1VVcw",
        authDomain: "manage-medicines.firebaseapp.com",
        databaseURL: "https://manage-medicines-default-rtdb.firebaseio.com",
        projectId: "manage-medicines",
        storageBucket: "manage-medicines.appspot.com",
        messagingSenderId: "976552736250",
        appId: "1:976552736250:web:a28493c5406c18a5d32043"
      };
    
    const app = initializeApp(firebaseConfig);

    return getDatabase(app)
}

export default startFirebase