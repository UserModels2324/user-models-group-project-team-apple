# This is the backend; everything that requires a timer
import time, os
from slimstampen.spacingmodel import SpacingModel, Fact, Response
import pandas as pd

# keep track of time in ms
class Time:
    def __init__(self, session_time):
        self.start_time = self.get_time()
        self.session_time = session_time * 60 * 1000
        self.start_rt = 0.0
        self.end_rt = 0.0

    def get_time(self):
        return time.time() * 1000
    
    def get_elapsed_time(self):
        if self.start_time is not None:
            return int(self.get_time() - self.start_time)

    def start_tracking_rt(self):
        self.start_rt = self.get_time()

    def end_tracking_rt(self):
        self.end_rt = self.get_time()

    def get_rt(self):
        return int(self.end_rt - self.start_rt)

    def get_remaining_time(self):
        elapsed_time = self.get_elapsed_time()
        remaining_time = self.session_time - elapsed_time
        return max(0, remaining_time)

# keeps track of the slimstampen model
class Facts: # slimstampen model put into a class
    def __init__(self, participant): # we have as many models as continents
        self.participant = participant
        self.model = SpacingModel()
        self.current_fact = None # fact currently seen by user
        self.generate()

    # generate the facts and populate the model
    def generate(self):
        df = pd.read_excel('capitals.xlsx')
        df_filtered = df.sample(frac=1).reset_index(drop=True)

        # generate a repeating sequence of values from 0 to 3
        condition_values = [0, 1, 2, 3] * (len(df_filtered) // 4) + [0, 1, 2, 3][:len(df_filtered) % 4]

        # assign the generated values to the 'condition' column
        df_filtered['condition'] = condition_values

        for _, row in df_filtered.iterrows():
            fact = Fact(fact_id=int(row['fact_id']),
                        condition=int(row['condition']),
                        continent=row['continent'],
                        question=row['question'],
                        text_context=row['text_context'],
                        image_context=row['image_context'],
                        question_context=row['question_context'],
                        answer=row['answer'])
            
            self.model.add_fact(fact)
            
    # pulls the infomation to display from the model
    def question(self, current_time):
        self.current_fact, new = self.model.get_next_fact(current_time)
        rof = self.model.get_rate_of_forgetting(current_time, self.current_fact)

        print("SESSION TIME: {}".format(current_time))
        print("ROF: {}".format(rof))

        return self.current_fact, new, rof

    # post the user response back to the model
    def answer(self, start_time, rt, user_answer):
        # send answer to the model
        resp = Response(fact = self.current_fact, start_time = start_time, rt = rt, correct = (user_answer == self.current_fact.answer))
        self.model.register_response(resp)

    def export(self):
        """
        exports all the slimstamppen model data, and saves the file as csv to the results folder, replacing the old file.
        uses date time string as file name.
        """

        if not os.path.exists('results'):
            os.makedirs('results')

        file_name = f"results/{self.participant}"
        self.model.export_data(file_name)
