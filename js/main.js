/* ========================================
   SHARED METAL 3D PRINTING WEBSITE SCRIPTS
   ======================================== */

// ========================================
// Web3Forms Integration
// ========================================

const WEB3FORMS_ACCESS_KEY = '6f33053b-6d08-414b-9615-665f88c98da8';

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const messageDiv = form.querySelector('.form-message');

  // Add access key
  formData.append('access_key', WEB3FORMS_ACCESS_KEY);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      messageDiv.classList.remove('error');
      messageDiv.classList.add('success');
      messageDiv.textContent = 'Thank you! Your message has been sent successfully.';
      form.reset();
    } else {
      messageDiv.classList.remove('success');
      messageDiv.classList.add('error');
      messageDiv.textContent = 'Error sending message. Please try again.';
    }
  } catch (error) {
    messageDiv.classList.remove('success');
    messageDiv.classList.add('error');
    messageDiv.textContent = 'Network error. Please try again later.';
    console.error('Form submission error:', error);
  }
}

// Initialize form listeners
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }
});

// ========================================
// RSS Feed Integration
// ========================================

const RSS_FEEDS = [
  {
    url: 'https://3dprint.com/feed/',
    title: '3D Printing Industry News'
  },
  {
    url: 'https://3dprintingindustry.com/feed/',
    title: '3D Printing Industry'
  },
  {
    url: 'https://3dnatives.com/en/feed/',
    title: '3D Natives'
  },
  {
    url: 'https://newatlas.com/index.rss',
    title: 'New Atlas'
  },
  {
    url: 'https://www.archdaily.com/feed',
    title: 'ArchDaily'
  },
  {
    url: 'https://www.dezeen.com/architecture/feed/',
    title: 'Dezeen'
  }
];

// Parse RSS feed with CORS proxy
async function fetchRSSFeed(feedUrl) {
  try {
    const corsProxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feedUrl);
    const response = await fetch(corsProxyUrl);
    const data = await response.json();

    if (data.items) {
      return data.items.slice(0, 3).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: new Date(item.pubDate).toLocaleDateString(),
        description: item.description ? stripHtml(item.description).substring(0, 150) + '...' : ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching RSS feed:', feedUrl, error);
    return [];
  }
}

// Strip HTML tags from text
function stripHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Load and display news feed
async function loadNewsFeed() {
  const newsFeedContainer = document.getElementById('news-feed');

  if (!newsFeedContainer) return;

  newsFeedContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading latest news...</p>';

  const allArticles = [];

  for (const feed of RSS_FEEDS) {
    const articles = await fetchRSSFeed(feed.url);
    allArticles.push(...articles);
  }

  // Sort by date (newest first) and get top 6
  const sortedArticles = allArticles
    .filter(article => article.title && article.link)
    .slice(0, 6);

  if (sortedArticles.length === 0) {
    newsFeedContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Unable to load news at this time.</p>';
    return;
  }

  newsFeedContainer.innerHTML = sortedArticles.map(article => `
    <div class="news-item">
      <div class="news-image">📰</div>
      <div class="news-content">
        <div class="news-date">${article.pubDate}</div>
        <h4>${article.title}</h4>
        <p>${article.description}</p>
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-link">
          Read More →
        </a>
      </div>
    </div>
  `).join('');
}

// Load news when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNewsFeed);
} else {
  loadNewsFeed();
}

// ========================================
// Navigation Toggle
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.navbar-toggle');
  const navMenu = document.querySelector('.navbar-nav');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
      });
    });
  }
});

// ========================================
// Intersection Observer for Animations
// ========================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.card, .feature-row, .testimonial');
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(element);
  });
});

// ========================================
// Smooth Scroll
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ========================================
// Active Navigation Indicator
// ========================================

window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav a[href^="#"]');

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});

// ========================================
// Scroll Progress Bar
// ========================================

function updateScrollProgress() {
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollTop = document.documentElement.scrollTop;
  const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      z-index: 999;
      transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
  }

  progressBar.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress);

// ========================================
// Copy to Clipboard
// ========================================

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    alert('Copied to clipboard!');
  }).catch(function(err) {
    console.error('Failed to copy: ', err);
  });
}

// ========================================
// Table of Contents
// ========================================

function generateTableOfContents() {
  const tocContainer = document.getElementById('table-of-contents');
  if (!tocContainer) return;

  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (headings.length === 0) return;

  const toc = document.createElement('ul');
  let currentLevel = 2;
  let currentList = toc;
  const listStack = [toc];

  headings.forEach(heading => {
    const level = parseInt(heading.tagName[1]);
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    li.appendChild(link);

    if (level > currentLevel) {
      for (let i = currentLevel; i < level; i++) {
        const newList = document.createElement('ul');
        if (currentList.lastChild) {
          currentList.lastChild.appendChild(newList);
        } else {
          currentList.appendChild(newList);
        }
        listStack.push(newList);
        currentList = newList;
      }
    } else if (level < currentLevel) {
      for (let i = currentLevel; i > level; i--) {
        listStack.pop();
        currentList = listStack[listStack.length - 1];
      }
    }

    currentLevel = level;
    currentList.appendChild(li);
  });

  tocContainer.innerHTML = '';
  tocContainer.appendChild(toc);
}

document.addEventListener('DOMContentLoaded', generateTableOfContents);

// ========================================
// Print Friendly
// ========================================

function printPage() {
  window.print();
}

// ========================================
// Analytics Helper
// ========================================

function trackEvent(eventName, eventData = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
  console.log('Event tracked:', eventName, eventData);
}

// Track button clicks
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('button, .btn, a.btn-primary, a.btn-secondary');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      trackEvent('button_click', {
        button_text: this.textContent,
        button_class: this.className
      });
    });
  });
});

// ========================================
// Lazy Load Images
// ========================================

function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
  }
}

document.addEventListener('DOMContentLoaded', lazyLoadImages);

// ========================================
// Utility Functions
// ========================================

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format currency
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export functions for use in other scripts
window.metalprint3d = {
  handleFormSubmit,
  fetchRSSFeed,
  loadNewsFeed,
  copyToClipboard,
  printPage,
  trackEvent,
  formatNumber,
  formatCurrency,
  debounce,
  throttle
};
