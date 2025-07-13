import fastapi as f
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, Response
import wave
import uvicorn
import piper
import os
import io

app = f.FastAPI()
PORT = int(os.getenv('PORT', 5000))

voice_name = os.getenv("PIPER_VOICE")
assert voice_name is not None, "PIPER_VOICE environment variable must be set"
voice = piper.PiperVoice.load(
    f"/app/{voice_name}.onnx", 
    f"/app/{voice_name}.onnx.json"
)

def predict_stream(text: str):
    SR = voice.config.sample_rate
    FORMAT = 2
    CHANNELS = 1
    for chunk in voice.synthesize_stream_raw(text):
        yield chunk

class PredictRequestProps(BaseModel):
    text: str

@app.post("/predict")
def predict(props: PredictRequestProps):
    text = props.text
        
    return StreamingResponse(
        predict_stream(text),
        media_type="audio/L16",
    )

@app.get("/predict-static")
def predict(request: f.Request, text: str):
    with io.BytesIO() as wav_buffer:
        wav_file = wave.Wave_write(wav_buffer)
        voice.synthesize(text, wav_file)
        return Response(content=wav_buffer.getvalue(), media_type="audio/wav", headers={
            "Content-Disposition": f'attachment; filename="prediction.wav"'
        })

if __name__ == "__main__":
    uvicorn.run(app, port=PORT, host="0.0.0.0")