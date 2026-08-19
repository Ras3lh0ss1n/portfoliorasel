const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-toggle-icon');
const revealItems = document.querySelectorAll('.reveal');
const yearEl = document.getElementById('year');
const scrollVideo = document.getElementById('scroll-video');

document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

document.addEventListener('selectstart', (event) => {
  if (!event.target.closest('input, textarea')) event.preventDefault();
});

document.addEventListener('copy', (event) => {
  if (!event.target.closest('input, textarea')) event.preventDefault();
});

document.addEventListener('cut', (event) => {
  if (!event.target.closest('input, textarea')) event.preventDefault();
});

const themeCycle = ['light', 'green'];

const normalizeTheme = (theme) => {
  if (theme === 'green') return 'green';
  return 'light';
};

const applyTheme = (theme) => {
  const resolvedTheme = normalizeTheme(theme);
  document.body.setAttribute('data-theme', resolvedTheme);

  if (themeIcon) {
    const iconMap = {
      light: '☀',
      green: '☘'
    };
    themeIcon.textContent = iconMap[resolvedTheme] || '☀';
  }

  localStorage.setItem('md-rasel-theme', resolvedTheme);
};

const savedTheme = localStorage.getItem('md-rasel-theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme('green');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = normalizeTheme(document.body.getAttribute('data-theme'));
    const currentIndex = themeCycle.indexOf(currentTheme);
    const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length];
    applyTheme(nextTheme);
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (scrollVideo) {
  let rafId = null;
  let scrollProgress = 0;
  const videoStartTime = 3;
  const videoEndTime = 22.5;

  const updateScrollProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  };

  const syncVideoToScroll = () => {
    const duration = Number.isFinite(scrollVideo.duration) ? scrollVideo.duration : 0;
    const startTime = Math.min(videoStartTime, duration);
    const endTime = Math.min(videoEndTime, Math.max(startTime, duration - 0.02));

    if (duration <= 0 || endTime <= startTime) return;

    const targetTime = startTime + scrollProgress * (endTime - startTime);
    const diff = targetTime - scrollVideo.currentTime;
    const response = 0.55;

    if (Math.abs(diff) < 0.01) {
      scrollVideo.currentTime = targetTime;
    } else {
      scrollVideo.currentTime += diff * response;
    }
  };

  const tick = () => {
    updateScrollProgress();
    syncVideoToScroll();
    rafId = requestAnimationFrame(tick);
  };

  scrollVideo.muted = true;
  scrollVideo.playsInline = true;
  scrollVideo.preload = 'auto';
  scrollVideo.pause();
  scrollVideo.currentTime = videoStartTime;

  scrollVideo.addEventListener('loadedmetadata', () => {
    updateScrollProgress();
    scrollVideo.currentTime = Math.min(videoStartTime, scrollVideo.duration);
  });

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('wheel', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  scrollVideo.addEventListener('error', () => {
    scrollVideo.classList.add('video-unavailable');
  });

  updateScrollProgress();
  rafId = requestAnimationFrame(tick);

  window.addEventListener('beforeunload', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });
}

const postForm = document.getElementById('post-form');
const postInput = document.getElementById('post-input');
const postList = document.getElementById('post-list');
const postCharCount = document.getElementById('post-char-count');
const ownerAccessBtn = document.getElementById('owner-access-btn');
const ownerGate = document.getElementById('owner-gate');
const postComposer = document.getElementById('post-composer');
const navPostLink = document.querySelector('.nav-post-link');
const postsSection = document.getElementById('posts');
const projectGrid = document.getElementById('project-grid');
const projectEditor = document.getElementById('project-editor');
const projectForm = document.getElementById('project-form');
const addProjectBtn = document.getElementById('add-project-btn');
const cancelProjectBtn = document.getElementById('cancel-project-btn');
const projectIdInput = document.getElementById('project-id');
const projectCategoryInput = document.getElementById('project-category');
const projectYearInput = document.getElementById('project-year');
const projectTitleInput = document.getElementById('project-title');
const projectDescriptionInput = document.getElementById('project-description');
const projectLinkInput = document.getElementById('project-link');
const projectImageInput = document.getElementById('project-image');
const projectFileInput = document.getElementById('project-file');
const projectUploadStatus = document.getElementById('project-upload-status');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

const defaultPosts = [
  {
    id: 1,
    author: 'Rasel Hossin',
    text: 'Today I am exploring bold colors, expressive layouts, and creative systems that make brands feel unforgettable.',
    date: 'Just now'
  },
  {
    id: 2,
    author: 'Rasel Hossin',
    text: 'New concept in motion: blending illustration, typography, and storytelling into one visual identity.',
    date: '2 hours ago'
  }
];

