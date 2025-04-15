const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');  
const pdfParse = require('pdf-parse');
const pptx2json = require('pptx2json');
const { spawn } = require('child_process');
const { marked } = require('marked');

const markdownIt = require('markdown-it'); // برای تبدیل به markdown

const app = express();
const port = 3000;




const convertToMarkdown = (text) => {
  if (!text || typeof text !== 'string') return '';

  let markdownText = text;

  // پاک‌سازی اولیه
  markdownText = markdownText.replace(/\r\n/g, '\n').replace(/\t/g, '    '); // تب به اسپیس و خط‌ جدید یکسان

  // حذف فضاهای خالی اول و آخر
  markdownText = markdownText.trim();

  // تشخیص تیترهای بزرگ – معمولاً خط‌هایی که فقط چند کلمه هستند و با حروف بزرگ شروع می‌شوند
  markdownText = markdownText.replace(/^([A-Z][^\n]{0,50})\n/gm, '## $1\n');

  // تشخیص تیترهای عدددار (مانند 1. مقدمه)
  markdownText = markdownText.replace(/^\d{1,2}\.\s+(.+)$/gm, '### $1');

  // تشخیص لیست‌های unordered (مانند • یا - یا *)
  markdownText = markdownText.replace(/^[•\-*]\s+(.+)$/gm, '- $1');

  // تشخیص لیست‌های ordered
  markdownText = markdownText.replace(/^\s*(\d+)[\.\)]\s+(.+)$/gm, '$1. $2');

  // بولد (ساده‌ترین حالت: متن‌هایی که بین ** یا __ هستند یا نوشته‌های ALL CAPS کوتاه)
  markdownText = markdownText.replace(/\*\*(.*?)\*\*/g, '**$1**');
  markdownText = markdownText.replace(/__(.*?)__/g, '**$1**');
  markdownText = markdownText.replace(/\b([A-Z]{3,})\b/g, '**$1**');

  // تشخیص ایتالیک (به صورت ساده)
  markdownText = markdownText.replace(/\*(.*?)\*/g, '*$1*');

  // حذف فاصله‌های بیش از حد
  markdownText = markdownText.replace(/\n{3,}/g, '\n\n');

  // فاصله استاندارد بین پاراگراف‌ها
  markdownText = markdownText.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');

  return markdownText;
};


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

      const sendMarkdown = (markdown) => {
        fs.unlink(filePath, () => {});  // حذف فایل پس از پردازش
        
        res.render('content', { text: markdown || 'No content found.' });
      };
      const md = new markdownIt();
      if (ext === '.docx') {
        mammoth.convertToMarkdown({ path: filePath })
        .then(result => {
          const markdown = result.value ? result.value.trim() : '';
          if (!markdown) {
            return res.status(400).send('No meaningful content found in the document.');
          }
    
          // رندر مارک‌داون به HTML
          const htmlContent = md.render(markdown);
    
          // ارسال HTML به صفحه
          sendMarkdown(htmlContent);
        })
        .catch(err => {
          console.error('Error processing Word file:', err);
          res.status(500).send('Error processing Word file.');
        });
      } else if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        pdfParse(dataBuffer)
        .then(result => {
          const rawText = result.text || result.value || '';
          const md = convertToMarkdown(rawText);
    
          const htmlContent = marked.parse(md); // ✅ تبدیل Markdown به HTML
          sendMarkdown(htmlContent);  
        })
          .catch(err => {
            console.error('PDF Parse Error:', err);
            res.status(500).send('Error processing PDF file.');
          });
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
