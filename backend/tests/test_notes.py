def _signup(client):
    client.post(
        "/auth/signup",
        json={"name": "Sam", "email": "sam@example.com", "password": "password123"},
    )


def test_notes_require_authentication(client):
    assert client.get("/notes").status_code == 401
    assert client.post("/notes", json={"title": "x", "content": ""}).status_code == 401


def test_get_note_by_id(client):
    _signup(client)
    created = client.post("/notes", json={"title": "One", "content": "Body"})
    note_id = created.json()["id"]

    fetched = client.get(f"/notes/{note_id}")
    assert fetched.status_code == 200
    assert fetched.json()["title"] == "One"
    assert fetched.json()["content"] == "Body"


def test_notes_crud_and_filters(client):
    _signup(client)

    created = client.post(
        "/notes",
        json={
            "title": "Project Plan",
            "content": "Build OrbitNote foundation",
            "category": "work",
            "tags": ["planning", "foundation"],
        },
    )
    assert created.status_code == 201
    note_id = created.json()["id"]

    listed = client.get("/notes", params={"q": "Orbit", "tag": "foundation"})
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.patch(f"/notes/{note_id}", json={"title": "Updated Plan"})
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Plan"

    archived = client.patch(f"/notes/{note_id}", json={"is_archived": True})
    assert archived.status_code == 200
    assert archived.json()["is_archived"] is True

    restored = client.patch(f"/notes/{note_id}", json={"is_archived": False})
    assert restored.status_code == 200

    deleted = client.delete(f"/notes/{note_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/notes/{note_id}")
    assert missing.status_code == 404
