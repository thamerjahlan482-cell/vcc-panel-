const express = require('express');
const router = express.Router();
const { getAllSettings, dbAll, dbGet, dbRun } = require('../database');

// Track page view
async function trackView(req, page) {
  try { await dbRun('INSERT INTO page_views(page,ip) VALUES(?,?)', [page, req.ip]); } catch(e){}
}

// Get active announcement
async function getAnnouncement() {
  try {
    return await dbGet('SELECT * FROM announcements WHERE active=1 AND (expires_at IS NULL OR expires_at > datetime("now")) ORDER BY created_at DESC LIMIT 1');
  } catch(e) { return null; }
}

// Get custom nav links
async function getNavLinks() {
  try { return await dbAll('SELECT * FROM nav_links WHERE active=1 AND location="nav" ORDER BY sort_order ASC'); } catch(e) { return []; }
}

router.get('/', async (req, res) => {
  try {
    await trackView(req, '/');
    const settings = await getAllSettings();
    const streamers = await dbAll('SELECT * FROM streamers WHERE active=1 ORDER BY sort_order ASC');
    const team = settings.show_team==='1' ? await dbAll('SELECT * FROM team WHERE active=1 ORDER BY sort_order ASC') : [];
    const events = settings.show_events==='1' ? await dbAll('SELECT * FROM events WHERE active=1 ORDER BY event_date ASC LIMIT 6') : [];
    const announcement = await getAnnouncement();
    const navLinks = await getNavLinks();
    const customPages = await dbAll('SELECT * FROM pages WHERE active=1 AND show_in_nav=1 ORDER BY sort_order ASC');
    res.render('index', { settings, streamers, team, events, announcement, navLinks, customPages, discord: req.session.discord||null });
  } catch (e) { res.status(500).send(e.message); }
});

router.get('/streamers', async (req, res) => {
  try {
    await trackView(req, '/streamers');
    const settings = await getAllSettings();
    const streamers = await dbAll('SELECT * FROM streamers WHERE active=1 ORDER BY sort_order ASC');
    const announcement = await getAnnouncement();
    const navLinks = await getNavLinks();
    const customPages = await dbAll('SELECT * FROM pages WHERE active=1 AND show_in_nav=1 ORDER BY sort_order ASC');
    res.render('streamers', { settings, streamers, announcement, navLinks, customPages });
  } catch (e) { res.status(500).send(e.message); }
});

router.get('/rules', async (req, res) => {
  try {
    await trackView(req, '/rules');
    const settings = await getAllSettings();
    const rules = await dbAll('SELECT * FROM rules WHERE active=1 ORDER BY sort_order ASC');
    const announcement = await getAnnouncement();
    const navLinks = await getNavLinks();
    const customPages = await dbAll('SELECT * FROM pages WHERE active=1 AND show_in_nav=1 ORDER BY sort_order ASC');
    res.render('rules', { settings, rules, announcement, navLinks, customPages });
  } catch (e) { res.status(500).send(e.message); }
});

// Custom pages
router.get('/page/:slug', async (req, res) => {
  try {
    await trackView(req, '/page/'+req.params.slug);
    const settings = await getAllSettings();
    const page = await dbGet('SELECT * FROM pages WHERE slug=? AND active=1', [req.params.slug]);
    if (!page) return res.redirect('/');
    const announcement = await getAnnouncement();
    const navLinks = await getNavLinks();
    const customPages = await dbAll('SELECT * FROM pages WHERE active=1 AND show_in_nav=1 ORDER BY sort_order ASC');
    res.render('custom_page', { settings, page, announcement, navLinks, customPages });
  } catch (e) { res.status(500).send(e.message); }
});

module.exports = router;
