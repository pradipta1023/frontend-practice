const PORT = 8000;
const listener = Deno.listen({ port: PORT });

const buffer = new Uint8Array(1024);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const users = [];

const getResponse = async (conn) => {
  const bytesRead = await conn.read(buffer);
  if (bytesRead === null) return { isClosed: true };
  const data = decoder.decode(buffer.subarray(0, bytesRead));
  return { data };
};

const broadcast = async (message) => {
  for (const user of users) {
    console.log({ user });
    await user.conn.write(encoder.encode(message));
  }
};

const deleteUser = (conn) => {
  const leftUserIdx = users.findIndex((user) => user.conn === conn);
  users.splice(leftUserIdx, 1);
};

const handleResponse = async (conn, name) => {
  console.log(`Welcome to the game ${name}`);
  while (true) {
    await conn.write(encoder.encode("Please enter your : "));
    const response = await getResponse(conn);
    if (response.isClosed) {
      console.log(`${name} left`);
      break;
    }
    await broadcast(`Response from ${name} : ${response.data}`);
  }
  conn.close();
  deleteUser(conn);
  broadcast(`${name} left from server`);
  console.log("Connection closed");
};

const listen = async () => {
  console.log(`Listening on port : ${PORT}`);
  for await (const conn of listener) {
    await conn.write(encoder.encode("Please enter name: "));
    const response = await getResponse(conn);
    if (response.isClosed) {
      console.log("Player closed connection");
      continue;
    }
    users.push({ name: response.data, conn });
    handleResponse(conn, response.data);
  }
};

listen();
