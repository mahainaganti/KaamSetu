"""Concurrency demo for the DBMS deliverable: fire N simultaneous
accepts at the same set of offers on one service_request and show that
exactly one wins. Requires the Flask app running (python app.py) and at
least N workers with worker_status rows online near the given lat/lng.

Usage: python scripts/stress_test_claim.py [N]
"""
import sys
import threading

import requests

API = "http://127.0.0.1:5000"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 5


def main():
    worker_ids = list(range(1, N + 1))
    for wid in worker_ids:
        requests.post(f"{API}/worker-status/{wid}/duty",
                       json={"duty_status": "online", "lat": 29.45, "lng": 77.31})

    resp = requests.post(f"{API}/service-requests", json={
        "customer_id": 1,
        "raw_text": "urgent plumbing repair, tap leaking",
        "lat": 29.448, "lng": 77.310,
        "category_hint": "plumbing",
    })
    resp.raise_for_status()
    body = resp.json()
    request_id = body["request_id"]
    offers = body["offers"]
    print(f"request_id={request_id}, {len(offers)} offers dispatched in wave 1")

    if not offers:
        print("No offers dispatched — need more online workers near this location.")
        return

    results = [None] * len(offers)

    def accept(i, offer):
        r = requests.post(f"{API}/job-offers/{offer['offer_id']}/accept",
                           json={"worker_id": offer["worker_id"]})
        results[i] = (offer["worker_id"], r.status_code, r.json())

    threads = [threading.Thread(target=accept, args=(i, o)) for i, o in enumerate(offers)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    wins = [r for r in results if r[2].get("won")]
    losses = [r for r in results if not r[2].get("won")]

    print(f"\n{len(wins)} winner(s), {len(losses)} rejected:")
    for worker_id, status, body in results:
        tag = "WON " if body.get("won") else "LOST"
        print(f"  worker {worker_id}: {tag} ({status}) {body}")

    assert len(wins) == 1, f"expected exactly 1 winner, got {len(wins)}"
    print("\nPASS: exactly one concurrent accept won the race.")


if __name__ == "__main__":
    main()
