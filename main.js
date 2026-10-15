(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.add("animation-unavailable");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const shell = document.querySelector(".app-shell");
  const visual = document.querySelector(".hero__visual");
  const dragon = document.querySelector(".hero__dragon");
  const copy = document.querySelector(".hero__copy");
  const lines = gsap.utils.toArray(".hero__line");
  const goal = document.querySelector(".goal");
  const goalIntro = gsap.utils.toArray(".goal__time, .goal__eyebrow");
  const goalCore = document.querySelector(".goal__core");
  const goalWays = gsap.utils.toArray(".goal__way");
  const goalStroke = document.querySelector(".goal__stroke");
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

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=800%",
      pin: ".hero__stage",
      pinSpacing: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // 구간 A (0 → 0.5): 로고는 중앙에 고정하고 용 배경만 아래에서 차오른다.
  timeline.to(
    dragon,
    {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "power2.out"
    },
    0
  );

  // 구간 B (0.5 → 1): 완성된 로고+용 레이어가 함께 퇴장하며 문구가 순차 등장한다.
  timeline
    .to(
      visual,
      {
        y: () => -Math.max(window.innerHeight, 560) * 1.08,
        duration: 1,
        ease: "power2.inOut"
      },
      1
    )
    .to(
      lines,
      {
        y: 0,
        opacity: 1,
        duration: 0.36,
        stagger: 0.1,
        ease: "power2.out"
      },
      1.12
    )
    // 구간 C: 인원 안내가 사라진 뒤 짧은 간격을 두고 게임 목표가 이어진다.
    .to(
      copy,
      {
        y: () => -Math.max(window.innerHeight, 560) * 0.55,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      },
      2.05
    )
    .to(
      goal,
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: "power2.out"
      },
      2.65
    )
    .to(
      goalIntro,
      {
        y: 0,
        opacity: 1,
        duration: 0.32,
        stagger: 0.1,
        ease: "power2.out"
      },
      2.75
    )
    .to(
      goalCore,
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.48,
        ease: "power2.out"
      },
      3.25
    )
    .to(
      goalWays,
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      },
      3.78
    )
    .to(
      goalStroke,
      {
        scaleX: 1,
        duration: 0.38,
        ease: "power2.out"
      },
      4.22
    )
    .to(
      goal,
      {
        opacity: 1,
        duration: 0.7,
        ease: "none"
      },
      4.6
    )
    // 구간 D: 게임 목표를 닫고 일반 카드 구성과 숫자 서열을 소개한다.
    .to(
      goal,
      {
        y: () => -Math.max(window.innerHeight, 560) * 0.5,
        opacity: 0,
        duration: 0.55,
        ease: "power2.inOut"
      },
      5.35
    )
    .to(
      cards,
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      },
      6
    )
    .to(
      cardsCount,
      {
        y: 0,
        opacity: 1,
        duration: 0.36,
        ease: "power2.out"
      },
      6.12
    )
    .to(
      cardsCount,
      {
        y: () => -Math.max(window.innerHeight, 560) * 0.45,
        opacity: 0,
        duration: 0.46,
        ease: "power2.inOut"
      },
      6.9
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
      7.46
    )
    .to(
      suitIntro,
      {
        y: 0,
        duration: 0.64,
        ease: "power2.out"
      },
      7.8
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
      7.88
    )
    .to(
      suitIntroLabel,
      {
        y: 0,
        opacity: 1,
        duration: 0.34,
        ease: "power2.out"
      },
      8.34
    )
    .to(
      suitIntro,
      {
        y: () => -(playingCard.clientHeight * 0.32),
        duration: 0.58,
        ease: "power2.inOut"
      },
      8.92
    )
    .to(
      rankFace,
      {
        y: 0,
        duration: 0.58,
        ease: "power2.inOut"
      },
      8.92
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
      9.48
    )
    .to(
      rankFaceLabel,
      {
        y: 0,
        opacity: 1,
        duration: 0.32,
        ease: "power2.out"
      },
      10.24
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
      10.62
    )
    .to(
      playingCard,
      {
        opacity: 1,
        duration: 0.8,
        ease: "none"
      },
      11.12
    );

  timeline
    .to(shell, { backgroundColor: "#170507", duration: 0.7, ease: "none" }, 2.25)
    .to(shell, { backgroundColor: "#090a1b", duration: 0.8, ease: "none" }, 5.45);
})();

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const shell = document.querySelector(".app-shell");
  const transitions = [
    [".deal-section", "#090a1b", "#0b0812"],
    [".large-tichu", "#0b0812", "#151006"],
    [".exchange-section", "#151006", "#06140f"],
    [".game-start", "#06140f", "#13070b"],
    [".combo-bridge", "#13070b", "#090817"],
    [".combo-guide", "#090817", "#080d19"],
    [".bomb-guide", "#080d19", "#160608"]
  ];

  gsap.registerPlugin(ScrollTrigger);

  transitions.forEach(([selector, fromColor, toColor]) => {
    const section = document.querySelector(selector);

    if (!section) {
      return;
    }

    gsap.fromTo(
      shell,
      { backgroundColor: fromColor },
      {
        backgroundColor: toColor,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          end: "top 48%",
          scrub: 0.6
        }
      }
    );
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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dealTimeline = null;

  const showStaticResult = () => {
    section.classList.add("is-complete");
    button.hidden = true;
    status.removeAttribute("aria-hidden");
  };

  if (reducedMotion || !window.gsap) {
    showStaticResult();
    button.addEventListener("click", showStaticResult);
    return;
  }

  const destinations = (round) => {
    const width = table.clientWidth;
    const height = table.clientHeight;
    const stackOffset = (round - 3.5) * 1.15;

    return [
      { x: stackOffset, y: height * -0.34, rotation: stackOffset * 0.7 },
      { x: width * 0.36, y: stackOffset, rotation: 90 + stackOffset * 0.7 },
      { x: stackOffset, y: height * 0.34, rotation: 180 + stackOffset * 0.7 },
      { x: width * -0.36, y: stackOffset, rotation: -90 + stackOffset * 0.7 }
    ];
  };

  const resetDeal = () => {
    if (dealTimeline) {
      dealTimeline.kill();
    }

    layer.replaceChildren();
    section.classList.remove("is-complete");
    status.setAttribute("aria-hidden", "true");
    button.hidden = false;
    gsap.set(button, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50 });
    gsap.set(deck, { opacity: 0, scale: 0.92, xPercent: -50, yPercent: -50 });
    gsap.set(fans, { opacity: 0, scale: 0.78 });
    gsap.set(status, { opacity: 0, xPercent: -50, yPercent: -50, y: 12 });
  };

  const playDeal = () => {
    resetDeal();
    const dealtCards = [];
    dealTimeline = gsap.timeline({
      onStart: () => {
        button.disabled = true;
      }
    });

    dealTimeline
      .to(button, {
        opacity: 0,
        scale: 0.94,
        duration: 0.16,
        ease: "power1.out",
        onComplete: () => {
          button.hidden = true;
        }
      })
      .to(deck, { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" }, ">-0.02");

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
      });
  };

  button.addEventListener("click", playDeal);
})();

