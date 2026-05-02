# Plan de Arhitectură Inițială: Task Manager cu AI

Acest document descrie arhitectura, tehnologiile și pașii inițiali pentru dezvoltarea aplicației de management al task-urilor.

## 1. Rezumatul Proiectului

Vom construi o **aplicație web** care permite utilizatorilor să-și gestioneze task-urile personale și de la muncă. Aplicația va oferi un sistem de **autentificare** pentru a asigura confidențialitatea datelor. O funcționalitate cheie va fi integrarea cu **API-ul Gemini (Google AI)** pentru a categoriza și prioritiza automat task-urile adăugate de utilizator.

## 2. Cerințe Esențiale Confirmate

- **Interfață:** Aplicație Web.
- **Acces:** Privat, cu sistem de conturi pentru utilizatori.
- **Model AI:** Gemini API de la Google.
- **Hosting:** Trebuie să ruleze pe o platformă cu un nivel gratuit (free tier).

## 3. Tehnologii Propose

Pentru a îndeplini aceste cerințe, propun următorul stack tehnologic, bazat pe popularitate, ușurință în dezvoltare și costuri zero pentru a începe:

- **Frontend & Backend Framework:** [**Next.js**](https://nextjs.org/) (React)
  - **Motiv:** Un framework "full-stack" care permite crearea atât a interfeței (UI) cât și a logicii de backend (API routes) într-un singur proiect. Se integrează perfect cu Vercel pentru hosting.

- **Bază de Date și Autentificare:** [**Supabase**](https://supabase.com/)
  - **Motiv:** O alternativă open-source la Firebase care oferă o bază de date Postgres, sistem de autentificare, stocare de fișiere și API-uri auto-generate. Nivelul gratuit este foarte generos și suficient pentru proiectul nostru.

- **Hosting/Deployment:** [**Vercel**](https://vercel.com/)
  - **Motiv:** Platforma creată de echipa Next.js, oferă cel mai simplu și rapid mod de a publica aplicații Next.js. Nivelul "Hobby" (gratuit) este perfect pentru proiecte personale.

- **Integrare AI:** [**Google AI Gemini SDK**](https://ai.google.dev/sdks)
  - **Motiv:** SDK-ul oficial pentru a interacționa cu API-ul Gemini dintr-un mediu Node.js (backend-ul nostru Next.js).

## 4. Arhitectura de Nivel Înalt

Fluxul de date va arăta astfel:

1.  **Utilizatorul** interacționează cu **Aplicația Web Next.js** hostată pe Vercel.
2.  Pentru login/înregistrare, clientul Next.js comunică direct cu **Supabase Auth**.
3.  Pentru a citi sau scrie task-uri, clientul Next.js trimite cereri către **API Routes** (backend-ul Next.js).
4.  **API Routes** folosesc SDK-ul Supabase pentru a executa operații (CRUD) pe baza de date **Postgres (Supabase)**. Fiecare task va fi legat de ID-ul utilizatorului.
5.  La crearea unui task, un API Route special va trimite conținutul task-ului către **API-ul Gemini**.
6.  **Gemini** returnează o categorie și o prioritate sugerată.
7.  API Route-ul salvează task-ul în baza de date cu informațiile primite de la Gemini.

## 5. Pași de Implementare Inițiali

1.  **Setup Proiect:** Inițializarea unui nou proiect Next.js (`npx create-next-app`).
2.  **Setup Supabase:** Crearea unui proiect nou pe platforma Supabase pentru a obține cheile API și URL-ul bazei de date.
3.  **Definire Model Date:** Crearea tabelului `tasks` în Supabase cu coloane precum `id`, `user_id`, `content`, `category`, `priority`, `due_date`, `status`.
4.  **Implementare Autentificare:** Crearea paginilor de Login și Înregistrare folosind pachetul `@supabase/ssr`, care este soluția modernă recomandată pentru integrarea cu Next.js.
5.  **API pentru Task-uri (CRUD):** Crearea de API Routes în Next.js pentru a adăuga, vizualiza, modifica și șterge task-uri din baza de date.
6.  **UI de Bază:** Crearea unei interfețe simple pentru a afișa lista de task-uri și un formular pentru adăugarea de noi task-uri.
7.  **Integrare Gemini:**
    - Crearea unui API Route (ex: `/api/ai/process-task`).
    - Acest endpoint va primi textul unui task, va construi un prompt adecvat și va apela API-ul Gemini folosind modelul `gemini-2.5-flash` pentru a asigura viteză și costuri reduse.
    - Va parsa răspunsul și va actualiza task-ul în baza de date.
8.  **Deployment pe Vercel:** Publicarea primei versiuni pe Vercel pentru a valida că totul funcționează corect.
