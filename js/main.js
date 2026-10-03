const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzmqWFahalpMik16rK_S7bajXpmCnfzrrAA_Pim_LgdbHOnmW7U4FUR68Egfgk/exec";
const BUSINESS_FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxKj0pAQlqQKuaiqEYqF2wF7IdgML8XKOyvtrA9Uo7kK6GDXxQK0z9Lc0NORvyJ9xfI/exec";

(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-primary-nav]");

  function closeMenu() {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });
    nav.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
    document.addEventListener("click", function (event) {
      if (nav.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeMenu(); });
  }

  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-slide-dot]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let timer;
    let paused = false;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
        slide.setAttribute("aria-hidden", slideIndex === current ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
        dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
      });
    }
    function start() {
      if (reduceMotion || timer || slides.length < 2) return;
      timer = window.setInterval(function () { if (!paused) showSlide(current + 1); }, 6000);
    }
    function stop() { window.clearInterval(timer); timer = undefined; }
    dots.forEach(function (dot, index) { dot.addEventListener("click", function () { showSlide(index); }); });
    slider.addEventListener("mouseenter", function () { paused = true; stop(); });
    slider.addEventListener("mouseleave", function () { paused = false; start(); });
    slider.addEventListener("focusin", function () { paused = true; });
    slider.addEventListener("focusout", function () { paused = false; });
    showSlide(0);
    start();
  });

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  const serviceChips = Array.from(document.querySelectorAll("[data-service-chip]"));
  const serviceSections = serviceChips.map(function (chip) { return document.querySelector(chip.getAttribute("href")); }).filter(Boolean);
  if (serviceChips.length && "IntersectionObserver" in window) {
    const chipObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        serviceChips.forEach(function (chip) { chip.classList.toggle("is-active", chip.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    serviceSections.forEach(function (section) { chipObserver.observe(section); });
  }

  function whatsappUrl(service) {
    const text = "Hello FastEzy, I would like to know more about " + service + ".";
    return "https://wa.me/971585795434?text=" + encodeURIComponent(text);
  }
  document.querySelectorAll("[data-whatsapp-service]").forEach(function (link) { link.setAttribute("href", whatsappUrl(link.getAttribute("data-whatsapp-service"))); });

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const formEndpoint = document.body.dataset.page === "contact" ? FORM_ENDPOINT : BUSINESS_FORM_ENDPOINT;
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("button[type='submit']");
    const name = form.querySelector("[name='name']");
    const phone = form.querySelector("[name='phone']");
    const phoneNumber = form.querySelector("[name='phone-number']");
    const countryCode = form.querySelector("[name='country-code']");
    const email = form.querySelector("[name='email']");
    const business = form.querySelector("[name='business']");
    const timeline = form.querySelector("[name='timeline']");
    if (phoneNumber) {
      phoneNumber.addEventListener("input", function () { phoneNumber.value = phoneNumber.value.replace(/[^\d ]/g, ""); });
    }
    function setStatus(message, type) { status.innerHTML = message; status.className = "form-status is-" + type; }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      setStatus("", "idle");
      if (!name.value.trim()) { setStatus("Please enter your name.", "error"); name.focus(); return; }
      const enteredPhone = phoneNumber ? phoneNumber.value.trim() : phone.value.trim();
      const phoneIsValid = phoneNumber ? /^\d[\d ]{6,}$/.test(enteredPhone) : /^[+()\-\s\d]{7,}$/.test(enteredPhone);
      if (!phoneIsValid) { setStatus("Please enter a valid phone number.", "error"); (phoneNumber || phone).focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setStatus("Please enter a valid email address.", "error"); email.focus(); return; }
      if (business && !business.value.trim()) { setStatus("This field is required.", "error"); business.focus(); return; }
      if (timeline && !timeline.value) { setStatus("This field is required.", "error"); timeline.focus(); return; }
      if (phoneNumber) phone.value = countryCode.value + phoneNumber.value.replace(/\s/g, "");
      if (form.querySelector("[name='website']").value) return;
      submit.disabled = true;
      submit.innerHTML = '<span class="button-spinner" aria-hidden="true"></span>Sending...';
      if (!formEndpoint) {
        window.setTimeout(function () {
          setStatus("Something went wrong. Please try again or <a href=\"https://wa.me/971585795434\" target=\"_blank\" rel=\"noopener\">chat with us on WhatsApp</a>.", "error");
          submit.disabled = false;
          submit.innerHTML = 'Send <span aria-hidden="true">&rarr;</span>';
        }, 450);
        return;
      }
      fetch(formEndpoint, { method: "POST", body: new URLSearchParams(new FormData(form)), mode: "no-cors" })
        .then(function () {
          setStatus("Thank you. Our team will contact you shortly.", "success");
          form.reset();
        })
        .catch(function () { setStatus("Something went wrong. Please try again or <a href=\"https://wa.me/971585795434\" target=\"_blank\" rel=\"noopener\">chat with us on WhatsApp</a>.", "error"); })
        .finally(function () { submit.disabled = false; submit.innerHTML = 'Send <span aria-hidden="true">&rarr;</span>'; });
    });
  }
}());
