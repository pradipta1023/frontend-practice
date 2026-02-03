const PORT = 8000;

const init = async () => await Deno.listen({ port: PORT });

const buffer = new Uint8Array(1024);
const decoder = new TextDecoder();
const encoder = new TextEncoder();

const handleRequest = async (conn) => {
  const bytesRead = await conn.read(buffer);
  const request = decoder.decode(buffer.subarray(0, bytesRead));
  const [requestLine] = request.split("\r\n");
  const [method, path, protocol] = requestLine.split(" ");
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
