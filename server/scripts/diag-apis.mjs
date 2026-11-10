import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const models = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.6-flash'];

const pdf = Buffer.from(`%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 400 300]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 220>>stream
BT /F1 12 Tf 30 260 Td (Croma Electronics Invoice) Tj 0 -20 Td (Product: Samsung Refrigerator) Tj 0 -20 Td (Purchase date: 15/10/2026) Tj 0 -20 Td (Total INR 45000) Tj 0 -20 Td (Warranty: 24 months) Tj 0 -20 Td (Warranty end: 15/10/2028) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
trailer<</Root 1 0 R>>
%%EOF`);

for (const modelName of models) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Extract productName, vendor, purchaseDate YYYY-MM-DD, total amount, warranty months as JSON. Use null if missing. No markdown.' },
            { inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } },
          ],
        }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    }
  );
  const body = await res.json();
  const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  console.log(modelName, res.status, body?.candidates?.[0]?.finishReason || '', text.slice(0, 300).replace(/\s+/g, ' '), body.error ? body.error.message : '');
}

const from = process.env.RESEND_FROM_EMAIL;
const to = 'dellprabha71@gmail.com';
const sendRes = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: `DocAlert <${from}>`,
    to: [to],
    subject: 'DocAlert delivery check',
    html: '<p>This is a DocAlert configuration check. If you received it, sandbox delivery to the Resend account email works.</p>',
  }),
});
const sent = await sendRes.json();
console.log('SEND_OWNER', sendRes.status, JSON.stringify({ id: sent.id || null, message: sent.message || null }));
if (sent.id) {
  await new Promise((r) => setTimeout(r, 4000));
  const got = await fetch(`https://api.resend.com/emails/${sent.id}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  const detail = await got.json();
  console.log('STATUS', got.status, JSON.stringify({
    last_event: detail.last_event || null,
    message: detail.message || null,
  }));
}
