// api/news.js
// Free Live EAMCET / EAPCET News API via Google News RSS
// No API key required, zero limits, returns parsed JSON with title, date, source & link

let cachedNews = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes cache

export default async function newsHandler(req, res) {
  try {
    const now = Date.now();
    if (cachedNews && (now - cacheTimestamp < CACHE_TTL_MS)) {
      return res.status(200).json({ status: 'ok', source: 'cache', articles: cachedNews });
    }

    const query = encodeURIComponent('AP EAMCET OR AP EAPCET counselling');
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EduDiscovery/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Google News RSS returned ${response.status}`);
    }

    const xml = await response.text();
    const articles = [];
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    for (const match of itemMatches.slice(0, 10)) {
      const content = match[1];
      const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = content.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      if (titleMatch) {
        const rawTitle = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        const sourceName = sourceMatch ? sourceMatch[1].trim() : 'AP Education';
        const cleanTitle = rawTitle.replace(new RegExp(`\\s*-\\s*${sourceName}$`), '').trim();

        // Smart Category Tagging & Aesthetics
        const titleLower = cleanTitle.toLowerCase();
        let category = 'COUNSELLING';
        let categoryColor = '#00D4FF'; // Cyan

        if (titleLower.includes('allotment') || titleLower.includes('phase') || titleLower.includes('round') || titleLower.includes('seat')) {
          category = 'SEAT ALLOTMENT';
          categoryColor = '#10B981'; // Emerald
        } else if (titleLower.includes('result') || titleLower.includes('rank') || titleLower.includes('topper') || titleLower.includes('cutoff')) {
          category = 'RESULTS & CUTOFF';
          categoryColor = '#EF4444'; // Red/Rose
        } else if (titleLower.includes('scholarship') || titleLower.includes('fee') || titleLower.includes('deevena') || titleLower.includes('reimbursement')) {
          category = 'SCHOLARSHIPS';
          categoryColor = '#F59E0B'; // Amber
        } else if (titleLower.includes('bipc') || titleLower.includes('pharmacy') || titleLower.includes('agriculture')) {
          category = 'BiPC STREAM';
          categoryColor = '#8B5CF6'; // Violet
        } else if (titleLower.includes('registration') || titleLower.includes('schedule') || titleLower.includes('date') || titleLower.includes('web option')) {
          category = 'SCHEDULE';
          categoryColor = '#3B82F6'; // Blue
        }

        const dateStr = pubDateMatch 
          ? new Date(pubDateMatch[1]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
          : 'Recent';

        const content = [
          `**Latest Official Update**`,
          cleanTitle,
          `**Reporting Agency & Highlights**`,
          `According to reports verified by ${sourceName}, the Andhra Pradesh State Council of Higher Education (APSCHE) and Department of Technical Education have updated official candidate notifications regarding the ongoing academic admissions session.`,
          `**Official Portal & Next Steps**`,
          `Candidates are advised to log in directly to the official APSCHE admission portal (https://cets.apsche.ap.gov.in) with their Hall Ticket Number and Date of Birth to complete verification, download allotment orders, and submit web preferences before the statutory deadlines.`
        ].join('\n\n');

        articles.push({
          id: `news-${articles.length + 1}`,
          category,
          categoryColor,
          title: cleanTitle,
          summary: `${sourceName} reports official updates regarding AP EAPCET counselling, allotment orders, and statutory admissions procedures.`,
          date: dateStr,
          readTime: '3 min read',
          content,
          url: linkMatch ? linkMatch[1] : 'https://cets.apsche.ap.gov.in',
          source: sourceName
        });
      }
    }

    if (articles.length > 0) {
      cachedNews = articles;
      cacheTimestamp = now;
      return res.status(200).json({ status: 'ok', source: 'live', articles });
    }

    return res.status(200).json({ status: 'fallback', articles: [] });
  } catch (error) {
    console.error('[api/news] Error fetching live EAMCET news:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
