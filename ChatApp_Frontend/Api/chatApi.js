var host = "localhost:5142";

async function findUsers(username) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found in localStorage");
    return null;
  }

  const response = await fetch(
    `http://${host}/Chat/find?username=${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch:", response.status);
    return null;
  }

  const users = await response.json();
  return users;
}


async function getFriends() {
  const token = localStorage.getItem("token"); 
  const response = await fetch(
    `http://${host}/Chat/friends`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if(!response.ok) {
    console.error("Failed to fetch:", response.status);
    return null;
  }
  const users = await response.json();
  // console.log(users);
  return users;
}


export {findUsers , getFriends};
