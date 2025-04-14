const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');  
const pdfParse = require('pdf-parse');
const pptx2json = require('pptx2json');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// تنظیم فولدر views برای استفاده از EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// تنظیم محل ذخیره فایل‌ها
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));

// فرم آپلود فایل
app.get('/', (req, res) => {
    res.render('index');
});

// دریافت و تبدیل فایل به متن
app.post('/upload', upload.any(), (req, res) => {
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();

      const sendText = (text) => {
        fs.unlink(filePath, () => {});  // حذف فایل پس از پردازش
        res.render('content', { text: text || 'No text found.' });
      };

      if (ext === '.docx') {
        mammoth.extractRawText({ path: filePath })
          .then(result => sendText(result.value))
          .catch(err => res.status(500).send('Error processing Word file.'));
      } else if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        pdfParse(dataBuffer)
          .then(data => sendText(data.text))
          .catch(err => res.status(500).send('Error processing PDF file.'));
      } else if (ext === '.pptx') {
        pptx2json.parse(filePath, (err, result) => {
          if (err) {
            return res.status(500).send('Error processing PPTX file.');
          }

          const slides = result.slides || [];
          const text = slides.map(slide => slide.text).join('\n\n');
          sendText(text);
        });
      } else {
        res.status(400).send('Unsupported file type.');
      }
    } else {
      res.status(400).send('No file uploaded.');
    }
  });

// پردازش فایل صوتی
app.post('/upload_voice', upload.single('audioFile'), (req, res) => {
    const filePath = req.file.path;

    const python = spawn('python', ['transcribe.py', filePath]);

    let transcription = '';
    python.stdout.on('data', (data) => {
      transcription += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
      fs.unlink(filePath, () => {}); // حذف فایل
      res.render('contentVoice', { text: transcription });
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
