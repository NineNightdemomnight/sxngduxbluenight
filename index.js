const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 4000;

// เส้นทางหลัก
app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳');
});

// เส้นทางเกี่ยวกับ
app.get('/about', (req, res) => {
    res.send('This is my about route..... ');
});

// API สำหรับ byFluxus
app.get('/api/byfluxus', async (req, res) => {
    const { startUrl } = req.query;

    if (!startUrl) {
        return res.status(400).json({ success: false, message: "Missing startUrl parameter" });
    }

    const headers = {
        "user-agent": "Mozilla/5.0 (Linux; Android 8.1.0; GO3C Build/OPM2.171019.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.141 Mobile Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        "referer": "https://linkvertise.com/",
        "sec-ch-ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
    };

    const fluxusUrls = {
        check: "https://flux.li/android/external/check1.php?hash={hash}",
        main: "https://flux.li/android/external/main.php?hash={hash}",
    };

    try {
        await axios.get(startUrl, { headers });

        const [checkResponse, mainResponse] = await Promise.all([
            axios.get(fluxusUrls.check, { headers }),
            axios.get(fluxusUrls.main, { headers }),
        ]);

        const $ = cheerio.load(mainResponse.data);
        const randomStuff = $('code[style="background:#29464A;color:#F0F0F0; font-size: 13px;font-family: \'Open Sans\';"]').text().trim();

        return res.status(200).json({ success: true, key: randomStuff });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// API สำหรับ byRelzScript
app.get('/api/byrelzscript', async (req, res) => {
    const { link } = req.query;

    if (!link) {
        return res.status(400).json({ success: false, error: 'Missing link parameter' });
    }

    try {
        const hwid = link.replace("https://getkey.relzscript.xyz/redirect.php?hwid=", "");
        const session = axios.create();

        const initialCookies = {
            'check1': '1',
            'dom3ic8zudi28v8lr6fgphwffqoz0j6c': '901d9e30-900a-4158-9e0c-b355b36a5f77%3A3%3A1',
            'pp_main_e7e5688c4d672d39846f0eb422e33a7d': '1',
            'hwid': hwid,
            'check2': '1',
            'pp_sub_e7e5688c4d672d39846f0eb422e33a7d': '4'
        };

        // Set cookies for axios session
        session.defaults.headers.Cookie = Object.entries(initialCookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

        await session.get('https://getkey.relzscript.xyz/check1.php');
        const headers = { 'Priority': 'u=0, i', 'Referer': 'https://loot-link.com/' };

        await session.get('https://getkey.relzscript.xyz/check2.php', { headers });
        await session.get('https://getkey.relzscript.xyz/check3.php', { headers });

        const finalResponse = await session.get('https://getkey.relzscript.xyz/generate.php', { headers });
        const $ = cheerio.load(finalResponse.data);
        const scripts = $('script');
        const pattern = /const keyValue = "(RelzHub_[\w]+)"/;

        let firstKey = null;
        scripts.each((i, script) => {
            const match = pattern.exec($(script).html());
            if (match) {
                firstKey = match[1];
                return false; // exit loop
            }
        });

        if (firstKey) {
            return res.json({ success: true, key: firstKey });
        } else {
            return res.status(404).json({ success: false, error: 'Key not found' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT}`);
});
