export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        service: "JAIN STOCK EXCHANGE",
        database: "not connected yet"
      });
    }

    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>JAIN STOCK EXCHANGE</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:Arial;text-align:center;padding:80px">
  <h1>JAIN STOCK EXCHANGE</h1>
  <p>System initialization in progress.</p>
</body>
</html>`,
      {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      }
    );
  }
};
