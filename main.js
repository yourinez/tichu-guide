(() => {
  "use strict";

  const isScrollableOverlayTarget = (target) =>
    target instanceof Element &&
    Boolean(
      target.closest(
        ".app-modal__dialog, .combo-guide.is-opened-from-game, .play-card-sequence"
      )
    );

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || isScrollableOverlayTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { passive: false, capture: true }
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      if (isScrollableOverlayTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { passive: false, capture: true }
  );
  window.addEventListener(
    "keydown",
    (event) => {
      const verticalKey =
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key) ||
        event.key === " ";
      const isEditable =
        event.target instanceof Element &&
        event.target.closest("button, a, input, select, textarea, [contenteditable='true']");
      if (!verticalKey || isEditable || isScrollableOverlayTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true }
  );
})();

document.querySelector("[data-receive-six-next]")?.addEventListener("click", () => {
  window.tichuPrepFlow?.jumpToPage?.(3);
  window.requestAnimationFrame(() => {
    document.querySelector("#prep-exchange h3")?.focus({ preventScroll: true });
  });
});

(() => {
  const guide = document.querySelector("#card-guide.card-deck-guide");
  if (!guide) return;

  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const rankLightnessSteps = [98, 95, 91, 87, 82, 76, 69, 62, 54, 47, 41, 35, 30];
  const tracks = Array.from(guide.querySelectorAll(".card-rank-row__track"));
  const nextButton = guide.querySelector("[data-card-guide-next]");
  const referenceIntro = document.querySelector("#card-reference-intro");
  const referenceIntroTitle = referenceIntro?.querySelector("h2");
  const referenceIntroNext = referenceIntro?.querySelector("[data-reference-intro-next]");

  tracks.forEach((track) => {
    const fragment = document.createDocumentFragment();
    ranks.forEach((rank, index) => {
      const card = document.createElement("li");
      card.className = "card-rank-row__card";
      card.style.setProperty("--rank", String(index + 1));
      const progress = index / (ranks.length - 1);
      const lightness = rankLightnessSteps[index];
      const usesLightText = lightness <= 69;
      const fontSize = 9.5 + progress * 6.5;
      card.style.setProperty("--rank-lightness", `${lightness}%`);
      card.style.setProperty("--rank-border-lightness", `${Math.max(lightness - 12, 20)}%`);
      card.style.setProperty("--rank-text-color", usesLightText ? "#ffffff" : "#211f1f");
      card.style.setProperty(
        "--rank-text-shadow",
        usesLightText ? "0 1px 2px rgb(0 0 0 / 0.34)" : "0 1px 1px rgb(255 255 255 / 0.72)"
      );
      card.style.setProperty("--rank-font-size", `${fontSize.toFixed(2)}px`);
      card.textContent = rank;
      fragment.append(card);
    });
    track.append(fragment);
  });

  const cards = Array.from(guide.querySelectorAll(".card-rank-row__card"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rankTimeline = null;

  const showFinalState = () => {
    if (window.gsap) {
      window.gsap.set(cards, { x: 0, autoAlpha: 1 });
    } else {
      cards.forEach((card) => {
        card.style.opacity = "1";
      });
    }
  };

  const reset = () => {
    rankTimeline?.kill();
    rankTimeline = null;
    if (!window.gsap || reducedMotion) {
      showFinalState();
      return;
    }
    window.gsap.set(cards, { x: 34, autoAlpha: 0 });
  };

  const play = () => {
    if (!window.gsap || reducedMotion) {
      showFinalState();
      return;
    }

    reset();
    rankTimeline = window.gsap.timeline({ defaults: { ease: "power2.out" } });
    tracks.forEach((track, rowIndex) => {
      const rowCards = Array.from(track.children);
      rankTimeline.fromTo(
        rowCards,
        { x: 34, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.42,
          stagger: 0.075,
          immediateRender: false
        },
        rowIndex * 0.08
      );
    });
  };

  const sync = () => {
    const isActive = document.body.dataset.activeStage === "#card-guide";
    if (isActive && !rankTimeline) play();
    if (!isActive && rankTimeline) reset();
  };

  reset();
  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-active-stage"]
  });
  nextButton?.addEventListener("click", () => {
    window.tichuStageNav?.goTo?.("#card-reference-intro");
    window.requestAnimationFrame(() => referenceIntroTitle?.focus({ preventScroll: true }));
  });
  referenceIntroNext?.addEventListener("click", () => {
    window.tichuStageNav?.goTo?.("#game-setup");
    window.requestAnimationFrame(() => {
      document.querySelector("#deal-title")?.focus?.({ preventScroll: true });
    });
  });
  sync();
})();

(() => {
  "use strict";

  const intro = document.querySelector("#card-reference-intro");
  const bar = document.querySelector(".quick-reference-bar");
  const barInner = bar?.querySelector(".quick-reference-bar__inner");
  const content = intro?.querySelector(".card-reference-intro__content");
  const barHint = intro?.querySelector(".card-reference-intro__bar-hint");
  if (!intro || !barInner || !content || !barHint) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let introTimeline = null;

  const reset = () => {
    introTimeline?.kill();
    introTimeline = null;
    intro.classList.remove("is-revealed");
    window.gsap?.set(barInner, { clearProps: "transform" });
    window.gsap?.set(content, { clearProps: "opacity,visibility,transform" });
    window.gsap?.set(barHint, { clearProps: "opacity,visibility,transform" });
  };

  const play = () => {
    reset();
    if (reducedMotion.matches || !window.gsap) {
      intro.classList.add("is-revealed");
      return;
    }

    const rect = barInner.getBoundingClientRect();
    const centerOffset = Math.max(0, (window.innerHeight - rect.height) / 2 - rect.top);
    introTimeline = window.gsap.timeline();
    introTimeline
      .fromTo(
        barInner,
        { y: centerOffset },
        { y: 0, duration: 0.72, ease: "power3.inOut" }
      )
      .fromTo(
        barHint,
        { autoAlpha: 0, y: -5 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }
      )
      .fromTo(
        content,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out" },
        "-=0.12"
      )
      .add(() => {
        intro.classList.add("is-revealed");
      });
  };

  const sync = () => {
    if (document.body.dataset.activeStage === "#card-reference-intro") play();
    else reset();
  };

  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-active-stage"]
  });
  reducedMotion.addEventListener?.("change", sync);
  sync();
})();

(() => {
  "use strict";

  const steps = [
    document.querySelector("#game-setup"),
    document.querySelector("#prep-large-tichu"),
    document.querySelector("#prep-receive-six"),
    document.querySelector("#prep-exchange"),
    document.querySelector("#prep-small-tichu")
  ];
  const exchangeSection = document.querySelector(".exchange-section");
  if (steps.some((step) => !step) || !exchangeSection) return;

  const syncPrepViewport = (index) => {
    if (!Number.isInteger(index) || index < 0 || index >= steps.length) return;
    document.body.dataset.prepPage = String(index);
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-prep-current", stepIndex === index);
    });
    exchangeSection.classList.toggle("is-prep-current", [2, 3].includes(index));
  };
  window.tichuSyncPrepViewport = syncPrepViewport;

  window.addEventListener("tichu:prep-step", (event) => {
    syncPrepViewport(Number(event.detail?.index));
  });

  document.querySelectorAll("[data-prep-step] button").forEach((button, index) => {
    button.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        window.tichuPrepFlow?.jumpToPage?.(index);
        syncPrepViewport(index);
      });
    });
  });
})();

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
    document.documentElement.classList.remove("menu-view-open");
    document.body.classList.remove("menu-view-open", "splash-active");
    return;
  }

  document.body.classList.add("splash-active");

  window.setTimeout(() => {
    splash.classList.add("is-leaving");

    window.setTimeout(() => {
      splash.hidden = true;
      splash.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("menu-view-open");
      document.body.classList.remove("menu-view-open", "splash-active");
      window.tichuMenuView?.unlock();
      window.ScrollTrigger?.refresh();
      window.requestAnimationFrame(() => {
        if (!window.location.hash || window.location.hash === "#game-intro") {
          window.tichuStageNav?.goTo?.("#game-intro");
        }
      });
    }, 680);
  }, 1000);
})();

