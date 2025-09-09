export type DeweyRange = {
  code: string // e.g., "000-090"
  from: number
  to: number
  title: string
  topics: string[]
}

export const deweyRanges: DeweyRange[] = [
  {
    code: "000-090",
    from: 0,
    to: 90,
    title: "General Works",
    topics: [
      "001 General knowledge",
      "020 Library Science",
      "030 General Encyclopedias",
      "060 Museums",
      "070 Journalism",
      "090 Manuscripts",
    ],
  },
  {
    code: "100-190",
    from: 100,
    to: 190,
    title: "Philosophy",
    topics: [
      "100 Philosophy",
      "120 Knowledge",
      "130 Parapsychology, Magic, Astrology",
      "150 Psychology",
      "160 Logic",
      "170 Ethics",
      "180 Ancient & Medieval Philosophy",
      "190 Modern Western Philosophy",
    ],
  },
  {
    code: "200-290",
    from: 200,
    to: 290,
    title: "Religion",
    topics: [
      "200 Religion",
      "210 Natural Theology (deism, atheism)",
      "220 The Bible",
      "230 Christian Doctrine",
      "240 Christian Devotion & Prayer",
      "250 Religious Orders",
      "260 Church & Christian Church",
      "270 Christian Church History",
      "280 Christian Churches & Sects",
      "290 Other Religions & Mythology (Judaism, Islam, Hinduism & Buddhism)",
    ],
  },
  {
    code: "300-390",
    from: 300,
    to: 390,
    title: "Social Sciences",
    topics: [
      "300 Social Sciences",
      "310 Statistics",
      "320 Political Science",
      "330 Economics",
      "340 Law",
      "350 Public Administration",
      "360 Social services; public welfare",
      "370 Education",
      "380 Commerce, Communications & Transport",
      "390 Customs & Folklore",
    ],
  },
  {
    code: "400-490",
    from: 400,
    to: 490,
    title: "Language",
    topics: [
      "400 Language",
      "410 Linguistics",
      "419 Sign Language",
      "420 English Language",
      "423 English Dictionaries",
      "426 English Grammars",
      "493 African Languages",
    ],
  },
  {
    code: "500-560",
    from: 500,
    to: 560,
    title: "Pure Sciences",
    topics: [
      "500 Pure Sciences",
      "510 Mathematics",
      "520 Astronomy",
      "530 Physics",
      "540 Chemistry",
      "550 Earth Sciences",
      "560 Paleontology",
    ],
  },
  {
    code: "570-590",
    from: 570,
    to: 590,
    title: "Life Sciences",
    topics: [
      "570 Life Sciences",
      "574 Biology",
      "575 Evolution & Genetics",
      "579 Microorganisms",
      "580 Plants (Botany)",
      "590 Animals",
    ],
  },
  {
    code: "600-690",
    from: 600,
    to: 690,
    title: "Technology",
    topics: [
      "600 Technology",
      "610 Medical Sciences",
      "613 Personal & Family Hygiene",
      "620 Engineering",
      "630 Agriculture",
      "636 Animal Husbandry",
      "640 Home Economics",
      "650 Management Services, Office",
      "660 Chemical Technology",
      "670 Manufacturing",
      "690 Building Construction",
    ],
  },
  {
    code: "700-790",
    from: 700,
    to: 790,
    title: "The Arts",
    topics: [
      "700 The Arts",
      "710 Civic & Landscape Art, Planning",
      "720 Architecture",
      "730 Sculpture",
      "740 Drawing & Decorative Arts & Crafts",
      "750 Painting",
      "760 Graphic Arts",
      "770 Photography",
      "780 Music",
      "790 Public Entertainment • Sports",
    ],
  },
  {
    code: "800-890",
    from: 800,
    to: 890,
    title: "Literature",
    topics: [
      "800 Literature",
      "808 Public speaking, Debate",
      "809 Literatures of specific languages",
      "820 English Literature",
      "828 African Literature",
    ],
  },
  {
    code: "900-990",
    from: 900,
    to: 990,
    title: "General History & Geography",
    topics: [
      "900 General History & Geography",
      "910 Travel",
      "920 Biography",
      "930 Archaeology & Ancient World",
      "940 History of Europe",
      "960 History of Africa",
      "970 History of North America",
      "980 History of South America",
      "990 History of Australasia & Pacific",
    ],
  },
]

export function deweyClassFromCode(code: string | number | null | undefined) {
  if (code == null) return null
  const n = Math.floor(Number(String(code).split(".")[0] || 0))
  return deweyRanges.find((r) => n >= r.from && n <= r.to) || null
}


