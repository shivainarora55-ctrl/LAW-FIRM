// PLACEHOLDER CONTENT: the lawyer must verify acts and penalties before publishing.

export const EXPERTISE = [
  {
    slug: "criminal-defence",
    title: "Criminal Defence",
    summary: "Representation from FIR and arrest to bail, trial and appeal.",
    problems: [
      "A false or exaggerated FIR registered against you",
      "Arrest and police custody",
      "Need for anticipatory or regular bail",
    ],
    solutions: [
      "Legal review of the FIR and quashing petitions where grounds exist",
      "Anticipatory bail and regular bail applications",
      "Evidence-based defence at trial and appeals in higher courts",
    ],
    acts: [
      "Bharatiya Nyaya Sanhita, 2023 (offences and punishments)",
      "Bharatiya Nagarik Suraksha Sanhita, 2023 (arrest, bail and trial procedure)",
      "Bharatiya Sakshya Adhiniyam, 2023 (evidence)",
    ],
    punishment: [
      "Depends on the offence: from fine to imprisonment, and up to life imprisonment or death for the gravest offences",
      "Many serious offences are non-bailable, so timely legal help is important",
    ],
  },
  {
    slug: "cheque-bounce",
    title: "Cheque Bounce",
    summary: "Notice, complaint and defence in dishonoured cheque cases.",
    problems: [
      "Cheque returned unpaid for insufficient funds or other reasons",
      "Debtor ignoring the legal notice",
      "Receiving a notice or summons as the cheque issuer",
    ],
    solutions: [
      "Send a legal demand notice within 30 days of the bank's return memo",
      "File the complaint within one month after the 15-day payment period ends",
      "Settlement and compounding where both parties agree, or a defence on legal and procedural grounds",
    ],
    acts: ["Negotiable Instruments Act, 1881 (Sections 138 to 147)"],
    punishment: [
      "Imprisonment up to 2 years, or fine up to twice the cheque amount, or both (Section 138)",
    ],
  },
  {
    slug: "property-disputes",
    title: "Property Disputes",
    summary: "Title, possession, partition and documentation disputes.",
    problems: [
      "Illegal possession or encroachment",
      "Disputed title or forged documents",
      "Partition disputes among family members or builder defaults",
    ],
    solutions: [
      "Title verification and due diligence before purchase",
      "Suits for declaration, possession, partition or injunction",
      "Specific performance of agreements to sell, and criminal complaints where forgery or cheating is involved",
    ],
    acts: [
      "Transfer of Property Act, 1882",
      "Registration Act, 1908",
      "Specific Relief Act, 1963",
      "Real Estate (Regulation and Development) Act, 2016",
    ],
    punishment: [
      "Mostly civil remedies: possession, injunction, damages and specific performance",
      "Forgery and cheating in property deals can attract criminal punishment under the Bharatiya Nyaya Sanhita, 2023",
    ],
  },
  {
    slug: "family-matrimonial",
    title: "Family & Matrimonial",
    summary: "Divorce, maintenance, custody and domestic violence matters.",
    problems: [
      "Divorce, by mutual consent or contested",
      "Maintenance, alimony and child custody",
      "Domestic violence and dowry harassment",
    ],
    solutions: [
      "Mutual-consent and contested divorce petitions",
      "Maintenance and custody petitions focused on the child's welfare",
      "Protection and residence orders for victims of domestic violence",
    ],
    acts: [
      "Hindu Marriage Act, 1955",
      "Special Marriage Act, 1954",
      "Protection of Women from Domestic Violence Act, 2005",
      "Guardians and Wards Act, 1890",
      "Other personal laws apply depending on the parties' religion",
    ],
    punishment: [
      "Breach of a protection order under the Domestic Violence Act: imprisonment up to 1 year, or fine up to ₹20,000, or both",
      "Cruelty and dowry-related offences are punishable under the Bharatiya Nyaya Sanhita, 2023",
    ],
  },
  {
    slug: "consumer-protection",
    title: "Consumer Protection",
    summary: "Complaints against defective goods, deficient services and unfair practices.",
    problems: [
      "Defective products or refused refunds",
      "Deficient service by banks, insurers, builders or hospitals",
      "Misleading advertisements and unfair contracts",
    ],
    solutions: [
      "Legal notice, then a complaint before the District, State or National Commission depending on claim value",
      "Claims for refund, replacement, compensation and costs",
      "Online filing is available for consumer complaints",
    ],
    acts: ["Consumer Protection Act, 2019"],
    punishment: [
      "Non-compliance with a Commission's order: imprisonment from 1 month up to 3 years, or fine from ₹25,000 up to ₹1 lakh, or both (Section 72)",
    ],
  },
  {
    slug: "cyber-crime",
    title: "Cyber Crime",
    summary: "Online fraud, identity theft, harassment and data misuse.",
    problems: [
      "UPI, card and online banking fraud",
      "Identity theft and fake profiles",
      "Online harassment, blackmail and hacking",
    ],
    solutions: [
      "Report immediately on the National Cyber Crime Reporting Portal or helpline 1930 for financial fraud",
      "FIR, evidence preservation and follow-up with the cyber cell",
      "Bank and platform takedown requests, and defence for persons wrongly accused",
    ],
    acts: [
      "Information Technology Act, 2000",
      "Bharatiya Nyaya Sanhita, 2023",
      "Digital Personal Data Protection Act, 2023",
    ],
    punishment: [
      "Identity theft (Section 66C) and cheating by personation using a computer (Section 66D): imprisonment up to 3 years and fine up to ₹1 lakh each",
      "Other offences carry different terms depending on the section",
    ],
  },
  {
    slug: "motor-accident-claims",
    title: "Motor Accident Claims",
    summary: "Compensation claims and defence in road accident cases.",
    problems: [
      "Injury or death in a road accident",
      "Insurance company delaying or rejecting a claim",
      "Hit-and-run cases and traffic prosecutions",
    ],
    solutions: [
      "Claim petition before the Motor Accident Claims Tribunal",
      "Collecting the FIR, medical records and income proof",
      "Appeals against low compensation, and defence in traffic prosecutions",
    ],
    acts: ["Motor Vehicles Act, 1988 (as amended in 2019)"],
    punishment: [
      "Drunk driving (Section 185): imprisonment up to 6 months, or fine up to ₹10,000, or both for a first offence; higher on repeat offences",
      "Death caused by negligence is punishable under the Bharatiya Nyaya Sanhita, 2023",
    ],
  },
  {
    slug: "intellectual-property",
    title: "Intellectual Property",
    summary: "Trademark, copyright and patent registration and enforcement.",
    problems: [
      "Someone copying your brand, content or design",
      "Need to register a trademark or copyright",
      "Receiving an infringement notice",
    ],
    solutions: [
      "Trademark and copyright registration",
      "Cease-and-desist notices and infringement suits with injunctions",
      "Defence against infringement claims, plus licensing and assignment agreements",
    ],
    acts: ["Trade Marks Act, 1999", "Copyright Act, 1957", "Patents Act, 1970"],
    punishment: [
      "Criminal copyright infringement or applying a false trademark: imprisonment from 6 months up to 3 years and fine from ₹50,000 up to ₹2 lakh (Copyright Act Section 63, Trade Marks Act Section 103)",
      "Civil remedies include injunction, damages and an account of profits",
    ],
  },
  {
    slug: "gst-taxation",
    title: "GST & Taxation",
    summary: "Notices, assessments, appeals and compliance for GST and income tax.",
    problems: [
      "Show-cause notices and demand orders",
      "Input tax credit disputes",
      "Income tax notices, assessments, refunds and registration issues",
    ],
    solutions: [
      "Replies to notices with supporting documents",
      "Appeals before the appellate authority and the Tribunal",
      "Representation in audits and investigations, plus compliance advice",
    ],
    acts: [
      "Central Goods and Services Tax Act, 2017",
      "Income-tax Act, 2025 (and the Income-tax Act, 1961 for earlier years)",
    ],
    punishment: [
      "Interest and penalties for non-compliance",
      "Serious GST offences such as fraudulent input tax credit above ₹5 crore: imprisonment up to 5 years and fine (Section 132, CGST Act)",
    ],
  },
  {
    slug: "commercial-arbitration",
    title: "Commercial & Arbitration",
    summary: "Contract disputes, recovery suits and arbitration.",
    problems: [
      "Breach of contract or non-payment",
      "Partner or shareholder disputes",
      "Recovery of dues from customers or vendors",
    ],
    solutions: [
      "Legal notice and negotiated settlement, including pre-litigation mediation",
      "Commercial suits and summary judgment applications",
      "Arbitration proceedings and challenges to awards",
    ],
    acts: [
      "Indian Contract Act, 1872",
      "Arbitration and Conciliation Act, 1996",
      "Commercial Courts Act, 2015",
      "Companies Act, 2013",
    ],
    punishment: [
      "Mostly civil: damages, specific performance and recovery with interest",
      "Fraud under the Companies Act, 2013 (Section 447): imprisonment from 6 months up to 10 years and a fine",
    ],
  },
  {
    slug: "banking-debt-recovery",
    title: "Banking & Debt Recovery",
    summary: "Loan recovery, SARFAESI action and Debt Recovery Tribunal cases.",
    problems: [
      "Bank issuing a recovery or possession notice",
      "Loan default and settlement",
      "Disputed charges or wrongful classification as a non-performing asset",
    ],
    solutions: [
      "Reply to demand notices and file securitisation applications before the Debt Recovery Tribunal",
      "One-time settlement negotiations",
      "Recovery applications for lenders, and defence for guarantors and co-borrowers",
    ],
    acts: [
      "Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002",
      "Recovery of Debts and Bankruptcy Act, 1993",
      "Insolvency and Bankruptcy Code, 2016",
    ],
    punishment: [
      "Mainly civil and recovery proceedings",
      "Contravening the SARFAESI Act or its rules: imprisonment up to 1 year, or fine, or both (Section 29)",
    ],
  },
  {
    slug: "tenancy-rent-disputes",
    title: "Tenancy & Rent Disputes",
    summary: "Eviction, rent recovery and rental agreements.",
    problems: [
      "Tenant not paying rent or refusing to vacate",
      "Illegal eviction or unfair rent increases",
      "Unregistered or unclear rental agreements",
    ],
    solutions: [
      "Drafting and registering rental agreements",
      "Notice to quit and eviction petitions, and recovery of rent arrears",
      "Defence for tenants against wrongful eviction",
    ],
    acts: [
      "Transfer of Property Act, 1882 (Section 106, notice to terminate tenancy)",
      "Applicable state rent control law",
      "Model Tenancy Act, 2021 (adopted by states in their own form)",
    ],
    punishment: [
      "Primarily civil: eviction, arrears and damages",
      "Forcible dispossession or criminal trespass can attract criminal action under the Bharatiya Nyaya Sanhita, 2023",
    ],
  },
];

export const getExpertise = (slug) => EXPERTISE.find((item) => item.slug === slug);
