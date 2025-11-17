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
 * @returns Uma promessa que resolve para `true` se a biblioteca carregar, ou `false` em caso de timeout.
 */
const waitForExifReader = (timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    // Verifica se já está disponível
    if (typeof window.ExifReader !== 'undefined') {
      return resolve(true);
    }

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      if (typeof window.ExifReader !== 'undefined') {
        clearInterval(intervalId);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(intervalId);
        console.warn(`A biblioteca ExifReader não carregou em ${timeout}ms. Isso pode ser devido a uma conexão de rede lenta. A funcionalidade de geolocalização a partir dos metadados da foto estará indisponível.`);
        resolve(false);
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
  const isLibraryLoaded = await waitForExifReader();

  if (!isLibraryLoaded) {
    return null; // Sai graciosamente se a biblioteca não carregar a tempo.
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