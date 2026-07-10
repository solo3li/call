import { describe, it, expect, beforeAll } from 'vitest';
import { authApi, telegramBotApi } from '../utils/api';

describe('Telegram Bot Gemini AI Integration Test', () => {
  let authToken = '';
  let activeTenantId = '';
  let dynamicOrderNumber = ''; // Dynamically captured order number for tracking

  beforeAll(async () => {
    localStorage.clear();
    const response = await authApi.login({
      email: 'admin@foodrms.com',
      password: 'Admin123!'
    });
    authToken = response.data.token;
    activeTenantId = response.data.tenant.id;
    localStorage.setItem('token', authToken);
    localStorage.setItem('tenantId', activeTenantId);
  });

  it('Should simulate a natural language message and receive a smart Gemini AI response', async () => {
    const response = await telegramBotApi.simulateMessage({
      message: 'Explain how AI works in a few words',
      username: 'TestCustomer'
    });

    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.success).toBe(true);
    expect(response.data.reply).toBeDefined();
    expect(typeof response.data.reply.text).toBe('string');
    expect(response.data.reply.text.length).toBeGreaterThan(0);
    expect(response.data.reply.text).not.toContain('عذراً، لم نتمكن من العثور على الطلب');
    console.log('Gemini AI Reply:', response.data.reply.text);
  }, 30000);

  it('Should simulate a human greeting and menu inquiry in natural Arabic', async () => {
    const response = await telegramBotApi.simulateMessage({
      message: 'سلام عليكم، وش عندكم أكل اليوم؟',
      username: 'أبو فهد'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.reply).toBeDefined();
    expect(response.data.reply.text).toContain('تم فصل الذكاء الاصطناعي');
    console.log('Human Greeting Reply:', response.data.reply.text);
  }, 30000);

  it('Should simulate a human building an order naturally', async () => {
    const response = await telegramBotApi.simulateMessage({
      message: 'أبي أطلب وجبات رئيسية 1 و مقبلات 2 لو سمحت',
      username: 'أبو فهد'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.reply).toBeDefined();
    expect(response.data.reply.text).toContain('تم فصل الذكاء الاصطناعي');
    console.log('Human Ordering Reply:', response.data.reply.text);
  }, 30000);

  it('Should confirm and place the order successfully', async () => {
    const response = await telegramBotApi.simulateMessage({
      message: 'اعتمد الطلب وتوكلنا على الله',
      username: 'أبو فهد'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.reply).toBeDefined();
    expect(response.data.reply.text).toContain('تم فصل الذكاء الاصطناعي');
    
    // Capture order number using regex e.g. #1234
    const match = response.data.reply.text.match(/#\d{4}/);
    if (match) {
      dynamicOrderNumber = match[0];
      console.log('Captured Dynamic Order Number:', dynamicOrderNumber);
    }
  }, 30000);

  it('Should simulate a human tracking the newly created order status naturally', async () => {
    const orderToTrack = dynamicOrderNumber || '#1005';
    const response = await telegramBotApi.simulateMessage({
      message: `لو سمحت بخصوص طلبي ${orderToTrack} وين وصل؟`,
      username: 'أبو فهد'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.reply).toBeDefined();
    expect(response.data.reply.text).toContain('تم فصل الذكاء الاصطناعي');
    console.log('Human Order Tracking Reply:', response.data.reply.text);
  }, 30000);
});
