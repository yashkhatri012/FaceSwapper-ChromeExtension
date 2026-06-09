import { useState } from "react"

import "~style.css"




function IndexPopup() {
  const [status, setStatus] = useState("")
  const [selectionMode, setSelectionMode] = useState(false);
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setStatus("Processing...")
      const base64 = await fileToBase64(file)
      await chrome.storage.local.set({ sourceFace: base64 })
      setStatus("Saved! ✓")

      
    } catch (err) {
      console.error(err)
      setStatus("Error saving file")
    }
  }

    const handleSelectionMode = async ()=>{
      try {
        setSelectionMode(true);
        await chrome.storage.local.set({ selectionMode: true })
      } catch (error) {
        console.error(error)
        
      }
    }

  return (
    <div className="plasmo-w-80 plasmo-p-4">
      <h2 className="plasmo-mb-4 plasmo-text-xl plasmo-font-bold">
        Face Swapper
      </h2>

      <input
        type="file"
        accept="image/*"
        className="plasmo-mb-3 plasmo-w-full"
        onChange={handleImageUpload}
      />

      {status && (
        <p className="plasmo-text-sm plasmo-text-gray-600">{status}</p>
      )}


      <button className="plasmo-border-black plasmo-shadow-xl" onClick={handleSelectionMode}>  Selection Mode</button>
    </div>
  )
}

export default IndexPopup