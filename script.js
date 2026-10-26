const themePalettes = {
    dark: {
        gradientStops: ["rgba(10, 10, 10, 1)", "rgba(30, 30, 60, 1)", "rgba(5, 5, 20, 1)"],
        blobStart: { r: 160, g: 32, b: 240 },
        blobEnd: { r: 240, g: 60, b: 130 },
        shadow: "rgba(0, 0, 0, 0.2)",
    },
    light: {
        gradientStops: ["rgba(250, 249, 255, 1)", "rgba(238, 240, 255, 1)", "rgba(252, 248, 255, 1)"],
        blobStart: { r: 179, g: 148, b: 255 },
        blobEnd: { r: 139, g: 92, b: 246 },
        shadow: "rgba(15, 23, 42, 0.08)",
    },
};

const themeTransitionDuration = 720;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentTheme = "dark";
let themeTransition = null;
let themeTransitionTimer = null;

try {
    const storedTheme = localStorage.getItem("portfolio-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
        currentTheme = storedTheme;
    }
} catch (error) {
    console.warn("Theme preference could not be loaded.", error);
}

function parseRgbaColor(color) {
    const match = color.match(/rgba?\(([^)]+)\)/);

    if (!match) {
        return { r: 255, g: 255, b: 255, a: 1 };
    }

    const parts = match[1].split(",").map(part => part.trim());
    const [r, g, b] = parts.slice(0, 3).map(Number);
    const a = parts.length > 3 ? Number(parts[3]) : 1;

    return { r, g, b, a };
}

function mixNumber(start, end, amount) {
    return start + (end - start) * amount;
}

function mixColor(startColor, endColor, amount) {
    return {
        r: Math.round(mixNumber(startColor.r, endColor.r, amount)),
        g: Math.round(mixNumber(startColor.g, endColor.g, amount)),
        b: Math.round(mixNumber(startColor.b, endColor.b, amount)),
        a: mixNumber(startColor.a ?? 1, endColor.a ?? 1, amount),
    };
}

