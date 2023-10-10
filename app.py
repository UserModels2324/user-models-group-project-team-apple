# Bridge between front end and back end info, translating layer, to run everything run app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

# Import the Time and Facts classes from main.py.
from main import Time, Facts

app = Flask(__name__)
CORS(app)

# start the timer for 8 minutes
timer = Time(session_time=10)

# generate the models
europe = Facts("europe")
asia = Facts("asia")
africa = Facts("africa")
oceania = Facts("oceania")
america = Facts("america")

active_model = None

# This gets it from the main.py from the hard-coded values
@app.route('/api/question', methods=['GET'])
def facts():
    # Calls on the user model for the next fact to display.
    # europe is a continent, question is a function inside the class that calls/asks slimstampen for a question

    if active_model == "Europe":
        fact = europe.question(timer.get_elapsed_time())
    if active_model == "Asia":
        fact = asia.question(timer.get_elapsed_time())
    if active_model == "Africa":
        fact = africa.question(timer.get_elapsed_time())
    if active_model == "Oceania":
        fact = oceania.question(timer.get_elapsed_time())
    if active_model == "America":
        fact = america.question(timer.get_elapsed_time())

    # Create a dictionary from the Fact object's attributes
    fact_data = {
        "fact_id": fact.fact_id,
        "question": fact.question,
        "context1": fact.context1,
        "context2": fact.context2,
        "answer": fact.answer,
    }

    timer.start_tracking_rt()
    
    return jsonify(fact_data)

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

@app.route('/api/progress', methods=['GET'])
def progress():

    data = {
        'Europe': europe.calculate_average_rof() * 100, 
        'Africa': africa.calculate_average_rof() * 100,
        'Asia': asia.calculate_average_rof() * 100, 
        'America': america.calculate_average_rof() * 100, 
        'Oceania': oceania.calculate_average_rof() * 100,
    }

    return jsonify(data) 

if __name__ == '__main__':
    app.run(debug=True)
