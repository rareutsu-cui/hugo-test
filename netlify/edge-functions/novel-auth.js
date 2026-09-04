const COOKIE_NAME = "novel_access";

function unauthorizedPage(message = "") {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Novel - Password</title>
</head>
<body>
<main style="max-width:600px;margin:80px auto;font-family:sans-serif">
<h1>Novel</h1>
<p>${message}</p>
<form method="POST">
<input type="password" name="password" placeholder="Password" required>
<button type="submit">Enter</button>
</form>
</main>
</body>
</html>`;
}

export default async (request, context) => {
  const password = Netlify.env.get("PROTECTED_PAGE_PASSWORD");

  if (!password) {
    return new Response(
      "This page is not yet configured. The site owner needs to set the PROTECTED_PAGE_PASSWORD environment variable.",
      { status: 503 }
    );
  }

  const cookies = request.headers.get("cookie") || "";

  if (cookies.includes(`${COOKIE_NAME}=ok`)) {
    return context.next();
  }

  if (request.method === "POST") {
    const form = await request.formData();
    const submitted = form.get("password");

    if (submitted === password) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: new URL(request.url).pathname,
          "Set-Cookie": `${COOKIE_NAME}=ok; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/more/novel/`
        }
      });
    }

    return new Response(unauthorizedPage("パスワードが違います。"), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  return new Response(unauthorizedPage(), {
    status: 401,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
};
