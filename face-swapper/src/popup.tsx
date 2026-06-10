import { useEffect, useState } from "react"

import "~style.css"

function IndexPopup() {
  const [status, setStatus] = useState("")
  const [preview, setPreview] = useState("")
  const [faceLoaded, setFaceLoaded] = useState(false)

  useEffect(() => {
    const loadFace = async () => {
      const { sourceFace } =
        await chrome.storage.local.get("sourceFace")

      if (sourceFace) {
        setPreview(sourceFace)
        setFaceLoaded(true)
      }
    }

    loadFace()
  }, [])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject

      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      setStatus("Processing...")

      const base64 = await fileToBase64(file)

      await chrome.storage.local.set({
        sourceFace: base64
      })

      setPreview(base64)
      setFaceLoaded(true)
      setStatus("Face Saved ✓")
    } catch (error) {
      console.error(error)
      setStatus("Error saving file")
    }
  }

  const handleSelectionMode = async () => {
    try {
      await chrome.storage.local.set({
        selectionMode: true
      })

      setStatus("Click an image on the page")
      window.close()
    } catch (error) {
      console.error(error)
      setStatus("Failed to enable selection mode")
    }
  }

  return (
    <div className="plasmo-w-80 plasmo-p-4">
      <h2 className="plasmo-mb-4 plasmo-text-center plasmo-text-xl plasmo-font-bold">
        Face Swapper
      </h2>

      {preview && (
        <img
          src={preview}
          alt="Face Preview"
          className="plasmo-mx-auto plasmo-mb-4 plasmo-h-24 plasmo-w-24 plasmo-rounded-full plasmo-object-cover plasmo-border"
        />
      )}

      {!preview && (
        <div className="plasmo-mx-auto plasmo-mb-4 plasmo-flex plasmo-h-24 plasmo-w-24 plasmo-items-center plasmo-justify-center plasmo-rounded-full plasmo-border">
          🙂
        </div>
      )}

      {faceLoaded && (
        <p className="plasmo-mb-3 plasmo-text-center plasmo-text-sm plasmo-text-green-600">
          Face Loaded ✓
        </p>
      )}

      <label className="plasmo-mb-3 plasmo-block plasmo-w-full plasmo-cursor-pointer plasmo-rounded-lg plasmo-bg-blue-500 plasmo-py-2 plasmo-text-center plasmo-text-white">
        Upload Face

        <input
          type="file"
          accept="image/*"
          className="plasmo-hidden"
          onChange={handleImageUpload}
        />
      </label>

      <button
        onClick={handleSelectionMode}
        disabled={!faceLoaded}
        className="plasmo-w-full plasmo-rounded-lg plasmo-bg-black plasmo-py-2 plasmo-text-white disabled:plasmo-cursor-not-allowed disabled:plasmo-opacity-50">
        Select Image
      </button>

      {status && (
        <p className="plasmo-mt-3 plasmo-text-center plasmo-text-sm plasmo-text-gray-600">
          {status}
        </p>
      )}
    </div>
  )
}

export default IndexPopup