const AUTH_SERVICE = "http://localhost:8080";
const CHAT_SERVICE = "http://localhost:8080";

const request = (options) => {
  const headers = new Headers();
  if (options.setContentType !== false) {
    headers.append("Content-Type", "application/json");
  }
  if (localStorage.getItem("token")) {
    headers.append(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );
  }
  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options).then((response) =>
    response.json().then((json) => {
      if (!response.ok) {
        console.log("Ошибка")
        return;
      }
      return json;
    })
  );
};


export function getUsers(role) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }
  if(role === "Клиент") {
    role = "doctors"
  } else {
    role = "clients"
  }
  return request({
    url: AUTH_SERVICE + "/api/users/" + role,
    method: "GET",
  });
}

export function getUsersAll(role) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: AUTH_SERVICE + "/api/users/" + role,
    method: "GET",
  });
}

export function setRoles(id, role) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }

  if(role === "client") {
    role = "ROLE_PATIENT"
  } else {
    role = "ROLE_DOCTOR"
  }

  return request({
    url: AUTH_SERVICE + "/api/users/role/" + id + "/" + role,
    method: "PUT",
  });
}

export function banUser(id) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: AUTH_SERVICE + "/api/users/" + id,
    method: "DELETE",
  });
}

export function countNewMessages(senderId, recipientId) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: CHAT_SERVICE + "/api/chats/messages/" + senderId + "/" + recipientId + "/count",
    method: "GET",
  });
}

export function findChatMessages(senderId, recipientId) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: CHAT_SERVICE + "/api/chats/messages/" + senderId + "/" + recipientId,
    method: "GET",
  });
}

export function findChatMessage(id) {
  if (!localStorage.getItem("token")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: CHAT_SERVICE + "/messages/" + id,
    method: "GET",
  });
}
