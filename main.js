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

  const visual = document.querySelector(".hero__visual");
  const dragon = document.querySelector(".hero__dragon");
  const copy = document.querySelector(".hero__copy");
  const lines = gsap.utils.toArray(".hero__line");
  const goal = document.querySelector(".goal");
  const goalIntro = gsap.utils.toArray(".goal__time, .goal__eyebrow");
  const goalCore = document.querySelector(".goal__core");
  const goalWays = gsap.utils.toArray(".goal__way");
  const goalStroke = document.querySelector(".goal__stroke");

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=760%",
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
    );
})();
