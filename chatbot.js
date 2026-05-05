// OpenAI Chatbot Widget
class FarmTeensChatbot {
  constructor() {
    this.apiKey = ''; // You'll need to set this via environment variable
    this.conversationHistory = [];
    this.isOpen = false;
    this.isLoading = false;
    this.init();
  }

  init() {
    this.createChatbotHTML();
    this.attachEventListeners();
    this.loadConversationHistory();
  }

  createChatbotHTML() {
    const chatbotHTML = `
      <div id="chatbot-widget" class="chatbot-widget">
        <div class="chatbot-header">
          <h3>Farm Teens Assistant</h3>
          <button id="chatbot-minimize" class="chatbot-btn" aria-label="Minimize chat">−</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chatbot-message bot-message">
            <p>Hello! 👋 I'm the Farm Teens Uganda Assistant. How can I help you today? Ask me about our programs, how to get involved, or anything about sustainable agriculture!</p>
          </div>
        </div>
        <div class="chatbot-input-area">
          <input 
            type="text" 
            id="chatbot-input" 
            class="chatbot-input" 
            placeholder="Type your question..." 
            autocomplete="off"
          >
          <button id="chatbot-send" class="chatbot-send-btn" aria-label="Send message">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open chat">
        <i class="fas fa-comments"></i>
        <span class="chatbot-badge">New</span>
      </button>
    `;

    // Append to body
    const div = document.createElement('div');
    div.innerHTML = chatbotHTML;
    document.body.appendChild(div.firstElementChild);
    document.body.appendChild(div.firstElementChild);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const minimizeBtn = document.getElementById('chatbot-minimize');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const widget = document.getElementById('chatbot-widget');

    toggleBtn.addEventListener('click', () => this.toggleChat());
    minimizeBtn.addEventListener('click', () => this.toggleChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Remove badge on first interaction
    input.addEventListener('focus', () => {
      const badge = document.querySelector('.chatbot-badge');
      if (badge) badge.remove();
    });
  }

  toggleChat() {
    const widget = document.getElementById('chatbot-widget');
    const toggle = document.getElementById('chatbot-toggle');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      widget.classList.add('active');
      toggle.classList.add('hidden');
      document.getElementById('chatbot-input').focus();
    } else {
      widget.classList.remove('active');
      toggle.classList.remove('hidden');
    }
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    if (this.isLoading) return;

    // Add user message to UI
    this.addMessageToUI(message, 'user');
    input.value = '';
    input.focus();

    this.isLoading = true;
    
    try {
      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // Call OpenAI API (via your backend)
      const response = await this.getAIResponse(message);
      
      // Add bot response to UI
      this.addMessageToUI(response, 'bot');
      
      // Add to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Save conversation
      this.saveConversationHistory();
    } catch (error) {
      console.error('Chatbot error:', error);
      this.addMessageToUI(
        'Sorry, I encountered an error. Please try again or contact us at farmteensugandalimited@gmail.com',
        'bot',
        true
      );
    } finally {
      this.isLoading = false;
    }
  }

  async getAIResponse(userMessage) {
    try {
      // For now, return context-aware responses without API key exposure
      // In production, call your backend endpoint instead
      
      const contextResponses = this.getContextualResponse(userMessage);
      if (contextResponses) return contextResponses;

      // If no context match, try to call backend API endpoint
      // This assumes you have a backend endpoint at /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: this.conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      return data.reply || 'Thank you for your question. Please contact us for more information.';
    } catch (error) {
      console.error('Error getting AI response:', error);
      return 'I apologize for the technical difficulty. Our team would be happy to help! Contact us at farmteensugandalimited@gmail.com or call +256 756 981336.';
    }
  }

