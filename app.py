# Bridge between front end and back end info, translating layer, to run everything run app.py
import secrets
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

# user session functions
from flask import session
from flask_session import Session

# Import Facts classes from main.py.
from main import Facts

app = Flask(__name__,
            static_url_path="",
            static_folder="frontend")
app.secret_key = '1234'
CORS(app)

app.config["SESSION_TYPE"] = "filesystem"
Session(app)

active_model = None

# init the user data
@app.route('/api/init', methods=['POST'])
def init():

    if "initialized" not in session:

        participant = ''.join(secrets.choice('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') for i in range(6))
        session["participant"] = participant

        # Initialize the timer with a default value of 15 minutes

        # Generate the models
        session['europe'] = Facts("europe", participant)
        session['asia'] = Facts("asia", participant)
        session['africa'] = Facts("africa", participant)
        session['oceania'] = Facts("oceania", participant)
        session['america'] = Facts("america", participant)

        session['initialized'] = True

        return jsonify({'message': 'User initialized successfully'})
    else:
        return jsonify({'message': 'User already initialized'})

# This gets it from the main.py from the hard-coded values
@app.route('/api/question', methods=['GET'])
def question():
    
    # takes the elapsed time from .js to feed to the model
    elapsed = request.args.get('elapsed')

    # Calls on the user model for the next fact to display.
    # europe is a continent, question is a function inside the class that calls/asks slimstampen for a question
    if active_model == "Europe":
        europe = session.get("europe")
        fact, new, rof = europe.question(elapsed)
    if active_model == "Asia":
        asia = session.get("asia")
        fact, new, rof= asia.question(elapsed)
    if active_model == "Africa":
        africa = session.get("africa")
        fact, new, rof= africa.question(elapsed)
    if active_model == "Oceania":
        oceania = session.get("oceania")
        fact, new, rof= oceania.question(elapsed)
    if active_model == "America":
        america = session.get("america")
        fact, new, rof= america.question(elapsed)

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

    return jsonify(data)

# posting the user answer to the backend
@app.route('/api/answer', methods=['POST'])
def answer():

    data = request.get_json()
    elapsed_time = data.get('elapsedTime')
    user_answer = data.get('userAnswer')
    reaction_time = data.get('reactionTime')

    if active_model == "Europe":
        europe = session.get("europe")
        europe.answer(elapsed_time, reaction_time, user_answer)
    if active_model == "Asia":
        asia = session.get("asia")
        asia.answer(elapsed_time, reaction_time, user_answer)
    if active_model == "Africa":
        africa = session.get("africa")
        africa.answer(elapsed_time, reaction_time, user_answer)
    if active_model == "Oceania":
        oceania = session.get("oceania")
        oceania.answer(elapsed_time, reaction_time, user_answer)
    if active_model == "America":
        america = session.get("america")
        america.answer(elapsed_time, reaction_time, user_answer)

    return jsonify({'message': 'Answer received successfully'})

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
        europe = session.get("europe")
        europe.export()
    if active_model == "Asia":
        asia = session.get("asia")
        asia.export()
    if active_model == "Africa":
        africa = session.get("africa")
        africa.export()
    if active_model == "Oceania":
        oceania = session.get("oceania")
        oceania.export()
    if active_model == "America":
        america = session.get("america")
        america.export()

    return jsonify({'message': 'Results Dumped!'})

if __name__ == '__main__':
    app.run(debug=True)
