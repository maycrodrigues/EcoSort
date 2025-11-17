// @ts-nocheck - ExifReader is loaded from a script tag and won't be found by TypeScript
// Declara ExifReader para que o TypeScript saiba que ele existe no escopo global
declare const ExifReader: any;

/**
 * Extrai dados de GPS (latitude e longitude) dos metadados EXIF de um arquivo de imagem.
 * @param file O arquivo de imagem (File object).
 * @returns Uma promessa que resolve para um objeto com lat e lon, ou null se não houver dados de GPS.
 */
export const getGPSData = async (file: File): Promise<{ lat: number; lon: number } | null> => {
  try {
    const tags = await ExifReader.load(file);

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
    console.error("Erro ao ler dados EXIF:", error);
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
