import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/sabarismac/Downloads/workspace-267e3c6a-df91-422d-af72-b8aa8007867f-2';
const source = path.join(root, 'design-sources', 'implementation');
const outDir = path.join(root, 'design-sources', 'workflow-boards');
fs.mkdirSync(outDir, { recursive: true });

const boards = [
  { file: 'visitor-readiness', title: 'Visitor + Readiness flow', color: '#0f766e', fill: '#e8f8f3', nodes: [['role-selection','Role selection'],['guest-readiness-chat','Guest readiness'],['readiness-summary','Readiness summary'],['auth','Auth'],['buyer-onboarding','Buyer onboarding'],['readiness','Readiness dashboard'],['public-profile','Public Pro profile'],['brief-detail-public','Public brief'],['support','Support']] },
  { file: 'buyer', title: 'Buyer execution flow', color: '#3457eb', fill: '#eef1ff', nodes: [['buyer-dashboard','Buyer dashboard'],['buyer-talent','Talent discovery'],['buyer-profile','Buyer profile'],['buyer-brief-new','Brief builder'],['buyer-brief-detail','Brief detail'],['buyer-contract','Contract workroom'],['buyer-payment','Payment evidence'],['buyer-messages','Messages']] },
  { file: 'pro', title: 'Pro execution flow', color: '#e85d3f', fill: '#fff0eb', nodes: [['pro-dashboard','Pro dashboard'],['pro-briefs','Pro briefs'],['pro-proposals','Proposals'],['pro-profile','Pro profile'],['pro-contract','Contract workroom'],['pro-payouts','Payouts'],['pro-gigs','Gigs'],['pro-gig-new','Gig builder'],['pro-gig-detail','Priority gig detail']] },
  { file: 'admin', title: 'Admin operations flow', color: '#5746c9', fill: '#f2f0ff', nodes: [['admin-operations','Operations'],['admin-kyc','KYC'],['admin-payments','Payments'],['admin-payouts','Payouts'],['admin-refunds','Refunds'],['admin-disputes','Disputes'],['admin-trust','Trust & Safety'],['admin-audit','Audit log'],['admin-gig-moderation','Gig moderation'],['admin-notes','Admin notes'],['media-lifecycle-demo','Media lifecycle']] },
  { file: 'mobile', title: 'Mobile reference flow', color: '#d08b14', fill: '#fff7e5', suffix: '-mobile.png', nodes: [['readiness','Readiness mobile'],['buyer-dashboard','Buyer dashboard mobile'],['buyer-brief-new','Brief builder mobile'],['pro-profile','Pro profile mobile']] }
];

const esc = v => v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const encode = file => `data:image/png;base64,${fs.readFileSync(path.join(source,file)).toString('base64')}`;
const cardW = 760, cardH = 920, gap = 110, margin = 160, cols = 4;
const arrow = (x1,y1,x2,y2,c) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${c}" stroke-width="9" fill="none" marker-end="url(#arrow)"/>`;

for (const board of boards) {
  const suffix = board.suffix ?? '-desktop.png';
  const rows = Math.ceil(board.nodes.length/cols);
  const width = margin*2 + cols*cardW + (cols-1)*gap;
  const height = 180 + rows*cardH + (rows-1)*gap + 210;
  let body = `<rect width="${width}" height="${height}" fill="#fcfbf7"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#70717a"/></marker></defs><rect x="60" y="55" width="${width-120}" height="${height-110}" rx="36" fill="${board.fill}" stroke="${board.color}" stroke-width="4"/><text x="${margin}" y="125" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="${board.color}">${esc(board.title)}</text><text x="${margin}" y="162" font-family="monospace" font-size="18" fill="#62636a">Full screen previews · primary transition order · source route labels</text>`;
  const positions=[];
  board.nodes.forEach(([name,label],i)=>{
    const row=Math.floor(i/cols), col=i%cols, x=margin+col*(cardW+gap), y=215+row*(cardH+gap); positions.push([x,y]);
    const full=`${name}${suffix}`;
    body += `<g transform="translate(${x},${y})"><rect width="${cardW}" height="${cardH}" rx="26" fill="#fff" stroke="${board.color}" stroke-width="5"/><rect width="${cardW}" height="70" rx="26" fill="${board.color}"/><rect y="38" width="${cardW}" height="32" fill="${board.color}"/><text x="28" y="46" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#fff">${esc(label)}</text><rect x="28" y="94" width="704" height="730" rx="18" fill="#f4f4f1" stroke="#deded9" stroke-width="2"/><image href="${encode(full)}" x="42" y="108" width="676" height="702" preserveAspectRatio="xMidYMid meet"/><text x="28" y="865" font-family="monospace" font-size="16" fill="#5d5e66">${esc(full)}</text></g>`;
    if(i<board.nodes.length-1){ const [nx,ny]=positions[i]; const nextCol=(i+1)%cols; if(nextCol!==0) body+=arrow(nx+cardW+15,ny+cardH/2,nx+cardW+gap-15,ny+cardH/2,board.color); else body+=arrow(nx+cardW/2,ny+cardH+15,margin+cardW/2,ny+cardH+gap-15,board.color); }
  });
  body += `<text x="${margin}" y="${height-75}" font-family="monospace" font-size="18" fill="#62636a">Every image is a complete implementation capture; tall screens are contained, never cropped.</text>`;
  const output=path.join(outDir,`${board.file}.svg`);
  fs.writeFileSync(output,`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`);
  console.log(JSON.stringify({file:board.file,width,height,routes:board.nodes.length,output}));
}
