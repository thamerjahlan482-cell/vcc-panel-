const https = require('https');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID  = process.env.DISCORD_GUILD_ID;

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'discord.com',
      path: `/api/v10${path}`,
      method,
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : {} }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Give a role to a member
async function addRole(discordUserId, roleId) {
  if (!BOT_TOKEN || !GUILD_ID || !discordUserId || !roleId) return { ok: false, reason: 'missing config' };
  const res = await apiRequest('PUT', `/guilds/${GUILD_ID}/members/${discordUserId}/roles/${roleId}`);
  return { ok: res.status === 204, status: res.status, body: res.body };
}

// Get all roles in the guild (so admin can pick one)
async function getGuildRoles() {
  if (!BOT_TOKEN || !GUILD_ID) return [];
  const res = await apiRequest('GET', `/guilds/${GUILD_ID}/roles`);
  if (res.status !== 200) return [];
  return res.body
    .filter(r => r.name !== '@everyone')
    .sort((a, b) => b.position - a.position);
}

module.exports = { addRole, getGuildRoles };
