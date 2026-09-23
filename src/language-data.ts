export type LanguageFactor = {
  id: string;
  name: string;
  locPerFp: number | null;
  source: string;
  sourceUrl: string;
  note?: string;
};

export const languageFactors: LanguageFactor[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    locPerFp: 47,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    locPerFp: 45,
    source: 'CosmicLearn — SPR-derived language gear ratios',
    sourceUrl: 'https://www.cosmiclearn.com/projesti/function-point-analysis.php',
    note: 'Published as a combined JavaScript / TypeScript reference factor.'
  },
  {
    id: 'python',
    name: 'Python',
    locPerFp: 24,
    source: 'IMDEA Software Institute paper — SLOC/FP table citing SPR',
    sourceUrl: 'https://software.imdea.org/~juanca/papers/malsource_raid16.pdf'
  },
  {
    id: 'java',
    name: 'Java',
    locPerFp: 53,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'csharp',
    name: 'C#',
    locPerFp: 54,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'cpp',
    name: 'C++',
    locPerFp: 50,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'c',
    name: 'C',
    locPerFp: 97,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'php',
    name: 'PHP',
    locPerFp: 67,
    source: 'IMDEA Software Institute paper — SLOC/FP table citing SPR',
    sourceUrl: 'https://software.imdea.org/~juanca/papers/malsource_raid16.pdf'
  },
  {
    id: 'go',
    name: 'Go',
    locPerFp: 37,
    source: 'CosmicLearn — empirical gearing-factor reference',
    sourceUrl: 'https://www.cosmiclearn.com/riskm/function-point-cocomo.php',
    note: 'Published as a combined Python / Go reference factor.'
  },
  {
    id: 'sql',
    name: 'SQL',
    locPerFp: 21,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'html',
    name: 'HTML',
    locPerFp: 34,
    source: 'QSM Function Point Languages Table v5.0',
    sourceUrl: 'https://qsm.com/resources/function-point-languages-table'
  },
  {
    id: 'custom',
    name: 'Other / Custom',
    locPerFp: null,
    source: 'User supplied',
    sourceUrl: ''
  }
];
