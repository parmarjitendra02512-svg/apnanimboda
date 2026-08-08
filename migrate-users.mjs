import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import fetch from 'node-fetch';

const FIREBASE_SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "apna-nimboda-new",
  "private_key_id": "88981faa9cc5afdd4556b11fa83e2b8a112a7783",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDM0vwGYsyEq215\nWqWCTcned4oniD0j+CpqSMZD0o/Id6lwz3hOIazSpdBM1O/m1EZhEdMUfRzm9UKc\nm7xAAJK5piEFwnzMzulYyaqK2KVUXCoGx70STFZw1yP14sr7DUak6+kmB5eZMoPU\nsBqePfrymBbCrdBINjF1JxNW1Dp/RYqmFFQvL1ZfHWAQeMVeXwIO8LCLY9pR/xzd\nV7sA1oDiHpYb742eNftwaghRfoaU0jKkohJYvYRDERkcb+JAtqQ64QHOrSD7hHso\naDDBnX/90NYDbP2xkTTbPhb2rDjNVFORJpBAz2IjdcaEWmxBWDnaa241EUKDqFUd\nuifc9HnzAgMBAAECggEAC9kciQYIDJiaAY4TyuDTD5JcpILF/qGpWnKRPXUdqhv5\n6jOmIubhx2GeFgOvSOv4kj7kteey101SqBp+HjmqQyDwAhRJAdPqPZ+UxOlZTvLx\n32iIcFmIGojnZJ7U3QbckkevOerwgwUgCRqSv5qYPJY9os9JIBQ6citre/dU1u3F\nSbCntAmkv83MwavdnAPI27KL7D2ngXM9PRf4efzlkOK9Ost8Tdb8Q6ZMSf9xTsj8\nm0QJkb+WnxqviIAnZ9Vr/CBbXUzguPrdEUYDCQ/EEtMIukMZPk/qqANHGmrAFkyZ\nVEzRlBRnD2Qf6XoXnewMF+uDtJZk8qDrmkGXhxP1eQKBgQD6Q0rJf0X30NJyRZgc\n6GsLz3ObIUKH7qfIvD8lwOtit/4DoWpyZ5R38f2nE4RdJxSkLFP+aBmUPSpU+rIh\ncG8fCCD1cU+Rxb4gEWbM7CYe7PSyk9wQsh/8hEtalz24NguAwOrmcRjn73olU7pm\noP7EqPgGX6NsJ65JFTMAbLe3XQKBgQDRhQcrJ8BCTHulgV1dLLnC040Lxbon1o/N\nqGiiFTceC1BOk5eaNldcSNXdAGjR9s2aEVkp5rP7/w9xVFdRqaoxBVkaGJrw7uXj\na5z0Vu59dJePU3xuOCfAWLVYP7QFwOcz28U6Dw5BORpEXYf5vYtcNbtH9BSHWXyy\n4ks0FqlxjwKBgQCBep1P4NRfYZ/v1Ufc9PalNqCWSz/zuir+tT5qlwRxn8YBNNsw\n85wh7oaQkY1y8IxCYFjYkB1jz71+F/JfUJ99S6RZuFU1kzxJtRcdwLP8XhY/6jX6\nQV5BNGUUKpmZHAUZiTY/IZaEMSdd9pLDFFqbftxL1+FiTKlkUF6Bwr3OVQKBgQCw\n1+uZDVBFpXCn3W0Ee/++5fii+x2JCp0OJRtL00RWY45BBGpti3hpOEDq7LGMpxga\n9pGfwE4iYMKUEXAySVaRUcZHNIVy3vHC5s3vnoBl+8cA/qKEFXnX7AgEmKBGSu/a\n4aCyxIpvmtcE5T0kGkxKZD/TF71MEMgj5MU9DfOvGQKBgQD1+mKbVmElACAFPDMu\nsNMfGcnSz4bh0aiideW7ZN1T5dNbb+74Bh7UFrKEI1j/LLdy/3W0W2wrD4udkmjw\nW8bLJUJS5BF7soX4r/Tv+XvKzvV9Tsbr1QaqUVB55WwPmi2JUBkvoCkaYizGiuRf\n2zOvNcwTlB1/aRneT3Mv9AIPYw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@apna-nimboda-new.iam.gserviceaccount.com",
};

initializeApp({
  credential: cert(FIREBASE_SERVICE_ACCOUNT),
  databaseURL: "https://apna-nimboda-new-default-rtdb.firebaseio.com"
});

const db = getDatabase();

const SUPABASE_URL = "https://ojfhsbkiqxsetmjmgqac.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZmhzYmtpcXhzZXRtam1ncWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA1NTgzNiwiZXhwIjoyMTAxNjMxODM2fQ.No0PSfPHMQy_90gIDcNwpaZz57xmpDBAAq3QDK4n1bM";

async function migrate() {
  console.log("Fetching users from Supabase...");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch users:", await res.text());
    return;
  }

  const users = await res.json();
  console.log(`Found ${users.length} users in Supabase.`);

  let migrated = 0;
  for (const user of users) {
    if (!user.mobile) continue;
    
    console.log(`Migrating ${user.mobile}...`);
    
    // Check if they are already approved
    if (user.is_approved) {
      await db.ref(`approved_users/${user.mobile}`).set({
        ...user,
        uid: user.mobile
      });
    } else {
      await db.ref(`pending_requests/${user.mobile}`).set({
        ...user,
        uid: user.mobile
      });
    }
    migrated++;
  }

  console.log(`Successfully migrated ${migrated} users to Firebase.`);
  process.exit(0);
}

migrate().catch(console.error);
