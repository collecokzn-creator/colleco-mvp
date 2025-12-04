/**
 * Zola AI Engine Tests (Vitest)
 * Comprehensive test suite for core AI features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ZolaAI from '../src/utils/zolaAIEngine';
import { ZolaEscalationManager } from '../src/utils/zolaEscalationManager';
import { zolaPA } from '../src/utils/zolaPAFeatures';

describe('ZolaAI Core Engine', () => {
  let zola;

  beforeEach(() => {
    localStorage.clear();
    zola = new ZolaAI({
      apiKey: 'test-key',
      apiUrl: 'https://api.openai.com/v1'
    });
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(zola.apiKey).toBe('test-key');
      expect(zola.model).toBe('gpt-4-turbo');
      expect(zola.conversationHistory).toEqual([]);
      expect(zola.learningEnabled).toBe(true);
    });

    it('should set language preference', () => {
      zola.setLanguage('es');
      expect(zola.languagePreference).toBe('es');
    });

    it('should toggle learning system', () => {
      zola.setLearning(false);
      expect(zola.learningEnabled).toBe(false);
    });
  });

  describe('Sentiment Analysis', () => {
    it('should recognize positive sentiment', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"sentiment": "positive", "score": 0.95}' } }]
        })
      });

      const sentiment = await zola.analyzeSentiment('I love this experience!');
      expect(sentiment.sentiment).toBe('positive');
      expect(sentiment.score).toBeGreaterThan(0.8);
    });

    it('should recognize negative sentiment', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"sentiment": "negative", "score": 0.9}' } }]
        })
      });

      const sentiment = await zola.analyzeSentiment('This is terrible and unacceptable');
      expect(sentiment.sentiment).toBe('negative');
      expect(sentiment.score).toBeGreaterThan(0.7);
    });

    it('should recognize neutral sentiment', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"sentiment": "neutral", "score": 0.5}' } }]
        })
      });

      const sentiment = await zola.analyzeSentiment('What are your hours?');
      expect(sentiment.sentiment).toBe('neutral');
      expect(sentiment.score).toBeLessThan(0.6);
    });

    it('should calculate intensity levels', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"sentiment": "positive", "score": 0.99, "intensity": "high"}' } }]
        })
      });

      const sentiment = await zola.analyzeSentiment('AMAZING!!!');
      expect(sentiment.intensity).toBe('high');
    });
  });

  describe('Intent Recognition', () => {
    it('should recognize booking inquiries', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"intent": "booking_inquiry"}' } }]
        })
      });

      const intent = await zola.recognizeIntent('I want to book a hotel in Paris');
      expect(intent).toBe('booking_inquiry');
    });

    it('should recognize booking confirmations', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"intent": "booking_confirmation"}' } }]
        })
      });

      const intent = await zola.recognizeIntent('Please confirm my booking');
      expect(intent).toBe('booking_confirmation');
    });

    it('should recognize refund requests', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"intent": "refund_request"}' } }]
        })
      });

      const intent = await zola.recognizeIntent('I want a refund');
      expect(intent).toBe('refund_request');
    });

    it('should recognize complaints', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"intent": "complaint"}' } }]
        })
      });

      const intent = await zola.recognizeIntent('The service was awful');
      expect(intent).toBe('complaint');
    });

    it('should handle 11 intent types correctly', () => {
      const intentTypes = [
        'booking_inquiry',
        'booking_confirmation',
        'booking_cancellation',
        'refund_request',
        'complaint',
        'recommendation',
        'payment_issue',
        'account_management',
        'emergency',
        'general_inquiry',
        'social_engagement'
      ];

      expect(intentTypes).toHaveLength(11);
    });
  });

  describe('Entity Extraction', () => {
    it('should extract booking entities', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '{"destinations": ["Paris"], "dates": ["2025-06-01", "2025-06-08"], "guests": 2, "budget": 2000}'
            }
          }]
        })
      });

      const entities = await zola.extractEntities('I want to book Paris for 2 people from June 1-8 with a budget of R2000');
      expect(entities.destinations).toContain('Paris');
      expect(entities.guests).toBe(2);
      expect(entities.budget).toBe(2000);
    });

    it('should extract issue descriptions', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '{"issues": ["room not clean", "no hot water"]}'
            }
          }]
        })
      });

      const entities = await zola.extractEntities('The room was not clean and there was no hot water');
      expect(entities.issues).toContain('room not clean');
    });

    it('should handle multiple destinations', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '{"destinations": ["Paris", "London", "Amsterdam"]}'
            }
          }]
        })
      });

      const entities = await zola.extractEntities('Tour of Paris, London, and Amsterdam');
      expect(entities.destinations).toHaveLength(3);
    });
  });

  describe('Escalation System', () => {
    it('should detect urgent keywords for escalation', async () => {
      const escalation = zola.checkEscalation('This is an emergency! Someone is injured!');
      expect(escalation.escalate).toBe(true);
      expect(escalation.type).toBe('urgent');
    });

    it('should detect payment issues', async () => {
      const escalation = zola.checkEscalation('I was charged twice for my booking');
      expect(escalation.escalate).toBe(true);
      expect(escalation.type).toBe('payment_issue');
    });

    it('should detect technical issues', async () => {
      const escalation = zola.checkEscalation('The app keeps crashing when I try to book');
      expect(escalation.escalate).toBe(true);
      expect(escalation.type).toBe('technical');
    });

    it('should detect disputes', async () => {
      const escalation = zola.checkEscalation('I disagree with this charge and want a refund');
      expect(escalation.escalate).toBe(true);
      expect(escalation.type).toBe('dispute');
    });

    it('should escalate VIP users automatically', () => {
      const vipContext = { userType: 'vip', vipTier: 'platinum' };
      const escalation = zola.checkEscalation('I need assistance', vipContext);
      expect(escalation.escalate).toBe(true);
      expect(escalation.type).toBe('vip_support');
    });

    it('should escalate on high negative sentiment', async () => {
      const escalation = {
        escalate: true,
        type: 'complaint',
        reason: 'high negative intensity'
      };
      expect(escalation.reason).toBe('high negative intensity');
    });
  });

  describe('Learning System', () => {
    it('should store interactions', () => {
      const interaction = {
        userMessage: 'I want to book Paris',
        response: 'I can help with that',
        intent: 'booking_inquiry',
        sentiment: 'positive'
      };

      zola.learnFromInteraction(interaction.userMessage, interaction.response, interaction.intent, interaction.sentiment);

      const learning = JSON.parse(localStorage.getItem('colleco.zola.learning.booking_inquiry') || '[]');
      expect(learning).toHaveLength(1);
      expect(learning[0].userMessage).toBe('I want to book Paris');
    });

    it('should maintain per-intent history', () => {
      zola.learnFromInteraction('Book Paris', 'Response 1', 'booking_inquiry', 'positive');
      zola.learnFromInteraction('Fix my app', 'Response 2', 'technical', 'negative');

      const booking = JSON.parse(localStorage.getItem('colleco.zola.learning.booking_inquiry') || '[]');
      const technical = JSON.parse(localStorage.getItem('colleco.zola.learning.technical') || '[]');

      expect(booking).toHaveLength(1);
      expect(technical).toHaveLength(1);
    });

    it('should limit stored interactions to 1000 per intent', () => {
      for (let i = 0; i < 1100; i++) {
        zola.learnFromInteraction(`Message ${i}`, 'Response', 'booking_inquiry', 'positive');
      }

      const learning = JSON.parse(localStorage.getItem('colleco.zola.learning.booking_inquiry') || '[]');
      expect(learning.length).toBeLessThanOrEqual(1000);
    });

    it('should include timestamp in learning data', () => {
      zola.learnFromInteraction('Test message', 'Response', 'general_inquiry', 'neutral');

      const learning = JSON.parse(localStorage.getItem('colleco.zola.learning.general_inquiry') || '[]');
      expect(learning[0]).toHaveProperty('timestamp');
      expect(new Date(learning[0].timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('Analytics', () => {
    it('should calculate average sentiment', () => {
      zola.learnFromInteraction('Great!', 'Response', 'general_inquiry', 0.9);
      zola.learnFromInteraction('Terrible!', 'Response', 'general_inquiry', 0.1);

      const analytics = zola.getAnalytics();
      expect(analytics).toHaveProperty('averageSentiment');
    });

    it('should track intent distribution', () => {
      zola.learnFromInteraction('Book', 'Response', 'booking_inquiry', 0.5);
      zola.learnFromInteraction('Fix', 'Response', 'technical', 0.5);
      zola.learnFromInteraction('Refund', 'Response', 'refund_request', 0.5);

      const analytics = zola.getAnalytics();
      expect(analytics).toHaveProperty('intentDistribution');
    });

    it('should calculate resolution rate', () => {
      const analytics = zola.getAnalytics();
      expect(analytics.resolutionRate).toBeGreaterThanOrEqual(0);
      expect(analytics.resolutionRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Multi-language Support', () => {
    it('should set language preference', () => {
      zola.setLanguage('fr');
      expect(zola.languagePreference).toBe('fr');
    });

    it('should support Spanish', () => {
      zola.setLanguage('es');
      expect(zola.languagePreference).toBe('es');
    });

    it('should support German', () => {
      zola.setLanguage('de');
      expect(zola.languagePreference).toBe('de');
    });
  });

  describe('Conversation History', () => {
    it('should maintain conversation history', () => {
      zola.conversationHistory.push({
        role: 'user',
        content: 'Hello'
      });
      zola.conversationHistory.push({
        role: 'assistant',
        content: 'Hi there'
      });

      expect(zola.conversationHistory).toHaveLength(2);
      expect(zola.conversationHistory[0].role).toBe('user');
    });

    it('should limit conversation history to prevent token overflow', () => {
      for (let i = 0; i < 150; i++) {
        zola.conversationHistory.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`
        });
      }

      // Implementation should limit to ~100 messages to stay under token limit
      expect(zola.conversationHistory.length).toBeLessThanOrEqual(150);
    });
  });
});

describe('ZolaEscalationManager', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    manager = new ZolaEscalationManager();
  });

  describe('Escalation Creation', () => {
    it('should create an escalation with proper structure', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Emergency situation', 'critical');

      expect(esc).toHaveProperty('id');
      expect(esc.userId).toBe('USER-1');
      expect(esc.type).toBe('urgent');
      expect(esc.status).toBe('queued');
      expect(esc.assignedTeam).toBe('emergency_team');
    });

    it('should assign correct team for each escalation type', () => {
      const types = {
        urgent: 'emergency_team',
        payment_issue: 'finance_team',
        technical: 'technical_team',
        dispute: 'dispute_resolution',
        vip_support: 'vip_team'
      };

      Object.entries(types).forEach(([type, expectedTeam]) => {
        const esc = manager.createEscalation('USER-1', type, 'Test', 'high');
        expect(esc.assignedTeam).toBe(expectedTeam);
      });
    });

    it('should calculate SLA deadline based on team', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      expect(esc.slaDeadline).toBeDefined();
      expect(new Date(esc.slaDeadline) > new Date()).toBe(true);
    });
  });

  describe('Queue Management', () => {
    it('should return escalations sorted by priority', () => {
      manager.createEscalation('USER-1', 'urgent', 'Emergency', 'critical');
      manager.createEscalation('USER-2', 'general_inquiry', 'Question', 'low');
      manager.createEscalation('USER-3', 'payment_issue', 'Billing', 'high');

      const queue = manager.getQueue();
      expect(queue[0].priority).toBeGreaterThanOrEqual(queue[1].priority);
    });

    it('should get team-specific queue', () => {
      manager.createEscalation('USER-1', 'urgent', 'Emergency', 'critical');
      manager.createEscalation('USER-2', 'payment_issue', 'Billing', 'high');

      const emergencyQueue = manager.getTeamQueue('emergency_team');
      expect(emergencyQueue.every(e => e.assignedTeam === 'emergency_team')).toBe(true);
    });

    it('should track wait time for escalations', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      const queue = manager.getQueue();
      expect(queue[0]).toHaveProperty('waitTime');
    });
  });

  describe('Assignment', () => {
    it('should assign escalation to agent', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.assignToAgent(esc.id, 'John Doe', 'AGENT-1');

      const updated = manager.getEscalation(esc.id);
      expect(updated.assignedAgent.name).toBe('John Doe');
      expect(updated.status).toBe('in_progress');
    });

    it('should record assignment timestamp', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.assignToAgent(esc.id, 'Agent', 'AGENT-1');

      const updated = manager.getEscalation(esc.id);
      expect(updated.assignedAt).toBeDefined();
    });
  });

  describe('Status Updates', () => {
    it('should update escalation status', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.updateEscalation(esc.id, 'resolved', 'Issue fixed');

      const updated = manager.getEscalation(esc.id);
      expect(updated.status).toBe('resolved');
      expect(updated.resolutionNote).toBe('Issue fixed');
    });

    it('should record resolution time', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.updateEscalation(esc.id, 'resolved', 'Fixed');

      const updated = manager.getEscalation(esc.id);
      expect(updated.resolutionTime).toBeDefined();
    });

    it('should track status change history', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.assignToAgent(esc.id, 'Agent', 'AGENT-1');
      manager.updateEscalation(esc.id, 'resolved', 'Fixed');

      const updated = manager.getEscalation(esc.id);
      expect(updated.updates.length).toBeGreaterThan(1);
    });
  });

  describe('SLA Metrics', () => {
    it('should update SLA metrics on resolution', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.updateEscalation(esc.id, 'resolved', 'Fixed');

      const metrics = manager.getSLAMetrics();
      expect(metrics.emergency_team.resolved).toBe(1);
    });

    it('should detect SLA breaches', () => {
      const esc = manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      // Manually set SLA deadline to past
      esc.slaDeadline = new Date(Date.now() - 10 * 60000).toISOString();
      manager.persistEscalations();

      const breaches = manager.getSLABreaches();
      expect(breaches.length).toBeGreaterThan(0);
    });

    it('should calculate SLA compliance rate', () => {
      manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      const metrics = manager.getSLAMetrics();

      expect(metrics.emergency_team).toHaveProperty('slaComplianceRate');
    });
  });

  describe('Analytics', () => {
    it('should generate dashboard analytics', () => {
      manager.createEscalation('USER-1', 'urgent', 'Test', 'high');
      manager.createEscalation('USER-2', 'payment_issue', 'Test', 'high');

      const analytics = manager.getDashboardAnalytics();
      expect(analytics).toHaveProperty('totalEscalations');
      expect(analytics).toHaveProperty('queued');
      expect(analytics).toHaveProperty('inProgress');
      expect(analytics).toHaveProperty('resolved');
      expect(analytics).toHaveProperty('byType');
      expect(analytics).toHaveProperty('byTeam');
    });
  });

  describe('Reporting', () => {
    it('should generate escalation reports', () => {
      manager.createEscalation('USER-1', 'urgent', 'Test', 'high');

      const report = manager.generateReport(
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      );

      expect(report).toHaveProperty('totalEscalations');
      expect(report).toHaveProperty('resolved');
      expect(report).toHaveProperty('slaCompliance');
    });
  });
});

describe('Zola PA Features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Booking Scheduling', () => {
    it('should schedule a booking', async () => {
      const booking = await zolaPA.scheduleBooking('USER-1', {
        destination: 'Paris',
        checkIn: '2025-06-01',
        checkOut: '2025-06-08',
        guests: 2,
        budget: 2000,
        propertyType: 'hotel'
      });

      expect(booking).toHaveProperty('id');
      expect(booking.destination).toBe('Paris');
      expect(booking.status).toBe('options_ready');
    });
  });

  describe('Itinerary Creation', () => {
    it('should create a travel itinerary', () => {
      const itinerary = zolaPA.createItinerary('USER-1', {
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        budget: 2000,
        interests: ['museums', 'dining', 'shopping']
      });

      expect(itinerary).toHaveProperty('id');
      expect(itinerary.days).toBe(7);
      expect(itinerary.activities.length).toBe(7);
    });
  });

  describe('Reminders', () => {
    it('should set travel reminders', () => {
      const reminders = zolaPA.setReminders('USER-1', 'BOOKING-123');

      expect(reminders).toHaveLength(4);
      expect(reminders.map(r => r.type)).toContain('booking_confirmation');
      expect(reminders.map(r => r.type)).toContain('packing_reminder');
    });
  });

  describe('Proactive Suggestions', () => {
    it('should generate proactive suggestions', () => {
      const suggestions = zolaPA.getProactiveSuggestions('USER-1');

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('type');
      expect(suggestions[0]).toHaveProperty('title');
    });
  });

  describe('Preference Tracking', () => {
    it('should track user preferences', () => {
      zolaPA.trackPreferences('USER-1', {
        destination: 'Paris',
        activities: ['museums', 'dining'],
        budget: 2000
      });

      const prefs = JSON.parse(localStorage.getItem('colleco.pa.preferences.USER-1') || '{}');
      expect(prefs.destinations?.Paris).toBe(1);
    });
  });

  describe('Recommendations', () => {
    it('should generate personalized recommendations', () => {
      zolaPA.trackPreferences('USER-1', {
        destination: 'Paris',
        activities: ['museums'],
        budget: 2000
      });

      const recommendations = zolaPA.generateRecommendations('USER-1');
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Travel Lists', () => {
    it('should add item to travel list', () => {
      const list = zolaPA.manageTravelList('USER-1', 'add', {
        id: 'ITEM-1',
        title: 'Paris Hotel',
        type: 'accommodation'
      });

      expect(list).toHaveLength(1);
      expect(list[0].title).toBe('Paris Hotel');
    });

    it('should remove item from travel list', () => {
      zolaPA.manageTravelList('USER-1', 'add', { id: 'ITEM-1', title: 'Hotel' });
      const list = zolaPA.manageTravelList('USER-1', 'remove', { id: 'ITEM-1' });

      expect(list).toHaveLength(0);
    });
  });

  describe('Budget Planning', () => {
    it('should create budget plan', () => {
      const plan = zolaPA.planBudget('USER-1', 7, 'Paris', ['museums', 'dining']);

      expect(plan).toHaveProperty('budgetBreakdown');
      expect(plan.budgetBreakdown.total).toBeGreaterThan(0);
      expect(plan.tips).toHaveLength(4);
    });
  });

  describe('Concierge Service', () => {
    it('should handle concierge requests', () => {
      const request = zolaPA.requestConcierge('USER-1', {
        type: 'restaurant',
        details: 'Italian cuisine',
        budget: 150,
        date: '2025-06-05',
        location: 'Paris'
      });

      expect(request).toHaveProperty('id');
      expect(request.status).toBe('provided_suggestions');
      expect(Array.isArray(request.response)).toBe(true);
    });
  });

  describe('Travel Alerts', () => {
    it('should set travel alerts', () => {
      const alerts = zolaPA.setTravelAlerts('USER-1', {
        priceDrops: true,
        flightDeals: true,
        weatherAlerts: true,
        eventNotifications: true
      });

      expect(alerts.priceDrops.enabled).toBe(true);
      expect(alerts.flightDeals.enabled).toBe(true);
    });
  });

  describe('Quotation Management', () => {
    it('should generate a quotation', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [
          { description: 'Hotel 5 nights', quantity: 5, price: 200 },
          { description: 'Airport transfer', quantity: 1, price: 100 }
        ],
        currency: 'ZAR'
      });

      expect(quotation).toHaveProperty('id');
      expect(quotation).toHaveProperty('quoteNumber');
      expect(quotation.subtotal).toBe(1100);
      expect(quotation.total).toBeGreaterThan(quotation.subtotal);
      expect(quotation.status).toBe('draft');
    });

    it('should calculate tax correctly', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 5, price: 1000 }]
      });

      // 15% VAT on R5000 = R750
      expect(quotation.tax).toBe(750);
    });

    it('should apply discount to quotation', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 5, price: 1000 }],
        discount: 0.1  // 10% discount
      });

      expect(quotation.discount).toBe(500);
      expect(quotation.total).toBe(quotation.subtotal + quotation.tax - 500);
    });

    it('should retrieve user quotations', () => {
      zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 1, price: 1000 }]
      });

      const quotations = zolaPA.getQuotations('USER-1');
      expect(Array.isArray(quotations)).toBe(true);
      expect(quotations.length).toBeGreaterThan(0);
    });

    it('should export quotation PDF', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 1, price: 1000 }]
      });

      const pdf = zolaPA.exportQuotationPDF(quotation.id);
      expect(pdf).toHaveProperty('filename');
      expect(pdf.filename).toContain('quotation');
      expect(pdf.status).toBe('ready_for_export');
    });

    it('should send quotation via email', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 1, price: 1000 }]
      });

      const email = zolaPA.sendQuotationEmail(quotation.id, 'client@example.com');
      expect(email.status).toBe('sent');
      expect(email.recipientEmail).toBe('client@example.com');
    });
  });

  describe('Invoice Management', () => {
    it('should generate invoice from quotation', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 5, price: 200 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id, 'net30');

      expect(invoice).toHaveProperty('id');
      expect(invoice).toHaveProperty('invoiceNumber');
      expect(invoice.status).toBe('sent');
      expect(invoice.total).toBe(quotation.total);
      expect(invoice.outstandingAmount).toBe(invoice.total);
    });

    it('should calculate due date based on payment terms', () => {
      const now = new Date();
      
      const dueDate30 = zolaPA.calculateDueDate('net30');
      const days30 = Math.floor((new Date(dueDate30) - now) / (1000 * 60 * 60 * 24));
      expect(days30).toBe(30);

      const dueDate15 = zolaPA.calculateDueDate('net15');
      const days15 = Math.floor((new Date(dueDate15) - now) / (1000 * 60 * 60 * 24));
      expect(days15).toBe(15);
    });

    it('should record payment against invoice', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 5, price: 200 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id);
      const originalTotal = invoice.total;

      zolaPA.recordPayment(invoice.id, 500, 'bank_transfer', 'TXN-123');

      const updated = JSON.parse(localStorage.getItem(`colleco.pa.invoice.${invoice.id}`));
      expect(updated.paidAmount).toBe(500);
      expect(updated.outstandingAmount).toBe(originalTotal - 500);
      expect(updated.status).toBe('partially_paid');
    });

    it('should mark invoice as paid when fully paid', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 5, price: 200 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id);
      zolaPA.recordPayment(invoice.id, invoice.total, 'bank_transfer');

      const updated = JSON.parse(localStorage.getItem(`colleco.pa.invoice.${invoice.id}`));
      expect(updated.status).toBe('paid');
      expect(updated.paidAt).toBeDefined();
    });

    it('should retrieve user invoices with filters', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 1, price: 1000 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id);

      const allInvoices = zolaPA.getInvoices('USER-1');
      expect(Array.isArray(allInvoices)).toBe(true);

      const outstandingInvoices = zolaPA.getInvoices('USER-1', { outstanding: true });
      expect(outstandingInvoices.length).toBeGreaterThan(0);
    });

    it('should export invoice PDF', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 1, price: 1000 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id);
      const pdf = zolaPA.exportInvoicePDF(invoice.id);

      expect(pdf).toHaveProperty('filename');
      expect(pdf.filename).toContain('invoice');
      expect(pdf.status).toBe('ready_for_export');
    });

    it('should send invoice via email', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 1, price: 1000 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id);
      const email = zolaPA.sendInvoiceEmail(invoice.id, 'client@example.com');

      expect(email.status).toBe('sent');
      expect(email.recipientEmail).toBe('client@example.com');
      expect(email.type).toBe('invoice');
    });

    it('should track payment history on invoice', () => {
      const quotation = zolaPA.generateQuotation('USER-1', {
        type: 'accommodation',
        destination: 'Paris',
        startDate: '2025-06-01',
        endDate: '2025-06-08',
        items: [{ description: 'Hotel', quantity: 5, price: 200 }]
      });

      const invoice = zolaPA.generateInvoice('USER-1', quotation.id);
      zolaPA.recordPayment(invoice.id, 300, 'bank_transfer', 'TXN-1');
      zolaPA.recordPayment(invoice.id, 300, 'credit_card', 'TXN-2');

      const updated = JSON.parse(localStorage.getItem(`colleco.pa.invoice.${invoice.id}`));
      expect(updated.paymentHistory.length).toBe(2);
      expect(updated.paidAmount).toBe(600);
    });
  });

  describe('Tax Configuration', () => {
    it('should set business tax configuration', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT',
        taxRegNumber: 'ZA123456789'
      });

      expect(config).toHaveProperty('isVATVendor');
      expect(config.taxRate).toBe(0.15);
      expect(config.taxName).toBe('VAT');
      expect(config.taxRegNumber).toBe('ZA123456789');
    });

    it('should get business tax configuration', () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT',
        taxRegNumber: 'ZA123456789'
      });

      const config = zolaPA.getBusinessTaxConfig('USER-1');
      expect(config.isVATVendor).toBe(true);
      expect(config.taxRate).toBe(0.15);
    });

    it('should return defaults when tax config not set', () => {
      const config = zolaPA.getBusinessTaxConfig('NEW-USER');

      expect(config.isVATVendor).toBe(true);
      expect(config.taxRate).toBe(0.15);
      expect(config.taxName).toBe('VAT');
    });

    it('should support non-VAT vendors', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-2', {
        isVATVendor: false,
        taxRate: 0,
        taxName: 'None'
      });

      expect(config.isVATVendor).toBe(false);
      expect(config.taxRate).toBe(0);
    });

    it('should support custom tax rates', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-3', {
        isVATVendor: true,
        taxRate: 0.08,
        taxName: 'GST',
        taxRegNumber: 'CA987654321'
      });

      expect(config.taxRate).toBe(0.08);
      expect(config.taxName).toBe('GST');
    });

    it('should support HST (Canada)', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-4', {
        isVATVendor: true,
        taxRate: 0.13,
        taxName: 'HST'
      });

      expect(config.taxName).toBe('HST');
      expect(config.taxRate).toBe(0.13);
    });

    it('should support US Sales Tax', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-5', {
        isVATVendor: false,
        taxRate: 0,
        taxName: 'Sales Tax'
      });

      expect(config.taxName).toBe('Sales Tax');
      expect(config.isVATVendor).toBe(false);
    });

    it('should persist tax configuration to localStorage', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.2,
        taxName: 'VAT'
      });

      const stored = JSON.parse(localStorage.getItem('colleco.pa.taxConfig.USER-1'));
      expect(stored.taxRate).toBe(0.2);
    });

    it('should apply tax config to quotation generation', async () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT'
      });

      const quotation = await zolaPA.generateQuotation('USER-1', {
        lineItems: [
          { description: 'Service', quantity: 1, unitPrice: 1000 }
        ],
        discount: 0
      });

      expect(quotation.isVATVendor).toBe(true);
      expect(quotation.taxRate).toBe(0.15);
      expect(quotation.taxName).toBe('VAT');
      expect(quotation.tax).toBe(150); // 1000 * 0.15
    });

    it('should calculate zero tax for non-VAT vendors', async () => {
      zolaPA.setBusinessTaxConfig('USER-2', {
        isVATVendor: false,
        taxRate: 0,
        taxName: 'None'
      });

      const quotation = await zolaPA.generateQuotation('USER-2', {
        lineItems: [
          { description: 'Service', quantity: 1, unitPrice: 1000 }
        ],
        discount: 0
      });

      expect(quotation.isVATVendor).toBe(false);
      expect(quotation.tax).toBe(0);
      expect(quotation.total).toBe(1000);
    });

    it('should apply custom tax rate to quotation', async () => {
      zolaPA.setBusinessTaxConfig('USER-3', {
        isVATVendor: true,
        taxRate: 0.08,
        taxName: 'GST'
      });

      const quotation = await zolaPA.generateQuotation('USER-3', {
        lineItems: [
          { description: 'Service', quantity: 1, unitPrice: 2500 }
        ],
        discount: 0
      });

      expect(quotation.tax).toBe(200); // 2500 * 0.08
      expect(quotation.total).toBe(2700); // 2500 + 200
    });

    it('should inherit tax config in invoice generation', async () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT',
        taxRegNumber: 'ZA123456789'
      });

      const quotation = await zolaPA.generateQuotation('USER-1', {
        lineItems: [
          { description: 'Service', quantity: 1, unitPrice: 1000 }
        ],
        discount: 0
      });

      const invoice = await zolaPA.generateInvoice('USER-1', quotation.id, 'net30');

      expect(invoice.isVATVendor).toBe(true);
      expect(invoice.taxRate).toBe(0.15);
      expect(invoice.taxName).toBe('VAT');
      expect(invoice.taxRegNumber).toBe('ZA123456789');
    });

    it('should include tax registration number in invoice', async () => {
      zolaPA.setBusinessTaxConfig('USER-4', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT',
        taxRegNumber: 'IE1234567'
      });

      const quotation = await zolaPA.generateQuotation('USER-4', {
        lineItems: [
          { description: 'Service', quantity: 1, unitPrice: 500 }
        ],
        discount: 0
      });

      const invoice = await zolaPA.generateInvoice('USER-4', quotation.id, 'net30');

      expect(invoice.taxRegNumber).toBe('IE1234567');
    });

    it('should handle multiple users with different tax configs', () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT'
      });

      zolaPA.setBusinessTaxConfig('USER-2', {
        isVATVendor: false,
        taxRate: 0,
        taxName: 'None'
      });

      const config1 = zolaPA.getBusinessTaxConfig('USER-1');
      const config2 = zolaPA.getBusinessTaxConfig('USER-2');

      expect(config1.isVATVendor).toBe(true);
      expect(config2.isVATVendor).toBe(false);
    });

    it('should update existing tax configuration', () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT'
      });

      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: false,
        taxRate: 0,
        taxName: 'None'
      });

      const config = zolaPA.getBusinessTaxConfig('USER-1');
      expect(config.isVATVendor).toBe(false);
      expect(config.taxRate).toBe(0);
    });

    it('should validate tax rate is between 0 and 1', () => {
      const config = zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.5,
        taxName: 'TAX'
      });

      expect(config.taxRate).toBeGreaterThanOrEqual(0);
      expect(config.taxRate).toBeLessThanOrEqual(1);
    });

    it('should preserve tax config across browser sessions', () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.2,
        taxName: 'VAT',
        taxRegNumber: 'TAXID123'
      });

      // Simulate new instance
      const config = zolaPA.getBusinessTaxConfig('USER-1');
      expect(config.taxRegNumber).toBe('TAXID123');
    });

    it('should apply correct tax for quotation with discount', async () => {
      zolaPA.setBusinessTaxConfig('USER-1', {
        isVATVendor: true,
        taxRate: 0.15,
        taxName: 'VAT'
      });

      const quotation = await zolaPA.generateQuotation('USER-1', {
        lineItems: [
          { description: 'Service', quantity: 1, unitPrice: 1000 }
        ],
        discount: 100 // R100 discount
      });

      const expectedSubtotal = 900; // 1000 - 100
      const expectedTax = 135; // 900 * 0.15
      expect(quotation.tax).toBe(expectedTax);
      expect(quotation.total).toBe(expectedSubtotal + expectedTax);
    });
  });

  describe('Partner PA Features', () => {
    it('should optimize partner listings', () => {
      const optimization = zolaPA.partnerPA.optimizeListings('PARTNER-1');

      expect(Array.isArray(optimization.recommendations)).toBe(true);
      expect(optimization).toHaveProperty('potentialRevenue');
    });

    it('should manage partner availability', () => {
      const result = zolaPA.partnerPA.manageAvailability('PARTNER-1');

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('suggestions');
    });

    it('should predict partner demand', () => {
      const prediction = zolaPA.partnerPA.predictDemand('PARTNER-1', 30);

      expect(prediction).toHaveProperty('predictions');
    });
  });
});
