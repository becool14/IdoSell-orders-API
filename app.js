const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const basicAuth = require('express-basic-auth');

dotenv.config();

const app = express();
const port = 3000;

// Basic Auth
app.use(basicAuth({
  users: { 'admin': 'password' },  
  challenge: true,
}));

async function fetchOrders(minWorth, maxWorth) {
    const url = process.env.IDOSSELL_API_URL;
    const headers = {
      'Authorization': `Bearer ${process.env.IDOSSELL_API_KEY}`,
    };
    const params = {
      minWorth: minWorth || 0,
      maxWorth: maxWorth || 9999999,
    };
  
    console.log('Request to API:');
    console.log('URL:', url);
    console.log('Headers:', headers);
    console.log('Parameters:', params);
  
    try {
      const response = await axios.get(url, {
        headers: headers,
        params: params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

app.get('/orders', async (req, res) => {
  const { minWorth, maxWorth } = req.query;
  try {
    const orders = await fetchOrders(minWorth, maxWorth);
    
    const formattedOrders = orders.map(order => ({
      orderID: order.id,
      products: order.products.map(product => ({
        productID: product.id,
        quantity: product.quantity,
      })),
      orderWorth: order.total,
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).send('Error fetching orders');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
