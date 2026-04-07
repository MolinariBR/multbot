import 'dotenv/config';

const DEFAULT_DEPIX_API_URL = 'https://api.eulen.app';
const MIN_EUID_LENGTH = 17;
const EUID_PREFIX = 'EU';
const DIVIDER = '---';

const TEST_USER_IDS = [6_721_416_266, 123, 999_999_999_999];

type DepixDepositPayload = {
  amountInCents: number;
  endUserFullName: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

function generateEuidFromUserId(userId: number): string {
  const timestampSuffix = Date.now().toString().slice(-8);
  const normalizedUserId = String(userId).slice(-7).padStart(7, '0');
  return `${EUID_PREFIX}${timestampSuffix}${normalizedUserId}`;
}

function isGeneratedEuidValid(generatedEuid: string): boolean {
  return generatedEuid.length === MIN_EUID_LENGTH && generatedEuid.startsWith(EUID_PREFIX);
}

function printEuidGenerationResult(userId: number, generatedEuid: string): void {
  const isEuidValid = isGeneratedEuidValid(generatedEuid);

  console.log(`User ID: ${userId}`);
  console.log(`EUID: ${generatedEuid}`);
  console.log(`Tamanho: ${generatedEuid.length} caracteres`);
  console.log(`Válido: ${isEuidValid ? '✅' : '❌'}`);
  console.log(DIVIDER);
}

function runEuidValidationSuite(userIds: number[]): void {
  console.log('🧪 Testando geração de EUID:\n');

  for (const userId of userIds) {
    const generatedEuid = generateEuidFromUserId(userId);
    printEuidGenerationResult(userId, generatedEuid);
  }
}

function getDepixApiUrl(): string {
  return process.env.DEPIX_API_URL ?? DEFAULT_DEPIX_API_URL;
}

function getDepixApiKey(): string | null {
  return process.env.DEPIX_API_KEY ?? null;
}

function buildDepositPayloadWithoutEuid(): DepixDepositPayload {
  return {
    amountInCents: 100,
    endUserFullName: 'Teste Usuario',
  };
}

async function sendDepositRequest(apiUrl: string, apiKey: string, payload: DepixDepositPayload): Promise<Response> {
  return fetch(`${apiUrl}/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return { message: 'Resposta não é JSON válido' };
  }
}

function printDepixApiResult(response: Response, responseBody: unknown): void {
  if (response.ok) {
    console.log('✅ Sucesso!');
  } else {
    console.log(`❌ Erro HTTP ${response.status}`);
  }

  console.log('📥 Resposta:', JSON.stringify(responseBody, null, 2));
}

async function runDepixApiSmokeTest(): Promise<void> {
  const apiUrl = getDepixApiUrl();
  const apiKey = getDepixApiKey();

  if (!apiKey) {
    console.log('\n⚠️  DEPIX_API_KEY não configurado. Pulando teste de API real.');
    return;
  }

  console.log('\n🌐 Testando chamada real à API Depix...\n');

  const depositPayload = buildDepositPayloadWithoutEuid();
  console.log('📤 Payload:', JSON.stringify(depositPayload, null, 2));

  try {
    const response = await sendDepositRequest(apiUrl, apiKey, depositPayload);
    const responseBody = await parseJsonResponse(response);
    printDepixApiResult(response, responseBody);
  } catch (error: unknown) {
    process.exitCode = 1;
    console.error('❌ Erro ao chamar API Depix', {
      apiUrl,
      error: getErrorMessage(error),
    });
  }
}

async function main(): Promise<void> {
  runEuidValidationSuite(TEST_USER_IDS);
  await runDepixApiSmokeTest();
}

void main();
