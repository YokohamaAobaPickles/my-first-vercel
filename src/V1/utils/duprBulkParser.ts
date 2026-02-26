/**
 * Filename: src/V1/utils/duprBulkParser.ts
 * Version : V1.0.0
 * Update  : 2026-02-01
 * Remarks : 
 * V1.0.0 - DUPR一括登録用ファイルのパース。書式: 氏名, DUPR ID, 住所, 年齢・性別, Doubles, Singles
 */

export interface DuprBulkRow {
  name: string;
  duprId: string;
  address: string;
  ageGender: string;
  doublesRating: number;
  singlesRating: number;
}

const LINES_PER_RECORD = 6;
const NR_AS_NUMBER = 0.0;

/**
 * レーティング文字列を数値に変換する。NR は 0.0 とする。
 */
function parseRating(value: string): number {
  const s = (value || '').trim();
  if (s.toUpperCase() === 'NR') return NR_AS_NUMBER;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NR_AS_NUMBER;
}

/**
 * DUPR一括登録ファイルのテキストをパースし、行データの配列を返す。
 * 書式: 1行目=氏名, 2=DUPR ID, 3=住所, 4=年齢・性別, 5=Doubles, 6=Singles。
 * レコード間は空行（\n\n）で区切る。
 */
export function parseDuprBulkFile(text: string): DuprBulkRow[] {
  const blocks = text
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const result: DuprBulkRow[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((l) => l.trim());
    if (lines.length < LINES_PER_RECORD) continue;
    const name = lines[0] ?? '';
    const duprId = (lines[1] ?? '').trim();
    const address = lines[2] ?? '';
    const ageGender = lines[3] ?? '';
    const doublesStr = lines[4] ?? '';
    const singlesStr = lines[5] ?? '';

    result.push({
      name,
      duprId,
      address,
      ageGender,
      doublesRating: parseRating(doublesStr),
      singlesRating: parseRating(singlesStr),
    });
  }
  return result;
}
