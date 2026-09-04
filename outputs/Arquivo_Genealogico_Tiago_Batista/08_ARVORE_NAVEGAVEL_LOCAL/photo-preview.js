/* Fotos públicas da árvore; alteração restrita ao administrador autenticado. */
(function () {
  const WHATSAPP_NUMBER = '5511950187016';
  const ADMIN_EMAIL = 'tiagobts@hotmail.com';
  const SUPABASE_URL = 'https://ifasykxcgmnpfrwbfvwu.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NhXiesdj9W4-QuLcbKjbLA_TtG6kx8p';
  const PHOTO_BUCKET = 'profile-photos';
  const AUTH_REDIRECT_URL = 'https://nexasmartav.github.io/arquivo-genealogico-tiago-batista/';
  const DEFAULT_PHOTOS = {
    iraci:'assets/photos/iraci.jpeg', jose:'assets/photos/jose.jpeg', ivanildo:'assets/photos/ivanildo.png',
    tiago:'assets/photos/Tiago Baatista da Silva.jpeg', ivan:'assets/photos/Ivan Batista da SIlva.png',
    ivanize:'assets/photos/ivanize.png', marina:'assets/photos/marina.jpeg', thais:'assets/photos/thais.jpeg',
    'tatiana-batista':'assets/photos/tatiana.png', 'taina-batista':'assets/photos/taina.png',
    'diego-batista':'assets/photos/diego.png', 'alessandro-cremon':'assets/photos/alessandro.png',
    'joao-cremon':'assets/photos/joao.png', 'alice-cremon':'assets/photos/alice.png',
    'eduardo-santana':'assets/photos/eduardo-santana.png', 'eduardo-filho':'assets/photos/eduardo-filho.png',
    'maria-clara':'assets/photos/maria-clara.png', 'gabriel-santana':'assets/photos/gabriel.png',
    'davi-rodrigues':'assets/photos/davi.png', 'maria-luiza-rodrigues':'assets/photos/maria-luiza.png',
    everaldo:'assets/photos/everaldo.png', 'kelly-everaldo':'assets/photos/kelly.jpg'
  };
  const client = window.supabase && window.supabase.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;
  const images = new Map();
  let adminUser = null;

  function remotePhoto(personId) {
    return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${encodeURIComponent(personId)}/photo?v=${Date.now()}`;
  }
  function showInFrame(frame, source, personId) {
    const image = frame.querySelector('img');
    const label = frame.querySelector('span');
    image.onerror = () => {
      const fallback = DEFAULT_PHOTOS[personId];
      if (fallback && image.src !== new URL(fallback, location.href).href) { image.onerror = null; image.src = fallback; return; }
      image.hidden = true;
      if (label) label.hidden = false;
    };
    image.src = source;
    image.hidden = false;
    if (label) label.hidden = true;
  }
  function attachTreePhotos() {
    for (const portrait of document.querySelectorAll('[data-photo-person]')) {
      const personId = portrait.dataset.photoPerson;
      let image = images.get(personId);
      if (!image) { image = document.createElement('img'); image.alt = ''; images.set(personId, image); }
      image.onerror = () => {
        const fallback = DEFAULT_PHOTOS[personId];
        if (fallback && image.src !== new URL(fallback, location.href).href) { image.onerror = null; image.src = fallback; }
      };
      image.src = remotePhoto(personId);
      if (portrait.querySelector('img') !== image) portrait.replaceChildren(image);
    }
  }
  window.refreshGenealogyPhotos = attachTreePhotos;

  function whatsappUrl(person) {
    const message = [
      'Olá, Tiago. Tenho uma correção ou nova informação para a árvore genealógica.', '',
      `Pessoa relacionada: ${person.name}`, 'Correção ou informação:',
      'Fonte, documento ou foto disponível:', 'Meu nome e parentesco:'
    ].join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
  function isAdministrator() { return adminUser && adminUser.email === ADMIN_EMAIL; }
  function setMessage(area, text, isError) {
    const output = area.querySelector('.photo-message');
    if (!output) return;
    output.textContent = text;
    output.classList.toggle('is-error', Boolean(isError));
  }
  function administratorControls(person) {
    if (!isAdministrator()) {
      return `<a class="photo-button correction-button" href="${whatsappUrl(person)}" target="_blank" rel="noopener">Informar correção ou nova informação</a>
        <button class="photo-link" type="button" data-admin-access>Acesso do administrador</button>
        <small class="photo-status">Somente o administrador atualiza fotos, dados e documentos após conferir a fonte.</small>`;
    }
    return `<label class="photo-upload-label">Nova foto<input class="photo-file" type="file" accept="image/png,image/jpeg,image/webp" /></label>
      <button class="photo-button" type="button" data-save-photo>Atualizar foto</button>
      <button class="photo-link" type="button" data-admin-logout>Sair do acesso administrativo</button>
      <small class="photo-status">A foto será publicada para todas as pessoas que abrirem esta árvore.</small>`;
  }
  function bindAreaActions(area, person) {
    const adminAccess = area.querySelector('[data-admin-access]');
    if (adminAccess) adminAccess.addEventListener('click', openAccessDialog);
    const logout = area.querySelector('[data-admin-logout]');
    if (logout) logout.addEventListener('click', async () => { await client.auth.signOut(); });
    const save = area.querySelector('[data-save-photo]');
    if (save) save.addEventListener('click', async () => {
      const file = area.querySelector('.photo-file').files[0];
      if (!file) return setMessage(area, 'Escolha uma imagem antes de atualizar.', true);
      if (!client || !isAdministrator()) return setMessage(area, 'Entre com o acesso do administrador antes de enviar a foto.', true);
      if (file.size > 8 * 1024 * 1024) return setMessage(area, 'Escolha uma imagem com até 8 MB.', true);
      setMessage(area, 'Enviando e publicando a foto…');
      save.disabled = true;
      const { error } = await client.storage.from(PHOTO_BUCKET).upload(`${person.id}/photo`, file, {
        upsert: true, contentType: file.type, cacheControl: '3600'
      });
      save.disabled = false;
      if (error) return setMessage(area, `Não foi possível publicar: ${error.message}`, true);
      showInFrame(area.querySelector('.photo-frame'), remotePhoto(person.id), person.id);
      attachTreePhotos();
      setMessage(area, 'Foto publicada e vinculada a este perfil.');
    });
  }
  function addPhotoArea() {
    const host = document.querySelector('#detail-content');
    if (!host || host.querySelector('.photo-area')) return;
    const personId = selected;
    const person = byId[personId];
    const area = document.createElement('section');
    area.className = 'photo-area';
    area.dataset.photoFor = personId;
    area.innerHTML = `<div class="photo-frame"><img alt="Foto de ${person.name}" hidden /><span>${person.name.trim().charAt(0)}</span></div>
      <div><p class="photo-kicker">MEMÓRIA VISUAL</p><h3>Foto de ${person.name}</h3>
      <p>Foto publicada no acervo da família, quando disponível.</p>
      <div class="photo-actions">${administratorControls(person)}</div><p class="photo-message" aria-live="polite"></p></div>`;
    host.prepend(area);
    showInFrame(area.querySelector('.photo-frame'), remotePhoto(personId), personId);
    bindAreaActions(area, person);
  }
  function refreshPhotoArea() {
    const area = document.querySelector('.photo-area');
    if (!area) return;
    area.remove();
    addPhotoArea();
  }
  function openAccessDialog() {
    if (!client) return alert('O serviço de fotos não carregou. Atualize a página e tente novamente.');
    let dialog = document.querySelector('#photo-admin-dialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'photo-admin-dialog';
      dialog.className = 'photo-admin-dialog';
      dialog.innerHTML = `<form method="dialog"><button class="dialog-close" aria-label="Fechar">×</button></form>
        <h3>Acesso do administrador</h3><p>Use a conta que controla o acervo. Familiares não precisam criar acesso.</p>
        <label>E-mail<input id="photo-admin-email" type="email" value="${ADMIN_EMAIL}" autocomplete="email" required /></label>
        <label>Senha<input id="photo-admin-password" type="password" autocomplete="current-password" required /></label>
        <div class="dialog-actions"><button class="photo-button" type="button" data-login>Entrar</button><button class="photo-link" type="button" data-signup>Primeiro acesso</button></div>
        <p class="photo-message" aria-live="polite"></p>`;
      document.body.append(dialog);
      const submit = async (newAccount) => {
        const email = dialog.querySelector('#photo-admin-email').value.trim().toLowerCase();
        const password = dialog.querySelector('#photo-admin-password').value;
        const message = dialog.querySelector('.photo-message');
        if (email !== ADMIN_EMAIL) { message.textContent = 'Use o e-mail administrativo definido para o acervo.'; message.classList.add('is-error'); return; }
        if (password.length < 8) { message.textContent = 'Use uma senha com pelo menos 8 caracteres.'; message.classList.add('is-error'); return; }
        message.classList.remove('is-error'); message.textContent = newAccount ? 'Criando acesso…' : 'Entrando…';
        const result = newAccount
          ? await client.auth.signUp({ email, password, options: { emailRedirectTo: AUTH_REDIRECT_URL } })
          : await client.auth.signInWithPassword({ email, password });
        if (result.error) { message.textContent = result.error.message; message.classList.add('is-error'); return; }
        if (newAccount && !result.data.session) { message.textContent = 'Confira seu e-mail para confirmar o primeiro acesso.'; return; }
        dialog.close();
      };
      dialog.querySelector('[data-login]').addEventListener('click', () => submit(false));
      dialog.querySelector('[data-signup]').addEventListener('click', () => submit(true));
    }
    dialog.showModal();
  }
  async function readSession() {
    if (!client) return;
    const { data } = await client.auth.getUser();
    adminUser = data.user || null;
    refreshPhotoArea();
  }
  if (client) client.auth.onAuthStateChange((_event, session) => { adminUser = session && session.user; refreshPhotoArea(); });
  addPhotoArea();
  new MutationObserver(addPhotoArea).observe(document.querySelector('#detail-content'), { childList: true });
  let refreshQueued = false;
  new MutationObserver(() => {
    if (refreshQueued) return;
    refreshQueued = true;
    queueMicrotask(() => { refreshQueued = false; attachTreePhotos(); });
  }).observe(document.querySelector('#tree'), { childList: true, subtree: true });
  attachTreePhotos();
  readSession();
})();
