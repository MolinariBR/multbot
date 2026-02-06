import QRCode from 'qrcode';

/**
 * Gera QR Code como buffer de imagem PNG
 */
export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
    try {
        const buffer = await QRCode.toBuffer(text, {
            errorCorrectionLevel: 'M',
            type: 'png',
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return buffer;
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        throw new Error('Falha ao gerar QR Code');
    }
}

/**
 * Gera QR Code como Data URL (base64)
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
    try {
        const dataURL = await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return dataURL;
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        throw new Error('Falha ao gerar QR Code');
    }
}

/**
 * Gera QR Code como string SVG
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
    try {
        const svg = await QRCode.toString(text, {
            errorCorrectionLevel: 'M',
            type: 'svg',
            width: 512,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        return svg;
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        throw new Error('Falha ao gerar QR Code');
    }
}

/**
 * Valida se o texto é válido para gerar QR Code
 */
export function validateQRCodeText(text: string): boolean {
    if (!text || typeof text !== 'string') {
        return false;
    }

    // QR Code suporta até ~4296 caracteres (modo alfanumérico)
    if (text.length > 4000) {
        return false;
    }

    return true;
}
