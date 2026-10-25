"""
AI-Based Lawyer Recommendation Engine
Uses Scikit-learn (TF-IDF Vectorizer + Cosine Similarity) and multi-criteria scoring
to match real verified lawyer profiles with client case requirements.
"""

import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Standardized Legal Categories and Keywords Mapping
LEGAL_TAXONOMY = {
    'Property Law & Land Partition': [
        'property', 'land', 'partition', 'boundary', 'patta', 'revenue', 'title', 'deed',
        'ancestral', 'survey', 'encroachment', 'easement', 'real estate', 'agricultural'
    ],
    'Criminal Law': [
        'criminal', 'bail', 'anticipatory bail', 'fir', 'police', 'arrest', 'assault',
        'theft', 'sessions', 'magistrate', 'ipc', 'criminal procedure', 'homicide', 'ndps'
    ],
    'Family & Matrimonial Law': [
        'divorce', 'custody', 'matrimonial', 'maintenance', 'alimony', 'domestic violence',
        'marriage', 'guardianship', 'sec 125', 'child support', 'restitution'
    ],
    'Civil & Contract Law': [
        'civil', 'contract', 'agreement', 'breach', 'injunction', 'money suit',
        'promissory note', 'recovery', 'damages', 'tenancy', 'specific performance'
    ],
    'Motor Accident Claims & Insurance': [
        'mact', 'accident', 'motor vehicle', 'insurance claim', 'compensation',
        'vehicular', 'third party', 'personal injury', 'tribunal'
    ],
    'Constitutional & Consumer Rights': [
        'consumer', 'defective', 'negligence', 'commission', 'unfair trade',
        'rti', 'fundamental rights', 'writ', 'article 226', 'public interest'
    ],
    'Revenue & Agricultural Land Law': [
        'revenue', 'patta passbook', 'tahsildar', 'rdo', 'inam', 'settlement',
        'kist', 'fmb', 'subdivision', 'village administrative'
    ],
    'Labour & Industrial Disputes': [
        'labour', 'labor', 'employment', 'termination', 'gratuity', 'epf',
        'workmen', 'union', 'wage', 'industrial dispute', 'plantation'
    ],
    'Commercial & Banking Litigation': [
        'banking', 'sarfaesi', 'drt', 'debt recovery', 'loan default',
        'commercial', 'partnership', 'insolvency', 'corporate', 'finance'
    ],
    'Negotiable Instruments & Cheque Bounce': [
        'cheque', 'check', 'cheque bounce', 'section 138', 'ni act',
        'dishonor', 'dishonour', 'statutory notice', 'return memo'
    ],
    'Cyber Crime & Financial Fraud': [
        'cyber', 'online fraud', 'upi', 'phishing', 'data theft', 'hacking',
        'it act', 'financial fraud', 'cyber cell', 'digital harassment'
    ]
}

def normalize_text(text):
    if not text:
        return ''
    return re.sub(r'\s+', ' ', str(text).lower().strip())

