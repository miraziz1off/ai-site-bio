// Main JavaScript file for Miraziz's Personal Website

// ===== CONSTANTS AND CONFIG =====
const CONFIG = {
    // API endpoints
    PROJECTS_DATA: '/data/projects.json',
    BLOG_DATA: '/data/blog.json',
    SKILLS_DATA: '/data/skills.json',
    
    // Netlify function endpoint for sending messages
    SEND_MESSAGE_ENDPOINT: '/.netlify/functions/send-message',
    
    // GitHub API for stats
    GITHUB_API: 'https://api.github.com/users/miraziz1off',
    
    // Admin password for adding blog entries
    ADMIN_PASSWORD: 'miraziz2023',
    
    // Spam protection
    MESSAGE_LIMIT: 3,
    MESSAGE_TIMEFRAME: 3600000, // 1 hour in milliseconds
};

// ===== STATE MANAGEMENT =====
const state = {
    currentLanguage: 'ru',
    messagesSent: JSON.parse(localStorage.getItem('messagesSent') || '[]'),
    blogEntries: [],
    projects: [],
    skills: [],
    galleryImages: 6,
    currentFilter: 'all'
};

// ===== DOM ELEMENTS =====
const elements = {
    // Preloader
    preloader: document.querySelector('.preloader'),
    progressBar: document.querySelector('.progress'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    menuToggle: document.getElementById('menuToggle'),
    navLinksContainer: document.querySelector('.nav-links'),
    
    // Language switcher
    langButtons: document.querySelectorAll('.lang-btn'),
    
    // Hero section
    typedText: document.getElementById('typed-text'),
    projectCount: document.getElementById('projectCount'),
    experience: document.getElementById('experience'),
    skillsCount: document.getElementById('skillsCount'),
    
    // Projects section
    projectsGrid: document.getElementById('projectsGrid'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    
    // Skills section
    skillsContainer: document.querySelector('.skills-container'),
    
    // Life/Journal section
    lifeEntries: document.getElementById('lifeEntries'),
    loadMoreEntriesBtn: document.getElementById('loadMoreEntries'),
    addEntryBtn: document.getElementById('addEntryBtn'),
    
    // Message section
    messageForm: document.getElementById('anonymousMessageForm'),
    messageText: document.getElementById('messageText'),
    charCount: document.getElementById('charCount'),
    captchaAnswer: document.getElementById('captchaAnswer'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    clearFormBtn: document.getElementById('clearFormBtn'),
    messageStatus: document.getElementById('messageStatus'),
    
    // Contact section
    galleryGrid: document.getElementById('galleryGrid'),
    loadMoreGalleryBtn: document.getElementById('loadMoreGallery'),
    
    // Admin modal
    adminModal: document.getElementById('adminModal'),
    closeModalBtn: document.getElementById('closeModal'),
    cancelModalBtn: document.getElementById('cancelModal'),
    addEntryForm: document.getElementById('addEntryForm'),
    
    // Back to top button
    backToTopBtn: document.getElementById('backToTop'),
    
    // Particles container
    particlesContainer: document.getElementById('particles')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize particles
    createParticles();
    
    // Load data
    await loadData();
    
    // Initialize components
    initializeTypedText();
    initializeNavigation();
    initializeLanguageSwitcher();
    initializeProjectsFilter();
    initializeMessageForm();
    initializeGallery();
    initializeAdminModal();
    initializeBackToTop();
    initializeScrollAnimations();
    
    // Update stats
    updateStats();
    
    // Remove preloader after everything is loaded
    setTimeout(() => {
        elements.progressBar.style.width = '100%';
        setTimeout(() => {
            elements.preloader.style.opacity = '0';
            elements.preloader.style.visibility = 'hidden';
            
            // Initialize animations after page is visible
            initializeAnimations();
        }, 500);
    }, 1000);
}

// ===== DATA LOADING =====
async function loadData() {
    try {
        // Load projects
        const projectsResponse = await fetch(CONFIG.PROJECTS_DATA);
        state.projects = await projectsResponse.json();
        renderProjects();
        
        // Load blog entries
        const blogResponse = await fetch(CONFIG.BLOG_DATA);
        state.blogEntries = await blogResponse.json();
        renderBlogEntries();
        
        // Load skills
        const skillsResponse = await fetch(CONFIG.SKILLS_DATA);
        state.skills = await skillsResponse.json();
        renderSkills();
        
        // Load GitHub stats
        await loadGitHubStats();
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Ошибка загрузки данных', 'error');
    }
}

async function loadGitHubStats() {
    try {
        const response = await fetch(CONFIG.GITHUB_API);
        const data = await response.json();
        
        // Update repo count
        if (elements.projectCount) {
            elements.projectCount.textContent = data.public_repos + '+';
        }
        
        // Update other stats if needed
    } catch (error) {
        console.error('Error loading GitHub stats:', error);
    }
}

// ===== RENDERING FUNCTIONS =====
function renderProjects(filter = 'all') {
    if (!elements.projectsGrid) return;
    
    elements.projectsGrid.innerHTML = '';
    
    const filteredProjects = filter === 'all' 
        ? state.projects 
        : state.projects.filter(project => project.category === filter);
    
    filteredProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        elements.projectsGrid.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    card.innerHTML = `
        <div class="project-image">
            <div class="project-tags">
                <span class="project-tag">${project.category}</span>
            </div>
            <img src="${project.image || '/assets/images/projects/default.jpg'}" alt="${project.title}" loading="lazy">
        </div>
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.tech.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
            </div>
            <div class="project-links">
                ${project.demo ? `<a href="${project.demo}" target="_blank" class="btn btn-outline btn-sm">Демо</a>` : ''}
                ${project.github ? `<a href="${project.github}" target="_blank" class="btn btn-ghost btn-sm">GitHub</a>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function renderBlogEntries() {
    if (!elements.lifeEntries) return;
    
    elements.lifeEntries.innerHTML = '';
    
    // Show only first 6 entries
    const entriesToShow = state.blogEntries.slice(0, 6);
    
    entriesToShow.forEach(entry => {
        const entryCard = createBlogEntryCard(entry);
        elements.lifeEntries.appendChild(entryCard);
    });
}

function createBlogEntryCard(entry) {
    const card = document.createElement('div');
    card.className = 'life-entry';
    
    // Format date
    const date = new Date(entry.date);
    const formattedDate = date.toLocaleDateString(state.currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Get mood icon
    const moodIcons = {
        happy: 'fas fa-smile',
        productive: 'fas fa-bolt',
        excited: 'fas fa-star',
        neutral: 'fas fa-meh',
        tired: 'fas fa-moon'
    };
    
    card.innerHTML = `
        <div class="entry-header">
            <span class="entry-date">${formattedDate}</span>
            <div class="entry-mood ${entry.mood ? 'mood-' + entry.mood : ''}">
                <i class="${moodIcons[entry.mood] || 'fas fa-smile'}"></i>
            </div>
        </div>
        <div class="entry-content">
            <h3>${entry.title}</h3>
            <p>${entry.content}</p>
            ${entry.tags ? `<div class="entry-tags">
                ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
            </div>` : ''}
        </div>
    `;
    
    return card;
}

function renderSkills() {
    if (!elements.skillsContainer) return;
    
    elements.skillsContainer.innerHTML = '';
    
    state.skills.forEach(category => {
        const categoryElement = createSkillCategory(category);
        elements.skillsContainer.appendChild(categoryElement);
    });
}

function createSkillCategory(category) {
    const div = document.createElement('div');
    div.className = 'skill-category';
    
    div.innerHTML = `
        <h3><i class="${category.icon}"></i> ${category.name}</h3>
        <div class="skill-list">
            ${category.skills.map(skill => `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${skill.level}%</span>
                    </div>
                    <div class="skill-bar">
                        <div class="skill-progress" style="width: ${skill.level}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    return div;
}

// ===== COMPONENT INITIALIZATIONS =====
function initializeTypedText() {
    if (!elements.typedText) return;
    
    const texts = state.currentLanguage === 'ru' 
        ? ['Frontend-разработчик', 'Backend-разработчик', 'Дизайнер', 'Создатель']
        : ['Frontend Developer', 'Backend Developer', 'Designer', 'Creator'];
    
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const fullText = texts[currentIndex];
        
        if (isDeleting) {
            currentText = fullText.substring(0, currentText.length - 1);
        } else {
            currentText = fullText.substring(0, currentText.length + 1);
        }
        
        elements.typedText.textContent = currentText;
        
        if (!isDeleting && currentText === fullText) {
            // Pause at the end of typing
            typingSpeed = 1000;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % texts.length;
            typingSpeed = 200;
        } else {
            typingSpeed = isDeleting ? 50 : 100;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start typing after a delay
    setTimeout(type, 1500);
}

function initializeNavigation() {
    // Smooth scroll for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    if (elements.navLinksContainer.classList.contains('active')) {
                        elements.menuToggle.classList.remove('active');
                        elements.navLinksContainer.classList.remove('active');
                    }
                    
                    // Scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update active link
                    elements.navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
    
    // Mobile menu toggle
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', () => {
            elements.menuToggle.classList.toggle('active');
            elements.navLinksContainer.classList.toggle('active');
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 100;
    
    // Get all sections
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (correspondingLink) {
                elements.navLinks.forEach(link => link.classList.remove('active'));
                correspondingLink.classList.add('active');
            }
        }
    });
}

function initializeLanguageSwitcher() {
    elements.langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            
            if (lang !== state.currentLanguage) {
                // Update active button
                elements.langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update language
                state.currentLanguage = lang;
                
                // Update content
                updateContentLanguage();
                
                // Save preference
                localStorage.setItem('preferredLanguage', lang);
            }
        });
    });
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        const button = document.querySelector(`.lang-btn[data-lang="${savedLanguage}"]`);
        if (button) {
            button.click();
        }
    }
}

