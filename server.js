const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');  // موتور قالب

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
  
  // استفاده از upload.any() برای دریافت هر فیلد
  const upload = multer({ storage: storage });
  
  app.use(express.urlencoded({ extended: true }));
  
  // فرم آپلود فایل
  app.get('/', (req, res) => {
    res.render('index');
  });
  
  // دریافت و تبدیل فایل به متن
  app.post('/upload', upload.any(), (req, res) => {
    // نمایش اطلاعات فایل‌ها
    console.log(req.files);  // مشاهده فایل‌های ارسال شده
  
    if (req.files && req.files.length > 0) {
      // فقط اولین فایل را پردازش می‌کنیم
      const filePath = req.files[0].path;
  
      mammoth.extractRawText({ path: filePath })
        .then(result => {
          const text = result.value;
  
          // حذف فایل بعد از استخراج (اختیاری)
          fs.unlink(filePath, () => {});
  
          res.render('content', { text: text });
        })
        .catch(err => {
          res.status(500).send('خطا در پردازش فایل');
        });
    } else {
      res.status(400).send('هیچ فایلی ارسال نشده است.');
    }
  });
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