function colorToRgba(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(3)})`;
}

function easeInOutCubic(amount) {
    return amount < 0.5 ? 4 * amount * amount * amount : 1 - Math.pow(-2 * amount + 2, 3) / 2;
}

function blendPalette(fromPalette, toPalette, amount) {
    const gradientStops = fromPalette.gradientStops.map((stop, index) =>
        colorToRgba(mixColor(parseRgbaColor(stop), parseRgbaColor(toPalette.gradientStops[index]), amount))
    );

    return {
        gradientStops,
        blobStart: mixColor(fromPalette.blobStart, toPalette.blobStart, amount),
        blobEnd: mixColor(fromPalette.blobEnd, toPalette.blobEnd, amount),
        shadow: colorToRgba(mixColor(parseRgbaColor(fromPalette.shadow), parseRgbaColor(toPalette.shadow), amount)),
    };
}

function getRenderedPalette(now = performance.now()) {
    if (!themeTransition) {
        return themePalettes[currentTheme];
    }

    const elapsed = now - themeTransition.startedAt;
    const progress = Math.min(elapsed / themeTransition.duration, 1);

    if (progress >= 1) {
        themeTransition = null;
        return themePalettes[currentTheme];
    }

    return blendPalette(themePalettes[themeTransition.fromTheme], themePalettes[themeTransition.toTheme], easeInOutCubic(progress));
}

function triggerThemeTransition(previousTheme, nextTheme) {
    if (prefersReducedMotion) {
        return;
    }

    themeTransition = {
        fromTheme: previousTheme,
        toTheme: nextTheme,
        startedAt: performance.now(),
        duration: themeTransitionDuration,
    };

    document.body.classList.remove("theme-transitioning");
    void document.body.offsetWidth;
    document.body.classList.add("theme-transitioning");

    if (themeTransitionTimer) {
        window.clearTimeout(themeTransitionTimer);
    }

    themeTransitionTimer = window.setTimeout(() => {
        document.body.classList.remove("theme-transitioning");
        themeTransition = null;
    }, themeTransitionDuration);
}

const themeToggle = document.getElementById("theme-toggle");
document.body.dataset.theme = currentTheme;

function syncThemeToggle(theme) {
    if (!themeToggle) {
        return;
    }

    const isLight = theme === "light";
    themeToggle.checked = isLight;
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
}

function applyTheme(theme, persist = true) {
    if (theme === currentTheme) {
        syncThemeToggle(theme);
        return;
    }

    const previousTheme = currentTheme;
    currentTheme = theme;
    document.body.dataset.theme = theme;

    if (persist) {
        try {
            localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
            console.warn("Theme preference could not be saved.", error);
        }
    }

    syncThemeToggle(theme);
    triggerThemeTransition(previousTheme, theme);
    drawGradientBackground();
}

syncThemeToggle(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener("change", () => {
        applyTheme(themeToggle.checked ? "light" : "dark");
    });
}

const pageContent = {
    en: {
        title: "Portfolio | Anastasiia Lehova",
        nav: { home: "Home", about: "About me", education: "Education", experience: "Experience", research: "Research", projects: "Projects" },
        hero: {
            title: "Anastasiia Lehova",
            roles: ["Software Engineer", "Graduate Researcher", "Data & Visualization"],
            description: "I build reliable software systems and research how visualization helps people understand complex data.",
            status: "Currently pursuing an M.S. in Computer Science",
            badges: ["Software Engineering", "Data & Visualization", "Graduate Research"],
            primaryCta: "Get in touch",
            secondaryCta: "Explore my work",
            researchCta: "View research",
            resumeLabel: "Resume",
            resumeText: "Open or download my resume PDF.",
        },
        about: {
            kicker: "About me",
            title: "Per aspera ad astra",
            ariaLabel: "Per aspera ad astra. Translation: Through hardships to the stars.",
            paragraphs: [
                "I recently graduated from the University of Wisconsin–Green Bay with a B.S. in Computer Science and a minor in Mathematics, and I am pursuing an M.S. in Computer Science at the University of Hawaii at Manoa. I also hold a B.A. in Translation from Priazovskiy State University in Ukraine, with a focus on English, Russian, Ukrainian, and French.",
                "My background across both technical and language-focused fields has influenced the way I think about building systems: with structure, clarity, and attention to how people interact with them. Outside of coding, I enjoy playing chess, reading books, and sketching.",
            ],
        },
        skills: {
            kicker: "Skills",
            groups: [
                { title: "Programming", items: ["Python", "Java", "C/C++", "React", "REST APIs", "Tailwind CSS", "Unreal Engine"] },
                { title: "Data Science", items: ["SQL", "DynamoDB", "R", "AWS", "AI/ML", "MongoDB"] },
                { title: "Other Tools", items: ["GitHub", "Figma", "Debugging", "Docker", "QA Testing", "Unity", "VR"] },
            ],
        },
        education: {
            heading: "My Education",
            schools: [
                { degree: "M.S. in Computer Science.", points: ["GPA: N/A", "Member of the LAVA lab", "Research Assistant focused on advanced visualization"] },
                { degree: "B.S. in Computer Science with a minor in Mathematics.", points: ["GPA: 3.5/4.0", "Member of the Computer Science, Robotics, Chess Clubs", "Dean`s List Honoree", "Recipient of the Several Academic Awards"] },
                { degree: "B.A. in Translation Studies.", points: ["English, French, Russian, and Ukrainian.", "Global Undergraduate Exchange Program Alumni", "Academic Scholarship Recipient"] },
            ],
        },
        experience: {
            heading: "My Experience",
            filterLabels: { all: "All", industry: "Industry", research: "Research", ariaLabel: "Filter experience" },
            roles: [
                { title: "Graduate Research Assistant", tags: ["Research", "Advanced Visualization", "HCI"], points: ["Conducting graduate research in advanced visualization as a member of the LAVA lab.", "Studying how visual interfaces can support the analysis and understanding of complex data."] },
                { title: "Sage Summer Camp", tags: ["Edge AI", "Visualization Lab", "AGU26"], points: ["Participated in the Chicago-based program hosted by UIC and its Visualization Lab.", "Collaborated with researchers from UIC and Oregon on visualization and Edge AI ideas.", "Submitted a research idea for AGU26."] },
                { title: "Software Engineer Intern", tags: ["Python", "SQL", "QA Testing", "AWS", "APIs"], points: ["Built backend APIs in Python and improved system reliability through debugging and feature enhancements.", "Optimized SQL queries and implemented AWS workflows for efficient data processing."] },
                { title: "Controls Engineer Intern", tags: ["Python", "SCADA", "Ignition", "SQL", "Automation"], points: ["Designed SCADA dashboards and automated workflows using Python to support real-time industrial monitoring.", "Optimized SQL queries and extended system functionality to improve data reliability and operational efficiency."] },
                { title: "Undergraduate Research Assistant", tags: ["Research", "Data Modeling", "ERP", "Robotics"], points: ["Conducted research on system workflows and human–robot interaction, designing data models and analyzing operational processes.", "Built an ERP system and programmed interactive robot behaviors to study real-world system performance and user interaction."] },
                { title: "Student Dispatch", tags: ["IT Support", "Troubleshooting", "Hardware", "Security"], points: ["Ensured secure and reliable environments through troubleshooting, system setup, and hardware lifecycle support.", "Supported campus IT operations by configuring hardware, managing user access, and maintaining systems."] },
            ],
        },
        projects: { heading: "My Projects", showMore: "Show more projects", showLess: "Show fewer projects" },
        footer: {
            quote: "Thank you for visiting my platform! I look forward to the opportunity to collaborate and work together!",
            heading: "Get in Touch",
            placeholders: { name: "Your Name", email: "Your Email", message: "Your Message" },
            submit: "Send Message",
            copyright: "© 2026 Anastasiia Lehova | All Rights Reserved.",
        },
        projectActions: { source: "Source code", demo: "Live demo" },
    },
    ru: {
        title: "Портфолио | Анастасия Легова",
        nav: { home: "Главная", about: "Обо мне", education: "Образование", experience: "Опыт", research: "Исследования", projects: "Проекты" },
        hero: {
            title: "Анастасия Легова",
            roles: ["Инженер-программист", "Исследователь", "Данные и визуализация"],
            description: "Создаю надежные программные системы и исследую, как визуализация помогает понимать сложные данные.",
            status: "Получаю степень M.S. по компьютерным наукам",
            badges: ["Разработка ПО", "Данные и визуализация", "Академические исследования"],
            primaryCta: "Связаться со мной",
            secondaryCta: "Посмотреть работы",
            researchCta: "Мои исследования",
            resumeLabel: "Резюме",
            resumeText: "Открыть или скачать PDF-резюме.",
        },
        about: {
            kicker: "Обо мне",
            title: "Per aspera ad astra",
            ariaLabel: "Per aspera ad astra. Перевод: Через трудности к звездам.",
            paragraphs: [
                "Недавно я окончила University of Wisconsin–Green Bay, получив степень B.S. по компьютерным наукам и minor по математике, и сейчас получаю степень M.S. по компьютерным наукам в University of Hawaii at Manoa. Также у меня есть степень B.A. по переводу из Priazovskiy State University в Украине, с акцентом на английский, русский, украинский и французский языки.",
                "Опыт в технической и языковой сферах повлиял на мой подход к созданию систем: через структуру, ясность и внимание к тому, как люди с ними взаимодействуют. Вне программирования я люблю играть в шахматы, читать книги и рисовать.",
            ],
        },
        skills: {
            kicker: "Навыки",
            groups: [
                { title: "Программирование", items: ["Python", "Java", "C/C++", "React", "REST API", "Tailwind CSS", "Unreal Engine"] },
                { title: "Наука о данных", items: ["SQL", "DynamoDB", "R", "AWS", "AI/ML", "MongoDB"] },
                { title: "Другие инструменты", items: ["GitHub", "Figma", "Отладка", "Docker", "QA Testing", "Unity", "VR"] },
            ],
        },
        education: {
            heading: "Образование",
            schools: [
                { degree: "Степень магистра по компьютерным наукам.", points: ["GPA: пока не указан", "Участница лаборатории LAVA", "Ассистент по исследованиям в области продвинутой визуализации"] },
                { degree: "Степень бакалавра по компьютерным наукам с minor по математике.", points: ["GPA: 3.5/4.0", "Участница клубов Computer Science, Robotics и Chess", "Отличница Dean`s List", "Лауреат нескольких академических наград"] },
                { degree: "Степень бакалавра по переводоведению.", points: ["Английский, французский, русский и украинский языки.", "Выпускница Global Undergraduate Exchange Program", "Получательница академической стипендии"] },
            ],
        },
        experience: {
            heading: "Опыт работы",
            filterLabels: { all: "Все", industry: "Индустрия", research: "Исследования", ariaLabel: "Фильтр опыта работы" },
            roles: [
                { title: "Ассистент по исследованиям в магистратуре", tags: ["Исследования", "Продвинутая визуализация", "HCI"], points: ["Провожу исследования в области продвинутой визуализации в составе лаборатории LAVA.", "Изучаю, как визуальные интерфейсы помогают анализировать и понимать сложные данные."] },
                { title: "Sage Summer Camp", tags: ["Edge AI", "Visualization Lab", "AGU26"], points: ["Участвовала в программе в Чикаго, организованной UIC и их лабораторией визуализации.", "Сотрудничала с исследователями из UIC и Орегона над идеями в области визуализации и Edge AI.", "Подала исследовательскую идею для AGU26."] },
                { title: "Стажер-инженер-программист", tags: ["Python", "SQL", "QA Testing", "AWS", "APIs"], points: ["Разрабатывала backend API на Python и повышала надежность системы через отладку и доработку функций.", "Оптимизировала SQL-запросы и внедряла AWS-процессы для эффективной обработки данных."] },
                { title: "Стажер-инженер по системам управления", tags: ["Python", "SCADA", "Ignition", "SQL", "Automation"], points: ["Проектировала SCADA-панели и автоматизировала рабочие процессы с помощью Python для мониторинга в реальном времени.", "Оптимизировала SQL-запросы и расширяла функциональность системы для повышения надежности данных и эффективности работы."] },
                { title: "Ассистент по исследованиям бакалавриата", tags: ["Research", "Data Modeling", "ERP", "Robotics"], points: ["Проводила исследования рабочих процессов и взаимодействия человека с роботом, проектировала модели данных и анализировала операционные процессы.", "Создала ERP-систему и программировала интерактивное поведение робота для изучения работы систем и пользовательского взаимодействия."] },
                { title: "Студенческая диспетчерская служба", tags: ["IT Support", "Troubleshooting", "Hardware", "Security"], points: ["Обеспечивала безопасную и надежную среду через устранение неполадок, настройку систем и поддержку жизненного цикла оборудования.", "Поддерживала ИТ-операции кампуса, настраивая оборудование, управляя доступами пользователей и обслуживая системы."] },
            ],
        },
        projects: { heading: "Мои проекты", showMore: "Показать больше проектов", showLess: "Показать меньше проектов" },
        footer: {
            quote: "Спасибо, что посетили мой сайт! Буду рада возможности сотрудничать и работать вместе!",
            heading: "Связаться со мной",
            placeholders: { name: "Ваше имя", email: "Ваш email", message: "Ваше сообщение" },
            submit: "Отправить сообщение",
            copyright: "© 2026 Anastasiia Lehova | Все права защищены.",
        },
        projectActions: { source: "Исходный код", demo: "Демо" },
    },
};

