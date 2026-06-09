

chrome.runtime.onMessage.addListener(
  async (message, sender, sendResponse) => {
    if (message.action === "SWAP_FACE") {
      console.log("Swap request received")

      const { sourceFace } = await chrome.storage.local.get("sourceFace")
        const imageId = message.imageId
        const targetImageUrl = message.targetImageUrl
      console.log({
        imageId,
        targetImageUrl,
        hasSourceFace: !!sourceFace
        })
    }
  }
)