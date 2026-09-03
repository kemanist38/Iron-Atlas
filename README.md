README.md

Aşağıdaki adımlarla bölgeleri seedleyebilirsiniz:

1) Backend dizinine gidin ve bağımlılıkları kurun:

   cd backend
   npm install

2) .env dosyasını doldurun (DATABASE_URL, MAIL_* ve JWT_SECRET)

3) Prisma client'i oluşturun ve migrate çalıştırın:

   npx prisma generate
   npx prisma migrate dev --name add_regions_geojson

4) Sample verileri seedle:

   npm run seed

Seed script, ilk bulunabilen kullanıcıyı (owner) kullanarak "World Map Template" adında bir oyun oluşturur ve data/regions.sample.json içindeki örnek bölgeleri veritabanına yazar.

Not: Gerçek dünya tam GeoJSON verisini kullanmak isterseniz Natural Earth veya OSM verilerini indirip data/regions.full.geojson olarak ekleyin ve seed script'i buna göre güncelleyin.