function updateContentLanguage() {
    // This function would update all text content based on the selected language
    // For now, we'll just update the typed text
    initializeTypedText();
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = TRANSLATIONS[state.currentLanguage]?.[key] || key;
        element.textContent = translation;
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = TRANSLATIONS[state.currentLanguage]?.[key] || key;
        element.setAttribute('placeholder', translation);
    });
}

function initializeProjectsFilter() {
    elements.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            elements.filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter projects
            const filter = button.getAttribute('data-filter');
            renderProjects(filter);
        });
    });
}

function initializeMessageForm() {
    if (!elements.messageForm) return;
    
    // Character counter
    elements.messageText.addEventListener('input', () => {
        const length = elements.messageText.value.length;
        elements.charCount.textContent = length;
        
        // Change color if approaching limit
        if (length > 900) {
            elements.charCount.style.color = 'var(--danger)';
        } else if (length > 700) {
            elements.charCount.style.color = 'var(--secondary)';
        } else {
            elements.charCount.style.color = 'var(--text-muted)';
        }
    });
    
    // Clear form
    elements.clearFormBtn.addEventListener('click', () => {
        elements.messageForm.reset();
        elements.charCount.textContent = '0';
        elements.charCount.style.color = 'var(--text-muted)';
        updateMessageStatus('ready', 'Готово к отправке');
    });
    
    // Form submission - ИСПРАВЛЕННАЯ ВЕРСИЯ
    elements.messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check spam protection
        if (!checkMessageLimit()) {
            showToast('Лимит сообщений исчерпан. Попробуйте позже.', 'error');
            return;
        }
        
        // Validate captcha
        if (elements.captchaAnswer.value !== '10') {
            showToast('Неправильный ответ на проверку', 'error');
            return;
        }
        
        // Get form data
        const formData = new FormData(elements.messageForm);
        const message = {
            text: formData.get('message'),
            mood: formData.get('mood'),
            timestamp: new Date().toISOString()
        };
        
        // Validate message
        if (message.text.length < 10) {
            showToast('Сообщение слишком короткое', 'error');
            return;
        }
        
        if (message.text.length > 1000) {
            showToast('Сообщение слишком длинное', 'error');
            return;
        }
        
        try {
            updateMessageStatus('loading', 'Отправка...');
            
            // Проверяем, находимся ли мы на localhost
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            
            let response;
            
            if (isLocalhost) {
                // ЛОКАЛЬНАЯ СРЕДА: Имитируем успешную отправку
                console.log('Локальная среда: имитация отправки сообщения');
                
                // Показываем демо-режим
                updateMessageStatus('success', 'Демо-режим: сообщение отправлено!');
                
                // Записываем сообщение в localStorage для демонстрации
                const demoMessages = JSON.parse(localStorage.getItem('demoMessages') || '[]');
                demoMessages.push({
                    text: message.text,
                    mood: message.mood,
                    timestamp: new Date().toISOString(),
                    status: 'sent (demo)'
                });
                localStorage.setItem('demoMessages', JSON.stringify(demoMessages));
                
                // Показываем успешное сообщение
                showToast('Демо-режим: Сообщение успешно отправлено!', 'success');
                
                // Очищаем форму
                elements.messageForm.reset();
                elements.charCount.textContent = '0';
                
                // Сбрасываем статус через 3 секунды
                setTimeout(() => {
                    updateMessageStatus('ready', 'Готово к отправке');
                }, 3000);
                
                return; // Завершаем выполнение для локальной среды
            }
            
            // ПРОДАКШЕН СРЕДА: реальная отправка через Netlify Function
            console.log('Продакшен среда: отправка через Netlify Function');
            
            response = await fetch(CONFIG.SEND_MESSAGE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            });
            
            // Проверяем, что ответ существует и его можно парсить
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            
            // Проверяем, не пустой ли ответ
            if (!responseText) {
                throw new Error('Empty response from server');
            }
            
            const result = JSON.parse(responseText);
            
            if (result.success) {
                // Update message status
                updateMessageStatus('success', 'Сообщение отправлено!');
                
                // Record message sent
                recordMessageSent();
                
                // Clear form
                elements.messageForm.reset();
                elements.charCount.textContent = '0';
                
                // Show success message
                showToast('Сообщение успешно отправлено анонимно!', 'success');
                
                // Reset status after 3 seconds
                setTimeout(() => {
                    updateMessageStatus('ready', 'Готово к отправке');
                }, 3000);
            } else {
                throw new Error(result.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Детализируем ошибку для пользователя
            let errorMessage = 'Ошибка при отправке сообщения';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Нет соединения с сервером. Проверьте подключение к интернету.';
            } else if (error.message.includes('JSON.parse')) {
                errorMessage = 'Ошибка обработки ответа от сервера.';
            } else if (error.message.includes('Empty response')) {
                errorMessage = 'Сервер не ответил. Возможно, функция Netlify не настроена.';
            }
            
            updateMessageStatus('error', errorMessage);
            showToast(errorMessage, 'error');
            
            // Показываем дополнительные детали в консоли
            console.log('Подсказка для разработчика:');
            console.log('1. Netlify Functions работают только после деплоя на Netlify');
            console.log('2. Для локальной разработки используйте демо-режим');
            console.log('3. Проверьте настройки функции send-message.js');
        }
    });
}

