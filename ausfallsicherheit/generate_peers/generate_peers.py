import os
import math
import jinja2
import subprocess


configs_dir = "./configs"

peer_count = 300

server_endpoint = "116.202.178.112"
server_public_key = "9Q1OQ7+ZlIPIZhEuWYuC7py1QiAlsqtMNB5agI8SoS0="

start_subnet = 1

current_address = 0
peers = []


def gen_private_key():
    return subprocess.check_output("wg genkey", shell=True).decode("utf-8").strip()

def gen_public_key(private_key: str):
    return subprocess.check_output(f"echo '{private_key}' | wg pubkey", shell=True).decode("utf-8").strip()

def generate_template(template, **kwargs):
    env = jinja2.Environment(loader=jinja2.FileSystemLoader("."))
    template = env.get_template(template)
    rendered = template.render(**kwargs)
    return rendered

def gen_address():
    global current_address

    subnet = start_subnet + math.floor(current_address / 256)
    host = current_address % 256
    current_address += 1
    return [
        f"10.0.{subnet}.{host}/32",
        f"fdc9:281f:04d7:9ee9::{subnet}:{host}/128"
    ]

def gen_peer(number):
    private_key = gen_private_key()
    public_key = gen_public_key(private_key)
    address = gen_address()

    # write ansible config
    peer = {
        "number": number,
        "public_key": public_key,
        "address": address
    }
    peers.append(peer)

    # write wireguard config
    env = jinja2.Environment(loader=jinja2.FileSystemLoader("."))
    template = env.get_template("wg.conf.j2")
    rendered = template.render(
        private_key=private_key,
        address=address,
        server_public_key=server_public_key,
        server_endpoint=server_endpoint
    )
    config_dir = os.path.join(configs_dir, f"config{number}")
    os.makedirs(config_dir, exist_ok=True)
    with open(f"{config_dir}/wg0.conf", "w") as f:
        f.write(rendered)


for i in range(peer_count):
    gen_peer(i)

peers_rendered = generate_template("peers.yml.j2", peers=peers)
with open("/home/lucas/Projects/wg-high-availability/ansible/group_vars/all/peers", "w") as f:
    f.write(peers_rendered)

docker_compose_rendered = generate_template("docker-compose.yml.j2", peers=peers)
with open("docker-compose.yml", "w") as f:
    f.write(docker_compose_rendered)
