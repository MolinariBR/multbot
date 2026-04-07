import 'dotenv/config';

const DEFAULT_API_URL = 'http://localhost:3000';
const DEFAULT_DEPIX_PAYMENT_ID = '019c33698fd77edc8874f427c5edeabe';
const TITLE_DIVIDER = '═'.repeat(55);

type WebhookPayload = {
  webhookType: 'deposit';
  qrId: string;
  status: 'depix_sent';
  valueInCents: number;
  pixKey: string;
  payerName: string;
  payerTaxNumber: string;
  payerEUID: string;
  bankTxId: string;
  blockchainTxID: string;
  customerMessage: string;
  expiration: string;
};

function getApiUrl(): string {
  return process.env.API_URL ?? DEFAULT_API_URL;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

function buildWebhookPayload(depixPaymentId: string): WebhookPayload {
  return {
    webhookType: 'deposit',
    qrId: depixPaymentId,
    status: 'depix_sent',
    valueInCents: 1000,
    pixKey: '00020101021226860014br.gov.bcb.pix...',
    payerName: 'JOÃO DA SILVA TESTE',
    payerTaxNumber: '12345678900',
    payerEUID: 'EU123456789012345',
    bankTxId: 'E10FCC535C7922BFFF7AA2E8302842520',
    blockchainTxID: 'abc123def456...',
    customerMessage: 'Pagamento de teste via script',
    expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

function printScriptHeader(): void {
  console.log(TITLE_DIVIDER);
  console.log('  TESTE DE WEBHOOK DEPIX - INFORMAÇÕES DO PAGADOR');
  console.log(`${TITLE_DIVIDER}\n`);
}

function printWebhookSimulationInfo(depixPaymentId: string, webhookPayload: WebhookPayload): void {
  console.log('🧪 Testando Webhook Depix com informações do pagador\n');
  console.log(`⚠️  ATENÇÃO: Usando depixPaymentId: ${depixPaymentId}`);
  console.log('Se você não tiver uma transação com este ID, o webhook não vai encontrar nada.\n');
  console.log('📤 Enviando webhook simulado:');
  console.log(JSON.stringify(webhookPayload, null, 2));
  console.log('');
}

function printHttpResult(context: string, response: Response, responseBody: unknown): void {
  if (response.ok) {
    console.log(`✅ ${context} processado com sucesso!`);
  } else {
    console.log(`❌ ${context} retornou HTTP ${response.status}`);
  }

  console.log('📥 Resposta:', JSON.stringify(responseBody, null, 2));
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return { message: 'Resposta não é JSON válido' };
  }
}

async function postWebhookSimulation(apiUrl: string, webhookPayload: WebhookPayload): Promise<Response> {
  return fetch(`${apiUrl}/api/depix/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookPayload),
  });
}

async function fetchTransactionById(apiUrl: string, transactionId: string): Promise<Response> {
  return fetch(`${apiUrl}/api/transactions/${transactionId}`);
}

async function runWebhookSimulation(apiUrl: string): Promise<void> {
  const webhookPayload = buildWebhookPayload(DEFAULT_DEPIX_PAYMENT_ID);
  printWebhookSimulationInfo(DEFAULT_DEPIX_PAYMENT_ID, webhookPayload);

  const response = await postWebhookSimulation(apiUrl, webhookPayload);
  const responseBody = await parseJsonSafely(response);
  printHttpResult('Webhook', response, responseBody);

  if (response.ok) {
    console.log('\n💡 Agora verifique a transação no banco de dados ou no painel web.');
    console.log('As informações do pagador devem estar salvas!');
  }
}

async function fetchAndPrintTransaction(apiUrl: string, transactionId: string): Promise<void> {
  console.log(`\n🔍 Consultando transação: ${transactionId}\n`);

  const response = await fetchTransactionById(apiUrl, transactionId);
  const responseBody = await parseJsonSafely(response);
  printHttpResult('Consulta de transação', response, responseBody);
}

async function main(): Promise<void> {
  const apiUrl = getApiUrl();
  const transactionIdFromArg = process.argv[2];

  printScriptHeader();

  try {
    if (transactionIdFromArg) {
      await fetchAndPrintTransaction(apiUrl, transactionIdFromArg);
      return;
    }

    await runWebhookSimulation(apiUrl);
  } catch (error: unknown) {
    process.exitCode = 1;
    console.error('❌ Falha no script de teste do webhook', {
      apiUrl,
      error: getErrorMessage(error),
    });
  }
}

void main();
