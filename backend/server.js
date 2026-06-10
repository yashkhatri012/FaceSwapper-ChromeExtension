

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import axios from "axios"
import fs from "fs"
import path from "path"

import crypto from "crypto"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json({ limit: "50mb" }))
app.use("/results", express.static("temp/result"))



app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Face Swap API Running"
  })
})





app.post("/api/swap", async (req, res) => {
  try {
    const { sourceFace, targetImageUrl } = req.body

    const id = crypto.randomUUID()
    // path where to save it, craetes temp/target.jpg
    const sourcePath = path.join("temp", "source", `${id}.jpg`)
    const targetPath = path.join("temp", "target", `${id}.jpg`)
    const resultPath = path.join("temp", "result", `${id}.jpg`)

    // Save source image

    const base64Data = sourceFace.replace(
      /^data:image\/\w+;base64,/,
      ""
    )

    await fs.promises.writeFile(
      sourcePath,
      base64Data,
      "base64"
    )

    // Download target image

    const response = await axios({
      url: targetImageUrl,
      method: "GET",
      responseType: "arraybuffer"
    })

    await fs.promises.writeFile(
      targetPath,
      response.data
    )

    console.log("Starting FaceFusion...")
     const FACEFUSION_PATH = process.env.FACEFUSION_PATH
    const FACEFUSION_PYTHON = process.env.FACEFUSION_PYTHON
    const FACEFUSION_MODEL = process.env.FACEFUSION_MODEL || "ghost_3_256"
    const command = `"${FACEFUSION_PYTHON}" facefusion.py headless-run -s "${path.resolve(
        sourcePath
      )}" -t "${path.resolve(
        targetPath
      )}" -o "${path.resolve(
        resultPath
      )}" --processors face_swapper --face-swapper-model "${FACEFUSION_MODEL}"`

     
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: FACEFUSION_PATH ,
        maxBuffer: 1024 * 1024 * 20
      })

      console.log(stdout)

      if (stderr) {
        console.log(stderr)
      }
    return res.status(200).json({
      success: true,
      imageUrl: `http://localhost:5000/results/${id}.jpg`
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: "Swap failed"
    })
  }
})


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})