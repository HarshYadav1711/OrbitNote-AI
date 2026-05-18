def _signup(client):
    client.post(
        "/auth/signup",
        json={"name": "Sam", "email": "sam@example.com", "password": "password123"},
    )


def test_dashboard_metrics(client):
    _signup(client)

    client.post(
        "/notes",
        json={
            "title": "Note A",
            "content": "alpha",
            "tags": ["work", "ideas"],
        },
    )
    note_b = client.post(
        "/notes",
        json={"title": "Note B", "content": "beta", "tags": ["work"]},
    ).json()

    client.post(f"/notes/{note_b['id']}/ai/summary", json={"content": "beta", "title": "Note B"})

    res = client.get("/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_notes"] == 2
    assert data["archived_notes"] == 0
    assert data["shared_notes"] == 0
    assert data["ai_assisted_notes"] >= 1
    assert len(data["recently_edited"]) >= 2
    assert any(t["name"] == "work" for t in data["top_tags"])
    assert data["ai_usage"]["total_requests"] >= 1
    assert len(data["weekly_activity"]) == 7


def test_dashboard_requires_auth(client):
    res = client.get("/analytics/dashboard")
    assert res.status_code == 401
