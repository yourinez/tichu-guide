(() => {
  "use strict";

  const splash = document.querySelector(".splash-screen");

  if (!splash) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    splash.hidden = true;
    splash.setAttribute("aria-hidden", "true");
    return;
  }

  document.body.classList.add("splash-active");

  window.setTimeout(() => {
    splash.classList.add("is-leaving");

    window.setTimeout(() => {
      splash.hidden = true;
      splash.setAttribute("aria-hidden", "true");
      document.body.classList.remove("splash-active");
      window.ScrollTrigger?.refresh();
    }, 680);
  }, 1500);
})();

(() => {
  "use strict";

  const menuLinks = document.querySelectorAll(".chapter-menu__links a");
  const chapterMenu = document.querySelector(".chapter-menu");
  const stageBar = document.querySelector(".stage-tab-bar");
  const stageTabs = Array.from(document.querySelectorAll("[data-stage-target]"));
  let requestedStageTarget = null;

  const setActiveStage = (target) => {
    document.body.dataset.activeStage = target;
    stageTabs.forEach((tab) => {
      const isActive = tab.dataset.stageTarget === target;
      tab.classList.toggle("is-active", isActive);
      if (isActive) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
  };

  const isChapterMenuScreen = () => {
    if (!chapterMenu) {
      return false;
    }

    const menuRect = chapterMenu.getBoundingClientRect();
    const viewportCenter = window.innerHeight * 0.5;
    return menuRect.top <= viewportCenter && menuRect.bottom >= viewportCenter;
  };

  const applyStageBarState = () => {
    const visible = Boolean(requestedStageTarget) && !isChapterMenuScreen();
    stageBar?.classList.toggle("is-visible", visible);
    stageBar?.setAttribute("aria-hidden", String(!visible));
    document.body.classList.toggle("stage-tabs-visible", visible);
    stageTabs.forEach((tab) => {
      tab.tabIndex = visible ? 0 : -1;
    });
    if (visible && requestedStageTarget) {
      setActiveStage(requestedStageTarget);
    }
  };

  const setStageBarVisible = (visible, target = null) => {
    requestedStageTarget = visible ? target || requestedStageTarget : null;
    applyStageBarState();
  };

  const clearDetailScrollLock = () => {
    document.documentElement.classList.remove("detail-view-open");
    document.body.classList.remove("detail-view-open");
  };

  const setMenuScrollLock = (locked) => {
    document.documentElement.classList.toggle("menu-view-open", locked);
    document.body.classList.toggle("menu-view-open", locked);
  };

  window.tichuMenuView = {
    lock: () => {
      setMenuScrollLock(true);
      setStageBarVisible(false);
    },
    unlock: () => setMenuScrollLock(false)
  };

  window.tichuStageNav = {
    setActive: setActiveStage,
    show: (target) => setStageBarVisible(true, target),
    hide: () => setStageBarVisible(false)
  };

  const hasDetailHash = Boolean(window.location.hash && window.location.hash !== "#");

  if (hasDetailHash) {
    setMenuScrollLock(false);
    setStageBarVisible(false);
  } else {
    setMenuScrollLock(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setMenuScrollLock(true);
    setStageBarVisible(false);
  }
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      clearDetailScrollLock();
      setMenuScrollLock(false);
      setStageBarVisible(true, link.hash);
      if (link.hash === "#game-setup") {
        window.requestAnimationFrame(() => window.tichuPrepFlow?.goTo(0));
      }
    });
  });

  stageTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.stageTarget;
      const menuLink = Array.from(menuLinks).find((link) => link.hash === target);

      if (!menuLink) {
        return;
      }

      if (target === "#game-play" && window.tichuPrepFlow?.isActive()) {
        window.tichuPrepFlow.next();
        return;
      }

      clearDetailScrollLock();
      setActiveStage(target);
      menuLink.click();
    });
  });

  const updateStageFromScroll = () => {
    applyStageBarState();

    if (!stageBar?.classList.contains("is-visible")) {
      return;
    }

    const regularStages = ["#card-guide", "#game-setup", "#game-play", "#score-victory"];
    let current = null;

    regularStages.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.46) {
        current = selector;
      }
    });

    if (current) {
      setActiveStage(current);
    }
  };

  window.addEventListener("scroll", updateStageFromScroll, { passive: true });
  window.addEventListener("resize", updateStageFromScroll, { passive: true });

  if (chapterMenu && "IntersectionObserver" in window) {
    const menuObserver = new IntersectionObserver(
      () => applyStageBarState(),
      { threshold: [0, 0.5, 1] }
    );
    menuObserver.observe(chapterMenu);
  }

  if (hasDetailHash) {
    window.addEventListener(
      "load",
      () => {
        const targetLink = Array.from(menuLinks).find((link) => link.hash === window.location.hash);
        targetLink?.click();
      },
      { once: true }
    );
  }
})();

