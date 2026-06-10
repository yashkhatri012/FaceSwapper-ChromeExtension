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
  e.preventDefault()
  e.stopPropagation()
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


  const response = await chrome.runtime.sendMessage({
  action: "SWAP_FACE",
  imageId,
  targetImageUrl: img.src
})

console.log(response)





if (response?.success) {

  const swappedImg = document.createElement("img")

    swappedImg.src = response.imageUrl

    img.replaceWith(swappedImg)
}



},
true
)