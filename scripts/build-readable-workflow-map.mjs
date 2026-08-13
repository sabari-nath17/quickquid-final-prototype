import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/sabarismac/Downloads/workspace-267e3c6a-df91-422d-af72-b8aa8007867f-2';
const source = path.join(root, 'design-sources', 'implementation');
const output = path.join(root, 'design-sources', 'quickquid-readable-screen-workflow-map.svg');

const lanes = [
  { title: 'Visitor + Readiness', color: '#0f766e', fill: '#e8f8f3', nodes: [
    ['role-selection', 'Role selection'], ['guest-readiness-chat', 'Guest readiness'], ['readiness-summary', 'Readiness summary'], ['auth', 'Auth'], ['buyer-onboarding', 'Buyer onboarding'], ['readiness', 'Readiness dashboard'], ['public-profile', 'Public Pro profile'], ['brief-detail-public', 'Public brief'], ['support', 'Support']
  ]},
  { title: 'Buyer execution', color: '#3457eb', fill: '#eef1ff', nodes: [
    ['buyer-dashboard', 'Buyer dashboard'], ['buyer-talent', 'Talent discovery'], ['buyer-profile', 'Buyer profile'], ['buyer-brief-new', 'Brief builder'], ['buyer-brief-detail', 'Brief detail'], ['buyer-contract', 'Contract workroom'], ['buyer-payment', 'Payment evidence'], ['buyer-messages', 'Messages']
  ]},
  { title: 'Pro execution', color: '#e85d3f', fill: '#fff0eb', nodes: [
    ['pro-dashboard', 'Pro dashboard'], ['pro-briefs', 'Pro briefs'], ['pro-proposals', 'Proposals'], ['pro-profile', 'Pro profile'], ['pro-contract', 'Contract workroom'], ['pro-payouts', 'Payouts'], ['pro-gigs', 'Gigs'], ['pro-gig-new', 'Gig builder'], ['pro-gig-detail', 'Priority gig detail']
  ]},
  { title: 'Admin operations', color: '#5746c9', fill: '#f2f0ff', nodes: [
    ['admin-operations', 'Operations'], ['admin-kyc', 'KYC'], ['admin-payments', 'Payments'], ['admin-payouts', 'Payouts'], ['admin-refunds', 'Refunds'], ['admin-disputes', 'Disputes'], ['admin-trust', 'Trust & Safety'], ['admin-audit', 'Audit log'], ['admin-gig-moderation', 'Gig moderation'], ['admin-notes', 'Admin notes'], ['media-lifecycle-demo', 'Media lifecycle']
  ]}
];
const mobile = [
  ['readiness', 'Readiness mobile'], ['buyer-dashboard', 'Buyer dashboard mobile'], ['buyer-brief-new', 'Brief builder mobile'], ['pro-profile', 'Pro profile mobile']
];

const W = 5200, margin = 150, cardW = 530, cardH = 650, gapX = 80, gapY = 80, cols = 6;
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const imgData = fileName => `data:image/png;base64,${fs.readFileSync(path.join(source, fileName)).toString('base64')}`;
const card = (name, label, color, x, y, fileSuffix = '-desktop.png') => {
  const fullName = `${name}${fileSuffix}`;
  return `<g transform="translate(${x},${y})"><rect width="${cardW}" height="${cardH}" rx="26" fill="#ffffff" stroke="${color}" stroke-width="4"/><rect width="${cardW}" height="58" rx="26" fill="${color}"/><rect y="30" width="${cardW}" height="28" fill="${color}"/><text x="22" y="37" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#ffffff">${esc(label)}</text><rect x="22" y="78" width="486" height="505" rx="16" fill="#f4f4f1" stroke="#e0e0dc" stroke-width="2"/><image href="${imgData(fullName)}" x="30" y="86" width="470" height="489" preserveAspectRatio="xMidYMid meet"/><text x="22" y="615" font-family="monospace" font-size="14" fill="#5d5e66">${esc(fullName)}</text></g>`;
};
const arrow = (x1, y1, x2, y2, color) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="8" fill="none" marker-end="url(#arrow)"/>`;

let y = 180;
let body = `<rect width="${W}" height="7000" fill="#fcfbf7"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#70717a"/></marker></defs><text x="${margin}" y="78" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="#14151d">QuickQuid — complete screen workflow</text><text x="${margin}" y="124" font-family="monospace" font-size="20" fill="#62636a">38 desktop route captures + 4 mobile references · full previews · no cropped screenshots</text>`;