(() => {
  "use strict";

  const stepper = document.querySelector(".prep-stepper");
  const items = Array.from(document.querySelectorAll("[data-prep-step]"));
  const PREP_STEPS = Object.freeze([
    { key: "deal", selector: "#game-setup", transitionDuration: 0.5 },
    {
      key: "large-tichu",
      selector: "#prep-large-tichu",
      settleProgress: 0.96,
      transitionDuration: 0.5
    },
    {
      key: "receive-six",
      selector: "#prep-receive-six",
      transitionDuration: 0.5
    },
    {
      key: "exchange",
      selector: "#prep-exchange",
      transitionDuration: 0.5
    },
    {
      key: "small-tichu",
      selector: "#prep-small-tichu",
      settleProgress: 0.92,
      transitionDuration: 0.5
    }
  ]);
  const steps = PREP_STEPS.map((step) => ({
    ...step,
    element: document.querySelector(step.selector)
  }));
  const gameStage = document.querySelector("#game-play");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (
    !stepper ||
    items.length !== steps.length ||
    items.some((item, index) => item.dataset.prepTarget !== PREP_STEPS[index].selector) ||
    steps.some((step) => !step.element) ||
    !gameStage
  ) {
    return;
  }

  let currentIndex = 0;
  let active = false;
  let moving = false;
  let settleTimer = 0;
  let settleHandler = null;
  let scrollTween = null;
  let originalScrollBehavior = null;
  let ignoreInputUntil = 0;
  let wheelDelta = 0;
  let wheelGestureTriggered = false;
  let wheelGestureTimer = 0;
  let touchStartY = null;
  let syncFrame = 0;

  const renderStep = (nextIndex) => {
    currentIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
    items.forEach((item, index) => {
      const isCurrent = index === currentIndex;
      item.classList.toggle("is-current", isCurrent);
      item.classList.toggle("is-complete", index < currentIndex);
      if (isCurrent) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  };

  const announceStepArrival = (index) => {
    if (![1, 2, 4].includes(index)) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("tichu:prep-step", {
        detail: { index }
      })
    );
  };

  const syncVisibility = () => {
    const visible =
      active &&
      document.body.classList.contains("stage-tabs-visible") &&
      document.body.dataset.activeStage === "#game-setup";
    stepper.setAttribute("aria-hidden", String(!visible));
  };

  const scrollTriggerFor = (element) => {
    if (!window.ScrollTrigger) {
      return null;
    }
    return window.ScrollTrigger.getAll().find((trigger) => trigger.trigger === element) || null;
  };

  const scrollPositionFor = (index) => {
    const step = steps[index];
    const trigger = scrollTriggerFor(step.element);

    if (
      trigger &&
      Number.isFinite(trigger.start) &&
      Number.isFinite(trigger.end) &&
      Number.isFinite(step.settleProgress)
    ) {
      return trigger.start + (trigger.end - trigger.start) * step.settleProgress;
    }

    return Math.max(
      0,
      step.element.getBoundingClientRect().top + window.scrollY - (step.topOffset || 0)
    );
  };

  const unlockGateFor = (element) => {
    window.tichuProgressGates?.forEach((gate) => {
      if (
        gate.section === element ||
        gate.section?.contains(element) ||
        element.contains(gate.section)
      ) {
        gate.unlock();
      }
    });
  };

  const finishMovement = () => {
    window.clearTimeout(settleTimer);
    if (settleHandler) {
      window.removeEventListener("scrollend", settleHandler);
    }
    settleHandler = null;
    scrollTween = null;
    moving = false;
    ignoreInputUntil = performance.now() + 180;
    if (originalScrollBehavior !== null) {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      originalScrollBehavior = null;
    }
    window.ScrollTrigger?.update();
    syncVisibility();
  };

  const startMovement = (top, behavior, onSettled, duration = 0.68) => {
    window.clearTimeout(settleTimer);
    scrollTween?.kill();
    scrollTween = null;
    if (settleHandler) {
      window.removeEventListener("scrollend", settleHandler);
    }
    if (originalScrollBehavior === null) {
      originalScrollBehavior = document.documentElement.style.scrollBehavior;
    }
    document.documentElement.style.scrollBehavior = "auto";
    moving = true;
    settleHandler = () => {
      onSettled?.();
      finishMovement();
    };
    if (behavior === "smooth" && window.gsap) {
      const scrollState = { y: window.scrollY };
      scrollTween = window.gsap.to(scrollState, {
        y: top,
        duration,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => window.scrollTo(0, scrollState.y),
        onComplete: () => {
          window.scrollTo(0, top);
          settleHandler();
        }
      });
      settleTimer = window.setTimeout(settleHandler, duration * 1000 + 240);
      return;
    }

    window.addEventListener("scrollend", settleHandler, { once: true });
    window.scrollTo({ top, left: 0, behavior });
    settleTimer = window.setTimeout(settleHandler, behavior === "smooth" ? 1050 : 80);
  };

  const goTo = (nextIndex, behavior = reducedMotion ? "auto" : "smooth") => {
    const safeIndex = Math.max(0, Math.min(steps.length - 1, nextIndex));
    unlockGateFor(steps[currentIndex].element);
    active = true;
    if (document.body.dataset.activeStage !== "#game-setup") {
      window.tichuStageNav?.setActive("#game-setup");
    }
    renderStep(safeIndex);
    syncVisibility();
    startMovement(
      scrollPositionFor(safeIndex),
      behavior,
      () => {
        renderStep(safeIndex);
        announceStepArrival(safeIndex);
      },
      steps[safeIndex].transitionDuration || 0.68
    );
  };

  const goToGame = (behavior = reducedMotion ? "auto" : "smooth") => {
    unlockGateFor(steps[currentIndex].element);
    active = false;
    syncVisibility();
    startMovement(
      Math.max(0, gameStage.getBoundingClientRect().top + window.scrollY),
      behavior,
      () => window.tichuStageNav?.setActive("#game-play")
    );
  };

  const next = () => {
    if (currentIndex < steps.length - 1) {
      goTo(currentIndex + 1);
    } else {
      goToGame();
    }
  };

  const previous = () => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
      return true;
    }
    return false;
  };

  const syncFromViewport = () => {
    if (moving) {
      return;
    }

    const marker = window.innerHeight * 0.45;
    const insidePrep =
      steps[0].element.getBoundingClientRect().top <= marker &&
      gameStage.getBoundingClientRect().top > marker;

    active = insidePrep;
    if (!insidePrep) {
      syncVisibility();
      return;
    }

    if (document.body.dataset.activeStage !== "#game-setup") {
      window.tichuStageNav?.setActive("#game-setup");
    }
    const nearestIndex = steps.reduce(
      (nearest, step, index) =>
        Math.abs(window.scrollY - scrollPositionFor(index)) <
        Math.abs(window.scrollY - scrollPositionFor(nearest))
          ? index
          : nearest,
      0
    );
    renderStep(nearestIndex);
    syncVisibility();
  };

  const requestSync = () => {
    if (!syncFrame) {
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = 0;
        syncFromViewport();
      });
    }
  };

  const shouldHandleInput = () =>
    (active || moving) &&
    !document.documentElement.classList.contains("modal-open") &&
    document.body.classList.contains("stage-tabs-visible");

  const consumeInput = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onWheel = (event) => {
    if (!shouldHandleInput()) {
      wheelDelta = 0;
      return;
    }

    consumeInput(event);
    window.clearTimeout(wheelGestureTimer);
    wheelGestureTimer = window.setTimeout(() => {
      wheelGestureTriggered = false;
      wheelDelta = 0;
    }, 180);

    if (moving || performance.now() < ignoreInputUntil || wheelGestureTriggered) {
      return;
    }

    wheelDelta += event.deltaY;
    if (Math.abs(wheelDelta) < 18) {
      return;
    }

    const direction = Math.sign(wheelDelta);
    wheelDelta = 0;
    wheelGestureTriggered = true;
    if (direction > 0) {
      next();
    } else if (!previous()) {
      active = false;
      syncVisibility();
    }
  };

  const onTouchStart = (event) => {
    touchStartY = event.touches[0]?.clientY ?? null;
  };

  const onTouchMove = (event) => {
    if (!shouldHandleInput() || touchStartY === null) {
      return;
    }
    if (moving || performance.now() < ignoreInputUntil) {
      consumeInput(event);
      return;
    }

    const currentY = event.touches[0]?.clientY;
    if (currentY === undefined || Math.abs(touchStartY - currentY) < 44) {
      return;
    }

    const direction = Math.sign(touchStartY - currentY);
    touchStartY = null;
    consumeInput(event);
    if (direction > 0) {
      next();
    } else if (!previous()) {
      active = false;
      syncVisibility();
    }
  };

  const onKeyDown = (event) => {
    if (
      !shouldHandleInput() ||
      event.target instanceof Element && event.target.closest("button, a, input, select, textarea")
    ) {
      return;
    }
    if (event.repeat) {
      consumeInput(event);
      return;
    }
    if (["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey)) {
      consumeInput(event);
      if (!moving) next();
    } else if (["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey)) {
      if (currentIndex > 0) {
        consumeInput(event);
        if (!moving) previous();
      }
    }
  };

  const observer = new MutationObserver(() => {
    syncVisibility();
    requestSync();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "data-active-stage"]
  });

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync, { passive: true });
  window.addEventListener("load", requestSync, { once: true });

  if (window.ScrollTrigger) {
    window.ScrollTrigger.addEventListener("refresh", requestSync);
  }

  window.tichuPrepFlow = {
    steps: PREP_STEPS,
    goTo,
    next,
    previous,
    current: () => currentIndex,
    isActive: () => active
  };

  renderStep(0);
  syncVisibility();
  requestSync();
})();

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const teamLayout = document.querySelector(".hero__team-layout");
  const introPreviousButton = document.querySelector(".hero__scene-nav--previous");
  const introNextButton = document.querySelector(".hero__scene-nav--next");
  const introViewport = document.querySelector(".hero__intro-viewport");
  const introTrack = document.querySelector(".hero__intro-track");
  const introDots = document.querySelectorAll("[data-intro-slide]");
  const introMenuLink = document.querySelector('.chapter-menu__links a[href="#game-intro"]');
  let introSlideIndex = 0;
  let swipeStart = null;

  const setDetailScrollLock = (locked) => {
    document.documentElement.classList.toggle("detail-view-open", locked);
    document.body.classList.toggle("detail-view-open", locked);
  };

  const showIntroSlide = (nextIndex) => {
    const lastSlideIndex = Math.max(0, introDots.length - 1);
    introSlideIndex = Math.max(0, Math.min(lastSlideIndex, nextIndex));
    const isPastFirstSlide = introSlideIndex > 0;
    const isLastSlide = introSlideIndex === lastSlideIndex;
    teamLayout?.classList.toggle("is-showing-deck", isPastFirstSlide);
    teamLayout?.classList.toggle("is-last-slide", isLastSlide);
    if (introTrack) {
      introTrack.style.transform = `translate3d(-${introSlideIndex * 100}%, 0, 0)`;
    }
    if (introPreviousButton) {
      introPreviousButton.disabled = !isPastFirstSlide;
      introPreviousButton.tabIndex = isPastFirstSlide ? 0 : -1;
      introPreviousButton.setAttribute("aria-hidden", String(!isPastFirstSlide));
    }
    introDots.forEach((dot, index) => {
      const isCurrent = index === introSlideIndex;
      dot.classList.toggle("is-active", isCurrent);
      dot.setAttribute("aria-current", String(isCurrent));
    });
    if (introNextButton) {
      introNextButton.disabled = isLastSlide;
      introNextButton.tabIndex = isLastSlide ? -1 : 0;
      introNextButton.setAttribute("aria-hidden", String(isLastSlide));
    }
    const nextLabels = ["카드 한 벌 안내 보기", "승리 조건 보기", "게임 목표로 계속하기"];
    introNextButton?.setAttribute(
      "aria-label",
      nextLabels[introSlideIndex]
    );
  };

  showIntroSlide(0);

  introDots.forEach((dot) => {
    dot.addEventListener("click", () => showIntroSlide(Number(dot.dataset.introSlide)));
  });

  introViewport?.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) {
      return;
    }
    swipeStart = { x: event.clientX, y: event.clientY };
  });

  introViewport?.addEventListener("pointerup", (event) => {
    if (!swipeStart || !event.isPrimary) {
      swipeStart = null;
      return;
    }

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;

    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    showIntroSlide(introSlideIndex + (deltaX < 0 ? 1 : -1));
  });

  introViewport?.addEventListener("pointercancel", () => {
    swipeStart = null;
  });

  const enterStaticIntroDetail = () => {
    window.tichuMenuView?.unlock();
    showIntroSlide(0);
    const hero = document.querySelector("#game-intro");
    window.scrollTo({ top: hero?.offsetTop || 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => setDetailScrollLock(true));
    window.history.replaceState(null, "", "#game-intro");
  };

  if (reducedMotion.matches) {
    introMenuLink?.addEventListener("click", (event) => {
      event.preventDefault();
      enterStaticIntroDetail();
    });
    introPreviousButton?.addEventListener("click", () => showIntroSlide(introSlideIndex - 1));
    introNextButton?.addEventListener("click", () => {
      if (introSlideIndex < 2) {
        showIntroSlide(introSlideIndex + 1);
        return;
      }
    });
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.add("animation-unavailable");
    introMenuLink?.addEventListener("click", (event) => {
      event.preventDefault();
      enterStaticIntroDetail();
    });
    introPreviousButton?.addEventListener("click", () => showIntroSlide(introSlideIndex - 1));
    introNextButton?.addEventListener("click", () => {
      if (introSlideIndex < 2) {
        showIntroSlide(introSlideIndex + 1);
        return;
      }
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const shell = document.querySelector(".app-shell");
  const copy = document.querySelector(".hero__copy");
  const cards = document.querySelector(".cards");
  const cardsCount = document.querySelector(".cards__count");
  const playingCard = document.querySelector(".playing-card");
  const suitIntro = document.querySelector(".suit-intro");
  const cardSuits = gsap.utils.toArray(".cards__suit-box");
  const suitIntroLabel = document.querySelector(".suit-intro__label");
  const rankFace = document.querySelector(".rank-face");
  const rankFaceLabel = document.querySelector(".rank-face__label");
  const rankItems = gsap.utils.toArray(".rank-item");
  const rankRules = gsap.utils.toArray(".rank-rule");
  const rankReferenceLabels = gsap.utils.toArray(".rank-reference-label");
  const quickReferenceBar = document.querySelector(".quick-reference-bar");

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=520%",
      pin: ".hero__stage",
      pinSpacing: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!document.body.classList.contains("stage-tabs-visible")) {
          return;
        }
        if (document.querySelector("#game-setup")?.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          return;
        }
        window.tichuStageNav?.setActive(self.progress < 0.2 ? "#game-intro" : "#card-guide");
      }
    }
  });

  // 자동 스플래시 뒤에는 인원 안내부터 기존 스크롤 내러티브를 이어간다.
  timeline
    .to(
      teamLayout,
      {
        y: 0,
        opacity: 1,
        duration: 0.48,
        ease: "power2.out"
      },
      0.12
    )
    // 게임 소개가 사라진 뒤 일반 카드 구성과 숫자 서열을 소개한다.
    .to(
      copy,
      {
        y: () => -Math.max(window.innerHeight, 560) * 0.55,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      },
      1.05
    )
    .to(
      cards,
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      },
      1.65
    )
    .to(
      cardsCount,
      {
        y: 0,
        opacity: 1,
        duration: 0.36,
        ease: "power2.out"
      },
      1.77
    )
    .to(
      cardsCount,
      {
        y: () => -Math.max(window.innerHeight, 560) * 0.45,
        opacity: 0,
        duration: 0.46,
        ease: "power2.inOut"
      },
      2.55
    )
    .to(
      playingCard,
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.52,
        ease: "power2.out"
      },
      3.11
    )
    .to(
      quickReferenceBar,
      {
        autoAlpha: 1,
        duration: 0.35,
        ease: "power1.out"
      },
      3.11
    )
    .to(
      suitIntro,
      {
        y: 0,
        duration: 0.64,
        ease: "power2.out"
      },
      3.45
    )
    .to(
      cardSuits,
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out"
      },
      3.53
    )
    .to(
      suitIntroLabel,
      {
        y: 0,
        opacity: 1,
        duration: 0.34,
        ease: "power2.out"
      },
      3.99
    )
    .to(
      suitIntro,
      {
        y: () => -(playingCard.clientHeight * 0.32),
        duration: 0.58,
        ease: "power2.inOut"
      },
      4.57
    )
    .to(
      rankFace,
      {
        y: 0,
        duration: 0.58,
        ease: "power2.inOut"
      },
      4.57
    )
    .to(
      rankItems,
      {
        x: 0,
        y: 0,
        scale: 1,
        visibility: "visible",
        duration: 0.22,
        stagger: 0.04,
        ease: "power2.out"
      },
      5.13
    )
    .to(
      rankFaceLabel,
      {
        y: 0,
        opacity: 1,
        duration: 0.32,
        ease: "power2.out"
      },
      5.89
    )
    .to(
      rankRules,
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out"
      },
      6.27
    )
    .to(
      rankReferenceLabels,
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out"
      },
      6.77
    )
    .to(
      playingCard,
      {
        opacity: 1,
        duration: 0.8,
        ease: "none"
      },
      6.77
    );

  timeline
    .to(shell, { backgroundColor: "#26150f", duration: 0.8, ease: "none" }, 1.25);

  const scrollToHeroTime = (targetTime, behavior = "smooth") => {
    const trigger = timeline.scrollTrigger;

    if (!trigger || !Number.isFinite(targetTime)) {
      return;
    }

    const progress = targetTime / timeline.duration();
    const targetY = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({ top: targetY, left: 0, behavior });
    ScrollTrigger.update();
  };

  introPreviousButton?.addEventListener("click", () => showIntroSlide(introSlideIndex - 1));

  introNextButton?.addEventListener("click", () => {
    if (introSlideIndex < 2) {
      showIntroSlide(introSlideIndex + 1);
      return;
    }
  });

  document.querySelectorAll(".chapter-menu__links [data-hero-time]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetTime = Number(link.dataset.heroTime);

      if (!Number.isFinite(targetTime)) {
        return;
      }

      event.preventDefault();
      if (link.hash === "#game-intro") {
        showIntroSlide(0);
        scrollToHeroTime(targetTime, "auto");
        window.requestAnimationFrame(() => setDetailScrollLock(true));
      } else {
        setDetailScrollLock(false);
        scrollToHeroTime(targetTime);
      }
      window.history.replaceState(null, "", link.hash);
    });
  });

})();

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.tichuProgressGates = window.tichuProgressGates || [];

  window.createTichuProgressGate = (section) => {
    if (!section || reducedMotion) {
      return { unlock: () => {} };
    }

    const hint = section.querySelector(".progress-gate__hint");
    let unlocked = false;
    let sectionTop = 0;
    let boundary = 0;
    let touchStartY = null;
    let hintTimer = null;
    let correctingScroll = false;

    const updateBoundary = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      boundary = Math.max(sectionTop, sectionTop + rect.height - window.innerHeight);
    };

    const showHint = () => {
      if (!hint || unlocked) {
        return;
      }

      window.clearTimeout(hintTimer);
      hint.classList.add("is-visible");
      hint.removeAttribute("aria-hidden");
      hintTimer = window.setTimeout(() => {
        hint.classList.remove("is-visible");
        hint.setAttribute("aria-hidden", "true");
      }, 1500);
    };

    const isAtGate = () => window.scrollY >= boundary - 2;

    const onWheel = (event) => {
      if (!unlocked && event.deltaY > 0 && isAtGate()) {
        event.preventDefault();
        showHint();
      }
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event) => {
      const currentY = event.touches[0]?.clientY;

      if (
        !unlocked &&
        touchStartY !== null &&
        currentY !== undefined &&
        currentY < touchStartY &&
        isAtGate()
      ) {
        event.preventDefault();
        showHint();
      }
    };

    const onKeyDown = (event) => {
      if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea")) {
        return;
      }

      const downwardKeys = ["ArrowDown", "PageDown", "End"];
      const isDownward = downwardKeys.includes(event.key) || (event.key === " " && !event.shiftKey);

      if (!unlocked && isDownward && isAtGate()) {
        event.preventDefault();
        showHint();
      }
    };

    const onScroll = () => {
      if (unlocked || correctingScroll || window.scrollY <= boundary + 1) {
        return;
      }

      correctingScroll = true;
      window.scrollTo({ top: boundary, left: 0, behavior: "auto" });
      showHint();
      window.requestAnimationFrame(() => {
        correctingScroll = false;
      });
    };

    const removeListeners = () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateBoundary);
      window.removeEventListener("load", updateBoundary);

      if (window.ScrollTrigger) {
        window.ScrollTrigger.removeEventListener("refresh", updateBoundary);
      }
    };

    const unlock = () => {
      if (unlocked) {
        return;
      }

      unlocked = true;
      window.clearTimeout(hintTimer);
      hint?.classList.remove("is-visible");
      hint?.setAttribute("aria-hidden", "true");
      removeListeners();
    };

    updateBoundary();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateBoundary, { passive: true });
    window.addEventListener("load", updateBoundary, { once: true });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.addEventListener("refresh", updateBoundary);
    }

    window.requestAnimationFrame(updateBoundary);

    const controller = { section, unlock };
    window.tichuProgressGates.push(controller);
    return controller;
  };

  document.querySelectorAll(".chapter-menu__links [data-skip-gates]").forEach((link) => {
    link.addEventListener("click", () => {
      window.tichuProgressGates.forEach((gate) => gate.unlock());
    });
  });
})();