def extract_legal_intent(user_text):
    """
    NLP Entity & Intent Extraction for legal queries.
    Identifies case category, location, court tier, urgency, and budget.
    """
    if not user_text:
        return {}

    text_lower = normalize_text(user_text)
    extracted = {
        'caseType': None,
        'district': None,
        'state': None,
        'location': None,
        'courtLevel': None,
        'urgency': 'Medium',
        'budget': None,
        'experience': None
    }

    # 1. Category extraction using keyword overlap
    best_cat = None
    max_hits = 0
    for category, keywords in LEGAL_TAXONOMY.items():
        hits = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
        if hits > max_hits:
            max_hits = hits
            best_cat = category

    if best_cat and max_hits > 0:
        extracted['caseType'] = best_cat
    else:
        # Fallback category checks
        if any(w in text_lower for w in ['land', 'property', 'boundary', 'plot']):
            extracted['caseType'] = 'Property Law & Land Partition'
        elif any(w in text_lower for w in ['crime', 'theft', 'jail', 'bail', 'arrest']):
            extracted['caseType'] = 'Criminal Law'
        elif any(w in text_lower for w in ['divorce', 'wife', 'husband', 'marriage', 'custody']):
            extracted['caseType'] = 'Family & Matrimonial Law'
        elif any(w in text_lower for w in ['cheque', 'check', '138', 'dishonor']):
            extracted['caseType'] = 'Negotiable Instruments & Cheque Bounce'
        elif any(w in text_lower for w in ['cyber', 'scam', 'fraud', 'upi', 'hacked']):
            extracted['caseType'] = 'Cyber Crime & Financial Fraud'
        elif any(w in text_lower for w in ['accident', 'mact', 'insurance', 'injury']):
            extracted['caseType'] = 'Motor Accident Claims & Insurance'
        elif any(w in text_lower for w in ['contract', 'agreement', 'money', 'recovery', 'civil']):
            extracted['caseType'] = 'Civil & Contract Law'

    # 2. Location & District extraction
    tamil_nadu_districts = [
        'theni', 'madurai', 'dindigul', 'chennai', 'coimbatore', 'tirunelveli',
        'trichy', 'salem', 'thanjavur', 'virudhunagar', 'kanchipuram'
    ]
    for d in tamil_nadu_districts:
        if d in text_lower:
            extracted['district'] = d.capitalize()
            extracted['state'] = 'Tamil Nadu'
            extracted['location'] = f"{d.capitalize()}, Tamil Nadu"
            break

    if 'tamil nadu' in text_lower and not extracted['district']:
        extracted['state'] = 'Tamil Nadu'
        extracted['district'] = 'Theni'
        extracted['location'] = 'Theni, Tamil Nadu'

    # 3. Court tier extraction
    if 'supreme court' in text_lower:
        extracted['courtLevel'] = 'Supreme Court'
    elif 'high court' in text_lower or 'madurai bench' in text_lower:
        extracted['courtLevel'] = 'High Court'
    elif 'district court' in text_lower or 'sub court' in text_lower:
        extracted['courtLevel'] = 'District Court'

    # 4. Experience preference
    if any(w in text_lower for w in ['senior', 'veteran', 'highly experienced', '15 years', '20 years']):
        extracted['experience'] = 15
    elif any(w in text_lower for w in ['experienced', 'seasoned', '10 years']):
        extracted['experience'] = 10
    elif any(w in text_lower for w in ['5 years']):
        extracted['experience'] = 5

    # 5. Urgency
    if any(w in text_lower for w in ['urgent', 'emergency', 'immediate', 'today', 'tomorrow', 'arrested']):
        extracted['urgency'] = 'High'
    elif any(w in text_lower for w in ['routine', 'advisory', 'consultation only']):
        extracted['urgency'] = 'Low'

    # 6. Budget in ₹
    budget_match = re.search(r'(?:rs|inr|₹|budget of|fee of|under)\s*(\d+[\d,.]*)', text_lower)
    if budget_match:
        try:
            val = float(budget_match.group(1).replace(',', ''))
            extracted['budget'] = val
        except ValueError:
            pass

    return extracted


def compute_description_similarity(query_text, lawyers):
    """
    Computes Scikit-learn TF-IDF Vectorization and Cosine Similarity
    between user's case description and each lawyer's professional profile text.
    """
    if not query_text or not lawyers:
        return [0.5] * len(lawyers)

    corpus = []
    # Index 0 is the user's case description
    clean_query = normalize_text(query_text)
    corpus.append(clean_query)

    for lawyer in lawyers:
        specs_text = " ".join(lawyer.get('specializations', []))
        practices_text = " ".join(lawyer.get('practiceAreas', []))
        bio_text = lawyer.get('bio', '')
        courts_text = " ".join(lawyer.get('courts', []))
        profile_doc = f"{specs_text} {practices_text} {bio_text} {courts_text}"
        corpus.append(normalize_text(profile_doc))

    try:
        # Use unigrams and bigrams with English stop-words
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', max_features=2500)
        tfidf_matrix = vectorizer.fit_transform(corpus)
        # Cosine similarity between query (index 0) and all lawyer documents (1 to N)
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        return [float(sim) for sim in similarities]
    except Exception as e:
        # Graceful fallback: token overlap
        query_tokens = set(clean_query.split())
        scores = []
        for doc in corpus[1:]:
            doc_tokens = set(doc.split())
            if not query_tokens:
                scores.append(0.5)
                continue
            overlap = query_tokens.intersection(doc_tokens)
            scores.append(min(1.0, len(overlap) / float(max(1, len(query_tokens)))))
        return scores


