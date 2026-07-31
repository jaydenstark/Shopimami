export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    const systemPrompt = `You are the official customer support assistant for SHOPIMAMI (https://shopimami.com), a premium on-demand mall shopping and delivery platform in Ghana. 
Your goal is to assist customers with their orders, deliveries, and general questions about the platform in a professional, polite, and helpful tone.

Key information about SHOPIMAMI:
- **Supported Malls**: Accra Mall, West Hills Mall, and A&C Mall.
- **Supported Stores**: Shoprite, Melcom, Game, and Palace Store.
- **Payment Method**: Secure upfront Mobile Money (MoMo) payments. We support MTN MoMo, Telecel Cash, and AirtelTigo Money.
- **How it Works**: 
  1. The customer places an order from their preferred mall/store.
  2. The customer authorizes the Mobile Money payment via a secure prompt.
  3. Once paid, a dedicated SHOPIMAMI Shopper (picker) receives the checklist and picks the items in-person at the mall.
  4. The Shopper hands off the packaged items to a SHOPIMAMI Dispatch Rider.
  5. The Rider delivers the package directly to the customer's location.
- **Delivery Time**: Deliveries usually take 30-60 minutes depending on the location, mall prep times, and traffic conditions.
- **Order Tracking**: Customers can check the "Track" tab in their app to see real-time updates on their order lifecycle (e.g., payment confirmed, shopper assigned, out for delivery, and delivered).

Keep your answers concise, clear, and tailored to the context. Avoid mentioning internal technical implementation details.`;

    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      console.warn("Grok API key is missing. Using local rule-based customer support simulator.");
      return Response.json({ message: getMockResponse(messages) });
    }

    // Call Grok xAI API
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content;
    
    return Response.json({ message: botMessage });

  } catch (error) {
    console.error("Support chat error:", error);
    // Return mock response as safe fallback
    try {
      const { messages } = await request.clone().json();
      return Response.json({ 
        message: getMockResponse(messages),
        warning: "Running in offline fallback mode."
      });
    } catch {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
}

// Local rules-based customer support helper
function getMockResponse(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) {
    return "Hello! Welcome to SHOPIMAMI support. How can I help you today?";
  }

  const query = userMessages[userMessages.length - 1].content.toLowerCase();

  if (query.includes("mall") || query.includes("where") || query.includes("location")) {
    return "SHOPIMAMI currently supports Accra Mall, West Hills Mall, and A&C Mall. We buy your items in-person from stores like Shoprite, Melcom, Game, and Palace Store and deliver them to your doorstep.";
  }

  if (query.includes("pay") || query.includes("payment") || query.includes("momo") || query.includes("money") || query.includes("wallet")) {
    return "We support secure, upfront Mobile Money (MoMo) payments. You can pay using MTN MoMo, Telecel Cash, or AirtelTigo Money directly in the app during checkout.";
  }

  if (query.includes("deliver") || query.includes("delivery") || query.includes("time") || query.includes("how long") || query.includes("rider")) {
    return "Our dispatch riders aim to deliver your package within 30 to 60 minutes. Delivery times can vary slightly depending on mall preparation times, your distance from the mall, and traffic.";
  }

  if (query.includes("how") && (query.includes("work") || query.includes("process"))) {
    return "It's simple: browse items in the app, checkout with Mobile Money, and our in-mall Shoppers will pick your items and hand them off to a Dispatch Rider for direct delivery. You can track this in real-time under the 'Track' tab!";
  }

  if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
    return "Hello! I am your SHOPIMAMI customer support assistant. Ask me anything about our malls, stores, delivery times, or payment methods!";
  }

  if (query.includes("thank") || query.includes("thanks")) {
    return "You're very welcome! If you need anything else, just ask.";
  }

  return "Thank you for reaching out. I'm currently running in Demo Mode, but I can help you with general questions about SHOPIMAMI! We support Accra Mall, West Hills Mall, and A&C Mall, with secure MoMo checkout and 30-60 minute delivery.";
}
