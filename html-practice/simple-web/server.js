const PORT = 8000;

const init = async () => await Deno.listen({ port: PORT });

const buffer = new Uint8Array(1024);
const decoder = new TextDecoder();
const encoder = new TextEncoder();

const craeteHeaders = (headers) =>
  Object.entries(headers).map((header) => header.join(":")).join("\r\n");

const createResponse = async (path) => {
  const content = await Deno.readTextFile(path);

  const headers = {
    "Content-Type": "text/html",
    "Content-Length": content.length,
  };

  return [craeteHeaders(headers), "", content];
};

const createSuccessResponse = async (path) =>
  [`HTTP/1.1 200 ok`, ...(await createResponse(path))].join("\r\n");

const write = async (conn, path) =>
  await conn.write(encoder.encode(await createSuccessResponse(path)));

const handleRequest = async (conn) => {
  const bytesRead = await conn.read(buffer);
  const request = decoder.decode(buffer.subarray(0, bytesRead));
  const [requestLine] = request.split("\r\n");
  const [method, path, protocol] = requestLine.split(" ");
  switch (path) {
    case "/":
    case "/home":
      await write(conn, "./HTML/home.html");
      break;
    case "/login":
      await write(conn, "./HTML/login.html");
      break;
    default:
      break;
  }
  console.log({ method, path, protocol });
};

const listen = async () => {
  const listener = await init();
  console.log(`Listening on port : ${PORT}`);

  for await (const conn of listener) {
    handleRequest(conn);
  }
};

listen();