let currentLanguage = "en";
try {
    const storedLanguage = localStorage.getItem("portfolio-language");
    if (storedLanguage === "en" || storedLanguage === "ru") {
        currentLanguage = storedLanguage;
    }
} catch (error) {
    console.warn("Language preference could not be loaded.", error);
}

const languageToggle = document.getElementById("language-toggle");
function syncLanguageToggle(language) {
    if (!languageToggle) {
        return;
    }

    languageToggle.setAttribute("aria-label", language === "en" ? "Switch language to Russian" : "Переключить язык на английский");
    languageToggle.querySelectorAll("[data-lang-option]").forEach(option => {
        option.classList.toggle("is-active", option.dataset.langOption === language);
    });
}

let typedTextTimers = [];
function stopTypedTextAnimation() {
    typedTextTimers.forEach(timerId => window.clearTimeout(timerId));
    typedTextTimers = [];
}

function startTypedTextAnimation(textValues) {
    const typedTextElement = document.getElementById("typed-text");

    if (!typedTextElement || !textValues.length) {
        return;
    }

    stopTypedTextAnimation();

    if (prefersReducedMotion) {
        typedTextElement.textContent = textValues[textValues.length - 1];
        return;
    }

    const typeSpeed = 80;
    const deleteSpeed = 42;
    const holdDelay = 1200;
    const startDelay = 650;
    let textIndex = 0;

    function typeText(text, charIndex = 0) {
        typedTextElement.textContent = text.slice(0, charIndex);
        if (charIndex < text.length) {
            typedTextTimers.push(window.setTimeout(() => typeText(text, charIndex + 1), typeSpeed));
            return;
        }

        typedTextTimers.push(window.setTimeout(() => eraseText(text.length), holdDelay));
    }

    function eraseText(charIndex) {
        typedTextElement.textContent = typedTextElement.textContent.slice(0, charIndex);
        if (charIndex > 0) {
            typedTextTimers.push(window.setTimeout(() => eraseText(charIndex - 1), deleteSpeed));
            return;
        }

        textIndex = (textIndex + 1) % textValues.length;
        typedTextTimers.push(window.setTimeout(() => typeText(textValues[textIndex]), 120));
    }

    typedTextTimers.push(window.setTimeout(() => typeText(textValues[0]), startDelay));
}

