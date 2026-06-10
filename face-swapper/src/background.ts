


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SWAP_FACE") {
    handleSwap(message).then((data)=>{
      sendResponse(data)
    })
    return true
  }
})

async function handleSwap(message: any) {
  try {
    const { sourceFace } = await chrome.storage.local.get("sourceFace")

    const response = await fetch("http://localhost:5000/api/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceFace,
        targetImageUrl: message.targetImageUrl
      })
    })

    const data = await response.json()

    console.log("Backend Response:", data)
    return data
  } catch (error) {
    console.error(error)
  }
}