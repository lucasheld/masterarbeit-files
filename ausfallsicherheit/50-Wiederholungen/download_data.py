import os
import json
import shutil
import requests
import datetime


first_experiment_name = "server-shutdown-active-1698661316"
last_experiment_name = "server-shutdown-active-1698618619"

grafana_api_key = "glsa_XB63hYGUR2ZdrNuYXi18AwlfBCFaulkb_2ff24f82"


query_requests = {
    "wireguard_peers": {
        "id": "Q100",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"count(time() - wireguard_latest_handshake_seconds{interface=\"wg0\", instance=\"10.1.0.1:9586\"} < 170)","hide":False,"instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"9A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"count(time() - wireguard_latest_handshake_seconds{interface=\"wg0\", instance=\"10.2.0.1:9586\"} < 170)","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","exemplar":False,"requestId":"9B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "wireguard_traffic_received": {
        "id": "Q101",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(rate(wireguard_received_bytes_total{interface=\"wg0\", instance=\"10.1.0.1:9586\"}[$__rate_interval])*8)","instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"12A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","exemplar":False,"expr":"sum(rate(wireguard_received_bytes_total{interface=\"wg0\", instance=\"10.2.0.1:9586\"}[$__rate_interval])*8)","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","requestId":"12B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "wireguard_traffic_transmitted": {
        "id": "Q102",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(rate(wireguard_sent_bytes_total{interface=\"wg0\", instance=\"10.1.0.1:9586\"}[$__rate_interval])*8)","instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"13A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(rate(wireguard_sent_bytes_total{interface=\"wg0\", instance=\"10.2.0.1:9586\"}[$__rate_interval])*8)","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","exemplar":False,"requestId":"13B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "health_check_requests_per_minute": {
        "id": "Q103",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(increase(flask_http_request_total{status=\"200\", instance=\"10.1.0.1:9200\"}[1m]))","instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"27A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(increase(flask_http_request_total{status=\"200\", instance=\"10.2.0.1:9200\"}[1m]))","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","exemplar":False,"requestId":"27B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "health_check_errors_per_minute": {
        "id": "Q104",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(increase(flask_http_request_total{status\u0021=\"200\", instance=\"10.1.0.1:9200\"}[1m]))","instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"28A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(increase(flask_http_request_total{status\u0021=\"200\", instance=\"10.2.0.1:9200\"}[1m]))","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","exemplar":False,"requestId":"28B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "server_cpu": {
        "id": "Q105",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(irate(node_cpu_seconds_total{mode\u0021=\"idle\", instance=\"10.1.0.1:9100\"}[$__rate_interval]))","instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"17A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(irate(node_cpu_seconds_total{mode\u0021=\"idle\", instance=\"10.2.0.1:9100\"}[$__rate_interval]))","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","exemplar":False,"requestId":"17B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "server_memory": {
        "id": "Q106",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"node_memory_MemTotal_bytes{instance=\"10.1.0.1:9100\"} - node_memory_MemFree_bytes{instance=\"10.1.0.1:9100\"} - (node_memory_Cached_bytes{instance=\"10.1.0.1:9100\"} + node_memory_Buffers_bytes{instance=\"10.1.0.1:9100\"} + node_memory_SReclaimable_bytes{instance=\"10.1.0.1:9100\"})","instant":False,"legendFormat":"Server 1","range":True,"refId":"A","exemplar":False,"requestId":"18A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"node_memory_MemTotal_bytes{instance=\"10.2.0.1:9100\"} - node_memory_MemFree_bytes{instance=\"10.2.0.1:9100\"} - (node_memory_Cached_bytes{instance=\"10.2.0.1:9100\"} + node_memory_Buffers_bytes{instance=\"10.2.0.1:9100\"} + node_memory_SReclaimable_bytes{instance=\"10.2.0.1:9100\"})","hide":False,"instant":False,"legendFormat":"Server 2","range":True,"refId":"B","exemplar":False,"requestId":"18B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "traffic_received": {
        "id": "Q107",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(irate(node_network_receive_bytes_total{instance=\"10.1.0.1:9100\"}[$__rate_interval])*8)","format":"time_series","intervalFactor":1,"legendFormat":"Server 1","range":True,"refId":"A","step":240,"exemplar":False,"requestId":"19A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(irate(node_network_receive_bytes_total{instance=\"10.2.0.1:9100\"}[$__rate_interval])*8)","format":"time_series","intervalFactor":1,"legendFormat":"Server 2","range":True,"refId":"B","step":240,"exemplar":False,"requestId":"19B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
    "traffic_transmitted": {
        "id": "Q108",
        "queries": [{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(irate(node_network_transmit_bytes_total{instance=\"10.1.0.1:9100\"}[$__rate_interval])*8)","format":"time_series","intervalFactor":1,"legendFormat":"Server 1","range":True,"refId":"A","step":240,"exemplar":False,"requestId":"20A","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940},{"datasource":{"type":"prometheus","uid":"f7b42903-6f5e-4ac5-9ca1-64125ab39fa3"},"editorMode":"code","expr":"sum(irate(node_network_transmit_bytes_total{instance=\"10.2.0.1:9100\"}[$__rate_interval])*8)","format":"time_series","intervalFactor":1,"legendFormat":"Server 2","range":True,"refId":"B","step":240,"exemplar":False,"requestId":"20B","utcOffsetSec":0,"interval":"","datasourceId":1,"intervalMs":15000,"maxDataPoints":940}]
    },
}


def datetime_to_timestamp(dt):
    return int(dt.timestamp() * 1000)


def download_file(url, path):
    with requests.get(url, stream=True) as r:
        with open(path, 'wb') as f:
            shutil.copyfileobj(r.raw, f)


def download_pdf(time_from, time_to, name):
    timestamp_from = datetime_to_timestamp(time_from)
    timestamp_to = datetime_to_timestamp(time_to)

    directory = os.path.join(os.path.dirname(os.path.realpath(__file__)), "pdfs")
    os.makedirs(directory, exist_ok=True)

    url = f"http://192.168.10.214:8686/api/v5/report/b5c1a8f7-0fdf-4cfa-abc6-a945a84cf2f6?apitoken={grafana_api_key}&from={timestamp_from}&to={timestamp_to}"
    path = os.path.join(directory, f"{name}.pdf")
    download_file(url, path)


def download_query(time_from, time_to, name):
    timestamp_from = datetime_to_timestamp(time_from)
    timestamp_to = datetime_to_timestamp(time_to)

    directory = os.path.join(os.path.dirname(os.path.realpath(__file__)), "queries", name)
    os.makedirs(directory, exist_ok=True)

    for query_request_name in query_requests.keys():
        query_request_id = query_requests[query_request_name]["id"]
        query_request_queries = query_requests[query_request_name]["queries"]

        url = f"http://192.168.10.214:3000/api/ds/query?ds_type=prometheus&requestId={query_request_id}"
        payload = {
            "queries": query_request_queries,
            "from": str(timestamp_from),
            "to": str(timestamp_to)
        }
        headers = {
            "Authorization": f"Bearer {grafana_api_key}"
        }
        r = requests.post(url, json=payload, headers=headers)
        path = os.path.join(directory, f"{query_request_name}.json")
        with open(path, "w") as f:
            json.dump(r.json(), f)


experiments = []
r = requests.get("http://192.168.10.214:2333/api/experiments")
within_experiments = False
for e in r.json():
    if e["name"] == first_experiment_name:
        within_experiments = True
    if within_experiments:
        experiments.append(e)
    if e["name"] == last_experiment_name:
        break
experiments.reverse()

with open("experiments.json", "w") as f:
    json.dump(experiments, f)

print(len(experiments))

for e in experiments:
    name = e['name']
    start_time = datetime.datetime.fromisoformat(e["created_at"])
    end_time = start_time + datetime.timedelta(minutes=10)

    download_pdf(start_time, end_time, name)
    download_query(start_time, end_time, name)
