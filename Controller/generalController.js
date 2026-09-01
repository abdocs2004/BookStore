export function welcome(req, res) {
    res.json({ message: "Welcome to Book Store API" });
}

export function about(req, res) {
    res.sendFile("public/about.html", { root: process.cwd() });
}

export function image(req, res) {
    res.sendFile("public/images/imge.jpg", { root: process.cwd() });
}
