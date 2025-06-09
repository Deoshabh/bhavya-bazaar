// Mock Service Worker (MSW) server setup for testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Define mock API endpoints
const handlers = [
  // User authentication endpoints
  rest.post('/api/v2/user/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar: null,
        },
        token: 'mock-user-token-123',
      })
    );
  }),

  rest.post('/api/v2/user/create-user', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'User created successfully',
      })
    );
  }),

  rest.get('/api/v2/user/getuser', (req, res, ctx) => {
    const token = req.headers.get('Authorization');
    if (!token) {
      return res(ctx.status(401), ctx.json({ message: 'No token provided' }));
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar: null,
        },
      })
    );
  }),

  rest.post('/api/v2/user/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully',
      })
    );
  }),

  // Shop authentication endpoints
  rest.post('/api/v2/shop/login-shop', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        seller: {
          id: 1,
          name: 'Test Shop',
          email: 'shop@example.com',
          description: 'Test shop description',
        },
        token: 'mock-shop-token-123',
      })
    );
  }),

  rest.post('/api/v2/shop/create-shop', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: 'Shop created successfully',
      })
    );
  }),

  rest.get('/api/v2/shop/getSeller', (req, res, ctx) => {
    const token = req.headers.get('Authorization');
    if (!token) {
      return res(ctx.status(401), ctx.json({ message: 'No token provided' }));
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        seller: {
          id: 1,
          name: 'Test Shop',
          email: 'shop@example.com',
          description: 'Test shop description',
        },
      })
    );
  }),

  // Admin authentication endpoints
  rest.post('/api/v2/admin/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        admin: {
          id: 1,
          name: 'Test Admin',
          email: 'admin@example.com',
        },
        token: 'mock-admin-token-123',
      })
    );
  }),

  // Product endpoints
  rest.get('/api/v2/product/get-all-products', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        products: [
          {
            id: 1,
            name: 'Test Product',
            description: 'Test product description',
            price: 99.99,
            stock: 10,
            images: [{ url: 'test-image.jpg' }],
            shop: { name: 'Test Shop' },
            ratings: 4.5,
            reviews: [],
          },
        ],
      })
    );
  }),

  rest.get('/api/v2/product/get-product/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        product: {
          id: parseInt(id),
          name: 'Test Product',
          description: 'Test product description',
          price: 99.99,
          stock: 10,
          images: [{ url: 'test-image.jpg' }],
          shop: { name: 'Test Shop', id: 1 },
          ratings: 4.5,
          reviews: [],
        },
      })
    );
  }),

  // Order endpoints
  rest.get('/api/v2/order/get-all-orders/:userId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        orders: [
          {
            id: 1,
            cart: [
              {
                id: 1,
                name: 'Test Product',
                qty: 2,
                price: 99.99,
              },
            ],
            totalPrice: 199.98,
            status: 'Processing',
            createdAt: new Date().toISOString(),
          },
        ],
      })
    );
  }),

  rest.post('/api/v2/order/create-order', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        order: {
          id: 1,
          cart: [],
          totalPrice: 0,
          status: 'Processing',
          createdAt: new Date().toISOString(),
        },
      })
    );
  }),

  // Event endpoints
  rest.get('/api/v2/event/get-all-events', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        events: [
          {
            id: 1,
            name: 'Test Event',
            description: 'Test event description',
            status: 'Running',
            start_Date: new Date().toISOString(),
            finish_Date: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      })
    );  }),

  // Health check endpoint
  rest.get('/api/v2/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    );
  }),

  // Error testing endpoint
  rest.get('/api/v2/test/error', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Test error' }));
  }),

  // Timeout testing endpoint
  rest.get('/api/v2/test/timeout', (req, res, ctx) => {
    return res(ctx.delay(5000), ctx.status(200), ctx.json({ message: 'Delayed response' }));
  }),
];

// Create and export the server
export const server = setupServer(...handlers);

// Export handlers for individual test customization
export { handlers };

// Helper function to add custom handlers for specific tests
export const addHandler = (handler) => {
  server.use(handler);
};

// Helper function to override existing handlers
export const overrideHandler = (endpoint, handler) => {
  server.use(
    rest.get(endpoint, handler),
    rest.post(endpoint, handler),
    rest.put(endpoint, handler),
    rest.delete(endpoint, handler),
    rest.patch(endpoint, handler)
  );
};