const sharedNodes = [['notifications', 'Notifications']];
body += `<rect x="${margin-35}" y="${y}" width="${W-margin*2+70}" height="${cardH+130}" rx="30" fill="#f3f3ee" stroke="#45464e" stroke-width="3"/><text x="${margin}" y="${y+58}" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#45464e">Shared route</text>`;
body += card('notifications', 'Notifications', '#45464e', margin, y+85);
body += `<text x="${margin+cardW+80}" y="${y+190}" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#45464e">Available from Buyer, Pro, and Admin shells</text><text x="${margin+cardW+80}" y="${y+242}" font-family="monospace" font-size="18" fill="#62636a">Use the role pages for full-size inspection.</text>`;
y += cardH + 210;

for (const lane of lanes) {
  const rows = Math.ceil(lane.nodes.length / cols);
  const laneH = rows * cardH + (rows - 1) * gapY + 145;
  body += `<rect x="${margin-35}" y="${y}" width="${W-margin*2+70}" height="${laneH}" rx="30" fill="${lane.fill}" stroke="${lane.color}" stroke-width="3"/><text x="${margin}" y="${y+58}" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="${lane.color}">${esc(lane.title)}</text>`;
  const positions = [];
  lane.nodes.forEach(([name, label], index) => {
    const row = Math.floor(index / cols), col = index % cols;
    const x = margin + col * (cardW + gapX), cy = y + 85 + row * (cardH + gapY);
    positions.push([x, cy]);
    body += card(name, label, lane.color, x, cy);
    if (index < lane.nodes.length - 1) {
      const [nx, ny] = positions[index];
      const nextCol = (index + 1) % cols;
      if (nextCol !== 0) body += arrow(nx + cardW + 12, ny + cardH/2, nx + cardW + gapX - 12, ny + cardH/2, lane.color);
      else body += arrow(nx + cardW/2, ny + cardH + 12, margin + (index + 1) % cols * (cardW + gapX) + cardW/2, ny + cardH + gapY - 12, lane.color);
    }
  });
  y += laneH + 95;
}

const mobileY = y;
body += `<rect x="${margin-35}" y="${mobileY}" width="${W-margin*2+70}" height="860" rx="30" fill="#fff7e5" stroke="#d08b14" stroke-width="3"/><text x="${margin}" y="${mobileY+58}" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#a66d00">Mobile references</text>`;
mobile.forEach(([name, label], index) => body += card(name, label, '#d08b14', margin + index * (cardW + gapX), mobileY + 85, '-mobile.png'));
body += `<text x="${margin}" y="${mobileY+820}" font-family="monospace" font-size="18" fill="#62636a">These are the mobile captures currently available in the implementation pack.</text>`;
body += `<text x="${margin}" y="${mobileY+930}" font-family="monospace" font-size="18" fill="#62636a">Primary transition direction: Visitor → Buyer/Pro → Admin verification and operations.</text>`;

fs.writeFileSync(output, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${mobileY+1000}" viewBox="0 0 ${W} ${mobileY+1000}">${body}</svg>`);
console.log(JSON.stringify({output,width:W,height:mobileY+1000,desktopRoutes:lanes.reduce((n,l)=>n+l.nodes.length,0)+1,mobileRoutes:mobile.length}));