(() => {
  "use strict";

  const section = document.querySelector(".deal-section");

  if (!section) {
    return;
  }

  const table = section.querySelector(".deal-table");
  const layer = section.querySelector(".deal-flight-layer");
  const deck = section.querySelector(".deal-deck");
  const fans = Array.from(section.querySelectorAll(".deal-seat__fan"));
  const status = section.querySelector(".deal-status");
  const button = section.querySelector(".deal-button");
  const replayButton = section.querySelector(".deal-replay");
  const nextButton = section.querySelector(".deal-next");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progressGate = window.createTichuProgressGate?.(section);
  let dealTimeline = null;

  const goToNextStep = () => {
    progressGate?.unlock();
    if (window.tichuPrepFlow) {
      window.tichuPrepFlow.goTo(1, reducedMotion ? "auto" : "smooth");
      return;
    }
    document.querySelector("#prep-large-tichu")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
    window.requestAnimationFrame(() => window.ScrollTrigger?.update());
  };

  nextButton?.addEventListener("click", goToNextStep);

  const showStaticResult = () => {
    section.classList.add("is-complete");
    button.hidden = true;
    replayButton.hidden = false;
    status.removeAttribute("aria-hidden");
  };

  if (reducedMotion || !window.gsap) {
    button.addEventListener("click", showStaticResult);
    replayButton.addEventListener("click", showStaticResult);
    return;
  }

  const destinations = (round) => {
    const width = table.clientWidth;
    const height = table.clientHeight;
    const stackOffset = (round - 3.5) * 1.15;

    return [
      { x: stackOffset, y: height * -0.43, rotation: stackOffset * 0.7 },
      { x: width * 0.43, y: stackOffset, rotation: 90 + stackOffset * 0.7 },
      { x: stackOffset, y: height * 0.43, rotation: 180 + stackOffset * 0.7 },
      { x: width * -0.43, y: stackOffset, rotation: -90 + stackOffset * 0.7 }
    ];
  };

  const resetDeal = (showStartButton = true) => {
    if (dealTimeline) {
      dealTimeline.kill();
    }

    layer.replaceChildren();
    section.classList.remove("is-complete");
    status.setAttribute("aria-hidden", "true");
    button.hidden = !showStartButton;
    replayButton.hidden = true;
    gsap.set(button, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50 });
    gsap.set(replayButton, { opacity: 0, scale: 0.82, xPercent: -50 });
    gsap.set(deck, { opacity: 0, scale: 0.92, xPercent: -50, yPercent: -50 });
    gsap.set(fans, { opacity: 0, scale: 0.78 });
    gsap.set(status, { opacity: 0, xPercent: -50, yPercent: -50, y: 12 });
  };

  const playDeal = (isReplay = false) => {
    progressGate?.unlock();
    resetDeal(!isReplay);
    const dealtCards = [];
    dealTimeline = gsap.timeline({
      onStart: () => {
        button.disabled = true;
      }
    });

    if (!isReplay) {
      dealTimeline.to(button, {
        opacity: 0,
        scale: 0.94,
        duration: 0.16,
        ease: "power1.out",
        onComplete: () => {
          button.hidden = true;
        }
      });
    }

    dealTimeline.to(deck, { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" });

    const dealStart = dealTimeline.duration() + 0.06;

    for (let index = 0; index < 32; index += 1) {
      const card = document.createElement("img");
      const seatIndex = index % 4;
      const round = Math.floor(index / 4);
      const target = destinations(round)[seatIndex];

      card.className = "deal-card";
      card.src = "뒷면.png";
      card.alt = "";
      card.setAttribute("aria-hidden", "true");
      layer.append(card);
      dealtCards.push(card);

      gsap.set(card, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0 });
      const cardStart = dealStart + index * 0.065;
      dealTimeline
        .set(card, { opacity: 1 }, cardStart)
        .to(
          card,
          {
            x: target.x,
            y: target.y,
            rotation: target.rotation,
            scale: 0.9,
            duration: 0.23,
            ease: "power2.out"
          },
          cardStart
        );
    }

    const finishAt = dealStart + 31 * 0.065 + 0.32;
    dealTimeline
      .to(dealtCards, { opacity: 0, duration: 0.14, ease: "power1.out" }, finishAt)
      .to(deck, { opacity: 0, scale: 0.88, duration: 0.18, ease: "power1.out" }, finishAt)
      .to(
        fans,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.035,
          ease: "power2.out"
        },
        finishAt + 0.05
      )
      .to(
        status,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
          onStart: () => status.removeAttribute("aria-hidden")
        },
        finishAt + 0.18
      )
      .call(() => {
        section.classList.add("is-complete");
        button.disabled = false;
        replayButton.hidden = false;
        gsap.to(replayButton, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: "power2.out"
        });
      });
  };

  button.addEventListener("click", () => playDeal(false));
  replayButton.addEventListener("click", () => playDeal(true));
})();

