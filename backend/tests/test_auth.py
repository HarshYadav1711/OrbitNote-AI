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


def test_login_success(client):
    client.post(
        "/auth/signup",
        json={"name": "Sam", "email": "sam@example.com", "password": "password123"},
    )
    client.post("/auth/logout")

    login = client.post(
        "/auth/login",
        json={"email": "sam@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    assert login.json()["email"] == "sam@example.com"
    assert client.cookies.get("orbitnote_token")

    me = client.get("/auth/me")
    assert me.status_code == 200


def test_signup_rejects_short_password(client):
    res = client.post(
        "/auth/signup",
        json={"name": "Alex", "email": "alex@example.com", "password": "short"},
    )
    assert res.status_code == 422
