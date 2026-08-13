import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/sabarismac/Downloads/workspace-267e3c6a-df91-422d-af72-b8aa8007867f-2';
const source = path.join(root, 'design-sources', 'implementation');
const output = path.join(root, 'design-sources', 'quickquid-screen-workflow-map.svg');

const lanes = [
  { title: 'Visitor + Readiness', color: '#0f766e', fill: '#e8f8f3', y: 250, nodes: [
    ['role-selection', 'Role selection'], ['guest-readiness-chat', 'Guest readiness'], ['readiness-summary', 'Readiness summary'], ['auth', 'Auth'], ['buyer-onboarding', 'Buyer onboarding'], ['readiness', 'Readiness dashboard'], ['public-profile', 'Public Pro profile'], ['brief-detail-public', 'Public brief'], ['support', 'Support']
  ]},
  { title: 'Buyer execution', color: '#3457eb', fill: '#eef1ff', y: 1050, nodes: [
    ['buyer-dashboard', 'Buyer dashboard'], ['buyer-talent', 'Talent discovery'], ['buyer-profile', 'Buyer profile'], ['buyer-brief-new', 'Brief builder'], ['buyer-brief-detail', 'Brief detail'], ['buyer-contract', 'Contract workroom'], ['buyer-payment', 'Payment evidence'], ['buyer-messages', 'Messages']
  ]},
  { title: 'Pro execution', color: '#e85d3f', fill: '#fff0eb', y: 1850, nodes: [
    ['pro-dashboard', 'Pro dashboard'], ['pro-briefs', 'Pro briefs'], ['pro-proposals', 'Proposals'], ['pro-profile', 'Pro profile'], ['pro-contract', 'Contract workroom'], ['pro-payouts', 'Payouts'], ['pro-gigs', 'Gigs'], ['pro-gig-new', 'Gig builder'], ['pro-gig-detail', 'Priority gig detail']
  ]},
  { title: 'Admin operations', color: '#5746c9', fill: '#f2f0ff', y: 2650, nodes: [
    ['admin-operations', 'Operations'], ['admin-kyc', 'KYC'], ['admin-payments', 'Payments'], ['admin-payouts', 'Payouts'], ['admin-refunds', 'Refunds'], ['admin-disputes', 'Disputes'], ['admin-trust', 'Trust & Safety'], ['admin-audit', 'Audit log'], ['admin-gig-moderation', 'Gig moderation'], ['admin-notes', 'Admin notes'], ['media-lifecycle-demo', 'Media lifecycle']
  ]}
];

const W = 5200, H = 3500, cardW = 360, cardH = 490, gap = 105, left = 170;
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const imgData = name => {
  const file = path.join(source, `${name}-desktop.png`);
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
};
const card = (lane, name, label, x, y) => {
  const href = imgData(name);
  return `<g transform="translate(${x},${y})"><rect width="${cardW}" height="${cardH}" rx="22" fill="#ffffff" stroke="${lane.color}" stroke-width="4"/><rect x="0" y="0" width="${cardW}" height="38" rx="22" fill="${lane.color}"/><rect x="0" y="20" width="${cardW}" height="18" fill="${lane.color}"/><text x="18" y="27" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${esc(label)}</text><rect x="18" y="58" width="324" height="330" rx="12" fill="#f5f5f2"/><image href="${href}" x="18" y="58" width="324" height="330" preserveAspectRatio="xMidYMid slice"/><text x="18" y="430" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#14151d">${esc(label)}</text><text x="18" y="458" font-family="monospace" font-size="13" fill="#6b6c72">${esc(name)}-desktop.png</text></g>`;
};
const arrow = (x1, y1, x2, y2, color) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="8" fill="none" marker-end="url(#arrow)"/>`;

let body = `<rect width="${W}" height="${H}" fill="#fcfbf7"/><text x="${left}" y="80" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#14151d">QuickQuid — screen workflow map</text><text x="${left}" y="135" font-family="monospace" font-size="19" fill="#62636a">38 registered route captures · implementation source of truth · stage-by-stage handoff</text>`;
body += `<g transform="translate(${W-1040},55)"><rect width="850" height="90" rx="18" fill="#14151d"/><text x="28" y="38" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">Shared route: Notifications</text><text x="28" y="68" font-family="monospace" font-size="15" fill="#d9d9d2">notifications-desktop.png · available to Buyer, Pro, Admin</text></g>`;
body += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7d7e86"/></marker></defs>`;

for (const lane of lanes) {
  body += `<rect x="${left-45}" y="${lane.y-100}" width="${W-left*2+90}" height="${cardH+190}" rx="30" fill="${lane.fill}" stroke="${lane.color}" stroke-width="3"/><text x="${left}" y="${lane.y-40}" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="${lane.color}">${esc(lane.title)}</text>`;
  lane.nodes.forEach(([name, label], index) => {
    const x = left + index * (cardW + gap);
    body += card(lane, name, label, x, lane.y);
    if (index < lane.nodes.length - 1) body += arrow(x + cardW + 20, lane.y + cardH / 2, x + cardW + gap - 20, lane.y + cardH / 2, '#7d7e86');
  });
}

// Cross-lane transitions are explicit so the map reads as a usable workflow, not a gallery.
body += arrow(left + 4 * (cardW + gap) + cardW / 2, 250 + cardH + 10, left + cardW / 2, 1050 - 20, '#0f766e');
body += arrow(left + 0 * (cardW + gap) + cardW / 2, 1050 + cardH + 10, left + cardW / 2, 1850 - 20, '#3457eb');
body += arrow(left + 0 * (cardW + gap) + cardW / 2, 1850 + cardH + 10, left + cardW / 2, 2650 - 20, '#e85d3f');
body += `<text x="${left+4*(cardW+gap)+cardW/2+24}" y="${250+cardH+80}" font-family="monospace" font-size="16" fill="#0f766e">auth → buyer</text><text x="${left+cardW/2+24}" y="${1050+cardH+80}" font-family="monospace" font-size="16" fill="#3457eb">hire → execute</text><text x="${left+cardW/2+24}" y="${1850+cardH+80}" font-family="monospace" font-size="16" fill="#e85d3f">evidence → verify</text>`;
body += `<text x="${left}" y="${H-60}" font-family="monospace" font-size="18" fill="#62636a">Use the role pages for individual screen inspection. This page is the visual route map; arrows indicate the intended primary transition.</text>`;

fs.writeFileSync(output, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
console.log(output);
