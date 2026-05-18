def _signup_and_note(client, content: str, title: str = "Meeting notes"):
    client.post(
        "/auth/signup",
        json={"name": "AI User", "email": "ai@example.com", "password": "password123"},
    )
    created = client.post(
        "/notes",
        json={"title": title, "content": content, "tags": []},
    )
    return created.json()["id"]


def test_summary_fallback(client):
    note_id = _signup_and_note(
        client,
        "We need to ship the MVP by Friday.\n"
        "- [ ] Write API tests\n"
        "- [ ] Update documentation\n"
        "The team agreed on a phased rollout.",
    )

    res = client.post(f"/notes/{note_id}/ai/summary", json={})
    assert res.status_code == 200
    body = res.json()
    assert body["type"] == "summary"
    assert body["status"] == "success"
    assert body["provider"] in ("ollama", "fallback")
    assert body["result"]["summary"]
    assert isinstance(body["result"]["bullets"], list)
    assert body["history_id"] > 0


def test_actions_extraction(client):
    note_id = _signup_and_note(
        client,
        "TODO: call the client\n"
        "We should review the design before launch.\n"
        "Random context paragraph.",
    )

    res = client.post(f"/notes/{note_id}/ai/actions", json={})
    assert res.status_code == 200
    items = res.json()["result"]["items"]
    assert len(items) >= 1
    texts = " ".join(i["text"].lower() for i in items)
    assert "call" in texts or "review" in texts or "todo" in texts


def test_title_suggestion(client):
    note_id = _signup_and_note(client, "Quarterly planning session outcomes", title="Untitled")

    res = client.post(f"/notes/{note_id}/ai/title", json={})
    assert res.status_code == 200
    title = res.json()["result"]["title"]
    assert title
    assert title != ""


def test_ai_uses_draft_content(client):
    note_id = _signup_and_note(client, "old content", title="Old")

    res = client.post(
        f"/notes/{note_id}/ai/title",
        json={"content": "Launch checklist for OrbitNote beta", "title": "Untitled"},
    )
    assert res.status_code == 200
    title = res.json()["result"]["title"].lower()
    assert "launch" in title or "orbitnote" in title or "checklist" in title or "beta" in title


def test_ai_history(client):
    note_id = _signup_and_note(client, "History test note with enough content to summarize.")

    client.post(f"/notes/{note_id}/ai/summary", json={})
    client.post(f"/notes/{note_id}/ai/actions", json={})

    history = client.get(f"/notes/{note_id}/ai/history")
    assert history.status_code == 200
    entries = history.json()
    assert len(entries) >= 2
    types = {e["type"] for e in entries}
    assert "summary" in types
    assert "actions" in types


def test_ai_requires_auth(client):
    res = client.post("/notes/1/ai/summary", json={})
    assert res.status_code == 401
