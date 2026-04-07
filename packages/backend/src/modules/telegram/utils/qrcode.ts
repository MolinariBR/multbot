import QRCode from 'qrcode';

const MAX_QR_TEXT_LENGTH = 4000;
const QR_CODE_WIDTH = 512;
const QR_CODE_MARGIN = 2;

const qrCodeSharedOptions = {
    errorCorrectionLevel: 'M',
    width: QR_CODE_WIDTH,
    margin: QR_CODE_MARGIN,
    color: {
        dark: '#000000',
        light: '#FFFFFF',
    },
} as const;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
}

function createQrCodeGenerationError(operation: string, textLength: number, error: unknown): Error {
    const message = getErrorMessage(error);
    return new Error(`Falha ao gerar QR Code (${operation}, textLength=${textLength}): ${message}`);
}

function assertValidQrCodeTextOrThrow(text: string): void {
    if (isValidQrCodeText(text)) {
        return;
    }

    throw new Error(
        `Texto inválido para QR Code: deve conter entre 1 e ${MAX_QR_TEXT_LENGTH} caracteres.`,
    );
}

async function runQrCodeOperation<T>(
    operation: string,
    text: string,
    execute: () => Promise<T>,
): Promise<T> {
    assertValidQrCodeTextOrThrow(text);

    try {
        return await execute();
    } catch (error: unknown) {
        throw createQrCodeGenerationError(operation, text.length, error);
    }
}

export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
    return runQrCodeOperation('buffer', text, () => (
        QRCode.toBuffer(text, {
            ...qrCodeSharedOptions,
            type: 'png',
        })
    ));
}

export async function generateQRCodeDataURL(text: string): Promise<string> {
    return runQrCodeOperation('data-url', text, () => (
        QRCode.toDataURL(text, {
            ...qrCodeSharedOptions,
            type: 'image/png',
        })
    ));
}

export async function generateQRCodeSVG(text: string): Promise<string> {
    return runQrCodeOperation('svg', text, () => (
        QRCode.toString(text, {
            ...qrCodeSharedOptions,
            type: 'svg',
        })
    ));
}

export function isValidQrCodeText(text: string): boolean {
    if (typeof text !== 'string') {
        return false;
    }

    return text.length > 0 && text.length <= MAX_QR_TEXT_LENGTH;
}

export const validateQRCodeText = isValidQrCodeText;