function setText(root, selector, value) {
    const element = root?.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function getContent() {
    return pageContent[currentLanguage] || pageContent.en;
}

const navToggle = document.getElementById("nav-toggle");
const navBackdrop = document.getElementById("nav-backdrop");
const siteNav = document.getElementById("site-nav");
const mobileNavQuery = window.matchMedia("(max-width: 768px)");

function syncNavState(isOpen) {
    if (!navToggle) {
        return;
    }

    const icon = navToggle.querySelector("i");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    if (icon) {
        icon.className = isOpen ? "bx bx-x" : "bx bx-menu";
    }
}

function closeNav() {
    document.body.classList.remove("nav-open");

    if (navBackdrop) {
        navBackdrop.hidden = true;
    }

    syncNavState(false);
}

function openNav() {
    if (!siteNav || !mobileNavQuery.matches) {
        return;
    }

    document.body.classList.add("nav-open");

    if (navBackdrop) {
        navBackdrop.hidden = false;
    }

    syncNavState(true);
}

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        if (document.body.classList.contains("nav-open")) {
            closeNav();
        } else {
            openNav();
        }
    });

    navBackdrop?.addEventListener("click", closeNav);

    siteNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (mobileNavQuery.matches) {
                closeNav();
            }
        });
    });

    mobileNavQuery.addEventListener("change", event => {
        if (!event.matches) {
            closeNav();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeNav();
        }
    });

    syncNavState(false);
}

