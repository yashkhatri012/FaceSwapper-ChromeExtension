import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

document.addEventListener(
  "click",
  async (e) => {
    const { selectionMode } =
      await chrome.storage.local.get("selectionMode")

    if (!selectionMode) return

    const target = e.target as HTMLElement

    let targetImageUrl = ""

    if (target.tagName === "IMG") {
      targetImageUrl = (target as HTMLImageElement).src
    } else {
      const backgroundImage =
        window.getComputedStyle(target).backgroundImage

      const match = backgroundImage.match(
        /url\(["']?(.*?)["']?\)/
      )

      if (match) {
        targetImageUrl = match[1]
      }
    }

    if (!targetImageUrl) return

    e.preventDefault()
    e.stopPropagation()

    const imageId = crypto.randomUUID()

    target.dataset.faceSwapId = imageId

    console.log({
      imageId,
      targetImageUrl
    })

    await chrome.storage.local.set({
      selectionMode: false
    })

    const response = await chrome.runtime.sendMessage({
      action: "SWAP_FACE",
      imageId,
      targetImageUrl
    })

    console.log(response)

    if (response?.success) {
      if (target.tagName === "IMG") {
        ;(target as HTMLImageElement).src =
          `${response.imageUrl}?t=${Date.now()}`
      } else {
        target.style.backgroundImage =
          `url("${response.imageUrl}?t=${Date.now()}")`
      }
    }
  },
  true
)