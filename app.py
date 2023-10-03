from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

# Import the Time and Facts classes from main.py.
from main import Time, Facts

app = Flask(__name__)
CORS(app)

# start the timer for 8 minutes
timer  = Time(session_time=8)

# generate the model
europe = Facts("Europe")
europe.generate()

# This gets it from the main.py from the hard-coded values
@app.route('/api/facts', methods=['GET'])
def facts():
    # Calls on the user model for the next fact to display. 
    fact = europe.question(timer.get_elapsed_time())
    timer.start_tracking_rt()

    # Create a dictionary from the Fact object's attributes
    fact_data = {
        "fact_id": fact.fact_id,
        "question": fact.question,
        "context1": fact.context1,
        "context2": fact.context2,
        "answer": fact.answer,
    }

    return jsonify(fact_data)


# posting the user answer to the backend
@app.route('/api/submit_answer', methods=['POST'])
def submit_answer():
    data = request.get_json()  # Extract the JSON data from the request
    user_answer = data.get('userAnswer')  # Get the user's answer from the JSON data
    timer.end_tracking_rt()

    europe.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)

    return jsonify({'message': 'Answer received successfully'})

if __name__ == '__main__':
    app.run(debug=True)