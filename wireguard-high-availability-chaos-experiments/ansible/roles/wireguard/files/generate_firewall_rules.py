#!/usr/bin/env python3
import argparse
import ipaddress
import json


def build_command(rule):
    cmd = ""
    if rule["type"] == "ipv4":
        cmd += "iptables -A wg0-filter"
    else:
        cmd += "ip6tables -A wg0-filter6"
    cmd += f" -s {rule['src']} -d {rule['dst']}"
    if rule.get("protocol"):
        cmd += f" -p {rule['protocol']}"
    if rule.get("port"):
        cmd += f" --dport {rule['port']}"
    cmd += " -j ACCEPT"
    return cmd


def build_commands(rules):
    cmds = []
    for rule in rules:
        cmd = build_command(rule)
        cmds.append(cmd)
    return cmds


def get_ip_version(ip_address):
    try:
        return "ipv4" if type(ipaddress.ip_address(ip_address)) is ipaddress.IPv4Address else "ipv6"
    except ValueError:
        return


def find_hosts_and_services_by_allowed_tag(hosts, allowed_tag):
    out = []
    for host in hosts:
        for service in host.get("services", []):
            for allowed_tags in service.get("allowed_tags", []):
                if allowed_tag in allowed_tags:
                    out.append((host, service))
    return out


def subnet_ips_to_ips(allowed_ips):
    ips = []
    for allowed_ip in allowed_ips:
        ip = allowed_ip.split("/")[0]
        ips.append(ip)
    return ips


def generate_rules_by_hosts(hosts):
    rules = []
    for host in hosts:
        for tag in host.get("tags", []):
            allowed_hosts_and_services = find_hosts_and_services_by_allowed_tag(hosts, tag)
            for allowed_host, service in allowed_hosts_and_services:
                host_ips = host["ips"]
                allowed_host_ips = allowed_host["ips"]
                for host_ip in host_ips:
                    for allowed_host_ip in allowed_host_ips:
                        host_ip_version = get_ip_version(host_ip)
                        allowed_host_ip_version = get_ip_version(allowed_host_ip)
                        if host_ip_version == allowed_host_ip_version:
                            for service_rule in service.get("rules", []):
                                for port in service_rule.get("ports", [None]):
                                    rule = {
                                        "src": host_ip,
                                        "dst": allowed_host_ip,
                                        "port": port,
                                        "protocol": service_rule.get("protocol"),
                                        "type": host_ip_version
                                    }
                                    rules.append(rule)
    return rules


def add_rule_for_each_port(rules):
    rules_new = []
    for rule in rules:
        ports = rule.get("ports")
        if ports:
            for port in ports:
                new_rule = rule.copy()
                new_rule["port"] = port
                new_rule.pop("ports")
                rules_new.append(new_rule)
        else:
            rules_new.append(rule)
    return rules_new


def get_args():
    parser = argparse.ArgumentParser(description="generate firewall rules based on the wireguard config")
    parser.add_argument("--interface", help="wireguard interface config")
    parser.add_argument("--peers", help="wireguard peers config")
    parser.add_argument("--custom-rules", help="wireguard custom rules config")
    args = parser.parse_args()
    return args


def main():
    args = get_args()
    all_cmds = []

    hosts = []

    if args.interface:
        interface = json.loads(args.interface)
        hosts.append({
            "ips": subnet_ips_to_ips(interface.pop("address")),
            **interface
        })
    
    if args.peers:
        peers = json.loads(args.peers)        
        for peer in peers:
            hosts.append({
                "ips": subnet_ips_to_ips(peer.pop("allowed_ips")),
                **peer
            })
    
    if hosts:
        rules = generate_rules_by_hosts(hosts)
        cmds = build_commands(rules)
        all_cmds.extend(cmds)

    if args.custom_rules:
        custom_rules = json.loads(args.custom_rules)
        rules = add_rule_for_each_port(custom_rules)
        cmds = build_commands(rules)
        all_cmds.extend(cmds)

    print(json.dumps(all_cmds))


if __name__ == "__main__":
    main()