(() => {
  "use strict";

  const menuLinks = document.querySelectorAll(".chapter-menu__links a");
  const chapterMenu = document.querySelector(".chapter-menu");
  const stageBar = document.querySelector(".stage-tab-bar");
  const quickReferenceBar = document.querySelector(".quick-reference-bar");
  const stageTabs = Array.from(document.querySelectorAll("[data-stage-target]"));
  const stageGroups = new Map([
    ["#game-intro", [document.querySelector(".hero")]],
    ["#card-guide", [document.querySelector(".hero")]],
    ["#card-reference-intro", [document.querySelector("#card-reference-intro")]],
    [
      "#game-setup",
      [
        document.querySelector("#game-setup"),
        document.querySelector("#prep-large-tichu"),
        document.querySelector("#prep-receive-six")?.closest(".exchange-section"),
        document.querySelector("#prep-small-tichu")
      ]
    ],
    ["#game-play", [document.querySelector(".gameplay-carousel")]],
    ["#score-victory", [document.querySelector("#score-victory")]]
  ]);
  const stageContainers = Array.from(
    new Set(Array.from(stageGroups.values()).flat().filter(Boolean))
  );
  const introView = document.querySelector(".hero__team-layout");
  const cardView = document.querySelector("#card-guide");
  let requestedStageTarget = null;
  let chapterMenuOnScreen = false;

  const syncStageIsolation = (target = null) => {
    const activeContainers = new Set(stageGroups.get(target) || []);
    const isolated = activeContainers.size > 0;

    // 상단 바(참조/일반) 모달이 열려 페이지 잠금이 걸린 동안에는 lockPage()가
    // <main> 하위 요소의 inert/aria-hidden을 전적으로 소유한다. 이때 스크롤·리사이즈로
    // 발동하는 stage isolation이 같은 속성을 덮어쓰면 모달 뒤 영역이 살아나거나(상호작용 누수),
    // 잠금 해제 시 복원되는 스냅샷이 어긋나 빈 화면이 된다. 따라서 잠금 중에는 시각용 클래스만
    // 갱신하고 inert/aria-hidden 기록은 건드리지 않는다. 올바른 값은 unlockPage()가
    // 잠금 해제 직후 이 함수를 다시 호출해 복원한다.
    const pageLocked = document.documentElement.classList.contains("modal-open");

    document.body.classList.toggle("stage-isolated", isolated);
    stageContainers.forEach((container) => {
      const inactive = isolated && !activeContainers.has(container);
      container.classList.toggle("is-stage-inactive", inactive);
      if (pageLocked) return;
      container.inert = inactive;
      if (inactive) {
        container.setAttribute("aria-hidden", "true");
      } else {
        container.removeAttribute("aria-hidden");
      }
    });

    [
      [introView, target !== "#game-intro"],
      [cardView, target !== "#card-guide"]
    ].forEach(([view, inactiveForTarget]) => {
      if (!view) return;
      const inactive = isolated && inactiveForTarget;
      view.classList.toggle("is-stage-subview-inactive", inactive);
      if (pageLocked) return;
      view.inert = inactive;
      if (inactive) view.setAttribute("aria-hidden", "true");
      else view.removeAttribute("aria-hidden");
    });
  };

  const setActiveStage = (target) => {
    const referencesAvailable = !["#game-intro", "#card-guide"].includes(target);
    document.body.dataset.activeStage = target;
    document.body.classList.toggle("quick-reference-visible", referencesAvailable);
    if (quickReferenceBar) {
      if (!referencesAvailable && quickReferenceBar.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      quickReferenceBar.inert = !referencesAvailable;
      quickReferenceBar.setAttribute("aria-hidden", String(!referencesAvailable));
    }
    syncStageIsolation(target);
    stageTabs.forEach((tab) => {
      const tabTarget = target === "#card-reference-intro" ? "#card-guide" : target;
      const isActive = tab.dataset.stageTarget === tabTarget;
      tab.classList.toggle("is-active", isActive);
      if (isActive) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
  };

  const applyStageBarState = () => {
    // 상세 단계에 들어간 뒤에는 스크롤 위치로 상태를 추측하지 않는다.
    // 목차 복귀는 hide()/menu lock처럼 명시적인 동작에서만 처리한다.
    const menuIsActive =
      document.body.classList.contains("menu-view-open") || chapterMenuOnScreen;
    const visible = Boolean(requestedStageTarget) && !menuIsActive;
    if (!visible && stageBar?.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    stageBar?.classList.toggle("is-visible", visible);
    stageBar?.setAttribute("aria-hidden", String(!visible));
    document.body.classList.toggle("stage-tabs-visible", visible);
    stageTabs.forEach((tab) => {
      tab.tabIndex = visible ? 0 : -1;
    });
    if (visible && requestedStageTarget) {
      setActiveStage(requestedStageTarget);
    } else {
      syncStageIsolation();
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
    if (!locked) {
      chapterMenuOnScreen = false;
      document.body.classList.remove("chapter-menu-visible");
    }
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
  const initialStage = stageGroups.has(window.location.hash) ? window.location.hash : "#game-intro";

  setMenuScrollLock(false);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  setStageBarVisible(true, initialStage);
  menuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!link.hasAttribute("data-hero-time")) {
        event.preventDefault();
        window.history.replaceState(null, "", link.hash);
        window.tichuStageNav?.goTo?.(link.hash);
        if (link.hash === "#game-setup") {
          window.requestAnimationFrame(() => {
            window.ScrollTrigger?.refresh();
            window.requestAnimationFrame(() => window.tichuPrepFlow?.jumpToPage(0));
          });
        }
        return;
      }

      clearDetailScrollLock();
      setMenuScrollLock(false);
      setStageBarVisible(true, link.hash);
    });
  });

  stageTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.stageTarget;
      window.tichuStageNav?.goTo?.(target);
    });
  });

  const updateStageFromScroll = () => {
    if (requestedStageTarget) {
      chapterMenuOnScreen = false;
      document.body.classList.remove("chapter-menu-visible");
    } else if (chapterMenu) {
      const rect = chapterMenu.getBoundingClientRect();
      const nextMenuState = rect.top < window.innerHeight * 0.35 &&
        rect.bottom > window.innerHeight * 0.65;
      if (nextMenuState !== chapterMenuOnScreen) {
        chapterMenuOnScreen = nextMenuState;
        document.body.classList.toggle("chapter-menu-visible", chapterMenuOnScreen);
      }
    }
    applyStageBarState();
  };

  window.tichuStageNav.update = updateStageFromScroll;
  window.addEventListener("scroll", updateStageFromScroll, { passive: true });
  window.addEventListener("resize", updateStageFromScroll, { passive: true });
  updateStageFromScroll();

  window.requestAnimationFrame(() => {
    window.tichuStageNav?.goTo?.(initialStage);
    if (!hasDetailHash) {
      window.history.replaceState(null, "", "#game-intro");
    }
  });
})();