(() => {
  "use strict";

  window.tichuGameState = window.tichuGameState || {};
  window.tichuGameState.largeTichuDeclared = Boolean(window.tichuGameState.largeTichuDeclared);

  const section = document.querySelector(".large-tichu");

  if (!section) {
    return;
  }

  const buttons = Array.from(section.querySelectorAll("[data-large-tichu-choice]"));
  const feedback = section.querySelector(".large-tichu__feedback");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introTimeline = null;
  const messages = {
    declare: "선언 완료! 반드시 내가 1등으로 비워야 해요\u00a0🔥",
    pass: "패스! 나중에 스몰 티츄 기회가 또 있어요"
  };

  if (reducedMotion || !window.gsap) {
    section.classList.add("is-static");
  } else {
    const title = section.querySelector(".large-tichu__title");
    const question = section.querySelector(".large-tichu__question");
    const deadline = section.querySelector(".large-tichu__deadline");
    const controls = section.querySelector(".large-tichu__controls");
    const entryY = () => Math.min(window.innerHeight * 0.18, 145);
    const controlsY = () => (window.innerHeight <= 720 ? 115 : 105);

    gsap.set([title, question], {
      xPercent: -50,
      yPercent: -50,
      y: entryY,
      autoAlpha: 0
    });
    gsap.set(deadline, {
      xPercent: -50,
      yPercent: -50,
      y: 26,
      autoAlpha: 0
    });
    gsap.set(controls, {
      xPercent: -50,
      yPercent: -50,
      y: 184,
      autoAlpha: 0,
      pointerEvents: "none"
    });

    introTimeline = gsap
      .timeline({ paused: true, defaults: { ease: "power2.inOut" } })
      .to(title, { y: 0, autoAlpha: 1, duration: 0.78, ease: "power2.inOut" }, 0)
      .to(title, { y: -180, scale: 0.68, duration: 0.76, ease: "power2.inOut" }, 0.92)
      .to(question, { y: -80, autoAlpha: 1, duration: 0.62, ease: "power2.inOut" }, 1.66)
      .to(deadline, { y: 2, autoAlpha: 1, duration: 0.62, ease: "power2.inOut" }, 2.24)
      .to(controls, { y: controlsY, autoAlpha: 1, duration: 0.62, ease: "power2.inOut" }, 2.24)
      .set(controls, { pointerEvents: "auto" }, 2.86)
      .to({}, { duration: 0.2 });
  }

  window.addEventListener("tichu:prep-step", (event) => {
    if (event.detail?.index === 1) {
      introTimeline?.restart();
    }
  });

  const selectChoice = (choice) => {
    const declared = choice === "declare";

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.largeTichuChoice === choice));
    });

    feedback.classList.remove("is-visible", "is-declare");
    feedback.textContent = messages[choice];
    feedback.classList.toggle("is-declare", choice === "declare");

    window.requestAnimationFrame(() => {
      feedback.classList.add("is-visible");
    });

    window.tichuGameState.largeTichuDeclared = declared;
    window.dispatchEvent(
      new CustomEvent("tichu:large-tichu-change", {
        detail: { declared }
      })
    );
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectChoice(button.dataset.largeTichuChoice));
  });
})();

