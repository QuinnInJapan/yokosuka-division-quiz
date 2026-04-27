const AXES = {
  A:{label:'人との関わり方',minus:'制度・仕組み',plus:'市民対話',color:'#E8534A',dark:'#C0392B',tint:'#FFF0EE',kanji_plus:'人',kanji_minus:'機',letter_plus:'D',letter_minus:'F',en_plus:'Dialogue',en_minus:'Framework'},
  B:{label:'仕事の進め方',minus:'政策立案',plus:'現場対応',color:'#4A90D9',dark:'#2E6DB4',tint:'#EBF3FC',kanji_plus:'動',kanji_minus:'策',letter_plus:'A',letter_minus:'P',en_plus:'Action',en_minus:'Policy'},
  C:{label:'担う役割',minus:'ルール管理',plus:'市民支援',color:'#4CAF7D',dark:'#1E7345',tint:'#ECF8F1',kanji_plus:'援',kanji_minus:'律',letter_plus:'S',letter_minus:'R',en_plus:'Support',en_minus:'Rule'},
  D:{label:'変化への姿勢',minus:'革新推進',plus:'安定運営',color:'#9B59B6',dark:'#7B3F9E',tint:'#F5EDF8',kanji_plus:'守',kanji_minus:'革',letter_plus:'C',letter_minus:'I',en_plus:'Conservation',en_minus:'Innovation'},
  E:{label:'知識のスタイル',minus:'専門追求',plus:'幅広対応',color:'#F5A623',dark:'#9C6310',tint:'#FFF6E6',kanji_plus:'幅',kanji_minus:'専',letter_plus:'G',letter_minus:'X',en_plus:'Generalist',en_minus:'Expert'},
};

