#!/usr/bin/env python3
import os
import subprocess
from flask import Flask
from prometheus_flask_exporter.multiprocess import GunicornPrometheusMetrics


INTERFACE = os.environ.get("INTERFACE", default="wg0")


app = Flask(__name__)
GunicornPrometheusMetrics(app)


def check_running():
    try:
        subprocess.check_output(f"ip link show {INTERFACE} up", shell=True, stderr=subprocess.DEVNULL)
        return True
    except:
        return False


@app.route("/")
def root():
    if check_running():
        return "healthy"
    else:
        return "unhealthy", 503


if __name__ == "__main__":
    app.run()
