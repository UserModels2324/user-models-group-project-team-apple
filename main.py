import time 
from slimstampen.spacingmodel import SpacingModel, Fact, Response


# Fact List
france = Fact(fact_id = 1, question = "France", context1 = "context1", context2 ="context2", answer = "paris")
netherlands = Fact(fact_id = 2, question = "The Netherlands", context1 = "context1", context2 ="context2", answer = "amsterdam")
finland = Fact(fact_id = 3, question = "Finland", context1 = "context1", context2 ="context2", answer = "helsinki")

def get_facts():
    return [france, netherlands, finland]

model = SpacingModel()
model.add_fact(france)
model.add_fact(netherlands)
model.add_fact(finland)


session_start = time.time()
session_length = 20


# main loop
# while True:
#
#     # exit when session length has been reached
#     elapsed_time = time.time() - session_start
#     if elapsed_time >= session_length:
#         break
#
#     # get fact
#     next_fact, new = model.get_next_fact(current_time = elapsed_time)
#     rof = model.get_rate_of_forgetting(elapsed_time * 1000, next_fact)
#
#     if rof >= 0.4:
#         print(next_fact.context1)
#
#     if rof >= 0.5:
#         print(next_fact.context2)
#
#
#     user_answer = input("What is the capital of {}? \n".format(next_fact.question)).lower()
#     print("Rate of Forgetting: {}".format(rof))
#
#     # register the reponse
#     rt = round((time.time() - session_start - elapsed_time) * 1000)
#     start_time = elapsed_time * 1000
#     correct = user_answer == next_fact.answer
#     print(correct)
#     resp = Response(fact = next_fact, start_time = start_time, rt = rt, correct = correct)
#     model.register_response(resp)
#
#     print()
#
# model.export_data("data.csv")