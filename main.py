# This is the backend
from slimstampen.spacingmodel import SpacingModel, Fact, Response
import pandas as pd

# keeps track of the slimstampen model
class Facts: # slimstampen model put into a class
    def __init__(self, continent, participant): # we have as many models as continents
        self.participant = participant
        self.model = SpacingModel()
        self.continent = continent
        self.current_fact = None # fact currently seen by user
        self.rof_dict = {}

        self.generate()

    # generate the facts and populate the model
    def generate(self):
        df = pd.read_excel('capitals.xlsx')
        df_filtered = df[df['continent'] == self.continent]

        # shuffle the rows of the filtered dataframe
        df_filtered = df_filtered.sample(frac=1).reset_index(drop=True)

        # generate a repeating sequence of values from 0 to 3
        condition_values = [0, 1, 2, 3] * (len(df_filtered) // 4) + [0, 1, 2, 3][:len(df_filtered) % 4]

        # assign the generated values to the 'condition' column
        df_filtered['condition'] = condition_values

        for _, row in df_filtered.iterrows():
            fact = Fact(fact_id=int(row['fact_id']),
                        condition=int(row['condition']),
                        question=row['question'],
                        text_context=row['text_context'],
                        image_context=row['image_context'],
                        answer=row['answer'])

            self.model.add_fact(fact)
            
    # pulls the infomation to display from the model
    def question(self, current_time):
        self.current_fact, new = self.model.get_next_fact(current_time)
        rof = self.model.get_rate_of_forgetting(current_time, self.current_fact)

        return self.current_fact, new, rof

    # post the user response back to the model
    def answer(self, start_time, rt, user_answer):

        print("RT: {}".format(rt/1000))

        # send answer to the model
        resp = Response(fact = self.current_fact, start_time = start_time, rt = rt, correct = user_answer == self.current_fact.answer)
        self.model.register_response(resp)

        # add rof
        rof = self.model.get_rate_of_forgetting(time=start_time, fact=self.current_fact)
        fact_id = self.current_fact.fact_id
        self.rof_dict[fact_id] = rof

    def calculate_average_rof(self):

        if len(self.rof_dict) != 0:
            total_rof = sum(rof for rof in self.rof_dict.values())
            average_rof = total_rof / len(self.rof_dict)
            return average_rof
        else:
            return 0


    def export(self):
        """
        exports all the slimstamppen model data, and saves the file as csv to the results folder, replacing the old file (no data is lost though).
        for example: results/JG73SF_asia
        JG73SF is the model ID or participant ID, which is followed by the continent model.
        """
        file_name = f"results/{self.participant}_{self.continent}"
        self.model.export_data(file_name)
