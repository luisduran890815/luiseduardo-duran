const $ = (selector) => document.querySelector(selector);

const menuButton = $('.menu');
const navigation = document.querySelector('nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => navigation.classList.toggle('open'));
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

const formatText = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');

const getYouTubeId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (hostname === 'youtu.be') {
      return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      const queryId = parsedUrl.searchParams.get('v');
      if (queryId) return queryId;

      const pathMatch = parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      return pathMatch ? pathMatch[1] : '';
    }

    return '';
  } catch {
    return '';
  }
};

const normalisePhoto = (item, fallbackAlt) => {
  if (typeof item === 'string') {
    return { image: item, alt: fallbackAlt };
  }

  return {
    image: item?.image || '',
    alt: item?.alt || fallbackAlt
  };
};

const getPostPhotos = (post) => {
  const galleryPhotos = Array.isArray(post.images)
    ? post.images
        .map((item) => normalisePhoto(item, post.title))
        .filter((item) => item.image)
    : [];

  if (galleryPhotos.length > 0) return galleryPhotos;

  if (post.image) {
    return [{ image: post.image, alt: post.title }];
  }

  return [];
};

fetch('/data/site.json')
  .then((response) => {
    if (!response.ok) throw new Error('No se pudo cargar /data/site.json');
    return response.json();
  })
  .then((data) => {
    const photoContainer = $('#photo-posts');
    const textContainer = $('#text-posts');
    const videoContainer = $('#video-posts');

    if (photoContainer) {
      photoContainer.innerHTML = (data.photo_posts || []).map((post, postIndex) => {
        const photos = getPostPhotos(post);
        const galleryClass = photos.length > 1 ? 'gallery gallery-multiple' : 'gallery gallery-single';

        const gallery = photos.length > 0
          ? `
              <div class="${galleryClass}" data-gallery="${postIndex}">
                ${photos.map((photo, photoIndex) => `
                  <figure class="gallery-item">
                    <img
                      loading="lazy"
                      src="${escapeHtml(photo.image)}"
                      alt="${escapeHtml(photo.alt)}"
                      data-photo-index="${photoIndex}"
                    >
                  </figure>
                `).join('')}
              </div>
            `
          : '<div class="photo-placeholder">Imagen no disponible</div>';

        return `
          <article class="card photo-post">
            ${gallery}
            <p class="date">${escapeHtml(post.date)}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${formatText(post.caption)}</p>
          </article>
        `;
      }).join('');
    }

    if (textContainer) {
      textContainer.innerHTML = (data.text_posts || []).map((post) => `
        <article class="card">
          <p class="date">${escapeHtml(post.date)}</p>
          <h3>${escapeHtml(post.title)}</h3>
          <p><strong>${formatText(post.excerpt)}</strong></p>
          <details>
            <summary>Leer artículo completo</summary>
            <div class="article-content">
              <p>${formatText(post.body)}</p>
            </div>
          </details>
        </article>
      `).join('');
    }

    if (videoContainer) {
      videoContainer.innerHTML = (data.videos || []).map((post) => {
        const videoId = getYouTubeId(post.youtube_url);
        const description = String(post.description ?? '');
        const preview = description.length > 180
          ? `${description.slice(0, 180)}...`
          : description;

        const player = videoId ? `
          <iframe
            loading="lazy"
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}"
            title="${escapeHtml(post.title)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        ` : '<div class="video-placeholder">Vídeo no disponible</div>';

        const expandedDescription = description.length > 180 ? `
          <details>
            <summary>Ver descripción completa</summary>
            <div class="video-description">
              <p>${formatText(description)}</p>
            </div>
          </details>
        ` : '';

        return `
          <article class="card video">
            ${player}
            <p class="date">${escapeHtml(post.date)}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <p><strong>${formatText(preview)}</strong></p>
            ${expandedDescription}
          </article>
        `;
      }).join('');
    }
  })
  .catch((error) => console.error('Error cargando las publicaciones:', error));

const cvForm = $('#cv-form');

if (cvForm) {
  cvForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = $('#form-status');
    const button = form.querySelector('button');

    if (button) button.disabled = true;
    if (status) status.textContent = 'Registrando solicitud...';

    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) throw new Error('No se pudo registrar la solicitud.');

      if (status) status.textContent = 'Solicitud registrada. La descarga comenzará ahora.';
      form.reset();

      const downloadLink = document.createElement('a');
      downloadLink.href = '/downloads/CV_Luis_Eduardo_Duran_Mora.pdf';
      downloadLink.download = 'CV_Luis_Eduardo_Duran_Mora.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (error) {
      console.error('Error enviando el formulario:', error);
      if (status) status.textContent = 'No fue posible registrar la solicitud. Inténtalo nuevamente.';
    } finally {
      if (button) button.disabled = false;
    }
  });
}

if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', (user) => {
    if (!user && location.hash.includes('invite_token')) {
      window.netlifyIdentity.open('signup');
    }
  });
}
