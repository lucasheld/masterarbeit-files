import re
import os
import time
import yaml
import requests
import subprocess
import dataclasses
import threading
import copy
from hcloud import Client


SERVER_IP_1 = "<SERVER_IP_1>"
SERVER_IP_2 = "<SERVER_IP_2>"
FLOATING_IP = "<FLOATING_IP>"
HCLOUD_TOKEN = "<HCLOUD_TOKEN>"


def get_ip_active() -> str:
    ifconfig_out = subprocess.check_output(f"ssh -o StrictHostKeyChecking=no root@{FLOATING_IP} ifconfig eth0", shell=True, stderr=subprocess.DEVNULL).decode("utf-8")
    ip = re.search(r'inet ([^ ]+)', ifconfig_out).group(1)
    return ip


def get_ip_inactive() -> str:
    floating_server_ip = get_ip_active()
    if floating_server_ip == SERVER_IP_1:
        ip = SERVER_IP_2
    else:
        ip = SERVER_IP_1
    return ip


def get_peers_ip() -> str:
    return requests.get("https://ipv4.wtfismyip.com/text").text.strip()


@dataclasses.dataclass
class Experiment:
    action: str = None
    params: dict = None
    duration: str = "10m"
    name: str = None
    ip: str = get_ip_active
    action_title: str = None
    description: str = None
    custom_action: callable = None
    sleep: int = 20*60


def build_yml(experiment: Experiment) -> str:
    d = {
        "kind": "PhysicalMachineChaos",
        "apiVersion": "chaos-mesh.org/v1alpha1",
        "metadata": {
            "namespace": "default",
            "name": experiment.name
        },
        "spec": {
            "action": experiment.action,
            "address": [
                f"https://{experiment.ip}:31768"
            ],
            "selector": {},
            "mode": "all",
            experiment.action: experiment.params,
            "duration": experiment.duration
        }
    }
    return yaml.dump(d)


def prepare_experiment(e: Experiment):
    # set name
    if e.action_title:
        action = e.action_title
    else:
        action = e.action
    e.name = f"{action}{f'-{e.description}' if e.description else ''}-{'active' if e.ip == get_ip_active else 'inactive'}-{int(time.time())}"

    # call callables from dataclass values
    for field in dataclasses.fields(e):
        val = getattr(e, field.name)
        if callable(val) and field.name != "custom_action":
            setattr(e, field.name, val())
    
    # call callables from params values
    for k in e.params:
        if callable(e.params[k]):
            e.params[k] = e.params[k]()


def run_experiment(e: Experiment):
    experiment_yaml = build_yml(e)
    print(experiment_yaml)

    yamldir = "yamls"
    os.makedirs(yamldir, exist_ok=True)

    yamlfile = os.path.join(yamldir, f"{e.name}.yml")
    with open(yamlfile, "w") as f:
        f.write(experiment_yaml)
    
    command = f"kubectl apply -f {yamlfile}"
    subprocess.call(command, shell=True)


def start_server(e: Experiment):
    time.sleep(e.sleep/2)
    client = Client(token=HCLOUD_TOKEN)
    servers = client.servers.get_all()
    for server in servers:
        current_server_ip = server.data_model.public_net.ipv4.ip
        if current_server_ip == e.ip:
            server.power_on()


def build_experiments() -> list[Experiment]:
    experiments: list[Experiment] = []

    # server-shutdown-active
    experiments.append(Experiment(
        action="user_defined",
        action_title="server-shutdown",
        ip=get_ip_active,
        params={
            "attackCmd": "shutdown -h +1",
            "recoverCmd": "true"
        },
        duration="1s",
        custom_action=start_server
    ))

    # network-loss-health-check-port-to-other-server-percent-75
    experiments.append(Experiment(
        action="network-loss",
        description="health-check-port-to-other-server",
        ip=get_ip_inactive,
        params={
            "percent": "75",
            "device": "eth0",
            "ip-address": get_ip_active,
            "ip-protocol": "tcp",
            "egress-port": "80"            
        }
    ))

    # network-delay-health-check-port-to-other-server-latency-10s
    experiments.append(Experiment(
        action="network-delay",
        description="health-check-port-to-other-server",
        ip=get_ip_inactive,
        params={
            "latency": "10s",
            "device": "eth0",
            "ip-address": get_ip_active,
            "ip-protocol": "tcp",
            "egress-port": "80"
        }
    ))
    
    # network-loss-wg-port-to-peers-percent-100
    experiments.append(Experiment(
        action="network-loss",
        description="wg-port-to-peers",
        ip=get_ip_active,
        params={
            "percent": "100",
            "device": "eth0",
            "ip-address": get_peers_ip,
            "ip-protocol": "udp",
            "source-port": "51820"
        }
    ))
    
    # stop-health-check
    experiments.append(Experiment(
        action="user_defined",
        action_title="stop-health-check",
        ip=get_ip_active,
        params={
            "attackCmd": "docker stop health_check-health_check-1",
            "recoverCmd": "docker start health_check-health_check-1"
        }
    ))
    
    # stop-wireguard
    experiments.append(Experiment(
        action="user_defined",
        action_title="stop-wireguard",
        ip=get_ip_active,
        params={
            "attackCmd": "systemctl stop wg-quick@wg0.service",
            "recoverCmd": "systemctl start wg-quick@wg0.service"
        }
    ))

    return experiments


def multiply_experiments(experiments: list[Experiment], factor: int) -> list[Experiment]:
    multiple_experiments = []
    for e in experiments:
        for _ in range(factor):
            multiple_experiments.append(
                copy.deepcopy(e)
            )
    return multiple_experiments


def main():
    experiments = build_experiments()
    experiments = multiply_experiments(experiments, 3)  # run every experiment 3 times
    print(f"run {len(experiments)} experiments")
    for e in experiments:
        prepare_experiment(e)
        run_experiment(e)
        if e.custom_action:
           thread = threading.Thread(target=e.custom_action, args=(e,))
           thread.start()
        time.sleep(e.sleep)


if __name__ == "__main__":
    main()
