const PORT = 8000;

const listener = await Deno.listen({ port: PORT });

const createSuccessResponse = () => `HTTP/1.1 200 ok`;

const createHeaders = (headers) =>
  Object.entries(headers).map((header) => header.join(":")).join("\r\n");

const createResponse = async (path) => {
  const content = await Deno.readTextFile(path);
  const headers = {
    "Content-Type": "text/html",
    "Content-Length": content.length,
  };
  const response = [
    createSuccessResponse(),
    createHeaders(headers),
    "",
    content,
  ]
    .join("\r\n");
  return encoder.encode(response);
};

const buffer = new Uint8Array(1024);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const createFailureResponse = (headers) =>
  encoder.encode(
    `HTTP/1.1 404 NOT FOUND\r\n${
      createHeaders(headers)
    }\r\n\r\n<h2>Page Not Found<h2>`,
  );

const handleRequest = async (conn) => {
  const bytesRead = await conn.read(buffer);
  const request = decoder.decode(buffer.subarray(0, bytesRead));
  const [requestLine] = request.split("\r\n");
  const [method, path, protocol] = requestLine.split(" ");
  switch (path) {
    case "/":
      await conn.write(await createResponse("home.html"));
      break;
    case "/home":
      await conn.write(await createResponse("home.html"));
      break;
    case "/bumrah":
      await conn.write(await createResponse("assets/bumrah.html"));
      break;
    case "/archer":
      await conn.write(await createResponse("assets/archer.html"));
      break;
    case "/johnson":
      await conn.write(await createResponse("assets/johnson.html"));
      break;

    default:
      await conn.write(createFailureResponse({ "Content-Type": "text/html" }));
      break;
  }
};

const listen = async () => {
  for await (const conn of listener) {
    handleRequest(conn);
  }
};

listen();
