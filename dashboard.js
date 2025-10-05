// Owner dashboard logic
(function() {
  const { app, auth, db, storage } = window.initFirebaseApp();

  const signInBtn = document.getElementById('sign-in-btn');
  const signOutBtn = document.getElementById('sign-out-btn');
  const userEmail = document.getElementById('user-email');
  const projectForm = document.getElementById('project-form');
  const projectIdInput = document.getElementById('project-id');
  const titleInput = document.getElementById('title');
  const visibilitySelect = document.getElementById('visibility');
  const sectionsInput = document.getElementById('sections');
  const mediaFilesInput = document.getElementById('media-files');
  const uploadProgress = document.getElementById('upload-progress');
  const projectsList = document.getElementById('projects-list');
  const viewerLink = document.getElementById('viewer-link');

  function requireOwner(user) {
    // Simple owner check: only allow a specific email; replace with your email
    const ownerEmail = 'owner@example.com';
    return user && user.email === ownerEmail;
  }

  function updateAuthUI(user) {
    if (user) {
      userEmail.textContent = user.email;
      signInBtn.classList.add('hidden');
      signOutBtn.classList.remove('hidden');
    } else {
      userEmail.textContent = '';
      signOutBtn.classList.add('hidden');
      signInBtn.classList.remove('hidden');
    }
  }

  auth.onAuthStateChanged(async (user) => {
    updateAuthUI(user);
    if (requireOwner(user)) {
      loadProjects();
    } else {
      projectsList.innerHTML = '<div class="text-sm text-gray-500">Sign in as owner to view projects.</div>';
    }
  });

  signInBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  });

  signOutBtn.addEventListener('click', async () => {
    await auth.signOut();
  });

  function parseSections(text) {
    if (!text || !text.trim()) return [];
    try {
      const sections = JSON.parse(text);
      if (Array.isArray(sections)) return sections;
      return [];
    } catch(e) {
      alert('Sections must be valid JSON array.');
      throw e;
    }
  }

  async function uploadMediaFiles(projectId, files) {
    if (!files || files.length === 0) return [];
    uploadProgress.textContent = 'Uploading...';
    const uploaded = [];
    for (const file of files) {
      const ref = storage.ref().child(`projects/${projectId}/${Date.now()}-${file.name}`);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      uploaded.push({ name: file.name, contentType: file.type, url });
    }
    uploadProgress.textContent = `Uploaded ${uploaded.length} file(s).`;
    return uploaded;
  }

  async function saveProject(evt) {
    evt.preventDefault();
    const user = auth.currentUser;
    if (!requireOwner(user)) {
      alert('Only owner can save projects.');
      return;
    }

    const projectId = projectIdInput.value.trim();
    if (!projectId) { alert('Project ID required'); return; }

    const title = titleInput.value.trim();
    const visibility = visibilitySelect.value;
    const sections = parseSections(sectionsInput.value);

    const files = mediaFilesInput.files;
    const media = await uploadMediaFiles(projectId, files);

    const data = {
      title,
      visibility,
      sections,
      media, // append-only per save for simplicity
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      ownerUid: user.uid,
    };

    await db.collection('projects').doc(projectId).set(data, { merge: true });
    viewerLink.href = `viewer.html?project=${encodeURIComponent(projectId)}`;
    loadProjects();
    alert('Saved');
  }

  async function loadProjects() {
    const snap = await db.collection('projects').orderBy('updatedAt', 'desc').limit(50).get();
    if (snap.empty) {
      projectsList.innerHTML = '<div class="text-sm text-gray-500">No projects yet.</div>';
      return;
    }
    const items = [];
    snap.forEach(doc => {
      const p = doc.data();
      items.push(
        `<div class="p-3 border border-gray-200 dark:border-gray-700 rounded">
           <div class="font-medium">${doc.id} — ${p.title || ''}</div>
           <div class="text-xs text-gray-500">visibility: ${p.visibility || 'private'} | sections: ${(p.sections||[]).length} | media: ${(p.media||[]).length}</div>
           <div class="mt-2 space-x-2">
             <a class="underline" href="viewer.html?project=${encodeURIComponent(doc.id)}" target="_blank">Open viewer</a>
           </div>
         </div>`
      );
    });
    projectsList.innerHTML = items.join('');
  }

  projectForm.addEventListener('submit', saveProject);
})();