const legacyPrepFlow = () => {
  "use strict";

  const stepper = document.querySelector(".prep-stepper");
  const items = Array.from(document.querySelectorAll("[data-prep-step]"));
  const PREP_STEPS = Object.freeze([
    { key: "deal", selector: "#game-setup" },
    { key: "large-tichu", selector: "#prep-large-tichu" },
    { key: "receive-six", selector: "#prep-receive-six" },
    { key: "exchange", selector: "#prep-exchange" },
    { key: "small-tichu", selector: "#prep-small-tichu" }
  ]);
  const pages = PREP_STEPS.map((page) => ({
    ...page,
    element: document.querySelector(page.selector)
  }));
  const gameStage = document.querySelector("#game-play");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (
    !stepper ||
    items.length !== pages.length ||
    items.some((item, index) => item.dataset.prepTarget !== PREP_STEPS[index].selector) ||
    pages.some((page) => !page.element) ||
    !gameStage
  ) {
    return;
  }

  let currentIndex = null;
  let isTransitioning = false;
  let viewportChangedDuringTransition = false;
  let viewportRefreshCompleted = false;
  let waitingForViewportRefresh = false;
  let pendingTransitionFinalize = null;
  let scrollTween = null;
  let originalScrollBehavior = "";
  let wheelDelta = 0;
  let wheelGestureTimer = 0;
  let wheelGestureConsumed = false;
  let touchStartY = null;
  let touchGestureConsumed = false;
  let syncFrame = 0;

  const renderStep = () => {
    items.forEach((item, index) => {
      const isCurrent = index === currentIndex;
      item.classList.toggle("is-current", isCurrent);
      item.classList.toggle("is-complete", currentIndex !== null && index < currentIndex);
      if (isCurrent) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  };

  const announcePageArrival = (index) => {
    if (![1, 2, 4, 5].includes(index)) {
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
      currentIndex !== null &&
      currentIndex < pages.length &&
      document.body.classList.contains("stage-tabs-visible") &&
      document.body.dataset.activeStage === "#game-setup";
    stepper.setAttribute("aria-hidden", String(!visible));
  };

  const isPrepInView = () =>
    pages[0].element.getBoundingClientRect().top < window.innerHeight * 0.55 &&
    gameStage.getBoundingClientRect().top > window.innerHeight * 0.55;

  const pagePosition = (index) => {
    let top = 0;
    let element = pages[index].element.closest(".pin-spacer") || pages[index].element;
    while (element && element !== document.body && element !== document.documentElement) {
      top += element.offsetTop;
      element = element.offsetParent;
    }
    return Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  };

  const gamePosition = () => {
    const gameStartTrigger = window.ScrollTrigger?.getAll().find(
      (trigger) => trigger.pin && trigger.trigger === gameStage
    );
    if (gameStartTrigger) {
      return Math.max(
        0,
        Math.min(gameStartTrigger.start, document.documentElement.scrollHeight - window.innerHeight)
      );
    }

    const rect = gameStage.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(rect.top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight)
    );
  };

  const unlockGateFor = (index) => {
    const element = pages[index]?.element;
    if (!element) {
      return;
    }
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

  const goToPage = (index, { allowNonAdjacent = false, instant = false } = {}) => {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= pages.length ||
      (!allowNonAdjacent &&
        (currentIndex === null ? index !== 0 : Math.abs(index - currentIndex) !== 1)) ||
      isTransitioning
    ) {
      return false;
    }

    if (currentIndex === index && !instant) {
      return false;
    }

    unlockGateFor(currentIndex);
    isTransitioning = true;
    document.body.dataset.activeStage = "#game-setup";
    window.tichuStageNav?.setActive(document.body.dataset.activeStage);
    syncVisibility();

    const finalize = () => {
      document.scrollingElement.scrollTop = pagePosition(index);
      currentIndex = index;
      renderStep();
      syncVisibility();
      scrollTween = null;
      isTransitioning = false;
      pendingTransitionFinalize = null;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      announcePageArrival(index);
      window.ScrollTrigger?.update();
    };
    const finish = () => {
      if (viewportChangedDuringTransition && window.ScrollTrigger && !viewportRefreshCompleted) {
        waitingForViewportRefresh = true;
        pendingTransitionFinalize = finalize;
        return;
      }
      finalize();
    };

    originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    viewportChangedDuringTransition = false;
    viewportRefreshCompleted = false;
    waitingForViewportRefresh = false;
    pendingTransitionFinalize = null;
    const startTransition = () => {
      if (currentIndex === null) {
        window.ScrollTrigger?.refresh();
      }
      const targetY = pagePosition(index);
      if (!instant && !reducedMotion && window.gsap) {
        const scrollState = { y: window.scrollY };
        scrollTween = window.gsap.to(scrollState, {
          y: targetY,
          duration: 0.62,
          ease: "power3.inOut",
          overwrite: true,
          onUpdate: () => {
            document.scrollingElement.scrollTop = scrollState.y;
          },
          onComplete: finish
        });
      } else {
        document.scrollingElement.scrollTop = targetY;
        finish();
      }
    };
    const splash = document.querySelector(".splash-screen");
    if (currentIndex === null && splash && !splash.hidden) {
      const waitForSplash = () => {
        if (!splash.hidden) {
          window.requestAnimationFrame(waitForSplash);
          return;
        }
        startTransition();
      };
      window.requestAnimationFrame(waitForSplash);
    } else {
      startTransition();
    }

    return true;
  };

  const goToGame = ({ allowFromAnywhere = false, instant = false } = {}) => {
    if (
      isTransitioning ||
      (!allowFromAnywhere && currentIndex !== PREP_STEPS.length - 1)
    ) {
      return false;
    }

    unlockGateFor(currentIndex);
    isTransitioning = true;
    document.body.dataset.activeStage = "#game-play";
    window.tichuStageNav?.setActive("#game-play");
    syncVisibility();

    const finalize = () => {
      document.scrollingElement.scrollTop = gamePosition();
      currentIndex = null;
      renderStep();
      syncVisibility();
      scrollTween = null;
      isTransitioning = false;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      announcePageArrival(5);
      window.ScrollTrigger?.update();
    };

    originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    const targetY = gamePosition();

    if (!instant && !reducedMotion && window.gsap) {
      const scrollState = { y: window.scrollY };
      scrollTween = window.gsap.to(scrollState, {
        y: targetY,
        duration: 0.62,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: () => {
          document.scrollingElement.scrollTop = scrollState.y;
        },
        onComplete: finalize
      });
    } else {
      document.scrollingElement.scrollTop = targetY;
      finalize();
    }

    return true;
  };

  window.addEventListener(
    "resize",
    () => {
      if (isTransitioning) {
        viewportChangedDuringTransition = true;
        viewportRefreshCompleted = false;
      }
    },
    { passive: true }
  );
  window.ScrollTrigger?.addEventListener("refresh", () => {
    if (isTransitioning && viewportChangedDuringTransition) {
      viewportRefreshCompleted = true;
      if (waitingForViewportRefresh) {
        waitingForViewportRefresh = false;
        pendingTransitionFinalize?.();
      }
    }
  });

  const next = () => {
    if (currentIndex === PREP_STEPS.length - 1) {
      return goToGame();
    }
    return goToPage((currentIndex ?? -1) + 1);
  };

  const previous = () => {
    if (currentIndex === 0 && !isTransitioning) {
      currentIndex = null;
      renderStep();
      syncVisibility();
      window.tichuStageNav?.goTo?.("#card-guide");
      return true;
    }
    return currentIndex !== null && goToPage(currentIndex - 1);
  };

  const requestSync = () => {
    if (!syncFrame) {
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = 0;
        syncVisibility();
        if (
          currentIndex === null &&
          !isTransitioning &&
          document.body.dataset.activeStage === "#game-setup" &&
          isPrepInView()
        ) {
          goToPage(0);
        }
      });
    }
  };

  const shouldHandleInput = () => {
    if (
      currentIndex === null ||
      document.documentElement.classList.contains("modal-open") ||
      !document.body.classList.contains("stage-tabs-visible") ||
      !["#game-setup", "#game-play"].includes(document.body.dataset.activeStage)
    ) {
      return false;
    }

    const currentPage = pages[currentIndex]?.element;
    const rect = currentPage?.getBoundingClientRect();
    return Boolean(rect && rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.45);
  };

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
      wheelDelta = 0;
      wheelGestureConsumed = false;
    }, 280);

    if (isTransitioning || wheelGestureConsumed) {
      return;
    }

    wheelDelta += event.deltaY;
    if (Math.abs(wheelDelta) < 18) {
      return;
    }

    const direction = Math.sign(wheelDelta);
    wheelDelta = 0;
    wheelGestureConsumed = true;
    if (direction > 0) {
      next();
    } else {
      previous();
    }
  };

  const onTouchStart = (event) => {
    const canStart = shouldHandleInput() && !isTransitioning;
    touchStartY = canStart ? event.touches[0]?.clientY ?? null : null;
    touchGestureConsumed = false;
  };

  const onTouchMove = (event) => {
    if (!shouldHandleInput() || touchStartY === null) {
      return;
    }
    if (isTransitioning || touchGestureConsumed) {
      consumeInput(event);
      return;
    }

    const currentY = event.touches[0]?.clientY;
    if (currentY === undefined || Math.abs(touchStartY - currentY) < 44) {
      return;
    }

    const direction = Math.sign(touchStartY - currentY);
    touchStartY = null;
    touchGestureConsumed = true;
    consumeInput(event);
    if (direction > 0) {
      next();
    } else {
      previous();
    }
  };

  const onTouchEnd = () => {
    touchStartY = null;
    touchGestureConsumed = false;
  };

  const onKeyDown = (event) => {
    if (
      !shouldHandleInput() ||
      (event.target instanceof Element && event.target.closest("button, a, input, select, textarea"))
    ) {
      return;
    }
    if (event.repeat) {
      consumeInput(event);
      return;
    }
    if (["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey)) {
      consumeInput(event);
      next();
    } else if (["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey)) {
      consumeInput(event);
      previous();
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
  window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync, { passive: true });
  window.addEventListener("load", requestSync, { once: true });

  window.tichuPrepFlow = {
    steps: PREP_STEPS,
    goToPage,
    jumpToPage: (index) => goToPage(index, { allowNonAdjacent: true, instant: true }),
    jumpToGame: () => goToGame({ allowFromAnywhere: true, instant: true }),
    next,
    previous,
    releaseGameStart: () => {
      scrollTween?.kill();
      scrollTween = null;
      isTransitioning = false;
      currentIndex = null;
      renderStep();
      syncVisibility();
    },
    current: () => currentIndex,
    isActive: () => currentIndex !== null && currentIndex < pages.length && isPrepInView()
  };

  renderStep();
  syncVisibility();
  requestSync();
};

(() => {
  "use strict";

  const stepper = document.querySelector(".prep-stepper");
  const stepItems = Array.from(document.querySelectorAll("[data-prep-step]"));
  const PREP_STEPS = Object.freeze([
    { key: "deal", selector: "#game-setup" },
    { key: "large-tichu", selector: "#prep-large-tichu" },
    { key: "receive-six", selector: "#prep-receive-six" },
    { key: "exchange", selector: "#prep-exchange" },
    { key: "small-tichu", selector: "#prep-small-tichu" }
  ]);
  const steps = PREP_STEPS.map((step) => ({
    ...step,
    element: document.querySelector(step.selector)
  }));
  const gameStage = document.querySelector("#game-play");

  if (
    !stepper ||
    !gameStage ||
    stepItems.length !== steps.length ||
    steps.some((step) => !step.element)
  ) {
    return;
  }

  let currentIndex = 0;
  let prepActive = false;
  let transitionLocked = false;
  let scrollTween = null;
  let wheelTotal = 0;
  let wheelGestureConsumed = false;
  let wheelGestureTimer = 0;
  let touchStartY = null;
  let touchGestureConsumed = false;
  let originalScrollBehavior = "";
  let correctingScroll = false;

  const clampStep = (index) => Math.max(0, Math.min(steps.length - 1, index));

  const documentPosition = (element) => {
    const anchor = element.closest(".pin-spacer") || element;
    const top = anchor.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  };

  const gamePosition = () => {
    const pinTrigger = window.ScrollTrigger?.getAll().find(
      (trigger) => trigger.pin && trigger.trigger === gameStage
    );
    return pinTrigger
      ? Math.max(0, Math.min(pinTrigger.start, document.documentElement.scrollHeight - window.innerHeight))
      : documentPosition(gameStage);
  };

  const render = () => {
    if (prepActive) {
      document.body.dataset.prepPage = String(currentIndex);
    } else {
      delete document.body.dataset.prepPage;
    }
    steps.forEach((step, index) => {
      step.element.classList.toggle("is-prep-current", prepActive && index === currentIndex);
    });
    steps[2]?.element.closest(".exchange-section")?.classList.toggle(
      "is-prep-current",
      prepActive && [2, 3].includes(currentIndex)
    );
    stepItems.forEach((item, index) => {
      const isCurrent = prepActive && index === currentIndex;
      item.classList.toggle("is-current", isCurrent);
      item.classList.toggle("is-complete", prepActive && index < currentIndex);
      if (isCurrent) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });

    const visible =
      prepActive &&
      document.body.classList.contains("stage-tabs-visible") &&
      document.body.dataset.activeStage === "#game-setup";
    stepper.setAttribute("aria-hidden", String(!visible));
  };

  const unlockGate = (element) => {
    window.tichuProgressGates?.forEach((gate) => {
      if (
        gate.section === element ||
        gate.section?.contains(element) ||
        element?.contains(gate.section)
      ) {
        gate.unlock();
      }
    });
  };

  const announceStepLeave = (fromIndex, toIndex) => {
    if (!Number.isInteger(fromIndex) || fromIndex === toIndex) {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("tichu:prep-step-leave", {
        detail: {
          index: fromIndex,
          nextIndex: toIndex,
          direction: Math.sign(toIndex - fromIndex)
        }
      })
    );
  };

  const replayStepMotion = (index, previousIndex = null) => {
    window.dispatchEvent(
      new CustomEvent("tichu:prep-step", {
        detail: {
          index,
          previousIndex,
          direction: Number.isInteger(previousIndex) ? Math.sign(index - previousIndex) : 0
        }
      })
    );
  };

  const finishTransition = (index, previousIndex, target) => {
    document.scrollingElement.scrollTop = target();
    scrollTween = null;
    transitionLocked = false;
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
    render();
    replayStepMotion(index, previousIndex);
    window.ScrollTrigger?.update();
  };

  const goToStep = (requestedIndex, { force = false, instant = false } = {}) => {
    if (!Number.isInteger(requestedIndex) || transitionLocked) {
      return false;
    }

    const nextIndex = clampStep(requestedIndex);
    const previousIndex = prepActive ? currentIndex : null;
    if (!force && prepActive && Math.abs(nextIndex - currentIndex) !== 1) {
      return false;
    }
    if (!force && prepActive && nextIndex === currentIndex) {
      return false;
    }

    announceStepLeave(previousIndex, nextIndex);
    unlockGate(steps[previousIndex ?? currentIndex]?.element);
    prepActive = true;
    currentIndex = nextIndex;
    transitionLocked = true;
    document.body.dataset.activeStage = "#game-setup";
    window.tichuStageNav?.show("#game-setup");
    window.tichuStageNav?.setActive("#game-setup");
    render();

    originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    const target = () => documentPosition(steps[nextIndex].element);

    scrollTween?.kill();
    document.scrollingElement.scrollTop = target();
    finishTransition(nextIndex, previousIndex, target);
    return true;
  };

  const goToGame = ({ force = false, instant = false } = {}) => {
    if (transitionLocked || (!force && (!prepActive || currentIndex !== steps.length - 1))) {
      return false;
    }

    const previousIndex = currentIndex;
    announceStepLeave(previousIndex, steps.length);
    unlockGate(steps[previousIndex]?.element);
    transitionLocked = true;
    document.body.dataset.activeStage = "#game-play";
    window.tichuStageNav?.setActive("#game-play");
    render();

    originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    const target = () => gamePosition();
    const finalize = () => {
      document.scrollingElement.scrollTop = target();
      prepActive = false;
      transitionLocked = false;
      scrollTween = null;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      render();
      replayStepMotion(5, previousIndex);
      window.ScrollTrigger?.update();
    };

    document.scrollingElement.scrollTop = target();
    finalize();
    return true;
  };

  const moveBy = (delta) => {
    if (!prepActive || transitionLocked || Math.abs(delta) !== 1) {
      return false;
    }

    const requestedIndex = currentIndex + delta;
    if (requestedIndex >= 0 && requestedIndex < steps.length) {
      return goToStep(requestedIndex);
    }
    // 준비 단계의 양 끝에서는 입력만 소비한다. 다른 큰 단계로의 이동은
    // 상단 단계 바나 목차에서만 명시적으로 수행한다.
    if (requestedIndex === steps.length || requestedIndex === -1) return false;
    return false;
  };

  const next = () => moveBy(1);
  const previous = () => moveBy(-1);

  const shouldHandleInput = () =>
    prepActive &&
    document.body.dataset.activeStage === "#game-setup" &&
    document.body.classList.contains("stage-tabs-visible") &&
    !document.documentElement.classList.contains("modal-open");

  const consume = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const resetWheelGestureSoon = () => {
    window.clearTimeout(wheelGestureTimer);
    wheelGestureTimer = window.setTimeout(() => {
      wheelTotal = 0;
      wheelGestureConsumed = false;
    }, 320);
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (!shouldHandleInput()) {
        wheelTotal = 0;
        return;
      }

      consume(event);
      resetWheelGestureSoon();
      if (transitionLocked || wheelGestureConsumed) {
        return;
      }

      wheelTotal += event.deltaY;
      if (Math.abs(wheelTotal) < 24) {
        return;
      }

      const direction = Math.sign(wheelTotal);
      wheelTotal = 0;
      wheelGestureConsumed = true;
      if (direction > 0) next();
      else previous();
    },
    { passive: false, capture: true }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = shouldHandleInput() && !transitionLocked
        ? event.touches[0]?.clientY ?? null
        : null;
      touchGestureConsumed = false;
    },
    { passive: true, capture: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!shouldHandleInput() || touchStartY === null) {
        return;
      }
      consume(event);
      if (transitionLocked || touchGestureConsumed) {
        return;
      }

      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined || Math.abs(touchStartY - currentY) < 46) {
        return;
      }

      const direction = Math.sign(touchStartY - currentY);
      touchGestureConsumed = true;
      touchStartY = null;
      if (direction > 0) next();
      else previous();
    },
    { passive: false, capture: true }
  );

  const clearTouchGesture = () => {
    touchStartY = null;
    window.setTimeout(() => {
      touchGestureConsumed = false;
    }, 220);
  };
  window.addEventListener("touchend", clearTouchGesture, { passive: true, capture: true });
  window.addEventListener("touchcancel", clearTouchGesture, { passive: true, capture: true });

  window.addEventListener(
    "scroll",
    () => {
      if (!shouldHandleInput() || transitionLocked || correctingScroll) {
        return;
      }
      const target = documentPosition(steps[currentIndex].element);
      if (Math.abs(window.scrollY - target) <= 1) {
        return;
      }
      correctingScroll = true;
      document.scrollingElement.scrollTop = target;
      window.requestAnimationFrame(() => {
        correctingScroll = false;
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        !shouldHandleInput() ||
        transitionLocked ||
        event.repeat ||
        (event.target instanceof Element && event.target.closest("button, a, input, select, textarea"))
      ) {
        return;
      }
      if (["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey)) {
        consume(event);
        next();
      } else if (["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey)) {
        consume(event);
        previous();
      }
    },
    { capture: true }
  );

  stepItems.forEach((item, index) => {
    const button = item.querySelector("button");
    button?.addEventListener("click", () => {
      if (!prepActive || transitionLocked || index === currentIndex) {
        return;
      }
      goToStep(currentIndex + Math.sign(index - currentIndex));
    });
  });

  const observer = new MutationObserver(render);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "data-active-stage"]
  });

  window.tichuPrepFlow = {
    steps: PREP_STEPS,
    goToStep,
    jumpToPage: (index) => goToStep(index, { force: true, instant: true }),
    jumpToGame: () => goToGame({ force: true, instant: true }),
    next,
    previous,
    releaseGameStart: () => {
      scrollTween?.kill();
      scrollTween = null;
      transitionLocked = false;
      prepActive = false;
      render();
    },
    current: () => currentIndex,
    isActive: () => prepActive
  };

  render();
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
  const introTasteNext = document.querySelector(".hero__taste-next");
  const introCardNext = document.querySelector("[data-intro-card-next]");
  const introMenuLink = document.querySelector('.chapter-menu__links a[href="#game-intro"]');
  let introSlideIndex = 0;
  let swipeStart = null;
  let lockedDetailScrollY = 0;
  let correctingDetailScroll = false;

  const setDetailScrollLock = (locked) => {
    if (locked) {
      lockedDetailScrollY = window.scrollY;
    }
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
      const hideSceneNext = introSlideIndex === 0 || isLastSlide;
      introNextButton.disabled = hideSceneNext;
      introNextButton.tabIndex = hideSceneNext ? -1 : 0;
      introNextButton.setAttribute("aria-hidden", String(hideSceneNext));
    }
    const nextLabels = [
      "4인 2팀 안내 보기",
      "카드 한 벌 안내 보기",
      "승리 조건 보기",
      "소개 마지막 화면"
    ];
    introNextButton?.setAttribute(
      "aria-label",
      nextLabels[introSlideIndex]
    );
    document.querySelector(".hero__taste-slide")?.dispatchEvent(
      new CustomEvent(introSlideIndex === 0 ? "intro-taste:enter" : "intro-taste:exit")
    );
  };

  showIntroSlide(0);

  introDots.forEach((dot) => {
    dot.addEventListener("click", () => showIntroSlide(Number(dot.dataset.introSlide)));
  });

  introTasteNext?.addEventListener("click", () => showIntroSlide(1));
  introCardNext?.addEventListener("click", () => {
    window.tichuStageNav?.goTo?.("#card-guide");
    window.requestAnimationFrame(() => document.querySelector("#cards-title")?.focus({ preventScroll: true }));
  });

  introViewport?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swipeStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  });

  introViewport?.addEventListener("pointerup", (event) => {
    if (!swipeStart || swipeStart.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
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
      if (introSlideIndex < introDots.length - 1) {
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
      if (introSlideIndex < introDots.length - 1) {
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
      onUpdate: () => {
        window.tichuStageNav?.update();
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
      quickReferenceBar,
      {
        autoAlpha: 1,
        duration: 0.35,
        ease: "power1.out"
      },
      3.11
    );

  timeline
    .to(shell, { backgroundColor: "#26150f", duration: 0.8, ease: "none" }, 1.25);
  timeline.to({}, { duration: 0.3 }, 5.1);

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

  const CARD_PAGE_TIMES = Object.freeze([5.1]);
  const cardPagePosition = (index) => {
    const trigger = timeline.scrollTrigger;
    if (!trigger) {
      return 0;
    }

    return trigger.start + (trigger.end - trigger.start) * (CARD_PAGE_TIMES[index] / timeline.duration());
  };
  const jumpToDocumentPosition = (position) => {
    const originalBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    document.scrollingElement.scrollTop = Math.max(
      0,
      Math.min(position, document.documentElement.scrollHeight - window.innerHeight)
    );
    window.ScrollTrigger?.update();
    document.documentElement.style.scrollBehavior = originalBehavior;
    window.tichuStageNav?.update();
  };
  const jumpToHeroTime = (targetTime) => {
    const trigger = timeline.scrollTrigger;
    if (!trigger || !Number.isFinite(targetTime)) {
      return;
    }

    const progress = targetTime / timeline.duration();
    jumpToDocumentPosition(trigger.start + (trigger.end - trigger.start) * progress);
    trigger.getTween()?.progress(1);
    timeline.progress(progress);
    window.tichuStageNav?.update();
  };

  window.tichuStageNav.goTo = (target) => {
    const leavingScore = document.body.dataset.activeStage === "#score-victory" && target !== "#score-victory";
    window.tichuMenuView?.unlock();
    document.documentElement.classList.remove("detail-view-open");
    document.body.classList.remove("detail-view-open");
    window.tichuProgressGates?.forEach((gate) => gate.unlock());
    window.tichuStageNav.show(target);
    window.tichuStageNav.setActive(target);
    if (leavingScore) {
      window.ScrollTrigger?.refresh();
    }

    if (target === "#game-intro") {
      cardPageIndex = -1;
      showIntroSlide(0);
      jumpToHeroTime(0.72);
      setDetailScrollLock(true);
    } else if (target === "#card-guide") {
      cardPageIndex = 0;
      setDetailScrollLock(false);
      jumpToHeroTime(CARD_PAGE_TIMES[0]);
      syncCardPageNav();
    } else if (target === "#card-reference-intro") {
      setDetailScrollLock(false);
    } else if (target === "#game-setup") {
      window.tichuPrepFlow?.jumpToPage(0);
    } else if (target === "#game-play") {
      window.tichuPrepFlow?.jumpToGame();
      window.tichuGameSlides?.goToSlide(0);
    } else if (target === "#score-victory") {
      const section = document.querySelector(target);
      if (section) {
        jumpToDocumentPosition(section.getBoundingClientRect().top + window.scrollY);
      }
      window.tichuScoreSlides?.goToSlide(0);
    }
  };

  let cardPageIndex = -1;
  let cardTransitioning = false;
  let cardWheelConsumed = false;
  let cardWheelResetTimer = 0;
  let cardTouchStartY = null;
  let cardScrollBehavior = "";

  const getCardPageAtScroll = () => {
    const positions = CARD_PAGE_TIMES.map((_, index) => cardPagePosition(index));
    if (window.scrollY < positions[0] - 2) {
      return -1;
    }
    if (window.scrollY < positions[1] - 2) {
      return 0;
    }
    return 1;
  };

  const syncCardPageNav = () => {
    const visibleIndex = Math.max(0, cardPageIndex);
    cards?.classList.toggle("is-rank-page", false);
  };

  const moveToCardPage = (index) => {
    if (cardTransitioning || index < 0 || index >= CARD_PAGE_TIMES.length) {
      return false;
    }

    cardTransitioning = true;
    jumpToHeroTime(CARD_PAGE_TIMES[index]);
    cardPageIndex = index;
    syncCardPageNav();
    cardTransitioning = false;
    return true;
  };

  const advanceCardPage = (direction) => {
    const currentIndex = cardPageIndex < 0 ? getCardPageAtScroll() : cardPageIndex;
    if (direction > 0 && currentIndex === CARD_PAGE_TIMES.length - 1) {
      return;
    }

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < CARD_PAGE_TIMES.length) {
      moveToCardPage(nextIndex);
    }
  };

  const isCardPageFlowActive = () => {
    return Boolean(
      document.body.dataset.activeStage === "#card-guide" &&
      document.body.classList.contains("stage-tabs-visible") &&
      !document.documentElement.classList.contains("modal-open")
    );
  };

  const consumeCardWheelGesture = () => {
    cardWheelConsumed = true;
    window.clearTimeout(cardWheelResetTimer);
    cardWheelResetTimer = window.setTimeout(() => {
      cardWheelConsumed = false;
    }, 280);
  };

  window.addEventListener(
    "wheel",
    (event) => {
      if (!isCardPageFlowActive()) {
        return;
      }

      const deltaY =
        event.deltaY *
        (event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1);
      const currentIndex = cardPageIndex < 0 ? getCardPageAtScroll() : cardPageIndex;
      const enteringFirstCard = currentIndex < 0;

      const gestureAlreadyConsumed = cardWheelConsumed;
      if (currentIndex === 0 && deltaY < 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        consumeCardWheelGesture();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      consumeCardWheelGesture();
      if (cardTransitioning || gestureAlreadyConsumed) {
        return;
      }

      if (enteringFirstCard) {
        moveToCardPage(0);
      } else if (deltaY !== 0) {
        advanceCardPage(Math.sign(deltaY));
      }
    },
    { passive: false, capture: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (document.body.classList.contains("detail-view-open")) {
        event.preventDefault();
      }
    },
    { passive: false, capture: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (
        !document.body.classList.contains("detail-view-open") ||
        correctingDetailScroll ||
        Math.abs(window.scrollY - lockedDetailScrollY) <= 1
      ) {
        return;
      }

      correctingDetailScroll = true;
      window.scrollTo({ top: lockedDetailScrollY, left: 0, behavior: "auto" });
      window.requestAnimationFrame(() => {
        correctingDetailScroll = false;
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      if (cardTransitioning) {
        return;
      }

      if (document.body.dataset.activeStage === "#card-guide") {
        const min = cardPagePosition(0);
        const max = cardPagePosition(CARD_PAGE_TIMES.length - 1);
        const clamped = Math.max(min, Math.min(max, window.scrollY));
        if (Math.abs(clamped - window.scrollY) > 1) {
          document.scrollingElement.scrollTop = clamped;
          cardPageIndex = clamped === min ? 0 : CARD_PAGE_TIMES.length - 1;
          window.ScrollTrigger?.update();
          return;
        }
      }

      if (!timeline.scrollTrigger?.isActive) {
        return;
      }

      cardPageIndex = getCardPageAtScroll();
    },
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      cardTouchStartY = isCardPageFlowActive() ? event.touches[0]?.clientY ?? null : null;
    },
    { passive: true, capture: true }
  );
  window.addEventListener(
    "touchmove",
    (event) => {
      if (!isCardPageFlowActive() || cardTouchStartY === null) {
        return;
      }

      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined || Math.abs(cardTouchStartY - currentY) < 44) {
        return;
      }

      const direction = Math.sign(cardTouchStartY - currentY);
      const currentIndex = cardPageIndex < 0 ? getCardPageAtScroll() : cardPageIndex;
      const enteringFirstCard = currentIndex < 0;

      if (currentIndex === 0 && direction < 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        cardTouchStartY = null;
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      cardTouchStartY = null;
      if (cardTransitioning) {
        return;
      }

      if (enteringFirstCard) {
        moveToCardPage(0);
      } else {
        advanceCardPage(direction);
      }
    },
    { passive: false, capture: true }
  );
  window.addEventListener(
    "touchend",
    () => {
      cardTouchStartY = null;
    },
    { passive: true, capture: true }
  );
  window.addEventListener(
    "keydown",
    (event) => {
      if (
        !isCardPageFlowActive() ||
        (event.target instanceof Element &&
          event.target.closest("button, a, input, select, textarea"))
      ) {
        return;
      }

      const currentIndex = cardPageIndex < 0 ? getCardPageAtScroll() : cardPageIndex;
      if (currentIndex < 0) {
        return;
      }

      const direction =
        ["ArrowDown", "PageDown"].includes(event.key) || (event.key === " " && !event.shiftKey)
          ? 1
          : ["ArrowUp", "PageUp"].includes(event.key) || (event.key === " " && event.shiftKey)
            ? -1
            : 0;
      if (!direction) {
        return;
      }

      if (currentIndex === 0 && direction < 0) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      if (!cardTransitioning) {
        advanceCardPage(direction);
      }
    },
    { capture: true }
  );

  introPreviousButton?.addEventListener("click", () => showIntroSlide(introSlideIndex - 1));

  introNextButton?.addEventListener("click", () => {
    if (introSlideIndex < introDots.length - 1) {
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
        jumpToHeroTime(targetTime);
        setDetailScrollLock(true);
      } else {
        setDetailScrollLock(false);
        jumpToHeroTime(targetTime);
        cardPageIndex = 0;
        syncCardPageNav();
      }
      window.history.replaceState(null, "", link.hash);
    });
  });

  window.addEventListener(
    "wheel",
    (event) => {
      if (document.body.classList.contains("detail-view-open")) {
        event.preventDefault();
      }
    },
    { passive: false, capture: true }
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        !document.body.classList.contains("detail-view-open") ||
        (event.target instanceof Element &&
          event.target.closest("button, a, input, select, textarea"))
      ) {
        return;
      }
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key) ||
        (event.key === " " && !event.shiftKey)
      ) {
        event.preventDefault();
      }
    },
    { capture: true }
  );

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
  const nextButton = status;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progressGate = window.createTichuProgressGate?.(section);
  let dealTimeline = null;

  const goToNextStep = () => {
    progressGate?.unlock();
    window.tichuPrepFlow?.next();
  };

  nextButton?.addEventListener("click", goToNextStep);

  const showStaticResult = () => {
    section.classList.add("is-complete");
    button.hidden = true;
    replayButton.hidden = false;
    status.hidden = false;
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
    status.hidden = true;
    status.setAttribute("aria-hidden", "true");
    button.hidden = !showStartButton;
    replayButton.hidden = true;
    gsap.set([button, replayButton, deck, status], { transform: "none" });
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
      .call(
        () => {
          status.hidden = false;
          status.removeAttribute("aria-hidden");
          gsap.set(status, { opacity: 1, y: 0 });
        },
        [],
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

  window.addEventListener("tichu:prep-step-leave", (event) => {
    if (event.detail?.index === 0) {
      dealTimeline?.pause();
    }
  });

  window.addEventListener("tichu:prep-step", (event) => {
    if (event.detail?.index !== 0) {
      return;
    }
    if (section.classList.contains("is-complete")) {
      showStaticResult();
    } else {
      resetDeal(true);
    }
  });
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

  const selectChoice = (choice) => {
    const declared = choice === "declare";

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.largeTichuChoice === choice));
    });

    window.tichuGameState.largeTichuDeclared = declared;
    window.dispatchEvent(
      new CustomEvent("tichu:large-tichu-change", {
        detail: { declared }
      })
    );
    window.tichuPrepFlow?.next();
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
  const replayButton = section.querySelector(".exchange-replay");
  const nextButton = section.querySelector("[data-exchange-next]");
  const completion = section.querySelector(".exchange-completion");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progressGate = window.createTichuProgressGate?.(section);
  let receiveTimeline = null;
  let exchangeTimeline = null;

  const setNextAvailable = (available, { animate = false } = {}) => {
    if (!nextButton || !completion) return;
    nextButton.disabled = !available;
    completion.setAttribute("aria-hidden", String(!available));
    completion.classList.toggle("is-visible", available);
    if (!available || !window.gsap) return;
    if (animate && !reducedMotion) {
      gsap.fromTo(
        completion,
        { autoAlpha: 0, xPercent: -50, yPercent: -50, x: 0, y: 8 },
        {
          autoAlpha: 1,
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: 0,
          duration: 0.28,
          ease: "power2.out",
          overwrite: true
        }
      );
    } else {
      gsap.set(completion, { autoAlpha: 1, xPercent: -50, yPercent: -50, x: 0, y: 0 });
    }
  };

  const showStaticExchange = () => {
    progressGate?.unlock();
    section.classList.add("is-complete");
    button.hidden = true;
    replayButton.hidden = false;
    setNextAvailable(true);
  };

  const resetStaticExchange = () => {
    section.classList.remove("is-complete");
    button.hidden = false;
    replayButton.hidden = true;
    setNextAvailable(false);
  };

  if (reducedMotion || !window.gsap) {
    showStaticExchange();
    replayButton.addEventListener("click", () => {
      resetStaticExchange();
      showStaticExchange();
    });
    nextButton?.addEventListener("click", () => {
      window.tichuPrepFlow?.next?.();
      window.requestAnimationFrame(() => {
        document.querySelector("#small-tichu-title")?.focus?.({ preventScroll: true });
      });
    });
    return;
  }

  count.textContent = "8장";
  gsap.set(receiveCards, { transform: "none" });
  gsap.set(receiveCards, {
    xPercent: -50,
    x: (index) => (index - (receiveCards.length - 1) / 2) * 11,
    y: 18,
    scale: 0.94,
    rotation: (index) => (index - (receiveCards.length - 1) / 2) * 4.2,
    transformOrigin: "50% 92%",
    autoAlpha: 0
  });
  gsap.set(outgoingCards, { transform: "none" });
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
    .set(count, { scale: 1, autoAlpha: 1 });

  window.addEventListener("tichu:prep-step", (event) => {
    if (event.detail?.index === 2) {
      count.textContent = "8장";
      gsap.set(count, { scale: 0.9, autoAlpha: 0 });
      receiveTimeline.restart();
    }
  });

  window.addEventListener("tichu:prep-step-leave", (event) => {
    if (event.detail?.index === 2) {
      receiveTimeline?.pause();
    }
  });

  const targets = {
    left: { top: "50%", left: "7%", rotation: -90, opacity: 0.72 },
    top: { top: "12%", left: "50%", rotation: 0, opacity: 1 },
    right: { top: "50%", left: "93%", rotation: 90, opacity: 0.72 }
  };

  const receivedPositions = {
    left: { top: "87%", left: "46%", rotation: -7 },
    top: { top: "86%", left: "50%", rotation: 0 },
    right: { top: "87%", left: "54%", rotation: 7 }
  };

  incomingCards.forEach((card) => {
    const source = targets[card.dataset.exchangeSource];
    gsap.set(card, { transform: "none" });
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
    button.hidden = false;
    button.disabled = false;
    replayButton.hidden = true;
    setNextAvailable(false);
    gsap.set([button, replayButton], { transform: "none" });
    gsap.set(button, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50 });
    gsap.set(replayButton, { opacity: 0, scale: 0.82, xPercent: -50, yPercent: 0 });
    gsap.set(outgoingCards, { transform: "none" });
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
      gsap.set(card, { transform: "none" });
      gsap.set(card, {
        top: source.top,
        left: source.left,
        xPercent: -50,
        yPercent: -50,
        rotation: source.rotation,
        autoAlpha: 0
      });
    });
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

    exchangeTimeline.call(() => {
        section.classList.add("is-complete");
        button.disabled = false;
        replayButton.hidden = false;
        setNextAvailable(true, { animate: true });
        gsap.to(replayButton, {
          opacity: 1,
          scale: 1,
          duration: 0.22,
          ease: "power2.out"
        });
      }, null, 1.98);
  };

  button.addEventListener("click", playExchange);
  replayButton.addEventListener("click", playExchange);
  nextButton?.addEventListener("click", () => {
    window.tichuPrepFlow?.next?.();
    window.requestAnimationFrame(() => {
      document.querySelector("#small-tichu-title")?.focus?.({ preventScroll: true });
    });
  });

  window.addEventListener("tichu:prep-step-leave", (event) => {
    if (event.detail?.index === 3) {
      exchangeTimeline?.pause();
    }
  });

  window.addEventListener("tichu:prep-step", (event) => {
    if (event.detail?.index !== 3) {
      return;
    }
    if (section.classList.contains("is-complete")) {
      showStaticExchange();
    } else {
      resetExchange();
    }
  });
})();

