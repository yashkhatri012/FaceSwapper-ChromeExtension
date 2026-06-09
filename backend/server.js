

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import axios from "axios"
import fs from "fs"
import path from "path"


dotenv.config()

const app = express()

app.use(cors())

app.use(express.json({ limit: "50mb" }))

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Face Swap API Running"
  })
})



app.post("/api/swap", async (req, res) => {
  try {
    const { sourceFace, targetImageUrl } = req.body

    console.log("Source Length:", sourceFace?.length)
    console.log("Target URL:", targetImageUrl)
    
    // For downloading image
    const response = await axios({
      url: targetImageUrl,
      method: "GET",
      responseType: "arraybuffer"
    })

    // For saving sourceFace
    const base64Data = sourceFace.replace(
            /^data:image\/\w+;base64,/,
            ""
            )

    await fs.promises.writeFile(
    path.join("temp", "source.jpg"),
    base64Data,
    "base64"
    )

console.log("Source image saved")
    // path where to save it, craetes temp/target.jpg
    const imagePath = path.join("temp", "target.jpg")

    await fs.promises.writeFile(imagePath, response.data)

    console.log("Image saved:", imagePath)

    return res.status(200).json({
      success: true,
      downloaded: true
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Download failed"
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})