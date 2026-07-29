# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

app = Flask(__name__)

# Categorization keywords dictionary for rule-based NLP extraction
LEGAL_CATEGORIES = {
    'Family Law': ['divorce', 'custody', 'marriage', 'wife', 'husband', 'child', 'alimony', 'maintenance', 'domestic'],
    'Property Law': ['property', 'land', 'boundary', 'deed', 'tenant', 'landlord', 'rent', 'lease', 'house', 'flat'],
    'Labor & Employment Law': ['terminate', 'job', 'employer', 'work', 'contract', 'notice', 'employee', 'salary', 'wages', 'fired'],
    'Criminal Law': ['crime', 'theft', 'assault', 'jail', 'police', 'arrest', 'bail', 'fraud', 'murder', 'harassment'],
    'Corporate Law': ['tax', 'audit', 'corporate', 'business', 'company', 'shares', 'merger', 'contract', 'compliance']
}

def extract_legal_intent(text):
    text_lower = text.lower()
    extracted = {}
    
    # 1. Categorize case type
    for category, keywords in LEGAL_CATEGORIES.items():
        if any(keyword in text_lower for keyword in keywords):
            extracted['caseType'] = category
            break
            
    # 2. Extract urgency
    if any(k in text_lower for k in ['urgent', 'emergency', 'immediate', 'arrested', 'jail', 'court tomorrow']):
        extracted['urgency'] = 'High'
    elif any(k in text_lower for k in ['soon', 'next week', 'schedule']):
        extracted['urgency'] = 'Medium'
    else:
        extracted['urgency'] = 'Low'
        
    return extracted

