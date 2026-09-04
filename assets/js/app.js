const $ = selector => document.querySelector(selector);

/* MENÚ MÓVIL */
const menuButton = $(".menu");
const navigation = document.querySelector("nav");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        navigation.classList.toggle("open");
    });
}

/* PROTECCIÓN DE CONTENIDO */
const esc = value =>
    String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

/* CONSERVAR SALTOS DE LÍNEA */
const formatText = value =>
    esc(value).replace(/\r?\n/g, "<br>");

/* OBTENER ID DE YOUTUBE */
const getYouTubeId = url => {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            return parsedUrl.pathname.slice(1).split("/")[0];
        }

        if (parsedUrl.searchParams.get("v")) {
            return parsedUrl.searchParams.get("v");
        }

        const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);

        return embedMatch ? embedMatch[1] : "";
    } catch {
        return "";
    }
};

/* CARGAR CONTENIDO DEL BLOG */
fetch("/data/site.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo cargar el contenido.");
        }

        return response.json();
    })
    .then(data => {
        const photoContainer = $("#photo-posts");
        const textContainer = $("#text-posts");
        const videoContainer = $("#video-posts");

        /* PUBLICACIONES CON FOTOS */
        if (photoContainer) {
            photoContainer.innerHTML = (data.photo_posts || [])
                .map(post => `
                    <article class="card">
                        ${esc(post.image)}"
                        >

                        <p class="date">${esc(post.date)}</p>

                        <h3>${esc(post.title)}</h3>

                        <p>${formatText(post.caption)}</p>
                    </article>
                `)
                .join("");
        }

        /* ARTÍCULOS */
        if (textContainer) {
            textContainer.innerHTML = (data.text_posts || [])
                .map(post => `
                    <article class="card">
                        <p class="date">${esc(post.date)}</p>

                        <h3>${esc(post.title)}</h3>

                        <p>
                            <strong>${formatText(post.excerpt)}</strong>
                        </p>

                        <details>
                            <summary>Leer artículo completo</summary>

                            <div class="article-content">
                                <p>${formatText(post.body)}</p>
                            </div>
                        </details>
                    </article>
                `)
                .join("");
        }

        /* VÍDEOS */
        if (videoContainer) {
            videoContainer.innerHTML = (data.videos || [])
                .map(post => {
                    const videoId = getYouTubeId(post.youtube_url);
                    const description = String(post.description ?? "");

                    const preview =
                        description.length > 180
                            ? description.substring(0, 180) + "..."
                            : description;

                    const videoPlayer = videoId
                        ? `
                            "
                                title="${esc(post.title)}"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen>
                            </iframe>
                        `
                        : `
                            <div class="video-placeholder">
                                Vídeo no disponible
                            </div>
                        `;

                    const fullDescription = description.length > 180
                        ? `
                            <details>
                                <summary>Ver descripción completa</summary>

                                <div class="video-description">
                                    <p>${formatText(description)}</p>
                                </div>
                            </details>
                        `
                        : "";

                    return `
                        <article class="card video">
                            ${videoPlayer}

                            <p class="date">${esc(post.date)}</p>

                            <h3>${esc(post.title)}</h3>

                            <p>
                                <strong>${formatText(preview)}</strong>
                            </p>

                            ${fullDescription}
                        </article>
                    `;
                })
                .join("");
        }
    })
    .catch(error => {
        console.error("Error cargando las publicaciones:", error);
    });

/* FORMULARIO DE DESCARGA DEL CV */
const cvForm = $("#cv-form");

if (cvForm) {
    cvForm.addEventListener("submit", async event => {
        event.preventDefault();

        const form = event.currentTarget;
        const status = $("#form-status");
        const button = form.querySelector("button");

        if (button) {
            button.disabled = true;
        }

        if (status) {
            status.textContent = "Registrando solicitud...";
        }

        try {
            const body = new URLSearchParams(new FormData(form));

            const response = await fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: body.toString()
            });

            if (!response.ok) {
                throw new Error("No se pudo registrar la solicitud.");
            }

            if (status) {
                status.textContent =
                    "Solicitud registrada. La descarga comenzará ahora.";
            }

            form.reset();

            const downloadLink = document.createElement("a");

            downloadLink.href =
                "/downloads/CV_Luis_Eduardo_Duran_Mora.pdf";

            downloadLink.download =
                "CV_Luis_Eduardo_Duran_Mora.pdf";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

        } catch (error) {
            console.error("Error enviando el formulario:", error);

            if (status) {
                status.textContent =
                    "No fue posible registrar la solicitud. Inténtalo nuevamente.";
            }
        } finally {
            if (button) {
                button.disabled = false;
            }
        }
    });
}

/* NETLIFY IDENTITY */
if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
        if (!user && location.hash.includes("invite_token")) {
            window.netlifyIdentity.open("signup");
        }
    });
}
