import type { Language } from './types';
import type { LabModeId } from '../types';

const pools: Record<LabModeId, Record<Language, string[]>> = {
  patternStudio: {
    en: [
      'What repeats in the pattern? Look at the first three items.',
      'Try saying the rule out loud before you pick a tile.',
      'If numbers jump by the same amount, that is skip counting!',
      'Shape patterns often repeat A-B-A-B — does yours?',
      'Compare the gap between each item — same gap means a rule.',
      'Predict the next item in your head, then check the tiles.',
      'Wrong tile? Look back at the start of the row.',
      'Patterns are like a song — find the beat!',
    ],
    ms: [
      'Apa yang berulang? Tengok tiga item pertama.',
      'Sebut peraturannya dengan kuat sebelum pilih keping.',
      'Nombor langkau sama banyak? Itu kiraan langkau!',
      'Corak bentuk selalu A-B-A-B — corak awak macam tu tak?',
      'Banding jarak antara item — jarak sama ada coraknya.',
      'Teka item seterusnya, lepas tu semak keping.',
      'Salah? Pandang balik permulaan baris.',
      'Corak macam lagu — cari rentaknya!',
    ],
  },
  numberLine: {
    en: [
      'Start at the given number — not always zero!',
      'Each hop is one step on the number line.',
      'Count hops with your fingers while you move.',
      'Addition moves right; subtraction moves left.',
      'Land exactly on the target — not one tick away.',
      'Big jumps? Count in groups if that helps.',
      'The line shows distance — hops are the math.',
      'Check your marker before you press Check!',
    ],
    ms: [
      'Mula pada nombor yang diberi — bukan sentiasa sifar!',
      'Setiap lompatan satu langkah pada garis nombor.',
      'Kira lompatan dengan jari sambil gerak.',
      'Tambah ke kanan; tolak ke kiri.',
      'Hinggap tepat pada sasaran — jangan tersasar.',
      'Lompatan besar? Kira ikut kumpulan kalau senang.',
      'Garis tunjuk jarak — lompatan tu matematiknya.',
      'Semak penanda sebelum tekan Semak!',
    ],
  },
  equationBuilder: {
    en: [
      'Read the equation like a puzzle: what is missing?',
      'Try counting up from the known part to the total.',
      'Both sides must equal the same number.',
      'Pick a tile, then ask: does this make the sum right?',
      'The missing number is often smaller than the total.',
      'Use your fingers to add up if you need to.',
      'Swap tiles until the equation balances in your head.',
      'Check means verify — not guess again!',
    ],
    ms: [
      'Baca persamaan macam teka-teki — nombor apa yang hilang?',
      'Cuba kira naik dari bahagian yang diketahui ke jumlah.',
      'Kedua-dua belah mesti sama nombor.',
      'Pilih keping, tanya: adakah jumlah betul?',
      'Nombor hilang selalu lebih kecil dari jumlah.',
      'Guna jari untuk tambah kalau perlu.',
      'Tukar keping sehingga persamaan nampak seimbang.',
      'Semak = sahkan — bukan teka lagi!',
    ],
  },
  balanceScale: {
    en: [
      'Which pan looks heavier? That side needs more blocks.',
      'Count blocks on each side before you add more.',
      'Balance means equal value on left and right.',
      'Remove a block if a pan goes too high.',
      'Add one block at a time and recount.',
      'The target number is what both sides should show.',
      'Equal groups can help for multiplication ideas.',
      'Slow and steady — balance is about matching totals.',
    ],
    ms: [
      'Dulang mana nampak lebih berat? Tambah blok di situ.',
      'Kira blok setiap belah sebelum tambah lagi.',
      'Seimbang = nilai sama di kiri dan kanan.',
      'Buang blok kalau dulang terlalu tinggi.',
      'Tambah satu blok demi satu, lepas tu kira semula.',
      'Nombor sasaran = apa yang kedua-dua belah patut tunjuk.',
      'Kumpulan sama banyak boleh bantu faham darab.',
      'Perlahan sikit — seimbang maksudnya jumlah sama.',
    ],
  },
  sortSquad: {
    en: [
      'Read the bin labels carefully — that is the rule.',
      'Compare each card to the cutoff number, not to other cards.',
      'Numbers close to the rule need an extra look.',
      'Tap a card, then tap the bin — easy on mobile!',
      'Every card must go somewhere before Submit.',
      'Less than means smaller; and up includes the number itself.',
      'Sort one card at a time so you do not mix up.',
      'Double-check the last card — easy to rush!',
    ],
    ms: [
      'Baca label tong dengan teliti — itu peraturannya.',
      'Banding setiap kad dengan nombor had, bukan dengan kad lain.',
      'Nombor hampir dengan had kena semak sekali lagi.',
      'Tekan kad, lepas tu tekan tong — mudah di telefon!',
      'Setiap kad mesti masuk tong sebelum Hantar.',
      'Kurang dari = lebih kecil; hingga = termasuk nombor itu.',
      'Isih satu kad demi satu supaya tak keliru.',
      'Semak kad terakhir — senang terburu-buru!',
    ],
  },
  thinkSteps: {
    en: [
      'Step 1: find the numbers hiding in the story.',
      'Step 2: joining things? Add. Leaving? Subtract.',
      'Equal groups often mean multiply — bags, rows, packs.',
      'Do not skip steps — each one helps you think.',
      'Tap the numbers in the story before picking an operation.',
      'Write the answer in your head before typing.',
      'Wrong operation? Reread what the story asks.',
      'Planning first makes the math easier!',
    ],
    ms: [
      'Langkah 1: cari nombor dalam cerita.',
      'Langkah 2: bertambah? Tambah. berkurang? Tolak.',
      'Kumpulan sama banyak selalu darab — beg, baris, pek.',
      'Jangan langkau langkah — setiap satu membantu awak fikir.',
      'Tekan nombor dalam cerita sebelum pilih operasi.',
      'Fikir jawapan dalam kepala sebelum taip.',
      'Operasi silap? Baca semula apa yang cerita minta.',
      'Rancang dulu — matematik jadi lebih senang!',
    ],
  },
};

export function getOyenAskLabLine(language: Language, mode: LabModeId, index: number): string {
  const list = pools[mode][language];
  return list[index % list.length] ?? list[0];
}
