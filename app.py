from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
from main import get_facts, get_random_fact_from_csv  # Import the get_facts function

app = Flask(__name__)
CORS(app)

# This gets it from the main.py from the hard-coded values
@app.route('/api/facts', methods=['GET'])
def facts():
    # Call the get_random_fact_from_csv function to get a random Fact object
    fact = get_random_fact_from_csv('all-continents.csv')
    print(fact)
    # Create a dictionary from the Fact object's attributes
    fact_data = {
        "fact_id": fact.fact_id,
        "question": fact.question,
        "context1": fact.context1,
        "context2": fact.context2,
        "answer": fact.answer
    }

    return jsonify(fact_data)

# @app.route('/api/facts', methods=['GET'])
# def facts():
#     facts_list = get_facts()
#     facts_data = [
#         {
#             "fact_id": fact.fact_id,
#             "question": fact.question,
#             "context1": fact.context1,
#             "context2": fact.context2,
#             "answer": fact.answer
#         }
#         for fact in facts_list
#     ]
#     return jsonify(facts_data)

if __name__ == '__main__':
    app.run(debug=True)