@app.route('/recommend', methods=['POST'])
def recommend():
    payload = request.get_json() or {}
    lawyers_list = payload.get('lawyers', [])
    req_specialization = payload.get('caseType', 'General')
    req_location = payload.get('location', '')
    req_language = payload.get('language', 'English')
    req_budget = float(payload.get('budget', 1000000)) if payload.get('budget') else 1000000
    req_experience = int(payload.get('experience', 0))
    req_desc = payload.get('description', '')

    if not lawyers_list:
        return jsonify([])

    results = []
    
    for lawyer in lawyers_list:
        # Calculate individual weighted scores
        
        # 1. Specialization Match (30%)
        # Check if the lawyer has the requested specialization/caseType in their specialties list
        specializations = lawyer.get('specializations', [])
        # Also check fallback text if specializations is a string or contains it
        spec_match = 0.0
        if req_specialization:
            if any(req_specialization.lower() in s.lower() for s in specializations) or req_specialization.lower() in lawyer.get('specialization', '').lower():
                spec_match = 1.0
            else:
                # partial match
                for s in specializations:
                    if any(word in s.lower() for word in req_specialization.lower().split()):
                        spec_match = 0.5
                        break
        
        # 2. Experience Match (15%)
        lawyer_exp = int(lawyer.get('experience', lawyer.get('experienceYears', 0)))
        exp_match = 1.0 if lawyer_exp >= req_experience else (lawyer_exp / req_experience if req_experience > 0 else 1.0)
        
        # 3. Success Rate Match (15%)
        lawyer_success = float(lawyer.get('successRate', 0))
        success_match = lawyer_success / 100.0
        
        # 4. Rating Match (10%)
        lawyer_rating = float(lawyer.get('rating', 5.0))
        rating_match = lawyer_rating / 5.0
        
        # 5. Availability Match (10%)
        avail_status = lawyer.get('availabilityStatus', lawyer.get('availability', 'Available')).lower()
        avail_match = 1.0 if avail_status in ['high', 'available'] else (0.5 if avail_status in ['medium', 'busy'] else 0.2)
        
        # 6. Location Match (5%)
        lawyer_loc = lawyer.get('location', '')
        loc_match = 1.0 if req_location.lower() in lawyer_loc.lower() or lawyer_loc.lower() in req_location.lower() else 0.2
        
        # 7. Language Match (5%)
        lawyer_langs = lawyer.get('languages', ['English'])
        lang_match = 1.0 if any(req_language.lower() in l.lower() for l in lawyer_langs) else 0.2
        
        # 8. Fee Compatibility Match (5%)
        # Check standard consultation fee
        consult_fee = float(lawyer.get('consultationFee', 0))
        fee_match = 1.0 if consult_fee <= req_budget else (req_budget / consult_fee if consult_fee > 0 else 1.0)
        
        # 9. Case Similarity (5%)
        # Simple TF-IDF cosine similarity approximation or keyword matching based on description
        sim_match = 0.5
        if req_desc and lawyer.get('bio'):
            try:
                corpus = [req_desc, lawyer.get('bio')]
                vectorizer = TfidfVectorizer()
                tfidf = vectorizer.fit_transform(corpus)
                pairwise_similarity = (tfidf * tfidf.T).A
                sim_match = float(pairwise_similarity[0, 1])
            except Exception:
                # If vocabulary creation fails, check subset overlaps
                words_req = set(req_desc.lower().split())
                words_bio = set(lawyer.get('bio').lower().split())
                overlap = words_req.intersection(words_bio)
                sim_match = min(1.0, len(overlap) / 10.0) if len(words_req) > 0 else 0.5

        # Weighted calculation
        total_score = (
            (spec_match * 30.0) +
            (exp_match * 15.0) +
            (success_match * 15.0) +
            (rating_match * 10.0) +
            (avail_match * 10.0) +
            (loc_match * 5.0) +
            (lang_match * 5.0) +
            (fee_match * 5.0) +
            (sim_match * 5.0)
        )
        
        # Confidence Score
        confidence_score = (spec_match * 40.0) + (exp_match * 30.0) + (success_match * 30.0)

        # Reasons list
        reasons = []
        if spec_match > 0.8:
            reasons.append(f"Specializes in {req_specialization}")
        if lawyer_exp >= 10:
            reasons.append(f"{lawyer_exp} years of veteran legal practice experience")
        if lawyer_success >= 90:
            reasons.append(f"Outstanding past success rate of {lawyer_success}%")
        if consult_fee <= req_budget:
            reasons.append("Hourly consultation fees are fully within your budget limit")
        if avail_match > 0.8:
            reasons.append("Currently open and available for instant consultation scheduling")

        if len(reasons) < 2:
            reasons.append("General practice compatibility fit matches your category request")

        results.append({
            'lawyerId': lawyer.get('id', lawyer.get('_id', '')),
            'fullName': lawyer.get('fullName', lawyer.get('name', '')),
            'profileImage': lawyer.get('profileImage', ''),
            'specialization': lawyer.get('specialization', req_specialization),
            'experience': lawyer_exp,
            'consultationFee': consult_fee,
            'matchScore': round(total_score, 1),
            'confidenceScore': round(confidence_score, 1),
            'reasons': reasons[:4],
            'matchedSkills': lawyer.get('practiceAreas', ['General Legal Aid']),
            'feeMatch': 'Excellent' if fee_match > 0.9 else ('Moderate' if fee_match > 0.5 else 'High Budget Requirement'),
            'availabilityMatch': 'High Availability' if avail_match > 0.9 else 'Booking Required',
            'experienceMatch': f"{lawyer_exp} Years Practice",
            'specializationMatch': 'Perfect Specialty Match' if spec_match > 0.9 else 'General Practice Alignment'
        })
        
    # Sort by matchScore descending
    results.sort(key=lambda x: x['matchScore'], reverse=True)
    return jsonify(results)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    payload = request.get_json() or {}
    message = payload.get('message', '')
    context = payload.get('context', {})
    
    # 1. Parse current user query for keywords
    nlp_extracted = extract_legal_intent(message)
    
    # Update context with newly extracted parameters
    for k, v in nlp_extracted.items():
        if k not in context or not context[k]:
            context[k] = v
            
    # Extract location if mentioned
    message_lower = message.lower()
    for city in ['chennai', 'mumbai', 'delhi', 'colombo', 'galle', 'kandy', 'negombo']:
        if city in message_lower:
            context['location'] = city.capitalize()
            
    # Extract budget/fees if numbers are mentioned
    import re
    budget_match = re.search(r'(?:rs|lkr|\$|budget of)\s*(\d+[\d,.]*)', message_lower)
    if budget_match:
        try:
            val = float(budget_match.group(1).replace(',', ''))
            context['budget'] = val
        except ValueError:
            pass
            
    # Compile response
    case_type = context.get('caseType')
    location = context.get('location')
    urgency = context.get('urgency', 'Low')
    
    recommends_trigger = False
    
    # Simple conversational state machine based on collected criteria
    if not case_type:
        reply = "I understand you have a legal query. To assist you best, could you briefly describe the nature of your dispute? (e.g. employment issue, divorce, land boundary conflict, or criminal allegation)"
    elif not location:
        reply = f"I have categorized your issue under **{case_type}** with an urgency rating of **{urgency}**. In which city or location do you require representation?"
    else:
        reply = f"Excellent. Seeking top-tier advocates specializing in **{case_type}** located in **{location}**. Initiating weighted AI matcher algorithm calculation..."
        recommends_trigger = True
        
    # Standard legal disclaimer
    disclaimer = "七 Please note: I am an AI assistant designed to suggest counselor matches. I do not provide definitive legal advice or replace a qualified attorney."
    
    return jsonify({
        'reply': f"{reply}\n\n*{disclaimer}*",
        'context': context,
        'triggerRecommendation': recommends_trigger,
        'filters': {
            'caseType': case_type,
            'location': location,
            'urgency': urgency
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
