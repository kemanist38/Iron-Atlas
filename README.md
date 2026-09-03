Seed Full World ve PostGIS notları

- Bu branch full dünya seed ve PostGIS (postgis/postgis image) desteği ekler.
- Merge sonrası:
  - Actions -> Seed Full World workflow'u elle çalıştırabilirsiniz (Run workflow).
  - Veya yerelde docker-compose up ile postgis servisini çalıştırıp backend üzerinden seed komutunu çalıştırabilirsiniz.

Güvenlik:
- MAIL_* ve JWT_SECRET bilgilerini asla repo'ya commit etmeyin. GitHub -> Settings -> Secrets -> Actions içine ekleyin.