  getContextualResponse(message) {
    const msg = message.toLowerCase().trim();
    
    // Greeting responses
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy'];
    if (greetings.some(greeting => msg.includes(greeting))) {
      const greetingResponses = [
        'Hello! 👋 Welcome to Farm Teens Uganda. How can I assist you today?',
        'Hi there! 👋 Great to have you here. What would you like to know about our programs?',
        'Hey! Welcome! 🌱 Feel free to ask me anything about our mission and programs.',
        'Greetings! 🌾 I\'m here to help. What can I do for you?'
      ];
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }

    // Thanks/appreciation responses
    const thankYouWords = ['thank', 'thanks', 'appreciate', 'thank you', 'grateful'];
    if (thankYouWords.some(word => msg.includes(word))) {
      const thankResponses = [
        'You\'re welcome! 😊 Is there anything else I can help you with?',
        'My pleasure! Feel free to reach out anytime. 🌱',
        'Happy to help! Do you have any other questions?'
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }

    // FAQ-style responses with better keyword matching
    const responses = {
      'program|training|course|learn|education|skill': 'We offer 4 main programs designed for youth aged 13-25:\n\n1. **Smart Agribusiness** - Modern farming technologies & business management\n2. **Climate-Smart Farming** - Sustainable methods & weather adaptation\n3. **Value Addition Labs** - Food processing & product branding\n4. **Youth Agripreneurship** - Startup funding & market connections\n\nEach program includes hands-on field training, mentorship, and funding opportunities. Which one interests you?',
      
      'age|eligible|eligibility|requirement|who|qualify': 'Our programs are open to **youth aged 13-25 years old**. We welcome all young people passionate about sustainable agriculture and ready to transform their futures!\n\n✅ No prior experience needed\n✅ We provide all training\n✅ Funding opportunities available\n\nReady to apply? Visit our Programs page or let me know if you have more questions!',
      
      'donate|donation|fund|support|sponsor|contribute|give': 'Thank you for wanting to support us! 🙏 You can donate through:\n\n💚 **One-time donations** - Support specific programs\n💚 **Monthly giving** - Recurring support\n💚 **Program sponsorship** - Fund a youth\'s training\n💚 **Equipment funding** - Support farming tools\n\nEvery contribution directly helps train youth and change lives. Visit our Donate page to contribute, or contact: farmteensugandalimiited@gmail.com',
      
      'volunteer|help|join team|work with|participate': 'We\'d love to have you volunteer! 🤝 Available opportunities:\n\n📋 **Technical Training** - Share your expertise\n📋 **Event Support** - Help at our programs\n📋 **Marketing** - Content creation & social media\n📋 **Administration** - Logistics & coordination\n\nContact us at farmteensugandalimiited@gmail.com to discuss how you can contribute!',
      
      'partner|partnership|collaborate|business|corporate': 'We welcome strategic partnerships! 🤝 We offer:\n\n🌱 Corporate sponsorships\n🌱 Technical expertise sharing\n🌱 Market access & linkages\n🌱 Research collaborations\n🌱 Co-training initiatives\n\nLet\'s create lasting change together! Contact: farmteensugandalimiited@gmail.com or call +256 756 981336',
      
      'contact|reach|email|phone|address|location|where': 'Here\'s how to reach us:\n\n📍 **Location:** Kayunga Wakiso, Uganda\n📞 **Phone:** +256 756 981336\n📧 **General Email:** farmteensugandalimiited@gmail.com\n📧 **Programs:** semujjubrian@farmteensuganda.org\n\n⏱️ We typically respond within 24 hours!\n\nFeeling like chatting? Our team is here to help! 😊',
      
      'success|story|result|achievement|alumni|graduate|impact': 'Our graduates have achieved amazing things! 🌟\n\n✨ Started their own farming businesses\n✨ Created jobs in their communities\n✨ Increased yields by 40%+ through climate-smart techniques\n✨ Built profitable value-addition enterprises\n✨ Now mentoring other youth\n\nVisit our **Blog** page to read inspiring impact stories from our program alumni!',
      
      'climate|sustainable|environment|green|eco|carbon': 'Climate action is at our core! 🌍 Our approach:\n\n🌱 **Climate-smart farming techniques** - Adapt to weather changes\n🌱 **Soil conservation** - Protect our land\n🌱 **Water management** - Use resources wisely\n🌱 **Renewable energy** - Solar & biogas solutions\n🌱 **Biodiversity** - Protect ecosystems\n\nWe believe profitable agriculture and environmental stewardship go hand-in-hand!',
      
      'cost|price|fee|expensive|affordable|free': 'Our programs are designed to be **accessible to all youth**! 💚\n\n💰 Pricing varies by program and location\n💰 Scholarship opportunities available\n💰 Flexible payment options\n💰 Some programs include seed funding\n\nContact us for specific pricing: farmteensugandalimiited@gmail.com\nWe can discuss options that work for you!',
      
      'how|get started|apply|application|join|enroll|register': 'Ready to transform your future? 🚀 Here\'s how to get started:\n\n1️⃣ **Explore Programs** - Visit our Programs page\n2️⃣ **Choose Your Path** - Pick a program that interests you\n3️⃣ **Contact Us** - Email or call to apply\n4️⃣ **Meet Our Team** - Discuss your goals\n5️⃣ **Get Training** - Start your agricultural journey!\n\n📞 Call: +256 756 981336\n📧 Email: farmteensugandalimiited@gmail.com',
      
      'mission|vision|about|who|we|organization|purpose': 'We are **Farm Teens Uganda** - empowering young people through climate-smart agriculture! 🌾\n\n🎯 **Our Mission:**\nTransform Ugandan youth into skilled, profitable farmers who drive sustainable change\n\n💚 **What We Do:**\n• Train 13-25 year-olds in modern farming\n• Provide mentorship & funding\n• Build market connections\n• Create agricultural entrepreneurs\n\nVisit our **About** page to learn our full story!',
      
      'funding|money|financial|capital|grant|loan|support': 'We provide financial support for youth! 💚\n\n💰 **Seed funding** - Start your farm\n💰 **Training grants** - Free or subsidized programs\n💰 **Business loans** - Access to microfinance\n💰 **Sponsorships** - Full program coverage available\n💰 **Equipment support** - Tools & seeds provided\n\nOur goal is removing financial barriers to agricultural success!',
      
      'mentor|guidance|coach|help|support|advice': 'Mentorship is core to our program! 👨‍🌾\n\n🤝 Each participant gets:\n✅ Experienced mentor assigned\n✅ Business coaching\n✅ Technical guidance\n✅ Industry connections\n✅ Ongoing support after graduation\n\nWant to become a mentor? We\'re always recruiting! Contact us to learn more.',
      
      'market|sell|buyer|customer|business|export': 'We connect you to markets! 🌍\n\n🛒 Our support includes:\n✓ Market linkage training\n✓ Buyer connections\n✓ Export opportunities\n✓ Branding assistance\n✓ Cooperative partnerships\n✓ Direct buyer access\n\nYour agricultural products deserve the best market! Let\'s connect you.',
      
      'technology|tech|innovation|digital|app|modern|smart': 'Technology is transforming agriculture! 💡\n\n🔧 We teach:\n✓ Precision farming techniques\n✓ Climate-smart practices\n✓ Data-driven farming\n✓ Mobile agri-apps\n✓ Sustainable technologies\n✓ Value-addition equipment\n\nJoin us in bringing agriculture into the digital age!',
      
      'community|local|region|area|uganda': '🇺🇬 We\'re proudly serving Uganda!\n\n🌍 Operating in 12+ communities across:\n• Kayunga & Wakiso regions\n• Multiple agricultural zones\n• Rural & semi-urban areas\n\n🤝 We work with:\n✓ Local farmers\n✓ Community organizations\n✓ Government partners\n✓ International NGOs\n\nReady to join our community of change-makers?'
    };

    // Check for keyword matches
    for (const [keywords, response] of Object.entries(responses)) {
      const keywordArray = keywords.split('|');
      if (keywordArray.some(keyword => msg.includes(keyword))) {
        return response;
      }
    }

    // Default helpful response
    return 'Great question! 🤔 I may not have the specific answer, but our team definitely does!\n\n📞 Call us: +256 756 981336\n📧 Email: farmteensugandalimiited@gmail.com\n\nOr visit our:\n✓ Programs page - for training info\n✓ About page - for our story\n✓ Get Involved page - for ways to support\n\nOur team responds within 24 hours. How else can I help?';
  }

  addMessageToUI(message, sender, isError = false) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    const messageClass = isError ? 'bot-message error' : `${sender}-message`;
    
    messageDiv.className = `chatbot-message ${messageClass}`;
    messageDiv.innerHTML = `<p>${this.escapeHTML(message)}</p>`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add loading indicator
    if (sender === 'bot' && !isError) {
      this.removeLoadingIndicator();
    }

    // Add loading indicator for bot
    if (sender === 'user') {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'chatbot-message bot-message loading';
      loadingDiv.id = 'loading-indicator';
      loadingDiv.innerHTML = '<p><span></span><span></span><span></span></p>';
      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  removeLoadingIndicator() {
    const loading = document.getElementById('loading-indicator');
    if (loading) loading.remove();
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveConversationHistory() {
    try {
      localStorage.setItem('farmteens_chat_history', JSON.stringify(this.conversationHistory));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }

  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('farmteens_chat_history');
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load chat history:', e);
    }
  }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FarmTeensChatbot();
  });
} else {
  new FarmTeensChatbot();
}
