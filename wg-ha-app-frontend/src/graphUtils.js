import {MarkerType} from "reactflow";
import Address from "ipaddr.js";

const groupObjects = (items, keyGetter) => {
    let map = {};
    items.forEach(item => {
        let key = keyGetter(item);
        if (!Object.keys(map).includes(key)) {
            map[key] = [];
        }
        map[key].push(item);
    })
    return Object.values(map);
}

const find_peers_and_services_by_allowed_tag = (peers, allowed_tag) => {
    let out = [];
    peers.forEach(peer => {
        peer.services.forEach(service => {
            service.allowed_tags.forEach(allowed_tag_1 => {
                if (allowed_tag_1 === allowed_tag) {
                    out.push({
                        peer,
                        service
                    })
                }
            })
        })
    })
    return out;
}

const allowed_ips_to_ips = (allowed_ips) => {
    let ips = []
    allowed_ips.forEach(allowed_ip => {
        let ip = allowed_ip.split("/")[0]
        ips.push(ip)
    })
    return ips
}

const get_ip_version = (ip_address) => {
    const addr = Address.parse(ip_address);
    return addr.kind();
}

const removeDuplicates = arr => {
    return Array.from(new Set(arr.map(JSON.stringify))).map(JSON.parse);
};

const generateClientsNodesEdges = (clients) => {
    let nodes = [];
    let edges = [];

    // add node for each client
    clients.forEach(client => {
        nodes.push({
            id: `client-${client.id}`,
            position: {
                x: 0,
                y: 0
            },
            data: {
                label: `${client.title}`
            },
            style: {
                opacity: 0.9
            }
        });
    });

    // generate rules for client services based on tags and allowed_tags
    let rules = []
    clients.forEach(peer => {
        peer.tags.forEach(tag => {
            let allowed_peers_and_services = find_peers_and_services_by_allowed_tag(clients, tag)
            allowed_peers_and_services.forEach(allowed_peer_and_service => {
                let allowed_peer = allowed_peer_and_service.peer;
                let service = allowed_peer_and_service.service;
                let peer_ips = allowed_ips_to_ips(peer.allowed_ips);
                let allowed_peer_ips = allowed_ips_to_ips(allowed_peer.allowed_ips);
                peer_ips.forEach(peer_ip => {
                    allowed_peer_ips.forEach(allowed_peer_ip => {
                        let peer_ip_version = get_ip_version(peer_ip);
                        let allowed_peer_ip_version = get_ip_version(allowed_peer_ip);
                        if (peer_ip_version === allowed_peer_ip_version) {
                            service.rules.forEach(service_rule => {
                                if (service_rule.ports?.length) {
                                    service_rule.ports.forEach(port => {
                                        rules.push({
                                            "src": peer,
                                            "dst": allowed_peer,
                                            "protocol": service_rule.protocol,
                                            "port": port,
                                            "type": peer_ip_version
                                        })
                                    })
                                } else {
                                    rules.push({
                                        "src": peer,
                                        "dst": allowed_peer,
                                        "protocol": service_rule.protocol,
                                        "type": peer_ip_version
                                    })
                                }
                            })
                        }
                    })
                })
            })
        })
    })

    // group rules by src and dst
    let groupedRules = groupObjects(rules, rule => [rule.src.id, rule.dst.id].sort().join());
    groupedRules.forEach(groupedRule => {
        // build label by merging labels with same src and dst and remove duplicates
        let labels = [];
        groupedRule.forEach(rule => {
            labels.push({
                protocol: rule.protocol,
                port: rule.port
            })
        })
        labels = removeDuplicates(labels);
        let label = "services:\n";
        labels.forEach((l, index) => {
            if (index !== 0) {
                label += "\n";
            }
            label += `${l.protocol}${l.port ? ` ${l.port}` : ""}`
        })

        // add edge for the rule
        let rule = groupedRule[0];
        let bidirectional = false;
        edges.push({
            id: `client-${rule.src.id}-client-${rule.dst.id}-${bidirectional}`,
            source: `client-${rule.src.id}`,
            target: `client-${rule.dst.id}`,
            markerEnd: {
                type: MarkerType.Arrow
            },
            animated: true,
            style: {
                strokeWidth: 2
            },
            data: {
                text: label
            },
            type: 'custom'
        })
    })
    return {
        nodes,
        edges
    }
}

