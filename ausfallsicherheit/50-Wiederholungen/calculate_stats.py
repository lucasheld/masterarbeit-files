import os
import json
import datetime
import numpy as np
from glob import glob


with open("experiments.json") as f:
    experiments = json.load(f)


def get_experiment(name):
    for e in experiments:
        if e["name"] == name:
            return e


def datetime_to_timestamp(dt):
    return int(dt.timestamp() * 1000)


def format_values(raw_values):
    values = []
    for i in range(len(raw_values[0])):
        timestamp = raw_values[0][i]
        value = raw_values[1][i]
        values.append([timestamp, value])
    return values


def remove_values_before_timestamp(values, timestamp):
    out_values = []
    for value in values:
        if value[0] >= timestamp:
            out_values.append(value)
    return out_values


def remove_values_after_max_peers(values):
    out_values = []
    for i in range(len(values)):
        value = values[i]
        out_values.append(value)
        if value[1] == 300 and all([v[1] == 300 for v in values[i:]]):
            break
    return out_values


def select_failover_server(server1, server2):
    if not server1:
        return server2
    if not server2:
        return server1
    if server1[-1][1] == 300:
        return server1
    elif server2[-1][1] == 300:
        return server2
    else:
        raise Exception("Failover server select failed")


all_values = []
files = glob("./queries/*/wireguard_peers.json")
for path in files:
    with open(path) as f:
        data = json.load(f)
    
    experiment_name = os.path.basename(os.path.dirname(path))
    experiment = get_experiment(experiment_name)

    start_time = datetime.datetime.fromisoformat(experiment["created_at"]) + datetime.timedelta(minutes=1)
    start_timestamp = datetime_to_timestamp(start_time)

    server1 = data["results"]["A"]["frames"][0]["data"]["values"]
    server1 = format_values(server1)
    server1 = remove_values_before_timestamp(server1, start_timestamp)
    server1 = remove_values_after_max_peers(server1)

    server2 = data["results"]["B"]["frames"][0]["data"]["values"]
    server2 = format_values(server2)
    server2 = remove_values_before_timestamp(server2, start_timestamp)
    server2 = remove_values_after_max_peers(server2)

    failover_server = select_failover_server(server1, server2)

    all_values.append(len(failover_server)*15)


print(all_values)
print("Minimum:", round(np.min(all_values), 2))
print("Maximum:", round(np.max(all_values), 2))
print("Mittelwert:", round(np.mean(all_values), 2))
print("Standardabweichung:", round(np.std(all_values), 2))
