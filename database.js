const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'vibecity.db'));

db.serialize(() => {
  // Core tables
  db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS streamers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, platform TEXT DEFAULT 'kick',
    profile_url TEXT, image_url TEXT, sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, icon TEXT DEFAULT '📌',
    content TEXT NOT NULL, sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1)`);
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, icon TEXT DEFAULT '💼',
    description TEXT, requirements TEXT, questions TEXT NOT NULL DEFAULT '[]',
    admin_discord_ids TEXT NOT NULL DEFAULT '[]', discord_role_id TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, job_id INTEGER NOT NULL,
    discord_id TEXT NOT NULL, discord_username TEXT NOT NULL, discord_avatar TEXT,
    answers TEXT NOT NULL DEFAULT '{}', status TEXT DEFAULT 'pending',
    admin_note TEXT, reviewed_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  // NEW TABLES
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, color TEXT DEFAULT '#f97316',
    bg_color TEXT DEFAULT 'rgba(249,115,22,0.1)', icon TEXT DEFAULT '📢',
    link TEXT, link_text TEXT, active INTEGER DEFAULT 1,
    expires_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    content TEXT, icon TEXT DEFAULT '📄', show_in_nav INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL,
    image_url TEXT, discord_id TEXT, description TEXT,
    sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1)`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT,
    image_url TEXT, event_date DATETIME, location TEXT,
    badge TEXT, badge_color TEXT DEFAULT '#f97316',
    active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT, page TEXT NOT NULL,
    ip TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS nav_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, url TEXT NOT NULL,
    icon TEXT, target TEXT DEFAULT '_self', location TEXT DEFAULT 'nav',
    sort_order INTEGER DEFAULT 0, active INTEGER DEFAULT 1)`);

  // Default settings
  const defaults = {
    server_name:'Vibe City', server_name_en:'Vibe City',
    server_tagline:'عيش حياتك كما تريد',
    server_description:'حياكم الله في سيرفر فايب سيتي المتخصص في الرول بلاي',
    primary_color:'#f97316', secondary_color:'#fb923c',
    discord_url:'https://discord.gg/dwTQsbr7', kick_url:'https://kick.com/vibecity',
    twitter_url:'https://twitter.com/vibecity', store_url:'https://store.vibecity.gg',
    stat_members:'200k+', stat_followers:'170k+', stat_twitter:'60k+',
    footer_text:'جميع الحقوق محفوظة 2025 Vibe City', logo_text:'V',
    // Hero
    hero_title:'عيش حياتك كما تريد', hero_subtitle:'حياكم الله في سيرفر فايب سيتي',
    hero_btn1_text:'انضم الآن 🚀', hero_btn1_url:'', hero_btn1_show:'1',
    hero_btn2_text:'شاهد البثوث 🎮', hero_btn2_url:'/streamers', hero_btn2_show:'1',
    hero_badge_text:'السيرفر العربي الأول في الرول بلاي',
    // Sections visibility
    show_stats:'1', show_streamers:'1', show_platforms:'1', show_about:'1',
    show_team:'1', show_events:'1',
    // Typography
    font_family:'Tajawal', border_radius:'16', card_style:'rounded',
    // Footer extras
    footer_show_discord:'1', footer_show_twitter:'1', footer_show_store:'1',
  };
  for(const [k,v] of Object.entries(defaults)) db.run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',[k,v]);

  db.get('SELECT COUNT(*) as c FROM streamers',(err,row)=>{
    if(!err&&row.c===0){
      const s=[['AlphaX','kick','https://kick.com','https://api.dicebear.com/7.x/avataaars/svg?seed=AlphaX',1],
        ['ZaidRP','kick','https://kick.com','https://api.dicebear.com/7.x/avataaars/svg?seed=ZaidRP',2],
        ['ShadowKing','kick','https://kick.com','https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowKing',3],
        ['NightWolf','kick','https://kick.com','https://api.dicebear.com/7.x/avataaars/svg?seed=NightWolf',4]];
      s.forEach(x=>db.run('INSERT INTO streamers(name,platform,profile_url,image_url,sort_order)VALUES(?,?,?,?,?)',x));
    }
  });
  db.get('SELECT COUNT(*) as c FROM rules',(err,row)=>{
    if(!err&&row.c===0){
      const r=[['قوانين الحياة الجديدة - NLR','💫','في حال اغمائك بشكل كامل لا يمكنك الكلام أو الحركة.',1],
        ['الباور جيمنق - PowerGaming','⚡','استخدام الوسائل غير الموجودة في اللعبة مخالفة.',2],
        ['القوانين العامة','📌','العمر المسموح 18 سنة فما فوق.',3]];
      r.forEach(x=>db.run('INSERT INTO rules(title,icon,content,sort_order)VALUES(?,?,?,?)',x));
    }
  });
  db.get('SELECT COUNT(*) as c FROM jobs',(err,row)=>{
    if(!err&&row.c===0){
      db.run('INSERT INTO jobs(title,icon,description,requirements,questions,admin_discord_ids,sort_order)VALUES(?,?,?,?,?,?,?)',
        ['الشرطة','👮','انضم لفريق الشرطة','العمر 18+\nخبرة في الرول بلاي',
         JSON.stringify(['ما اسمك في الرول بلاي؟','كم عمرك؟','لماذا تريد الانضمام؟','كم ساعة تلعب يومياً؟']),
         JSON.stringify([]),1]);
    }
  });
  db.get('SELECT COUNT(*) as c FROM team',(err,row)=>{
    if(!err&&row.c===0){
      db.run('INSERT INTO team(name,role,image_url,description,sort_order)VALUES(?,?,?,?,?)',
        ['المؤسس','مؤسس السيرفر','https://api.dicebear.com/7.x/avataaars/svg?seed=founder','مؤسس ومدير سيرفر فايب سيتي',1]);
    }
  });
});

// Migration: add discord_role_id if missing
db.run(`ALTER TABLE jobs ADD COLUMN discord_role_id TEXT DEFAULT ''`, () => {});

function getAllSettings(){return new Promise((res,rej)=>{db.all('SELECT key,value FROM settings',(err,rows)=>{if(err)return rej(err);const s={};rows.forEach(r=>s[r.key]=r.value);res(s);});})}
function getSetting(key){return new Promise((res,rej)=>{db.get('SELECT value FROM settings WHERE key=?',[key],(err,row)=>{if(err)return rej(err);res(row?row.value:null);});})}
function setSetting(key,value){return new Promise((res,rej)=>{db.run('INSERT OR REPLACE INTO settings(key,value)VALUES(?,?)',[key,value],err=>{if(err)return rej(err);res();});})}
function dbAll(sql,params=[]){return new Promise((res,rej)=>{db.all(sql,params,(err,rows)=>{if(err)return rej(err);res(rows);});})}
function dbGet(sql,params=[]){return new Promise((res,rej)=>{db.get(sql,params,(err,row)=>{if(err)return rej(err);res(row);});})}
function dbRun(sql,params=[]){return new Promise((res,rej)=>{db.run(sql,params,function(err){if(err)return rej(err);res(this);});})}

module.exports={db,getAllSettings,getSetting,setSetting,dbAll,dbGet,dbRun};