(() => {
  "use strict";

  const section = document.querySelector(".small-tichu");

  if (!section) {
    return;
  }

  const buttons = Array.from(section.querySelectorAll("[data-small-tichu-choice]"));
  const declareButton = section.querySelector('[data-small-tichu-choice="declare"]');

  const selectChoice = (choice) => {
    if (window.tichuGameState?.largeTichuDeclared && choice === "declare") {
      return;
    }

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.smallTichuChoice === choice));
    });
    window.tichuStageNav?.goTo?.("#game-play");
  };

  const syncLargeTichuState = (declared) => {
    section.classList.toggle("is-large-declared", declared);
    declareButton.disabled = declared;

    if (declared) {
      buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
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
  const previousButton = section.querySelector(".special-carousel__nav--previous");
  const nextButton = section.querySelector(".special-carousel__nav--next");
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

    if (previousButton) {
      previousButton.disabled = currentIndex === 0;
      previousButton.setAttribute("aria-disabled", String(currentIndex === 0));
    }

    if (nextButton) {
      nextButton.disabled = currentIndex === lastIndex;
      nextButton.setAttribute("aria-disabled", String(currentIndex === lastIndex));
    }
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

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => render(index));
  });

  previousButton?.addEventListener("click", () => render(currentIndex - 1));
  nextButton?.addEventListener("click", () => render(currentIndex + 1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      render(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      render(currentIndex + 1);
    }
  });

  carousel.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("button")) {
      return;
    }

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragX = 0;
    carousel.classList.add("is-dragging");
    carousel.setPointerCapture(pointerId);
  });

  carousel.addEventListener("pointermove", (event) => {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    dragX = event.clientX - startX;
    track.style.transform = `translate3d(${-slideOffset(currentIndex) + dragX}px, 0, 0)`;
  });

  carousel.addEventListener("pointerup", finishDrag);
  carousel.addEventListener("pointercancel", finishDrag);

  window.addEventListener("resize", () => render(currentIndex, true), { passive: true });

  section.addEventListener("carousel:refresh", () => render(currentIndex, true));

  render(0, true);
})();