function applyLanguage(language, persist = true) {
    if (!pageContent[language]) {
        return;
    }

    currentLanguage = language;
    document.body.dataset.language = language;
    document.documentElement.lang = language;
    document.title = pageContent[language].title;

    if (persist) {
        try {
            localStorage.setItem("portfolio-language", language);
        } catch (error) {
            console.warn("Language preference could not be saved.", error);
        }
    }

    syncLanguageToggle(language);

    document.querySelectorAll(".navbar a").forEach(link => {
        const href = link.getAttribute("href");
        if (href === "#home") link.textContent = pageContent[language].nav.home;
        if (href === "#about-me") link.textContent = pageContent[language].nav.about;
        if (href === "#education") link.textContent = pageContent[language].nav.education;
        if (href === "#experience") link.textContent = pageContent[language].nav.experience;
        if (href === "#research") link.textContent = pageContent[language].nav.research;
        if (href === "#projects") link.textContent = pageContent[language].nav.projects;
    });

    setText(document, ".hero-title", pageContent[language].hero.title);
    setText(document, ".hero-description", pageContent[language].hero.description);
    setText(document, ".hero-status span", pageContent[language].hero.status);
    setText(document, ".hero-cta", pageContent[language].hero.primaryCta);
    setText(document, ".hero-secondary-link span", pageContent[language].hero.secondaryCta);
    setText(document, ".hero-research-link span", pageContent[language].hero.researchCta);
    setText(document, ".hero-note-label", pageContent[language].hero.resumeLabel);
    setText(document, ".hero-note strong", pageContent[language].hero.resumeText);

    document.querySelectorAll(".hero-badges span").forEach((badge, index) => {
        badge.textContent = pageContent[language].hero.badges[index] || badge.textContent;
    });

    const aboutSection = document.getElementById("about-me");
    if (aboutSection) {
        setText(aboutSection, ".section-kicker", pageContent[language].about.kicker);
        setText(aboutSection, ".about-me-quote", pageContent[language].about.title);

        const quote = aboutSection.querySelector(".about-me-quote");
        if (quote) {
            quote.setAttribute("aria-label", pageContent[language].about.ariaLabel);
        }

        aboutSection.querySelectorAll(".about-me-copy p").forEach((paragraph, index) => {
            paragraph.textContent = pageContent[language].about.paragraphs[index] || paragraph.textContent;
        });

        const skillSection = aboutSection.querySelector(".about-me-skills");
        setText(skillSection, ".section-kicker", pageContent[language].skills.kicker);
        skillSection?.querySelectorAll(".skill-card").forEach((card, index) => {
            const group = pageContent[language].skills.groups[index];
            if (!group) {
                return;
            }

            setText(card, "h3", group.title);
            card.querySelectorAll(".skill-chip-list span").forEach((chip, chipIndex) => {
                chip.textContent = group.items[chipIndex] || chip.textContent;
            });
        });
    }

    const educationSection = document.getElementById("education");
    setText(educationSection, ".heading", pageContent[language].education.heading);
    educationSection?.querySelectorAll(".content-box").forEach((card, index) => {
        const school = pageContent[language].education.schools[index];
        if (!school) {
            return;
        }

        setText(card, "p b", school.degree);
        card.querySelectorAll(".timeline-points li").forEach((point, pointIndex) => {
            point.textContent = school.points[pointIndex] || point.textContent;
        });
    });

    const experienceSection = document.getElementById("experience");
    setText(experienceSection, ".heading", pageContent[language].experience.heading);
    const experienceFilters = pageContent[language].experience.filterLabels;
    const filterGroup = experienceSection?.querySelector(".experience-filters");
    if (filterGroup && experienceFilters) {
        filterGroup.setAttribute("aria-label", experienceFilters.ariaLabel);
        filterGroup.querySelector('[data-filter="all"]').textContent = experienceFilters.all;
        filterGroup.querySelector('[data-filter="industry"]').textContent = experienceFilters.industry;
        filterGroup.querySelector('[data-filter="research"]').textContent = experienceFilters.research;
    }
    experienceSection?.querySelectorAll(".content-box").forEach((card, index) => {
        const role = pageContent[language].experience.roles[index];
        if (!role) {
            return;
        }

        setText(card, "p b", role.title);
        card.querySelectorAll(".timeline-tags li").forEach((tag, tagIndex) => {
            tag.textContent = role.tags[tagIndex] || tag.textContent;
        });
        card.querySelectorAll(".timeline-points li").forEach((point, pointIndex) => {
            point.textContent = role.points[pointIndex] || point.textContent;
        });
    });

    setText(document.getElementById("projects"), ".projects-header h2", pageContent[language].projects.heading);

    const footer = document.getElementById("contact");
    setText(footer, ".footer-quote", pageContent[language].footer.quote);
    setText(footer, ".header-icons h3", pageContent[language].footer.heading);

    if (footer) {
        const nameInput = footer.querySelector("#name");
        const emailInput = footer.querySelector("#email");
        const messageInput = footer.querySelector("#message");
        const submitButton = footer.querySelector("#contact-form button");
        const copyright = footer.querySelector(".footer-copyright");

        if (nameInput) nameInput.placeholder = pageContent[language].footer.placeholders.name;
        if (emailInput) emailInput.placeholder = pageContent[language].footer.placeholders.email;
        if (messageInput) messageInput.placeholder = pageContent[language].footer.placeholders.message;
        if (submitButton) submitButton.textContent = pageContent[language].footer.submit;
        if (copyright) copyright.textContent = pageContent[language].footer.copyright;
    }

    startTypedTextAnimation(pageContent[language].hero.roles);
    renderProjects();
}

if (languageToggle) {
    languageToggle.addEventListener("click", () => {
        applyLanguage(currentLanguage === "en" ? "ru" : "en");
    });
}

