/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, ExternalLink, Github } from 'lucide-react';
import { downloadPythonScript } from '../../utils/detectorPipeline';

export const RepoCodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'read_js' | 'capture_js' | 'html_index'>('python');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    python: `# ==============================================================================
# ALPR Production Pipeline (OpenCV + EasyOCR + Regex Classification)
# Reference: https://github.com/dataslayermedia/License-Plate-Detection.git
# ==============================================================================
import cv2
import numpy as np
import easyocr
import re
import sys

def detect_and_recognize_plate(image_path: str):
    # 1. Read input image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot load image at {image_path}")
    h, w = img.shape[:2]

    # 2. Grayscale & Bilateral Denoising (edge-preserving)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, d=11, sigmaColor=17, sigmaSpace=17)

    # 3. Canny Edge Detection & Rectangular Morphological Kernel
    edges = cv2.Canny(denoised, 30, 200)
    rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 3))
    morph = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, rect_kernel)

    # 4. Find Contours with Aspect Ratio Filter (2.2 ~ 6.0)
    contours, _ = cv2.findContours(morph, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

    plate_box = None
    for cnt in contours:
        bx, by, bw, bh = cv2.boundingRect(cnt)
        aspect = float(bw) / bh
        if 2.2 <= aspect <= 6.0 and bw > w * 0.15:
            plate_box = (bx, by, bw, bh)
            break

    if plate_box is None:
        # Centered Bumper ROI fallback
        plate_box = (int(w * 0.35), int(h * 0.60), int(w * 0.30), int(h * 0.10))

    bx, by, bw, bh = plate_box

    # 5. Dynamic Padded Crop (-15, +35) - dataslayermedia formula
    crop_x1 = max(0, bx - 15)
    crop_y1 = max(0, by - 15)
    crop_x2 = min(w, bx + bw + 35)
    crop_y2 = min(h, by + bh + 35)
    roi = img[crop_y1:crop_y2, crop_x1:crop_x2]

    # 6. OCR Recognition (EasyOCR Korean + English)
    reader = easyocr.Reader(['ko', 'en'])
    results = reader.readtext(roi)
    plate_text = " ".join([res[1] for res in results]).strip()

    # 7. Regex Formatting & Verification
    clean_text = re.sub(r'[^A-Za-z0-9가-힣]', '', plate_text)
    is_valid_korean = bool(re.match(r'^\\d{2,3}[가-힣]\\d{4}$', clean_text))
    is_valid_global = bool(re.search(r'[A-Z0-9]{5,}', clean_text))

    print(f"[SUCCESS] Recognized Plate: {plate_text} (Valid: {is_valid_korean or is_valid_global})")
    return plate_text, plate_box

if __name__ == "__main__":
    detect_and_recognize_plate("sample_car.png")
`,
    read_js: `// ==============================================================================
// read_license_plate.js (from dataslayermedia/License-Plate-Detection)
// Google Cloud Vision Text Detection & HTML Template Injection
// ==============================================================================
const vision = require('@google-cloud/vision');
const fs = require('fs');

async function setEndpoint() {
    // Specifies the location of the api endpoint
    const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };

    // Creates a client
    const client = new vision.ImageAnnotatorClient(clientOptions);

    // Performs text detection on the image file
    const [result] = await client.textDetection('./images/cali.jpg');
    const labels = result.textAnnotations;
    console.log('Text:');

    labels.forEach(function (a, b) {
        // Regex pattern: 5 or more uppercase alphanumeric characters
        if (/[A-Z0-9]{5,}/.test(a.description)) {
            var license_number = a.description.match(/[A-Z0-9]{5,}/)[0];
            console.log("Detected Plate:", license_number);

            var data = fs.readFileSync('./html/index.html', 'utf-8');
            var newValue = data.replace(/class="license">.*?</gim, 'class="license">' + license_number + '<');
            fs.writeFileSync('./html/index.html', newValue, 'utf-8');
            console.log('readFileSync complete');
        }
    });
}

setEndpoint();
`,
    capture_js: `// ==============================================================================
// image-capture.js (from dataslayermedia/License-Plate-Detection)
// Real-time camera capture loop using libcamera-jpeg + Vision OCR
// ==============================================================================
const { exec } = require('child_process');
const vision = require('@google-cloud/vision');
const fs = require('fs');

var takeStill = function () {
    // Hardware camera still capture on Raspberry Pi / Linux
    var child = exec('libcamera-jpeg -n -o ./images/realtime.jpg --shutter 5000000 --gain 0.5 --width 700 --height 500');

    child.stdout.on('data', function (data) {
        console.log('child process exited with code ' + data);
    });

    child.on('exit', function (code, signal) {
        console.log('Image Capture   ' + Date.now());

        async function setEndpoint() {
            const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };
            const client = new vision.ImageAnnotatorClient(clientOptions);

            const [result] = await client.textDetection('./images/Cars1.png');
            const labels = result.textAnnotations;

            var license_number = null;
            labels.forEach(function (a, b) {
                if (b == 0) {
                    license_number = a.description;
                }
            });

            var html = "";
            if (license_number == null) {
                license_number = "None Detected";
            } else {
                license_number = license_number.split(/\\n|\\r|\\t/g);
                for (var i = 0; i < license_number.length; i++) {
                    // Highlight match with <mark> tags
                    if (/\\w{2,5}\\s{1,2}\\w{2,5}$/gi.test(license_number[i]) && /\\d+/gi.test(license_number[i])) {
                        html += "<mark>" + license_number[i] + "</mark><br>";
                    } else {
                        html += license_number[i] + "<br>";
                    }
                }
            }

            var data = fs.readFileSync('./html/index.html', 'utf-8');
            var newValue = data.replace(/class="license">.*?<\\.h3>/gi, 'class="license">' + html + '</h3>');
            fs.writeFileSync('./html/index.html', newValue, 'utf-8');
            console.log('readFileSync complete');

            // Recursive continuous scan loop
            takeStill();
        }

        setEndpoint();
    });
};

takeStill();
`,
    html_index: `<!-- ==============================================================================
     html/index.html (from dataslayermedia/License-Plate-Detection)
     In-browser TensorFlow.js AutoML Object Detection + Tesseract.js Worker
============================================================================== -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.12.0/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-automl@1.3.0/dist/tf-automl.min.js"></script>
<script src="https://unpkg.com/tesseract.js@2.1.4/dist/tesseract.min.js"></script>

<table class="table">
  <thead>
    <tr>
      <th>Original Image</th>
      <th>License Plate Detected (Cropped)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img id="license-plate-image" src="./images/Cars1.png"></td>
      <td><canvas id="canvas"></canvas></td>
    </tr>
    <tr>
      <th>Google Vision Detected</th>
      <td><h3 class="license">PG MN112</h3></td>
    </tr>
    <tr>
      <th>Tesseract.js OCR</th>
      <td><h3 class="tesseract"></h3></td>
    </tr>
  </tbody>
</table>

<script>
async function run() {
    // 1. Localize Plate with AutoML Object Detection
    const model = await tf.automl.loadObjectDetection('./model/model.json');
    const img = document.getElementById('license-plate-image');
    const predictions = await model.detect(img, { score: 0.5, iou: 0.5, topk: 20 });

    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");

    // Dynamic padding formula from repository
    if (predictions && predictions[0]) {
        var left = predictions[0].box.left - 15;
        var top = predictions[0].box.top - 15;
        var width = predictions[0].box.width + 35;
        var height = predictions[0].box.height + 35;
        ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
    }

    // 2. In-browser OCR using Tesseract Worker
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({ tessedit_pageseg_mode: 13 });

    const imgData = c.toDataURL("image/png");
    const result = await worker.recognize(imgData);
    document.querySelector(".tesseract").innerText = result.data.text;
    await worker.terminate();
}
run();
</script>
`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-700/50 flex items-center justify-center text-sky-400">
            <Github className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                dataslayermedia/License-Plate-Detection 원본 소스 및 파이썬 파이프라인
              </h3>
              <a
                href="https://github.com/dataslayermedia/License-Plate-Detection.git"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
              >
                GitHub 저장소
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              AutoML 객체 검출 모델, Google Cloud Vision 연동, Tesseract.js 워커, OpenCV 파이프라인 전체 코드
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '복사 완료' : '코드 복사'}
          </button>

          <button
            onClick={() => downloadPythonScript()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            파이썬 스크립트 (.py) 다운로드
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('python')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'python'
              ? 'border-sky-500 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          Python ALPR 파이프라인 (OpenCV + EasyOCR)
        </button>

        <button
          onClick={() => setActiveTab('read_js')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'read_js'
              ? 'border-sky-500 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-sky-400" />
          read_license_plate.js (Cloud Vision API)
        </button>

        <button
          onClick={() => setActiveTab('capture_js')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'capture_js'
              ? 'border-sky-500 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          image-capture.js (카메라 루프)
        </button>

        <button
          onClick={() => setActiveTab('html_index')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'html_index'
              ? 'border-sky-500 text-sky-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-purple-400" />
          html/index.html (TF.js + Tesseract.js)
        </button>
      </div>

      {/* Code Display */}
      <pre className="p-4 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[360px] leading-relaxed">
        <code>{codeSnippets[activeTab]}</code>
      </pre>
    </div>
  );
};
