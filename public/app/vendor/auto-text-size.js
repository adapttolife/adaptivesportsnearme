/*
 * auto-text-size v0.2.3
 * Copyright (c) 2022 Viktor Qvarfordt
 * Released under the MIT License: https://github.com/sanalabs/auto-text-size/blob/main/LICENSE
 */
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// src/auto-text-size-standalone.ts
function throttleAnimationFrame(func) {
  let wait = false;
  return () => {
    if (!wait) {
      wait = true;
      requestAnimationFrame(() => {
        func();
        wait = false;
      });
    }
  };
}
var antiOverflowAlgo = ({
  fontSizePx,
  minFontSizePx,
  fontSizePrecisionPx,
  updateFontSizePx,
  breakPredicate: breakPred
}) => {
  const maxIterCount = Math.ceil(1 / fontSizePrecisionPx);
  let iterCount = 0;
  while (fontSizePx > minFontSizePx && iterCount < maxIterCount) {
    if (breakPred())
      break;
    fontSizePx = updateFontSizePx(fontSizePx - fontSizePrecisionPx);
    iterCount++;
  }
};
var getContentWidth = (element) => {
  const computedStyle = getComputedStyle(element);
  return element.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
};
var getContentHeight = (element) => {
  const computedStyle = getComputedStyle(element);
  return element.clientHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom);
};
var multilineAlgo = (opts) => {
  opts.innerEl.style.whiteSpace = "nowrap";
  onelineAlgo(opts);
  if (opts.innerEl.scrollWidth > getContentWidth(opts.containerEl)) {
    opts.innerEl.style.whiteSpace = "normal";
  }
};
var onelineAlgo = ({
  innerEl,
  containerEl,
  fontSizePx,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx,
  updateFontSizePx
}) => {
  const maxIterCount = 10;
  let iterCount = 0;
  let prevOverflowFactor = 1;
  while (iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = getContentWidth(containerEl);
    const canGrow = fontSizePx < maxFontSizePx && w0 < w1;
    const canShrink = fontSizePx > minFontSizePx && w0 > w1;
    const overflowFactor = w0 / w1;
    if (prevOverflowFactor === overflowFactor) {
      break;
    }
    if (!(canGrow || canShrink)) {
      break;
    }
    const updatePx = fontSizePx / overflowFactor - fontSizePx;
    const prevFontSizePx = fontSizePx;
    fontSizePx = updateFontSizePx(fontSizePx + updatePx);
    if (Math.abs(fontSizePx - prevFontSizePx) <= fontSizePrecisionPx) {
      break;
    }
    prevOverflowFactor = overflowFactor;
    iterCount++;
  }
  antiOverflowAlgo({
    fontSizePx,
    minFontSizePx,
    updateFontSizePx,
    fontSizePrecisionPx,
    breakPredicate: () => innerEl.scrollWidth <= getContentWidth(containerEl)
  });
};
var boxAlgo = ({
  innerEl,
  containerEl,
  fontSizePx,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx,
  updateFontSizePx
}) => {
  const maxIterCount = 100;
  fontSizePx = updateFontSizePx((maxFontSizePx - minFontSizePx) * 0.5);
  let updatePx = (maxFontSizePx - minFontSizePx) * 0.25;
  let iterCount = 0;
  while (updatePx > fontSizePrecisionPx && iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = getContentWidth(containerEl);
    const h0 = innerEl.scrollHeight;
    const h1 = getContentHeight(containerEl);
    if (w0 === w1 && h0 === h1)
      break;
    if (fontSizePx < maxFontSizePx && w0 <= w1 && h0 <= h1) {
      fontSizePx = updateFontSizePx(fontSizePx + updatePx);
    } else if (fontSizePx > minFontSizePx && (w0 > w1 || h0 > h1)) {
      fontSizePx = updateFontSizePx(fontSizePx - updatePx);
    }
    updatePx *= 0.5;
    iterCount++;
  }
  antiOverflowAlgo({
    fontSizePx,
    minFontSizePx,
    updateFontSizePx,
    fontSizePrecisionPx,
    breakPredicate: () => innerEl.scrollWidth <= getContentWidth(containerEl) && innerEl.scrollHeight <= getContentHeight(containerEl)
  });
};
function updateTextSize({
  innerEl,
  containerEl,
  mode = "multiline",
  minFontSizePx = 8,
  maxFontSizePx = 160,
  fontSizePrecisionPx = 0.1
}) {
  const t0 = performance.now();
  if (!isFinite(minFontSizePx)) {
    throw new Error(`Invalid minFontSizePx (${minFontSizePx})`);
  }
  if (!isFinite(minFontSizePx)) {
    throw new Error(`Invalid maxFontSizePx (${maxFontSizePx})`);
  }
  if (!isFinite(fontSizePrecisionPx) || fontSizePrecisionPx === 0) {
    throw new Error(`Invalid fontSizePrecisionPx (${fontSizePrecisionPx})`);
  }
  if (containerEl.children.length > 1) {
    console.warn(
      `AutoTextSize has ${containerEl.children.length - 1} siblings. This may interfere with the algorithm.`
    );
  }
  const containerStyles = {
    // Necessary to correctly compute the dimensions `innerEl`.
    display: "flex",
    alignItems: "start"
  };
  const innerStyles = {
    display: "block"
    // Necessary to compute dimensions.
  };
  if (mode === "oneline") {
    innerStyles.whiteSpace = "nowrap";
  } else if (mode === "multiline") {
    innerStyles.wordBreak = "break-word";
  } else if (mode === "box") {
    innerStyles.whiteSpace = "pre-wrap";
    innerStyles.wordBreak = "break-word";
  } else if (mode === "boxoneline") {
    innerStyles.whiteSpace = "nowrap";
  }
  Object.assign(containerEl.style, containerStyles);
  Object.assign(innerEl.style, innerStyles);
  const fontSizeStr = window.getComputedStyle(innerEl, null).getPropertyValue("font-size");
  let fontSizePx = parseFloat(fontSizeStr);
  let iterations = 0;
  const updateFontSizePx = (px) => {
    px = Math.min(Math.max(px, minFontSizePx), maxFontSizePx);
    fontSizePx = px;
    innerEl.style.fontSize = `${fontSizePx}px`;
    iterations++;
    return fontSizePx;
  };
  if (fontSizePx > maxFontSizePx || fontSizePx < minFontSizePx) {
    updateFontSizePx(fontSizePx);
  }
  const algoOpts = {
    innerEl,
    containerEl,
    fontSizePx,
    minFontSizePx,
    maxFontSizePx,
    fontSizePrecisionPx,
    updateFontSizePx
  };
  if (mode === "oneline") {
    onelineAlgo(algoOpts);
  } else if (mode === "multiline") {
    multilineAlgo(algoOpts);
  } else if (mode === "box") {
    boxAlgo(algoOpts);
  } else if (mode === "boxoneline") {
    boxAlgo(algoOpts);
  }
}
function autoTextSize({
  innerEl,
  containerEl,
  mode,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx
}) {
  let containerDimensions = void 0;
  const throttledUpdateTextSize = throttleAnimationFrame(() => {
    updateTextSize({
      innerEl,
      containerEl,
      mode,
      maxFontSizePx,
      minFontSizePx,
      fontSizePrecisionPx
    });
    containerDimensions = [
      getContentWidth(containerEl),
      getContentHeight(containerEl)
    ];
  });
  const resizeObserver = new ResizeObserver(() => {
    const prevContainerDimensions = containerDimensions;
    containerDimensions = [
      getContentWidth(containerEl),
      getContentHeight(containerEl)
    ];
    if ((prevContainerDimensions == null ? void 0 : prevContainerDimensions[0]) !== containerDimensions[0] || (prevContainerDimensions == null ? void 0 : prevContainerDimensions[1]) !== containerDimensions[1]) {
      throttledUpdateTextSize();
    }
  });
  resizeObserver.observe(containerEl);
  throttledUpdateTextSize.disconnect = () => resizeObserver.disconnect();
  return throttledUpdateTextSize;
}

export { autoTextSize, updateTextSize };