function updateMessageStatus(status, text) {
    if (!elements.messageStatus) return;
    
    const icon = elements.messageStatus.querySelector('.status-icon i');
    const textElement = elements.messageStatus.querySelector('p');
    
    // Clear all status classes
    elements.messageStatus.className = 'message-status';
    icon.className = '';
    
    // Update based on status
    switch (status) {
        case 'loading':
            elements.messageStatus.classList.add('loading');
            icon.className = 'fas fa-spinner fa-spin';
            break;
        case 'success':
            elements.messageStatus.classList.add('success');
            icon.className = 'fas fa-check';
            break;
        case 'error':
            elements.messageStatus.classList.add('error');
            icon.className = 'fas fa-exclamation-triangle';
            break;
        case 'ready':
            elements.messageStatus.classList.add('ready');
            icon.className = 'fas fa-paper-plane';
            break;
    }
    
    // Update text
    textElement.textContent = text;
}

function checkMessageLimit() {
    const now = Date.now();
    const oneHourAgo = now - CONFIG.MESSAGE_TIMEFRAME;
    
    // Filter messages sent in the last hour
    const recentMessages = state.messagesSent.filter(time => time > oneHourAgo);
    
    // Update state
    state.messagesSent = recentMessages;
    localStorage.setItem('messagesSent', JSON.stringify(state.messagesSent));
    
    // Check if limit exceeded
    return recentMessages.length < CONFIG.MESSAGE_LIMIT;
}

