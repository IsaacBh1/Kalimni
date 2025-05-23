
var host = "localhost:5142";
async function getAllMessages(senderId, receiverId, pageNumber = 1, pageSize = 50) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://${host}/api/Messages?senderId=${senderId}&receiverId=${receiverId}&pageNumber=${pageNumber}&pageSize=${pageSize}&sortOrder=asc`,
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
  const MessagesInfo = await response.json();
  console.log(MessagesInfo);
  return MessagesInfo;
}


async function sendMessage(message) {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://${host}/api/Messages`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    console.error("Failed to send message:", response.status);
    return null;
  }

  const result = await response.json();
  console.log(result);
  return result;
}


export { getAllMessages , sendMessage };
