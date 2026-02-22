import express from 'express';
import { createServer as createViteServer } from 'vite';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Database
const db = new Database('techmarket.db');
db.pragma('journal_mode = WAL');

// Initialize Gemini AI
// Note: API Key is injected via process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image TEXT,
    seller_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    payment_id TEXT,
    amount REAL,
    currency TEXT,
    status TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_address TEXT,
    gps_coordinates TEXT,
    items TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed some initial data if empty
const productCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insert = db.prepare('INSERT INTO products (title, description, price, category, image, seller_name) VALUES (?, ?, ?, ?, ?, ?)');
  const seedProducts = [
    {
      title: 'UltraCharge 20000mAh Power Bank',
      description: 'High-capacity portable charger with fast charging support for all devices.',
      price: 2499,
      category: 'Power Banks',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
      seller_name: 'TechGear Official'
    },
    {
      title: 'SonicBlast Pro Wireless Speaker',
      description: 'Immersive 360-degree sound with deep bass and 24-hour battery life.',
      price: 8999,
      category: 'Speakers',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
      seller_name: 'AudioMaster'
    },
    {
      title: 'ProBook X1 Carbon',
      description: 'Ultra-slim laptop with 4K display, i7 processor, and 1TB SSD.',
      price: 124999,
      category: 'Laptops',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      seller_name: 'LaptopWorld'
    },
    {
      title: 'HyperFast 65W GaN Charger',
      description: 'Compact fast charger for laptops, tablets, and phones.',
      price: 1999,
      category: 'Chargers',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      seller_name: 'PowerUp'
    },
    {
      title: 'Zenith Noise Cancelling Headphones',
      description: 'Premium over-ear headphones with industry-leading noise cancellation.',
      price: 24999,
      category: 'Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      seller_name: 'AudioMaster'
    }
  ];
  seedProducts.forEach(p => insert.run(p.title, p.description, p.price, p.category, p.image, p.seller_name));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

  // API Routes
  
  // Get Products
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json(products);
  });

  // Create Product (Seller)
  app.post('/api/products', (req, res) => {
    const { title, description, price, category, image, seller_name } = req.body;
    const stmt = db.prepare('INSERT INTO products (title, description, price, category, image, seller_name) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(title, description, price, category, image, seller_name);
    res.json({ id: info.lastInsertRowid, success: true });
  });

  // Razorpay Order Creation
  app.post('/api/create-order', async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        // Mock response for preview if keys are missing
        return res.json({
          id: 'order_mock_' + Date.now(),
          currency: 'INR',
          amount: amount * 100,
          mock: true
        });
      }

      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      };

      const order = await instance.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error('Razorpay Error:', error);
      res.status(500).send(error);
    }
  });

  // Verify Payment & Send Email
  app.post('/api/verify-payment', async (req, res) => {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderDetails,
      isMock 
    } = req.body;

    // In a real app, verify signature here using crypto
    // For this demo, we assume success if we reach here, but we should validate

    try {
      // Save Order
      const stmt = db.prepare(`
        INSERT INTO orders (
          order_id, payment_id, amount, currency, status, 
          customer_name, customer_email, customer_address, gps_coordinates, items
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        razorpay_order_id, 
        razorpay_payment_id, 
        orderDetails.amount, 
        'INR', 
        'PAID',
        orderDetails.customerName,
        orderDetails.customerEmail,
        orderDetails.address,
        JSON.stringify(orderDetails.gps),
        JSON.stringify(orderDetails.items)
      );

      // Send Emails
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Email to Customer
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"TechMarket" <noreply@techmarket.com>',
          to: orderDetails.customerEmail,
          subject: 'Order Confirmation - TechMarket',
          html: `
            <h1>Thank you for your order!</h1>
            <p>Hi ${orderDetails.customerName},</p>
            <p>We have received your payment of ₹${orderDetails.amount}.</p>
            <p>Order ID: ${razorpay_order_id}</p>
            <h3>Items:</h3>
            <ul>
              ${orderDetails.items.map((item: any) => `<li>${item.title} - ₹${item.price}</li>`).join('')}
            </ul>
            <p>We will ship your items to:</p>
            <p>${orderDetails.address}</p>
          `,
        });

        // Email to Admin/Owner
        const gpsLink = orderDetails.gps ? `https://www.google.com/maps?q=${orderDetails.gps.latitude},${orderDetails.gps.longitude}` : 'Not provided';
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"TechMarket" <noreply@techmarket.com>',
          to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, // Fallback to sender if admin not set
          subject: 'New Order Received!',
          html: `
            <h1>New Order Alert</h1>
            <p><strong>Customer:</strong> ${orderDetails.customerName}</p>
            <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
            <p><strong>Amount:</strong> ₹${orderDetails.amount}</p>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            <p><strong>Address:</strong> ${orderDetails.address}</p>
            <p><strong>GPS Location:</strong> <a href="${gpsLink}">View on Map</a></p>
            <p><strong>Coordinates:</strong> ${orderDetails.gps ? `${orderDetails.gps.latitude}, ${orderDetails.gps.longitude}` : 'N/A'}</p>
            <h3>Items Sold:</h3>
             <ul>
              ${orderDetails.items.map((item: any) => `<li>${item.title} (Sold by: ${item.seller_name})</li>`).join('')}
            </ul>
          `,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Payment Verification/Email Error:', error);
      // Even if email fails, payment might be successful, but we report error for now
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- AI ROUTES ---

  // 1. Chatbot (Gemini 3.1 Pro)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const model = 'gemini-3.1-pro-preview';
      
      // Construct chat history for context
      // history should be array of { role: 'user' | 'model', parts: [{ text: '...' }] }
      
      const chat = ai.chats.create({
        model: model,
        history: history || [],
        config: {
          systemInstruction: "You are TechAssistant, a helpful AI support agent for TechMarket, an electronics e-commerce store. Answer questions about tech products, specs, and general advice. Be concise and professional.",
        },
      });

      const result = await chat.sendMessage({ message });
      res.json({ response: result.text });
    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  // 2. Fast Summary (Gemini 2.5 Flash Lite)
  app.post('/api/ai/quick-summary', async (req, res) => {
    try {
      const { productTitle, productDescription } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: `Provide a 1-sentence punchy sales summary for this product: ${productTitle}. Description: ${productDescription}. Focus on the main benefit.`,
      });
      res.json({ summary: response.text });
    } catch (error) {
      console.error('AI Summary Error:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // 3. Maps Grounding (Gemini 2.5 Flash)
  app.post('/api/ai/maps-search', async (req, res) => {
    try {
      const { query, location } = req.body; // location: { latitude, longitude }
      
      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: config
      });

      // Extract grounding chunks for the UI
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      res.json({ 
        text: response.text,
        groundingChunks: groundingChunks
      });
    } catch (error) {
      console.error('AI Maps Error:', error);
      res.status(500).json({ error: 'Failed to search maps' });
    }
  });

  // 4. Image Generation (Gemini 3 Pro Image)
  app.post('/api/ai/generate-image', async (req, res) => {
    try {
      const { prompt, size } = req.body; // size: '1K', '2K', '4K'
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            imageSize: size || '1K',
            aspectRatio: '1:1'
          }
        }
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: 'No image generated' });
      }
    } catch (error) {
      console.error('AI Image Gen Error:', error);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  });

  // 5. Video Generation (Veo)
  app.post('/api/ai/generate-video', async (req, res) => {
    try {
      const { imageBase64, prompt, aspectRatio } = req.body;
      
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || "Cinematic camera movement",
        image: {
          imageBytes: cleanBase64,
          mimeType: 'image/png', 
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio || '16:9'
        }
      });

      // Poll for completion
      // Note: In a real app, we might want to return the operation ID and let client poll
      // But for simplicity here, we'll poll on server (might timeout for long gens)
      // Veo fast is usually fast enough.
      
      let attempts = 0;
      while (!operation.done && attempts < 30) { // 300 seconds max
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        attempts++;
      }

      if (operation.done && operation.response?.generatedVideos?.[0]?.video?.uri) {
        const videoUri = operation.response.generatedVideos[0].video.uri;
        
        // Fetch the actual video content to proxy it (since client might not have key)
        // OR return the URI if it's public. Usually it requires key.
        // Let's fetch and stream it or return base64/proxy url.
        // For simplicity, we will return the URI and let the client fetch it via a proxy endpoint
        // actually, let's just fetch it here and return base64 or serve it.
        
        const videoRes = await fetch(videoUri, {
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' }
        });
        const videoBuffer = await videoRes.arrayBuffer();
        const videoBase64 = Buffer.from(videoBuffer).toString('base64');
        
        res.json({ videoBase64: `data:video/mp4;base64,${videoBase64}` });
      } else {
        res.status(500).json({ error: 'Video generation timed out or failed' });
      }

    } catch (error) {
      console.error('AI Video Gen Error:', error);
      res.status(500).json({ error: 'Failed to generate video' });
    }
  });


  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