(() => {
  "use strict";

  const section = document.querySelector(".exchange-section");

  if (!section) {
    return;
  }

  const receiveCards = Array.from(section.querySelectorAll(".exchange-receive__cards img"));
  const count = section.querySelector(".exchange-receive__count");
  const outgoingCards = Array.from(section.querySelectorAll("[data-exchange-target]"));
  const incomingCards = Array.from(section.querySelectorAll("[data-exchange-source]"));
  const button = section.querySelector(".exchange-button");
  const status = section.querySelector(".exchange-status");
  const replayButton = section.querySelector(".exchange-replay");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progressGate = window.createTichuProgressGate?.(section);
  let receiveTimeline = null;
  let exchangeTimeline = null;

  const showStaticExchange = () => {
    progressGate?.unlock();
    section.classList.add("is-complete");
    status.removeAttribute("aria-hidden");
    button.hidden = true;
    replayButton.hidden = false;
  };

  const resetStaticExchange = () => {
    section.classList.remove("is-complete");
    status.setAttribute("aria-hidden", "true");
    button.hidden = false;
    replayButton.hidden = true;
  };

  if (reducedMotion || !window.gsap) {
    button.addEventListener("click", showStaticExchange);
    replayButton.addEventListener("click", () => {
      resetStaticExchange();
      showStaticExchange();
    });
    return;
  }

  count.textContent = "8장";
  gsap.set(receiveCards, {
    xPercent: -50,
    x: (index) => (index - (receiveCards.length - 1) / 2) * 11,
    y: 18,
    scale: 0.94,
    rotation: (index) => (index - (receiveCards.length - 1) / 2) * 4.2,
    transformOrigin: "50% 92%",
    autoAlpha: 0
  });
  gsap.set(outgoingCards, {
    top: "82%",
    left: "50%",
    xPercent: -50,
    yPercent: -50,
    rotation: 0,
    autoAlpha: 0
  });

  gsap.set(count, { scale: 0.9, autoAlpha: 0 });
  receiveTimeline = gsap.timeline({ paused: true });
  receiveTimeline
    .fromTo(
      receiveCards,
      { y: 18, scale: 0.94, autoAlpha: 0 },
      {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.44,
        stagger: 0.035,
        ease: "power2.inOut"
      }
    )
    .call(() => {
      count.textContent = "14장";
    })
    .fromTo(
      count,
      { scale: 0.9, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.36,
        ease: "power2.out"
      }
    );

  window.addEventListener("tichu:prep-step", (event) => {
    if (event.detail?.index === 2) {
      count.textContent = "8장";
      gsap.set(count, { scale: 0.9, autoAlpha: 0 });
      receiveTimeline.restart();
    }
  });

  const targets = {
    left: { top: "50%", left: "14%", rotation: -90, opacity: 0.72 },
    top: { top: "20%", left: "50%", rotation: 0, opacity: 1 },
    right: { top: "50%", left: "86%", rotation: 90, opacity: 0.72 }
  };

  const receivedPositions = {
    left: { top: "80%", left: "46%", rotation: -7 },
    top: { top: "79%", left: "50%", rotation: 0 },
    right: { top: "80%", left: "54%", rotation: 7 }
  };

  incomingCards.forEach((card) => {
    const source = targets[card.dataset.exchangeSource];
    gsap.set(card, {
      top: source.top,
      left: source.left,
      xPercent: -50,
      yPercent: -50,
      rotation: source.rotation,
      autoAlpha: 0
    });
  });

  const resetExchange = () => {
    exchangeTimeline?.kill();
    section.classList.remove("is-complete");
    status.setAttribute("aria-hidden", "true");
    button.hidden = false;
    button.disabled = false;
    replayButton.hidden = true;
    gsap.set(button, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50 });
    gsap.set(replayButton, { opacity: 0, scale: 0.82, xPercent: -50, yPercent: 0 });
    gsap.set(outgoingCards, {
      top: "82%",
      left: "50%",
      xPercent: -50,
      yPercent: -50,
      rotation: 0,
      autoAlpha: 0
    });
    incomingCards.forEach((card) => {
      const source = targets[card.dataset.exchangeSource];
      gsap.set(card, {
        top: source.top,
        left: source.left,
        xPercent: -50,
        yPercent: -50,
        rotation: source.rotation,
        autoAlpha: 0
      });
    });
    gsap.set(status, { opacity: 0, xPercent: -50, yPercent: -50 });
  };

  const playExchange = () => {
    progressGate?.unlock();
    resetExchange();
    button.disabled = true;
    exchangeTimeline = gsap.timeline();

    exchangeTimeline.to(button, {
      opacity: 0,
      scale: 0.94,
      duration: 0.16,
      ease: "power1.out",
      onComplete: () => {
        button.hidden = true;
      }
    });

    outgoingCards.forEach((card, index) => {
      const target = targets[card.dataset.exchangeTarget];
      exchangeTimeline.to(
        card,
        {
          top: target.top,
          left: target.left,
          rotation: target.rotation,
          autoAlpha: target.opacity,
          duration: 0.34,
          ease: "power2.out"
        },
        0.18 + index * 0.24
      );
    });

    const receiveStart = 1.08;

    incomingCards.forEach((card, index) => {
      const destination = receivedPositions[card.dataset.exchangeSource];
      const cardStart = receiveStart + index * 0.2;

      exchangeTimeline
        .set(card, { autoAlpha: 1 }, cardStart)
        .to(
          card,
          {
            top: destination.top,
            left: destination.left,
            rotation: destination.rotation,
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2.inOut"
          },
          cardStart
        );
    });

    exchangeTimeline
      .to(
        status,
        {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
          onStart: () => status.removeAttribute("aria-hidden")
        },
        1.98
      )
      .call(() => {
        section.classList.add("is-complete");
        button.disabled = false;
        replayButton.hidden = false;
        gsap.to(replayButton, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: "power2.out"
        });
      });
  };

  button.addEventListener("click", playExchange);
  replayButton.addEventListener("click", playExchange);
})();

