/**
 * Decodifica uma string base64 para um Uint8Array.
 * @param base64 A string base64 para decodificar.
 * @returns Um Uint8Array com os bytes decodificados.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converte dados de áudio PCM brutos (Int16) em um AudioBuffer para reprodução na web.
 * @param data O array de bytes contendo os dados de áudio PCM.
 * @param ctx O AudioContext a ser usado para criar o buffer.
 * @param sampleRate A taxa de amostragem do áudio (e.g., 24000).
 * @param numChannels O número de canais de áudio (e.g., 1 para mono).
 * @returns Uma promessa que resolve com o AudioBuffer decodificado.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // O áudio vem como PCM de 16 bits (Int16)
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Converte a amostra de Int16 [-32768, 32767] para Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
