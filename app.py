from flask import Flask, jsonify
from flask_cors import CORS
from main import get_facts  # Import the get_facts function

app = Flask(__name__)
CORS(app)

@app.route('/api/facts', methods=['GET'])
def facts():
    facts_list = get_facts()
    facts_data = [
        {
            "fact_id": fact.fact_id,
            "question": fact.question,
            "context1": fact.context1,
            "context2": fact.context2,
            "answer": fact.answer
        }
        for fact in facts_list
    ]
    return jsonify(facts_data)

if __name__ == '__main__':
    app.run(debug=True)
