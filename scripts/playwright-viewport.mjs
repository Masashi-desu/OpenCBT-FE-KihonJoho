// A Chromium OOPIF can keep its paint/hit region clipped to the headless window
// when only the emulated viewport grows. Keep the owned window larger than it.
export const viewportHelper = `const setViewport=async size=>{
  await page.setViewportSize(size);
  const cdp=await page.context().newCDPSession(page);
  try {
    const {windowId}=await cdp.send('Browser.getWindowForTarget');
    await cdp.send('Browser.setWindowBounds',{windowId,bounds:{width:Math.max(1800,size.width+200),height:Math.max(1800,size.height+200)}});
  } finally {await cdp.detach();}
};`;
