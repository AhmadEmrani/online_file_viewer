import sys
import whisper
import os
import subprocess
file_path = sys.argv[1]

sys.stdout.reconfigure(encoding='utf-8')

print("FILE EXISTS? " + str(os.path.exists(file_path)) + " - " + file_path)


subprocess.run(["ffmpeg", "-version"])

model = whisper.load_model("base")  # یا "small", "medium", "large"
result = model.transcribe(file_path)
with open("output.txt", "w", encoding="utf-8") as f:
    f.write(result["text"])
print("Text written to output.txt")

print(result["text"])
