// Comprehensive Catalog of All Types of Legal Cases for Portal Matching & Filing
export const CASE_CATALOG = [
  {
    group: 'Property & Real Estate Disputes',
    cases: [
      {
        title: 'Ancestral Property Partition Suit',
        category: 'Property Law & Land Partition',
        desc: 'Lawsuit seeking legal declaration of share, metes and bounds survey demarcation, and separate possession of ancestral agricultural land and residential property.'
      },
      {
        title: 'Land Boundary, Encroachment & Injunction Suit',
        category: 'Property Law & Land Partition',
        desc: 'Civil suit for declaration of title, revenue survey demarcation, and permanent injunction restraining neighboring encroachment on registered land.'
      },
      {
        title: 'Patta Transfer, Chitta & Revenue Mutation Dispute',
        category: 'Revenue & Agricultural Land Law',
        desc: 'Challenging illegal patta cancellation or wrongful revenue registry mutation before the Tahsildar / Revenue Divisional Officer.'
      },
      {
        title: 'Declaration of Ownership Title & Possession',
        category: 'Property Law & Land Partition',
        desc: 'Civil lawsuit for declaration of absolute title, cancellation of fraudulent registered sale deeds, and recovery of lawful possession.'
      },
      {
        title: 'Landlord-Tenant Eviction & Rent Arrears Dispute',
        category: 'Civil & Contract Law',
        desc: 'Eviction petition regarding non-payment of lease rent, statutory notice expiry, and recovery of commercial/residential premises.'
      }
    ]
  },
  {
    group: 'Criminal Law & Bail Petitions',
    cases: [
      {
        title: 'Anticipatory Bail Application (Sec 438 CrPC)',
        category: 'Criminal Law',
        desc: 'Urgent petition before Principal Sessions Court / High Court seeking pre-arrest protection and bail against false police complaint.'
      },
      {
        title: 'Regular Court Bail Petition (Sec 437/439 CrPC)',
        category: 'Criminal Law',
        desc: 'Bail petition seeking immediate release from judicial custody following arrest under criminal charges.'
      },
      {
        title: 'Criminal Defamation & Harassment Complaint',
        category: 'Criminal Law',
        desc: 'Filing private criminal complaint for intentional insult, reputational harm, and public defamation.'
      }
    ]
  },
  {
    group: 'Family & Matrimonial Law',
    cases: [
      {
        title: 'Mutual Consent Divorce Petition (Sec 13B)',
        category: 'Family & Matrimonial Law',
        desc: 'Filing joint petition for dissolution of marriage by mutual consent under Section 13B of the Hindu Marriage Act with settlement on alimony, custody, and return of marriage articles.'
      },
      {
        title: 'Contested Divorce & Marital Dissolution',
        category: 'Family & Matrimonial Law',
        desc: 'Petition for dissolution of marriage on grounds of cruelty, desertion, or non-cohabitation before the Family Court.'
      },
      {
        title: 'Child Custody & Legal Guardianship',
        category: 'Family & Matrimonial Law',
        desc: 'Petition seeking physical custody, legal guardianship, and reasonable visitation schedule for minor children.'
      },
      {
        title: 'Domestic Violence & Protection Order (DV Act)',
        category: 'Family & Matrimonial Law',
        desc: 'Urgent petition seeking protection orders, right of residence, and interim maintenance under Protection of Women from Domestic Violence Act.'
      },
      {
        title: 'Maintenance & Interim Alimony (Sec 125 CrPC)',
        category: 'Family & Matrimonial Law',
        desc: 'Statutory petition for monthly maintenance and litigation expenses for wife and minor children.'
      }
    ]
  },
  {
    group: 'Commercial, Financial & Banking',
    cases: [
      {
        title: 'Cheque Bounce Criminal Complaint (Sec 138 NI Act)',
        category: 'Negotiable Instruments & Cheque Bounce',
        desc: 'Statutory legal demand notice and criminal complaint for dishonour of cheque due to insufficient funds.'
      },
      {
        title: 'Breach of Commercial Contract & Damages Suit',
        category: 'Civil & Contract Law',
        desc: 'Civil lawsuit for non-performance of agreement terms, failure to deliver services, and recovery of contractual liquidated damages.'
      },
      {
        title: 'Loan Recovery, Promissory Note & Summary Suit',
        category: 'Commercial & Banking Litigation',
        desc: 'Summary suit under Order 37 CPC for recovery of debt based on dishonored promissory notes or written agreements.'
      },
      {
        title: 'Online Banking, Phishing & UPI Fraud Complaint',
        category: 'Cyber Crime & Financial Fraud',
        desc: 'Complaint before Cyber Crime Police for unauthorized bank debits, online phishing scam, and recovery of stolen funds.'
      }
    ]
  },
  {
    group: 'Motor Accident & Consumer Protection',
    cases: [
      {
        title: 'Motor Accident Compensation Claim (MACT)',
        category: 'Motor Accident Claims & Insurance',
        desc: 'Compensation claim petition before Motor Accident Claims Tribunal for vehicular injury, medical expenses, or fatal accident.'
      },
      {
        title: 'Consumer Protection Complaint for Defective Service',
        category: 'Constitutional & Consumer Rights',
        desc: 'Consumer complaint before District Consumer Disputes Redressal Commission seeking refund, compensation for mental agony, and costs.'
      },
      {
        title: 'Labour Dispute & Unlawful Termination',
        category: 'Labour & Industrial Disputes',
        desc: 'Industrial dispute petition regarding wrongful employment termination, unpaid back wages, gratuity, and statutory severance.'
      }
    ]
  }
];