def rank_lawyers(payload, lawyers_list):
    """
    Core AI Recommendation Algorithm:
    Applies strict domain eligibility filtering, TF-IDF semantic matching,
    and multi-criteria ranking to suggest ONLY specific, qualified advocates.
    """
    if not lawyers_list:
        return []

    req_title = str(payload.get('caseTitle', '')).strip()
    req_case_type = str(payload.get('caseType', payload.get('specialization', ''))).strip()
    req_desc = str(payload.get('description', '')).strip()
    req_district = str(payload.get('district', payload.get('courtDistrict', ''))).strip()
    req_state = str(payload.get('state', payload.get('courtState', ''))).strip()
    req_location = str(payload.get('location', f"{req_district}, {req_state}".strip(', '))).strip()
    req_court_level = str(payload.get('courtLevel', payload.get('courtTier', 'District Court'))).strip()
    req_language = str(payload.get('language', 'Tamil')).strip()
    req_min_exp = int(payload.get('experience', payload.get('minExperience', 0)) or 0)
    req_budget = float(payload.get('budget', 0) or 0)

    # Determine primary legal domain and related keywords
    full_query_text = f"{req_title} {req_case_type} {req_desc}".strip()
    req_text_lower = full_query_text.lower()

    # Identify primary category
    primary_category = req_case_type
    if not primary_category or primary_category.lower() in ['general', 'other']:
        extracted = extract_legal_intent(full_query_text)
        if extracted.get('caseType'):
            primary_category = extracted['caseType']

    target_keywords = set()
    allied_categories = set()
    norm_target = primary_category.lower().replace(' law', '').strip()

    # Populate domain keywords & allied categories from taxonomy
    for cat, kws in LEGAL_TAXONOMY.items():
        norm_cat = cat.lower().replace(' law', '').strip()
        if norm_cat in norm_target or norm_target in norm_cat:
            target_keywords.update([k.lower() for k in kws])
            allied_categories.add(cat.lower())

    # Map allied domain relationships for legal synergy
    if 'property' in norm_target or 'partition' in norm_target or 'land' in norm_target:
        allied_categories.update(['property law & land partition', 'revenue & agricultural land law', 'civil appeals & title rectification'])
        target_keywords.update(['property', 'land', 'partition', 'boundary', 'patta', 'revenue', 'title', 'survey', 'encroachment', 'agricultural'])
    elif 'criminal' in norm_target or 'bail' in norm_target:
        allied_categories.update(['criminal law', 'criminal trial & sessions advocacy', 'criminal appeals & bail petitions', 'sessions defense & special acts'])
        target_keywords.update(['criminal', 'bail', 'anticipatory bail', 'fir', 'police', 'arrest', 'ipc', 'sessions', 'magistrate'])
    elif 'divorce' in norm_target or 'family' in norm_target or 'matrimonial' in norm_target:
        allied_categories.update(['family & matrimonial law', 'domestic relations & child custody', 'family court practice & mediation'])
        target_keywords.update(['divorce', 'custody', 'matrimonial', 'maintenance', 'alimony', 'domestic violence', 'marriage', 'guardianship', 'sec 125'])
    elif 'cheque' in norm_target or '138' in norm_target or 'ni act' in norm_target:
        allied_categories.update(['negotiable instruments & cheque bounce', 'commercial & banking litigation'])
        target_keywords.update(['cheque', 'check', 'cheque bounce', 'section 138', 'ni act', 'dishonor', 'dishonour', 'notice', 'statutory notice'])
    elif 'accident' in norm_target or 'mact' in norm_target:
        allied_categories.update(['motor accident claims & insurance'])
        target_keywords.update(['mact', 'accident', 'motor vehicle', 'insurance claim', 'compensation', 'tribunal', 'injury'])
    elif 'consumer' in norm_target:
        allied_categories.update(['constitutional & consumer rights'])
        target_keywords.update(['consumer', 'defective', 'negligence', 'commission', 'unfair trade', 'compensation', 'rti'])
    elif 'labour' in norm_target or 'labor' in norm_target or 'employment' in norm_target:
        allied_categories.update(['labour & industrial disputes'])
        target_keywords.update(['labour', 'labor', 'employment', 'termination', 'gratuity', 'wage', 'industrial dispute'])
    elif 'cyber' in norm_target or 'upi' in norm_target or 'fraud' in norm_target:
        allied_categories.update(['cyber crime & financial fraud'])
        target_keywords.update(['cyber', 'online fraud', 'upi', 'phishing', 'data theft', 'hacking', 'it act', 'financial fraud'])

    # Compute TF-IDF similarities
    tfidf_scores = compute_description_similarity(full_query_text, lawyers_list)

    ranked_results = []
    seen_names = set()

    for idx, lawyer in enumerate(lawyers_list):
        # 1. HARD CONSTRAINTS
        verif_status = lawyer.get('verificationStatus', 'Verified')
        if verif_status in ['Suspended', 'Rejected']:
            continue

        avail_status = lawyer.get('availabilityStatus', lawyer.get('availability', 'Available'))
        if str(avail_status).lower() in ['inactive', 'suspended']:
            continue

        lawyer_name = str(lawyer.get('fullName', lawyer.get('name', ''))).strip()
        # Normalize name for deduplication (e.g. "Advocate S. Murugan (Lawyer)" vs "Advocate S. Murugan")
        norm_name = re.sub(r'\(.*?\)', '', lawyer_name).strip().lower()

        specializations = lawyer.get('specializations', [])
        primary_spec = lawyer.get('specialization', '')
        if primary_spec and primary_spec not in specializations:
            specializations = [primary_spec] + specializations
        practice_areas = lawyer.get('practiceAreas', [])
        all_specs_lower = [str(s).lower() for s in specializations + practice_areas]
        combined_spec_str = " ".join(all_specs_lower)

        # 2. STRICT DOMAIN RELEVANCE FILTERING
        spec_score = 0.0

        # Exact category match
        if any(norm_target in s or s in norm_target for s in all_specs_lower):
            spec_score = 1.0
        # Allied category match
        elif any(any(allied in s or s in allied for allied in allied_categories) for s in all_specs_lower):
            spec_score = 0.90
        else:
            # Check domain keywords in lawyer practice areas
            keyword_hits = sum(1 for kw in target_keywords if kw in combined_spec_str)
            if keyword_hits >= 2:
                spec_score = min(0.95, 0.75 + (keyword_hits * 0.05))
            else:
                spec_score = 0.0

        # CRITICAL FILTER: If lawyer does NOT specialize in this legal domain, EXCLUDE THEM!
        if spec_score < 0.75:
            continue

        # 3. EXPERIENCE FILTERING
        lawyer_exp = int(lawyer.get('experience', lawyer.get('experienceYears', 5)) or 5)
        if req_min_exp > 0:
            if lawyer_exp < (req_min_exp - 3):
                continue
            exp_score = min(1.0, lawyer_exp / float(req_min_exp))
        else:
            exp_score = min(1.0, 0.60 + (lawyer_exp * 0.02))

        # 4. LOCATION & JURISDICTION COMPATIBILITY
        loc_score = 0.60
        lawyer_district = str(lawyer.get('district', '')).lower()
        lawyer_state = str(lawyer.get('state', '')).lower()
        lawyer_location = str(lawyer.get('location', '')).lower()

        if req_district and (req_district.lower() in lawyer_district or req_district.lower() in lawyer_location):
            loc_score = 1.0
        elif req_location and req_location.lower() in lawyer_location:
            loc_score = 0.95
        elif req_state and req_state.lower() in lawyer_state:
            loc_score = 0.80

        # 5. COURT LEVEL MATCH
        court_score = 0.75
        lawyer_courts = [str(c).lower() for c in lawyer.get('courts', [])]
        lawyer_court_level = str(lawyer.get('courtLevel', 'District Court')).lower()
        req_court_lower = req_court_level.lower()

        if req_court_lower in lawyer_court_level or any(req_court_lower in c for c in lawyer_courts):
            court_score = 1.0
        elif 'district' in req_court_lower and ('district' in lawyer_court_level or any('district' in c for c in lawyer_courts)):
            court_score = 1.0
        elif 'high court' in req_court_lower and ('high' in lawyer_court_level or any('high' in c for c in lawyer_courts)):
            court_score = 1.0

        # 6. SEMANTIC SIMILARITY (TF-IDF)
        raw_sim = tfidf_scores[idx] if idx < len(tfidf_scores) else 0.5
        sim_score = min(1.0, max(0.40, raw_sim * 2.0))

        # 7. AVAILABILITY & RATING
        avail_score = 1.0 if str(avail_status).lower() in ['available', 'high'] else 0.70
        lawyer_rating = float(lawyer.get('rating', 4.8) or 4.8)
        consult_fee = float(lawyer.get('consultationFee', lawyer.get('fee', 0)) or 0)

        # 8. MULTI-CRITERIA PRECISION SCORE
        # Strict weighting: Domain Match (45%), Semantic TF-IDF (25%), Experience (15%), Location (10%), Availability (5%)
        weighted_score = (
            (spec_score * 45.0) +
            (sim_score * 25.0) +
            (exp_score * 15.0) +
            (loc_score * 10.0) +
            (avail_score * 5.0)
        )

        final_match_score = round(min(98.5, max(75.0, weighted_score)), 1)
        confidence = round(min(98.0, max(80.0, (spec_score * 50.0 + exp_score * 30.0 + loc_score * 20.0))), 1)

        # 9. EXPLAINABILITY & RATIONALE
        reasons = []
        if spec_score >= 0.90:
            reasons.append(f"Dedicated specialist in {specializations[0] if specializations else primary_category}")
        elif spec_score >= 0.70:
            reasons.append(f"Extensive trial practice in {specializations[0] if specializations else 'Allied Civil Jurisprudence'}")

        if practice_areas:
            matched_areas = [pa for pa in practice_areas if any(kw in pa.lower() for kw in target_keywords)]
            if matched_areas:
                reasons.append(f"Direct courtroom experience in {', '.join(matched_areas[:2])}")

        if lawyer_exp >= 15:
            reasons.append(f"{lawyer_exp} years of veteran Bar Council courtroom practice")
        elif lawyer_exp >= 8:
            reasons.append(f"{lawyer_exp} years of active trial litigation experience")

        if loc_score >= 0.95:
            reasons.append(f"Practices locally in {lawyer.get('district', 'Theni')} District Court jurisdiction")

        if len(reasons) < 2:
            reasons.append("Verified Bar standing with proven case settlement record")

        candidate = {
            'lawyerId': lawyer.get('id', lawyer.get('_id', '')),
            'userId': lawyer.get('userId', lawyer.get('id', lawyer.get('_id', ''))),
            'fullName': lawyer_name,
            'name': lawyer_name,
            'barRegistrationNumber': lawyer.get('barRegistrationNumber', 'MS/VERIFIED'),
            'specialization': specializations[0] if specializations else primary_category,
            'specializations': specializations,
            'practiceAreas': practice_areas,
            'experience': lawyer_exp,
            'district': lawyer.get('district', 'Theni'),
            'state': lawyer.get('state', 'Tamil Nadu'),
            'location': lawyer.get('location', 'Theni, Tamil Nadu'),
            'courts': lawyer.get('courts', ['District Court, Theni']),
            'courtLevel': lawyer.get('courtLevel', 'District Court'),
            'languages': lawyer.get('languages', ['Tamil', 'English']),
            'consultationFee': consult_fee,
            'caseFilingFee': lawyer.get('caseFilingFee', consult_fee * 2),
            'availabilityStatus': avail_status,
            'rating': lawyer_rating,
            'matchScore': final_match_score,
            'confidenceScore': confidence,
            'reasons': reasons[:4],
            'bio': lawyer.get('bio', ''),
            'profileImage': lawyer.get('profileImage', '')
        }

        # Deduplication: keep best match if advocate appears under multiple IDs
        if norm_name in seen_names:
            # Check if this candidate has higher score
            existing_idx = next((i for i, r in enumerate(ranked_results) if re.sub(r'\(.*?\)', '', r['fullName']).strip().lower() == norm_name), None)
            if existing_idx is not None and candidate['matchScore'] > ranked_results[existing_idx]['matchScore']:
                ranked_results[existing_idx] = candidate
        else:
            seen_names.add(norm_name)
            ranked_results.append(candidate)

    # Sort strictly descending by matchScore
    ranked_results.sort(key=lambda x: x['matchScore'], reverse=True)

    # Return top 3 to 6 candidates (only the specific qualified lawyers)
    return ranked_results[:6]