(() => {
  "use strict";

  const section = document.querySelector(".small-tichu");

  if (!section) {
    return;
  }

  const buttons = Array.from(section.querySelectorAll("[data-small-tichu-choice]"));
  const declareButton = section.querySelector('[data-small-tichu-choice="declare"]');
  const feedback = section.querySelector(".large-tichu__feedback");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introTimeline = null;
  const messages = {
    declare: "선언 완료! 내가 1등으로 비우면 +100\u00a0🔥",
    pass: "패스! 편하게 플레이해요"
  };

  if (reducedMotion || !window.gsap) {
    section.classList.add("is-static");
  } else {
    const title = section.querySelector(".large-tichu__title");
    const question = section.querySelector(".large-tichu__question");
    const deadline = section.querySelector(".large-tichu__deadline");
    const controls = section.querySelector(".large-tichu__controls");
    const entryY = () => Math.min(window.innerHeight * 0.18, 145);
    const controlsY = () => (window.innerHeight <= 720 ? 115 : 105);

    gsap.set([title, question], {
      xPercent: -50,
      yPercent: -50,
      y: entryY,
      autoAlpha: 0
    });
    gsap.set(deadline, {
      xPercent: -50,
      yPercent: -50,
      y: 26,
      autoAlpha: 0
    });
    gsap.set(controls, {
      xPercent: -50,
      yPercent: -50,
      y: 184,
      autoAlpha: 0,
      pointerEvents: "none"
    });

    introTimeline = gsap
      .timeline({ paused: true, defaults: { ease: "power2.inOut" } })
      .to(title, { y: 0, autoAlpha: 1, duration: 0.78, ease: "power2.inOut" }, 0)
      .to(title, { y: -180, scale: 0.68, duration: 0.76 }, 0.92)
      .to(question, { y: -80, autoAlpha: 1, duration: 0.62, ease: "power2.inOut" }, 1.66)
      .to(deadline, { y: 2, autoAlpha: 1, duration: 0.62, ease: "power2.inOut" }, 2.24)
      .to(controls, { y: controlsY, autoAlpha: 1, duration: 0.62, ease: "power2.inOut" }, 2.24)
      .set(controls, { pointerEvents: "auto" }, 2.86)
      .to({}, { duration: 0.2 });
  }

  window.addEventListener("tichu:prep-step", (event) => {
    if (event.detail?.index === 4) {
      introTimeline?.restart();
    }
  });

  const selectChoice = (choice) => {
    if (window.tichuGameState?.largeTichuDeclared) {
      return;
    }

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.smallTichuChoice === choice));
    });

    feedback.classList.remove("is-visible", "is-declare");

    feedback.textContent = messages[choice];
    feedback.classList.toggle("is-declare", choice === "declare");

    window.requestAnimationFrame(() => {
      feedback.classList.add("is-visible");
    });
  };

  const syncLargeTichuState = (declared) => {
    section.classList.toggle("is-large-declared", declared);
    declareButton.disabled = declared;

    if (declared) {
      buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
      feedback.classList.remove("is-declare");
      feedback.textContent = "이미 라지 티츄를 선언했어요. 스몰 티츄는 선택할 수 없어요.";
      feedback.classList.add("is-visible");
    } else if (feedback.textContent.startsWith("이미 라지 티츄를 선언했어요.")) {
      feedback.classList.remove("is-visible");
      feedback.textContent = "";
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => selectChoice(button.dataset.smallTichuChoice));
  });

  window.addEventListener("tichu:large-tichu-change", (event) => {
    syncLargeTichuState(Boolean(event.detail?.declared));
  });

  syncLargeTichuState(Boolean(window.tichuGameState?.largeTichuDeclared));
})();