const canvas = document.querySelector("canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const blobs = [];
const numBlobs = 17;

function setupCanvas() {
    if (!canvas || !ctx) {
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGradientBackground();
}

function drawGradientBackground(palette = getRenderedPalette()) {
    if (!canvas || !ctx) {
        return;
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, palette.gradientStops[0]);
    gradient.addColorStop(0.5, palette.gradientStops[1]);
    gradient.addColorStop(1, palette.gradientStops[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initBlobs() {
    if (!canvas || !ctx) {
        return;
    }

    blobs.length = 0;

    for (let index = 0; index < numBlobs; index += 1) {
        blobs.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 50 + 30,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            dr: (Math.random() - 0.5) * 0.1,
            angle: Math.random() * 2 * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
        });
    }

    animateBlobs();
}

function updateBlobColor(blob, palette = getRenderedPalette()) {
    if (!canvas) {
        return;
    }

    const xFactor = blob.x / canvas.width;
    const yFactor = blob.y / canvas.height;

    const r = Math.floor(palette.blobStart.r * (1 - xFactor) + palette.blobEnd.r * xFactor);
    const g = Math.floor(palette.blobStart.g * (1 - yFactor) + palette.blobEnd.g * yFactor);
    const b = Math.floor(palette.blobStart.b * (1 - xFactor) + palette.blobEnd.b * xFactor);

    blob.color = `rgba(${r}, ${g}, ${b}, 1)`;
    blob.colorTransparent = `rgba(${r}, ${g}, ${b}, 0.7)`;
}

function drawBlob(blob, palette = getRenderedPalette()) {
    if (!ctx) {
        return;
    }

    const gradient = ctx.createRadialGradient(blob.x, blob.y, blob.radius * 0.1, blob.x, blob.y, blob.radius);
    gradient.addColorStop(0, blob.color);
    gradient.addColorStop(0.7, blob.colorTransparent);
    gradient.addColorStop(1, blob.colorTransparent);

    ctx.save();
    ctx.translate(blob.x, blob.y);
    ctx.rotate(blob.angle);
    ctx.translate(-blob.x, -blob.y);

    ctx.fillStyle = palette.shadow;
    ctx.beginPath();
    ctx.arc(blob.x + 10, blob.y + 10, blob.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

function animateBlobs() {
    if (!canvas || !ctx) {
        return;
    }

    const palette = getRenderedPalette();
    drawGradientBackground(palette);

    blobs.forEach(blob => {
        blob.x += blob.dx;
        blob.y += blob.dy;
        blob.radius += blob.dr;
        blob.angle += blob.rotationSpeed;

        if (blob.x - blob.radius < 0 || blob.x + blob.radius > canvas.width) blob.dx *= -1;
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > canvas.height) blob.dy *= -1;
        if (blob.radius < 20 || blob.radius > 50) blob.dr *= -1;

        updateBlobColor(blob, palette);
        drawBlob(blob, palette);
    });

    requestAnimationFrame(animateBlobs);
}

window.addEventListener("resize", setupCanvas);
setupCanvas();
initBlobs();

document.querySelectorAll("header nav a").forEach(anchor => {
    anchor.addEventListener("click", event => {
        event.preventDefault();

        const targetId = anchor.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);

        if (!targetSection) {
            return;
        }

        window.scrollTo({
            top: targetSection.offsetTop - window.innerHeight / 2 + targetSection.offsetHeight / 2,
            behavior: "smooth",
        });
    });
});

const projectData = [
    { title: { en: "ExpenseTracker", ru: "Трекер расходов ExpenseTracker" }, description: { en: "A full-stack expense tracking application designed to help users manage spending, analyze financial patterns, and stay on budget, featuring real-time dashboards, recurring transactions, and AI-powered insights.", ru: "Полноценное приложение для учета расходов, помогающее управлять тратами, анализировать финансовые привычки и придерживаться бюджета. В нем есть панели в реальном времени, повторяющиеся транзакции и аналитика на основе ИИ." }, image: "image/expense-tracker.png", imageAlt: { en: "ExpenseTracker screenshot", ru: "Скриншот ExpenseTracker" }, tags: ["React", "JavaScript", "Tailwind CSS", "Node.js", "JWT", "MongoDB"], link: "https://github.com/lehovaa/ExpenseTracker", linkLabel: { en: "Open ExpenseTracker on GitHub", ru: "Открыть ExpenseTracker на GitHub" }, demoLink: "https://expense-tracker-beta-eosin.vercel.app/login" },
    { title: { en: "Distributed Audio Processing System", ru: "Распределенная система обработки аудио" }, description: { en: "A distributed system for parallel audio processing. The application handles asynchronous file uploads, processes audio data concurrently, and extracts features such as spectral centroid, bandwidth, and loudness.", ru: "Распределенная система для параллельной обработки аудио. Приложение обрабатывает асинхронные загрузки файлов, параллельно анализирует аудиоданные и извлекает такие признаки, как спектральный центроид, полоса пропускания и громкость." }, image: "image/audio2.png", imageAlt: { en: "Audio Processing System screenshot", ru: "Скриншот системы обработки аудио" }, tags: ["Python", "Redis", "Celery", "Audio Processing", "JavaScript", "Flask"], link: "https://github.com/lehovaa/Distributed-Audio-Processing-System", linkLabel: { en: "Open Distributed Audio Processing System on GitHub", ru: "Открыть распределенную систему обработки аудио на GitHub" }, demoLink: null },
    { title: { en: "Pirate Shooter 3D Game", ru: "3D-игра Pirate Shooter" }, description: { en: "A 3D action game where players take on the role of a pirate captain, engaging in naval battles and treasure hunts.", ru: "3D-экшен, в котором игрок берет на себя роль капитана пиратов, участвуя в морских сражениях и поисках сокровищ." }, image: "image/pirate.png", imageAlt: { en: "Pirate Shooter 3D Game screenshot", ru: "Скриншот 3D-игры Pirate Shooter" }, tags: ["C++", "Unreal Engine"], link: "https://github.com/lehovaa/Pirate-Shooter-3D-Game", linkLabel: { en: "Open Pirate Shooter 3D Game on GitHub", ru: "Открыть 3D-игру Pirate Shooter на GitHub" }, demoLink: null },
    { title: { en: "Resume AI Matcher", ru: "Подбор резюме с ИИ" }, description: { en: "An AI-driven resume matching system that compares resumes against job descriptions using NLP techniques. It analyzes skill relevance, formatting, and keyword alignment to generate actionable feedback.", ru: "Система подбора резюме на основе ИИ, которая сравнивает резюме с описаниями вакансий с помощью NLP. Она анализирует релевантность навыков, форматирование и совпадение ключевых слов, чтобы выдавать полезные рекомендации." }, image: "image/ai.png", imageAlt: { en: "Resume AI Matcher screenshot", ru: "Скриншот проекта по подбору резюме с ИИ" }, tags: ["Jupyter Notebook", "Python", "Pandas", "Scikit-learn"], link: "https://github.com/lehovaa/Resume_AI", linkLabel: { en: "Open Resume AI Matcher on GitHub", ru: "Открыть проект по подбору резюме с ИИ на GitHub" }, demoLink: null },
    { title: { en: "Celery Calculator", ru: "Калькулятор на Celery" }, description: { en: "A simple calculator application built with Celery for distributed task processing.", ru: "Простое приложение-калькулятор, построенное с использованием Celery для распределенной обработки задач." }, image: "image/image.png", imageAlt: { en: "Celery Calculator screenshot", ru: "Скриншот калькулятора на Celery" }, tags: ["Python", "Celery", "Flask"], link: "https://github.com/lehovaa/CeletyCalculator", linkLabel: { en: "Open Celery Calculator on GitHub", ru: "Открыть калькулятор на Celery на GitHub" }, demoLink: null },
    { title: { en: "Advanced Bank Management System", ru: "Продвинутая банковская система" }, description: { en: "A comprehensive banking solution that automates core banking operations. The project explores data handling, transaction flow, and a cleaner way to manage repeated financial tasks.", ru: "Комплексное банковское решение, автоматизирующее основные операции. Проект исследует обработку данных, поток транзакций и более удобный способ управления повторяющимися финансовыми задачами." }, image: "image/pic3.jpg", imageAlt: { en: "Advanced Bank Management System screenshot", ru: "Скриншот продвинутой банковской системы" }, tags: ["C++"], link: "https://github.com/AOOD-FinalProject/Advanced-Bank-Management-System", linkLabel: { en: "Open Advanced Bank Management System on GitHub", ru: "Открыть продвинутую банковскую систему на GitHub" }, demoLink: null },
    { title: { en: "Mobile App - Magic ToDo Ball", ru: "Мобильное приложение Magic ToDo Ball" }, description: { en: "A fun and interactive to-do list app that uses a Magic 8 Ball concept to randomly choose tasks. Developed in Android Studio with Java to make task selection more engaging and less overwhelming.", ru: "Веселое и интерактивное приложение со списком задач, которое использует концепцию Magic 8 Ball для случайного выбора дел. Создано в Android Studio на Java, чтобы сделать выбор задач более интересным и менее перегруженным." }, image: "image/pic2.jpg", imageAlt: { en: "Magic ToDo Ball screenshot", ru: "Скриншот Magic ToDo Ball" }, tags: ["Java", "HTML", "CSS"], link: "https://github.com/lehovaa/Magic_ToDo_Ball", linkLabel: { en: "Open Magic ToDo Ball on GitHub", ru: "Открыть Magic ToDo Ball на GitHub" }, demoLink: null },
    { title: { en: "Space Invaders Game", ru: "Игра Space Invaders" }, description: { en: "A 2D arcade-style Space Invaders game built with Java and JavaFX. Implements player movement, enemy patterns, collision detection, and real-time score updates.", ru: "2D-аркада Space Invaders, созданная на Java и JavaFX. Реализованы движение игрока, паттерны противников, обнаружение столкновений и обновление счета в реальном времени." }, image: "image/pic1.jpg", imageAlt: { en: "Space Invaders screenshot", ru: "Скриншот игры Space Invaders" }, tags: ["TypeScript", "UI", "Motion"], link: "https://github.com/lehovaa/SpaceInveders", linkLabel: { en: "Open Space Invaders Game on GitHub", ru: "Открыть игру Space Invaders на GitHub" }, demoLink: null },
];

const mobileProjectLimit = 3;
const mobileProjectsQuery = window.matchMedia("(max-width: 700px)");
let projectsExpanded = false;
let projectsControlsInitialized = false;

function createProjectAction({ href, label, ariaLabel, iconClass, variant = "demo", disabled = false }) {
    const action = href && !disabled ? document.createElement("a") : document.createElement("button");
    action.className = `project-link project-link--${variant}`;

    if (action.tagName === "A") {
        action.href = href;
        action.target = "_blank";
        action.rel = "noreferrer";
    } else {
        action.type = "button";
        action.disabled = disabled;
        action.setAttribute("aria-disabled", "true");
    }

    if (ariaLabel) {
        action.setAttribute("aria-label", ariaLabel);
    }

    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.textContent = label;
    action.append(icon, text);

    return action;
}

function createProjectCard(project) {
    const content = getContent();
    const card = document.createElement("article");
    card.className = "project-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "project-image";

    const image = document.createElement("img");
    image.src = project.image;
    image.alt = project.imageAlt[currentLanguage] || project.imageAlt.en;
    image.loading = "lazy";
    imageWrap.appendChild(image);

    const title = document.createElement("h4");
    title.textContent = project.title[currentLanguage] || project.title.en;

    const description = document.createElement("p");
    description.textContent = project.description[currentLanguage] || project.description.en;

    const languages = document.createElement("div");
    languages.className = "project-languages";
    project.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.textContent = tag;
        languages.appendChild(tagElement);
    });

    const actions = document.createElement("div");
    actions.className = "project-actions";

    actions.append(
        createProjectAction({
            href: project.link,
            label: content.projectActions.source,
            ariaLabel: project.linkLabel[currentLanguage] || project.linkLabel.en,
            iconClass: "bx bxl-github",
            variant: "code",
        })
    );

    if (project.demoLink) {
        actions.append(
            createProjectAction({
                href: project.demoLink,
                label: content.projectActions.demo,
                ariaLabel: currentLanguage === "ru" ? `Открыть демо для ${project.title[currentLanguage] || project.title.en}` : `Open ${project.title[currentLanguage] || project.title.en} live demo`,
                iconClass: "bx bx-link-external",
                variant: "demo",
            })
        );
    }

    card.append(imageWrap, title, description, languages, actions);
    return card;
}

function getVisibleProjects() {
    if (!mobileProjectsQuery.matches) {
        return projectData;
    }

    return projectsExpanded ? projectData : projectData.slice(0, mobileProjectLimit);
}

function syncProjectsToggle(toggleButton) {
    if (!toggleButton) {
        return;
    }

    const content = getContent();
    const shouldShowToggle = mobileProjectsQuery.matches && projectData.length > mobileProjectLimit;

    toggleButton.hidden = !shouldShowToggle;
    toggleButton.setAttribute("aria-expanded", String(projectsExpanded));
    toggleButton.textContent = shouldShowToggle ? (projectsExpanded ? content.projects.showLess : content.projects.showMore) : content.projects.showMore;
}

function renderProjects() {
    const projectsGrid = document.getElementById("projects-grid");
    const previousButton = document.getElementById("projects-prev");
    const nextButton = document.getElementById("projects-next");
    const toggleButton = document.getElementById("projects-toggle");

    if (!projectsGrid) {
        return;
    }

    projectsGrid.replaceChildren(...getVisibleProjects().map(createProjectCard));
    syncProjectsToggle(toggleButton);

    if (!projectsControlsInitialized) {
        const updateButtonState = () => {
            if (!previousButton || !nextButton) {
                return;
            }

            const atStart = projectsGrid.scrollLeft <= 8;
            const atEnd = projectsGrid.scrollLeft + projectsGrid.clientWidth >= projectsGrid.scrollWidth - 8;
            previousButton.disabled = atStart;
            nextButton.disabled = atEnd;
        };

        const scrollStep = () => Math.max(projectsGrid.clientWidth * 0.9, 320);

        if (previousButton && nextButton) {
            previousButton.addEventListener("click", () => projectsGrid.scrollBy({ left: -scrollStep(), behavior: "smooth" }));
            nextButton.addEventListener("click", () => projectsGrid.scrollBy({ left: scrollStep(), behavior: "smooth" }));
            projectsGrid.addEventListener("scroll", updateButtonState, { passive: true });
            window.addEventListener("resize", updateButtonState, { passive: true });
            updateButtonState();
        }

        if (toggleButton) {
            toggleButton.addEventListener("click", () => {
                projectsExpanded = !projectsExpanded;
                renderProjects();
            });
        }

        mobileProjectsQuery.addEventListener("change", () => {
            projectsExpanded = false;
            renderProjects();
        });

        projectsControlsInitialized = true;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderProjects);
} else {
    renderProjects();
}

let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll("header nav a");

window.onscroll = () => {
    sections.forEach(section => {
        const top = window.scrollY;
        const offset = section.offsetTop - window.innerHeight / 2;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove("active"));
            const activeLink = document.querySelector(`header nav a[href*="${id}"]`);
            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    });
};

