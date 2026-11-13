export const fifaCodeToIsoMap = {
  // Existing Codes
  MEX: 'mx', CZE: 'cz', CAN: 'ca', USA: 'us', MAR: 'ma', FRA: 'fr',
  ARG: 'ar', BRA: 'br', ENG: 'gb-eng', ESP: 'es', POR: 'pt', GER: 'de',
  ITA: 'it', NED: 'nl', BEL: 'be', CRO: 'hr', URU: 'uy', COL: 'co',
  SEN: 'sn', JPN: 'jp', KOR: 'kr', AUS: 'au', IRN: 'ir', KSA: 'sa',
  QAT: 'qa', ECU: 'ec', PER: 'pe', CHI: 'cl', TUN: 'tn', CMR: 'cm',
  NGA: 'ng', GHA: 'gh', EGY: 'eg', CIV: 'ci', DZA: 'dz', RSA: 'za',
  WAL: 'gb-wls', SCO: 'gb-sct', SRB: 'rs', SUI: 'ch', DEN: 'dk',
  SWE: 'se', POL: 'pl', UKR: 'ua', TUR: 'tr', AUT: 'at', HUN: 'hu',
  ROU: 'ro', GRE: 'gr', CRI: 'cr', PAN: 'pa', JAM: 'jm', HON: 'hn',
  NZL: 'nz', ALG: 'dz', CPV: 'cv', COD: 'cd', CUW: 'cw', BIH: 'ba',

  // Names from new Backend API
  'MEXICO': 'mx', 'SOUTH AFRICA': 'za', 'KOREA REPUBLIC': 'kr', 'CZECHIA': 'cz',
  'CANADA': 'ca', 'BOSNIA-HERZEGOVINA': 'ba', 'QATAR': 'qa', 'SWITZERLAND': 'ch',
  'BRAZIL': 'br', 'MOROCCO': 'ma', 'HAITI': 'ht', 'SCOTLAND': 'gb-sct',
  'USA': 'us', 'PARAGUAY': 'py', 'TURKEY': 'tr', 'AUSTRALIA': 'au',
  "CÔTE D'IVOIRE": 'ci', 'CURAÇAO': 'cw', 'ECUADOR': 'ec', 'GERMANY': 'de',
  'JAPAN': 'jp', 'NETHERLANDS': 'nl', 'SWEDEN': 'se', 'TUNISIA': 'tn',
  'BELGIUM': 'be', 'EGYPT': 'eg', 'IR IRAN': 'ir', 'NEW ZEALAND': 'nz',
  'CABO VERDE': 'cv', 'SAUDI ARABIA': 'sa', 'SPAIN': 'es', 'URUGUAY': 'uy',
  'FRANCE': 'fr', 'IRAQ': 'iq', 'NORWAY': 'no', 'SENEGAL': 'sn',
  'ALGERIA': 'dz', 'ARGENTINA': 'ar', 'AUSTRIA': 'at', 'JORDAN': 'jo',
  'COLOMBIA': 'co', 'CONGO DR': 'cd', 'PORTUGAL': 'pt', 'UZBEKISTAN': 'uz',
  'CROATIA': 'hr', 'ENGLAND': 'gb-eng', 'GHANA': 'gh', 'PANAMA': 'pa'
};

// Fallback image function just in case
export const getFlagUrl = (fifaCode) => {
  if (!fifaCode || fifaCode === 'null') return 'https://flagcdn.com/w80/un.png';
  const codeStr = String(fifaCode).toUpperCase();
  const iso = fifaCodeToIsoMap[codeStr];
  if (iso) {
    return `https://flagcdn.com/w80/${iso}.png`;
  }
  return 'https://flagcdn.com/w80/un.png'; // fallback unknown
};