(() => {
  "use strict";

  const section = document.querySelector(".large-tichu");

  if (!section) {
    return;
  }

  const buttons = Array.from(section.querySelectorAll("[data-large-tichu-choice]"));
  const feedback = section.querySelector(".large-tichu__feedback");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const messages = {
    declare: "선언 완료! 반드시 내가 1등으로 비워야 해요🔥",
    pass: "패스! 나중에 스몰 티츄 기회가 또 있어요"
  };

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    section.classList.add("is-static");
  } else {
    gsap.registerPlugin(ScrollTrigger);

    const stage = section.querySelector(".large-tichu__stage");
    const title = section.querySelector(".large-tichu__title");
    const question = section.querySelector(".large-tichu__question");
    const deadline = section.querySelector(".large-tichu__deadline");
    const controls = section.querySelector(".large-tichu__controls");
    const entryY = () => Math.min(window.innerHeight * 0.38, 310);

    gsap.set([title, question, deadline, controls], {
      xPercent: -50,
      yPercent: -50,
      y: entryY,
      autoAlpha: 0
    });
    gsap.set(controls, { pointerEvents: "none" });

    gsap
      .timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%",
          pin: stage,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      })
      .to(title, { y: 0, autoAlpha: 1, duration: 0.44, ease: "power2.out" }, 0)
      .to(title, { y: -150, scale: 0.7, duration: 0.46 }, 0.5)
      .to(question, { y: 0, autoAlpha: 1, duration: 0.42, ease: "power2.out" }, 0.56)
      .to(title, { y: -186, scale: 0.64, duration: 0.42 }, 1.04)
      .to(question, { y: -78, duration: 0.42 }, 1.04)
      .to(deadline, { y: 4, autoAlpha: 1, duration: 0.42, ease: "power2.out" }, 1.1)
      .to(title, { y: -205, scale: 0.62, duration: 0.42 }, 1.58)
      .to(question, { y: -122, duration: 0.42 }, 1.58)
      .to(deadline, { y: -48, duration: 0.42 }, 1.58)
      .to(controls, { y: 90, autoAlpha: 1, duration: 0.44, ease: "power2.out" }, 1.64)
      .set(controls, { pointerEvents: "auto" }, 2.02)
      .to({}, { duration: 0.08 });
  }

  const selectChoice = (choice) => {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.largeTichuChoice === choice));
    });

    feedback.classList.remove("is-visible", "is-declare");
    feedback.textContent = messages[choice];
    feedback.classList.toggle("is-declare", choice === "declare");

    window.requestAnimationFrame(() => {
      feedback.classList.add("is-visible");
    });
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
  const exchangeCards = Array.from(section.querySelectorAll(".exchange-card"));
  const button = section.querySelector(".exchange-button");
  const status = section.querySelector(".exchange-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    section.classList.add("is-static");
    status.removeAttribute("aria-hidden");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  count.textContent = "8장";
  gsap.set(receiveCards, { y: 24, scale: 0.86, autoAlpha: 0 });
  gsap.set(exchangeCards, {
    top: "82%",
    left: "50%",
    xPercent: -50,
    yPercent: -50,
    rotation: 0,
    autoAlpha: 0
  });

  const receiveTimeline = gsap.timeline({ paused: true });
  receiveTimeline
    .to(receiveCards, {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.18,
      stagger: 0.055,
      ease: "power2.out"
    })
    .call(() => {
      count.textContent = "14장";
    })
    .fromTo(count, { scale: 0.86 }, { scale: 1, duration: 0.2, ease: "power2.out" });

  ScrollTrigger.create({
    trigger: section,
    start: "top 82%",
    once: true,
    onEnter: () => receiveTimeline.play()
  });

  const targets = {
    left: { top: "50%", left: "14%", rotation: -90, opacity: 0.72 },
    top: { top: "20%", left: "50%", rotation: 0, opacity: 1 },
    right: { top: "50%", left: "86%", rotation: 90, opacity: 0.72 }
  };

  button.addEventListener("click", () => {
    button.disabled = true;
    const exchangeTimeline = gsap.timeline();

    exchangeTimeline.to(button, {
      opacity: 0,
      scale: 0.94,
      duration: 0.16,
      ease: "power1.out",
      onComplete: () => {
        button.hidden = true;
      }
    });

    exchangeCards.forEach((card, index) => {
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

    exchangeTimeline
      .to(
        status,
        {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
          onStart: () => status.removeAttribute("aria-hidden")
        },
        0.92
      )
      .call(() => section.classList.add("is-complete"));
  });
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

  const main = document.querySelector("main");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeModal = null;
  let returnFocus = null;
  let lockedScrollY = 0;
  let closeTimer = null;

  const modalFor = (name) =>
    Array.from(document.querySelectorAll("[data-modal]")).find(
      (modal) => modal.dataset.modal === name
    ) || null;

  const lockPage = () => {
    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.classList.add("modal-open");
    if (main) {
      main.inert = true;
    }
  };

  const unlockPage = () => {
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("top");
    if (main) {
      main.inert = false;
    }
    window.scrollTo(0, lockedScrollY);
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
      openModal(opener.dataset.open, opener);
      return;
    }

    const closer = event.target.closest("[data-close-modal]");
    if (closer && activeModal && closer.closest("[data-modal]") === activeModal) {
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
