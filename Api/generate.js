import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { text, effect } = req.query;

  if (!text || !effect) {
    return res.json({
      status: true,
      result: {
        prefix: "/",
        company: "Technostone",
        TRX_Donate: "TMpSjyt7rQ2ipAWNsTsKt35CU6Ecgv3cd8"
      }
    });
  }

  const effectUrl = `https://textpro.me/${effect}.html`;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(effectUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Type text input (TextPro usually uses a single input box)
    await page.type('input[name="text[]"]', text);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Wait for image to appear
    await page.waitForSelector('.thumbnail img');

    const imageUrl = await page.$eval('.thumbnail img', img => img.src);

    await browser.close();

    return res.status(200).json({
      status: true,
      image_url: imageUrl
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Image generation failed."
    });
  }
}