(() => {
  "use strict";

  const cardSequence = document.querySelector(".play-card-sequence");
  const introTasteSlide = document.querySelector(".hero__taste-slide");
  const gameStart = document.querySelector(".game-start");
  const comboGuide = document.querySelector(".combo-guide");
  const comboGuideJump = document.querySelector("[data-scroll-to-combo]");
  const comboGuideClose = comboGuide?.querySelector(".combo-guide__close");
  const gameplayCarousel = document.querySelector(".gameplay-carousel");
  const main = document.querySelector("main");

  const playButton = gameStart?.querySelector(".game-start__play");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let comboReturnState = null;
  let comboInertBackground = [];

  if (cardSequence && gameStart && playButton) {
    const setSpecialCardCue = (visible) => {
      document.body.classList.toggle("game-start-active", visible);
    };
    const introElements = [
      gameStart.querySelector(".game-start__bird"),
      gameStart.querySelector(".game-start__holder"),
      gameStart.querySelector(".game-start__launch"),
      playButton
    ].filter(Boolean);

    const revealStart = () => {
      window.gsap?.killTweensOf(introElements);
      window.gsap?.set(introElements, { clearProps: "transform,opacity,visibility" });
    };

    if (window.ScrollTrigger) {
      window.gsap?.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.create({
        trigger: gameStart,
        start: "top 68%",
        end: "bottom 32%",
        onEnter: () => {
          setSpecialCardCue(true);
          revealStart();
        },
        onEnterBack: () => {
          setSpecialCardCue(true);
          revealStart();
        },
        onLeave: () => setSpecialCardCue(false),
        onLeaveBack: () => setSpecialCardCue(false)
      });
    } else {
      setSpecialCardCue(true);
      revealStart();
    }

    window.addEventListener("tichu:prep-step", (event) => {
      if (event.detail?.index === 5) {
        setSpecialCardCue(true);
        revealStart();
      }
    });

    playButton.addEventListener("click", () => {
      setSpecialCardCue(false);
      window.tichuPrepFlow?.releaseGameStart();
      window.tichuGameSlides?.goToSlide(1);
    });
  }

  if (introTasteSlide && !reducedMotion && window.gsap) {
    const tastePairs = Array.from(introTasteSlide.querySelectorAll(".hero__taste-pair"));
    const tasteEntryPositions = {
      bottom: { x: 0, y: 142, rotation: -2 },
      right: { x: 142, y: 0, rotation: 3 },
      top: { x: 0, y: -142, rotation: -2 },
      left: { x: -142, y: 0, rotation: -3 }
    };
    const tasteFinalStates = {
      "3": { x: -6, y: 6, rotation: -2 },
      "6": { x: 6, y: 3, rotation: 1.5 },
      "9": { x: -5, y: -3, rotation: -1 },
      K: { x: 5, y: -6, rotation: 2 }
    };
    let tasteTimeline = null;

    tastePairs.forEach((pair) => {
      pair.style.animation = "none";
    });

    const getTasteEntryState = (pair) => {
      const entry = tasteEntryPositions[pair.dataset.entry] || tasteEntryPositions.bottom;
      return {
        xPercent: -50,
        yPercent: -50,
        x: entry.x,
        y: entry.y,
        rotation: entry.rotation,
        scale: 0.94,
        autoAlpha: 0
      };
    };

    const resetTasteSequence = () => {
      tasteTimeline?.kill();
      tasteTimeline = null;
      tastePairs.forEach((pair) => window.gsap.set(pair, getTasteEntryState(pair)));
    };

    const playTasteSequence = () => {
      resetTasteSequence();
      tasteTimeline = window.gsap.timeline({ repeat: -1, repeatDelay: 0.2 });

      tastePairs.forEach((pair) => {
        tasteTimeline.set(pair, getTasteEntryState(pair), 0);
      });

      tastePairs.forEach((pair, index) => {
        const finalState = tasteFinalStates[pair.dataset.coverValue] || { x: 0, y: 0, rotation: 0 };
        tasteTimeline.fromTo(
          pair,
          getTasteEntryState(pair),
          {
            ...finalState,
            scale: 1,
            autoAlpha: 1,
            duration: 1.02,
            ease: "power2.inOut",
            immediateRender: false
          },
          0.25 + index * 1.2
        );
      });

      tasteTimeline.to(
        tastePairs,
        { autoAlpha: 0, duration: 0.4, ease: "power1.out" },
        ">+=1"
      );
    };

    introTasteSlide.addEventListener("intro-taste:enter", playTasteSequence);
    introTasteSlide.addEventListener("intro-taste:exit", resetTasteSequence);

    const syncTasteSequence = () => {
      const tasteIsActive =
        document.body.dataset.activeStage === "#game-intro" &&
        document.querySelector('[data-intro-slide="0"]')?.getAttribute("aria-current") === "true";
      if (tasteIsActive && !tasteTimeline) playTasteSequence();
      if (!tasteIsActive && tasteTimeline) resetTasteSequence();
    };
    new MutationObserver(syncTasteSequence).observe(document.body, {
      attributes: true,
      attributeFilter: ["data-active-stage"]
    });
    syncTasteSequence();
  }

  if (cardSequence) {
    const pairs = Array.from(cardSequence.querySelectorAll(".play-card-sequence__pair"));
    const replayButton = cardSequence.querySelector(".play-card-sequence__replay");
    const board = cardSequence.querySelector(".play-card-sequence__board");
    const seatFor = (entry) =>
      cardSequence.querySelector(`.pcs-seat[data-seat="${entry}"]`);
    const passLabels = Array.from(cardSequence.querySelectorAll(".pcs-pass"));
    let coverTimeline = null;

    const entryPositions = {
      bottom: { x: 0, y: 168, rotation: -2 },
      right: { x: 170, y: 0, rotation: 3 },
      top: { x: 0, y: -168, rotation: -2 },
      left: { x: -170, y: 0, rotation: -3 }
    };

    const getFinalState = (pair) => ({
      x: Number(pair.dataset.finalX || 0),
      y: Number(pair.dataset.finalY || 0),
      rotation: Number(pair.dataset.finalRotation || 0)
    });

    const clearSeatHighlights = () => {
      cardSequence
        .querySelectorAll(".pcs-seat.is-active")
        .forEach((seat) => seat.classList.remove("is-active"));
    };

    // Remember each pair image's original (front) src so we can flip to the
    // card back during the "collect" step and restore it when the loop resets.
    const pairImages = Array.from(cardSequence.querySelectorAll(".play-card-sequence__pair img"));
    pairImages.forEach((img) => {
      if (!img.dataset.frontSrc) img.dataset.frontSrc = img.getAttribute("src");
    });
    const nextLead = cardSequence
      .closest(".play-card-sequence")
      ?.querySelector(".play-card-sequence__next-lead");
    const nextCard = cardSequence.querySelector(".pcs-next-card");
    const BACK_SRC = "뒷면.png";
    const showCardBacks = () => pairImages.forEach((img) => img.setAttribute("src", BACK_SRC));
    const showCardFronts = () =>
      pairImages.forEach((img) => img.setAttribute("src", img.dataset.frontSrc));

    if (reducedMotion || !window.gsap) {
      pairs.forEach((pair) => {
        pair.style.opacity = "1";
      });
    } else {
      const getEntryState = (pair) => {
        const entry = entryPositions[pair.dataset.entry] || entryPositions.bottom;
        return {
          xPercent: -50,
          yPercent: -50,
          x: entry.x,
          y: entry.y,
          rotation: entry.rotation,
          scale: 0.94,
          autoAlpha: 0
        };
      };

      const setSequenceStart = () => {
        pairs.forEach((pair) => {
          window.gsap.set(pair, getEntryState(pair));
        });
      };

      const resetSequence = () => {
        coverTimeline?.kill();
        coverTimeline = null;
        clearSeatHighlights();
        showCardFronts();
        nextLead?.classList.remove("is-visible");
        if (nextCard) {
          window.gsap.set(nextCard, {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
            x: -150,
            y: 0,
            scale: 0.9,
            rotation: -6
          });
        }
        if (passLabels.length) {
          window.gsap.set(passLabels, { autoAlpha: 0, scale: 0.9 });
        }
        window.gsap.set(pairs, { rotationY: 0 });
        setSequenceStart();
      };

      const playSequence = () => {
        resetSequence();
        coverTimeline = window.gsap.timeline({
          repeat: -1,
          repeatDelay: 10,
          onRepeat: () => {
            clearSeatHighlights();
            showCardFronts();
            nextLead?.classList.remove("is-visible");
            if (nextCard) {
              window.gsap.set(nextCard, {
                autoAlpha: 0,
                xPercent: -50,
                yPercent: -50,
                x: -150,
                y: 0,
                scale: 0.9,
                rotation: -6
              });
            }
            if (passLabels.length) {
              window.gsap.set(passLabels, { autoAlpha: 0, scale: 0.9 });
            }
            window.gsap.set(pairs, { rotationY: 0 });
          }
        });

        pairs.forEach((pair) => {
          coverTimeline.set(pair, getEntryState(pair), 0);
        });

        pairs.forEach((pair, index) => {
          const finalState = getFinalState(pair);
          const startAt = 0.25 + index * 1.2;
          const entry = pair.dataset.entry;

          // Highlight the seat that is playing this pair.
          coverTimeline.call(
            () => {
              clearSeatHighlights();
              seatFor(entry)?.classList.add("is-active");
            },
            null,
            startAt
          );

          coverTimeline.fromTo(
            pair,
            getEntryState(pair),
            {
              ...finalState,
              scale: 1,
              autoAlpha: 1,
              duration: 1.02,
              ease: "power2.inOut",
              immediateRender: false
            },
            startAt
          );
        });

        // After KK, the three non-left seats (bottom, right, top) pass — in
        // counter-clockwise order — while the left seat (who played KK) does not.
        const afterKk = 0.25 + pairs.length * 1.2 + 0.2;
        coverTimeline.call(() => clearSeatHighlights(), null, afterKk);

        const passOrder = ["bottom", "right", "top"];
        passOrder.forEach((seat, index) => {
          const label = passLabels.find((el) => el.dataset.pass === seat);
          if (!label) return;
          coverTimeline.fromTo(
            label,
            { autoAlpha: 0, scale: 0.9 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.26,
              ease: "back.out(1.7)"
            },
            afterKk + 0.1 + index * 0.34
          );
        });

        // The left seat (last to play) scoops up the whole trick:
        // 1) the whole pile flips over to show card backs,
        // 2) then slides off toward the left seat and clears.
        const collectAt = afterKk + 0.1 + passOrder.length * 0.34 + 0.6;

        // Flip the pile over. At the half-way point (edge-on) swap the images
        // to the card back so it reads as "turned face-down".
        coverTimeline.to(
          pairs,
          {
            rotationY: 90,
            duration: 0.22,
            ease: "power1.in"
          },
          collectAt
        );
        coverTimeline.call(() => showCardBacks(), null, collectAt + 0.22);
        coverTimeline.to(
          pairs,
          {
            rotationY: 0,
            duration: 0.22,
            ease: "power1.out"
          },
          collectAt + 0.22
        );

        // Highlight the left seat (the winner who collects the trick).
        coverTimeline.call(
          () => {
            clearSeatHighlights();
            seatFor("left")?.classList.add("is-active");
          },
          null,
          collectAt + 0.22
        );

        // Fade the pass tags out as the trick gets collected.
        if (passLabels.length) {
          coverTimeline.to(
            passLabels,
            { autoAlpha: 0, duration: 0.3, ease: "power1.out" },
            collectAt + 0.5
          );
        }

        // Slide the whole face-down pile off toward the left seat, then clear.
        coverTimeline.to(
          pairs,
          {
            x: -230,
            y: 0,
            rotation: -10,
            autoAlpha: 0,
            duration: 0.56,
            ease: "power2.in",
            stagger: 0.035
          },
          collectAt + 0.62
        );

        // Card pile is gone — show the "whoever wins starts next" note in the
        // The left seat stays highlighted from the moment it collects the
        // trick, through the note, until it plays the next single card — no
        // flicker. Just show the note here (keep the existing highlight).
        coverTimeline.call(
          () => {
            nextLead?.classList.add("is-visible");
          },
          null,
          collectAt + 1.25
        );

        if (nextCard) {
          coverTimeline.fromTo(
            nextCard,
            { autoAlpha: 0, xPercent: -50, yPercent: -50, x: -150, y: 0, scale: 0.94, rotation: -6 },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotation: -2,
              duration: 1.02,
              ease: "power2.inOut"
            },
            collectAt + 1.7
          );
        } else {
          coverTimeline.to({}, { duration: 0.4 }, collectAt + 1.25);
        }
      };

      resetSequence();
      cardSequence.addEventListener("gameplay:slide-enter", playSequence);
      cardSequence.addEventListener("gameplay:slide-exit", resetSequence);
      replayButton?.addEventListener("click", playSequence);
      cardSequence.addEventListener("cover:replay", playSequence);
    }
  }

  if (comboGuide && comboGuideJump) {
    comboGuideJump.addEventListener("click", () => {
      comboReturnState = {
        slideIndex: Number(gameplayCarousel?.dataset.activeSlide || 0)
      };
      comboGuide.classList.add("is-opened-from-game");
      comboGuide.hidden = false;
      comboGuideClose?.removeAttribute("hidden");
      comboInertBackground = Array.from(main?.children || [])
        .filter(
          (element) =>
            element !== comboGuide && !element.matches(".quick-reference-bar")
        )
        .map((element) => ({ element, wasInert: element.inert }));
      comboInertBackground.forEach(({ element }) => {
        element.inert = true;
      });
      document.documentElement.classList.add("combo-guide-open");
      document.body.classList.add("combo-guide-open");
      comboGuideClose?.focus({ preventScroll: true });
    });

    const closeComboGuide = () => {
      if (!comboGuide.classList.contains("is-opened-from-game")) {
        return;
      }

      const returnState = comboReturnState || { slideIndex: 0 };

      gameplayCarousel?.dispatchEvent(
        new CustomEvent("gameplay:show-slide", {
          detail: { index: returnState.slideIndex }
        })
      );
      comboGuide.classList.remove("is-opened-from-game");
      comboGuideClose.setAttribute("hidden", "");
      comboGuide.hidden = true;
      comboInertBackground.forEach(({ element, wasInert }) => {
        element.inert = wasInert;
      });
      comboInertBackground = [];
      document.documentElement.classList.remove("combo-guide-open");
      document.body.classList.remove("combo-guide-open");
      comboReturnState = null;
      comboGuideJump.focus({ preventScroll: true });
    };

    comboGuideClose?.addEventListener("click", closeComboGuide);
    comboGuide?.addEventListener("click", (event) => {
      if (event.target.closest("[data-combo-guide-close]")) {
        closeComboGuide();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (!comboGuide.classList.contains("is-opened-from-game")) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeComboGuide();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          comboGuide.querySelectorAll(
            'button:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => !element.closest("[hidden]"));
        if (!focusable.length) {
          event.preventDefault();
          comboGuide.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
})();

(() => {
  "use strict";

  const carousel = document.querySelector(".gameplay-carousel");
  const viewport = carousel?.querySelector(".gameplay-carousel__viewport");
  const track = carousel?.querySelector(".gameplay-carousel__track");
  const slides = Array.from(carousel?.querySelectorAll(".gameplay-carousel__slide") || []);
  const previousButton = carousel?.querySelector(".gameplay-carousel__nav--previous");
  const nextButton = carousel?.querySelector(".gameplay-carousel__nav--next");
  const dots = Array.from(carousel?.querySelectorAll(".gameplay-carousel__dots button") || []);
  const gameStart = carousel?.querySelector(".game-start");

  if (
    !carousel ||
    !viewport ||
    !track ||
    slides.length === 0 ||
    dots.length !== slides.length ||
    !previousButton ||
    !nextButton ||
    !gameStart ||
    slides[0] !== gameStart
  ) {
    return;
  }

  let currentIndex = 0;
  let swipeStart = null;

  const setScrollLock = (locked) => {
    document.documentElement.classList.toggle("gameplay-slides-active", locked);
    document.body.classList.toggle("gameplay-slides-active", locked);
    document.body.classList.toggle("game-start-active", locked && currentIndex === 0);
  };

  const goToSlide = (nextIndex) => {
    const lastIndex = slides.length - 1;
    const boundedIndex = Math.max(0, Math.min(lastIndex, nextIndex));
    if (boundedIndex === currentIndex && carousel.dataset.activeSlide !== undefined) {
      return;
    }

    const moveFocusToViewport = slides[currentIndex]?.contains(document.activeElement);
    if (moveFocusToViewport) {
      viewport.focus({ preventScroll: true });
    }
    slides[currentIndex]?.dispatchEvent(new CustomEvent("gameplay:slide-exit"));
    currentIndex = boundedIndex;
    carousel.dataset.activeSlide = String(currentIndex);
    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
    document.body.classList.toggle(
      "game-start-active",
      currentIndex === 0 && document.body.classList.contains("gameplay-slides-active")
    );
    const slideLabelId = slides[currentIndex].getAttribute("aria-labelledby");
    const slideLabel = slides[currentIndex].getAttribute("aria-label") ||
      document.getElementById(slideLabelId)?.textContent.trim().replace(/\s+/g, " ") ||
      "게임 안내";
    viewport.setAttribute(
      "aria-label",
      `게임 진행 ${currentIndex + 1}/${slides.length}: ${slideLabel}`
    );

    slides.forEach((slide, index) => {
      const isCurrent = index === currentIndex;
      slide.setAttribute("aria-hidden", String(!isCurrent));
      slide.inert = !isCurrent;
    });
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === lastIndex;
    dots.forEach((dot, index) => {
      const isCurrent = index === currentIndex;
      dot.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        dot.setAttribute("aria-current", "page");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
    slides[currentIndex].dispatchEvent(new CustomEvent("gameplay:slide-enter"));
  };

  window.tichuGameSlides = { goToSlide, current: () => currentIndex };
  previousButton.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => goToSlide(currentIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  carousel.addEventListener("gameplay:show-slide", (event) => {
    goToSlide(Number(event.detail?.index || 0));
  });

  const syncScrollLock = () => {
    const isOnGameplayStage =
      document.body.dataset.activeStage === "#game-play" &&
      carousel.getBoundingClientRect().top < window.innerHeight * 0.5 &&
      carousel.getBoundingClientRect().bottom > window.innerHeight * 0.5;
    setScrollLock(isOnGameplayStage);
  };

  if ("IntersectionObserver" in window) {
    const gameplayObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setScrollLock(Boolean(entry?.isIntersecting) && document.body.dataset.activeStage === "#game-play");
      },
      { threshold: 0.6 }
    );
    gameplayObserver.observe(carousel);
  } else {
    window.addEventListener("scroll", syncScrollLock, { passive: true });
    window.addEventListener("resize", syncScrollLock, { passive: true });
    syncScrollLock();
  }

  const stageObserver = new MutationObserver(syncScrollLock);
  stageObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-active-stage"]
  });

  window.addEventListener(
    "wheel",
    (event) => {
      if (
        !document.body.classList.contains("gameplay-slides-active") ||
        event.ctrlKey ||
        document.body.classList.contains("combo-guide-open") ||
        document.body.classList.contains("modal-open")
      ) {
        return;
      }
      event.preventDefault();
    },
    { passive: false, capture: true }
  );

  goToSlide(0);
})();

(() => {
  "use strict";

  // 점수 화면 전용 가로 캐러셀 컨트롤러. 게임 진행 캐러셀 컨트롤러에서 일반화했다.
  // 게임 진행 전용 결합(gameStart 체크, setScrollLock/gameplay-slides-active/game-start-active,
  // IntersectionObserver 스크롤 잠금, gameplay:slide-enter/exit 이벤트, 추가 wheel preventDefault)은
  // 모두 제거했다. 점수 화면은 더 이상 스크롤에 의존하지 않고 다른 스테이지처럼 뷰포트에 맞으므로,
  // 캐러셀은 슬라이드 전환만 담당한다.
  const carousel = document.querySelector(".score-carousel");
  const viewport = carousel?.querySelector(".score-carousel__viewport");
  const track = carousel?.querySelector(".score-carousel__track");
  const slides = Array.from(carousel?.querySelectorAll(".score-carousel__slide") || []);
  const previousButton = carousel?.querySelector(".score-carousel__nav--previous");
  const nextButton = carousel?.querySelector(".score-carousel__nav--next");
  const dots = Array.from(carousel?.querySelectorAll(".score-carousel__dots button") || []);

  if (
    !carousel ||
    !viewport ||
    !track ||
    slides.length === 0 ||
    dots.length !== slides.length ||
    !previousButton ||
    !nextButton
  ) {
    return;
  }

  let currentIndex = 0;

  const goToSlide = (nextIndex) => {
    const lastIndex = slides.length - 1;
    const boundedIndex = Math.max(0, Math.min(lastIndex, nextIndex));

    const moveFocusToViewport = slides[currentIndex]?.contains(document.activeElement);
    if (moveFocusToViewport) {
      viewport.focus({ preventScroll: true });
    }
    currentIndex = boundedIndex;
    carousel.dataset.activeSlide = String(currentIndex);
    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

    const slideLabelId = slides[currentIndex].getAttribute("aria-labelledby");
    const slideLabel = slides[currentIndex].getAttribute("aria-label") ||
      document.getElementById(slideLabelId)?.textContent.trim().replace(/\s+/g, " ") ||
      "점수 안내";
    viewport.setAttribute(
      "aria-label",
      `점수 안내 ${currentIndex + 1}/${slides.length}: ${slideLabel}`
    );

    slides.forEach((slide, index) => {
      const isCurrent = index === currentIndex;
      slide.setAttribute("aria-hidden", String(!isCurrent));
      slide.inert = !isCurrent;
      // 가로 캐러셀 안에서는 스크롤이 없으므로, 현재 보이는 슬라이드에
      // is-visible 진입 애니메이션 클래스를 직접 붙여 준다(.round-end/.round-finale 관찰자 보완).
      if (isCurrent) {
        slide.classList.add("is-visible");
      }
    });
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === lastIndex;
    dots.forEach((dot, index) => {
      const isCurrent = index === currentIndex;
      dot.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        dot.setAttribute("aria-current", "page");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  window.tichuScoreSlides = { goToSlide, current: () => currentIndex };
  previousButton.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => goToSlide(currentIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  goToSlide(0);
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
  const inner = trickEnd.querySelector(".trick-end__inner");

  const playCollection = () => {
    trickEnd.classList.remove("is-visible");
    void trickEnd.offsetWidth;
    trickEnd.classList.add("is-visible");
  };

  const resetCollection = () => {
    trickEnd.classList.remove("is-visible");
    window.gsap?.killTweensOf(inner);
    window.gsap?.set(inner, { clearProps: "transform,opacity" });
  };

  trickEnd.addEventListener("gameplay:slide-enter", playCollection);
  trickEnd.addEventListener("gameplay:slide-exit", resetCollection);
})();

(() => {
  "use strict";

  const bombGuide = document.querySelector(".bomb-guide");
  if (!bombGuide) {
    return;
  }

  const inner = bombGuide.querySelector(".bomb-guide__inner");
  const playEntrance = () => {
    window.gsap?.killTweensOf(inner);
    window.gsap?.set(inner, { clearProps: "transform,opacity" });
  };
  const resetEntrance = () => {
    window.gsap?.killTweensOf(inner);
    window.gsap?.set(inner, { clearProps: "transform,opacity" });
  };

  bombGuide.addEventListener("gameplay:slide-enter", playEntrance);
  bombGuide.addEventListener("gameplay:slide-exit", resetEntrance);
})();

(() => {
  "use strict";

  const trickRepeat = document.querySelector(".trick-repeat");

  if (!trickRepeat) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const inner = trickRepeat.querySelector(".trick-repeat__inner");

  const playLoop = () => {
    trickRepeat.classList.remove("is-visible");
    void trickRepeat.offsetWidth;
    trickRepeat.classList.add("is-visible");
  };

  const resetLoop = () => {
    trickRepeat.classList.remove("is-visible");
    window.gsap?.killTweensOf(inner);
    window.gsap?.set(inner, { clearProps: "transform,opacity" });
  };

  trickRepeat.addEventListener("gameplay:slide-enter", playLoop);
  trickRepeat.addEventListener("gameplay:slide-exit", resetLoop);
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
  const referenceNames = new Set(["hierarchy", "combo", "bomb", "special"]);
  const referenceButtons = Array.from(
    document.querySelectorAll(".quick-reference-bar__button[data-open]")
  );
  const openReferences = new Map();
  const referenceCloseTimers = new Map();
  let referenceZIndex = 1200;
  let activeModal = null;
  let returnFocus = null;
  let lockedScrollY = 0;
  let closeTimer = null;
  let inertBackground = [];
  let pageLockCount = 0;

  const modalFor = (name) =>
    Array.from(document.querySelectorAll("[data-modal]")).find(
      (modal) => modal.dataset.modal === name
    ) || null;

  const setReferenceActive = () => {
    referenceButtons.forEach((button) => {
      const isActive = openReferences.has(button.dataset.open);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-expanded", String(isActive));
    });
  };

  const bringReferenceToFront = (modal) => {
    referenceZIndex += 1;
    modal.style.zIndex = String(referenceZIndex);
    openReferences.forEach((state) => {
      state.modal.classList.toggle("is-front", state.modal === modal);
    });
  };

  const topReferenceState = () =>
    Array.from(openReferences.values()).sort(
      (a, b) => Number(a.modal.style.zIndex) - Number(b.modal.style.zIndex)
    ).at(-1) || null;

  const finishReferenceClose = (name, modal, trigger, restoreFocus) => {
    referenceCloseTimers.delete(name);
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.style.removeProperty("z-index");
    modal.style.removeProperty("--reference-offset");
    if (restoreFocus && trigger instanceof HTMLElement && trigger.isConnected) {
      trigger.focus({ preventScroll: true });
    }
  };

  const closeReference = (name, { restoreFocus = true } = {}) => {
    const state = openReferences.get(name);
    if (!state) return;

    openReferences.delete(name);
    unlockPage();
    state.modal.classList.remove("is-open", "is-front");
    setReferenceActive();
    window.clearTimeout(referenceCloseTimers.get(name));
    const timer = window.setTimeout(
      () => finishReferenceClose(name, state.modal, state.trigger, restoreFocus),
      prefersReducedMotion.matches ? 0 : 260
    );
    referenceCloseTimers.set(name, timer);

    const topState = topReferenceState();
    if (topState) bringReferenceToFront(topState.modal);
  };

  const openReference = (name, trigger = null) => {
    const modal = modalFor(name);
    if (!modal) return;

    const existing = openReferences.get(name);
    if (existing) {
      if (topReferenceState()?.modal === modal) {
        closeReference(name);
      } else {
        bringReferenceToFront(modal);
        modal.querySelector("[data-close-modal]")?.focus({ preventScroll: true });
      }
      return;
    }

    window.clearTimeout(referenceCloseTimers.get(name));
    referenceCloseTimers.delete(name);
    lockPage();
    const opener = trigger instanceof HTMLElement
      ? trigger
      : referenceButtons.find((button) => button.dataset.open === name) || null;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.style.setProperty(
      "--reference-offset",
      `${Math.min(openReferences.size, 3) * 12}px`
    );
    openReferences.set(name, { modal, trigger: opener });
    bringReferenceToFront(modal);
    setReferenceActive();

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      modal.querySelector(".special-cards")?.dispatchEvent(new Event("carousel:refresh"));
      const focusTarget = modal.querySelector("[data-close-modal]") || modal.querySelector('[role="dialog"]');
      focusTarget?.focus({ preventScroll: true });
    });
  };

  const lockPage = () => {
    pageLockCount += 1;
    if (pageLockCount > 1) {
      return;
    }
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    if (main) {
      inertBackground = Array.from(main.children)
        .filter((element) => !element.matches(".quick-reference-bar"))
        .map((element) => ({ element, wasInert: element.inert }));
      inertBackground.forEach(({ element }) => {
        element.inert = true;
      });
    }
  };

  const unlockPage = () => {
    if (pageLockCount === 0) {
      return;
    }
    pageLockCount -= 1;
    if (pageLockCount > 0) {
      return;
    }
    const restoreScrollY = lockedScrollY;
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    inertBackground.forEach(({ element, wasInert }) => {
      element.inert = wasInert;
    });
    inertBackground = [];

    // 잠금 중에는 stage isolation이 inert/aria-hidden을 건드리지 않았으므로, 위에서 복원한
    // 스냅샷은 잠금 시점의 값이다. 그 사이 스크롤/리사이즈/단계 이동으로 단계 의도가 바뀌었을 수
    // 있으니, 현재 단계 상태를 다시 계산해 배경의 inert/aria-hidden을 올바른 값으로 맞춘다.
    window.tichuStageNav?.setActive?.(document.body.dataset.activeStage);

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
    if (referenceNames.has(name)) {
      openReference(name, trigger);
      return;
    }

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
    if (closer) {
      const modal = closer.closest("[data-modal]");
      if (modal?.classList.contains("reference-window")) {
        event.preventDefault();
        closeReference(modal.dataset.modal);
      } else if (activeModal && modal === activeModal) {
        event.preventDefault();
        closeModal();
      }
    }
  });

  document.addEventListener("pointerdown", (event) => {
    const modal = event.target.closest(".reference-window.is-open");
    if (modal) bringReferenceToFront(modal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (activeModal) {
        event.preventDefault();
        closeModal();
        return;
      }
      const topReference = Array.from(openReferences.entries()).sort(
        ([, a], [, b]) => Number(a.modal.style.zIndex) - Number(b.modal.style.zIndex)
      ).at(-1);
      if (topReference) {
        event.preventDefault();
        closeReference(topReference[0]);
      }
      return;
    }

    if (!activeModal || event.key !== "Tab") {
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
  window.closeModal = (name = null) => {
    if (name && referenceNames.has(name)) {
      closeReference(name);
      return;
    }
    closeModal();
  };
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
