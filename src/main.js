/**
 * Portfolio runtime.
 *
 * Deliberately small and dependency-free: everything here is progressive
 * enhancement. If this file fails to load, the page still renders, reads,
 * and the contact form still submits (it falls back to a normal POST).
 */
(function () {
  "use strict";

  /** Read the build-time config the template embedded as JSON. */
  function readConfig() {
    var el = document.getElementById("site-config");
    if (!el) return {};
    try {
      return JSON.parse(el.textContent) || {};
    } catch (err) {
      return {};
    }
  }

  var CONFIG = readConfig();
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* Localised strings, supplied by the build in the site-config blob. Every
     call passes the English text as a fallback, so a stale cached page or a
     failed JSON parse degrades to English rather than to empty labels. */
  var STRINGS = CONFIG.strings || {};

  function s(key, fallback) {
    return STRINGS[key] || fallback;
  }

  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
    });
  }

  /* ---------------------------------------------------------------------
   * Theme toggle
   *
   * The <head> script has already applied the stored theme before first
   * paint. Here we only wire the button and keep it in sync with the OS
   * when the user hasn't made an explicit choice.
   * ------------------------------------------------------------------- */
  function initTheme() {
    var root = document.documentElement;
    var toggle = document.querySelector("[data-theme-toggle]");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    function effectiveTheme() {
      var explicit = root.getAttribute("data-theme");
      if (explicit === "dark" || explicit === "light") return explicit;
      return systemDark.matches ? "dark" : "light";
    }

    function syncLabel() {
      if (!toggle) return;
      // A whole string per target theme. "Switch to " + word only composes in
      // English — Mongolian puts the words in a different order.
      var label =
        effectiveTheme() === "dark"
          ? s("themeToLight", "Switch to light theme")
          : s("themeToDark", "Switch to dark theme");
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("title", label);
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = effectiveTheme() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem("theme", next);
        } catch (err) {
          /* private mode / storage blocked — the toggle still works for
             this page view, it just won't be remembered. */
        }
        syncLabel();
      });
    }

    // Follow the OS only while the user has no explicit preference stored.
    var onSystemChange = function () {
      var stored = null;
      try {
        stored = localStorage.getItem("theme");
      } catch (err) {}
      if (!stored) syncLabel();
    };

    if (systemDark.addEventListener) {
      systemDark.addEventListener("change", onSystemChange);
    } else if (systemDark.addListener) {
      systemDark.addListener(onSystemChange);
    }

    syncLabel();
  }

  /* ---------------------------------------------------------------------
   * Sticky header border + mobile menu
   * ------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    var menuBtn = document.querySelector("[data-menu-toggle]");
    var navList = document.querySelector("[data-nav-list]");

    if (header) {
      var onScroll = function () {
        header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (!menuBtn || !navList) return;

    function setMenu(open) {
      navList.setAttribute("data-open", open ? "true" : "false");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute(
        "aria-label",
        open ? s("closeMenu", "Close menu") : s("openMenu", "Open menu")
      );
    }

    menuBtn.addEventListener("click", function () {
      setMenu(navList.getAttribute("data-open") !== "true");
    });

    // Close after tapping a link, and on Escape.
    navList.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navList.getAttribute("data-open") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });

    // Reset when resizing back up to the desktop layout.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 736) setMenu(false);
    });

    setMenu(false);
  }

  /* ---------------------------------------------------------------------
   * Hero rotating word
   *
   * Skipped entirely under prefers-reduced-motion — the server-rendered
   * first word simply stays put.
   * ------------------------------------------------------------------- */
  function initRotator() {
    var el = document.querySelector("[data-rotator]");
    if (!el) return;

    var words = CONFIG.rotatingWords || [];
    if (words.length < 2 || prefersReducedMotion.matches) return;

    var index = 0;
    var charIndex = words[0].length;
    var deleting = false;
    var timer;

    function tick() {
      var word = words[index];

      // Paint BEFORE the completion check. Returning early to start the hold
      // without painting first would drop the final character, so the word
      // would never actually finish ("performance wor").
      if (!deleting) {
        // Clamp: charIndex starts at the server-rendered word's length, so
        // the very first increment can overshoot.
        charIndex = Math.min(charIndex + 1, word.length);
        el.textContent = word.slice(0, charIndex);

        if (charIndex >= word.length) {
          deleting = true;
          timer = setTimeout(tick, 2000); // hold the finished word
          return;
        }
      } else {
        charIndex = Math.max(charIndex - 1, 0);
        el.textContent = word.slice(0, charIndex);

        if (charIndex <= 0) {
          deleting = false;
          index = (index + 1) % words.length;
          timer = setTimeout(tick, 260); // pause before typing the next
          return;
        }
      }

      timer = setTimeout(tick, deleting ? 32 : 62);
    }

    // Don't animate in a background tab — it's wasted work and battery.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearTimeout(timer);
      } else {
        clearTimeout(timer);
        timer = setTimeout(tick, 600);
      }
    });

    timer = setTimeout(tick, 1600);
  }

  /* ---------------------------------------------------------------------
   * Scroll reveal
   * ------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    // No IntersectionObserver, or reduced motion: show everything at once.
    if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
      for (var i = 0; i < items.length; i++) {
        items[i].setAttribute("data-revealed", "true");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    items.forEach(function (item, i) {
      // Small stagger so groups of cards cascade rather than pop together.
      item.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms";
      observer.observe(item);
    });
  }

  /* ---------------------------------------------------------------------
   * Scrollspy — highlight the nav link for the section in view
   * ------------------------------------------------------------------- */
  function initScrollspy() {
    var sections = document.querySelectorAll("main section[id]");
    var links = document.querySelectorAll("[data-nav-list] a[href^='#']");
    if (!sections.length || !links.length || !("IntersectionObserver" in window))
      return;

    var byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });

    var visible = new Set();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        links.forEach(function (link) {
          link.removeAttribute("aria-current");
        });

        // Mark the topmost section currently on screen.
        for (var i = 0; i < sections.length; i++) {
          if (visible.has(sections[i].id)) {
            var link = byId[sections[i].id];
            if (link) link.setAttribute("aria-current", "true");
            break;
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------------------------------------------------------------------
   * Contact form
   *
   * Submits to Web3Forms via fetch so the visitor never leaves the page.
   * Without JS the same <form> posts normally to the same endpoint.
   * ------------------------------------------------------------------- */
  function initForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[type='submit']");
    var configured = CONFIG.formConfigured === true;

    function setStatus(state, message) {
      if (!status) return;
      status.setAttribute("data-state", state);
      status.textContent = message;
    }

    function setFieldError(field, message) {
      var wrapper = field.closest(".field");
      if (!wrapper) return;
      wrapper.setAttribute("data-invalid", message ? "true" : "false");
      var errorEl = wrapper.querySelector(".field-error");
      if (errorEl && message) errorEl.textContent = message;
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    /** Returns the first invalid field, or null when everything checks out. */
    function validate() {
      var firstBad = null;
      var fields = form.querySelectorAll("input[required], textarea[required]");

      fields.forEach(function (field) {
        var value = field.value.trim();
        var message = "";

        if (!value) {
          message = s("required", "This field is required.");
        } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          message = s("invalidEmail", "Enter a valid email address.");
        } else if (field.name === "message" && value.length < 10) {
          message = s("tooShort", "A little more detail, please (10 characters minimum).");
        }

        setFieldError(field, message);
        if (message && !firstBad) firstBad = field;
      });

      return firstBad;
    }

    // Clear a field's error as soon as the visitor starts fixing it.
    form.addEventListener("input", function (event) {
      var field = event.target;
      if (field.matches("input, textarea")) {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.getAttribute("data-invalid") === "true") {
          setFieldError(field, "");
        }
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstBad = validate();
      if (firstBad) {
        firstBad.focus();
        setStatus("error", s("fixFields", "Please fix the highlighted fields."));
        return;
      }

      // Honeypot: bots fill every field they find, humans can't see this one.
      var honeypot = form.querySelector("input[name='botcheck']");
      if (honeypot && honeypot.value) {
        setStatus("success", s("queued", "Thanks — your message is on its way."));
        form.reset();
        return;
      }

      if (!configured) {
        setStatus(
          "notice",
          s(
            "notConfigured",
            "This form isn't connected yet. Add your Web3Forms access key to content.js (contact.web3formsKey) and rebuild. In the meantime, email works fine."
          )
        );
        return;
      }

      if (submitBtn) submitBtn.setAttribute("data-loading", "true");
      setStatus("", "");

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.success) {
            setStatus(
              "success",
              s("sent", "Thanks — your message came through. I'll get back to you shortly.")
            );
            form.reset();
          } else {
            // result.data.message comes from Web3Forms and is always English;
            // keeping it in the parenthetical is still more useful than hiding it.
            var detail =
              (result.data && result.data.message) || s("rejected", "the request was rejected");
            setStatus(
              "error",
              fill(s("failed", "Something went wrong ({detail}). Please email me directly instead."), {
                detail: detail,
              })
            );
          }
        })
        .catch(function () {
          setStatus(
            "error",
            s(
              "offline",
              "Couldn't reach the mail service — check your connection, or email me directly."
            )
          );
        })
        .then(function () {
          if (submitBtn) submitBtn.removeAttribute("data-loading");
        });
    });
  }

  /* ---------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------- */
  function init() {
    // Tells the inline head-script watchdog that we are alive, so it leaves
    // the scroll-reveal CSS in place.
    window.__booted = true;

    initTheme();
    initHeader();
    initRotator();
    initReveal();
    initScrollspy();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
