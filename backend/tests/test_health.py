def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["environment"] == "development"


def test_health_ready(client):
    res = client.get("/health/ready")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "database": "ok"}
