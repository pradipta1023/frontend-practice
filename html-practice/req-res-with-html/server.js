const listener = await Deno.listen({ port: 8000 });

const buffer = new Uint8Array(1024);
const decoder = new TextDecoder();
const encoder = new TextEncoder();

const createResponse = async (path) => {
  const fileContent = await Deno.readTextFile(path);
  return `HTTP/1.1 200 ok\r\nContent-Type:text/html\r\nContent-Length:${fileContent.length}\r\n\r\n${fileContent}`;
};

const createFailureResponse = () =>
  `HTTP/1.1 404 NOT FOUND\r\nContent-Type: text/html\r\n\r\n<h1>Path not found</h1>`;

const handleRequest = async (conn) => {
  const bytesRead = await conn.read(buffer);
  const request = decoder.decode(buffer.subarray(0, bytesRead));
  const [requestLine] = request.split("\r\n");
  const [method, path, protocol] = requestLine.split(" ");
  if (path === "/" || path === "/home") {
    await conn.write(encoder.encode(await createResponse("home.html")));
  } else if (path === "/table") {
    await conn.write(encoder.encode(await createResponse("table.html")));
  } else if (path === "/tasks") {
    await conn.write(encoder.encode(await createResponse("tasks.html")));
  } else {
    await conn.write(encoder.encode(createFailureResponse()));
  }
  console.log({ method, path, protocol });
};

const listen = async () => {
  console.log("Listening on port: 8000");

  for await (const conn of listener) {
    handleRequest(conn);
  }
};

await listen();