const STORAGE_KEY = 'md-rasel-posts';
const PROJECTS_KEY = 'md-rasel-projects';
const OWNER_KEY = 'md-rasel-owner-access';
const OWNER_PASSWORD = '667565';

const defaultProjects = [
  {
    id: 'north-studio',
    category: 'Branding',
    year: '2025',
    title: 'North Studio',
    description: 'Crafted a stylish portfolio and branding experience for a creative team focused on growth and visibility.',
    link: '#',
    visual: 'visual-one'
  },
  {
    id: 'dashflow',
    category: 'Product Design',
    year: '2024',
    title: 'Dashflow',
    description: 'Built a clean productivity dashboard with a user-first structure and a smoother onboarding journey.',
    link: '#',
    visual: 'visual-two'
  },
  {
    id: 'nova-market',
    category: 'E-commerce',
    year: '2024',
    title: 'Nova Market',
    description: 'Designed an online storefront experience that improved presentation, trust, and conversion.',
    link: '#',
    visual: 'visual-three'
  }
];

const isOwnerAccessEnabled = () => localStorage.getItem(OWNER_KEY) === 'true';

const updateOwnerVisibility = () => {
  const isOwner = isOwnerAccessEnabled();

  if (navPostLink) {
    navPostLink.classList.toggle('hidden', false);
    navPostLink.setAttribute('aria-hidden', 'false');
  }

  if (postsSection) {
    postsSection.classList.toggle('hidden', false);
  }

  if (ownerGate) {
    ownerGate.classList.toggle('hidden', isOwner);
  }

  if (postComposer) {
    postComposer.classList.toggle('hidden', !isOwner);
  }

  if (ownerAccessBtn) {
    ownerAccessBtn.innerHTML = isOwner
      ? '<span class="button-icon">🔓</span> Lock posting'
      : '<span class="button-icon">🔒</span> Owner access';
  }

  if (projectEditor) {
    projectEditor.classList.toggle('hidden', !isOwner);
  }

  renderProjects();
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getProjects = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECTS_KEY));
    return Array.isArray(saved) ? saved : defaultProjects;
  } catch (error) {
    return defaultProjects;
  }
};

const saveProjects = (projects) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const resetProjectForm = () => {
  if (!projectForm) return;
  projectForm.reset();
  projectIdInput.value = '';
  projectUploadStatus.textContent = '';
  projectEditor.classList.add('hidden');
};

const openProjectForm = (project = {}) => {
  projectIdInput.value = project.id || `project-${Date.now()}`;
  projectCategoryInput.value = project.category || '';
  projectYearInput.value = project.year || new Date().getFullYear();
  projectTitleInput.value = project.title || '';
  projectDescriptionInput.value = project.description || '';
  projectLinkInput.value = project.link && project.link !== '#' ? project.link : '';
  projectImageInput.value = '';
  projectFileInput.value = '';
  projectUploadStatus.textContent = [
    project.image ? 'Current image is saved.' : '',
    project.fileName ? `Current file: ${project.fileName}` : ''
  ].filter(Boolean).join(' ');
  projectEditor.classList.remove('hidden');
  projectTitleInput.focus();
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve('');
    return;
  }

  const reader = new FileReader();
  reader.addEventListener('load', () => resolve(String(reader.result || '')));
  reader.addEventListener('error', reject);
  reader.readAsDataURL(file);
});

const renderProjects = () => {
  if (!projectGrid) return;

  const isOwner = isOwnerAccessEnabled();
  projectGrid.innerHTML = getProjects()
    .map(
      (project) => `
        <article class="project-card">
          <div class="project-visual ${escapeHtml(project.visual || 'visual-one')}"${project.image ? ` style="background-image: url('${escapeHtml(project.image)}')"` : ''}></div>
          <div class="project-body">
            <div class="project-meta">
              <span>${escapeHtml(project.category)}</span>
              <span>${escapeHtml(project.year)}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <a href="${escapeHtml(project.link || '#')}" aria-label="View project ${escapeHtml(project.title)}">View case study</a>
            ${project.fileData ? `<a class="project-file-link" href="${escapeHtml(project.fileData)}" download="${escapeHtml(project.fileName || 'project-file')}">Download project file</a>` : ''}
            ${isOwner ? `<div class="project-owner-actions"><button type="button" class="button button-small edit-project-btn" data-project-id="${escapeHtml(project.id)}">Edit</button><button type="button" class="button button-small button-danger delete-project-btn" data-project-id="${escapeHtml(project.id)}">Delete</button></div>` : ''}
          </div>
        </article>
      `
    )
    .join('');
};

const getPosts = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : defaultPosts;
  } catch (error) {
    return defaultPosts;
  }
};

const savePosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.slice(0, 10)));
};

