# Bridge between front end and back end info, translating layer, to run everything run app.py

import secrets
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

# Import the Time and Facts classes from main.py.
from main import Time, Facts

app = Flask(__name__)
CORS(app)

# start the timer for 8 minutes
timer = Time(session_time=10)

# generate a participant ID 
participant = ''.join(secrets.choice('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') for i in range(6))
# generate the models
europe = Facts("europe", participant)
asia = Facts("asia", participant)
africa = Facts("africa", participant)
oceania = Facts("oceania", participant)
america = Facts("america", participant)

active_model = None

# This gets it from the main.py from the hard-coded values
@app.route('/api/question', methods=['GET'])
def question():
    # Calls on the user model for the next fact to display.
    # europe is a continent, question is a function inside the class that calls/asks slimstampen for a question

    if active_model == "Europe":
        fact, new, rof = europe.question(timer.get_elapsed_time())
    if active_model == "Asia":
        fact, new, rof= asia.question(timer.get_elapsed_time())
    if active_model == "Africa":
        fact, new, rof= africa.question(timer.get_elapsed_time())
    if active_model == "Oceania":
        fact, new, rof= oceania.question(timer.get_elapsed_time())
    if active_model == "America":
        fact, new, rof= america.question(timer.get_elapsed_time())

    # rof is a float representing the rate of forgetting
    # new is a bool indicating whether the user is first seeing the fact.
    # Create a dictionary from the Fact object's attributes

    data = {
        "fact_id": fact.fact_id,
        "condition": fact.condition,
        "question": fact.question,
        "new": new,
        "rof": rof,
        "text_context": "fact.text_context",
        "image_context": "fact.image_context",
        "answer": fact.answer,
    }

    timer.start_tracking_rt()
    
    return jsonify(data)

# posting the user answer to the backend
@app.route('/api/answer', methods=['POST'])
def submit_answer():

    timer.end_tracking_rt()

    data = request.get_json()
    user_answer = data.get('userAnswer')

    if active_model == "Europe":
        europe.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)
    if active_model == "Asia":
        asia.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)
    if active_model == "Africa":
        africa.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)
    if active_model == "Oceania":
        oceania.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)
    if active_model == "America":
        america.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)

    return jsonify({'message': 'Answer received successfully'})

@app.route('/api/remaining_time', methods=['GET'])
def get_remaining_time():
    remaining_time_millis = timer.get_remaining_time()
    remaining_minutes = int(remaining_time_millis /
                            60000)  # Convert to minutes
    remaining_seconds = int((remaining_time_millis %
                            60000) / 1000)  # Convert to seconds
    return jsonify({'minutes': remaining_minutes, 'seconds': remaining_seconds})

@app.route('/api/start_timer', methods=['POST'])
def start_timer():
    data = request.get_json()
    # Convert to milliseconds if needed
    session_length = float(data['sessionLength'])

    # Initialize or update the timer with the provided session length
    global timer
    timer = Time(session_time=session_length)

    return jsonify({'message': 'Timer started successfully'})

@app.route('/api/continents', methods=['POST'])
def submit_continent():
    data = request.get_json()

    global active_model 
    active_model = data.get('continentChoice')

    return jsonify({'message': '{} Selected!'.format(data)})

@app.route('/api/results', methods=['POST'])
def receive_results():
    """
    This function will respond to the result to dump the user results once the window is closed. 
    """
    data = request.get_json()

    if active_model == "Europe":
        europe.export()
    if active_model == "Asia":
        asia.export()
    if active_model == "Africa":
        africa.export()
    if active_model == "Oceania":
        oceania.export()
    if active_model == "America":
        america.export()

    return jsonify({'message': 'Results Dumped!'})

if __name__ == '__main__':
    app.run(debug=True)
