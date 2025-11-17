
// Informa ao TypeScript que a propriedade ExifReader existirá no objeto global window.
// Isso é necessário porque a biblioteca é carregada via uma tag <script> no HTML.
declare global {
  interface Window {
    ExifReader: any;
  }
}

/**
 * Extrai dados de GPS (latitude e longitude) dos metadados EXIF de um arquivo de imagem.
 * @param file O arquivo de imagem (File object).
 * @returns Uma promessa que resolve para um objeto com lat e lon, ou null se não houver dados de GPS.
 */
export const getGPSData = async (file: File): Promise<{ lat: number; lon: number } | null> => {
  // Verificação de segurança para garantir que a biblioteca foi carregada.
  if (typeof window.ExifReader === 'undefined') {
    console.error("ExifReader library is not available on the window object. Please ensure it's loaded correctly.");
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
    console.warn("Could not read EXIF data from the image. It might be missing or corrupted.", error);
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
