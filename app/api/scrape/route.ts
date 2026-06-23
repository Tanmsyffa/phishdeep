import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60; // Max duration for Vercel

export async function POST(req: Request) {
  let browser = null;
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const isLocal = process.env.NODE_ENV === 'development';
    
    // Sesuaikan path ini dengan instalasi Chrome lokal Anda jika di Laragon/Windows
    const localExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

    console.log(`Starting headless browser for ${url}... Local Mode: ${isLocal}`);

    const chromiumArgs = await chromium.args;

    browser = await puppeteer.launch({
      args: (isLocal ? puppeteer.defaultArgs() : chromiumArgs) as string[],
      defaultViewport: { width: 1280, height: 800 },
      executablePath: isLocal ? localExecutablePath : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    // Bypass SSL errors at page level
    await page.setBypassCSP(true);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
    
    // Set timeout to 12s to avoid Vercel 15s hard limit
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });

    // Beri waktu sedikit untuk script Anti-Bot/Cloudflare merender
    await new Promise(r => setTimeout(r, 2000));

    const html = await page.content();
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 60, encoding: 'base64' });

    return NextResponse.json({
      html,
      screenshot: `data:image/jpeg;base64,${screenshot}`,
      status: 'success'
    });
  } catch (err: any) {
    console.error('Puppeteer Scrape Error:', err);
    return NextResponse.json({ error: err.message, status: 'error' }, { status: 500 });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
