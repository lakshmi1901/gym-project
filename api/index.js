let application;
export default async function handler(req, res) {
  try {
    application ||= import("../server/app.js").catch(error => { application = undefined; throw error; });
    const { default: app, initialize } = await application;
    await initialize();
    req.url = req.url.replace(/^\/api(?=\/|\?|$)/, "") || "/";
    return app(req, res);
  } catch (error) {
    console.error("Gym API unavailable:", error.code || error.message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "The API is not ready. Check the hosted database and server environment settings." }));
  }
}