const generateCustomRulesNodesEdges = (clients, customRules) => {
    // create a list of edges containing source node, destination node and label
    let newEdgesTemp = []
    clients.forEach(client_src => {
        let client_src_ips = allowed_ips_to_ips(client_src.allowed_ips);
        clients.forEach(client_dst => {
            if (client_src !== client_dst) {
                let client_dst_ips = allowed_ips_to_ips(client_dst.allowed_ips);

                client_src_ips.forEach(client_src_ip => {
                    client_dst_ips.forEach(client_dst_ip => {
                        customRules.forEach(customRule => {
                            if (
                                get_ip_version(client_src_ip) === get_ip_version(client_dst_ip) &&
                                get_ip_version(client_src_ip) === Address.parseCIDR(customRule.src)[0].kind()
                            ) {
                                let src_ip_match = Address.parse(client_src_ip).match(Address.parseCIDR(customRule.src));
                                let dst_ip_match = Address.parse(client_dst_ip).match(Address.parseCIDR(customRule.dst));
                                if (src_ip_match && dst_ip_match) {
                                    newEdgesTemp.push({
                                        src: client_src.id,
                                        dst: client_dst.id,
                                        label: customRule.title,
                                    })
                                }
                            }
                        })
                    })
                })
            }
        })
    })

    // add bidirectional value to edges
    newEdgesTemp = newEdgesTemp.map(edge => {
        let isBidirectional = false;
        newEdgesTemp.forEach(edge2 => {
            if (edge !== edge2) {
                if (edge.src === edge2.dst && edge.dst === edge2.src && edge.label === edge2.label) {
                    isBidirectional = true;
                }
            }
        })
        if (isBidirectional) {
            edge.bidirectional = true;
            return edge;
        } else {
            edge.bidirectional = false;
            return edge;
        }
    })

    // remove one bidirectional edge
    let newEdgesTempMap = {};
    newEdgesTemp.forEach(edge => {
        let key = [edge.src, edge.dst].sort().join() + edge.label;
        newEdgesTempMap[key] = edge;
    })
    newEdgesTemp = Object.values(newEdgesTempMap);

    // merge edges with same source and destination and bidirectional value
    let groupedEdges = groupObjects(newEdgesTemp, edge => [edge.src, edge.dst, edge.bidirectional].sort().join());
    newEdgesTemp = []
    groupedEdges.forEach(edges => {
        let label = "custom rules:\n";
        let edgeMerged = edges[0]
        edges.forEach((edge, index) => {
            if (index !== 0) {
                label += "\n";
            }
            label += edge.label;
        })
        newEdgesTemp.push({
            ...edgeMerged,
            label: label
        })
    })

    // add temp edges to edges
    let edges = [];
    newEdgesTemp.forEach(edgeTmp => {
        let edge;
        if (!edgeTmp.bidirectional) {
            edge = {
                markerEnd: {
                    type: MarkerType.Arrow
                },
                animated: true
            }
        } else {
            edge = {
                style: {
                    strokeDasharray: 5
                },
            }
        }
        edges.push({
            ...edge,
            id: `client-${edgeTmp.src}-client-${edgeTmp.dst}-${edgeTmp.bidirectional}`,
            source: `client-${edgeTmp.src}`,
            target: `client-${edgeTmp.dst}`,
            data: {
                text: edgeTmp.label,
            },
            style: {
                ...edge.style,
                strokeWidth: 2
            },
            type: 'custom'
        })
    })
    return edges;
}

const mergeServiceCustomRuleEdges = (edges) => {
    let groupedEdges = groupObjects(edges, edge => edge.id);
    let mergedEdges = []
    Object.values(groupedEdges).forEach(edges => {
        let label = "";
        let edgeMerged = edges[0]
        edges.forEach((edge, index) => {
            if (index !== 0) {
                label += "\n\n";
            }
            label += edge.data.text;
        })
        mergedEdges.push({
            ...edgeMerged,
            data: {
                ...edgeMerged.data,
                text: label
            }
        })
    })
    return mergedEdges;
}

const generateNodesAndEdges = (clients, customRules) => {
    let clientNodesEdges = generateClientsNodesEdges(clients);
    let customRuleEdges = generateCustomRulesNodesEdges(clients, customRules);

    let nodes = clientNodesEdges.nodes;
    let edges = mergeServiceCustomRuleEdges([...clientNodesEdges.edges, ...customRuleEdges]);

    return {
        nodes,
        edges
    }
}

export {generateNodesAndEdges}