function recordMessageSent() {
    state.messagesSent.push(Date.now());
    localStorage.setItem('messagesSent', JSON.stringify(state.messagesSent));
}

function initializeGallery() {
    if (!elements.galleryGrid) return;
    
    // Generate gallery images (in a real app, these would come from a server)
    const images = [];
    for (let i = 1; i <= state.galleryImages; i++) {
        images.push({
            id: i,
            url: `/assets/images/gallery/${i}.jpg`,
            alt: `Изображение ${i}`,
            thumbnail: `/assets/images/gallery/thumb-${i}.jpg`
        });
    }
    
    renderGallery(images);
    
    // Load more button
    if (elements.loadMoreGalleryBtn) {
        elements.loadMoreGalleryBtn.addEventListener('click', () => {
            state.galleryImages += 6;
            initializeGallery();
        });
    }
}

function renderGallery(images) {
    if (!elements.galleryGrid) return;
    
    elements.galleryGrid.innerHTML = '';
    
    images.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.thumbnail}" alt="${image.alt}" loading="lazy">
        `;
        
        // Add click event to show full image
        galleryItem.addEventListener('click', () => {
            showFullImage(image);
        });
        
        elements.galleryGrid.appendChild(galleryItem);
    });
}

function showFullImage(image) {
    // Create modal for full image
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.alt;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 3rem;
        cursor: pointer;
        z-index: 2001;
    `;
    
    modal.appendChild(img);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // Close modal on click
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === closeBtn) {
            document.body.removeChild(modal);
        }
    });
}