const renderPosts = () => {
  if (!postList) return;

  const posts = getPosts();

  if (!posts.length) {
    postList.innerHTML = '<p class="empty-state">No posts yet. Share your first update.</p>';
    return;
  }

  postList.innerHTML = posts
    .map(
      (post) => `
        <article class="post-item">
          <div class="post-item-header">
            <strong>${escapeHtml(post.author)}</strong>
            <span>${escapeHtml(post.date)}</span>
          </div>
          <p>${escapeHtml(post.text)}</p>
        </article>
      `
    )
    .join('');
};

if (postInput && postCharCount) {
  const updateCharCount = () => {
    postCharCount.textContent = `${postInput.value.length}/280`;
  };

  postInput.addEventListener('input', updateCharCount);
  updateCharCount();
}

if (postForm && postInput && postList) {
  postForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = postInput.value.trim();
    if (!text) return;

    const posts = getPosts();
    posts.unshift({
      id: Date.now(),
      author: 'Rasel Hossin',
      text,
      date: 'Just now'
    });

    savePosts(posts);
    renderPosts();
    postForm.reset();
    postCharCount.textContent = '0/280';
  });
}

const getBotReply = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('price') || lower.includes('budget') || lower.includes('cost')) {
    return 'I can share a quote based on your project scope. Send me the timeline, style, and deliverables.';
  }

  if (lower.includes('logo') || lower.includes('branding')) {
    return 'Great choice. I can create a logo, brand identity, and visual direction for your business.';
  }

  if (lower.includes('website') || lower.includes('portfolio')) {
    return 'Perfect. I can design a clean portfolio or landing page with strong visuals and a smooth user experience.';
  }

  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! I’m ready to help with your creative project. Tell me what you want to build.';
  }

  return 'Thanks for the message! I’d love to hear more about your idea, timeline, and design goals.';
};

if (chatForm && chatInput && chatMessages) {
  const addChatMessage = (text, sender) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'bubble-user' : 'bubble-bot'}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');
    chatInput.value = '';

    window.setTimeout(() => {
      addChatMessage(getBotReply(message), 'bot');
    }, 400);
  });
}

if (ownerAccessBtn) {
  ownerAccessBtn.addEventListener('click', () => {
    if (isOwnerAccessEnabled()) {
      localStorage.removeItem(OWNER_KEY);
      updateOwnerVisibility();
      return;
    }

    const password = window.prompt('Enter owner password to create a post:');
    if (password !== OWNER_PASSWORD) {
      window.alert('Incorrect password.');
      return;
    }

    localStorage.setItem(OWNER_KEY, 'true');
    updateOwnerVisibility();
  });
}

if (projectGrid) {
  projectGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-project-id]');
    if (!button || !isOwnerAccessEnabled()) return;

    const projectId = button.dataset.projectId;
    const projects = getProjects();
    const project = projects.find((item) => item.id === projectId);

    if (button.classList.contains('edit-project-btn') && project) {
      openProjectForm(project);
    }

    if (button.classList.contains('delete-project-btn')) {
      saveProjects(projects.filter((item) => item.id !== projectId));
      renderProjects();
    }
  });
}

if (addProjectBtn) {
  addProjectBtn.addEventListener('click', () => {
    if (isOwnerAccessEnabled()) openProjectForm();
  });
}

if (cancelProjectBtn) {
  cancelProjectBtn.addEventListener('click', resetProjectForm);
}

if (projectForm) {
  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isOwnerAccessEnabled()) return;

    const projects = getProjects();
    const existingProject = projects.find((item) => item.id === projectIdInput.value);
    const imageFile = projectImageInput.files[0];
    const projectFile = projectFileInput.files[0];

    if (projectUploadStatus) projectUploadStatus.textContent = 'Preparing uploads...';

    let image = existingProject?.image || '';
    let fileData = existingProject?.fileData || '';
    let fileName = existingProject?.fileName || '';

    try {
      if (imageFile) image = await readFileAsDataUrl(imageFile);
      if (projectFile) {
        fileData = await readFileAsDataUrl(projectFile);
        fileName = projectFile.name;
      }
    } catch (error) {
      window.alert('The selected file could not be read.');
      return;
    }

    const project = {
      id: projectIdInput.value,
      category: projectCategoryInput.value.trim(),
      year: projectYearInput.value.trim(),
      title: projectTitleInput.value.trim(),
      description: projectDescriptionInput.value.trim(),
      link: projectLinkInput.value.trim() || '#',
      visual: existingProject?.visual || 'visual-one',
      image,
      fileData,
      fileName
    };

    const existingIndex = projects.findIndex((item) => item.id === project.id);

    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }

    saveProjects(projects);
    resetProjectForm();
    renderProjects();
  });
}

updateOwnerVisibility();
renderPosts();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => observer.observe(item));
