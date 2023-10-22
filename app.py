# Bridge between front end and back end info, translating layer, to run everything run app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import the Time and Facts classes from main.py.
from main import Time, Facts
from datetime import datetime

app = Flask(__name__)
CORS(app)

# start the timer for 8 minutes
timer = None
participant = None
model = None

@app.route('/api/start', methods=['POST'])
def start():
    global timer
    global participant
    global model

    timer = Time(session_time=1)
    participant = datetime.now().strftime("%Y%m%d%H%M%S")
    model = Facts(participant)

    # Create a response object with the necessary information
    response_data = {
        'participant': participant,
        'session_time': timer.session_time,  # Assuming this is a property of your Time class
    }

    # Return the response as JSON
    return jsonify(response_data)


# This gets it from the main.py from the hard-coded values
@app.route('/api/question', methods=['GET'])
def question():
    # Calls on the user model for the next fact to display.
    fact, new, rof = model.question(timer.get_elapsed_time())

    # rof is a float representing the rate of forgetting
    # new is a bool indicating whether the user is first seeing the fact.
    # Create a dictionary from the Fact object's attributes
    data = {
        "fact_id": fact.fact_id,
        "condition": fact.condition,
        "question": fact.question,
        "new": new,
        "rof": rof,
        "text_context": fact.text_context,
        "image_context": fact.image_context,
        "question_context": fact.question_context,
        "answer": fact.answer,
    }

    timer.start_tracking_rt()
    return jsonify(data)

# posting the user answer to the backend
@app.route('/api/answer', methods=['POST'])
def submit_answer():
    timer.end_tracking_rt()

    data = request.get_json()
    user_answer = data.get('userAnswer').lower()

    model.answer(timer.get_elapsed_time(), timer.get_rt(), user_answer)

    return jsonify({'message': 'Answer received successfully'})

@app.route('/api/remaining_time', methods=['GET'])
def get_remaining_time():
    remaining_time_millis = timer.get_remaining_time()
    remaining_minutes = int(remaining_time_millis /
                            60000)  # Convert to minutes
    remaining_seconds = int((remaining_time_millis %
                            60000) / 1000)  # Convert to seconds
    return jsonify({'minutes': remaining_minutes, 'seconds': remaining_seconds})

@app.route('/api/results', methods=['POST'])
def receive_results():
    """
    This function will respond to the result to dump the user results once the window is closed. 
    """
    model.export()
    return jsonify({'message': 'Results Dumped!'})

if __name__ == '__main__':
    app.run(debug=True)
