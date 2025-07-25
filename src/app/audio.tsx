let audioCtx: AudioContext | null = null;
let isPlaying = false;
const audioQueue: Float32Array[] = [];
let keepAliveInterval: NodeJS.Timeout | null = null;

export function initAudio() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext({ sampleRate: 22050 });
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let partialChunk = new Uint8Array(0);

export function playPCMChunk(chunk: Uint8Array) {
  const ctx = audioCtx;
  if (!ctx) {
    return;
  }

  const combined = new Uint8Array(partialChunk.length + chunk.length);
  combined.set(partialChunk, 0);
  combined.set(chunk, partialChunk.length);

  const validLength = combined.length - (combined.length % 2);
  const usable = combined.subarray(0, validLength);

  const remaining = combined.length % 2;
  if (remaining) {
    partialChunk = combined.subarray(validLength);
  } else {
    partialChunk = new Uint8Array(0);
  }

  const view = new DataView(usable.buffer, usable.byteOffset, usable.byteLength);
  const samples = usable.length / 2;
  const floatData = new Float32Array(samples);

  for (let i = 0; i < samples; i++) {
    const int16 = view.getInt16(i * 2, true); // little endian
    floatData[i] = int16 / 32768;
  }

  audioQueue.push(floatData);
  if (!isPlaying) {
    isPlaying = true;
    processQueue();
  }
}



function processQueue() {
  const ctx = audioCtx;
  if (!ctx || audioQueue.length === 0) {
    isPlaying = false;
    return;
  }

  const floatData = audioQueue.shift()!;
  const buffer = ctx.createBuffer(1, floatData.length, ctx.sampleRate);
  buffer.getChannelData(0).set(floatData);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();

  source.onended = processQueue;
}

export function getMutedState(): boolean {
  let ctx = initAudio();
  return ctx.state === 'suspended' || ctx.state === 'closed';
}

export function enableAudio() {
  let ctx = initAudio();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  const silence = ctx.createBufferSource();
  silence.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  silence.connect(ctx.destination);
  silence.start();

  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  keepAliveInterval = setInterval(() => {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const silence = ctx.createBufferSource();
    silence.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    silence.connect(ctx.destination);
    silence.start();
  }
  , 10000);
}

export function disableAudio() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  isPlaying = false;
  audioQueue.length = 0;
  partialChunk = new Uint8Array(0);
}