const QUESTIONS=[
  {id:'A1',axis:'A',reversed:false,
   scenario:'高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。',
   options:['自分には向いていないと思う','あまり気が乗らないが、こなせる','どちらとも言えない','やりがいを感じながら取り組める','まさに自分が輝ける場面']},
  {id:'B1',axis:'B',reversed:false,
   scenario:'台風の翌朝、道路の損傷箇所を現場で確認しながら、修繕の優先順位を判断し作業を指揮する。',
   options:['現場対応は自分には合わないと思う','あまり気が進まない','どちらとも言えない','現場感があって充実する','まさにこういう仕事がしたい']},
  {id:'C1',axis:'C',reversed:false,
   scenario:'生活費に困っている市民が相談に訪れた。使える制度を複数調べて提案し、申請まで一緒に伴走する。',
   options:['責任が重くて自分には難しい','あまり気が進まない','どちらとも言えない','力になれる実感がある','この種の仕事に最もやりがいを感じる']},
  {id:'D1',axis:'D',reversed:false,
   scenario:'20年間変わらない手順で処理されてきた窓口業務を、正確に・丁寧にこなすことが求められている。',
   options:['変化のない繰り返しはつらい','やれなくはないが、物足りない','どちらとも言えない','正確にこなすことに誇りを持てる','安定した仕事こそ自分に合っている']},
  {id:'E1',axis:'E',reversed:false,
   scenario:'担当が決まっていない問い合わせが入った。専門外でも、関係部署に橋渡ししながら自分で対応を進める。',
   options:['専門外の対応は不安が大きい','あまり得意ではない','どちらとも言えない','幅広く動ける方が自分には合っている','こういう縦横無尽な動き方が一番好き']},
  {id:'A2',axis:'A',reversed:false,
   scenario:'地域の子育てサークルに出向き、参加者と直接会話しながら市の支援制度を紹介する。',
   options:['人前で話すのが苦手で気が重い','できなくはないが、積極的にはやりたくない','どちらとも言えない','楽しみながら取り組める','こういう機会が増えるほどうれしい']},
  {id:'B2',axis:'B',reversed:false,
   scenario:'「公園の照明が壊れている」と市民から連絡が入った。すぐ現地に向かって状況を確認し、即日対応する。',
   options:['突発的な対応は苦手','できなくはないが、好まない','どちらとも言えない','すぐ動けると達成感がある','臨機応変に動ける場面が好き']},
  {id:'C2',axis:'C',reversed:false,
   scenario:'障害のあるお子さんを抱えるご家族が、利用できるサービスがわからず不安そうにしている。丁寧に案内し、安心して帰ってもらう。',
   options:['感情的に消耗しそうで苦手','あまり積極的にはなれない','どちらとも言えない','安心してもらえるとうれしい','こういう場面にいちばんやりがいを感じる']},
  {id:'D2',axis:'D',reversed:false,
   scenario:'市民が毎年楽しみにしている年中行事を、例年通りの品質で滞りなく運営する役割を任されている。',
   options:['毎年同じことの繰り返しは物足りない','あまり積極的になれない','どちらとも言えない','確実に運営できると満足感がある','こういう安定した役割が自分には向いている']},
  {id:'E2',axis:'E',reversed:false,
   scenario:'大きなイベントの運営で、会場設営・広報・予算管理・関係者調整をすべて一手に担う。',
   options:['何でも屋的な動き方は好きではない','あまり得意ではない','どちらとも言えない','幅広くこなせると充実する','何でもこなせることが自分の強み']},
  {id:'A3',axis:'A',reversed:true,
   scenario:'複数部署にまたがる業務フローの非効率を発見し、新しい仕組みを設計して改善する。',
   options:['あまりピンとこない','やれなくはないが、得意ではない','どちらとも言えない','達成感を感じながら取り組める','こういう仕事がいちばん好き']},
  {id:'B3',axis:'B',reversed:true,
   scenario:'10年後の市の交通網を見据え、データをもとに都市交通計画の草案を半年かけて策定する。',
   options:['長期的な計画づくりは性に合わない','あまり気が進まない','どちらとも言えない','じっくり取り組めて充実する','こういう構想を練る仕事が好き']},
  {id:'C3',axis:'C',reversed:true,
   scenario:'飲食店の衛生検査で違反を発見した。改善指導を行い、基準を満たすまで営業停止の措置を取る。',
   options:['厳しい措置を取るのは気が引ける','あまり得意ではない','どちらとも言えない','ルールを守らせることに使命感がある','こういう毅然とした対応が自分には向いている']},
  {id:'D3',axis:'D',reversed:true,
   scenario:'紙で行われていた申請手続きをオンライン化するプロジェクトを立ち上げ、庁内の抵抗を説得しながら実現する。',
   options:['反発を受けてまで変えるのは疲れる','あまり向いていないと思う','どちらとも言えない','変化を生み出すことに達成感がある','こういう改革推進こそ自分の役割だと思う']},
  {id:'E3',axis:'E',reversed:true,
   scenario:'下水道管の老朽化調査のため、専門的な検査機器の使い方を習得し、データを解析して報告書をまとめる。',
   options:['専門的な技術の習得は性に合わない','あまり気が進まない','どちらとも言えない','専門を深めることに達成感がある','こういう技術的な仕事こそ自分の強み']},
  {id:'A4',axis:'A',reversed:true,
   scenario:'市の財政データを分析し、来年度の予算配分の最適案をまとめたレポートを作成する。',
   options:['数字中心の仕事は気が進まない','やれなくはないが、得意ではない','どちらとも言えない','集中して取り組める','この種の分析業務が得意で楽しい']},
  {id:'B4',axis:'B',reversed:true,
   scenario:'複数部署が関わる新規事業について、スケジュールと役割分担を整理し、全体の進行を管理する。',
   options:['調整役はあまり向いていない','できなくはないが、得意ではない','どちらとも言えない','全体を動かす充実感がある','こういうコーディネートが得意']},
  {id:'C4',axis:'C',reversed:true,
   scenario:'福祉施設の運営が適切かどうか、書類と現場を照らし合わせながら監査し、不正を見抜いて是正させる。',
   options:['相手を追い詰めるようで気が引ける','あまり向いていないと思う','どちらとも言えない','公正さを守る仕事として納得できる','こういう監査・検査こそ自分の役割だと思う']},
  {id:'D4',axis:'D',reversed:true,
   scenario:'他の自治体では前例のない市民参加型の政策立案プロセスを設計し、試験導入の提案をまとめる。',
   options:['前例がないことは不安で気が進まない','あまり自信がない','どちらとも言えない','新しいものを生み出すおもしろさがある','ゼロから作る仕事がいちばん楽しい']},
  {id:'E4',axis:'E',reversed:true,
   scenario:'地域の健康診断を担当し、専門知識をもとに住民一人ひとりに合わせた健康指導を行う。',
   options:['専門知識で指導するのはプレッシャーに感じる','あまり自信がない','どちらとも言えない','専門を活かした指導に充実感がある','こういう専門職の役割が自分には最適']},
];

const ORDER=['A1','B1','C1','D1','E1','A2','B2','C2','D2','E2','A3','B3','C3','D3','E3','A4','B4','C4','D4','E4'];