document.querySelectorAll(".jump-i").forEach((el, index) => {
    el.style.animation = `jump 0.6s ease-out ${index * 0.2 + 1}s`;
});

document.addEventListener("DOMContentLoaded", () => {
    const aboutSection = document.getElementById("about-me");
    const footer = document.getElementById("contact");

    if (aboutSection) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    aboutSection.classList.add("visible");
                    observer.unobserve(aboutSection);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(aboutSection);
    }

    document.querySelectorAll(".content-box").forEach((box, index) => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.setTimeout(() => entry.target.classList.add("visible"), index * 150);
                } else {
                    entry.target.classList.remove("visible");
                }
            });
        }, { threshold: 0.1 });

        observer.observe(box);
    });

    if (footer) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    footer.classList.add("visible");
                } else {
                    footer.classList.remove("visible");
                }
            });
        }, { threshold: 0.5 });

        observer.observe(footer);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    if (languageToggle) {
        applyLanguage(currentLanguage, false);
        return;
    }

    startTypedTextAnimation(pageContent.en.hero.roles);
});

const experienceFilters = document.querySelectorAll(".experience-filter");
const experienceCards = document.querySelectorAll("#experience .content-box");

experienceFilters.forEach(filterButton => {
    filterButton.addEventListener("click", () => {
        const selectedFilter = filterButton.dataset.filter || "all";

        experienceFilters.forEach(button => {
            const isActive = button === filterButton;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });

        const filterGroup = filterButton.closest(".experience-filters");
        filterGroup?.setAttribute("data-active-filter", selectedFilter);

        experienceCards.forEach(card => {
            const isVisible = selectedFilter === "all" || card.dataset.category === selectedFilter;
            card.hidden = !isVisible;
        });
    });

    const researchFilters = document.querySelectorAll(".research-filter");
    const researchCards = document.querySelectorAll(".research-card");

    researchFilters.forEach(filterButton => {
        filterButton.addEventListener("click", () => {
            const selectedFilter = filterButton.dataset.filter || "all";

            researchFilters.forEach(button => {
                const isActive = button === filterButton;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            filterButton.closest(".research-filters")?.setAttribute("data-active-filter", selectedFilter);

            researchCards.forEach(card => {
                card.hidden = selectedFilter !== "all" && card.dataset.category !== selectedFilter;
            });
        });
    });
});

const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        if (!name || !email || !message) {
            alert(currentLanguage === "ru" ? "Пожалуйста, заполните все поля перед отправкой." : "Please fill out all fields before submitting.");
            return;
        }

        fetch("https://formspree.io/f/mzzbpgra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        })
            .then(response => {
                if (response.ok) {
                    alert(currentLanguage === "ru" ? `Спасибо, ${name}! Ваше сообщение отправлено.` : `Thank you, ${name}! Your message has been sent.`);
                    contactForm.reset();
                    return;
                }

                alert(currentLanguage === "ru" ? "При отправке возникла проблема." : "Oops! There was a problem with your submission.");
            })
            .catch(error => {
                console.error("Error:", error);
                alert(currentLanguage === "ru" ? "Произошла ошибка при отправке формы." : "There was an error submitting the form.");
            });
    });
}