export const QUICK_CASE_CHIPS = [
  { label: '💍 Mutual Divorce', title: 'Mutual Consent Divorce Petition (Sec 13B)', category: 'Family & Matrimonial Law', desc: 'Filing joint petition for dissolution of marriage by mutual consent under Section 13B with agreed terms on alimony, child custody, and return of marriage articles.' },
  { label: '🏡 Land Partition', title: 'Ancestral Property Partition Suit', category: 'Property Law & Land Partition', desc: 'Lawsuit seeking legal declaration of share, metes and bounds survey demarcation, and separate possession of ancestral land and property.' },
  { label: '⚖️ Criminal Bail', title: 'Anticipatory Bail Application (Sec 438 CrPC)', category: 'Criminal Law', desc: 'Urgent petition before Principal Sessions Court / High Court seeking pre-arrest protection and bail against police complaint.' },
  { label: '💳 Cheque Bounce (138)', title: 'Cheque Bounce Criminal Complaint (Sec 138 NI Act)', category: 'Negotiable Instruments & Cheque Bounce', desc: 'Statutory legal demand notice and criminal complaint for dishonour of cheque due to insufficient funds.' },
  { label: '🚗 Accident Claim (MACT)', title: 'Motor Accident Compensation Claim (MACT)', category: 'Motor Accident Claims & Insurance', desc: 'Compensation claim petition before Motor Accident Claims Tribunal for vehicular injury, medical expenses, or fatal accident.' },
  { label: '🌾 Patta & Revenue', title: 'Patta Transfer, Chitta & Revenue Mutation Dispute', category: 'Revenue & Agricultural Land Law', desc: 'Challenging illegal patta cancellation or wrongful revenue registry mutation before the Tahsildar / Revenue Divisional Officer.' },
  { label: '📜 Contract Breach', title: 'Breach of Commercial Contract & Damages Suit', category: 'Civil & Contract Law', desc: 'Civil lawsuit for non-performance of agreement terms, failure to deliver services, and recovery of contractual liquidated damages.' },
  { label: '🛡️ Consumer Dispute', title: 'Consumer Protection Complaint for Defective Service', category: 'Constitutional & Consumer Rights', desc: 'Consumer complaint before District Consumer Disputes Redressal Commission seeking refund, compensation for mental agony, and costs.' },
  { label: '💻 Cyber Fraud', title: 'Online Banking, Phishing & UPI Fraud Complaint', category: 'Cyber Crime & Financial Fraud', desc: 'Complaint before Cyber Crime Police for unauthorized bank debits, online phishing scam, and recovery of stolen funds.' },
  { label: '💼 Job Dispute', title: 'Labour Dispute & Unlawful Termination', category: 'Labour & Industrial Disputes', desc: 'Industrial dispute petition regarding wrongful employment termination, unpaid back wages, and statutory gratuity.' }
];
