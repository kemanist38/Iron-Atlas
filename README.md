# Iron Atlas

Iron Atlas — web-based world map strategy game (MVP).

Bu repo, React + TypeScript frontend ve Node + TypeScript backend ile bir başlangıç iskeleti içerir.

Çalıştırma (yerel):

1) Docker Compose ile:

   docker-compose up --build

Frontend: http://localhost:3000
Backend API: http://localhost:4000/api/health

2) Manuel (özel klasörlerde):

   cd backend
   npm install
   npm run dev

   cd ../frontend
   npm install
   npm run dev

İleri adımlar:
- Authentication
- Oyun modeli ve DB entegrasyonu (Postgres)
- Gerçek dünya harita verileri (OpenStreetMap)
- Turn processing worker

