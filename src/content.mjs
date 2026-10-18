export const github = 'https://github.com/Dalian-No-5-Middle-School-I-T-C/Project-X';
export const promo = 'https://xiaoxu66609.github.io/Project-X-promo-site/';
export const live = 'https://dl5zx.cn/';
export const brand = 'PROJECT X';
export const slogan = 'From the desk to the record.';

// Exhibition copy for the school system. The stage, shaders and timing stay on the original path.
const chapters = [
  ['Paper', '2e44ff', 'Paper, Skin', 'Paper Edge is the default face of the system: warm paper, ink, and a hard edge. Flat 2.0 stays one switch away. / Project-X promo site.', 'SKIN', 'The default face of the system.', `${promo}#screenshot`],
  ['The Desk', '1f30c8', 'Paper, Desk', 'The home desk opens on the work itself. Answer sheets, exams, scores and accounts share one paper surface, and the latest marked paper is one step away. / Live system.', 'HOME', 'Modules, shortcuts, the latest scores.', live],
  ['Sheets', '1a1917', 'Paper, Design', 'Answer sheets are drawn in the browser: choice blocks, blanks, pictures, notes and subject templates, then exported as a PDF for the printer. / Promo site, modules.', 'DESIGN', 'A sheet, set to the millimetre.', `${promo}#modules`],
  ['The Exam', '4a4842', 'Scores, Exam', 'One exam can be a morning test, open to the teachers who need it, or a formal paper with a tighter lock. The office can change that mode later. / Promo site, modules.', 'EXAM', 'A morning test, or a formal paper.', `${promo}#modules`],
  ['The Scan', '2436d6', 'Scan, Twain', 'The Windows desk scans through TWAIN, or takes a folder of images. Progress stays visible, a batch can be cancelled, and a stuck minute is a fault, not a result. / Promo site, the scan.', 'SCAN', 'The scanner stays in the room.', `${promo}#flow`],
  ['Marking', '6f6d66', 'Scores, Marking', 'Filled boxes are read by the recognition engine. Written answers are cut into blocks for two or three markers, and a wide gap goes to arbitration. The teacher still marks the handwriting. / Promo site, marking.', 'MARK', 'The engine reads. The teacher marks.', `${promo}#flow`],
  ['The Record', '1d1d1b', 'Scores, Record', 'Class rank, spread, difficulty and discrimination stay with the paper. A weak knowledge point can be named. The score itself remains the school record. / Promo site, scores.', 'RECORD', 'Rank, spread, and the weak point.', `${promo}#modules`],
  ['Two Skins', '3a46e6', 'Paper, Skin', 'Before the first login the school chooses a skin. Paper Edge is the print face. Flat 2.0 is the other. The choice is kept on the account. / Promo site, the two previews.', 'CHOICE', 'Paper Edge, or Flat.', `${promo}#screenshot`],
  ['Calendar', '5c584f', 'Scores, Calendar', 'Exams sit on the days they happen. A group of papers can share a grade. The office sees the term before it sees another table. / Promo site, calendar.', 'DATE', 'The term, laid on a calendar.', `${promo}#screenshot`],
  ['The Week', '1520a8', 'Scores, Audit', 'The weekly audit counts the papers, compares classes, and lists the weak items. A week can be published, and recent weeks can be filled in. / Promo site, weekly audit.', 'WEEK', 'What the week actually marked.', `${promo}#screenshot`],
  ['Reading', '2a2926', 'Scores, Insight', 'A model can read the paper and name a weak point. It does not mark the written answer. The model can be changed, or turned off. / Promo site, AI notes.', 'READING', 'A model may read. It does not mark.', `${promo}#ai`],
  ['On Site', '4e5bff', 'Source, Campus', 'The promo site argues against a rented marking service: the scores sit on the school server, a template can be changed in the room, and the people who keep it are already there. / Promo site, comparison.', 'CAMPUS', 'The record stays in the school.', `${promo}#compare`],
  ['The Roles', '3f3c36', 'Roles, Access', 'The office opens an exam. A marker takes the next paper. A tutor reads the class. A student sees only their own result. The lock is the point. / Promo site, roles.', 'ROLES', 'Four desks, one lock.', promo],
  ['Open', '10100f', 'Source, Open', 'Project-X is published under GPL-3.0 by the IT center of Dalian No.5 Middle School. The promo site is the front door. The repository is the work. / Main repository.', 'SOURCE', 'The system is public.', github]
];

export const plates = chapters.map(([name, , , , kicker, line], index) => ({ name, kicker, line, index }));

export const studies = chapters.map(([name, uiColor, tags, description, , , projectURL], index) => {
  const number = String(index + 1).padStart(2, '0');
  const slug = name.toLowerCase().replaceAll(' ', '-');
  const thumbnail = `/assets/rhine/${number}.png`;
  return {
    id: `study-${number}`, name, slug, description, uiColor, tags,
    clientName: `PROJECT X / STUDY ${number}`, completionDate: '2026-08-22T00:00:00.000Z',
    priority: index + 1, projectURL,
    projectLogo: { url: '/assets/daily/wordmark.png', width: 400, height: 200 },
    video: { url: thumbnail, thumbnail }
  };
});
