import time
from slimstampen.spacingmodel import SpacingModel, Fact, Response
import pandas as pd

# keep track of time in ms


class Time:
    def __init__(self, session_time):
        self.start_time = time.time() * 1000
        self.session_time = session_time * 60 * 1000
        self.start_rt = 0.0
        self.end_rt = 0.0

    def get_time(self):
        return time.time() * 1000
    
    def get_elapsed_time(self):
        if self.start_time is not None:
            return self.get_time() - self.start_time

    def start_tracking_rt(self):
        self.start_rt = self.get_time()

    def end_tracking_rt(self):
        self.end_rt = self.get_time()

    def get_rt(self):
        return self.end_rt - self.start_rt

class Facts:
    def __init__(self, continent):
        self.model = SpacingModel()
        self.continent = continent
        self.current_fact = None

    # generate the facts and populate the model
    def generate(self):
        df = pd.read_csv('all-continents.csv')
        df_filtered = df[df['continent'] == self.continent]

        for _, row in df_filtered.iterrows():
            fact = Fact(fact_id=int(row['fact_id']),
                        question=row['question'],
                        context1=row['context1'],
                        context2=row['context2'],
                        answer=row['answer'])

            self.model.add_fact(fact)

    # pulls the infomation to display from the model
    def question(self, current_time):
        self.current_fact, new = self.model.get_next_fact(current_time)
        rof = self.model.get_rate_of_forgetting(current_time, self.current_fact)

        # DOES NOT RETURN THIS INFO YET
        if rof >= 0.4:
            show_context1 = True
        
        if rof >= 0.5:
            show_context2 = True

        return self.current_fact

    # post the user response back to the model
    def answer(self, start_time, rt, user_answer):

        print("RT: {}".format(rt/1000))

        resp = Response(fact = self.current_fact, start_time = start_time, rt = rt, correct = user_answer == self.current_fact.answer)
        self.model.register_response(resp)

# model.export_data("data.csv")