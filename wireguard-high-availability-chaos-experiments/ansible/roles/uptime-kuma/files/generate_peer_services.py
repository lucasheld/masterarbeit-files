#!/usr/bin/env python3
import argparse
import ipaddress
import json


def get_ip_version(ip_address):
    try:
        return "ipv4" if type(ipaddress.ip_address(ip_address)) is ipaddress.IPv4Address else "ipv6"
    except ValueError:
        return


def subnet_ips_to_ips(allowed_ips):
    ips = []
    for allowed_ip in allowed_ips:
        ip = allowed_ip.split("/")[0]
        ips.append(ip)
    return ips


def generate_monitors(hosts):
    out = []
    for host in hosts:
        ips = host["ips"]
        for service in host.get("services", []):
            for rule in service.get("rules", []):
                protocol = rule.get("protocol")
                if protocol != "tcp":
                    continue
                for port in rule.get("ports", []):
                    for ip in ips:
                        if get_ip_version(ip) == "ipv4":
                            socket = f"{ip}:{port}"
                        else:
                            socket = f"[{ip}]:{port}"
                        out.append({
                            "socket": socket,
                            "port": port,
                            "ip": ip
                        })
    return out


def get_args():
    parser = argparse.ArgumentParser(description="generate uptime kuma monitor info based on the wireguard config")
    parser.add_argument("--interface", required=True, help="wireguard interface config")
    parser.add_argument("--peers", required=True, help="wireguard peers config")
    args = parser.parse_args()
    return args


def main():
    args = get_args()
    interface = json.loads(args.interface)
    peers = json.loads(args.peers)

    hosts = []
    hosts.append({
        "ips": subnet_ips_to_ips(interface.pop("address")),
        **interface
    })
    for peer in peers:
        hosts.append({
            "ips": subnet_ips_to_ips(peer.pop("allowed_ips")),
            **peer
        })

    monitors = generate_monitors(hosts)
    print(json.dumps(monitors))


if __name__ == "__main__":
    main()