function initializeAdminModal() {
    if (!elements.addEntryBtn || !elements.adminModal) return;
    
    // Open modal
    elements.addEntryBtn.addEventListener('click', () => {
        elements.adminModal.classList.add('active');
    });
    
    // Close modal
    elements.closeModalBtn.addEventListener('click', closeAdminModal);
    elements.cancelModalBtn.addEventListener('click', closeAdminModal);
    
    // Close modal on outside click
    elements.adminModal.addEventListener('click', (e) => {
        if (e.target === elements.adminModal) {
            closeAdminModal();
        }
    });
    
    // Form submission
    if (elements.addEntryForm) {
        elements.addEntryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate password
            const password = document.getElementById('entryPassword').value;
            if (password !== CONFIG.ADMIN_PASSWORD) {
                showToast('Неверный пароль', 'error');
                return;
            }
            
            // Create new entry
            const newEntry = {
                title: document.getElementById('entryTitle').value,
                content: document.getElementById('entryContent').value,
                mood: document.getElementById('entryMood').value,
                date: new Date().toISOString().split('T')[0],
                tags: ['новая запись']
            };
            
            // Add to blog entries
            state.blogEntries.unshift(newEntry);
            
            // Re-render blog entries
            renderBlogEntries();
            
            // Close modal
            closeAdminModal();
            
            // Clear form
            elements.addEntryForm.reset();
            
            // Show success message
            showToast('Запись добавлена!', 'success');
        });
    }
}

function closeAdminModal() {
    elements.adminModal.classList.remove('active');
}