(() => {
  "use strict";

  const section = document.querySelector(".special-cards");

  if (!section) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const carousel = section.querySelector(".special-carousel");
  const track = section.querySelector(".special-carousel__track");
  const slides = Array.from(section.querySelectorAll(".special-slide"));
  const descriptions = Array.from(section.querySelectorAll(".special-description"));
  const dots = Array.from(section.querySelectorAll(".special-dot"));
  const currentName = section.querySelector(".special-cards__current-name");
  const lastIndex = slides.length - 1;

  let currentIndex = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragX = 0;

  const slideOffset = (index) => slides[index].offsetLeft - slides[0].offsetLeft;

  const render = (nextIndex, immediate = false) => {
    currentIndex = Math.max(0, Math.min(lastIndex, nextIndex));
    section.classList.toggle("is-complete", currentIndex === lastIndex);
    if (currentName) {
      currentName.textContent = slides[currentIndex].dataset.cardName ?? "";
    }

    if (immediate || reducedMotion) {
      track.style.transitionDuration = "0s";
    } else {
      track.style.removeProperty("transition-duration");
    }

    track.style.transform = `translate3d(${-slideOffset(currentIndex)}px, 0, 0)`;

    slides.forEach((slide, index) => {
      const active = index === currentIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    descriptions.forEach((description, index) => {
      const active = index === currentIndex;
      description.classList.toggle("is-active", active);
      description.setAttribute("aria-hidden", String(!active));
    });

    dots.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-label", `${slides[index].dataset.cardName ?? "특수"} 카드 보기`);
      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const finishDrag = (event) => {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    const distance = event.clientX - startX;
    const verticalDistance = event.clientY - startY;
    const threshold = Math.min(58, carousel.clientWidth * 0.14);

    carousel.classList.remove("is-dragging");

    if (Math.abs(distance) > Math.abs(verticalDistance) && Math.abs(distance) >= threshold) {
      render(currentIndex + (distance < 0 ? 1 : -1));
    } else {
      render(currentIndex);
    }

    if (carousel.hasPointerCapture(pointerId)) {
      carousel.releasePointerCapture(pointerId);
    }

    pointerId = null;
  };

  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragX = -slideOffset(currentIndex);
    carousel.classList.add("is-dragging");
    carousel.setPointerCapture(pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) {
      return;
    }

    let distance = event.clientX - startX;
    if ((currentIndex === 0 && distance > 0) || (currentIndex === lastIndex && distance < 0)) {
      distance *= 0.28;
    }
    track.style.transform = `translate3d(${dragX + distance}px, 0, 0)`;
  });

  carousel.addEventListener("pointerup", finishDrag);
  carousel.addEventListener("pointercancel", (event) => {
    if (event.pointerId !== pointerId) {
      return;
    }
    carousel.classList.remove("is-dragging");
    pointerId = null;
    render(currentIndex);
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      render(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => render(index));
  });

  window.addEventListener("resize", () => render(currentIndex, true), { passive: true });

  section.addEventListener("carousel:refresh", () => render(currentIndex, true));

  render(0, true);
})();

(() => {
  "use strict";

  const cardSequence = document.querySelector(".play-card-sequence");
  const gameStart = document.querySelector(".game-start");

  if (
    cardSequence &&
    gameStart &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.gsap &&
    window.ScrollTrigger
  ) {
    gsap.registerPlugin(ScrollTrigger);

    const quickReferenceBar = document.querySelector(".quick-reference-bar");
    const backdrop = gameStart.querySelector(".game-start__backdrop");
    const bird = gameStart.querySelector(".game-start__bird");
    const holder = gameStart.querySelector(".game-start__holder");
    const launch = gameStart.querySelector(".game-start__launch");
    const details = gameStart.querySelector(".game-start__details");
    const direction = gameStart.querySelector(".game-start__direction");
    const [arrowLine, arrowHead] = direction.querySelectorAll("path");

    [arrowLine, arrowHead].forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}px`;
      path.style.strokeDashoffset = `${length}px`;
    });

    gsap.set(backdrop, { yPercent: 100 });
    gsap.set([bird, holder, launch, details], { y: 34, autoAlpha: 0 });
    const updateReferenceBarHeight = () => {
      gameStart.style.setProperty(
        "--quick-reference-bar-height",
        `${quickReferenceBar?.offsetHeight ?? 0}px`
      );
    };

    updateReferenceBarHeight();
    ScrollTrigger.addEventListener("refreshInit", updateReferenceBarHeight);

    gsap
      .timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: gameStart,
          start: "top top",
          end: "+=300%",
          pin: true,
          pinSpacing: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      })
      .to(backdrop, { yPercent: 0, duration: 0.9 }, 0)
      .to(bird, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.95)
      .to(holder, { y: 0, autoAlpha: 1, duration: 0.46, ease: "power2.out" }, 1.48)
      .to(launch, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 1.98)
      .to(details, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power2.out" }, 2.52)
      .to(arrowLine, { strokeDashoffset: 0, duration: 0.76, ease: "power1.inOut" }, 2.6)
      .to(arrowHead, { strokeDashoffset: 0, duration: 0.18, ease: "power1.out" }, 3.25)
      .to(
        gameStart.querySelector(".game-start__content"),
        {
          y: () => -Math.max(window.innerHeight, 560) * 0.16,
          opacity: 0,
          duration: 0.48
        },
        3.82
      )
      .to(
        backdrop,
        {
          opacity: 0,
          duration: 0.42
        },
        3.9
      )
      .fromTo(
        cardSequence.querySelector(".play-card-sequence__caption"),
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" },
        3.9
      )
      .fromTo(
        cardSequence.querySelector(".play-card-sequence__pile"),
        { y: 52, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.42, ease: "power2.out" },
        4.02
      );
  }

  if (cardSequence) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cardSequence.classList.add("is-visible");
    } else if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      const playSequence = () => {
        cardSequence.classList.remove("is-visible");
        void cardSequence.offsetWidth;
        cardSequence.classList.add("is-visible");
      };

      const resetSequence = () => {
        cardSequence.classList.remove("is-visible");
      };

      ScrollTrigger.create({
        trigger: cardSequence,
        start: "top 70%",
        end: "bottom 20%",
        onEnter: playSequence,
        onEnterBack: playSequence,
        onLeave: resetSequence,
        onLeaveBack: resetSequence
      });
    } else if ("IntersectionObserver" in window) {
      const sequenceObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              cardSequence.classList.remove("is-visible");
              void cardSequence.offsetWidth;
              cardSequence.classList.add("is-visible");
            } else {
              cardSequence.classList.remove("is-visible");
            }
          });
        },
        { threshold: 0.2 }
      );

      sequenceObserver.observe(cardSequence);
    } else {
      cardSequence.classList.add("is-visible");
    }
  }
})();

(() => {
  "use strict";

  const guide = document.querySelector(".combo-guide");

  if (!guide) {
    return;
  }

  const tabs = Array.from(guide.querySelectorAll("[data-combo]"));
  const panels = Array.from(guide.querySelectorAll("[data-panel]"));

  const selectCombo = (value, moveFocus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.combo === value;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) {
        tab.focus();
      }
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== value;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectCombo(tab.dataset.combo));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      selectCombo(tabs[nextIndex].dataset.combo, true);
    });
  });

  selectCombo("1");
})();

(() => {
  "use strict";

  const trickEnd = document.querySelector(".trick-end");

  if (!trickEnd) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    trickEnd.classList.add("is-visible");
    return;
  }

  const playCollection = () => {
    trickEnd.classList.remove("is-visible");
    void trickEnd.offsetWidth;
    trickEnd.classList.add("is-visible");
  };

  const resetCollection = () => {
    trickEnd.classList.remove("is-visible");
  };

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap
      .timeline({
        scrollTrigger: {
          trigger: trickEnd,
          start: "top 82%",
          end: "bottom 18%",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      })
      .fromTo(
        trickEnd.querySelector(".trick-end__inner"),
        { y: 38, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.22, ease: "none" },
        0
      )
      .to(
        trickEnd.querySelector(".trick-end__inner"),
        { y: -38, opacity: 0, duration: 0.22, ease: "none" },
        0.78
      );

    ScrollTrigger.create({
      trigger: trickEnd,
      start: "top 82%",
      end: "bottom 18%",
      onEnter: playCollection,
      onEnterBack: playCollection,
      onLeave: resetCollection,
      onLeaveBack: resetCollection
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playCollection();
          } else {
            resetCollection();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(trickEnd);
  } else {
    trickEnd.classList.add("is-visible");
  }
})();

(() => {
  "use strict";

  const bombGuide = document.querySelector(".bomb-guide");

  if (
    !bombGuide ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap
    .timeline({
      scrollTrigger: {
        trigger: bombGuide,
        start: "top 82%",
        end: "bottom 18%",
        scrub: 0.5,
        invalidateOnRefresh: true
      }
    })
    .fromTo(
      bombGuide.querySelector(".bomb-guide__inner"),
      { y: 38, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, ease: "none" },
      0
    )
    .to(
      bombGuide.querySelector(".bomb-guide__inner"),
      { y: -38, opacity: 0, duration: 0.22, ease: "none" },
      0.78
    );
})();

(() => {
  "use strict";

  const trickRepeat = document.querySelector(".trick-repeat");

  if (!trickRepeat) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    trickRepeat.classList.add("is-visible");
    return;
  }

  const playLoop = () => {
    trickRepeat.classList.remove("is-visible");
    void trickRepeat.offsetWidth;
    trickRepeat.classList.add("is-visible");
  };

  const resetLoop = () => trickRepeat.classList.remove("is-visible");

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap
      .timeline({
        scrollTrigger: {
          trigger: trickRepeat,
          start: "top 82%",
          end: "bottom 18%",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      })
      .fromTo(
        trickRepeat.querySelector(".trick-repeat__inner"),
        { y: 38, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.22, ease: "none" },
        0
      )
      .to(
        trickRepeat.querySelector(".trick-repeat__inner"),
        { y: -38, opacity: 0, duration: 0.22, ease: "none" },
        0.78
      );

    ScrollTrigger.create({
      trigger: trickRepeat,
      start: "top 82%",
      end: "bottom 18%",
      onEnter: playLoop,
      onEnterBack: playLoop,
      onLeave: resetLoop,
      onLeaveBack: resetLoop
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playLoop();
          } else {
            resetLoop();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(trickRepeat);
  } else {
    trickRepeat.classList.add("is-visible");
  }
})();

(() => {
  "use strict";

  const roundEnd = document.querySelector(".round-end");

  if (!roundEnd) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    roundEnd.classList.add("is-visible");
    return;
  }

  const playTransfers = () => {
    roundEnd.classList.remove("is-visible");
    void roundEnd.offsetWidth;
    roundEnd.classList.add("is-visible");
  };

  const resetTransfers = () => roundEnd.classList.remove("is-visible");

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap
      .timeline({
        scrollTrigger: {
          trigger: roundEnd,
          start: "top 82%",
          end: "bottom 18%",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      })
      .fromTo(
        roundEnd.querySelector(".round-end__inner"),
        { y: 38, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.22, ease: "none" },
        0
      )
      .to(
        roundEnd.querySelector(".round-end__inner"),
        { y: -38, opacity: 0, duration: 0.22, ease: "none" },
        0.78
      );

    ScrollTrigger.create({
      trigger: roundEnd,
      start: "top 82%",
      end: "bottom 18%",
      onEnter: playTransfers,
      onEnterBack: playTransfers,
      onLeave: resetTransfers,
      onLeaveBack: resetTransfers
    });
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playTransfers();
          } else {
            resetTransfers();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(roundEnd);
  } else {
    roundEnd.classList.add("is-visible");
  }
})();

(() => {
  "use strict";

  const finale = document.querySelector(".round-finale");

  if (!finale) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = () => finale.classList.add("is-visible");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    show();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show();
          observer.unobserve(finale);
        }
      });
    },
    { threshold: 0.28 }
  );

  observer.observe(finale);
})();

(() => {
  "use strict";

  const main = document.querySelector("main");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const referenceButtons = Array.from(
    document.querySelectorAll(".quick-reference-bar__button[data-open]")
  );
  let activeModal = null;
  let returnFocus = null;
  let lockedScrollY = 0;
  let closeTimer = null;

  const modalFor = (name) =>
    Array.from(document.querySelectorAll("[data-modal]")).find(
      (modal) => modal.dataset.modal === name
    ) || null;

  const setReferenceActive = (name = null) => {
    referenceButtons.forEach((button) => {
      const isActive = button.dataset.open === name;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-expanded", String(isActive));
    });
  };

  const lockPage = () => {
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    if (main) {
      main.inert = true;
    }
  };

  const unlockPage = () => {
    const restoreScrollY = lockedScrollY;
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    if (main) {
      main.inert = false;
    }

    if (Math.abs(window.scrollY - restoreScrollY) > 1) {
      window.scrollTo({ top: restoreScrollY, left: 0, behavior: "auto" });
    }

    window.requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - restoreScrollY) > 1) {
        window.scrollTo({ top: restoreScrollY, left: 0, behavior: "auto" });
      }
    });
  };

  const focusableElements = (modal) =>
    Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.closest('[aria-hidden="true"]'));

  const finishClose = (restoreFocus = true) => {
    if (!activeModal) {
      return;
    }

    const closedModal = activeModal;
    const focusTarget = returnFocus;
    activeModal = null;
    returnFocus = null;
    setReferenceActive();
    closedModal.hidden = true;
    unlockPage();

    if (focusTarget instanceof HTMLElement) {
      focusTarget.setAttribute("aria-expanded", "false");
    }

    if (restoreFocus && focusTarget instanceof HTMLElement && focusTarget.isConnected) {
      focusTarget.focus({ preventScroll: true });
    }
  };

  const closeModal = () => {
    if (!activeModal) {
      return;
    }

    window.clearTimeout(closeTimer);
    activeModal.classList.remove("is-open");
    closeTimer = window.setTimeout(
      () => finishClose(true),
      prefersReducedMotion.matches ? 0 : 320
    );
  };

  const openModal = (name, trigger = null) => {
    const modal = modalFor(name);

    if (!modal || modal === activeModal) {
      return;
    }

    if (activeModal) {
      window.clearTimeout(closeTimer);
      activeModal.classList.remove("is-open");
      finishClose(false);
    }

    activeModal = modal;
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    setReferenceActive(name);
    if (trigger instanceof HTMLElement) {
      trigger.setAttribute("aria-expanded", "true");
    }
    lockPage();
    modal.hidden = false;

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      modal.querySelector(".special-cards")?.dispatchEvent(new Event("carousel:refresh"));
      const focusTarget = modal.querySelector("[data-close-modal]") || modal.querySelector('[role="dialog"]');
      focusTarget?.focus({ preventScroll: true });
    });
  };

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open]");
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.open, opener);
      return;
    }

    const closer = event.target.closest("[data-close-modal]");
    if (closer && activeModal && closer.closest("[data-modal]") === activeModal) {
      event.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!activeModal) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = focusableElements(activeModal);
    if (!focusable.length) {
      event.preventDefault();
      activeModal.querySelector('[role="dialog"]')?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.openModal = openModal;
  window.closeModal = closeModal;
})();

(() => {
  "use strict";

  const button = document.querySelector(".floating-tip-button");
  const gameStart = document.querySelector(".game-start");

  if (!button || !gameStart) {
    return;
  }

  const setVisible = (visible) => {
    button.classList.toggle("is-visible", visible);
    button.setAttribute("aria-hidden", String(!visible));
    button.tabIndex = visible ? 0 : -1;
  };

  setVisible(false);

  if (window.ScrollTrigger) {
    window.gsap?.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.create({
      trigger: gameStart,
      start: "top 72%",
      onEnter: () => setVisible(true),
      onLeaveBack: () => setVisible(false),
      onRefresh: (self) => setVisible(self.scroll() >= self.start)
    });
    return;
  }

  const update = () => {
    setVisible(gameStart.getBoundingClientRect().top <= window.innerHeight * 0.72);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