const DIVISIONS=[
  // ── 市長室 ──
  {dept:'市長室',name:'秘書課',en:'Secretarial Division',A:1.5,B:-0.5,C:0.5,D:0.5,E:1.5},
  // Protocol, scheduling, VIP liaison — people-facing but behind the scenes, stable routine, generalist admin
  {dept:'市長室',name:'広報課',en:'Public Affairs Division',A:1,B:-1,C:0.5,D:-0.5,E:1},
  // Public messaging, media relations — citizen-facing outreach, planning content strategy, mild innovation
  {dept:'市長室',name:'危機管理課',en:'Crisis-Management Division',A:-0.5,B:0.5,C:-0.5,D:0.5,E:-1},
  // Disaster planning + emergency coordination — more systems/process than people, some fieldwork during crises, enforcement-adjacent (compliance), stable readiness, specialist knowledge
  {dept:'市長室',name:'人権・ダイバーシティ推進課',en:'Human Rights and Diversity Promotion Division',A:1,B:-1.5,C:1.5,D:-1,E:0.5},
  // Advocacy, awareness campaigns, policy drafting — people-oriented but heavy on planning, strongly supportive, reform-pushing, mostly generalist
  {dept:'市長室',name:'国際交流・基地政策課',en:'International Relations and Military Base Policy Division',A:0.5,B:-1.5,C:0.5,D:-0.5,E:-0.5},
  // Diplomatic coordination, base negotiations — moderate people contact, heavy planning/negotiation, mildly supportive, needs some specialist knowledge (international affairs, military policy)

  // ── 経営企画部 ──
  {dept:'経営企画部',name:'企画調整課',en:'Planning and Coordination Division',A:-1,B:-2,C:0,D:-1,E:0.5},
  // Cross-department coordination, master planning — systems-focused, pure planning, neutral support/regulation, innovative, generalist coordination
  {dept:'経営企画部',name:'都市戦略課',en:'City Strategy Division',A:-1.5,B:-2,C:0,D:-2,E:-1},
  // Long-range city vision, data analysis — deeply systems-focused, extreme planning, very innovative, needs analytical expertise
  {dept:'経営企画部',name:'事業用地課',en:'Commercial Land Division',A:-0.5,B:-0.5,C:-0.5,D:0.5,E:-1},
  // Land acquisition/disposition — some negotiation with landowners but primarily legal/process, mild fieldwork (site visits), slightly regulatory, routine transactions, real estate expertise

  {dept:'経営企画部',name:'デジタル・ガバメント推進室',en:'Digital Government Promotion Division',A:-1.5,B:-2,C:0,D:-2,E:-2},
  // Digital government transformation, IT systems modernization — systems-focused, pure planning, neutral, highly innovative, needs deep technical expertise

  // ── 環境政策担当部長 (経営企画部) ──
  {dept:'経営企画部',name:'環境政策・ゼロカーボン推進課',en:'Environmental Policy and Zero Carbon Division',A:-1,B:-2,C:0.5,D:-2,E:-1.5},
  // Environmental policy, carbon reduction targets — systems/data driven, pure planning, mildly supportive (protecting environment), highly innovative, needs technical/scientific knowledge
  {dept:'経営企画部',name:'自然環境課',en:'Natural Environment Division',A:0,B:-0.5,C:0.5,D:0.5,E:-1.5},
  // Conservation, nature protection, species surveys — balanced people contact, mix of fieldwork and desk, mildly supportive, stable operations (ongoing conservation), ecological expertise

  // ── 総務部 ──
  {dept:'総務部',name:'総務課',en:'General Affairs Division',A:-1,B:-0.5,C:0,D:0.5,E:2},
  // Internal admin: document management, council liaison, legal affairs — no citizen contact, mostly desk, neutral, stable routine, ultimate generalist
  {dept:'総務部',name:'人事課',en:'Personnel Division',A:0.5,B:-1,C:0.5,D:-0.5,E:0.5},
  // Hiring, evaluations, training — employee-facing (internal people), planning-oriented, somewhat supportive, mild innovation (HR reform), generalist
  {dept:'総務部',name:'会計課',en:'Accounting Division',A:-2,B:0,C:-0.5,D:1.5,E:-1},
  // Payment processing, financial controls — zero citizen contact, desk work, compliance/audit role, very stable routine, accounting expertise

  // ── 財務部 ──
  {dept:'財務部',name:'財務管理課',en:'Finance Administration Division',A:-2,B:-1,C:-0.5,D:1,E:-1.5},
  // Budget oversight, financial reporting — no people, desk planning, compliance-adjacent, stable, financial expertise
  {dept:'財務部',name:'財務課',en:'Finance Division',A:-1.5,B:-0.5,C:0,D:0.5,E:-1},
  // Budget compilation, appropriations — systems-focused, some planning + routine processing, neutral, moderately stable, finance knowledge
  {dept:'財務部',name:'FM推進課',en:'Facility Management Division',A:-1,B:-0.5,C:0,D:-0.5,E:-1},
  // Facility optimization, lifecycle planning — systems-focused, mix of planning and site assessment, neutral, somewhat innovative (reform), facility management expertise
  {dept:'財務部',name:'契約課',en:'Contract Division',A:-1,B:-0.5,C:-1,D:1,E:-1},
  // Procurement, bidding — systems/process, desk work, regulatory (ensuring fair process), very stable routine, legal/procurement expertise

  // ── 文化スポーツ観光部 ──
  {dept:'文化スポーツ観光部',name:'企画課',en:'Culture, Sports, and Tourism Planning Division',A:-0.5,B:-2,C:0.5,D:-1.5,E:0.5},
  // Strategic planning for culture/sports/tourism — less citizen contact, heavy planning, mildly supportive, innovative, generalist coordination
  {dept:'文化スポーツ観光部',name:'文化振興課',en:'Cultural Promotion Division',A:1,B:-1.5,C:1.5,D:-0.5,E:0.5},
  // Arts events, cultural programs — people-facing, more planning/coordination than execution, strongly supportive, slightly innovative, generalist
  {dept:'文化スポーツ観光部',name:'スポーツ振興課',en:'Sports Promotion Division',A:1,B:-0.5,C:1.5,D:0,E:1},
  // Sports events, facility coordination — people-facing, more execution/event operations than culture, supportive, balanced change, generalist
  {dept:'文化スポーツ観光部',name:'商業振興課',en:'Commerce Promotion Division',A:1,B:-1,C:1,D:-1,E:0.5},
  // Supporting local businesses — people-facing, planning programs, supportive, some innovation, mostly generalist
  {dept:'文化スポーツ観光部',name:'観光課',en:'Tourism Division',A:0.5,B:-1,C:0.5,D:-1,E:0.5},
  // Tourism promotion, destination marketing — moderate citizen contact (more B2B with operators), planning-heavy, mildly supportive, innovative, generalist
  {dept:'文化スポーツ観光部',name:'美術館運営課',en:'Museum of Art Management Division',A:0.5,B:0.5,C:1,D:0.5,E:-1.5},
  // Museum operations, exhibitions, curatorial work — some public contact, operational (running the museum day-to-day), supportive (cultural enrichment), stable, specialist (curatorial/art expertise)

  // ── 税務部 ──
  {dept:'税務部',name:'税制課',en:'Tax System Division',A:-2,B:-1.5,C:-1.5,D:1,E:-2},
  // Tax policy design, legal interpretation — zero people, planning, regulatory, stable (maintaining tax code), deep tax law expertise
  {dept:'税務部',name:'納税課',en:'Tax Collection Division',A:0.5,B:1,C:-1.5,D:1,E:-0.5},
  // Tax collection, delinquency visits — somewhat people-facing (visiting taxpayers), fieldwork, primarily enforcement, stable routine, moderate expertise
  {dept:'税務部',name:'市民税課',en:'Municipal Tax Division',A:0.5,B:0,C:-1,D:1.5,E:-1},
  // Municipal tax assessment, taxpayer inquiries — some window service, desk processing, regulatory, very stable, tax expertise
  {dept:'税務部',name:'資産税課',en:'Fixed Property Tax Division',A:-0.5,B:0.5,C:-1,D:1.5,E:-2},
  // Property valuation, assessment — limited people contact, some fieldwork (property inspection), regulatory, very stable, deep appraisal expertise

  // ── 福祉こども部 ──
  {dept:'福祉こども部',name:'福祉総務課',en:'Welfare General Affairs Division',A:0.5,B:-0.5,C:1,D:0.5,E:1},
  // Welfare department admin/coordination — moderate people contact (internal), desk/planning, supportive context, stable, generalist
  {dept:'福祉こども部',name:'地域福祉課',en:'Community-Based Welfare Division',A:2,B:0.5,C:2,D:0.5,E:0.5},
  // Community outreach, social welfare councils — highly people-facing, some fieldwork (home visits), very supportive, mostly stable, generalist
  {dept:'福祉こども部',name:'指導監査課',en:'Guidance and Inspection Division',A:-0.5,B:0.5,C:-2,D:1,E:-1},
  // Facility inspections, compliance audits — limited people contact, some fieldwork (site visits), enforcement, stable, specialist knowledge
  {dept:'福祉こども部',name:'障害福祉課',en:'Disability Welfare Division',A:2,B:0,C:2,D:0.5,E:-0.5},
  // Disability services, consultation — highly people-facing, desk-based casework, very supportive, mostly stable, some specialist knowledge (disability law)
  {dept:'福祉こども部',name:'生活支援課',en:'Livelihood Support Division',A:2,B:0.5,C:2,D:0.5,E:0.5},
  // Welfare benefits, life consultation — direct citizen interaction, some home visits, very supportive, stable, mostly generalist
  {dept:'福祉こども部',name:'介護保険課',en:'Nursing Insurance Division',A:1,B:0,C:1.5,D:1,E:-1},
  // Care insurance administration — people-facing (applicants), desk processing, supportive, stable, needs care insurance expertise
  {dept:'福祉こども部',name:'子育て支援課',en:'Childcare Support Division',A:2,B:0,C:2,D:0,E:0.5},
  // Childcare programs, parent support — highly people-facing, desk + outreach, very supportive, balanced change, mostly generalist

  // ── 地域支援部 ──
  {dept:'地域支援部',name:'市民生活課',en:'Civic Life Division',A:2,B:0.5,C:1,D:0.5,E:2},
  // Citizen consultations, consumer affairs — very people-facing, some fieldwork, supportive, mostly stable, broad generalist
  {dept:'地域支援部',name:'地域コミュニティ支援課',en:'Local Communities Support Division',A:2,B:0.5,C:2,D:0.5,E:1.5},
  // Community association support, neighborhood events — very people-facing, some fieldwork (attending local events), very supportive, mostly stable, generalist
  {dept:'地域支援部',name:'窓口サービス課',en:'Counter Service Division',A:2,B:1.5,C:1,D:2,E:2},
  // Resident registration, certificates — peak citizen interaction, frontline service, supportive, very stable routine, ultimate generalist

  // ── 健康部 ──
  {dept:'健康部',name:'健康総務課',en:'Health General Affairs Division',A:-0.5,B:-0.5,C:0.5,D:0.5,E:0.5},
  // Health department admin — limited citizen contact, desk work, mildly supportive context, stable, generalist admin
  {dept:'健康部',name:'市立病院課',en:'Municipal Hospital Division',A:-0.5,B:-0.5,C:0.5,D:0,E:-1},
  // Hospital administration (not clinical) — limited people contact, desk/planning, mildly supportive context, balanced, healthcare admin expertise
  {dept:'健康部',name:'健康増進課',en:'Health Promotion Division',A:1,B:-0.5,C:1.5,D:-0.5,E:-1},
  // Health programs, prevention campaigns — people-facing outreach, planning programs, supportive, somewhat innovative, health expertise
  {dept:'健康部',name:'健康管理支援課',en:'Health Management Support Division',A:1.5,B:0.5,C:2,D:0.5,E:-1.5},
  // Individual health guidance, screening follow-up — very people-facing, some fieldwork (home visits), very supportive, mostly stable, needs health professional expertise
  {dept:'健康部',name:'地域健康課',en:'Community Health Division',A:2,B:1,C:2,D:0.5,E:-2},
  // Community health nurses, home visits, vaccinations — very people-facing, heavy fieldwork, very supportive, mostly stable, requires nursing/health credentials
  {dept:'健康部',name:'健康保険課',en:'Health Insurance Division',A:0.5,B:0,C:0.5,D:1.5,E:-1},
  // Insurance enrollment, claims processing — some citizen window service, desk processing, mildly supportive, very stable, insurance expertise

  // ── 保健所 ──
  {dept:'保健所',name:'企画課',en:'Public Health Planning Division',A:-1.5,B:-2,C:-0.5,D:-1,E:-1.5},
  // Public health strategy, epidemiological data — no citizens, pure planning, slightly regulatory, innovative, specialist
  {dept:'保健所',name:'健康危機・感染症対策課',en:'Health Crisis and Infectious Disease Management Division',A:-0.5,B:0,C:-0.5,D:-0.5,E:-2},
  // Infectious disease surveillance, outbreak response — limited routine people contact, mix of desk and emergency deployment, somewhat regulatory (quarantine), needs innovation (new threats), deep epidemiological expertise
  {dept:'保健所',name:'保健予防課',en:'Health Protection Division',A:1,B:0.5,C:1,D:0.5,E:-2},
  // Vaccinations, mental health support, TB screening — people-facing, some fieldwork, supportive, mostly stable, requires medical expertise
  {dept:'保健所',name:'生活衛生課',en:'Sanitary Affairs Division',A:-0.5,B:1,C:-1.5,D:1,E:-1.5},
  // Food/facility inspections, sanitation enforcement — limited people rapport (inspector role), heavy fieldwork, enforcement, stable routine, specialist knowledge

  // ── こども家庭支援センター ──
  {dept:'こども家庭支援センター',name:'こども家庭支援課',en:'Child and Family Support Division',A:2,B:0.5,C:2,D:0,E:-1},
  // Family casework, child welfare — very people-facing, some home visits, very supportive, balanced, some specialist knowledge
  {dept:'こども家庭支援センター',name:'こども給付課',en:'Child Allowance Division',A:1,B:0,C:1.5,D:1,E:0},
  // Child allowance processing — people-facing (applicants), desk processing, supportive, stable routine, balanced knowledge
  {dept:'こども家庭支援センター',name:'児童相談課',en:"Children's Guidance Division",A:2,B:1,C:2,D:-0.5,E:-2},
  // Child abuse investigation, counseling — very people-facing, fieldwork (home visits, investigations), very supportive, some innovation needed (case strategies), deep specialist expertise (child psychology, law)

  // ── 資源循環部 ──
  {dept:'資源循環部',name:'資源循環企画課',en:'Resource Recycling Planning Division',A:-1,B:-2,C:0,D:-1.5,E:-1},
  // Waste reduction strategy, recycling policy — no citizens, pure planning, neutral, innovative, environmental expertise
  {dept:'資源循環部',name:'大気・水質対策課',en:'Air and Water Quality Management Division',A:-1,B:0.5,C:-1.5,D:0.5,E:-2},
  // Environmental monitoring, pollution enforcement — limited people contact, fieldwork (sampling), regulatory, mostly stable, deep scientific expertise
  {dept:'資源循環部',name:'廃棄物対策課',en:'Waste Management Division',A:-0.5,B:0.5,C:-1,D:0.5,E:-1},
  // Illegal dumping enforcement, waste permits — limited people contact, some fieldwork, regulatory, mostly stable, specialist knowledge
  {dept:'資源循環部',name:'施設管理課',en:'Environmental Facility Management Division',A:-1.5,B:1.5,C:0,D:2,E:-1.5},
  // Incinerator/recycling plant operations — no citizens, heavy operational/maintenance work, neutral, very stable routine, technical expertise

  // ── 経済部 ──
  {dept:'経済部',name:'経済企画課',en:'Economic Planning Division',A:-1,B:-2,C:0.5,D:-1.5,E:-0.5},
  // Economic strategy, data analysis — no citizens, pure planning, mildly supportive (economic growth), innovative, mostly generalist
  {dept:'経済部',name:'企業誘致・工業振興課',en:'Business Attraction and Industrial Promotion Division',A:1,B:-1,C:0.5,D:-1.5,E:-0.5},
  // Business recruitment, industrial support — people-facing (companies), planning-oriented, mildly supportive, innovative, some expertise needed
  {dept:'経済部',name:'創業・新産業支援課',en:'Business Startup and New Industries Support Division',A:1.5,B:-1.5,C:1.5,D:-2,E:0},
  // Startup incubation, innovation programs — very people-facing (entrepreneurs), planning/strategy, very supportive, highly innovative, balanced knowledge
  {dept:'経済部',name:'農水産業振興課',en:'Agriculture and Fisheries Promotion Division',A:1,B:0,C:1,D:0.5,E:-1},
  // Farmer/fisher support, agricultural policy — people-facing, mix of desk and field visits, supportive, mostly stable, agricultural expertise

  // ── 都市部 ──
  {dept:'都市部',name:'都市計画課',en:'City Planning Division',A:-1.5,B:-2,C:0,D:-1.5,E:-2},
  // Zoning, land use planning — no citizens, extreme planning, neutral, innovative, deep urban planning expertise
  {dept:'都市部',name:'まちなみ景観課',en:'Townscape Division',A:-0.5,B:-1,C:-0.5,D:-0.5,E:-1.5},
  // Landscape/design regulations, scenic preservation — limited people contact, planning-oriented, slightly regulatory, somewhat innovative, design expertise
  {dept:'都市部',name:'市営住宅課',en:'Municipal Housing Division',A:1.5,B:0.5,C:1,D:1,E:0},
  // Public housing management, tenant services — people-facing (tenants), some site work, supportive, stable routine, balanced knowledge
  {dept:'都市部',name:'建築計画課',en:'Construction Planning Division',A:-1.5,B:-1.5,C:-0.5,D:-1,E:-2},
  // Building code development, structural standards — no citizens, planning, slightly regulatory, somewhat innovative, deep architectural/engineering expertise
  {dept:'都市部',name:'宅地審査防災課',en:'Housing Site Inspection and Disaster Prevention Division',A:-0.5,B:0.5,C:-1.5,D:1,E:-2},
  // Site inspections, disaster zoning, permit review — limited people contact, some fieldwork, enforcement, stable, deep technical expertise
  {dept:'都市部',name:'建築指導課',en:'Building Guidance Division',A:0,B:1,C:-2,D:1,E:-2},
  // Building inspections, code enforcement — some contact (builders/owners), heavy fieldwork, strong enforcement, stable, deep building expertise

  // ── 建設部 ──
  {dept:'建設部',name:'土木用地課',en:'Public Works Land Division',A:-0.5,B:0,C:-0.5,D:0.5,E:-1.5},
  // Land acquisition for public works — some negotiation with landowners, desk + site visits, slightly regulatory, mostly stable, surveying/legal expertise
  {dept:'建設部',name:'道路整備課',en:'Road Construction and Improvement Division',A:-1.5,B:0.5,C:0,D:-1,E:-2},
  // Road design and construction projects — no citizens, some site supervision, neutral, innovative (new construction), deep civil engineering expertise
  {dept:'建設部',name:'道路維持課',en:'Road Maintenance Division',A:-1,B:2,C:0,D:2,E:-1.5},
  // Pothole repair, road surface maintenance — minimal citizen contact, extreme fieldwork, neutral, very stable routine, technical maintenance expertise
  {dept:'建設部',name:'公園緑地課',en:'Parks and Green Spaces Division',A:0.5,B:0.5,C:1,D:0.5,E:-0.5},
  // Park design, green space maintenance — some citizen contact (events, complaints), mix of field and desk, supportive (public amenity), mostly stable, some landscape expertise

  // ── 港湾部 ──
  {dept:'港湾部',name:'港湾企画課',en:'Port Planning Division',A:-1.5,B:-2,C:0,D:-1.5,E:-2},
  // Port development strategy — no citizens, extreme planning, neutral, innovative, deep maritime/port engineering expertise
  {dept:'港湾部',name:'港湾管理課',en:'Port Administration Division',A:-0.5,B:0.5,C:-1,D:1,E:-1.5},
  // Port operations, user permits, safety — limited people contact, operational, regulatory, stable routine, port management expertise
  {dept:'港湾部',name:'港湾整備課',en:'Port Construction and Maintenance Division',A:-1.5,B:1.5,C:0,D:0.5,E:-2},
  // Port construction, facility maintenance — no citizens, heavy fieldwork, neutral, mix of new projects and maintenance, deep engineering expertise

  // ── 上下水道局 経営部 ──
  {dept:'上下水道局 経営部',name:'総務課',en:'General Affairs Division (Water/Sewerage)',A:-0.5,B:-0.5,C:0,D:1,E:1},
  // Water utility admin — limited contact, desk, neutral, stable, generalist (but in utility context)
  {dept:'上下水道局 経営部',name:'経営料金課',en:'Management and Fees Division',A:0.5,B:-0.5,C:0,D:1,E:-0.5},
  // Rate setting, billing inquiries — some citizen contact (billing complaints), planning, neutral, stable, some expertise
  {dept:'上下水道局 経営部',name:'経理課',en:'Accounting Division (Water/Sewerage)',A:-2,B:0,C:0,D:1.5,E:-1},
  // Utility accounting — no citizens, desk, neutral, very stable, accounting expertise
  {dept:'上下水道局 経営部',name:'用地管理課',en:'Land Administration Division',A:-1,B:0,C:-0.5,D:1,E:-1},
  // Utility land/easement management — no citizens, desk + some site work, slightly regulatory, stable, property expertise

  // ── 上下水道局 技術部 ──
  {dept:'上下水道局 技術部',name:'計画課',en:'Engineering Planning Division',A:-2,B:-1.5,C:0,D:-1,E:-2},
  // Water/sewer infrastructure planning — no citizens, heavy planning, neutral, somewhat innovative, deep engineering expertise
  {dept:'上下水道局 技術部',name:'給排水課',en:'Water Supply and Sewerage Service Division',A:0.5,B:1,C:0.5,D:1,E:-1.5},
  // Water connection services, customer requests — some citizen contact, operational fieldwork, mildly supportive, stable, technical expertise
  {dept:'上下水道局 技術部',name:'水道管路課',en:'Waterworks Pipeline Division',A:-2,B:2,C:0,D:1.5,E:-2},
  // Pipeline construction/repair — no citizens, extreme fieldwork, neutral, mostly maintenance, deep pipe/civil expertise
  {dept:'上下水道局 技術部',name:'水道施設課',en:'Waterworks Facilities Division',A:-2,B:1.5,C:0,D:1.5,E:-2},
  // Water treatment plant operations — no citizens, heavy operational, neutral, very stable, deep water treatment expertise
  {dept:'上下水道局 技術部',name:'浄水課',en:'Water Purification Division',A:-2,B:1.5,C:0,D:2,E:-2},
  // Purification plant daily operations — no citizens, operational, neutral, extremely stable routine, deep water chemistry expertise
  {dept:'上下水道局 技術部',name:'下水道管渠課',en:'Sewerage Pipeline and Drains Division',A:-2,B:2,C:0,D:1.5,E:-2},
  // Sewer line construction/maintenance — no citizens, extreme fieldwork, neutral, mostly maintenance, deep civil expertise
  {dept:'上下水道局 技術部',name:'水再生課',en:'Sewage Recycling Division',A:-2,B:1,C:0,D:-0.5,E:-2},
  // Sewage treatment, water reuse research — no citizens, operational, neutral, somewhat innovative (new recycling tech), deep environmental engineering expertise

  // ── 消防局 ──
  {dept:'消防局',name:'総務課',en:'General Affairs Division (Fire Dept.)',A:-0.5,B:-0.5,C:0.5,D:1,E:1},
  // Fire dept admin — supports firefighters (slightly more mission-connected than typical admin), desk work, mildly supportive, stable, generalist
  {dept:'消防局',name:'予防課',en:'Fire Prevention Division',A:-0.5,B:0.5,C:-1.5,D:1,E:-2},
  // Fire safety inspections, code enforcement — limited people rapport, fieldwork (inspections), strong enforcement, stable, deep fire safety expertise
  {dept:'消防局',name:'警防課',en:'Fire Suppression Division',A:0.5,B:2,C:1.5,D:1.5,E:-2},
  // Active firefighting, rescue — some citizen interaction at scenes, extreme fieldwork, supportive (saving lives), stable operations (readiness), deep specialist training
  {dept:'消防局',name:'救急課',en:'Emergency Medical Services Division',A:2,B:2,C:2,D:1.5,E:-2},
  // Paramedics, ambulance response — intense citizen interaction, extreme fieldwork, very supportive, stable operations, requires medical credentials
  {dept:'消防局',name:'指令課',en:'Command and Control Division',A:0.5,B:-0.5,C:0.5,D:1.5,E:-1.5},
  // Dispatch center — some citizen contact (callers), NOT fieldwork (control room), mildly supportive, very stable operations, specialist training (dispatch protocols)

  // ── 教育総務部 ──
  {dept:'教育総務部',name:'総務課',en:'General Affairs Division (Education)',A:-0.5,B:-0.5,C:0.5,D:1,E:1},
  // Education dept admin — supports schools (mildly mission-connected), desk, mildly supportive, stable, generalist
  {dept:'教育総務部',name:'教育政策課',en:'Education Policy Division',A:-1,B:-2,C:0.5,D:-1.5,E:-1},
  // Education strategy, curriculum policy — no citizens, pure planning, mildly supportive (education improvement), innovative, education expertise
  {dept:'教育総務部',name:'教育環境整備課',en:'Education Facilities Management Division',A:-1.5,B:0.5,C:0,D:1,E:-1.5},
  // School building maintenance, renovation — no citizens, operational/site work, neutral, stable, facility/construction expertise
  {dept:'教育総務部',name:'生涯学習課',en:'Lifelong Learning Division',A:1.5,B:-0.5,C:1.5,D:-0.5,E:0.5},
  // Community education programs, learning events — very people-facing, planning programs, supportive, somewhat innovative, generalist
  {dept:'教育総務部',name:'教職員課',en:'Educational Personnel Division',A:0.5,B:-0.5,C:0.5,D:0.5,E:0},
  // Teacher hiring, assignments, labor relations — internal people-facing (teachers), desk/planning, mildly supportive, mostly stable, balanced knowledge
  {dept:'教育総務部',name:'学校管理課',en:'School Facilities Division',A:-1,B:0.5,C:0,D:1.5,E:-1},
  // School equipment, safety inspections — no citizens, operational, neutral, very stable, facility expertise
  {dept:'教育総務部',name:'博物館運営課',en:'Museum Management Division',A:0.5,B:0.5,C:1,D:0.5,E:-1},
  // Museum operations, exhibits — some public contact, operational, supportive (education/culture), mostly stable, curatorial expertise

  // ── 学校教育部 ──
  {dept:'学校教育部',name:'教育指導課',en:'Education Guidance Division',A:1,B:-1,C:1,D:-0.5,E:-1.5},
  // Curriculum guidance, teacher training — people-facing (teachers/schools), planning, supportive, somewhat innovative, education expertise
  {dept:'学校教育部',name:'支援教育課',en:'Education Support Division',A:2,B:0.5,C:2,D:0,E:-1.5},
  // Special needs education, individual support — very people-facing, some school visits, very supportive, balanced, specialist (special education)
  {dept:'学校教育部',name:'保健体育課',en:'Health and Physical Education Division',A:1,B:0,C:1,D:0.5,E:-1},
  // School health/PE programs, safety — people-facing (schools), balanced work style, supportive, mostly stable, health/PE expertise
  {dept:'学校教育部',name:'学校食育課',en:'School Lunch and Nutrition Education Division',A:0.5,B:0,C:1,D:0.5,E:-1.5},
  // School lunch programs, nutrition education — moderate people contact, operational + planning, supportive, mostly stable, nutrition/food safety expertise

  // ── 選挙管理委員会 ──
  {dept:'選挙管理委員会',name:'選挙管理課',en:'Election Administration Division',A:0.5,B:1,C:-0.5,D:2,E:0.5},
  // Election operations — moderate citizen contact (polling stations), heavy operational (election day fieldwork), slightly regulatory (election law compliance), extremely stable (fixed procedures), mostly generalist

  // ── 監査委員事務局 ──
  {dept:'監査委員事務局',name:'監査課',en:'Audit and Inspection Division',A:-1.5,B:0,C:-2,D:1,E:-1},
  // Financial/operational audits — no citizens, desk analysis, strong enforcement, stable, audit/accounting expertise

  // ── 議会事務局 ──
  {dept:'議会事務局',name:'総務調査課',en:'General Affairs and Investigation Division',A:-0.5,B:-0.5,C:-0.5,D:0.5,E:0.5},
  // Council research, legislative support — limited people contact, desk/research, slightly regulatory, mostly stable, somewhat generalist
  {dept:'議会事務局',name:'議事課',en:'Proceedings Division',A:-0.5,B:0.5,C:0,D:1.5,E:0.5},
  // Council session management, minutes — limited people contact, operational (running sessions), neutral, very stable routine, mostly generalist
];
