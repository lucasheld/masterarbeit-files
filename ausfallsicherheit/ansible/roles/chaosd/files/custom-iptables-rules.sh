#!/bin/bash

iptables -N CHAOS-INPUT
iptables -N CHAOS-OUTPUT

iptables -I INPUT 1 -j CHAOS-INPUT
iptables -I OUTPUT 1 -j CHAOS-OUTPUT
