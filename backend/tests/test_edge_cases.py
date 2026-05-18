def _signup(client, email="edge@example.com"):
    return client.post(
        "/auth/signup",
        json={"name": "Edge", "email": email, "password": "password123"},
    )


def test_duplicate_signup_rejected(client):
    _signup(client)
    dup = _signup(client)
    assert dup.status_code == 400


def test_get_note_not_found(client):
    _signup(client)
    res = client.get("/notes/99999")
    assert res.status_code == 404


def test_notes_category_filter_and_tag_normalization(client):
    _signup(client)
    client.post(
        "/notes",
        json={
            "title": "Work item",
            "content": "Category test",
            "category": "Work",
            "tags": ["Planning", "planning"],
        },
    )
    client.post(
        "/notes",
        json={"title": "Personal", "content": "Other", "category": "personal", "tags": []},
    )

    by_category = client.get("/notes", params={"category": "work"})
    assert by_category.status_code == 200
    assert len(by_category.json()) == 1
    assert by_category.json()[0]["category"] == "Work"

    by_tag = client.get("/notes", params={"tag": "planning"})
    assert by_tag.status_code == 200
    assert len(by_tag.json()) == 1
    assert len(by_tag.json()[0]["tags"]) == 1
    assert by_tag.json()[0]["tags"][0]["name"] == "planning"


def test_share_requires_owner(client):
    _signup(client, "owner@example.com")
    created = client.post("/notes", json={"title": "Private", "content": "x"})
    note_id = created.json()["id"]

    _signup(client, "other@example.com")
    res = client.post(f"/notes/{note_id}/share")
    assert res.status_code == 404


def test_list_archived_notes(client):
    _signup(client)
    created = client.post("/notes", json={"title": "To archive", "content": ""})
    note_id = created.json()["id"]
    client.patch(f"/notes/{note_id}", json={"is_archived": True})

    active = client.get("/notes")
    assert len(active.json()) == 0

    archived = client.get("/notes", params={"archived": "true"})
    assert len(archived.json()) == 1
    assert archived.json()[0]["is_archived"] is True
