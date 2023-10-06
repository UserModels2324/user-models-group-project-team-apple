# Bridge between front end and back end info, translating layer, to run everything run app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

# Import the Time and Facts classes from main.py.
from main import Time, Facts

app = Flask(__name__)
CORS(app)

# start the timer for 8 minutes
# timer = Time(session_time=8)

# generate the model
europe = Facts("Europe")
europe.generate()

# This gets it from the main.py from the hard-coded values
@app.route('/api/question', methods=['GET'])
def facts():
    # Calls on the user model for the next fact to display.
    fact = europe.question(timer.get_elapsed_time()) # europe is a continent, question is a function inside the class that calls/asks slimstampen for a question
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
@app.route('/api/answer', methods=['POST'])
def submit_answer():
    data = request.get_json()  # Extract the JSON data from the request
    # Get the user's answer from the JSON data
    user_answer = data.get('userAnswer')
    timer.end_tracking_rt()

    europe.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)

    return jsonify({'message': 'Answer received successfully'})

@app.route('/api/remaining_time', methods=['GET'])
def get_remaining_time():
    remaining_time_millis = timer.get_remaining_time()
    remaining_minutes = int(remaining_time_millis / 60000)  # Convert to minutes
    remaining_seconds = int((remaining_time_millis % 60000) / 1000)  # Convert to seconds
    return jsonify({'minutes': remaining_minutes, 'seconds': remaining_seconds})

@app.route('/api/start_timer', methods=['POST'])
def start_timer():
    data = request.get_json()
    session_length = float(data['sessionLength']) # Convert to milliseconds if needed

    # Initialize or update the timer with the provided session length
    global timer
    timer = Time(session_time=session_length)

    return jsonify({'message': 'Timer started successfully'})



if __name__ == '__main__':
    app.run(debug=True)
