const $=s=>document.querySelector(s);document.querySelector('.menu').addEventListener('click',()=>document.querySelector('nav').classList.toggle('open'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const yt=u=>{try{const x=new URL(u);if(x.hostname.includes('youtu.be'))return x.pathname.slice(1);if(x.searchParams.get('v'))return x.searchParams.get('v');const m=x.pathname.match(/\/embed\/([^/]+)/);return m?m[1]:''}catch{return''}};
fetch('/data/site.json').then(r=>r.json()).then(d=>{
 $('#photo-posts').innerHTML=d.photo_posts.map(p=>`<article class="card"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.title)}"><p class="date">${esc(p.date)}</p><h3>${esc(p.title)}</h3><p>${esc(p.caption)}</p></article>`).join('');
 $('#text-posts').innerHTML=d.text_posts.map(p=>`<article class="card"><p class="date">${esc(p.date)}</p><h3>${esc(p.title)}</h3><p><strong>${esc(p.excerpt)}</strong></p>
    <details>
        <summary>Leer artículo completo</summary>
        <div class="article-content">
            <p>${esc(p.body)}</p>
        </div>
    </details>
</article>
`).join('');
$('#video-posts').innerHTML=d.videos.map(p=>{const id=yt(p.youtube_url);
return `<article class="card video">
${id
? `<iframe loading="lazy"
src="https://www.youtube-nocookie.ullscreen></iframe>`
: ''}
<p class="date">${esc(p.date)}</p>
<h3>${esc(p.title)}</h3>
<p>
<strong>${esc(p.description.substring(0,180))}...</strong>
</p>
<details>
    <summary>Ver descripción completa</summary>
    <div class="video-description">
        <p>${esc(p.description)}</p>
    </div>
</details>

</article>
`;
}).join('');
$('#cv-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=$('#form-status'),b=f.querySelector('button');b.disabled=true;s.textContent='Registrando solicitud...';try{const body=new URLSearchParams(new FormData(f));const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()});if(!r.ok)throw Error();s.textContent='Solicitud registrada. La descarga comenzará ahora.';f.reset();const a=document.createElement('a');a.href='/downloads/CV_Luis_Eduardo_Duran_Mora.pdf';a.download='CV_Luis_Eduardo_Duran_Mora.pdf';document.body.appendChild(a);a.click();a.remove()}catch{s.textContent='No fue posible registrar la solicitud. Inténtalo nuevamente cuando el sitio esté publicado en Netlify.'}finally{b.disabled=false}});
if(window.netlifyIdentity)window.netlifyIdentity.on('init',u=>{if(!u&&location.hash.includes('invite_token'))window.netlifyIdentity.open('signup')});
