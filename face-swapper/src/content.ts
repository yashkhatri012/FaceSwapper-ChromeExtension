import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

let hoveredElement: HTMLElement | null = null
let selectionMode = false


chrome.storage.local.get("selectionMode").then((result) => {
  selectionMode = result.selectionMode ?? false
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectionMode) {
    selectionMode = changes.selectionMode.newValue
  }
})



function isImageElement(element: HTMLElement) {
  if (element.tagName === "IMG") return true

  const backgroundImage =
    window.getComputedStyle(element).backgroundImage

  return backgroundImage !== "none"
}


document.addEventListener("mousemove",  (e) => {
 

  if (!selectionMode) {
    if (hoveredElement) {
     
      hoveredElement = null
    }
    return
  }

  const element = document.elementFromPoint(
    e.clientX,
    e.clientY
  ) as HTMLElement | null

  
  if (!element) return

  if (!isImageElement(element)) return

  if (element === hoveredElement) return

  

  hoveredElement = element

  
})



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
    // const { selectionMode } = await chrome.storage.local.get("selectionMode")

    if (!selectionMode) return

    // const target = e.target as HTMLElement
    const target = hoveredElement

      if (!target) return
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
    e.stopImmediatePropagation()


    const imageId = crypto.randomUUID()

    target.dataset.faceSwapId = imageId

    console.log({
      imageId,
      targetImageUrl
    })

    await chrome.storage.local.set({
      selectionMode: false
    })

    if (hoveredElement) {
      
      hoveredElement = null
    }
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
