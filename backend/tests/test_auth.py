def test_signup_login_logout_flow(client):
    signup = client.post(
        "/auth/signup",
        json={"name": "Alex", "email": "alex@example.com", "password": "password123"},
    )
    assert signup.status_code == 201
    assert client.cookies.get("orbitnote_token")

    me = client.get("/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "alex@example.com"

    logout = client.post("/auth/logout")
    assert logout.status_code == 204

    unauthorized = client.get("/auth/me")
    assert unauthorized.status_code == 401


def test_login_invalid_credentials(client):
    res = client.post(
        "/auth/login",
        json={"email": "missing@example.com", "password": "password123"},
    )
    assert res.status_code == 401
