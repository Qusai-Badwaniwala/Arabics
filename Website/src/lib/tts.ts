export const canSpeak =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

// getVoices() is empty until the engine has loaded them, which on Android can
// be after first paint. Warming it here means the first tap gets a real answer
// about whether an Arabic voice exists, instead of a wrong one.
if (canSpeak) {
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', () => {
    speechSynthesis.getVoices();
  });
}

function arabicVoice(): SpeechSynthesisVoice | undefined {
  return speechSynthesis.getVoices().find((v) => v.lang.startsWith('ar'));
}

/**
 * Speaks Arabic if the device can. Returns false when no Arabic voice is
 * installed — the caller says so out loud rather than letting an English voice
 * mangle the word, which teaches the wrong sound.
 */
export function speak(text: string): boolean {
  if (!canSpeak) return false;
  const voice = arabicVoice();
  if (!voice) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
}