function initializeBackToTop() {
    if (!elements.backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            elements.backToTopBtn.classList.add('visible');
        } else {
            elements.backToTopBtn.classList.remove('visible');
        }
    });
    
    elements.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initializeScrollAnimations() {
    // Initialize GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Animate sections on scroll
        gsap.utils.toArray('section').forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
        
        // Animate project cards
        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.from(card, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: i * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
        
        // Animate skill bars
        gsap.utils.toArray('.skill-progress').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            gsap.to(bar, {
                width: width,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: bar.parentElement.parentElement,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }
}

function initializeAnimations() {
    // Animate floating elements
    animateFloatingElements();
    
    // Animate stats counter
    animateStatsCounter();
}

function animateFloatingElements() {
    const elements = document.querySelectorAll('.float-element');
    elements.forEach(element => {
        // Already animated via CSS
    });
}

function animateStatsCounter() {
    // Animate project count
    const projectCount = document.getElementById('projectCount');
    if (projectCount) {
        const target = parseInt(projectCount.textContent);
        animateValue(projectCount, 0, target, 2000);
    }
    
    // Animate experience
    const experience = document.getElementById('experience');
    if (experience) {
        const target = parseInt(experience.textContent);
        animateValue(experience, 0, target, 1500);
    }
    
    // Animate skills count
    const skillsCount = document.getElementById('skillsCount');
    if (skillsCount) {
        const target = parseInt(skillsCount.textContent);
        animateValue(skillsCount, 0, target, 2500);
    }
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (element.id === 'projectCount' ? '+' : '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        transform: translateX(100%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    `;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function updateStats() {
    // Update project count
    if (elements.projectCount && state.projects.length > 0) {
        elements.projectCount.textContent = state.projects.length + '+';
    }
    
    // Update skills count
    if (elements.skillsCount && state.skills.length > 0) {
        let totalSkills = 0;
        state.skills.forEach(category => {
            totalSkills += category.skills.length;
        });
        elements.skillsCount.textContent = totalSkills + '+';
    }
}

function createParticles() {
    if (!elements.particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 5 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Apply styles
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(99, 102, 241, ${opacity});
            border-radius: 50%;
            top: ${posY}%;
            left: ${posX}%;
            animation: floatParticle ${duration}s linear infinite;
            animation-delay: ${delay}s;
        `;
        
        elements.particlesContainer.appendChild(particle);
    }
    
    // Add CSS animation
    if (!document.querySelector('#particle-animation')) {
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 100}px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== TRANSLATIONS =====
const TRANSLATIONS = {
    ru: {
        // Navigation
        'nav.home': 'Главная',
        'nav.about': 'Обо мне',
        'nav.projects': 'Проекты',
        'nav.skills': 'Навыки',
        'nav.life': 'Жизнь',
        'nav.contact': 'Контакты',
        'nav.message': 'Анонимное сообщение',
        
        // Hero
        'hero.badge': '15 лет • Разработчик',
        'hero.title1': 'Привет, я',
        'hero.subtitle': 'Создаю красивые и функциональные веб-интерфейсы с любовью к сложным анимациям и нестандартным решениям. Занимаюсь боксом, играю в теннис и постоянно развиваюсь.',
        'hero.projectsBtn': 'Смотреть проекты',
        'hero.contactBtn': 'Связаться',
        'hero.messageBtn': 'Анонимное сообщение',
        'hero.projects': 'Проектов',
        'hero.experience': 'Года опыта',
        'hero.skills': 'Навыков',
        
        // About
        'about.title': 'Обо мне',
        'about.subtitle': 'Молодой, амбициозный и постоянно развивающийся',
        'about.heading': 'Муинов Миразиз',
        'about.description1': 'В 15 лет я уже активно занимаюсь веб-разработкой, создавая как фронтенд, так и бэкенд приложений. Моя страсть — превращать сложные идеи в элегантные и интуитивно понятные интерфейсы.',
        'about.description2': 'Помимо программирования, я занимаюсь боксом, что помогает развивать дисциплину и выносливость, и играю в теннис для поддержания концентрации и стратегического мышления. Эти качества помогают мне в разработке — находить нестандартные решения и доводить проекты до идеала.',
        'about.description3': 'Я открыт для сотрудничества, интересных проектов и всегда рад новым знакомствам в IT-сфере. Строю личный бренд и стремлюсь выделяться среди других разработчиков своим уникальным подходом и вниманием к деталям.',
        'about.quote': 'Код — это поэзия, написанная для машин, но понятная людям',
        'about.info.age': 'Возраст',
        'about.info.location': 'Местоположение',
        'about.info.locationText': 'Узбекистан',
        'about.info.education': 'Образование',
        'about.info.educationText': 'Самообразование + курсы',
        'about.info.status': 'Статус',
        'about.info.statusText': 'Фрилансер / Ищу проекты',
        'about.info.hobbies': 'Хобби',
        'about.hobby1': 'Бокс',
        'about.hobby2': 'Теннис',
        'about.hobby3': 'Дизайн',
        'about.hobby4': 'Фотография',
        'about.timeline': 'Мой путь',
        'about.timeline1.title': 'Первые шаги в программировании',
        'about.timeline1.desc': 'Изучение основ Python и создание первых простых скриптов',
        'about.timeline2.title': 'Погружение в веб-разработку',
        'about.timeline2.desc': 'Изучение HTML, CSS, JavaScript и создание первых веб-сайтов',
        'about.timeline3.title': 'Бэкенд и фреймворки',
        'about.timeline3.desc': 'Освоение Django, React, работа с базами данных и API',
        'about.timeline4.title': 'Коммерческие проекты',
        'about.timeline4.desc': 'Разработка сайтов для бизнеса, Telegram-ботов и систем учета',
        
        // Projects
        'projects.title': 'Проекты',
        'projects.subtitle': 'Мои работы, от простых сайтов до сложных систем',
        'projects.filter.all': 'Все',
        'projects.filter.web': 'Веб-сайты',
        'projects.filter.system': 'Системы',
        'projects.filter.bot': 'Telegram-боты',
        'projects.github': 'Больше проектов на GitHub',
        'projects.repos': 'репозиториев',
        
        // Skills
        'skills.title': 'Навыки & Технологии',
        'skills.subtitle': 'Инструменты и технологии, которые я использую',
        
        // Life
        'life.title': 'Жизнь & Блог',
        'life.subtitle': 'Мысли, достижения и моменты из жизни',
        'life.loadMore': 'Загрузить больше',
        'life.addEntry': '+ Добавить запись (админ)',
        'life.mood': 'Настроение за последнюю неделю',
        'life.mood.happy': 'Счастливый',
        'life.mood.productive': 'Продуктивный',
        'life.mood.relaxed': 'Расслабленный',
        'life.mood.tired': 'Уставший',
        
        // Message
        'message.title': 'Анонимное сообщение',
        'message.subtitle': 'Отправьте мне сообщение без указания имени',
        'message.info.title': 'Полная анонимность',
        'message.info.desc': 'Ваше сообщение будет отправлено напрямую мне в Telegram через защищенное соединение. Никакие данные об отправителе не сохраняются.',
        'message.feature1': 'Без регистрации',
        'message.feature2': 'Без сохранения данных',
        'message.feature3': 'Без отслеживания',
        'message.feature4': 'Защита от спама',
        'message.form.label': 'Ваше сообщение:',
        'message.form.placeholder': 'Напишите что-нибудь... Совет, вопрос, отзыв или просто приветствие!',
        'message.form.mood': 'Настроение сообщения:',
        'message.mood.neutral': 'Нейтральное',
        'message.mood.positive': 'Позитивное',
        'message.mood.question': 'Вопрос',
        'message.mood.feedback': 'Отзыв',
        'message.captcha.question': 'Сколько будет 7 + 3?',
        'message.captcha.placeholder': '10',
        'message.form.submit': 'Отправить анонимно',
        'message.form.clear': 'Очистить',
        'message.notice': 'Защита от спама: максимум 3 сообщения в час с одного устройства',
        'message.ready': 'Готово к отправке',
        
        // Contact
        'contact.title': 'Контакты',
        'contact.subtitle': 'Свяжитесь со мной любым удобным способом',
        'contact.gallery': 'Галерея',
        'contact.loadMore': 'Показать больше',
        'contact.cta': 'Есть проект или идея?',
        'contact.ctaDesc': 'Обсудим и создадим что-то удивительное вместе!',
        'contact.ctaBtn': 'Начать разговор',
        
        // Footer
        'footer.description': '15-летний разработчик, создающий будущее веба',
        'footer.links': 'Ссылки',
        'footer.home': 'Главная',
        'footer.about': 'Обо мне',
        'footer.projects': 'Проекты',
        'footer.skills': 'Навыки',
        'footer.more': 'Дополнительно',
        'footer.life': 'Жизнь',
        'footer.message': 'Анонимное сообщение',
        'footer.contact': 'Контакты',
        'footer.legal': 'Правовая информация',
        'footer.privacy': 'Политика конфиденциальности',
        'footer.terms': 'Условия использования',
        'footer.cookies': 'Cookies',
        'footer.copyright': '© 2023 Муинов Миразиз. Все права защищены.',
        'footer.madeWith': 'Сделано с',
        'footer.and': 'и',
        
        // Modal
        'modal.title': 'Добавить запись в блог',
        'modal.titleLabel': 'Заголовок:',
        'modal.contentLabel': 'Содержание:',
        'modal.moodLabel': 'Настроение:',
        'modal.mood.happy': 'Счастливый',
        'modal.mood.productive': 'Продуктивный',
        'modal.mood.excited': 'Взволнованный',
        'modal.mood.neutral': 'Нейтральный',
        'modal.mood.tired': 'Уставший',
        'modal.passwordLabel': 'Пароль администратора:',
        'modal.submit': 'Добавить запись',
        'modal.cancel': 'Отмена'
    },
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.projects': 'Projects',
        'nav.skills': 'Skills',
        'nav.life': 'Life',
        'nav.contact': 'Contact',
        'nav.message': 'Anonymous Message',
        
        // Hero
        'hero.badge': '15 years • Developer',
        'hero.title1': 'Hi, I\'m',
        'hero.subtitle': 'I create beautiful and functional web interfaces with a love for complex animations and unconventional solutions. I practice boxing, play tennis, and constantly develop.',
        'hero.projectsBtn': 'View Projects',
        'hero.contactBtn': 'Get in Touch',
        'hero.messageBtn': 'Anonymous Message',
        'hero.projects': 'Projects',
        'hero.experience': 'Years Experience',
        'hero.skills': 'Skills',
        
        // About
        'about.title': 'About Me',
        'about.subtitle': 'Young, ambitious and constantly developing',
        'about.heading': 'Muinov Miraziz',
        'about.description1': 'At 15, I\'m already actively engaged in web development, creating both frontend and backend applications. My passion is turning complex ideas into elegant and intuitive interfaces.',
        'about.description2': 'Besides programming, I practice boxing, which helps develop discipline and endurance, and play tennis to maintain concentration and strategic thinking. These qualities help me in development - to find non-standard solutions and bring projects to perfection.',
        'about.description3': 'I\'m open to cooperation, interesting projects and always glad to meet new people in the IT field. I\'m building a personal brand and strive to stand out among other developers with my unique approach and attention to detail.',
        'about.quote': 'Code is poetry written for machines but understandable to humans',
        'about.info.age': 'Age',
        'about.info.location': 'Location',
        'about.info.locationText': 'Uzbekistan',
        'about.info.education': 'Education',
        'about.info.educationText': 'Self-education + courses',
        'about.info.status': 'Status',
        'about.info.statusText': 'Freelancer / Looking for projects',
        'about.info.hobbies': 'Hobbies',
        'about.hobby1': 'Boxing',
        'about.hobby2': 'Tennis',
        'about.hobby3': 'Design',
        'about.hobby4': 'Photography',
        'about.timeline': 'My Journey',
        'about.timeline1.title': 'First steps in programming',
        'about.timeline1.desc': 'Learning Python basics and creating first simple scripts',
        'about.timeline2.title': 'Diving into web development',
        'about.timeline2.desc': 'Learning HTML, CSS, JavaScript and creating first websites',
        'about.timeline3.title': 'Backend and frameworks',
        'about.timeline3.desc': 'Mastering Django, React, working with databases and APIs',
        'about.timeline4.title': 'Commercial projects',
        'about.timeline4.desc': 'Developing websites for businesses, Telegram bots and accounting systems',
        
        // Projects
        'projects.title': 'Projects',
        'projects.subtitle': 'My works, from simple websites to complex systems',
        'projects.filter.all': 'All',
        'projects.filter.web': 'Websites',
        'projects.filter.system': 'Systems',
        'projects.filter.bot': 'Telegram Bots',
        'projects.github': 'More projects on GitHub',
        'projects.repos': 'repositories',
        
        // Skills
        'skills.title': 'Skills & Technologies',
        'skills.subtitle': 'Tools and technologies I use',
        
        // Life
        'life.title': 'Life & Journal',
        'life.subtitle': 'Thoughts, achievements and life moments',
        'life.loadMore': 'Load More',
        'life.addEntry': '+ Add Entry (Admin)',
        'life.mood': 'Mood for the past week',
        'life.mood.happy': 'Happy',
        'life.mood.productive': 'Productive',
        'life.mood.relaxed': 'Relaxed',
        'life.mood.tired': 'Tired',
        
        // Message
        'message.title': 'Anonymous Message',
        'message.subtitle': 'Send me a message without revealing your identity',
        'message.info.title': 'Complete Anonymity',
        'message.info.desc': 'Your message will be sent directly to me in Telegram through a secure connection. No sender data is stored.',
        'message.feature1': 'No registration',
        'message.feature2': 'No data storage',
        'message.feature3': 'No tracking',
        'message.feature4': 'Spam protection',
        'message.form.label': 'Your message:',
        'message.form.placeholder': 'Write something... Advice, question, feedback or just a greeting!',
        'message.form.mood': 'Message mood:',
        'message.mood.neutral': 'Neutral',
        'message.mood.positive': 'Positive',
        'message.mood.question': 'Question',
        'message.mood.feedback': 'Feedback',
        'message.captcha.question': 'What is 7 + 3?',
        'message.captcha.placeholder': '10',
        'message.form.submit': 'Send Anonymously',
        'message.form.clear': 'Clear',
        'message.notice': 'Spam protection: maximum 3 messages per hour from one device',
        'message.ready': 'Ready to send',
        
        // Contact
        'contact.title': 'Contacts',
        'contact.subtitle': 'Contact me in any convenient way',
        'contact.gallery': 'Gallery',
        'contact.loadMore': 'Show More',
        'contact.cta': 'Have a project or idea?',
        'contact.ctaDesc': 'Let\'s discuss and create something amazing together!',
        'contact.ctaBtn': 'Start Conversation',
        
        // Footer
        'footer.description': '15-year-old developer creating the future of the web',
        'footer.links': 'Links',
        'footer.home': 'Home',
        'footer.about': 'About',
        'footer.projects': 'Projects',
        'footer.skills': 'Skills',
        'footer.more': 'More',
        'footer.life': 'Life',
        'footer.message': 'Anonymous Message',
        'footer.contact': 'Contact',
        'footer.legal': 'Legal',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.cookies': 'Cookies',
        'footer.copyright': '© 2023 Muinov Miraziz. All rights reserved.',
        'footer.madeWith': 'Made with',
        'footer.and': 'and',
        
        // Modal
        'modal.title': 'Add Blog Entry',
        'modal.titleLabel': 'Title:',
        'modal.contentLabel': 'Content:',
        'modal.moodLabel': 'Mood:',
        'modal.mood.happy': 'Happy',
        'modal.mood.productive': 'Productive',
        'modal.mood.excited': 'Excited',
        'modal.mood.neutral': 'Neutral',
        'modal.mood.tired': 'Tired',
        'modal.passwordLabel': 'Admin Password:',
        'modal.submit': 'Add Entry',
        'modal.cancel': 'Cancel'
    }
};