
// Informa ao TypeScript que a propriedade ExifReader existirá no objeto global window.
// Isso é necessário porque a biblioteca é carregada via uma tag <script> no HTML.
declare global {
  interface Window {
    ExifReader: any;
  }
}

/**
 * Aguarda a biblioteca ExifReader ficar disponível no objeto window.
 * Isso é necessário porque ela é carregada a partir de uma tag de script externa.
 * @param timeout O tempo máximo de espera em milissegundos.
 * @returns Uma promessa que resolve quando a biblioteca está pronta, ou rejeita no timeout.
 */
const waitForExifReader = (timeout = 3000): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Verifica se já está disponível
    if (typeof window.ExifReader !== 'undefined') {
      return resolve();
    }

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      if (typeof window.ExifReader !== 'undefined') {
        clearInterval(intervalId);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(intervalId);
        reject(new Error("A biblioteca ExifReader não carregou dentro do tempo limite."));
      }
    }, 100); // Verifica a cada 100ms
  });
};


/**
 * Extrai dados de GPS (latitude e longitude) dos metadados EXIF de um arquivo de imagem.
 * @param file O arquivo de imagem (File object).
 * @returns Uma promessa que resolve para um objeto com lat e lon, ou null se não houver dados de GPS.
 */
export const getGPSData = async (file: File): Promise<{ lat: number; lon: number } | null> => {
  try {
    // Aguarda a biblioteca carregar, com um tempo limite.
    await waitForExifReader();
  } catch (error) {
    // Isso captura o erro de timeout do waitForExifReader.
    console.error("A biblioteca ExifReader não está disponível no objeto window. Verifique se ela foi carregada corretamente.", error);
    return null;
  }
  
  try {
    const tags = await window.ExifReader.load(file);

    const latTag = tags['GPSLatitude'];
    const lonTag = tags['GPSLongitude'];
    const latRef = tags['GPSLatitudeRef'];
    const lonRef = tags['GPSLongitudeRef'];

    if (latTag && lonTag && latRef && lonRef) {
      const lat = convertDMSToDD(latTag.description, latRef.description);
      const lon = convertDMSToDD(lonTag.description, lonRef.description);
      return { lat, lon };
    }

    return null;
  } catch (error) {
    // A biblioteca pode lançar erros para arquivos sem metadados ou corrompidos.
    // Tratamos isso graciosamente em vez de quebrar a aplicação.
    console.warn("Não foi possível ler os dados EXIF da imagem. O arquivo pode estar sem metadados ou corrompido.", error);
    return null;
  }
};

/**
 * Converte coordenadas de Graus, Minutos, Segundos (DMS) para Graus Decimais (DD).
 * @param dms A descrição da tag DMS (e.g., "51, 30, 2.34").
 * @param ref A referência da direção (N, S, E, W).
 * @returns A coordenada em graus decimais.
 */
const convertDMSToDD = (dms: string, ref: string): number => {
    // A descrição vem como uma string separada por vírgulas: "graus, minutos, segundos"
    const parts = dms.split(',').map(part => parseFloat(part.trim()));
    const [degrees, minutes, seconds] = parts;

    let dd = degrees + minutes / 60 + seconds / 3600;

    if (ref === 'S' || ref === 'W') {
        dd = dd * -1;
    }
    
    return dd;
};