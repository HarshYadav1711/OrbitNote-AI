def _signup(client):
    client.post(
        "/auth/signup",
        json={"name": "Sam", "email": "sam@example.com", "password": "password123"},
    )


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
