import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

document.addEventListener("click", async (e) => {
  const { selectionMode } =
    await chrome.storage.local.get("selectionMode")

  if (!selectionMode) return

  const target = e.target as HTMLElement

  if (target.tagName !== "IMG") return

  const img = target as HTMLImageElement

  const imageId = crypto.randomUUID()

  img.dataset.faceSwapId = imageId

  console.log({
    imageId,
    src: img.src
  })

  await chrome.storage.local.set({
    selectionMode: false
  })


  chrome.runtime.sendMessage({
  action: "SWAP_FACE",
  imageId,
  targetImageUrl: img.src
})
})