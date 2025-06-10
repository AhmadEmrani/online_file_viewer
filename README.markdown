# Online File Viewer

A web-based application for uploading, processing, and viewing the contents of various file formats, including DOCX, PDF, PPTX, and audio files, with a focus on converting them to readable text or Markdown.

## Table of Contents

- Features
- Technologies
- Installation
- Usage
- Contributing
- License

## Features

- **File Upload and Processing**: Upload and parse DOCX, PDF, and PPTX files, converting them to text or Markdown for display.
- **Audio Transcription**: Convert audio files to text using the Whisper model (via Python).
- **Markdown Rendering**: Convert extracted text to Markdown and render it as HTML for a clean, formatted display.
- **Responsive Interface**: User-friendly web interface built with EJS for uploading files and viewing content.
- **File Cleanup**: Automatically deletes uploaded files after processing to save server space.

## Technologies

- **Backend**:


- Node.js & Express.js: For handling HTTP requests and file uploads
- Multer: File upload middleware
- Mammoth: DOCX file parsing
- pdf-parse: PDF file text extraction
- pptx2json: PPTX file parsing

# marked & markdown-it: Markdown to HTML conversion

- **Frontend**:
  - EJS: Templating engine for rendering dynamic HTML
  - HTML/CSS: Simple and responsive UI
- **Audio Processing**:
  - Python: For running the Whisper transcription model
  - Whisper: Open-source model for audio-to-text conversion
  - FFmpeg: For handling audio file formats
- **Other**: Child Process (Node.js) for integrating Python scripts

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AhmadEmrani/online_file_viewer.git
   cd online_file_viewer
   ```

2. **Install Node.js dependencies**:

   ```bash
   npm install
   ```

3. **Set up Python environment** (for audio transcription):

   - Ensure Python 3.8+ is installed.
   - Install required Python packages:

     ```bash
     pip install whisper ffmpeg-python
     ```
   - Install FFmpeg on your system:
     - On Windows: Use a package manager like Chocolatey (`choco install ffmpeg`)
     - On macOS: `brew install ffmpeg`
     - On Linux: `sudo apt-get install ffmpeg` (Ubuntu/Debian) or equivalent

4. **Create uploads directory**:

   ```bash
   mkdir uploads
   ```

5. **Start the server**:

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`.

## Usage

1. **Access the application**:

   - Navigate to `http://localhost:3000` in your browser.
   - Use the provided forms to upload DOCX, PDF, PPTX, or audio files.

2. **File Upload**:

   - Select a file (DOCX, PDF, or PPTX) via the upload form.
   - The application processes the file, converts it to text or Markdown, and displays the content as HTML.
   - Example processing for a PDF file:

     ```javascript
     const dataBuffer = fs.readFileSync(filePath);
     pdfParse(dataBuffer).then(result => {
         const rawText = result.text || '';
         const markdown = convertToMarkdown(rawText);
         const htmlContent = marked.parse(markdown);
         res.render('content', { text: htmlContent });
     });
     ```

3. **Audio Transcription**:

   - Upload an audio file (e.g., MP3, WAV) via the voice upload form.
   - The server uses a Python script (`transcribe.py`) with the Whisper model to transcribe the audio to text.
   - The transcribed text is displayed in the browser.

4. **Supported File Types**:

   - Documents: `.docx`, `.pdf`, `.pptx`
   - Audio: Formats supported by FFmpeg (e.g., `.mp3`, `.wav`)

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

Please ensure your code follows the project's coding style and includes appropriate documentation.

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software, provided you include the original copyright and permission notice in any copy of the software or substantial portion of it.

For full details, see the LICENSE file.

---

Built  by AhmadEmrani
