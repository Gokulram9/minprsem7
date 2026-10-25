# pyrefly: ignore [missing-import]
import os
import sys
import re
from flask import Flask, request, jsonify

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))
from recommend_engine import rank_lawyers, extract_legal_intent, LEGAL_TAXONOMY

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'Lexora AI Recommender Engine'})

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Ranks lawyers using Scikit-learn TF-IDF cosine similarity and multi-criteria scoring.
    """
    payload = request.get_json() or {}
    lawyers_list = payload.get('lawyers', [])

    if not lawyers_list:
        return jsonify([])

    ranked = rank_lawyers(payload, lawyers_list)
    return jsonify(ranked)


@app.route('/chatbot', methods=['POST'])
def chatbot():
    """
    Natural Language Legal Assistant Chatbot:
    1. Extracts legal intent, case category, location, court level, budget, and urgency.
    2. Answers user queries or asks clarifying follow-ups.
    3. Triggers lawyer recommendation matching with real database records.
    """
    payload = request.get_json() or {}
    message = payload.get('message', '').strip()
    context = payload.get('context', {})
    message_lower = message.lower()

    # 1. Parse legal intent parameters
    extracted = extract_legal_intent(message)
    for k, v in extracted.items():
        if v and (k not in context or not context[k]):
            context[k] = v

    case_type = context.get('caseType')
    district = context.get('district')
    state = context.get('state')
    location = context.get('location') or (f"{district}, {state}" if district and state else district)
    court_level = context.get('courtLevel', 'District Court')
    urgency = context.get('urgency', 'Medium')
    budget = context.get('budget')

    intent = None
    trigger_recommendation = False
    reply = ""

    # Check for direct counsel query intents
    if any(k in message_lower for k in ['other side', 'opposing lawyer', 'opponent lawyer', 'representing the other side']):
        intent = 'OPPOSING_LAWYER_QUERY'
        reply = "Fetching authorized opposing counsel details from your active dockets..."
    elif any(k in message_lower for k in ['who is the opponent', 'opponent in my case', 'opposing party']):
        intent = 'OPPONENT_QUERY'
        reply = "Fetching opposing party records for your active case..."
    elif any(k in message_lower for k in ['who represents me', 'my lawyer', 'my counsel', 'representing me']):
        intent = 'MY_LAWYER_QUERY'
        reply = "Retrieving your assigned advocate details..."

    # Greetings & Introductions
    elif any(re.search(r'\b' + re.escape(k) + r'\b', message_lower) for k in [
        'hai', 'haii', 'hi', 'hello', 'hey', 'hy', 'sup', 'yo', 'greetings',
        'good morning', 'good afternoon', 'good evening', 'who are you', 'help'
    ]):
        reply = (
            "Hello! 👋 I am **Lexora AI**, your intelligent judicial assistant.\n\n"
            "I can help you with:\n"
            "• ⚖️ **Match Advocates**: Describe your legal dispute (property partition, criminal bail, divorce, cheque bounce) to get AI-recommended lawyers.\n"
            "• 🏛️ **Court Venue & Dockets**: Locate your assigned courtroom in Theni Combined Court Complex.\n"
            "• 💳 **Fees & Legal Aid**: Check subsidized legal aid eligibility and manage retainers in Rupees (₹).\n\n"
            "How can I assist you with your case today?"
        )

    # Thanks
    elif any(re.search(r'\b' + re.escape(k) + r'\b', message_lower) for k in ['thanks', 'thank you', 'thx', 'ty', 'great', 'cool', 'awesome', 'bye']):
        reply = "You're very welcome! 😊 I am here 24/7 whenever you need help matching advocates or checking case proceedings. Wishing you the best with your legal matter!"

    # Fee / Payment Queries
    elif any(k in message_lower for k in ['fee', 'fees', 'pay', 'payment', 'cost', 'charge', 'rupee', 'rupees', 'rs', '₹', 'escrow', 'price']):
        reply = (
            "All advocate consultation and court filing fees are displayed transparently in **Rupees (₹)** under judicial escrow safeguards.\n\n"
            "• You can view pending fee invoices and download receipts under **Lawyer Fees** in your dashboard.\n"
            "• Indigent legal aid beneficiaries receive 100% state-subsidized free representation."
        )

    # Legal Aid & Application Queries
    elif any(k in message_lower for k in ['legal aid', 'apply', 'indigent', 'subsidy', 'free lawyer', 'how to apply']):
        reply = (
            "Applying for legal aid subsidy in Theni District is straightforward:\n\n"
            "1. Navigate to **Applications** → click **Apply for Legal Aid**.\n"
            "2. Complete the verified application with your dispute particulars.\n"
            "3. Attach income proof or Aadhaar card.\n"
            "Our Legal Services Authority registry will review and schedule your docket."
        )

    # Case Tracking / Hearing Queries
    elif any(k in message_lower for k in ['hearing', 'track', 'my case', 'status', 'next date', 'courtroom', 'judge', 'docket']):
        reply = "You can monitor upcoming hearing dates, assigned presiding judges, and case notes under the **My Cases** or **Case Tracker** tab in your sidebar."

    # Legal Dispute Query with Category and Location Identified
    elif case_type and (district or location):
        loc_str = location or f"{district}, {state}" if district else "Theni, Tamil Nadu"
        reply = (
            f"I have analyzed your dispute regarding **{case_type}** in **{loc_str}**.\n\n"
            f"Scanning verified advocates with active practice credentials before the **{court_level}**..."
        )
        trigger_recommendation = True

    # Case Category identified, but location missing
    elif case_type and not (district or location):
        reply = (
            f"I see you are inquiring about a **{case_type}** matter.\n\n"
            "Which district and court jurisdiction (e.g., **Theni, Tamil Nadu** or District Court) do you require representation in?"
        )

    # Location mentioned without clear case type
    elif (district or location) and not case_type:
        loc_str = location or district
        reply = (
            f"I have noted your location in **{loc_str}**.\n\n"
            "Could you please describe the nature of your legal dispute (e.g., property boundary partition, criminal bail, matrimonial custody, or cheque bounce) so I can match you with the right specialist?"
        )

    # General Fallback
    else:
        reply = (
            "I understand you are seeking legal counsel. To provide the most accurate AI recommendation, please describe:\n\n"
            "1. **Your dispute summary** (e.g. land partition, criminal complaint, divorce)\n"
            "2. **Your district & state** (e.g. Theni, Tamil Nadu)\n"
            "3. **Preferred court level** (District Court, High Court, Supreme Court)\n\n"
            "You can type naturally, for example:\n"
            "*\"I have a property dispute in Theni, Tamil Nadu, and I need an experienced lawyer for civil land partition.\"*"
        )

    disclaimer = "Lexora AI recommendations are an analytical matching aid based on verified bar profiles and do not constitute formal legal counsel or a guarantee of legal success."

    return jsonify({
        'reply': f"{reply}\n\n*{disclaimer}*",
        'context': context,
        'intent': intent,
        'triggerRecommendation': trigger_recommendation,
        'filters': {
            'caseType': case_type,
            'district': district or 'Theni',
            'state': state or 'Tamil Nadu',
            'location': location or 'Theni, Tamil Nadu',
            'courtLevel': court_level,
            'urgency': urgency,
            'budget': budget
        }
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Lexora AI Recommender Engine on port {port}...")
    app.run(host='0.0.0.0', port=port)
