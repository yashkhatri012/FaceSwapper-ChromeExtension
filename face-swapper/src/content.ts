import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

function showLoading(element: HTMLElement) {
  const rect = element.getBoundingClientRect()

  const overlay = document.createElement("div")

  overlay.id = `face-swap-loading-${Date.now()}`

  Object.assign(overlay.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    background: "rgba(0,0,0,0.6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    zIndex: "999999999",
    pointerEvents: "none"
  })

  overlay.textContent = "Swapping Face..."

  document.body.appendChild(overlay)

  return overlay
}

function hideLoading(overlay: HTMLElement | null) {
  overlay?.remove()
}

document.addEventListener(
  "click",
  async (e) => {
    const { selectionMode } = await chrome.storage.local.get("selectionMode")

    if (!selectionMode) return

    const target = e.target as HTMLElement

    let targetImageUrl = ""

    if (target.tagName === "IMG") {
      targetImageUrl = (target as HTMLImageElement).src
    } else {
      const backgroundImage = window.getComputedStyle(target).backgroundImage

      const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/)

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

    const loadingOverlay = showLoading(target)

    
    try {
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
    } else {
      console.error("Face swap failed", response)
    }
  } catch (error) {
    console.error("Face swap error", error)
  } finally {
    hideLoading(loadingOverlay)
  }


  },
  true
)
