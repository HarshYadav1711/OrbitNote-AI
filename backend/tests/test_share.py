def _signup(client):
    client.post(
        "/auth/signup",
        json={"name": "Sam", "email": "sam@example.com", "password": "password123"},
    )


def test_share_public_visibility(client):
    _signup(client)

    created = client.post(
        "/notes",
        json={"title": "Shared Doc", "content": "Hello world", "tags": ["demo"]},
    )
    note_id = created.json()["id"]
    assert created.json()["is_public"] is False

    enable = client.post(f"/notes/{note_id}/share")
    assert enable.status_code == 200
    body = enable.json()
    assert body["is_public"] is True
    assert body["share_token"]
    assert "/share/" in body["share_url"]
    token = body["share_token"]

    public = client.get(f"/public/notes/{token}")
    assert public.status_code == 200
    assert public.json()["title"] == "Shared Doc"
    assert public.json()["content"] == "Hello world"

    disable = client.delete(f"/notes/{note_id}/share")
    assert disable.status_code == 200
    assert disable.json()["is_public"] is False

    hidden = client.get(f"/public/notes/{token}")
    assert hidden.status_code == 404


def test_public_note_requires_valid_token(client):
    res = client.get("/public/notes/not-a-real-token")
    assert res.status_code == 404


def test_archived_notes_not_publicly_visible(client):
    _signup(client)
    created = client.post("/notes", json={"title": "Archive me", "content": "x"})
    note_id = created.json()["id"]
    share = client.post(f"/notes/{note_id}/share")
    token = share.json()["share_token"]
    client.patch(f"/notes/{note_id}", json={"is_archived": True})
    res = client.get(f"/public/notes/{token}")
    assert res.status_code == 404
