const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeDuyurular() {
    try {
        const response = await axios.get('https://vatandas.jandarma.gov.tr/PTM/giris', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        const duyurular = [];

        $('table#gvBasvurular tr').each((index, element) => {
            // Header satırını atla
            if (index === 0) return;

            const duyuru = {
                baslik: $(element).find('span[id^="gvBasvurular_lblBasvuruAdi"]').text().trim(),
                baslangicTarihi: $(element).find('span[id^="gvBasvurular_lblBaslangicTarih"]').text().trim(),
                bitisTarihi: $(element).find('td:nth-child(3)').text().trim(),
                guncellemeTarihi: new Date().toISOString()
            };

            if (duyuru.baslik) {
                duyurular.push(duyuru);
            }
        });

        fs.writeFileSync(
            path.join(process.cwd(), 'veri.json'), 
            JSON.stringify(duyurular, null, 2), 
            'utf-8'
        );
        
        console.log('Veriler başarıyla veri.json dosyasına kaydedildi.');
        console.log(`Toplam ${duyurular.length} duyuru bulundu.`);
        console.log('Son güncelleme:', new Date().toISOString());

    } catch (error) {
        console.error('Hata oluştu:', error.message);
        process.exit(1);  // Hata durumunda işlemi başarısız olarak işaretle
    }
}

scrapeDuyurular();
