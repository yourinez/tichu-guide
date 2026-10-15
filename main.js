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
  const rankReferenceLabels = gsap.utils.toArray(".rank-reference-label");
  const quickReferenceBar = document.querySelector(".quick-reference-bar");

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
      quickReferenceBar,
      {
        autoAlpha: 1,
        duration: 0.35,
        ease: "power1.out"
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
      rankReferenceLabels,
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out"
      },
      11.12
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
    .to(shell, { backgroundColor: "#24100e", duration: 0.7, ease: "none" }, 2.25)
    .to(shell, { backgroundColor: "#26150f", duration: 0.8, ease: "none" }, 5.45);
})();

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    return { unlock };
  };
})();

(() => {
  "use strict";

  const gameStart = document.querySelector(".game-start");

  if (gameStart) {
    if (!("IntersectionObserver" in window)) {
      gameStart.querySelectorAll(".game-start__direction path").forEach((path) => {
        path.style.setProperty("--arrow-path-length", `${path.getTotalLength()}px`);
        path.style.setProperty("--arrow-head-length", `${path.getTotalLength()}px`);
      });
      gameStart.classList.add("is-visible");
    } else {
      const directionObserver = new IntersectionObserver(
        (entries, observer) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            const [line, head] = gameStart.querySelectorAll(".game-start__direction path");
            line.style.setProperty("--arrow-path-length", `${line.getTotalLength()}px`);
            head.style.setProperty("--arrow-head-length", `${head.getTotalLength()}px`);
            gameStart.classList.add("is-visible");
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );

      directionObserver.observe(gameStart);
    }
  }
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
  const progressGate = window.createTichuProgressGate?.(section);
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
    progressGate?.unlock();
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

  window.tichuGameState = window.tichuGameState || {};
  window.tichuGameState.largeTichuDeclared = Boolean(window.tichuGameState.largeTichuDeclared);

  const section = document.querySelector(".large-tichu");

  if (!section) {
    return;
  }

  const buttons = Array.from(section.querySelectorAll("[data-large-tichu-choice]"));
  const feedback = section.querySelector(".large-tichu__feedback");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const messages = {
    declare: "선언 완료! 반드시 내가 1등으로 비워야 해요\u00a0🔥",
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
    gsap.set(controls, {
      yPercent: 0,
      y: () => entryY() + 80,
      pointerEvents: "none"
    });

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
      .to(controls, { y: 42, autoAlpha: 1, duration: 0.44, ease: "power2.out" }, 1.1)
      .to(title, { y: -205, scale: 0.62, duration: 0.42 }, 1.58)
      .to(question, { y: -122, duration: 0.42 }, 1.58)
      .to(deadline, { y: -48, duration: 0.42 }, 1.58)
      .set(controls, { pointerEvents: "auto" }, 1.54)
      .to({}, { duration: 0.08 });
  }

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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progressGate = window.createTichuProgressGate?.(section);

  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    section.classList.add("is-static");
    status.removeAttribute("aria-hidden");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  count.textContent = "8장";
  gsap.set(receiveCards, { y: 24, scale: 0.86, autoAlpha: 0 });
  gsap.set(outgoingCards, {
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

  button.addEventListener("click", () => {
    progressGate?.unlock();
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
      .call(() => section.classList.add("is-complete"));
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
  const feedback = section.querySelector(".large-tichu__feedback");
  const eligibility = section.querySelector(".small-tichu__eligibility");
  const blockedSub = section.querySelector(".small-tichu__blocked-sub");
  const difference = section.querySelector(".small-tichu__difference");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const messages = {
    declare: "선언 완료! 내가 1등으로 비우면 +100\u00a0🔥",
    pass: "패스! 편하게 플레이해요"
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
    gsap.set(controls, {
      yPercent: 0,
      y: () => entryY() + 80,
      pointerEvents: "none"
    });

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
      .to(controls, { y: 42, autoAlpha: 1, duration: 0.44, ease: "power2.out" }, 1.1)
      .to(title, { y: -205, scale: 0.62, duration: 0.42 }, 1.58)
      .to(question, { y: -122, duration: 0.42 }, 1.58)
      .to(deadline, { y: -48, duration: 0.42 }, 1.58)
      .set(controls, { pointerEvents: "auto" }, 1.54)
      .to({}, { duration: 0.08 });
  }

  const selectChoice = (choice) => {
    if (choice === "declare" && window.tichuGameState?.largeTichuDeclared) {
      return;
    }

    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.smallTichuChoice === choice));
    });

    feedback.classList.remove("is-visible", "is-declare");

    if (window.tichuGameState?.largeTichuDeclared) {
      feedback.textContent = "";
      return;
    }

    feedback.textContent = messages[choice];
    feedback.classList.toggle("is-declare", choice === "declare");

    window.requestAnimationFrame(() => {
      feedback.classList.add("is-visible");
    });
  };

  const syncLargeTichuState = (declared) => {
    section.classList.toggle("is-large-declared", declared);
    declareButton.disabled = declared;
    blockedSub.hidden = !declared;
    eligibility.textContent = declared
      ? "이미 라지 티츄를 외쳤어요!"
      : "라지 티츄를 외치지 않았다면, 지금 스몰 티츄를 외칠 수 있어요!";
    difference.textContent = declared
      ? "실제로 라지 티츄를 외치지 않았다면, 스몰 티츄를 외칠 수 있어요"
      : "라지 티츄(+200)보다 작지만, 교환까지 패를 다 보고 결정할 수 있어요.";

    if (declared) {
      buttons.forEach((button) => button.setAttribute("aria-pressed", "false"));
      feedback.classList.remove("is-visible", "is-declare");
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
        scrollTrigger: {
          trigger: gameStart,
          start: () => `top top+=${quickReferenceBar?.offsetHeight ?? 0}`,
          end: "+=150%",
          pin: true,
          pinSpacing: true,
          scrub: 0.55,
          invalidateOnRefresh: true
        }
      })
      .to(
        gameStart.querySelector(".game-start__content"),
        {
          y: () => -Math.max(window.innerHeight, 560) * 0.16,
          opacity: 0,
          duration: 0.25,
          ease: "none"
        },
        0.75
      )
      .to(
        gameStart.querySelector(".game-start__direction"),
        {
          y: () => -Math.max(window.innerHeight, 560) * 0.12,
          opacity: 0,
          duration: 0.25,
          ease: "none"
        },
        0.75
      )
      .fromTo(
        cardSequence.querySelector(".play-card-sequence__caption"),
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: "none" },
        0.75
      )
      .fromTo(
        cardSequence.querySelector(".play-card-sequence__pile"),
        { y: 52, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: "none" },
        0.82
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
